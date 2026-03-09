import { motion } from 'framer-motion'

const BUDGET_RANGES = [
  { label: 'Under $1K', desc: 'Small project', bars: 1 },
  { label: '$1K-$5K', desc: 'Standard', bars: 2 },
  { label: '$5K-$10K', desc: 'Mid-range', bars: 3 },
  { label: '$10K-$25K', desc: 'Enterprise', bars: 4 },
  { label: '$25K+', desc: 'Premium', bars: 5 },
]

export default function BudgetSelector({ onSelect }: { onSelect: (v: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="pl-10 space-y-1.5"
    >
      <p className="text-[11px] text-text-muted italic mb-2">Select a budget range</p>
      <div className="grid grid-cols-2 gap-2">
        {BUDGET_RANGES.map((range, i) => (
          <motion.button
            key={range.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => onSelect(range.label)}
            className="p-3 rounded-xl border border-border bg-surface-elevated
              hover:border-text/20 hover:bg-surface transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-1.5 mb-1">
              {Array.from({ length: range.bars }).map((_, j) => (
                <div key={j} className="w-1 h-3 rounded-full bg-text/60" />
              ))}
              {Array.from({ length: 5 - range.bars }).map((_, j) => (
                <div key={`e${j}`} className="w-1 h-3 rounded-full bg-text/10" />
              ))}
            </div>
            <p className="text-sm font-medium text-text">{range.label}</p>
            <p className="text-[10px] text-text-muted">{range.desc}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
