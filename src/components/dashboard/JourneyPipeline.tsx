import { motion } from 'framer-motion'
import type { ConversationStage } from '../../utils/types'

interface JourneyPipelineProps {
  stage: ConversationStage
  score: number
}

const STAGES = [
  { key: 'visitor', label: 'Visitor' },
  { key: 'engaged', label: 'Engaged' },
  { key: 'qualifying', label: 'Qualifying' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'booked', label: 'Booked' },
]

function getActiveIndex(stage: ConversationStage, score: number): number {
  if (stage === 'booked') return 4
  if (stage === 'booking') return 3
  if (stage === 'qualifying' && score >= 30) return 2
  if (stage === 'qualifying') return 1
  return 0
}

export default function JourneyPipeline({ stage, score }: JourneyPipelineProps) {
  const activeIndex = getActiveIndex(stage, score)

  return (
    <div className="bg-surface-elevated border border-border-light rounded-2xl px-5 py-4">
      <p className="text-xs text-text-muted uppercase tracking-wider mb-4 font-sans font-medium">
        Lead Journey
      </p>

      <div className="flex items-center justify-between relative">
        {/* Connecting line (background) */}
        <div className="absolute top-3 left-3 right-3 h-0.5 bg-border" />

        {/* Connecting line (filled) */}
        <motion.div
          className="absolute top-3 left-3 h-0.5 bg-text origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: activeIndex / (STAGES.length - 1) }}
          style={{ width: 'calc(100% - 24px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />

        {STAGES.map((s, i) => {
          const isCompleted = i < activeIndex
          const isActive = i === activeIndex
          const isFuture = i > activeIndex

          return (
            <div key={s.key} className="relative flex flex-col items-center z-10">
              {/* Circle */}
              <motion.div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-text border-text'
                    : isActive
                      ? 'bg-text border-text'
                      : 'bg-surface-elevated border-border'
                }`}
                animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={isActive ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
              >
                {isCompleted && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="var(--color-bg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {isActive && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-bg"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Label */}
              <p
                className={`text-[10px] mt-1.5 font-sans uppercase tracking-wider whitespace-nowrap ${
                  isFuture ? 'text-text-muted/40' : isActive ? 'text-text font-semibold' : 'text-text-muted'
                }`}
              >
                {s.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
