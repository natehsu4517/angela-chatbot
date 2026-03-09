import { useState } from 'react'
import { motion } from 'framer-motion'
import { useChatStore } from '../stores/chatStore'
import { User, Building2, DollarSign, Clock, Target, Zap, LayoutDashboard } from 'lucide-react'
import JourneyPipeline from './dashboard/JourneyPipeline'
import RadarChart from './dashboard/RadarChart'
import SentimentGraph from './dashboard/SentimentGraph'
import EnrichmentCard from './dashboard/EnrichmentCard'
import ConversationSummary from './dashboard/ConversationSummary'
import AdminPanel from './admin/AdminPanel'

export default function DemoDashboard() {
  const { leadProfile, score, stage, messages, sentimentHistory } = useChatStore()
  const [adminOpen, setAdminOpen] = useState(false)

  const fields = [
    { icon: User, label: 'Name', value: leadProfile.name },
    { icon: Building2, label: 'Company', value: leadProfile.company },
    { icon: DollarSign, label: 'Budget', value: leadProfile.budget },
    { icon: Clock, label: 'Timeline', value: leadProfile.timeline },
    { icon: Target, label: 'Company Size', value: leadProfile.companySize },
  ]

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Journey Pipeline */}
      <JourneyPipeline stage={stage} score={score.total} />

      {/* Radar Chart */}
      <RadarChart score={score} />

      {/* Sentiment Graph */}
      <SentimentGraph history={sentimentHistory} />

      {/* Lead Profile / Extracted Data */}
      <div className="bg-surface-elevated border border-border-light rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={18} className="text-text" />
          <h3 className="text-base font-semibold font-sans">Extracted Data</h3>
          <span className="ml-auto text-xs text-text-muted font-mono">
            {messages.length} msgs
          </span>
        </div>

        <div className="space-y-3.5">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon size={16} className="text-text-muted shrink-0" />
              <span className="text-sm text-text-muted w-24 shrink-0">{label}</span>
              {value ? (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-base text-text font-medium"
                >
                  {value}
                </motion.span>
              ) : (
                <span className="text-sm text-text-muted/30 italic">waiting...</span>
              )}
            </div>
          ))}

          {leadProfile.painPoints.length > 0 && (
            <div className="pt-3 border-t border-border-light">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2.5">
                Pain Points
              </p>
              <div className="flex flex-wrap gap-2">
                {leadProfile.painPoints.map((point) => (
                  <motion.span
                    key={point}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs px-2.5 py-1 rounded-full bg-surface text-text-secondary border border-border"
                  >
                    {point}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-Enrichment */}
      <EnrichmentCard />

      {/* Conversation Summary (only when booked) */}
      <ConversationSummary />

      {/* Open Admin Panel */}
      <button
        onClick={() => setAdminOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-text text-bg
          rounded-xl py-3 font-semibold text-sm font-sans
          hover:opacity-90 active:scale-[0.98] transition-all"
      >
        <LayoutDashboard size={16} />
        Open Admin Panel
      </button>

      <AdminPanel isOpen={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  )
}
