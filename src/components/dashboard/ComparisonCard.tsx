import { motion } from 'framer-motion'
import { useChatStore } from '../../stores/chatStore'
import { Scale } from 'lucide-react'

export default function ComparisonCard() {
  const { messages, score, leadProfile } = useChatStore()

  const fieldsCollected = [
    leadProfile.name,
    leadProfile.email,
    leadProfile.company,
    leadProfile.budget,
    leadProfile.timeline,
    leadProfile.companySize,
  ].filter(Boolean).length + leadProfile.painPoints.length

  const withoutStats = [
    { label: '~2% conversion', dim: true },
    { label: 'No qualification', dim: true },
    { label: 'Manual follow-up', dim: true },
    { label: '24-48hr response', dim: true },
  ]

  const withStats = [
    { label: score.total > 0 ? `${score.total}% score` : 'Live scoring', dim: false },
    { label: fieldsCollected > 0 ? `${fieldsCollected} data points` : 'Auto-extraction', dim: false },
    { label: 'Instant response', dim: false },
    { label: 'Auto-booking', dim: false },
  ]

  return (
    <div className="bg-surface-elevated border border-border-light rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Scale size={16} className="text-text" />
        <p className="text-sm font-semibold font-sans">ROI Comparison</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Without */}
        <div className="space-y-3">
          <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Without</p>

          {/* Mini contact form mockup */}
          <div className="bg-surface rounded-lg p-3 space-y-2 opacity-50">
            <div className="h-2 w-10 bg-border rounded" />
            <div className="h-6 bg-border/60 rounded border border-border" />
            <div className="h-2 w-8 bg-border rounded" />
            <div className="h-6 bg-border/60 rounded border border-border" />
            <div className="h-2 w-12 bg-border rounded" />
            <div className="h-10 bg-border/60 rounded border border-border" />
            <div className="h-6 bg-border rounded-md w-16 mx-auto" />
          </div>

          <div className="space-y-1.5">
            {withoutStats.map(({ label }) => (
              <p key={label} className="text-xs text-text-muted/50 flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-score-low shrink-0" />
                {label}
              </p>
            ))}
          </div>
        </div>

        {/* With */}
        <div className="space-y-3">
          <p className="text-xs text-text uppercase tracking-wider font-semibold">With Agent</p>

          {/* Mini chat mockup */}
          <div className="bg-surface rounded-lg p-3 space-y-1.5">
            <div className="flex justify-start">
              <div className="h-4 w-24 bg-border rounded-full" />
            </div>
            <div className="flex justify-end">
              <div className="h-4 w-16 bg-text/80 rounded-full" />
            </div>
            <div className="flex justify-start">
              <div className="h-4 w-28 bg-border rounded-full" />
            </div>
            <div className="flex justify-end">
              <div className="h-4 w-20 bg-text/80 rounded-full" />
            </div>
            <div className="flex justify-start">
              <div className="h-4 w-20 bg-border rounded-full" />
            </div>
            <div className="flex gap-1 mt-1">
              <div className="h-3.5 w-12 bg-border rounded-full border border-border" />
              <div className="h-3.5 w-10 bg-border rounded-full border border-border" />
            </div>
          </div>

          <div className="space-y-1.5">
            {withStats.map(({ label }, i) => (
              <motion.p
                key={label}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="text-xs text-text font-medium flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-score-high shrink-0" />
                {label}
              </motion.p>
            ))}
          </div>
        </div>
      </div>

      {messages.length > 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 pt-3 border-t border-border-light text-center"
        >
          <p className="text-xs text-text-muted">
            <span className="font-medium text-text">{messages.length}</span> messages exchanged &middot;{' '}
            <span className="font-medium text-text">{fieldsCollected}</span> fields extracted automatically
          </p>
        </motion.div>
      )}
    </div>
  )
}
