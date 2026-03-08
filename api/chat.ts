import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from './_lib/prompts.js'
import { calculateScore } from './_lib/scoring.js'

const client = new Anthropic()

function countFilledFields(leadData: Record<string, unknown>): number {
  let count = 0
  if (leadData.painPoints && Array.isArray(leadData.painPoints) && leadData.painPoints.length > 0) count++
  if (leadData.company) count++
  if (leadData.companySize) count++
  if (leadData.budget) count++
  if (leadData.timeline) count++
  if (leadData.name || leadData.email) count++
  return count
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, userMessage } = req.body || {}

  if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'userMessage is required' })
  }

  try {
    // Build conversation history for Claude
    const conversationMessages: Anthropic.MessageParam[] = (messages || []).map(
      (m: { role: string; content: string }) => ({
        role: m.role === 'agent' ? 'assistant' : 'user',
        content: m.content,
      })
    )

    // Add current user message
    conversationMessages.push({ role: 'user', content: userMessage })

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: conversationMessages,
    })

    // Extract text response
    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Parse JSON response
    let parsed
    try {
      // Handle cases where Claude wraps in markdown code blocks
      let jsonStr = textBlock.text.trim()
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      parsed = JSON.parse(jsonStr)
    } catch {
      // If JSON parsing fails, return the raw text as a message
      return res.json({
        message: textBlock.text,
        quickReplies: [],
        leadData: {},
        score: { total: 0, breakdown: { budget: 0, timeline: 0, companySize: 0, painPoints: 0 } },
        stage: 'qualifying',
        shouldBook: false,
        sentiment: 0,
        progress: { current: 0, total: 6 },
      })
    }

    const leadData = parsed.leadData || {}

    // Calculate score from accumulated lead data
    const score = calculateScore(leadData)

    // Compute progress from filled fields
    const filledCount = countFilledFields(leadData)
    const progress = { current: filledCount, total: 6 }

    // Determine stage
    let stage = 'qualifying'
    if (parsed.shouldBook) {
      stage = 'booking'
    } else if (score.total < 20 && conversationMessages.length > 8) {
      stage = 'nurture'
    }

    return res.json({
      message: parsed.message,
      quickReplies: parsed.quickReplies || [],
      quickReplyContext: parsed.quickReplyContext || undefined,
      leadData,
      score,
      stage,
      shouldBook: parsed.shouldBook || false,
      sentiment: parsed.sentiment ?? 0,
      insightCard: parsed.insightSummary || undefined,
      progress,
    })
  } catch (err: any) {
    console.error('Chat API error:', err)
    return res.status(500).json({ error: 'Failed to process message' })
  }
}
