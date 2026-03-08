import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getCalendar, getCalendarId } from './_lib/google.js'
import { randomUUID } from 'crypto'

const TZ = 'America/New_York'
const BIZ_START = 9
const BIZ_END = 17
const SLOT_MINUTES = 30

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { date, startTime, name, email, leadData } = req.body || {}

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date' })
  }
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    return res.status(400).json({ error: 'Invalid time' })
  }
  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return res.status(400).json({ error: 'Name is required' })
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' })
  }

  const [hour, minute] = startTime.split(':').map(Number)
  if (hour < BIZ_START || hour >= BIZ_END) {
    return res.status(400).json({ error: 'Time outside business hours' })
  }

  const dateObj = new Date(date + 'T12:00:00')
  const day = dateObj.getUTCDay()
  if (day === 0 || day === 6) {
    return res.status(400).json({ error: 'Weekends not available' })
  }

  try {
    const calendar = getCalendar()
    const calendarId = getCalendarId()

    let endHour = hour
    let endMinute = minute + SLOT_MINUTES
    if (endMinute >= 60) {
      endHour += 1
      endMinute = endMinute % 60
    }

    const startDateTime = `${date}T${startTime}:00`
    const endDateTime = `${date}T${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}:00`

    // Double-check slot is free
    const freeBusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(`${startDateTime}-05:00`).toISOString(),
        timeMax: new Date(`${endDateTime}-05:00`).toISOString(),
        timeZone: TZ,
        items: [{ id: calendarId }],
      },
    })

    const busyPeriods = freeBusy.data.calendars?.[calendarId]?.busy || []
    if (busyPeriods.length > 0) {
      return res.status(409).json({ error: 'This slot is no longer available' })
    }

    // Build description with lead data
    let description = `Discovery call booked via AI Lead Agent.\n\nName: ${name.trim()}\nEmail: ${email.trim()}`
    if (leadData) {
      if (leadData.company) description += `\nCompany: ${leadData.company}`
      if (leadData.budget) description += `\nBudget: ${leadData.budget}`
      if (leadData.timeline) description += `\nTimeline: ${leadData.timeline}`
      if (leadData.companySize) description += `\nCompany Size: ${leadData.companySize}`
      if (leadData.painPoints?.length) description += `\nPain Points: ${leadData.painPoints.join(', ')}`
    }

    const event = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1,
      requestBody: {
        summary: `Discovery Call — ${name.trim()}`,
        description,
        start: { dateTime: startDateTime, timeZone: TZ },
        end: { dateTime: endDateTime, timeZone: TZ },
        attendees: [{ email: email.trim() }],
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 30 },
            { method: 'popup', minutes: 10 },
          ],
        },
      },
    })

    const meetLink = event.data.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri || event.data.hangoutLink || null

    return res.json({
      success: true,
      meetLink,
      eventTime: `${startTime} ET`,
      eventDate: date,
    })
  } catch (err: any) {
    console.error('Booking error:', err)
    return res.status(500).json({ error: 'Failed to create booking' })
  }
}
