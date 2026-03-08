import type { ChatResponse, TimeSlot, BookingResult, Message, LeadProfile } from './types'

// ─── Collected Data Tracker ─────────────────────────────────────────────────

interface CollectedData {
  painPoints: string[]
  company: string | null
  companySize: string | null
  budget: string | null
  timeline: string | null
  name: string | null
  email: string | null
}

// Persistent state across calls (resets on page reload)
const collected: CollectedData = {
  painPoints: [],
  company: null,
  companySize: null,
  budget: null,
  timeline: null,
  name: null,
  email: null,
}

let insightSent = false
const recentOpeners: string[] = []

// ─── Inline Data Extraction ─────────────────────────────────────────────────

function extractInlineData(message: string): Partial<LeadProfile> {
  const data: Partial<LeadProfile> = {}

  // Extract email
  const emailMatch = message.match(/[\w.-]+@[\w.-]+\.\w+/)
  if (emailMatch) data.email = emailMatch[0]

  // Extract name (after "I'm", "my name is", "name:", or before the email)
  const nameMatch = message.match(/(?:i'?m |my name is |name:?\s*)([A-Z][a-z]+(?: [A-Z][a-z]+)?)/i)
  if (nameMatch) data.name = nameMatch[1]

  // Extract budget indicators
  const budgetMatch = message.match(/\$[\d,]+k?|\d+k|\d{4,}/i)
  if (budgetMatch) {
    const raw = budgetMatch[0].toLowerCase()
    if (raw.includes('k') || parseInt(raw.replace(/\D/g, '')) >= 1000) {
      data.budget = budgetMatch[0]
    }
  }

  // Extract team size
  const sizeMatch = message.match(/(\d+)\s*(?:people|employees|team|person|staff)/i)
  if (sizeMatch) {
    const n = parseInt(sizeMatch[1])
    if (n === 1) data.companySize = 'Just me'
    else if (n <= 10) data.companySize = '2-10'
    else if (n <= 50) data.companySize = '11-50'
    else data.companySize = '51-200'
  }

  // Extract pain points
  if (/manual|reporting|spreadsheet|excel/i.test(message)) {
    data.painPoints = ['manual reporting']
  } else if (/crm|mess|data scattered|scattered data/i.test(message)) {
    data.painPoints = ['CRM chaos']
  } else if (/lead|leads|generation|pipeline/i.test(message)) {
    data.painPoints = ['lead generation']
  } else if (/automat|workflow|process/i.test(message)) {
    data.painPoints = ['process automation']
  } else if (/dashboard|analytics|report/i.test(message)) {
    data.painPoints = ['data visibility']
  }

  return data
}

// ─── Opener Rotation ────────────────────────────────────────────────────────

const OPENER_POOLS = {
  acknowledge: ['Great!', 'Love it.', 'Awesome.', 'Perfect.', 'Nice!'],
  empathize: ["Yeah, that's a real pain point.", 'I hear that a lot.', "That's super common."],
  validate: ['Smart move.', 'That makes sense.', 'Good thinking.'],
  bridge: ['Interesting —', "So here's the thing —", 'That actually connects to something —'],
  neutral: ['Got it.', 'Noted.', 'Understood.', 'Cool.'],
}

function pickOpener(pool: keyof typeof OPENER_POOLS): string {
  const options = OPENER_POOLS[pool].filter((o) => !recentOpeners.includes(o))
  const pick = options.length > 0
    ? options[Math.floor(Math.random() * options.length)]
    : OPENER_POOLS[pool][Math.floor(Math.random() * OPENER_POOLS[pool].length)]
  recentOpeners.push(pick)
  if (recentOpeners.length > 2) recentOpeners.shift()
  return pick
}

// ─── Contextual Callbacks ───────────────────────────────────────────────────

function contextualPrefix(field: string): string {
  if (field === 'budget' && collected.painPoints.length > 0) {
    const pain = collected.painPoints[0]
    return `Since you're dealing with ${pain}, projects like that typically vary in scope. `
  }
  if (field === 'timeline' && collected.budget) {
    return `With a ${collected.budget} budget in mind, `
  }
  if (field === 'companySize' && collected.company) {
    return `For a company like ${collected.company}, `
  }
  if (field === 'name' && collected.company) {
    return `Great progress so far. `
  }
  return ''
}

// ─── Personalization ────────────────────────────────────────────────────────

function personalize(message: string): string {
  let result = message
  if (collected.name && Math.random() > 0.5) {
    result = result.replace('{{name}}', collected.name)
  } else {
    result = result.replace(', {{name}}', '').replace('{{name}}, ', '').replace('{{name}}', '')
  }
  if (collected.company) {
    result = result.replace('{{company}}', collected.company)
  } else {
    result = result.replace(' at {{company}}', '').replace('{{company}}', 'your company')
  }
  return result
}

// ─── Objection Handling ─────────────────────────────────────────────────────

interface Objection {
  pattern: RegExp
  response: string
  sentiment: number
}

const OBJECTIONS: Objection[] = [
  {
    pattern: /too expensive|can't afford|out of budget|costly|pricey/i,
    response: "I totally get that — budget matters. We actually have flexible options and can scope things to fit different ranges. What budget range would feel comfortable for you?",
    sentiment: -0.3,
  },
  {
    pattern: /not sure|maybe|just browsing|exploring|thinking about it/i,
    response: "No pressure at all! I'm just here to help you think it through. What's the main thing you're trying to figure out?",
    sentiment: -0.1,
  },
  {
    pattern: /don't have time|too busy|not now|later/i,
    response: "Completely understand. Even a quick 15-minute call could save you hours down the road. But no rush — what's the best way to follow up when you're ready?",
    sentiment: -0.2,
  },
  {
    pattern: /not interested|no thanks|pass/i,
    response: "Fair enough! If anything changes, we're always here. Is there anything else I can help with before you go?",
    sentiment: -0.4,
  },
]

// ─── Question Templates (State Machine) ─────────────────────────────────────

interface QuestionTemplate {
  field: keyof CollectedData
  message: string
  quickReplies: string[]
  quickReplyContext: string
  openerPool: keyof typeof OPENER_POOLS
  scoreBreakdown: { budget: number; timeline: number; companySize: number; painPoints: number }
  sentiment: number
}

const QUESTIONS: QuestionTemplate[] = [
  {
    field: 'painPoints',
    message: "So tell me, what kind of challenge are you looking to solve? Are you dealing with manual processes, data scattered across tools, or something else?",
    quickReplies: ['Manual reporting', 'CRM is a mess', 'Need more leads'],
    quickReplyContext: 'Common business challenges',
    openerPool: 'acknowledge',
    scoreBreakdown: { budget: 0, timeline: 0, companySize: 0, painPoints: 0 },
    sentiment: 0.5,
  },
  {
    field: 'company',
    message: "what's your company name? I want to make sure I'm giving you relevant suggestions.",
    quickReplies: [],
    quickReplyContext: '',
    openerPool: 'empathize',
    scoreBreakdown: { budget: 0, timeline: 0, companySize: 0, painPoints: 35 },
    sentiment: 0.3,
  },
  {
    field: 'companySize',
    message: "how many people are on your team?",
    quickReplies: ['Just me', '2-10', '11-50', '51-200'],
    quickReplyContext: 'Standard team size ranges',
    openerPool: 'neutral',
    scoreBreakdown: { budget: 0, timeline: 0, companySize: 0, painPoints: 35 },
    sentiment: 0.3,
  },
  {
    field: 'budget',
    message: "{{name}}, what kind of budget are you working with for a project like this?",
    quickReplies: ['Under $1K', '$1K-$5K', '$5K-$10K', '$10K-$25K'],
    quickReplyContext: 'Typical project budget ranges',
    openerPool: 'validate',
    scoreBreakdown: { budget: 0, timeline: 0, companySize: 65, painPoints: 35 },
    sentiment: 0.4,
  },
  {
    field: 'timeline',
    message: "what's your timeline looking like? When are you hoping to have this up and running?",
    quickReplies: ['ASAP', 'Within 30 days', '1-3 months', 'Just exploring'],
    quickReplyContext: 'Based on your budget range',
    openerPool: 'bridge',
    scoreBreakdown: { budget: 70, timeline: 0, companySize: 65, painPoints: 35 },
    sentiment: 0.5,
  },
  {
    field: 'name',
    message: "Almost done! What's your name and best email to reach you?",
    quickReplies: [],
    quickReplyContext: '',
    openerPool: 'acknowledge',
    scoreBreakdown: { budget: 70, timeline: 85, companySize: 65, painPoints: 35 },
    sentiment: 0.6,
  },
]

// ─── Score Calculation ──────────────────────────────────────────────────────

function calculateScore(): { total: number; breakdown: { budget: number; timeline: number; companySize: number; painPoints: number } } {
  const breakdown = {
    painPoints: collected.painPoints.length > 0 ? 35 : 0,
    companySize: collected.companySize ? 65 : 0,
    budget: collected.budget ? 70 : 0,
    timeline: collected.timeline ? 85 : 0,
  }
  const total = Math.round(
    breakdown.painPoints * 0.25 +
    breakdown.companySize * 0.20 +
    breakdown.budget * 0.30 +
    breakdown.timeline * 0.25
  )
  return { total, breakdown }
}

function filledFieldCount(): number {
  let count = 0
  if (collected.painPoints.length > 0) count++
  if (collected.company) count++
  if (collected.companySize) count++
  if (collected.budget) count++
  if (collected.timeline) count++
  if (collected.name || collected.email) count++
  return count
}

// ─── Initial Greeting Handler ───────────────────────────────────────────────

function isGreeting(message: string): boolean {
  return /^(let'?s go|sure|yes|hello|hi|hey|start|ok|okay|yep|yeah|ready)/i.test(message.trim())
}

function isServiceQuestion(message: string): boolean {
  return /what do you do|services|offer|help me|what can you/i.test(message)
}

function isPainPointPhrase(message: string): boolean {
  return /^(manual reporting|crm is a mess|need more leads|need automation|looking for a dashboard|crm help|data dashboard|lead generation)/i.test(message.trim())
}

// ─── Main Mock Send ─────────────────────────────────────────────────────────

export async function mockSendMessage(
  _messages: Pick<Message, 'role' | 'content'>[],
  userMessage: string
): Promise<ChatResponse> {
  // Small delay to simulate network (typing delay handled by useChat)
  await new Promise((r) => setTimeout(r, 100))

  // ── Step 1: Extract inline data from user message ──
  const inlineData = extractInlineData(userMessage)

  // Merge inline data into collected state
  if (inlineData.painPoints) {
    for (const p of inlineData.painPoints) {
      if (!collected.painPoints.includes(p)) collected.painPoints.push(p)
    }
  }
  if (inlineData.company) collected.company = inlineData.company
  if (inlineData.companySize) collected.companySize = inlineData.companySize
  if (inlineData.budget) collected.budget = inlineData.budget
  if (inlineData.name) collected.name = inlineData.name
  if (inlineData.email) collected.email = inlineData.email

  // If the message looks like a company name (starts uppercase, no other data extracted from it)
  const hasOtherData = !!(inlineData.painPoints || inlineData.companySize || inlineData.budget || inlineData.name || inlineData.email)
  if (
    !collected.company &&
    !hasOtherData &&
    /^[A-Z][a-zA-Z]/.test(userMessage.trim()) &&
    !isGreeting(userMessage) &&
    !isServiceQuestion(userMessage) &&
    !isPainPointPhrase(userMessage)
  ) {
    collected.company = userMessage.trim()
    inlineData.company = userMessage.trim()
  }

  // If quick reply matched a team size
  if (/^(just me|2-10|11-50|51-200)$/i.test(userMessage.trim())) {
    collected.companySize = userMessage.trim()
    inlineData.companySize = userMessage.trim()
  }

  // If quick reply matched a budget
  if (/^(under \$1k|\$1k-\$5k|\$5k-\$10k|\$10k-\$25k)$/i.test(userMessage.trim())) {
    collected.budget = userMessage.trim()
    inlineData.budget = userMessage.trim()
  }

  // If quick reply matched a timeline
  if (/^(asap|within 30 days|1-3 months|just exploring)$/i.test(userMessage.trim())) {
    collected.timeline = userMessage.trim()
    inlineData.timeline = userMessage.trim()
  }

  // ── Step 2: Handle greetings / service questions ──
  if (isGreeting(userMessage) && collected.painPoints.length === 0 && !collected.company) {
    return {
      message: "Great! So tell me, what kind of challenge are you looking to solve? Are you dealing with manual processes, data scattered across tools, or something else?",
      quickReplies: ['Manual reporting', 'CRM is a mess', 'Need more leads'],
      quickReplyContext: 'Common business challenges',
      leadData: {},
      score: { total: 5, breakdown: { budget: 0, timeline: 0, companySize: 0, painPoints: 0 } },
      stage: 'qualifying',
      shouldBook: false,
      sentiment: 0.6,
      progress: { current: 0, total: 6 },
    }
  }

  if (isServiceQuestion(userMessage)) {
    return {
      message: "Nate builds custom data pipelines, dashboards, web scrapers, and business websites. He's worked with consulting firms, real estate companies, and startups. What's the challenge you're trying to solve?",
      quickReplies: ['Data is scattered', 'Need a dashboard', 'Need leads'],
      quickReplyContext: "Nate's core services",
      leadData: {},
      score: { total: 5, breakdown: { budget: 0, timeline: 0, companySize: 0, painPoints: 0 } },
      stage: 'qualifying',
      shouldBook: false,
      sentiment: 0.4,
      progress: { current: 0, total: 6 },
    }
  }

  // ── Step 3: Check for objections ──
  for (const objection of OBJECTIONS) {
    if (objection.pattern.test(userMessage)) {
      const score = calculateScore()
      return {
        message: objection.response,
        quickReplies: ['Tell me more', 'I have a question'],
        quickReplyContext: 'No pressure',
        leadData: {},
        score,
        stage: 'qualifying',
        shouldBook: false,
        sentiment: objection.sentiment,
        progress: { current: filledFieldCount(), total: 6 },
      }
    }
  }

  // ── Step 4: Build lead data from what was extracted ──
  const leadData: Partial<LeadProfile> = {}
  if (inlineData.painPoints) leadData.painPoints = inlineData.painPoints
  if (inlineData.company) leadData.company = inlineData.company
  if (inlineData.companySize) leadData.companySize = inlineData.companySize
  if (inlineData.budget) leadData.budget = inlineData.budget
  if (inlineData.name) leadData.name = inlineData.name
  if (inlineData.email) leadData.email = inlineData.email

  // ── Step 5: Check if we should send an insight card ──
  const score = calculateScore()
  let pendingInsight: string | undefined
  if (!insightSent && score.total >= 30 && filledFieldCount() >= 3) {
    insightSent = true
    const insights: string[] = []
    if (collected.company) insights.push(`Company: ${collected.company}`)
    if (collected.painPoints.length > 0) insights.push(`Challenge: ${collected.painPoints.join(', ')}`)
    if (collected.companySize) insights.push(`Team: ${collected.companySize}`)
    if (collected.budget) insights.push(`Budget: ${collected.budget}`)
    pendingInsight = `Here's what I've gathered so far:\n${insights.map(i => `• ${i}`).join('\n')}`
  }

  // ── Step 6: All fields collected → booking ──
  if (filledFieldCount() >= 5 && (collected.name || collected.email)) {
    return {
      message: personalize("{{name}}, based on what you've shared, I think a quick discovery call would be really valuable. Want to pick a time that works for you?"),
      quickReplies: [],
      insightCard: pendingInsight,
      leadData,
      score: { total: 82, breakdown: { budget: 70, timeline: 85, companySize: 65, painPoints: 35 } },
      stage: 'booking',
      shouldBook: true,
      sentiment: 0.9,
      progress: { current: 6, total: 6 },
    }
  }

  if (filledFieldCount() >= 5) {
    // Have everything except name/email
    return {
      message: personalize(`${pickOpener('acknowledge')} Almost there. What's your name and best email to reach you?`),
      quickReplies: [],
      insightCard: pendingInsight,
      leadData,
      score: { ...score, total: Math.min(score.total + 5, 75) },
      stage: 'qualifying',
      shouldBook: false,
      sentiment: 0.6,
      progress: { current: filledFieldCount(), total: 6 },
    }
  }

  // ── Step 7: Find next question to ask ──
  const fieldOrder: (keyof CollectedData)[] = ['painPoints', 'company', 'companySize', 'budget', 'timeline', 'name']
  let nextQuestion: QuestionTemplate | null = null

  for (const field of fieldOrder) {
    if (field === 'painPoints' && collected.painPoints.length > 0) continue
    if (field === 'name' && (collected.name || collected.email)) continue
    if (field !== 'painPoints' && field !== 'name' && collected[field]) continue

    nextQuestion = QUESTIONS.find((q) => q.field === field) || null
    if (nextQuestion) break
  }

  if (!nextQuestion) {
    // Fallback — shouldn't reach here normally
    return {
      message: personalize("Interesting! Tell me more about what you're looking for, {{name}}."),
      quickReplies: ['Need automation', 'Data dashboard', 'Lead generation'],
      quickReplyContext: 'Popular services',
      insightCard: pendingInsight,
      leadData,
      score,
      stage: 'qualifying',
      shouldBook: false,
      sentiment: 0.2,
      progress: { current: filledFieldCount(), total: 6 },
    }
  }

  // ── Step 8: Build response with opener + context + personalization ──
  const opener = pickOpener(pendingInsight ? 'neutral' : nextQuestion.openerPool)
  const context = pendingInsight ? '' : contextualPrefix(nextQuestion.field)
  const baseMessage = personalize(nextQuestion.message)
  // Capitalize the question start when there's no contextual prefix bridging into it
  const question = context ? baseMessage : baseMessage.charAt(0).toUpperCase() + baseMessage.slice(1)
  const fullMessage = `${opener} ${context}${question}`

  return {
    message: fullMessage,
    quickReplies: nextQuestion.quickReplies,
    quickReplyContext: nextQuestion.quickReplyContext || undefined,
    insightCard: pendingInsight,
    leadData,
    score,
    stage: 'qualifying',
    shouldBook: false,
    sentiment: nextQuestion.sentiment,
    progress: { current: filledFieldCount(), total: 6 },
  }
}

// ─── Availability & Booking (unchanged) ─────────────────────────────────────

export async function mockGetAvailability(_date: string): Promise<TimeSlot[]> {
  await new Promise((r) => setTimeout(r, 300))
  return [
    { start: '09:00', end: '09:30' },
    { start: '09:30', end: '10:00' },
    { start: '10:00', end: '10:30' },
    { start: '11:00', end: '11:30' },
    { start: '13:00', end: '13:30' },
    { start: '14:00', end: '14:30' },
    { start: '15:30', end: '16:00' },
    { start: '16:00', end: '16:30' },
  ]
}

export async function mockBookMeeting(
  date: string,
  startTime: string,
  _name: string,
  _email: string
): Promise<BookingResult> {
  await new Promise((r) => setTimeout(r, 500))
  return {
    success: true,
    meetLink: 'https://meet.google.com/abc-defg-hij',
    eventTime: `${startTime} ET`,
    eventDate: date,
  }
}
