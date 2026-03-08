import { motion } from 'framer-motion'
import type { SentimentPoint } from '../../utils/types'
import { TrendingUp } from 'lucide-react'

interface SentimentGraphProps {
  history: SentimentPoint[]
}

const W = 320
const H = 80
const PADDING_X = 12
const PADDING_Y = 8

function getMoodEmoji(value: number): string {
  if (value >= 0.5) return '😊'
  if (value >= 0.1) return '🙂'
  if (value >= -0.1) return '😐'
  if (value >= -0.5) return '😕'
  return '😟'
}

function getMoodLabel(value: number): string {
  if (value >= 0.5) return 'Positive'
  if (value >= 0.1) return 'Hopeful'
  if (value >= -0.1) return 'Neutral'
  if (value >= -0.5) return 'Cautious'
  return 'Concerned'
}

export default function SentimentGraph({ history }: SentimentGraphProps) {
  if (history.length === 0) {
    return (
      <div className="bg-surface-elevated border border-border-light rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-text-muted" />
          <p className="text-sm font-semibold font-sans text-text-muted">Conversation Mood</p>
        </div>
        <p className="text-xs text-text-muted/50 italic">Start chatting to track sentiment...</p>
      </div>
    )
  }

  const latest = history[history.length - 1]

  // Map sentiment values (-1 to 1) to SVG coordinates
  const usableW = W - PADDING_X * 2
  const usableH = H - PADDING_Y * 2
  const maxPoints = Math.max(history.length, 2)

  const points = history.map((p, i) => {
    const x = PADDING_X + (i / (maxPoints - 1)) * usableW
    const y = PADDING_Y + ((1 - p.value) / 2) * usableH // flip: 1 = top, -1 = bottom
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  // Area fill path (line path + close to bottom)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`

  return (
    <div className="bg-surface-elevated border border-border-light rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-text" />
          <p className="text-sm font-semibold font-sans">Conversation Mood</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-base">{getMoodEmoji(latest.value)}</span>
          <span className="text-xs text-text-muted">{getMoodLabel(latest.value)}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
        {/* Zero line */}
        <line
          x1={PADDING_X}
          y1={H / 2}
          x2={W - PADDING_X}
          y2={H / 2}
          stroke="var(--color-border)"
          strokeWidth="0.5"
          strokeDasharray="3 4"
        />

        {/* Area fill with gradient */}
        <defs>
          <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-score-high)" stopOpacity="0.15" />
            <stop offset="50%" stopColor="var(--color-text-muted)" stopOpacity="0.05" />
            <stop offset="100%" stopColor="var(--color-score-low)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {history.length > 1 && (
          <motion.path
            d={areaPath}
            fill="url(#sentimentGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke="var(--color-text)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 4 : 2.5}
            fill="var(--color-surface-elevated)"
            stroke="var(--color-text)"
            strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          />
        ))}

        {/* Pulsing latest point */}
        {points.length > 0 && (
          <motion.circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="4"
            fill="none"
            stroke="var(--color-text)"
            strokeWidth="1"
            animate={{ r: [4, 10], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
      </svg>
    </div>
  )
}
