import { useCallback, useRef } from 'react'
import { useChatStore } from '../stores/chatStore'
import { sendMessageStream } from '../utils/api'
import { useTokenBuffer } from './useTokenBuffer'
import type { Message, StreamMetadata, PageContext, ConversationStage } from '../utils/types'

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

export function useChat(options?: { pageContext?: PageContext }) {
  const {
    messages,
    stage,
    isTyping,
    addMessage,
    updateMessage,
    updateLeadProfile,
    setScore,
    setStage,
    setTyping,
    setExpression,
    addSentiment,
    setConversationStartTime,
    conversationStartTime,
    setProgress,
    reset,
  } = useChatStore()

  const abortRef = useRef<AbortController | null>(null)
  const streamMsgRef = useRef<{ id: string; content: string } | null>(null)
  const expressionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollRef = useRef<HTMLElement | null>(null)

  const tokenBuffer = useTokenBuffer({
    onFlush: (text) => {
      if (!streamMsgRef.current) return
      streamMsgRef.current.content += text

      // Write directly to DOM, bypassing React/Zustand entirely during streaming.
      // This eliminates 60fps re-renders of the entire message list.
      const el = document.getElementById('angela-stream-target')
      if (el) {
        el.textContent = streamMsgRef.current.content
        // Auto-scroll the chat container
        const scroller = scrollRef.current || (scrollRef.current = el.closest('[class*="overflow-y"]'))
        if (scroller) scroller.scrollTop = scroller.scrollHeight
      }
    },
  })

  const send = useCallback(
    (text: string) => {
      if (isTyping || stage === 'booked' || stage === 'booking') return

      // Intercept "Start fresh" / "Start over" for return visitor flow
      const lower = text.toLowerCase().trim()
      if (lower === 'start fresh' || lower === 'start over') {
        reset()
        return
      }

      // Abort any in-flight stream
      if (abortRef.current) {
        abortRef.current.abort()
        abortRef.current = null
      }
      tokenBuffer.reset()

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
      setExpression('thinking')

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      let firstToken = true
      const agentMsgId = makeId()

      const onToken = (tokenText: string) => {
        if (firstToken) {
          firstToken = false
          setTyping(false)
          addMessage({
            id: agentMsgId,
            role: 'agent',
            content: '',
            timestamp: Date.now(),
            isStreaming: true,
          })
          streamMsgRef.current = { id: agentMsgId, content: '' }
        }
        tokenBuffer.push(tokenText)
      }

      const onDone = (metadata: StreamMetadata) => {
        // Flush any buffered tokens (writes to DOM, not store)
        tokenBuffer.flush()

        if (firstToken) {
          firstToken = false
          setTyping(false)
          addMessage({
            id: agentMsgId,
            role: 'agent',
            content: '',
            timestamp: Date.now(),
          })
        }

        // Batch all metadata updates
        if (metadata.leadData) updateLeadProfile(metadata.leadData)
        if (metadata.score) setScore(metadata.score)
        if (metadata.stage) setStage(metadata.stage as ConversationStage)
        if (metadata.progress) setProgress(metadata.progress)

        const sentimentValue = metadata.sentiment ?? 0
        addSentiment({
          messageIndex: messages.length + 1,
          value: sentimentValue,
          label: sentimentLabel(sentimentValue),
        })

        if (expressionTimerRef.current) clearTimeout(expressionTimerRef.current)
        if (sentimentValue >= 0.3) setExpression('happy')
        else if (sentimentValue <= -0.2) setExpression('concerned')
        else setExpression('neutral')
        expressionTimerRef.current = setTimeout(() => {
          setExpression('neutral')
          expressionTimerRef.current = null
        }, 3000)

        // Insight card
        if (metadata.insightSummary) {
          addMessage({
            id: makeId(),
            role: 'agent',
            content: metadata.insightSummary,
            timestamp: Date.now(),
            messageType: 'insight',
          })
        }

        // Finalize message: sync content + set flags in ONE store update
        const finalContent = streamMsgRef.current?.content || ''

        updateMessage(agentMsgId, {
          content: finalContent,
          isStreaming: false,
          quickReplies: metadata.quickReplies,
          quickReplyContext: metadata.quickReplyContext,
        })

        // Summary card before booking
        if (metadata.stage === 'booking') {
          const existingSummary = useChatStore.getState().messages.some(
            (m) => m.messageType === 'summary-card'
          )
          if (!existingSummary) {
            addMessage({
              id: makeId(),
              role: 'agent',
              content: '',
              timestamp: Date.now(),
              messageType: 'summary-card',
            })
          }
        }

        streamMsgRef.current = null
        abortRef.current = null
      }

      const onError = () => {
        tokenBuffer.reset()
        setTyping(false)
        setExpression('concerned')
        if (expressionTimerRef.current) clearTimeout(expressionTimerRef.current)
        expressionTimerRef.current = setTimeout(() => {
          setExpression('neutral')
          expressionTimerRef.current = null
        }, 3000)

        if (firstToken) {
          addMessage({
            id: agentMsgId,
            role: 'agent',
            content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
            timestamp: Date.now(),
          })
        } else {
          updateMessage(agentMsgId, { isStreaming: false })
        }

        streamMsgRef.current = null
        abortRef.current = null
      }

      abortRef.current = sendMessageStream(history, text, onToken, onDone, onError, options?.pageContext)
    },
    [messages, isTyping, stage, conversationStartTime, addMessage, updateMessage, updateLeadProfile, setScore, setStage, setTyping, setExpression, addSentiment, setConversationStartTime, setProgress, reset, tokenBuffer, options?.pageContext]
  )

  return { send }
}
