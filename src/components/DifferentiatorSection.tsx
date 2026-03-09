import { motion } from 'framer-motion'
import { Keyboard, SmilePlus, LayoutGrid, Radar, Server } from 'lucide-react'

const differentiators = [
  {
    icon: Keyboard,
    title: 'Human-Like Typing',
    description:
      'Variable-speed streaming with natural pauses after punctuation and paragraphs. No robotic instant text dumps.',
  },
  {
    icon: SmilePlus,
    title: 'Expressive Avatar',
    description:
      'Four sentiment-driven expression states that shift based on conversation mood, not a static bot icon.',
  },
  {
    icon: LayoutGrid,
    title: 'Interactive Qualification',
    description:
      'Visual budget sliders, timeline selectors, and pain point pickers replace generic text chips.',
  },
  {
    icon: Radar,
    title: 'Proactive Intelligence',
    description:
      'Exit intent detection and idle nudges that feel like a real person paying attention, not canned popups.',
  },
  {
    icon: Server,
    title: 'Self-Hosted',
    description:
      'One script tag. No monthly SaaS fee. No vendor lock-in. Deploy on your own infrastructure.',
  },
]

export default function DifferentiatorSection() {
  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold font-sans leading-[1.1] mb-3">
          What Makes Angela Different
        </h2>
        <p className="text-base text-text-muted">
          Features enterprise chatbots charge $2,500/mo for. Built from scratch.
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
