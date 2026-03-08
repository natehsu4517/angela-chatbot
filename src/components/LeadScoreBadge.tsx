import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LeadScoreBadgeProps {
  score: number
}

export default function LeadScoreBadge({ score }: LeadScoreBadgeProps) {
  const prevScore = useRef(0)
  const [milestone, setMilestone] = useState<'warming' | 'qualified' | null>(null)

  const color =
    score >= 60 ? 'bg-score-high' : score >= 30 ? 'bg-score-mid' : 'bg-score-low'
  const label =
    score >= 60 ? 'Qualified' : score >= 30 ? 'Warming' : 'New'

  // Detect milestone crossings
  useEffect(() => {
    if (prevScore.current < 60 && score >= 60) {
      setMilestone('qualified')
      setTimeout(() => setMilestone(null), 1500)
    } else if (prevScore.current < 30 && score >= 30) {
      setMilestone('warming')
      setTimeout(() => setMilestone(null), 1200)
    }
    prevScore.current = score
  }, [score])

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: milestone ? (milestone === 'qualified' ? 1.15 : 1.1) : 1,
        opacity: 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="relative flex items-center gap-1.5"
    >
      {/* Milestone pulse ring */}
      <AnimatePresence>
        {milestone && (
          <motion.span
            className={`absolute -inset-2 rounded-full ${
              milestone === 'qualified' ? 'bg-score-high/20' : 'bg-score-mid/20'
            }`}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Sparkle dots on "qualified" milestone */}
      <AnimatePresence>
        {milestone === 'qualified' && (
          <>
            {[0, 1, 2, 3].map((i) => {
              const angle = (Math.PI * 2 * i) / 4 - Math.PI / 4
              return (
                <motion.span
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-score-high"
                  style={{ left: '50%', top: '50%' }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * 20,
                    y: Math.sin(angle) * 20,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                />
              )
            })}
          </>
        )}
      </AnimatePresence>

      <motion.div
        className={`w-2 h-2 rounded-full ${color}`}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      <AnimatePresence mode="wait">
        <motion.span
          key={label}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className="text-xs uppercase tracking-wider text-text-muted font-medium"
        >
          {label} ({score})
        </motion.span>
      </AnimatePresence>
    </motion.div>
  )
}
