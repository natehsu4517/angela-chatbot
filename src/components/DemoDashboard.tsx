import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '../stores/chatStore'
import { User, Building2, DollarSign, Clock, Target, Zap, LayoutDashboard, Crosshair } from 'lucide-react'
import JourneyPipeline from './dashboard/JourneyPipeline'
import RadarChart from './dashboard/RadarChart'
import ConversationSummary from './dashboard/ConversationSummary'
import AdminPanel from './admin/AdminPanel'

function getAgentFocus(
  stage: string,
  profile: { name: string | null; company: string | null; budget: string | null; timeline: string | null; painPoints: string[] },
): string {
  if (stage === 'booked') return 'Meeting confirmed'
  if (stage === 'booking') return 'Scheduling meeting'
  if (profile.budget && profile.timeline) return 'Ready to close'
  if (profile.name && profile.company) return 'Qualifying budget & timeline'
  if (profile.painPoints.length > 0 && !profile.name) return 'Building rapport'
  if (profile.painPoints.length > 0) return 'Gathering company details'
  return 'Identifying visitor needs'
}

export default function DemoDashboard() {
  const { leadProfile, score, stage, messages } = useChatStore()
  const [adminOpen, setAdminOpen] = useState(false)
  const focus = getAgentFocus(stage, leadProfile)

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

      {/* Agent Focus - shows Angela is always driving the conversation */}
      <div className="bg-surface-elevated border border-border-light rounded-2xl px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <Crosshair size={14} className="text-text-muted shrink-0" />
          <p className="text-[11px] text-text-muted uppercase tracking-wider font-sans">
            Angela's focus
          </p>
          <AnimatePresence mode="wait">
            <motion.span
              key={focus}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.25 }}
              className="ml-auto text-sm font-medium text-text font-sans"
            >
              {focus}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Radar Chart */}
      <RadarChart score={score} />

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
