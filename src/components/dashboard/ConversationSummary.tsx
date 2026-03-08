import { motion } from 'framer-motion'
import { useChatStore } from '../../stores/chatStore'
import { MessageSquare, Clock, Target, CheckCircle } from 'lucide-react'

export default function ConversationSummary() {
  const { messages, score, leadProfile, conversationStartTime, stage } = useChatStore()

  if (stage !== 'booked') return null

  const elapsedMs = conversationStartTime ? Date.now() - conversationStartTime : 0
  const elapsedMin = Math.max(1, Math.round(elapsedMs / 60000))
  const userMessages = messages.filter((m) => m.role === 'user').length

  const stats = [
    { icon: MessageSquare, label: 'Messages', value: `${messages.length}`, sub: `${userMessages} from lead` },
    { icon: Clock, label: 'Time', value: `${elapsedMin} min`, sub: 'to qualify' },
    { icon: Target, label: 'Score', value: `${score.total}`, sub: 'out of 100' },
    { icon: CheckCircle, label: 'Status', value: 'Booked', sub: 'meeting set' },
  ]

  const insights = [
    leadProfile.company && `Company: ${leadProfile.company}`,
    leadProfile.budget && `Budget: ${leadProfile.budget}`,
    leadProfile.timeline && `Timeline: ${leadProfile.timeline}`,
    ...leadProfile.painPoints.map((p) => `Pain: ${p}`),
  ].filter(Boolean) as string[]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-surface-elevated border border-border-light rounded-2xl p-6"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-bold font-sans mb-1"
      >
        Qualified in {userMessages} messages
      </motion.p>
      <p className="text-xs text-text-muted mb-5">Conversation complete — meeting booked</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {stats.map(({ icon: Icon, label, value, sub }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-surface rounded-xl px-3.5 py-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Icon size={14} className="text-text-muted" />
              <span className="text-xs text-text-muted uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-xl font-bold font-sans">{value}</p>
            <p className="text-[11px] text-text-muted">{sub}</p>
          </motion.div>
        ))}
      </div>

      {insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-xs text-text-muted uppercase tracking-wider mb-2.5">Key Insights</p>
          <div className="flex flex-wrap gap-1.5">
            {insights.map((insight) => (
              <span
                key={insight}
                className="text-xs px-2.5 py-1 rounded-full bg-surface text-text-secondary border border-border"
              >
                {insight}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
