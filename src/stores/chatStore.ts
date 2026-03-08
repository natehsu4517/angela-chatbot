import { create } from 'zustand'
import type { Message, LeadProfile, LeadScore, ConversationStage, SentimentPoint, EnrichmentData } from '../utils/types'

interface ChatState {
  messages: Message[]
  leadProfile: LeadProfile
  score: LeadScore
  stage: ConversationStage
  isOpen: boolean
  isTyping: boolean
  sentimentHistory: SentimentPoint[]
  enrichment: EnrichmentData | null
  enrichmentLoading: boolean
  conversationStartTime: number | null
  qualificationProgress: { current: number; total: number }

  // Actions
  addMessage: (msg: Message) => void
  updateLeadProfile: (data: Partial<LeadProfile>) => void
  setScore: (score: LeadScore) => void
  setStage: (stage: ConversationStage) => void
  setOpen: (open: boolean) => void
  setTyping: (typing: boolean) => void
  addSentiment: (point: SentimentPoint) => void
  setEnrichment: (data: EnrichmentData | null) => void
  setEnrichmentLoading: (loading: boolean) => void
  setConversationStartTime: (time: number) => void
  setProgress: (progress: { current: number; total: number }) => void
  reset: () => void
}

const initialProfile: LeadProfile = {
  name: null,
  email: null,
  company: null,
  budget: null,
  timeline: null,
  companySize: null,
  painPoints: [],
}

const initialScore: LeadScore = {
  total: 0,
  breakdown: { budget: 0, timeline: 0, companySize: 0, painPoints: 0 },
}

const GREETING_MESSAGE: Message = {
  id: 'greeting',
  role: 'agent',
  content: "Hey! I'm Angela, Nate's assistant. I help match visitors with the right solutions based on what Nate's built before. What brings you here today?",
  timestamp: Date.now(),
  quickReplies: ['Data is a mess', 'Need a dashboard', 'Need leads', 'Need a website'],
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [GREETING_MESSAGE],
  leadProfile: { ...initialProfile },
  score: { ...initialScore },
  stage: 'greeting',
  isOpen: false,
  isTyping: false,
  sentimentHistory: [],
  enrichment: null,
  enrichmentLoading: false,
  conversationStartTime: null,
  qualificationProgress: { current: 0, total: 6 },

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  updateLeadProfile: (data) =>
    set((state) => ({
      leadProfile: {
        ...state.leadProfile,
        ...data,
        painPoints: data.painPoints
          ? [...new Set([...state.leadProfile.painPoints, ...data.painPoints])]
          : state.leadProfile.painPoints,
      },
    })),

  setScore: (score) => set({ score }),
  setStage: (stage) => set({ stage }),
  setOpen: (open) => set({ isOpen: open }),
  setTyping: (typing) => set({ isTyping: typing }),

  addSentiment: (point) =>
    set((state) => ({ sentimentHistory: [...state.sentimentHistory, point] })),

  setEnrichment: (data) => set({ enrichment: data }),
  setEnrichmentLoading: (loading) => set({ enrichmentLoading: loading }),
  setConversationStartTime: (time) => set({ conversationStartTime: time }),
  setProgress: (progress) => set({ qualificationProgress: progress }),

  reset: () =>
    set({
      messages: [GREETING_MESSAGE],
      leadProfile: { ...initialProfile },
      score: { ...initialScore },
      stage: 'greeting',
      isTyping: false,
      sentimentHistory: [],
      enrichment: null,
      enrichmentLoading: false,
      conversationStartTime: null,
      qualificationProgress: { current: 0, total: 6 },
    }),
}))
