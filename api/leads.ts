import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSupabase } from './_lib/supabase.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const supabase = getSupabase()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ leads: data })
  }

  if (req.method === 'POST') {
    const { leadProfile, score, conversation, status } = req.body || {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('leads')
      .insert({
        name: leadProfile?.name,
        email: leadProfile?.email,
        company: leadProfile?.company,
        budget: leadProfile?.budget,
        timeline: leadProfile?.timeline,
        company_size: leadProfile?.companySize,
        pain_points: leadProfile?.painPoints || [],
        score: score?.total || 0,
        status: status || 'qualifying',
        conversation: conversation || [],
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ lead: data })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
