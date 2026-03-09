import { useState, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowUpDown } from 'lucide-react'
import type { DemoLead } from '../../utils/types'
import LeadDetailPanel from './LeadDetailPanel'

interface Props {
  leads: DemoLead[]
}

type SortKey = 'name' | 'score' | 'stage' | 'createdAt'

const STAGE_STYLES: Record<string, string> = {
  booked: 'bg-score-high/15 text-score-high',
  booking: 'bg-score-mid/15 text-score-mid',
  qualifying: 'bg-score-mid/15 text-score-mid',
  greeting: 'bg-border/40 text-text-muted',
  nurture: 'bg-border/40 text-text-muted',
}

const STAGE_ORDER: Record<string, number> = {
  booked: 4,
  booking: 3,
  qualifying: 2,
  greeting: 1,
  nurture: 0,
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const STAGE_FILTERS = ['all', 'booked', 'qualifying', 'greeting'] as const

export default function LeadsTab({ leads }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortAsc, setSortAsc] = useState(false)
  const [stageFilter, setStageFilter] = useState<string>('all')

  const sorted = useMemo(() => {
    const filtered = stageFilter === 'all' ? leads : leads.filter((l) => l.stage === stageFilter)
    const arr = [...filtered]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = (a.name || 'ZZZ').localeCompare(b.name || 'ZZZ')
          break
        case 'score':
          cmp = a.score.total - b.score.total
          break
        case 'stage':
          cmp = (STAGE_ORDER[a.stage] || 0) - (STAGE_ORDER[b.stage] || 0)
          break
        case 'createdAt':
          cmp = a.createdAt - b.createdAt
          break
      }
      return sortAsc ? cmp : -cmp
    })
    return arr
  }, [leads, sortKey, sortAsc, stageFilter])

  const selectedLead = selectedId ? leads.find((l) => l.id === selectedId) : null

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const columns: { key: SortKey; label: string; className: string }[] = [
    { key: 'name', label: 'Name', className: 'flex-1 min-w-0' },
    { key: 'score', label: 'Score', className: 'w-16 text-center' },
    { key: 'stage', label: 'Stage', className: 'w-24 text-center hidden sm:block' },
    { key: 'createdAt', label: 'Date', className: 'w-16 text-right hidden sm:block' },
  ]

  return (
    <div className="relative h-full">
      {/* Stage filter */}
      <div className="flex gap-1.5 px-3 pb-2 mb-1 border-b border-border-light">
        {STAGE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStageFilter(f)}
            className={`text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full transition-colors
              ${stageFilter === f
                ? 'bg-text text-bg'
                : 'bg-surface border border-border text-text-muted hover:text-text'
              }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-0.5">
        {/* Header */}
        <div className="flex items-center gap-3 px-3 py-2">
          {columns.map((col) => (
            <button
              key={col.key}
              onClick={() => handleSort(col.key)}
              className={`${col.className} flex items-center gap-1 text-xs text-text-muted uppercase tracking-wider
                hover:text-text transition-colors`}
            >
              {col.label}
              {sortKey === col.key && <ArrowUpDown size={10} />}
            </button>
          ))}
        </div>

        {/* Rows */}
        {sorted.map((lead) => (
          <button
            key={lead.id}
            onClick={() => setSelectedId(lead.id === selectedId ? null : lead.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
              ${lead.id === selectedId ? 'bg-surface-elevated border border-border-light' : 'hover:bg-surface/60'}`}
          >
            {/* Name + company */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">
                {lead.name || 'Anonymous'}
              </p>
              {lead.company && (
                <p className="text-xs text-text-muted truncate">{lead.company}</p>
              )}
            </div>

            {/* Score badge */}
            <div className="w-16 flex justify-center">
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  lead.score.total >= 60
                    ? 'bg-score-high/15 text-score-high'
                    : lead.score.total >= 30
                      ? 'bg-score-mid/15 text-score-mid'
                      : 'bg-score-low/15 text-score-low'
                }`}
              >
                {lead.score.total}
              </span>
            </div>

            {/* Stage pill */}
            <div className="w-24 hidden sm:flex justify-center">
              <span
                className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full
                  ${STAGE_STYLES[lead.stage] || STAGE_STYLES.greeting}`}
              >
                {lead.stage}
              </span>
            </div>

            {/* Date */}
            <div className="w-16 text-right hidden sm:block">
              <span className="text-xs text-text-muted font-mono">{timeAgo(lead.createdAt)}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Detail panel overlay */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailPanel
            lead={selectedLead}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
