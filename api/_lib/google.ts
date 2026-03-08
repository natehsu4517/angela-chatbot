import { google } from 'googleapis'

let _calendar: ReturnType<typeof google.calendar> | null = null

export function getCalendar() {
  if (_calendar) return _calendar

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON env var not set')

  const creds = JSON.parse(raw)

  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })

  _calendar = google.calendar({ version: 'v3', auth })
  return _calendar
}

export function getCalendarId() {
  const id = process.env.GOOGLE_CALENDAR_ID
  if (!id) throw new Error('GOOGLE_CALENDAR_ID env var not set')
  return id
}
