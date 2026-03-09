import { motion } from 'framer-motion'
import { X, User, Building2, DollarSign, Clock, Target, Users, Mail } from 'lucide-react'
import type { DemoLead } from '../../utils/types'

interface Props {
  lead: DemoLead
  onClose: () => void
}

const SCORE_LABELS: Record<string, string> = {
  budget: 'Budget',
  timeline: 'Timeline',
  companySize: 'Company Size',
  painPoints: 'Pain Points',
}

export default function LeadDetailPanel({ lead, onClose }: Props) {
  const profileFields = [
    { icon: User, label: 'Name', value: lead.name },
    { icon: Mail, label: 'Email', value: lead.email },
    { icon: Building2, label: 'Company', value: lead.company },
    { icon: DollarSign, label: 'Budget', value: lead.budget },
    { icon: Clock, label: 'Timeline', value: lead.timeline },
    { icon: Users, label: 'Team Size', value: lead.companySize },
  ]

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 250 }}
      className="absolute inset-y-0 right-0 w-full md:w-[440px] bg-bg border-l border-border-light
        flex flex-col overflow-hidden z-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-light shrink-0">
        <div>
          <p className="text-base font-bold font-sans">{lead.name || 'Anonymous'}</p>
          {lead.company && <p className="text-xs text-text-muted">{lead.company}</p>}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile */}
        <div className="px-5 py-4 border-b border-border-light">
          <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">Profile</p>
          <div className="space-y-2.5">
            {profileFields.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={14} className="text-text-muted shrink-0" />
                <span className="text-xs text-text-muted w-20 shrink-0">{label}</span>
                <span className={`text-sm ${value ? 'text-text font-medium' : 'text-text-muted/30 italic'}`}>
                  {value || 'N/A'}
                </span>
              </div>
            ))}
          </div>

          {lead.painPoints.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border-light">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2">Pain Points</p>
              <div className="flex flex-wrap gap-1.5">
                {lead.painPoints.map((p) => (
                  <span
                    key={p}
                    className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-text-secondary"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Score breakdown */}
        <div className="px-5 py-4 border-b border-border-light">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Score Breakdown</p>
            <div className="flex items-center gap-1.5">
              <Target size={14} className="text-text" />
              <span className="text-lg font-bold font-sans">{lead.score.total}</span>
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(lead.score.breakdown).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-text-muted">{SCORE_LABELS[key]}</span>
                  <span className="text-xs font-mono text-text-secondary">{Math.round(value)}</span>
                </div>
                <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className={`h-full rounded-full ${
                      value >= 60 ? 'bg-score-high' : value >= 30 ? 'bg-score-mid' : 'bg-score-low'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation replay */}
        <div className="px-5 py-4">
          <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-3">
            Conversation ({lead.messageCount} messages)
          </p>
          <div className="space-y-2">
            {lead.conversation.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-text text-bg rounded-br-sm'
                      : 'bg-surface border border-border-light text-text rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
