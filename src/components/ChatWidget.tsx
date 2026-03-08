import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { useChat } from '../hooks/useChat'
import ChatBubble from './ChatBubble'
import ChatInput from './ChatInput'
import QuickReplies from './QuickReplies'
import TypingIndicator from './TypingIndicator'
import LeadScoreBadge from './LeadScoreBadge'
import BookingStep from './BookingStep'
import AngelaAvatar from './AngelaAvatar'

interface ChatWidgetProps {
  inline?: boolean
}

export default function ChatWidget({ inline = false }: ChatWidgetProps) {
  const { messages, isOpen, isTyping, score, stage, qualificationProgress, setOpen } = useChatStore()
  const { send } = useChat()
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessage = messages[messages.length - 1]

  const progressPct = qualificationProgress.total > 0
    ? (qualificationProgress.current / qualificationProgress.total) * 100
    : 0

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const showPanel = inline || isOpen

  // ── Shared chat panel ──
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
            <AngelaAvatar size={40} isTyping={isTyping} />
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
          <div className="flex items-center gap-3">
            {score.total > 0 && <LeadScoreBadge score={score.total} />}
            {!inline && (
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface transition-colors cursor-pointer"
              >
                <X size={18} className="text-text-muted" />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {qualificationProgress.current > 0 && (
          <div className="h-0.5 bg-border">
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-2">
            <ChatBubble role={msg.role} content={msg.content} messageType={msg.messageType} />
            {msg.quickReplies &&
              msg.id === lastMessage?.id &&
              !isTyping && (
                <QuickReplies options={msg.quickReplies} onSelect={send} context={msg.quickReplyContext} />
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

  // ── Inline mode: just the panel, no FAB ──
  if (inline) {
    return chatPanel
  }

  // ── Floating mode: FAB + animated panel ──
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
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
            onClick={() => setOpen(!isOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative w-14 h-14 rounded-full bg-accent text-bg flex items-center justify-center
              shadow-lg shadow-black/15 cursor-pointer hover:bg-accent-hover transition-colors"
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
                  key="chat"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <MessageSquare size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
