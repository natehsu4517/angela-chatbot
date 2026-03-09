import { motion } from 'framer-motion'

interface QuickRepliesProps {
  options: string[]
  onSelect: (option: string) => void
  context?: string
}

export default function QuickReplies({ options, onSelect, context }: QuickRepliesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="pl-10"
    >
      {context && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="text-[11px] text-text-muted italic mb-1.5"
        >
          {context}
        </motion.p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className="px-3.5 py-1.5 text-sm font-medium rounded-full
              border border-border text-text-secondary
              hover:bg-surface hover:border-text/20
              transition-colors cursor-pointer"
          >
            {option}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
