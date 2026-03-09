import { useEffect, useRef, useCallback } from 'react'
import { useChatStore } from '../stores/chatStore'

interface ProactiveTriggerOptions {
  enabled: boolean
  chatIsOpen: boolean
}

const IDLE_TIMEOUT = 35_000 // 35 seconds

const IDLE_NUDGES = [
  'Still there? No rush.',
  'Anything else you\'d like to know?',
  'I\'m here when you\'re ready.',
]

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

export function useProactiveTriggers({ enabled, chatIsOpen }: ProactiveTriggerOptions) {
  const exitFiredRef = useRef(false)
  const idleFiredRef = useRef(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Exit Intent (attach once, read store inside handler) ──
  useEffect(() => {
    if (!enabled) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 0) return
      if (exitFiredRef.current) return

      const { isTyping, stage, addMessage, setOpen } = useChatStore.getState()
      if (isTyping || stage === 'booked') return

      exitFiredRef.current = true

      if (!chatIsOpen) setOpen(true)

      setTimeout(() => {
        addMessage({
          id: makeId(),
          role: 'agent',
          content: "Leaving so soon? If you have questions about working with Nate, I'm here. No commitment.",
          timestamp: Date.now(),
          quickReplies: ['Tell me more', 'Not right now'],
        })
      }, 400)
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [enabled, chatIsOpen])

  // ── Idle Nudge ──
  const messages = useChatStore((s) => s.messages)
  const userMessageCount = messages.filter((m) => m.role === 'user').length

  useEffect(() => {
    if (!enabled || idleFiredRef.current) return
    if (userMessageCount < 2) return

    const { isTyping, stage } = useChatStore.getState()
    if (isTyping || stage === 'booked') return

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)

    idleTimerRef.current = setTimeout(() => {
      if (idleFiredRef.current) return

      const state = useChatStore.getState()
      if (state.isTyping || state.stage === 'booked') return

      idleFiredRef.current = true

      // Open chat if it's closed so the nudge is visible
      if (!state.isOpen) state.setOpen(true)

      const nudge = IDLE_NUDGES[Math.floor(Math.random() * IDLE_NUDGES.length)]

      state.addMessage({
        id: makeId(),
        role: 'agent',
        content: nudge,
        timestamp: Date.now(),
        quickReplies: ['I have a question', 'Book a call'],
      })
    }, IDLE_TIMEOUT)

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [enabled, messages.length, userMessageCount])

  const resetTriggers = useCallback(() => {
    exitFiredRef.current = false
    idleFiredRef.current = false
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }, [])

  return { resetTriggers }
}
