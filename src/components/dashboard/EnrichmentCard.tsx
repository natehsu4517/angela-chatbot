import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore } from '../../stores/chatStore'
import { Sparkles, Building2, Calendar, Globe, Users } from 'lucide-react'
import type { EnrichmentData } from '../../utils/types'

function generateEnrichment(company: string, companySize: string | null): EnrichmentData {
  // Deterministic but varied — derived from company name
  const industries = ['Technology / SaaS', 'Digital Services', 'Business Solutions', 'Marketing / AdTech']
  return {
    industry: industries[company.length % industries.length],
    founded: `${2015 + (company.length % 8)}`,
    website: `${company.toLowerCase().replace(/\s+/g, '')}.com`,
    headcount: companySize ? `${companySize} employees` : 'Unknown',
  }
}

const FIELDS = [
  { key: 'industry', label: 'Industry', icon: Building2 },
  { key: 'founded', label: 'Founded', icon: Calendar },
  { key: 'website', label: 'Website', icon: Globe },
  { key: 'headcount', label: 'Headcount', icon: Users },
] as const

export default function EnrichmentCard() {
  const { leadProfile, enrichment, enrichmentLoading, setEnrichment, setEnrichmentLoading } = useChatStore()
  const [revealedFields, setRevealedFields] = useState<number>(0)
  const hasTriggered = useRef(false)

  // Reset hasTriggered when conversation is reset (company goes back to null)
  useEffect(() => {
    if (!leadProfile.company) {
      hasTriggered.current = false
      setRevealedFields(0)
    }
  }, [leadProfile.company])

  // Trigger enrichment on company name
  useEffect(() => {
    if (leadProfile.company && !hasTriggered.current) {
      hasTriggered.current = true
      setEnrichmentLoading(true)
      setRevealedFields(0)

      const loadTimer = setTimeout(() => {
        const data = generateEnrichment(leadProfile.company!, leadProfile.companySize)
        setEnrichment(data)
        setEnrichmentLoading(false)

        // Reveal fields one by one
        FIELDS.forEach((_, i) => {
          setTimeout(() => setRevealedFields((prev) => Math.max(prev, i + 1)), 300 * (i + 1))
        })
      }, 1500)

      return () => clearTimeout(loadTimer)
    }
  }, [leadProfile.company])

  // Update headcount when companySize arrives after initial enrichment
  useEffect(() => {
    if (enrichment && leadProfile.companySize) {
      setEnrichment({
        ...enrichment,
        headcount: `${leadProfile.companySize} employees`,
      })
    }
  }, [leadProfile.companySize])

  if (!leadProfile.company) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-surface-elevated border border-border-light rounded-2xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-text" />
          <p className="text-sm font-semibold font-sans">Company Intel</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-text-muted px-2 py-0.5 rounded-full bg-surface border border-border">
          AI Enriched
        </span>
      </div>

      <AnimatePresence mode="wait">
        {enrichmentLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <p className="text-xs text-text-muted mb-3">
              Researching <span className="font-medium text-text">{leadProfile.company}</span>...
            </p>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-border animate-pulse" />
                <div
                  className="h-3 rounded bg-border animate-pulse"
                  style={{ width: `${50 + i * 15}%`, animationDelay: `${i * 150}ms` }}
                />
              </div>
            ))}
          </motion.div>
        ) : enrichment ? (
          <motion.div
            key="data"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {FIELDS.map(({ key, label, icon: Icon }, i) => (
              <div key={key} className="flex items-center gap-3">
                <Icon size={14} className="text-text-muted shrink-0" />
                <span className="text-xs text-text-muted w-16 shrink-0">{label}</span>
                {i < revealedFields ? (
                  <motion.span
                    key={enrichment[key]}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm text-text font-medium"
                  >
                    {enrichment[key]}
                  </motion.span>
                ) : (
                  <span className="text-xs text-text-muted/30">...</span>
                )}
              </div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
