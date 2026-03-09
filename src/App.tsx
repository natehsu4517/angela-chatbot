import ChatWidget from './components/ChatWidget'
import DemoDashboard from './components/DemoDashboard'
import DifferentiatorSection from './components/DifferentiatorSection'
import { Bot, ExternalLink } from 'lucide-react'

export default function App() {
  return (
    <div className="min-h-dvh bg-bg">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
              <Bot size={20} className="text-text" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-sans">Lead Agent</h1>
              <p className="text-xs text-text-muted uppercase tracking-wider">
                AI Qualification &amp; Booking
              </p>
            </div>
          </div>
          <a
            href="https://github.com/natehsu/lead-agent"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
          >
            <span>Source</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero headline */}
        <div className="mb-10">
          <h2 className="text-4xl md:text-5xl font-bold font-sans leading-[1.1] mb-3">
            Meet Angela
          </h2>
          <p className="text-lg text-text-muted max-w-xl">
            An AI agent that qualifies your leads, scores them in real-time, and books meetings on your calendar. Try her out.
          </p>
        </div>

        {/* Demo: chat + dashboard side by side */}
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* Left: Angela (sticky so it stays visible while scrolling dashboard) */}
          <div className="md:sticky md:top-6">
            <p className="text-sm text-text-secondary font-semibold uppercase tracking-wider mb-3">
              Try it live
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

        {/* Features below the fold */}
        <section className="mt-16 border-t border-border pt-12">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-sans leading-[1.1] mb-4">
                AI-Powered Lead Qualification
              </h2>
              <p className="text-base text-text-muted leading-relaxed">
                An intelligent chat agent that qualifies website visitors in real-time,
                scores leads based on budget, timeline, and fit, then books meetings
                for qualified prospects directly on your calendar.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'Human-like typing cadence with variable pauses after punctuation',
                'Voice input via Web Speech API with live transcription',
                'Animated SVG avatar with 4 expression states driven by sentiment',
                'Return visitor recognition, remembers your name across sessions',
                'Interactive qualification UI: visual budget, timeline, and pain point selectors',
                'Proactive exit intent detection and idle nudges',
                'Real-time sentiment tracking with mood visualization',
                'Confetti celebration on successful meeting booking',
                'Multilingual auto-detect, responds in the visitor\'s language',
                'Page-aware context when embedded on a portfolio',
                'Conversation memory with 24-hour TTL and real-time lead scoring',
                'Google Calendar integration with automatic Meet links',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-text mt-2 shrink-0" />
                  <span className="text-sm text-text-secondary">{feature}</span>
                </div>
              ))}
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

        {/* How to embed */}
        <section className="mt-16 border-t border-border pt-12">
          <h3 className="text-xl font-bold font-sans mb-5">Embed on Your Site</h3>
          <p className="text-base text-text-muted mb-5">
            Add this single line to any webpage to install the lead qualification agent:
          </p>
          <pre className="bg-surface border border-border rounded-xl p-5 text-sm font-mono text-text overflow-x-auto">
{`<script defer src="https://your-lead-agent.vercel.app/widget.js"></script>`}
          </pre>
        </section>
      </main>

    </div>
  )
}
