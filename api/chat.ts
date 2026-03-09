import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT } from './_lib/prompts.js'
import { calculateScore } from './_lib/scoring.js'

export const maxDuration = 30

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

type ParseState = 'BEFORE_MESSAGE' | 'IN_MESSAGE' | 'AFTER_MESSAGE' | 'IN_METADATA' | 'DONE'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, userMessage, pageContext } = req.body || {}

  if (!userMessage || typeof userMessage !== 'string') {
    return res.status(400).json({ error: 'userMessage is required' })
  }

  // Build system prompt with optional page context
  let systemPrompt = SYSTEM_PROMPT
  if (pageContext && typeof pageContext === 'object') {
    const parts: string[] = []
    if (pageContext.url) parts.push(`URL: ${pageContext.url}`)
    if (pageContext.section) parts.push(`Section: "${pageContext.section}"`)
    if (pageContext.projectViewing) parts.push(`Viewing project: "${pageContext.projectViewing}"`)
    if (parts.length > 0) {
      systemPrompt += `\n\n## Current Page Context\nThe visitor is on: ${parts.join('. ')}.\nReference this naturally if relevant, but don't force it.`
    }
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  try {
    const conversationMessages: Anthropic.MessageParam[] = (messages || []).map(
      (m: { role: string; content: string }) => ({
        role: m.role === 'agent' ? 'assistant' : 'user',
        content: m.content,
      })
    )
    conversationMessages.push({ role: 'user', content: userMessage })

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationMessages,
    })

    let fullText = ''
    let state: ParseState = 'BEFORE_MESSAGE'
    let buffer = ''
    let metadataBuffer = ''

    const MSG_OPEN = '<message>'
    const MSG_CLOSE = '</message>'
    const META_OPEN = '<metadata>'
    const META_CLOSE = '</metadata>'

    stream.on('text', (text) => {
      fullText += text

      for (const char of text) {
        switch (state) {
          case 'BEFORE_MESSAGE':
            buffer += char
            if (buffer.endsWith(MSG_OPEN)) {
              state = 'IN_MESSAGE'
              buffer = ''
            }
            if (buffer.length > MSG_OPEN.length * 2) {
              buffer = buffer.slice(-MSG_OPEN.length)
            }
            break

          case 'IN_MESSAGE':
            buffer += char
            if (buffer.endsWith(MSG_CLOSE)) {
              // Flush everything before the close tag
              const content = buffer.slice(0, -MSG_CLOSE.length)
              if (content) {
                res.write(`event: token\ndata: ${JSON.stringify({ text: content })}\n\n`)
              }
              state = 'AFTER_MESSAGE'
              buffer = ''
            } else if (buffer.length > MSG_CLOSE.length + 20) {
              // Flush safe portion (keep enough to detect the close tag)
              const safeLen = buffer.length - MSG_CLOSE.length
              const safe = buffer.slice(0, safeLen)
              res.write(`event: token\ndata: ${JSON.stringify({ text: safe })}\n\n`)
              buffer = buffer.slice(safeLen)
            }
            break

          case 'AFTER_MESSAGE':
            buffer += char
            if (buffer.endsWith(META_OPEN)) {
              state = 'IN_METADATA'
              metadataBuffer = ''
              buffer = ''
            }
            break

          case 'IN_METADATA':
            metadataBuffer += char
            if (metadataBuffer.endsWith(META_CLOSE)) {
              metadataBuffer = metadataBuffer.slice(0, -META_CLOSE.length)
              state = 'DONE'
            }
            break

          case 'DONE':
            break
        }
      }
    })

    stream.on('end', () => {
      // Flush any remaining message buffer
      if (buffer.length > 0 && state === 'IN_MESSAGE') {
        const content = buffer.replace(new RegExp(MSG_CLOSE.replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&') + '$'), '')
        if (content) {
          res.write(`event: token\ndata: ${JSON.stringify({ text: content })}\n\n`)
        }
      }

      // Parse metadata
      let parsed: Record<string, unknown> = {}
      try {
        const jsonStr = metadataBuffer.trim()
        if (jsonStr) {
          parsed = JSON.parse(jsonStr)
        }
      } catch {
        // Fallback: try parsing fullText as JSON (for non-XML responses)
        try {
          let jsonStr = fullText.trim()
          if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
          }
          parsed = JSON.parse(jsonStr)
          // If we got here, the whole response was JSON. Stream the message.
          if (parsed.message) {
            res.write(`event: token\ndata: ${JSON.stringify({ text: parsed.message as string })}\n\n`)
          }
        } catch {
          // Complete fallback: treat fullText as the message
          if (!fullText.includes('<message>')) {
            res.write(`event: token\ndata: ${JSON.stringify({ text: fullText.trim() })}\n\n`)
          }
        }
      }

      const leadData = (parsed.leadData || {}) as Record<string, unknown>
      const score = calculateScore(leadData as any)
      const filledCount = countFilledFields(leadData)
      const progress = { current: filledCount, total: 6 }

      let stage = 'qualifying'
      if (parsed.shouldBook) {
        stage = 'booking'
      } else if (score.total < 20 && conversationMessages.length > 8) {
        stage = 'nurture'
      }

      const metadata = {
        quickReplies: (parsed.quickReplies as string[]) || [],
        quickReplyContext: parsed.quickReplyContext || undefined,
        leadData,
        shouldBook: parsed.shouldBook || false,
        sentiment: (parsed.sentiment as number) ?? 0,
        insightSummary: parsed.insightSummary || undefined,
        score,
        stage,
        progress,
      }

      res.write(`event: done\ndata: ${JSON.stringify(metadata)}\n\n`)
      res.end()
    })

    stream.on('error', (err) => {
      console.error('Stream error:', err)
      const fallback = {
        score: { total: 0, breakdown: { budget: 0, timeline: 0, companySize: 0, painPoints: 0 } },
        stage: 'qualifying',
        progress: { current: 0, total: 6 },
        leadData: {},
        shouldBook: false,
        sentiment: 0,
        quickReplies: [],
      }
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Stream failed' })}\n\n`)
      res.write(`event: done\ndata: ${JSON.stringify(fallback)}\n\n`)
      res.end()
    })

  } catch (err: any) {
    console.error('Chat API error:', err)
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to process message' })}\n\n`)
    res.end()
  }
}
