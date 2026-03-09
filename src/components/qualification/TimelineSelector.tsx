import { motion } from 'framer-motion'

const TIMELINES = [
  { label: 'ASAP', desc: 'Urgent', color: 'bg-red-500' },
  { label: 'Within 30 days', desc: 'Soon', color: 'bg-amber-500' },
  { label: '1-3 months', desc: 'Planning', color: 'bg-green-500' },
  { label: 'Just exploring', desc: 'No rush', color: 'bg-text-muted/30' },
]

export default function TimelineSelector({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="pl-10 space-y-1.5"
    >
      <p className="text-[11px] text-text-muted italic mb-2">When do you need this?</p>
      <div className="grid grid-cols-2 gap-2">
        {TIMELINES.map((t, i) => (
          <motion.button
            key={t.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => onSelect(t.label)}
            className="p-3 rounded-xl border border-border bg-surface-elevated
              hover:border-text/20 hover:bg-surface transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${t.color}`} />
              <p className="text-sm font-medium text-text">{t.label}</p>
            </div>
            <p className="text-[10px] text-text-muted">{t.desc}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
