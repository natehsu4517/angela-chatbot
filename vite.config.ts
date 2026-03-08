import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

// Dev-only plugin: intercepts /api/chat and calls Claude directly
function apiProxy(): Plugin {
  return {
    name: 'api-proxy',
    configureServer(server) {
      // Load env including .env.local
      const env = loadEnv('development', process.cwd(), '')

      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/chat' || req.method !== 'POST') return next()

        const apiKey = env.ANTHROPIC_API_KEY
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in .env.local' }))
          return
        }

        // Read body
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const body = JSON.parse(Buffer.concat(chunks).toString())

        const { messages = [], userMessage } = body
        if (!userMessage) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'userMessage required' }))
          return
        }

        try {
          // Import the prompt and scoring from the API lib
          const { SYSTEM_PROMPT } = await import('./api/_lib/prompts.js')
          const { calculateScore } = await import('./api/_lib/scoring.js')

          // Build conversation for Claude
          const conversationMessages = messages.map((m: { role: string; content: string }) => ({
            role: m.role === 'agent' ? 'assistant' : 'user',
            content: m.content,
          }))
          conversationMessages.push({ role: 'user', content: userMessage })

          // Call Claude API directly
          const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 1024,
              system: SYSTEM_PROMPT,
              messages: conversationMessages,
            }),
          })

          if (!apiRes.ok) {
            const err = await apiRes.text()
            console.error('Claude API error:', apiRes.status, err)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Claude API call failed' }))
            return
          }

          const claudeRes = await apiRes.json() as { content: Array<{ type: string; text?: string }> }
          const textBlock = claudeRes.content.find((b) => b.type === 'text')
          if (!textBlock?.text) throw new Error('No text response')

          // Parse JSON from Claude
          let parsed
          try {
            let jsonStr = textBlock.text.trim()
            if (jsonStr.startsWith('```')) {
              jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
            }
            parsed = JSON.parse(jsonStr)
          } catch {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({
              message: textBlock.text,
              quickReplies: [],
              leadData: {},
              score: { total: 0, breakdown: { budget: 0, timeline: 0, companySize: 0, painPoints: 0 } },
              stage: 'qualifying',
              shouldBook: false,
              sentiment: 0,
              progress: { current: 0, total: 6 },
            }))
            return
          }

          const leadData = parsed.leadData || {}
          const score = calculateScore(leadData)

          // Count filled fields for progress
          let filledCount = 0
          if (leadData.painPoints?.length > 0) filledCount++
          if (leadData.company) filledCount++
          if (leadData.companySize) filledCount++
          if (leadData.budget) filledCount++
          if (leadData.timeline) filledCount++
          if (leadData.name || leadData.email) filledCount++

          let stage = 'qualifying'
          if (parsed.shouldBook) stage = 'booking'
          else if (score.total < 20 && conversationMessages.length > 8) stage = 'nurture'

          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            message: parsed.message,
            quickReplies: parsed.quickReplies || [],
            quickReplyContext: parsed.quickReplyContext || undefined,
            leadData,
            score,
            stage,
            shouldBook: parsed.shouldBook || false,
            sentiment: parsed.sentiment ?? 0,
            insightCard: parsed.insightSummary || undefined,
            progress: { current: filledCount, total: 6 },
          }))
        } catch (err) {
          console.error('API proxy error:', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Internal error' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiProxy()],
})
