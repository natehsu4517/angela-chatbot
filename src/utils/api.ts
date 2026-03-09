import type { ChatResponse, StreamMetadata, TimeSlot, BookingResult, Message, PageContext } from './types'
import { mockSendMessage, mockSendMessageStream, mockGetAvailability, mockBookMeeting } from './mockApi'

const BASE = import.meta.env.VITE_API_URL || ''
const USE_MOCK = import.meta.env.DEV && !import.meta.env.VITE_API_URL

// Session-level fallback: if real API fails, use mock for the rest of the session.
// Protects the portfolio demo during traffic spikes / API key issues.
let fallbackToMock = false

function shouldUseMock(): boolean {
  return USE_MOCK || fallbackToMock
}

export async function sendMessage(
  messages: Pick<Message, 'role' | 'content'>[],
  userMessage: string,
  pageContext?: PageContext
): Promise<ChatResponse> {
  if (shouldUseMock()) return mockSendMessage(messages, userMessage)

  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userMessage, pageContext }),
  })
  if (!res.ok) throw new Error('Chat request failed')
  return res.json()
}

export function sendMessageStream(
  messages: Pick<Message, 'role' | 'content'>[],
  userMessage: string,
  onToken: (text: string) => void,
  onDone: (metadata: StreamMetadata) => void,
  onError: (error: Error) => void,
  pageContext?: PageContext
): AbortController {
  if (shouldUseMock()) return mockSendMessageStream(messages, userMessage, onToken, onDone, onError)

  const controller = new AbortController()

  fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, userMessage, pageContext }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.ok) throw new Error('Chat request failed')
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let sseBuffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        sseBuffer += decoder.decode(value, { stream: true })

        const lines = sseBuffer.split('\n')
        sseBuffer = lines.pop() || ''

        let eventType = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)
              if (eventType === 'token') {
                onToken(parsed.text)
              } else if (eventType === 'done') {
                onDone(parsed as StreamMetadata)
              } else if (eventType === 'error') {
                onError(new Error(parsed.error || 'Stream error'))
              }
            } catch {
              // Skip malformed JSON
            }
            eventType = ''
          }
        }
      }
    })
    .catch((err) => {
      if (err.name === 'AbortError') return

      // Flip to mock for the rest of this session, then retry transparently
      console.warn('[Angela] API failed, falling back to demo mode:', err.message)
      fallbackToMock = true

      const mockController = mockSendMessageStream(messages, userMessage, onToken, onDone, onError)
      // Wire original abort signal to mock stream
      controller.signal.addEventListener('abort', () => mockController.abort())
    })

  return controller
}

export async function getAvailability(date: string): Promise<TimeSlot[]> {
  if (shouldUseMock()) return mockGetAvailability(date)

  try {
    const res = await fetch(`${BASE}/api/availability?date=${date}`)
    if (!res.ok) throw new Error('Availability request failed')
    const data = await res.json()
    return data.slots
  } catch {
    fallbackToMock = true
    return mockGetAvailability(date)
  }
}

export async function bookMeeting(
  date: string,
  startTime: string,
  name: string,
  email: string,
  leadData?: Record<string, unknown>
): Promise<BookingResult> {
  if (shouldUseMock()) return mockBookMeeting(date, startTime, name, email)

  try {
    const res = await fetch(`${BASE}/api/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, startTime, name, email, leadData }),
    })
    if (!res.ok) throw new Error('Booking request failed')
    return res.json()
  } catch {
    fallbackToMock = true
    return mockBookMeeting(date, startTime, name, email)
  }
}
