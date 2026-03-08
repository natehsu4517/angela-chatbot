import type { LeadProfile, LeadScore } from '../../src/utils/types.js'

const WEIGHTS = {
  budget: 30,
  timeline: 25,
  companySize: 20,
  painPoints: 25,
}

const BUDGET_SCORES: Record<string, number> = {
  'Under $1K': 10,
  '$1K-$5K': 40,
  '$5K-$10K': 70,
  '$10K-$25K': 90,
  '$25K+': 100,
  'Not sure': 30,
}

const TIMELINE_SCORES: Record<string, number> = {
  'ASAP': 100,
  'Within 30 days': 85,
  '1-3 months': 60,
  '3-6 months': 35,
  'Just exploring': 15,
}

const SIZE_SCORES: Record<string, number> = {
  'Just me': 20,
  '2-10': 40,
  '11-50': 65,
  '51-200': 85,
  '200+': 100,
}

export function calculateScore(lead: Partial<LeadProfile>): LeadScore {
  const budgetRaw = lead.budget ? matchClosest(lead.budget, BUDGET_SCORES) : 0
  const timelineRaw = lead.timeline ? matchClosest(lead.timeline, TIMELINE_SCORES) : 0
  const sizeRaw = lead.companySize ? matchClosest(lead.companySize, SIZE_SCORES) : 0
  const painRaw = lead.painPoints && lead.painPoints.length > 0
    ? Math.min(lead.painPoints.length * 35, 100)
    : 0

  const budget = Math.round(budgetRaw * (WEIGHTS.budget / 100))
  const timeline = Math.round(timelineRaw * (WEIGHTS.timeline / 100))
  const companySize = Math.round(sizeRaw * (WEIGHTS.companySize / 100))
  const painPoints = Math.round(painRaw * (WEIGHTS.painPoints / 100))

  return {
    total: budget + timeline + companySize + painPoints,
    breakdown: { budget: budgetRaw, timeline: timelineRaw, companySize: sizeRaw, painPoints: painRaw },
  }
}

function matchClosest(value: string, map: Record<string, number>): number {
  const lower = value.toLowerCase()
  // Exact match
  for (const [key, score] of Object.entries(map)) {
    if (key.toLowerCase() === lower) return score
  }
  // Partial match
  for (const [key, score] of Object.entries(map)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return score
  }
  return 30 // default middle score if we can't match
}
