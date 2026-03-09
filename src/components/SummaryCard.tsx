import { motion } from 'framer-motion'
import { FileText, CheckCircle2 } from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import LeadScoreBadge from './LeadScoreBadge'

export default function SummaryCard() {
  const { leadProfile, score } = useChatStore()

  const fields = [
    { label: 'Name', value: leadProfile.name },
    { label: 'Company', value: leadProfile.company },
    { label: 'Challenge', value: leadProfile.painPoints.length > 0 ? leadProfile.painPoints.join(', ') : null },
    { label: 'Team', value: leadProfile.companySize },
    { label: 'Budget', value: leadProfile.budget },
    { label: 'Timeline', value: leadProfile.timeline },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <div className="bg-surface-elevated border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-text-muted" />
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
              Project Brief
            </span>
          </div>
          {score.total > 0 && <LeadScoreBadge score={score.total} />}
        </div>

        {/* Fields */}
        <div className="p-4 space-y-2.5">
          {fields.map(({ label, value }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex justify-between items-baseline text-sm"
            >
              <span className="text-text-muted text-xs">{label}</span>
              <span className={`text-right font-medium ${value ? 'text-text' : 'text-text-muted/40 italic'} text-xs`}>
                {value || 'Not yet provided'}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-surface/50">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-success" />
            <p className="text-[11px] text-text-muted">
              Recommended: Schedule a discovery call
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
