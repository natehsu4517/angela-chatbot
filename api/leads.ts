import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_lib/supabase.js'
import {
  checkAdminAuth,
  checkOrigin,
  handlePreflight,
  rateLimit,
  sanitizeString,
  sanitizeEmail,
  setSecurityHeaders,
} from './_lib/security.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res)
  if (handlePreflight(req, res)) return
  if (!checkOrigin(req, res)) return
  if (!rateLimit(req, res, { maxRequests: 30, windowMs: 60_000 })) return

  const supabase = getSupabase()

  if (req.method === 'GET') {
    if (!checkAdminAuth(req, res)) return

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to fetch leads' })
    }
    return res.json({ leads: data })
  }

  if (req.method === 'POST') {
    const { leadProfile, score, conversation, status } = req.body || {}

    const name = sanitizeString(leadProfile?.name, 100)
    const email = sanitizeEmail(leadProfile?.email)
    const company = sanitizeString(leadProfile?.company, 100)
    const budget = sanitizeString(leadProfile?.budget, 50)
    const timeline = sanitizeString(leadProfile?.timeline, 50)
    const companySize = sanitizeString(leadProfile?.companySize, 50)
    const painPoints = Array.isArray(leadProfile?.painPoints)
      ? leadProfile.painPoints.slice(0, 10).map((p: unknown) => sanitizeString(p, 100))
      : []
    const safeConversation = Array.isArray(conversation) ? conversation.slice(0, 50) : []
    const safeScore = typeof score?.total === 'number' ? Math.min(Math.max(score.total, 0), 100) : 0
    const safeStatus = ['qualifying', 'qualified', 'booking', 'booked', 'nurture'].includes(status)
      ? status
      : 'qualifying'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('leads')
      .insert({
        name: name || null,
        email: email || null,
        company: company || null,
        budget: budget || null,
        timeline: timeline || null,
        company_size: companySize || null,
        pain_points: painPoints,
        score: safeScore,
        status: safeStatus,
        conversation: safeConversation,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({ error: 'Failed to save lead' })
    }
    return res.json({ lead: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
