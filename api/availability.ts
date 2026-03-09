import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getCalendar, getCalendarId } from './_lib/google.js'

const BIZ_START = 9
const BIZ_END = 17
const SLOT_MINUTES = 30
const TZ = 'America/New_York'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { date } = req.query
  if (!date || typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date. Use YYYY-MM-DD format.' })
  }

  const dateObj = new Date(date + 'T12:00:00')
  const day = dateObj.getUTCDay()
  if (day === 0 || day === 6) {
    return res.json({ slots: [] })
  }

  const nowET = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }))
  const dateCheck = new Date(date + 'T23:59:59')
  if (dateCheck < new Date(nowET.toISOString().split('T')[0] + 'T00:00:00')) {
    return res.json({ slots: [] })
  }

  try {
    const calendar = getCalendar()
    const calendarId = getCalendarId()

    const startUTC = etToUTC(date, BIZ_START, 0)
    const endUTC = etToUTC(date, BIZ_END, 0)

    const freeBusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: startUTC,
        timeMax: endUTC,
        timeZone: TZ,
        items: [{ id: calendarId }],
      },
    })

    const busyPeriods = freeBusy.data.calendars?.[calendarId]?.busy || []
    const slots: { start: string; end: string }[] = []
    let hour = BIZ_START
    let minute = 0

    while (hour < BIZ_END) {
      const endMinute = minute + SLOT_MINUTES
      const endHour = hour + Math.floor(endMinute / 60)
      const endMin = endMinute % 60

      if (endHour > BIZ_END) break

      const slotStart = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      const slotEnd = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`

      const today = nowET.toISOString().split('T')[0]
      if (date === today) {
        const nowHour = nowET.getHours()
        const nowMin = nowET.getMinutes()
        if (hour < nowHour || (hour === nowHour && minute <= nowMin)) {
          minute += SLOT_MINUTES
          if (minute >= 60) { hour += 1; minute = minute % 60 }
          continue
        }
      }

      const slotStartUTC = etToUTC(date, hour, minute)
      const slotEndUTC = etToUTC(date, endHour, endMin)
      const isBusy = busyPeriods.some((busy) => {
        const busyStart = new Date(busy.start!).getTime()
        const busyEnd = new Date(busy.end!).getTime()
        const sStart = new Date(slotStartUTC).getTime()
        const sEnd = new Date(slotEndUTC).getTime()
        return sStart < busyEnd && sEnd > busyStart
      })

      if (!isBusy) {
        slots.push({ start: slotStart, end: slotEnd })
      }

      minute += SLOT_MINUTES
      if (minute >= 60) { hour += 1; minute = minute % 60 }
    }

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')
    return res.json({ slots })
  } catch (err: any) {
    console.error('Availability error:', err)
    return res.status(500).json({ error: 'Failed to fetch availability' })
  }
}

function etToUTC(date: string, hour: number, minute: number): string {
  const targetDate = new Date(`${date}T12:00:00Z`)
  const offset = getETOffset(targetDate)
  const utcHour = hour + offset
  const utcDate = new Date(`${date}T${String(utcHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00Z`)
  return utcDate.toISOString()
}

function getETOffset(date: Date): number {
  const utcParts = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: 'numeric', hour12: false }).formatToParts(date)
  const etParts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hour12: false }).formatToParts(date)
  const utcHour = parseInt(utcParts.find((p) => p.type === 'hour')?.value || '0')
  const etHour = parseInt(etParts.find((p) => p.type === 'hour')?.value || '0')
  return utcHour - etHour
}
