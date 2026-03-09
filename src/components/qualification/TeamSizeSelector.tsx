import { motion } from 'framer-motion'
import { User, Users } from 'lucide-react'

const SIZES = [
  { label: 'Just me', icon: 'solo' as const },
  { label: '2-10', icon: 'small' as const },
  { label: '11-50', icon: 'medium' as const },
  { label: '51-200', icon: 'large' as const },
  { label: '200+', icon: 'large' as const },
]

export default function TeamSizeSelector({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="pl-10 space-y-1.5"
    >
      <p className="text-[11px] text-text-muted italic mb-2">How big is your team?</p>
      <div className="grid grid-cols-2 gap-2">
        {SIZES.map((size, i) => (
          <motion.button
            key={size.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => onSelect(size.label)}
            className="p-3 rounded-xl border border-border bg-surface-elevated
              hover:border-text/20 hover:bg-surface transition-all cursor-pointer text-left
              flex items-center gap-2.5"
          >
            {size.icon === 'solo' ? (
              <User size={16} className="text-text-muted shrink-0" />
            ) : (
              <Users size={16} className="text-text-muted shrink-0" />
            )}
            <p className="text-sm font-medium text-text">{size.label}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
