import { motion } from 'framer-motion'
import { Users, Target, TrendingUp, Clock } from 'lucide-react'
import type { DemoLead } from '../../utils/types'

interface Props {
  leads: DemoLead[]
}

const STAGE_CONFIG: Record<string, { label: string; color: string }> = {
  booked: { label: 'Booked', color: 'bg-score-high' },
  booking: { label: 'Booking', color: 'bg-score-mid' },
  qualifying: { label: 'Qualifying', color: 'bg-score-mid' },
  greeting: { label: 'New', color: 'bg-border' },
  nurture: { label: 'Nurture', color: 'bg-text-muted/40' },
}

export default function OverviewTab({ leads }: Props) {
  const totalLeads = leads.length
  const avgScore = Math.round(leads.reduce((sum, l) => sum + l.score.total, 0) / totalLeads)
  const bookedCount = leads.filter((l) => l.stage === 'booked').length
  const conversionRate = Math.round((bookedCount / totalLeads) * 100)
  const qualifiedLeads = leads.filter((l) => l.timeToQualify > 0)
  const avgTimeToQualify =
    qualifiedLeads.length > 0
      ? Math.round(qualifiedLeads.reduce((sum, l) => sum + l.timeToQualify, 0) / qualifiedLeads.length)
      : 0

  const stats = [
    { icon: Users, label: 'Total Leads', value: totalLeads.toString() },
    { icon: Target, label: 'Avg Score', value: `${avgScore}%` },
    { icon: TrendingUp, label: 'Conversion', value: `${conversionRate}%` },
    { icon: Clock, label: 'Avg Qualify Time', value: `${avgTimeToQualify} min` },
  ]

  // Count leads per stage
  const stageCounts: Record<string, number> = {}
  for (const lead of leads) {
    stageCounts[lead.stage] = (stageCounts[lead.stage] || 0) + 1
  }
  const stageOrder = ['booked', 'qualifying', 'greeting', 'nurture']

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ icon: Icon, label, value }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-surface border border-border-light rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className="text-text-muted" />
              <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-bold font-sans">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Stage distribution */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface border border-border-light rounded-xl p-5"
      >
        <p className="text-sm font-semibold font-sans mb-4">Pipeline Distribution</p>

        {/* Segmented bar */}
        <div className="flex h-8 rounded-lg overflow-hidden mb-4">
          {stageOrder.map((stage) => {
            const count = stageCounts[stage] || 0
            if (count === 0) return null
            const pct = (count / totalLeads) * 100
            const config = STAGE_CONFIG[stage]
            return (
              <div
                key={stage}
                className={`${config.color} flex items-center justify-center text-xs font-mono font-medium`}
                style={{ width: `${pct}%`, minWidth: count > 0 ? '2rem' : 0 }}
                title={`${config.label}: ${count}`}
              >
                {pct >= 12 && <span className="text-bg mix-blend-difference">{count}</span>}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {stageOrder.map((stage) => {
            const count = stageCounts[stage] || 0
            if (count === 0) return null
            const config = STAGE_CONFIG[stage]
            return (
              <div key={stage} className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${config.color}`} />
                <span className="text-xs text-text-muted">
                  {config.label} ({count})
                </span>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
