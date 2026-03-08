export interface Message {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: number
  quickReplies?: string[]
  quickReplyContext?: string
  messageType?: 'text' | 'insight'
}

export interface LeadProfile {
  name: string | null
  email: string | null
  company: string | null
  budget: string | null
  timeline: string | null
  companySize: string | null
  painPoints: string[]
}

export interface LeadScore {
  total: number // 0-100
  breakdown: {
    budget: number
    timeline: number
    companySize: number
    painPoints: number
  }
}

export type ConversationStage =
  | 'greeting'
  | 'qualifying'
  | 'booking'
  | 'booked'
  | 'nurture'

export interface ChatResponse {
  message: string
  quickReplies?: string[]
  quickReplyContext?: string
  leadData: Partial<LeadProfile>
  score: LeadScore
  stage: ConversationStage
  shouldBook: boolean
  sentiment?: number // -1 to 1
  messageType?: 'text' | 'insight'
  insightCard?: string // Separate insight summary shown before the main message
  progress?: { current: number; total: number }
}

export interface SentimentPoint {
  messageIndex: number
  value: number // -1 to 1
  label: string // e.g. "positive", "neutral", "cautious"
}

export interface EnrichmentData {
  industry: string
  founded: string
  website: string
  headcount: string
}

export interface TimeSlot {
  start: string
  end: string
}

export interface BookingResult {
  success: boolean
  meetLink: string | null
  eventTime: string
  eventDate: string
}
