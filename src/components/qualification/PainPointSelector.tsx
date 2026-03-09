import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const PAIN_POINTS = [
  'Data is scattered',
  'Manual reporting',
  'Need leads',
  'No dashboard',
  'Need a website',
  'CRM chaos',
  'Slow processes',
]

export default function PainPointSelector({ onSelect }: { onSelect: (v: string) => void }) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (option: string) => {
    setSelected((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    )
  }

  const submit = () => {
    if (selected.length > 0) onSelect(selected.join(', '))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="pl-10 space-y-2"
    >
      <p className="text-[11px] text-text-muted italic">Select all that apply</p>
      <div className="flex flex-wrap gap-2">
        {PAIN_POINTS.map((point, i) => (
          <motion.button
            key={point}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.03 }}
            onClick={() => toggle(point)}
            className={`px-3 py-1.5 rounded-full text-sm border transition-all cursor-pointer ${
              selected.includes(point)
                ? 'bg-text text-bg border-text'
                : 'bg-surface-elevated border-border text-text-secondary hover:border-text/20'
            }`}
          >
            {point}
          </motion.button>
        ))}
      </div>
      {selected.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={submit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-text text-bg text-sm
            font-medium cursor-pointer hover:bg-accent-hover transition-colors"
        >
          Continue
          <ArrowRight size={14} />
        </motion.button>
      )}
    </motion.div>
  )
}
