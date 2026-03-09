import { motion } from 'framer-motion'
import { Keyboard, SmilePlus, LayoutGrid, Radar, Eye, DollarSign } from 'lucide-react'

const differentiators = [
  {
    icon: DollarSign,
    title: '$0/mo, You Own It',
    description:
      'Drift charges $2,500/mo. Intercom charges per resolution. Angela is a one-time build on your own infrastructure. No subscriptions, no vendor lock-in.',
  },
  {
    icon: Eye,
    title: 'Watch It Think in Real-Time',
    description:
      'Most chatbots give you a report after the fact. Angela shows lead scoring, sentiment, and data extraction live as the conversation happens.',
  },
  {
    icon: Keyboard,
    title: 'Visitors Stay Longer',
    description:
      "Natural typing speed with realistic pauses. Visitors engage like they're texting a real person, not waiting on a chatbot.",
  },
  {
    icon: LayoutGrid,
    title: 'Qualification Without Friction',
    description:
      'Visual budget sliders and timeline pickers replace boring form fields. Visitors actually enjoy the process.',
  },
  {
    icon: SmilePlus,
    title: 'Conversations Feel Human',
    description:
      "Angela's expression shifts based on conversation mood. Visitors sense empathy, not a static bot icon.",
  },
  {
    icon: Radar,
    title: 'No Lead Slips Through',
    description:
      'Exit intent detection and idle nudges re-engage visitors who are about to leave. Feels attentive, not pushy.',
  },
]

export default function DifferentiatorSection() {
  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold font-sans leading-[1.1] mb-3">
          Why Angela Converts Better
        </h2>
        <p className="text-base text-text-muted">
          What $2,500/mo chatbots won't tell you they're missing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {differentiators.map(({ icon: Icon, title, description }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-surface-elevated border border-border-light rounded-2xl p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mb-4">
              <Icon size={22} className="text-text" />
            </div>
            <h3 className="text-lg font-bold font-sans mb-2">{title}</h3>
            <p className="text-sm text-text-muted leading-relaxed">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
