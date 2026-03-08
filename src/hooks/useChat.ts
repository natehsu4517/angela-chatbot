import { useCallback } from 'react'
import { useChatStore } from '../stores/chatStore'
import { sendMessage } from '../utils/api'
import type { Message } from '../utils/types'

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function sentimentLabel(value: number): string {
  if (value >= 0.5) return 'positive'
  if (value >= 0.1) return 'hopeful'
  if (value >= -0.1) return 'neutral'
  if (value >= -0.5) return 'cautious'
  return 'concerned'
}

function typingDelay(messageLength: number): number {
  // Base 400ms + 12ms per character, capped at 3000ms
  return Math.min(3000, 400 + messageLength * 12)
}

export function useChat() {
  const {
    messages,
    stage,
    isTyping,
    addMessage,
    updateLeadProfile,
    setScore,
    setStage,
    setTyping,
    addSentiment,
    setConversationStartTime,
    conversationStartTime,
    setProgress,
  } = useChatStore()

  const send = useCallback(
    async (text: string) => {
      if (isTyping || stage === 'booked') return

      // Track conversation start time on first user message
      if (!conversationStartTime) {
        setConversationStartTime(Date.now())
      }

      // Add user message
      const userMsg: Message = {
        id: makeId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      }
      addMessage(userMsg)
      setTyping(true)

      try {
        const history = [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response = await sendMessage(history, text)

        // Smart typing delay — proportional to response length
        await new Promise((r) => setTimeout(r, typingDelay(response.message.length)))

        // Update lead profile with extracted data
        if (response.leadData) {
          updateLeadProfile(response.leadData)
        }

        // Update score
        if (response.score) {
          setScore(response.score)
        }

        // Update stage
        if (response.stage) {
          setStage(response.stage)
        }

        // Update progress
        if (response.progress) {
          setProgress(response.progress)
        }

        // Track sentiment
        const sentimentValue = response.sentiment ?? 0
        addSentiment({
          messageIndex: messages.length + 1,
          value: sentimentValue,
          label: sentimentLabel(sentimentValue),
        })

        // Add insight card as a separate message if present
        if (response.insightCard) {
          addMessage({
            id: makeId(),
            role: 'agent',
            content: response.insightCard,
            timestamp: Date.now(),
            messageType: 'insight',
          })
          // Brief pause before the follow-up question
          await new Promise((r) => setTimeout(r, 600))
        }

        // Add agent response
        addMessage({
          id: makeId(),
          role: 'agent',
          content: response.message,
          timestamp: Date.now(),
          quickReplies: response.quickReplies,
          quickReplyContext: response.quickReplyContext,
          messageType: response.messageType,
        })
      } catch {
        addMessage({
          id: makeId(),
          role: 'agent',
          content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: Date.now(),
        })
      } finally {
        setTyping(false)
      }
    },
    [messages, isTyping, stage, conversationStartTime, addMessage, updateLeadProfile, setScore, setStage, setTyping, addSentiment, setConversationStartTime, setProgress]
  )

  return { send }
}
