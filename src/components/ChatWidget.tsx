import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, RotateCcw } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { useChat } from '../hooks/useChat'
import { useProactiveTriggers } from '../hooks/useProactiveTriggers'
import ChatBubble from './ChatBubble'
import ChatInput from './ChatInput'
import QuickReplies from './QuickReplies'
import TypingIndicator from './TypingIndicator'
import LeadScoreBadge from './LeadScoreBadge'
import BookingStep from './BookingStep'
import AngelaAvatar from './AngelaAvatar'
import BudgetSelector from './qualification/BudgetSelector'
import TimelineSelector from './qualification/TimelineSelector'
import PainPointSelector from './qualification/PainPointSelector'
import TeamSizeSelector from './qualification/TeamSizeSelector'
import type { PageContext } from '../utils/types'

interface ChatWidgetProps {
  inline?: boolean
  pageContext?: PageContext
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

function QualificationUI({ options, context, onSelect }: { options: string[]; context?: string; onSelect: (v: string) => void }) {
  const ctx = (context || '').toLowerCase()

  if (ctx.includes('budget')) return <BudgetSelector onSelect={onSelect} />
  if (ctx.includes('timeline')) return <TimelineSelector onSelect={onSelect} />
  if (ctx.includes('challenge') || ctx.includes('pain')) return <PainPointSelector onSelect={onSelect} />
  if (ctx.includes('team') || ctx.includes('size')) return <TeamSizeSelector onSelect={onSelect} />

  return <QuickReplies options={options} onSelect={onSelect} context={context} />
}

export default function ChatWidget({ inline = false, pageContext }: ChatWidgetProps) {
  const { messages, isOpen, isTyping, score, stage, expression, qualificationProgress, conversationStartTime, setOpen, reset } = useChatStore()
  const { send } = useChat({ pageContext })
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessage = messages[messages.length - 1]

  const progressPct = qualificationProgress.total > 0
    ? (qualificationProgress.current / qualificationProgress.total) * 100
    : 0

  const showPanel = inline || isOpen

  const { resetTriggers } = useProactiveTriggers({
    enabled: true,
    chatIsOpen: showPanel,
  })

  const handleReset = () => {
    reset()
    resetTriggers()
  }

  // TTL check: reset if conversation is older than 24 hours
  useEffect(() => {
    if (conversationStartTime && Date.now() - conversationStartTime > TWENTY_FOUR_HOURS) {
      handleReset()
    }
  }, [conversationStartTime])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // Shared chat panel
  const chatPanel = (
    <div
      className={`bg-surface-elevated border border-border rounded-2xl
        shadow-xl shadow-black/10 flex flex-col overflow-hidden ${
          inline
            ? 'w-full h-[600px]'
            : 'w-[calc(100vw-2.5rem)] max-w-[440px] h-[min(600px,calc(100dvh-6rem))] sm:h-[600px]'
        }`}
    >
      {/* Header */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <AngelaAvatar size={40} isTyping={isTyping} expression={expression} />
            <div>
              <p className="text-base font-semibold font-sans">Angela</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                {qualificationProgress.current > 0 ? (
                  <span className="text-xs text-text-muted font-mono">
                    {qualificationProgress.current}/{qualificationProgress.total}
                  </span>
                ) : (
                  <span className="text-xs text-text-muted">Online</span>
                )}
                <span className="text-[10px] text-text-muted/50">· Powered by Claude</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {score.total > 0 && <LeadScoreBadge score={score.total} />}
            {messages.length > 1 && (
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
                title="New conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={14} className="text-text-muted" />
              </button>
            )}
            {!inline && (
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X size={18} className="text-text-muted" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {qualificationProgress.current > 0 && (
          <div className="h-0.5 bg-border" role="progressbar" aria-valuenow={qualificationProgress.current} aria-valuemin={0} aria-valuemax={qualificationProgress.total} aria-label="Qualification progress">
            <motion.div
              className="h-full bg-text"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-label="Chat messages" aria-live="polite">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            <ChatBubble
              role={msg.role}
              content={msg.content}
              messageType={msg.messageType}
              isStreaming={msg.isStreaming}
            />
            {msg.quickReplies &&
              msg.id === lastMessage?.id &&
              !isTyping &&
              !msg.isStreaming && (
                <QualificationUI options={msg.quickReplies} context={msg.quickReplyContext} onSelect={send} />
              )}
          </div>
        ))}

        <AnimatePresence>
          {isTyping && <TypingIndicator />}
        </AnimatePresence>

        {stage === 'booking' && <BookingStep />}
      </div>

      {/* Input */}
      <ChatInput
        onSend={send}
        disabled={isTyping || stage === 'booking' || stage === 'booked'}
      />
    </div>
  )

  // Inline mode: just the panel
  if (inline) {
    return chatPanel
  }

  // Floating mode: FAB + animated panel
  const [fabMoved, setFabMoved] = useState(false)

  const handleFabClick = () => {
    if (!fabMoved) setFabMoved(true)
    setOpen(!isOpen)
  }

  const isCentered = !fabMoved && !isOpen

  return (
    <div
      className={`fixed z-50 flex flex-col items-end gap-3
        transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isCentered
          ? 'bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2'
          : 'bottom-5 right-5 translate-x-0 translate-y-0'
        }`}
    >
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {chatPanel}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB toggle */}
      <motion.div
        animate={!isOpen ? { y: [0, -6, 0] } : {}}
        transition={{ duration: 2.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
      >
        <div className="relative">
          {!isOpen && (
            <motion.span
              className="absolute inset-0 rounded-full bg-accent/10"
              animate={{ scale: [1, 1.8], opacity: [0.25, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
            />
          )}

          <motion.button
            onClick={handleFabClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isOpen ? 'Close chat' : 'Open chat with Angela'}
            className="relative w-14 h-14 rounded-full bg-accent text-bg flex items-center justify-center
              shadow-lg shadow-black/15 cursor-pointer hover:bg-accent-hover transition-colors overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div
                  key="avatar"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <AngelaAvatar size={40} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
