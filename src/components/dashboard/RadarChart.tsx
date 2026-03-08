import { motion } from 'framer-motion'
import type { LeadScore } from '../../utils/types'
import { Activity } from 'lucide-react'

interface RadarChartProps {
  score: LeadScore
}

const AXES = [
  { key: 'budget', label: 'Budget' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'painPoints', label: 'Pain Points' },
  { key: 'companySize', label: 'Size' },
] as const

const CX = 100
const CY = 100
const R = 70
const RINGS = [0.25, 0.5, 0.75, 1]

function polarToCartesian(cx: number, cy: number, r: number, axisIndex: number, total: number) {
  const angle = (2 * Math.PI * axisIndex) / total - Math.PI / 2
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  }
}

export default function RadarChart({ score }: RadarChartProps) {
  const values = AXES.map((a) => score.breakdown[a.key])
  const points = values
    .map((v, i) => {
      const { x, y } = polarToCartesian(CX, CY, (v / 100) * R, i, AXES.length)
      return `${x},${y}`
    })
    .join(' ')

  const scoreColor =
    score.total >= 60
      ? 'text-score-high'
      : score.total >= 30
        ? 'text-score-mid'
        : 'text-score-low'

  return (
    <div className="bg-surface-elevated border border-border-light rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-text" />
        <h3 className="text-base font-semibold font-sans">Lead Score</h3>
      </div>

      <div className="flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-48 h-48">
          {/* Guide rings */}
          {RINGS.map((pct) => (
            <polygon
              key={pct}
              points={AXES.map((_, i) => {
                const { x, y } = polarToCartesian(CX, CY, pct * R, i, AXES.length)
                return `${x},${y}`
              }).join(' ')}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="0.5"
              strokeDasharray={pct < 1 ? '2 3' : 'none'}
              opacity={pct < 1 ? 0.5 : 0.8}
            />
          ))}

          {/* Axis lines */}
          {AXES.map((_, i) => {
            const { x, y } = polarToCartesian(CX, CY, R, i, AXES.length)
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={x}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth="0.5"
                opacity="0.5"
              />
            )
          })}

          {/* Filled area */}
          <motion.polygon
            points={points}
            fill="var(--color-text)"
            fillOpacity={0.08}
            stroke="var(--color-text)"
            strokeOpacity={0.4}
            strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Data points */}
          {values.map((v, i) => {
            const { x, y } = polarToCartesian(CX, CY, (v / 100) * R, i, AXES.length)
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                fill="var(--color-text)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: v > 0 ? 1 : 0, scale: v > 0 ? 1 : 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              />
            )
          })}

          {/* Axis labels */}
          {AXES.map((axis, i) => {
            const { x, y } = polarToCartesian(CX, CY, R + 16, i, AXES.length)
            return (
              <text
                key={axis.key}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--color-text-muted)"
                fontSize="9"
                fontFamily="var(--font-sans)"
                className="uppercase"
                letterSpacing="0.05em"
              >
                {axis.label}
              </text>
            )
          })}

          {/* Center score */}
          <text
            x={CX}
            y={CY - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-text)"
            fontSize="24"
            fontWeight="bold"
            fontFamily="var(--font-sans)"
          >
            {score.total}
          </text>
          <text
            x={CX}
            y={CY + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--color-text-muted)"
            fontSize="8"
            fontFamily="var(--font-sans)"
            className="uppercase"
            letterSpacing="0.1em"
          >
            SCORE
          </text>
        </svg>
      </div>

      {/* Mini breakdown below */}
      <div className="grid grid-cols-4 gap-1.5 mt-2">
        {AXES.map((axis) => {
          const val = score.breakdown[axis.key]
          return (
            <div key={axis.key} className="text-center">
              <p className="text-xs text-text-muted mb-1">{axis.label}</p>
              <motion.p
                key={val}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-sm font-mono font-medium ${scoreColor}`}
              >
                {val}
              </motion.p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
