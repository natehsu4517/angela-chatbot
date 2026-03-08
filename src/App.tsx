import ChatWidget from './components/ChatWidget'
import DemoDashboard from './components/DemoDashboard'
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
            href="https://github.com/yourusername/lead-agent"
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
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left: description */}
          <div>
            <p className="text-sm text-text-secondary font-semibold uppercase tracking-wider mb-4">
              Portfolio Demo
            </p>
            <h2 className="text-4xl md:text-5xl font-bold font-sans leading-[1.1] mb-6">
              AI-Powered Lead Qualification
            </h2>
            <p className="text-lg text-text-muted leading-relaxed mb-10">
              An intelligent chat agent that qualifies website visitors in real-time,
              scores leads based on budget, timeline, and fit, then books meetings
              for qualified prospects directly on your calendar.
            </p>

            <div className="space-y-4 mb-10">
              {[
                'Natural conversation powered by Claude AI',
                'Real-time lead scoring (0-100)',
                'Google Calendar integration with auto-booking',
                'Embeddable on any website via single script tag',
                'Supabase backend for lead storage',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-text mt-2.5 shrink-0" />
                  <span className="text-base text-text-secondary">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 mb-12">
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

            {/* Inline chat widget — desktop only */}
            <div className="hidden md:block">
              <ChatWidget inline />
            </div>
          </div>

          {/* Right: live dashboard */}
          <div className="flex justify-center">
            <DemoDashboard />
          </div>
        </div>

        {/* How to embed */}
        <section className="mt-24 border-t border-border pt-14">
          <h3 className="text-xl font-bold font-sans mb-5">Embed on Your Site</h3>
          <p className="text-base text-text-muted mb-5">
            Add this single line to any webpage to install the lead qualification agent:
          </p>
          <pre className="bg-surface border border-border rounded-xl p-5 text-sm font-mono text-text overflow-x-auto">
{`<script defer src="https://your-lead-agent.vercel.app/widget.js"></script>`}
          </pre>
        </section>
      </main>

      {/* Floating chat widget — mobile only */}
      <div className="md:hidden">
        <ChatWidget />
      </div>
    </div>
  )
}
