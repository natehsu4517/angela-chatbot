import type { ChatResponse, TimeSlot, BookingResult, Message } from './types'
import { mockSendMessage, mockGetAvailability, mockBookMeeting } from './mockApi'

const BASE = import.meta.env.VITE_API_URL || ''
const USE_MOCK = import.meta.env.DEV && !import.meta.env.VITE_API_URL

export async function sendMessage(
  messages: Pick<Message, 'role' | 'content'>[],
  userMessage: string
): Promise<ChatResponse> {
  // In dev, try the real API first (served by Vite plugin proxy)
  // Falls back to mock if the proxy isn't available
  try {
    const res = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, userMessage }),
    })
    if (!res.ok) throw new Error('Chat request failed')
    return res.json()
  } catch {
    if (USE_MOCK) return mockSendMessage(messages, userMessage)
    throw new Error('Chat request failed')
  }
}

export async function getAvailability(date: string): Promise<TimeSlot[]> {
  if (USE_MOCK) return mockGetAvailability(date)

  const res = await fetch(`${BASE}/api/availability?date=${date}`)
  if (!res.ok) throw new Error('Availability request failed')
  const data = await res.json()
  return data.slots
}

export async function bookMeeting(
  date: string,
  startTime: string,
  name: string,
  email: string,
  leadData?: Record<string, unknown>
): Promise<BookingResult> {
  if (USE_MOCK) return mockBookMeeting(date, startTime, name, email)

  const res = await fetch(`${BASE}/api/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, startTime, name, email, leadData }),
  })
  if (!res.ok) throw new Error('Booking request failed')
  return res.json()
}
