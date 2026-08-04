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
  content: "Hey! I'm Angela, an AI lead agent Nate built from scratch. I qualify visitors, score them in real-time, and book meetings. Try me out, I work just like I would on a real client's site.",
  timestamp: Date.now(),
  quickReplies: ['Show me what you can do', 'How does this work?', 'I want to hire Nate'],
}

const RETURN_GREETINGS_WITH_NAME = [
  (name: string) => `${name}?? Oh thank god, you're back. I thought I said something wrong. Everything okay?`,
  (name: string) => `${name}! You just disappeared on me. I was literally mid-thought. Where'd you go?`,
  (name: string) => `Oh, ${name}, hey! I was starting to worry. Did something come up or did I bore you? Be honest.`,
]

const RETURN_GREETINGS_ANONYMOUS = [
  "Hey, you're back! You disappeared on me mid-conversation. Everything alright?",
  "Oh good, you came back. I was starting to think I scared you off. Where'd you go?",
  "Wait, hi again! You just vanished. I was worried I said something weird. You okay?",
]

function buildReturnGreeting(leadProfile: LeadProfile): Message {
  const name = leadProfile.name
  const idx = Math.floor(Math.random() * 3)

  const content = name
    ? RETURN_GREETINGS_WITH_NAME[idx](name)
    : RETURN_GREETINGS_ANONYMOUS[idx]

  return {
    id: 'greeting',
    role: 'agent',
    content,
    timestamp: Date.now(),
    quickReplies: ['Sorry, got distracted!', 'Just looking around', 'I want to hire Nate'],
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
          const { leadProfile, messages } = state
          const hasRealConversation = messages.length > 1
          if (hasRealConversation) {
            // Reset the chat but greet them like a human who noticed they left
            const returnGreeting = buildReturnGreeting(leadProfile)
            state.messages = [returnGreeting]
            state.leadProfile = { ...initialProfile }
            state.score = { ...initialScore }
            state.stage = 'greeting'
            state.sentimentHistory = []
            state.enrichment = null
            state.enrichmentLoading = false
            state.conversationStartTime = null
            state.qualificationProgress = { current: 0, total: 6 }
          }
        }
      },
    }
  )
)
