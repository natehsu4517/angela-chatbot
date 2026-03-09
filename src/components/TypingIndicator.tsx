import { motion } from 'framer-motion'
import AngelaAvatar from './AngelaAvatar'
import { useChatStore } from '../stores/chatStore'

export default function TypingIndicator() {
  const { expression } = useChatStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex gap-2.5 justify-start items-end"
    >
      <div className="shrink-0">
        <AngelaAvatar size={36} isTyping expression={expression} />
      </div>
      <motion.div
        className="flex gap-1 items-center px-3 py-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-text-muted/50"
            animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -3, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}
