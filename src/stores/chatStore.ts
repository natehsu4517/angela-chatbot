import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message, LeadProfile, LeadScore, ConversationStage, SentimentPoint, EnrichmentData, AvatarExpression } from '../utils/types'

interface ChatState {
  messages: Message[]
  leadProfile: LeadProfile
  score: LeadScore
  stage: ConversationStage
  isOpen: boolean
  isTyping: boolean
  expression: AvatarExpression
  sentimentHistory: SentimentPoint[]
  enrichment: EnrichmentData | null
  enrichmentLoading: boolean
  conversationStartTime: number | null
  qualificationProgress: { current: number; total: number }

  // Actions
  addMessage: (msg: Message) => void
  updateMessageContent: (id: string, content: string) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  updateLeadProfile: (data: Partial<LeadProfile>) => void
  setScore: (score: LeadScore) => void
  setStage: (stage: ConversationStage) => void
  setOpen: (open: boolean) => void
  setTyping: (typing: boolean) => void
  setExpression: (expr: AvatarExpression) => void
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

const DEFAULT_GREETING: Message = {
  id: 'greeting',
  role: 'agent',
  content: "Hey! I'm Angela, Nate's assistant. Let's see what kind of problem we can help you solve with your business!",
  timestamp: Date.now(),
  quickReplies: ['Data is a mess', 'Need a dashboard', 'Need leads', 'Need a website'],
}

function buildReturnGreeting(leadProfile: LeadProfile, stage: ConversationStage): Message {
  const name = leadProfile.name
  const painPoint = leadProfile.painPoints.length > 0 ? leadProfile.painPoints[0] : null

  let content: string
  let quickReplies: string[]

  if (stage === 'booked') {
    content = name
      ? `Hey ${name}! You've already got a call booked. Need anything else?`
      : "Welcome back! You've got a call booked. Need anything else?"
    quickReplies = ['Just browsing', 'Have a new question', 'Start fresh']
  } else if (name && painPoint) {
    content = `Hey ${name}! Welcome back. Still thinking about that ${painPoint} challenge?`
    quickReplies = ['Pick up where we left off', 'Start fresh', 'Book a call']
  } else if (name) {
    content = `Hey ${name}! Good to see you again. How can I help?`
    quickReplies = ['Pick up where we left off', 'Start fresh', 'Book a call']
  } else if (painPoint) {
    content = `Welcome back! We were chatting about ${painPoint} last time. Want to continue?`
    quickReplies = ['Pick up where we left off', 'Start fresh', 'Book a call']
  } else {
    content = "Welcome back! Want to pick up where we left off?"
    quickReplies = ['Continue', 'Start fresh', 'Book a call']
  }

  return {
    id: 'greeting',
    role: 'agent',
    content,
    timestamp: Date.now(),
    quickReplies,
  }
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [DEFAULT_GREETING],
      leadProfile: { ...initialProfile },
      score: { ...initialScore },
      stage: 'greeting',
      isOpen: false,
      isTyping: false,
      expression: 'neutral',
      sentimentHistory: [],
      enrichment: null,
      enrichmentLoading: false,
      conversationStartTime: null,
      qualificationProgress: { current: 0, total: 6 },

      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      updateMessageContent: (id, content) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, content } : m
          ),
        })),

      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

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
      setExpression: (expr) => set({ expression: expr }),

      addSentiment: (point) =>
        set((state) => ({ sentimentHistory: [...state.sentimentHistory, point] })),

      setEnrichment: (data) => set({ enrichment: data }),
      setEnrichmentLoading: (loading) => set({ enrichmentLoading: loading }),
      setConversationStartTime: (time) => set({ conversationStartTime: time }),
      setProgress: (progress) => set({ qualificationProgress: progress }),

      reset: () =>
        set({
          messages: [{ ...DEFAULT_GREETING, timestamp: Date.now() }],
          leadProfile: { ...initialProfile },
          score: { ...initialScore },
          stage: 'greeting',
          isTyping: false,
          expression: 'neutral',
          sentimentHistory: [],
          enrichment: null,
          enrichmentLoading: false,
          conversationStartTime: null,
          qualificationProgress: { current: 0, total: 6 },
        }),
    }),
    {
      name: 'angela-chat',
      version: 2,
      storage: {
        getItem: (name: string) => {
          const str = localStorage.getItem(name)
          return str ? JSON.parse(str) : null
        },
        setItem: (() => {
          let timer: ReturnType<typeof setTimeout> | null = null
          return (name: string, value: unknown) => {
            // Debounce writes to avoid 60fps localStorage jank during streaming
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
              localStorage.setItem(name, JSON.stringify(value))
              timer = null
            }, 300)
          }
        })(),
        removeItem: (name: string) => localStorage.removeItem(name),
      },
      partialize: (state) => ({
        messages: state.messages.filter((m) => !m.isStreaming),
        leadProfile: state.leadProfile,
        score: state.score,
        stage: state.stage,
        sentimentHistory: state.sentimentHistory,
        qualificationProgress: state.qualificationProgress,
        conversationStartTime: state.conversationStartTime,
      }),
      onRehydrateStorage: () => {
        return (state) => {
          if (!state) return
          const { leadProfile, stage, messages } = state
          const hasRealConversation = messages.length > 1
          if (hasRealConversation) {
            const returnGreeting = buildReturnGreeting(leadProfile, stage)
            state.messages = [returnGreeting, ...messages.filter((m) => m.id !== 'greeting')]
          }
        }
      },
    }
  )
)
