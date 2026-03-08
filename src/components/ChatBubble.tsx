import { motion } from 'framer-motion'
import { User, Sparkles } from 'lucide-react'
import AngelaAvatar from './AngelaAvatar'

interface ChatBubbleProps {
  role: 'agent' | 'user'
  content: string
  messageType?: 'text' | 'insight'
}

export default function ChatBubble({ role, content, messageType }: ChatBubbleProps) {
  const isAgent = role === 'agent'

  // Insight card — special full-width rendering
  if (messageType === 'insight') {
    const lines = content.split('\n').filter(Boolean)
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        <div className="bg-surface-elevated border border-border rounded-xl px-4 py-3.5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles size={12} className="text-text-muted" />
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
              AI Insight
            </span>
          </div>
          <div className="text-[14px] leading-relaxed text-text space-y-1">
            {lines.map((line, i) => {
              if (line.startsWith('•')) {
                return (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="text-text-secondary pl-1"
                  >
                    {line}
                  </motion.p>
                )
              }
              return (
                <p key={i} className={i === lines.length - 1 ? 'text-text-muted text-[13px] mt-2' : ''}>
                  {line}
                </p>
              )
            })}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
    >
      {isAgent && (
        <div className="shrink-0 mt-0.5">
          <AngelaAvatar size={36} />
        </div>
      )}

      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
          isAgent
            ? 'bg-surface-elevated text-text border border-border-light rounded-bl-md'
            : 'bg-user-bubble text-bg rounded-br-md'
        }`}
      >
        {content}
      </div>

      {!isAgent && (
        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
          <User size={15} className="text-text-secondary" />
        </div>
      )}
    </motion.div>
  )
}
