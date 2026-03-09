import ChatWidget from './components/ChatWidget'
import DemoDashboard from './components/DemoDashboard'
import DifferentiatorSection from './components/DifferentiatorSection'
import LiveMetricsBar from './components/LiveMetricsBar'
import AngelaAvatar from './components/AngelaAvatar'
import { ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function App() {
  return (
    <div className="min-h-dvh bg-bg">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <AngelaAvatar size={32} />
          <div>
            <h1 className="text-lg font-bold font-sans">Angela</h1>
            <p className="text-xs text-text-muted uppercase tracking-wider">
              AI Lead Qualification
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-sans leading-[1.05] mb-4 max-w-2xl">
            Your 24/7 Lead{' '}
            <br className="hidden md:block" />
            Qualification Agent
          </h2>
          <p className="text-lg md:text-xl text-text-muted max-w-xl mb-8">
            Angela talks to your website visitors, qualifies them in real-time,
            and books meetings on your calendar. No forms. No friction.
            No $2,500/mo SaaS subscription.
          </p>
          <motion.div
            className="flex items-center gap-2 text-sm text-text-muted"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown size={16} />
            <span>Try the live demo</span>
          </motion.div>
        </div>

        {/* Mobile: compact metrics bar above chat */}
        <div className="md:hidden mb-4">
          <LiveMetricsBar />
        </div>

        {/* Demo: chat + dashboard side by side */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 items-start">
          {/* Left: Angela (sticky so it stays visible while scrolling dashboard) */}
          <div className="md:sticky md:top-6">
            <p className="text-sm text-text-secondary font-semibold uppercase tracking-wider mb-3">
              Live demo
            </p>
            <ChatWidget inline />
          </div>

          {/* Right: live dashboard */}
          <div className="flex justify-center">
            <DemoDashboard />
          </div>
        </div>

        {/* What Makes Angela Different */}
        <DifferentiatorSection />

        {/* Capabilities */}
        <section className="mt-16 border-t border-border pt-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-sans leading-[1.1] mb-4">
                The Full Pipeline,
                <br />
                Not Just a Chat Widget
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                Most chatbots collect a name and email, then hand off to a human.
                Angela handles qualification end-to-end: scores leads in real-time,
                adapts her approach based on sentiment, and books meetings with
                qualified prospects directly on your calendar.
              </p>
            </div>

            <div className="space-y-6">
              <CapabilityGroup
                label="Engagement"
                items={[
                  'Natural conversation flow that keeps visitors talking',
                  'Voice input for hands-free interaction',
                  'Remembers returning visitors by name',
                  'Detects when visitors are about to leave',
                ]}
              />
              <CapabilityGroup
                label="Intelligence"
                items={[
                  'Real-time lead scoring across budget, timeline, and fit',
                  'Sentiment tracking that adapts conversation tone',
                  'Company enrichment from a single name',
                  "Multilingual: responds in the visitor's language",
                ]}
              />
              <CapabilityGroup
                label="Conversion"
                items={[
                  'Visual qualification UI with budget sliders and timeline pickers',
                  'Google Calendar integration with automatic Meet links',
                  'Conversation summary delivered before each call',
                  'Works on any website with a single script tag',
                ]}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-10">
            {['React', 'TypeScript', 'Claude API', 'Supabase', 'Google Calendar', 'Framer Motion'].map(
              (tech) => (
                <span
                  key={tech}
                  className="text-xs px-3 py-1.5 rounded-full
                    bg-surface border border-border text-text-muted
                    font-mono uppercase tracking-wider"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

function CapabilityGroup({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs text-text-muted uppercase tracking-wider font-sans font-medium mb-2">
        {label}
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-text mt-2 shrink-0" />
            <span className="text-sm text-text-secondary">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
