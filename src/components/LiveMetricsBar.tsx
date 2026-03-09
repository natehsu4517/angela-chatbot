import { motion } from 'framer-motion'
import { useChatStore } from '../stores/chatStore'
import LeadScoreBadge from './LeadScoreBadge'

const STAGES = ['Visitor', 'Engaged', 'Qualifying', 'Qualified', 'Booked'] as const

function getActiveIndex(stage: string, score: number): number {
  if (stage === 'booked') return 4
  if (stage === 'booking') return 3
  if (stage === 'qualifying' && score >= 30) return 2
  if (stage === 'qualifying') return 1
  return 0
}

export default function LiveMetricsBar() {
  const { stage, score } = useChatStore()
  const activeIndex = getActiveIndex(stage, score.total)

  return (
    <div className="bg-surface-elevated border border-border-light rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] text-text-muted uppercase tracking-wider font-sans font-medium">
          Live Intelligence
        </p>
        {score.total > 0 && <LeadScoreBadge score={score.total} />}
      </div>

      <div className="flex items-center gap-1">
        {STAGES.map((label, i) => {
          const isCompleted = i < activeIndex
          const isActive = i === activeIndex

          return (
            <div key={label} className="flex items-center gap-1 flex-1 min-w-0">
              <motion.div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isCompleted || isActive ? 'bg-text' : 'bg-border'
                }`}
                animate={isActive ? { scale: [1, 1.3, 1] } : {}}
                transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
              />
              <span
                className={`text-[9px] uppercase tracking-wider truncate ${
                  isActive ? 'text-text font-semibold' : 'text-text-muted/50'
                }`}
              >
                {label}
              </span>
              {i < STAGES.length - 1 && (
                <div className={`flex-1 h-px min-w-1 ${isCompleted ? 'bg-text' : 'bg-border'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
