import { motion } from 'framer-motion'
import { UserPlus, CheckCircle, CalendarCheck } from 'lucide-react'
import type { Activity } from '../../utils/types'

interface Props {
  activities: Activity[]
}

const TYPE_CONFIG: Record<string, { icon: typeof UserPlus; color: string; dotColor: string }> = {
  new_lead: { icon: UserPlus, color: 'text-text-muted', dotColor: 'bg-border' },
  qualified: { icon: CheckCircle, color: 'text-score-mid', dotColor: 'bg-score-mid' },
  booked: { icon: CalendarCheck, color: 'text-score-high', dotColor: 'bg-score-high' },
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function ActivityTab({ activities }: Props) {
  return (
    <div className="relative pl-6">
      {/* Timeline line */}
      <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border-light" />

      <div className="space-y-0">
        {activities.map((activity, i) => {
          const config = TYPE_CONFIG[activity.type] || TYPE_CONFIG.new_lead
          const Icon = config.icon

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.8) }}
              className="relative flex items-start gap-3 py-2.5"
            >
              {/* Dot */}
              <div
                className={`absolute -left-6 top-3 w-[11px] h-[11px] rounded-full border-2 border-bg ${config.dotColor}`}
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon size={13} className={config.color} />
                  <span className="text-sm text-text font-medium truncate">{activity.leadName}</span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  {activity.description}
                  {activity.score != null && activity.type === 'qualified' && (
                    <span className="ml-1 text-score-mid font-mono">({activity.score}%)</span>
                  )}
                </p>
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-text-muted/60 font-mono shrink-0 pt-0.5">
                {timeAgo(activity.timestamp)}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
