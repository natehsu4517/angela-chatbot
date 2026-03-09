export type AvatarExpression = 'neutral' | 'thinking' | 'happy' | 'concerned'

export interface Message {
  id: string
  role: 'agent' | 'user'
  content: string
  timestamp: number
  quickReplies?: string[]
  quickReplyContext?: string
  messageType?: 'text' | 'insight' | 'summary-card'
  isStreaming?: boolean
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

export interface StreamMetadata {
  quickReplies?: string[]
  quickReplyContext?: string
  leadData: Partial<LeadProfile>
  shouldBook: boolean
  sentiment?: number
  insightSummary?: string
  score: LeadScore
  stage: ConversationStage
  progress: { current: number; total: number }
}

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
  insightCard?: string
  progress?: { current: number; total: number }
}

export interface SentimentPoint {
  messageIndex: number
  value: number // -1 to 1
  label: string
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

export interface PageContext {
  url?: string
  section?: string
  projectViewing?: string
}

export interface BookingResult {
  success: boolean
  meetLink: string | null
  eventTime: string
  eventDate: string
}

// Admin Panel types
export interface DemoLead {
  id: string
  name: string
  email: string
  company: string
  budget: string
  timeline: string
  companySize: string
  painPoints: string[]
  score: LeadScore
  stage: ConversationStage
  createdAt: number
  timeToQualify: number
  messageCount: number
  conversation: { role: 'agent' | 'user'; content: string }[]
}

export interface Activity {
  id: string
  type: 'new_lead' | 'qualified' | 'booked'
  leadName: string
  leadId: string
  description: string
  timestamp: number
  score?: number
}

export type AdminTab = 'overview' | 'leads' | 'activity'
