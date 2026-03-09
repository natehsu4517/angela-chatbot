import type { DemoLead, Activity, LeadScore } from '../utils/types'

const now = Date.now()
const day = 86_400_000

function score(budget: number, timeline: number, companySize: number, painPoints: number): LeadScore {
  return {
    total: Math.round(budget * 0.3 + timeline * 0.25 + companySize * 0.2 + painPoints * 0.25),
    breakdown: { budget, timeline, companySize, painPoints },
  }
}

export const MOCK_LEADS: DemoLead[] = [
  // ── Booked (4) ──
  {
    id: 'lead-01',
    name: 'Sarah Chen',
    email: 'sarah@apexlogistics.com',
    company: 'Apex Logistics',
    budget: '$10K-$25K',
    timeline: 'Within 30 days',
    companySize: '51-200',
    painPoints: ['data silos', 'manual reporting'],
    score: score(90, 85, 85, 70),
    stage: 'booked',
    createdAt: now - 1.2 * day,
    timeToQualify: 8,
    messageCount: 7,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela, Nate's assistant. What kind of problem are you looking to solve?" },
      { role: 'user', content: "We have data in 4 different tools and nobody can get a clear picture of what's happening." },
      { role: 'agent', content: "That sounds a lot like what Nate built for a consulting firm. They had the same scattered data problem. By the way, what's your name?" },
      { role: 'user', content: "Sarah, from Apex Logistics." },
      { role: 'agent', content: "Nice to meet you, Sarah. How big is the team at Apex?" },
      { role: 'user', content: "About 120 people. We need this fixed within the month honestly." },
      { role: 'agent', content: "Nate can walk you through exactly how he'd tackle this. What's your best email?" },
    ],
  },
  {
    id: 'lead-02',
    name: 'Marcus Rivera',
    email: 'marcus@cloudvault.io',
    company: 'Cloudvault',
    budget: '$5K-$10K',
    timeline: 'ASAP',
    companySize: '11-50',
    painPoints: ['need dashboard', 'spreadsheet hell'],
    score: score(70, 100, 65, 70),
    stage: 'booked',
    createdAt: now - 2.1 * day,
    timeToQualify: 6,
    messageCount: 8,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela, Nate's assistant. What brings you here today?" },
      { role: 'user', content: "I'm drowning in spreadsheets. Need a real dashboard yesterday." },
      { role: 'agent', content: "Nate actually built a real-time dashboard for a business owner who was in the exact same spot. Who am I chatting with?" },
      { role: 'user', content: "Marcus, Cloudvault." },
      { role: 'agent', content: "Hey Marcus. How big is the Cloudvault team?" },
      { role: 'user', content: "32 people. We're growing fast and the spreadsheets can't keep up." },
      { role: 'agent', content: "What's your budget range for this?" },
      { role: 'user', content: "Probably 5 to 10K. We need it ASAP though." },
    ],
  },
  {
    id: 'lead-03',
    name: 'Emily Tran',
    email: 'emily@brightwellcapital.com',
    company: 'Brightwell Capital',
    budget: '$25K+',
    timeline: '1-3 months',
    companySize: '200+',
    painPoints: ['duplicate contacts', 'data silos', 'manual reporting'],
    score: score(100, 60, 100, 100),
    stage: 'booked',
    createdAt: now - 0.5 * day,
    timeToQualify: 11,
    messageCount: 8,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela, Nate's assistant. What can I help you with?" },
      { role: 'user', content: "We need someone to consolidate our CRM, marketing platform, and accounting tool into one source of truth." },
      { role: 'agent', content: "That's right in Nate's wheelhouse. He built a data command center for a consulting firm, syncing 4 tools with deduplication. What's your name?" },
      { role: 'user', content: "Emily Tran, Brightwell Capital." },
      { role: 'agent', content: "Great to meet you Emily. How many people at Brightwell?" },
      { role: 'user', content: "About 300. We have duplicate contacts everywhere and it's costing us deals." },
      { role: 'agent', content: "That's exactly the problem the deduplication engine solved. What's the budget looking like for this?" },
      { role: 'user', content: "Budget isn't really the issue, maybe 25K+. We just want it done right in the next couple months." },
    ],
  },
  {
    id: 'lead-04',
    name: 'Derek Owens',
    email: 'derek@suncoastroofing.com',
    company: 'Suncoast Roofing',
    budget: '$1K-$5K',
    timeline: 'Within 30 days',
    companySize: '2-10',
    painPoints: ['need website', 'lead gen'],
    score: score(40, 85, 40, 70),
    stage: 'booked',
    createdAt: now - 3 * day,
    timeToQualify: 5,
    messageCount: 6,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela, Nate's assistant. What are you looking for?" },
      { role: 'user', content: "I need a website that actually brings in leads. Our current one does nothing." },
      { role: 'agent', content: "Nate built an 18-page site with multiple conversion funnels for a consulting firm. What's your name?" },
      { role: 'user', content: "Derek, Suncoast Roofing. Small company, just 6 of us." },
      { role: 'agent', content: "Got it Derek. What kind of budget are you working with?" },
      { role: 'user', content: "Probably 2 to 4 thousand. Need it done within the month though, our busy season is coming." },
    ],
  },

  // ── Qualified (5) ──
  {
    id: 'lead-05',
    name: 'Lisa Patel',
    email: 'lisa@meridianhealth.org',
    company: 'Meridian Health',
    budget: '$10K-$25K',
    timeline: '1-3 months',
    companySize: '51-200',
    painPoints: ['manual reporting', 'no dashboard'],
    score: score(90, 60, 85, 70),
    stage: 'qualifying',
    createdAt: now - 2 * day,
    timeToQualify: 9,
    messageCount: 6,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela, Nate's assistant. What kind of problem are you dealing with?" },
      { role: 'user', content: "Our team wastes hours every week pulling reports manually from different systems." },
      { role: 'agent', content: "That's painful. Nate built a real-time dashboard that eliminated exactly that kind of manual work. What's your name?" },
      { role: 'user', content: "Lisa Patel, Meridian Health." },
      { role: 'agent', content: "Hey Lisa. How big is the team at Meridian?" },
      { role: 'user', content: "About 80 people. Budget would be 10-25K range, timeline 1-3 months." },
    ],
  },
  {
    id: 'lead-06',
    name: 'Jason Kim',
    email: '',
    company: 'Velocity Motors',
    budget: '$5K-$10K',
    timeline: 'ASAP',
    companySize: '11-50',
    painPoints: ['lead gen', 'need scraper'],
    score: score(70, 100, 65, 70),
    stage: 'qualifying',
    createdAt: now - 3.5 * day,
    timeToQualify: 7,
    messageCount: 5,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What brings you here?" },
      { role: 'user', content: "I need to scrape leads from multiple government portals. Can Nate do that?" },
      { role: 'agent', content: "Absolutely. He built a multi-county lead scraper pulling from 9 different court portals. What's your name?" },
      { role: 'user', content: "Jason, Velocity Motors. About 25 employees." },
      { role: 'agent', content: "Nice. What kind of budget and timeline are you thinking?" },
    ],
  },
  {
    id: 'lead-07',
    name: 'Rachel Gomez',
    email: 'rachel@greenleafco.com',
    company: 'Greenleaf Co',
    budget: '$5K-$10K',
    timeline: '3-6 months',
    companySize: '2-10',
    painPoints: ['need website', 'need dashboard'],
    score: score(70, 35, 40, 70),
    stage: 'qualifying',
    createdAt: now - 4 * day,
    timeToQualify: 8,
    messageCount: 6,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What are you looking for today?" },
      { role: 'user', content: "We need both a website redesign and some kind of internal dashboard for our sales numbers." },
      { role: 'agent', content: "Nate's done both. He built an 18-page site with conversion funnels and a separate real-time dashboard. Who am I talking to?" },
      { role: 'user', content: "Rachel from Greenleaf. It's a small team, just 8 of us." },
      { role: 'agent', content: "Got it Rachel. What's the budget like for this?" },
      { role: 'user', content: "Around 5-10K. No rush though, next 3-6 months." },
    ],
  },
  {
    id: 'lead-08',
    name: 'Tom Bradley',
    email: '',
    company: 'Ironclad Security',
    budget: 'Not sure',
    timeline: '1-3 months',
    companySize: '11-50',
    painPoints: ['data silos'],
    score: score(30, 60, 65, 35),
    stage: 'qualifying',
    createdAt: now - 4.5 * day,
    timeToQualify: 6,
    messageCount: 4,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What can I help you with?" },
      { role: 'user', content: "Our data is all over the place. CRM says one thing, spreadsheets say another." },
      { role: 'agent', content: "Classic data silo problem. What's your name?" },
      { role: 'user', content: "Tom, Ironclad Security. About 30 people." },
    ],
  },
  {
    id: 'lead-09',
    name: 'Amanda Foster',
    email: 'amanda@peakperformance.co',
    company: 'Peak Performance',
    budget: '$1K-$5K',
    timeline: 'Within 30 days',
    companySize: '2-10',
    painPoints: ['need website'],
    score: score(40, 85, 40, 35),
    stage: 'qualifying',
    createdAt: now - 5 * day,
    timeToQualify: 5,
    messageCount: 5,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What brings you here?" },
      { role: 'user', content: "I need a professional website for my coaching business." },
      { role: 'agent', content: "Nate built an 18-page site with custom animations and multiple conversion funnels. What's your name?" },
      { role: 'user', content: "Amanda, Peak Performance Coaching. Just me and 2 contractors." },
      { role: 'agent', content: "Nice. What's your budget and timeline looking like?" },
    ],
  },

  // ── Early / Qualifying (5) ──
  {
    id: 'lead-10',
    name: 'Kevin Nguyen',
    email: '',
    company: '',
    budget: '',
    timeline: '',
    companySize: '',
    painPoints: ['need scraper'],
    score: score(0, 0, 0, 35),
    stage: 'qualifying',
    createdAt: now - 5.5 * day,
    timeToQualify: 0,
    messageCount: 3,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What can I help you with?" },
      { role: 'user', content: "Can Nate build a web scraper for real estate listings?" },
      { role: 'agent', content: "Definitely. He built a production scraper handling 9 different website architectures. What's your name?" },
    ],
  },
  {
    id: 'lead-11',
    name: 'Diana Cruz',
    email: '',
    company: 'Solaris Events',
    budget: '',
    timeline: 'Just exploring',
    companySize: '',
    painPoints: ['spreadsheet hell'],
    score: score(0, 15, 0, 35),
    stage: 'qualifying',
    createdAt: now - 5 * day,
    timeToQualify: 0,
    messageCount: 4,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What are you looking for?" },
      { role: 'user', content: "We're tracking everything in Google Sheets and it's getting out of hand." },
      { role: 'agent', content: "Spreadsheet hell is real. What's your name?" },
      { role: 'user', content: "Diana, Solaris Events. Just exploring options right now." },
    ],
  },
  {
    id: 'lead-12',
    name: 'Ryan Mitchell',
    email: '',
    company: '',
    budget: '',
    timeline: '',
    companySize: '',
    painPoints: ['manual reporting'],
    score: score(0, 0, 0, 35),
    stage: 'qualifying',
    createdAt: now - 6 * day,
    timeToQualify: 0,
    messageCount: 3,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What's going on?" },
      { role: 'user', content: "I spend 3 hours every Friday pulling reports for my boss. There has to be a better way." },
      { role: 'agent', content: "There absolutely is. Nate built a dashboard that does exactly that automatically. Who am I chatting with?" },
    ],
  },
  {
    id: 'lead-13',
    name: '',
    email: '',
    company: '',
    budget: '',
    timeline: '',
    companySize: '',
    painPoints: ['need dashboard'],
    score: score(0, 0, 0, 35),
    stage: 'greeting',
    createdAt: now - 6 * day,
    timeToQualify: 0,
    messageCount: 2,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What can I help you with?" },
      { role: 'user', content: "Just checking out what Nate can build. I might need a dashboard." },
    ],
  },

  // ── Nurture (4) ──
  {
    id: 'lead-14',
    name: 'Priya Sharma',
    email: '',
    company: 'Lotus Consulting',
    budget: '',
    timeline: 'Just exploring',
    companySize: 'Just me',
    painPoints: [],
    score: score(0, 15, 20, 0),
    stage: 'nurture',
    createdAt: now - 6.5 * day,
    timeToQualify: 0,
    messageCount: 3,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What brings you here today?" },
      { role: 'user', content: "Just browsing. I'm a solo consultant thinking about getting a website eventually." },
      { role: 'agent', content: "No rush at all. When you're ready, Nate builds sites with conversion funnels that actually bring in clients. What's your name?" },
    ],
  },
  {
    id: 'lead-15',
    name: '',
    email: '',
    company: '',
    budget: '',
    timeline: '',
    companySize: '',
    painPoints: [],
    score: score(0, 0, 0, 0),
    stage: 'greeting',
    createdAt: now - 6.8 * day,
    timeToQualify: 0,
    messageCount: 2,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What can I help you with?" },
      { role: 'user', content: "Not sure yet, just looking around." },
    ],
  },
  {
    id: 'lead-16',
    name: 'Alex Dupont',
    email: '',
    company: '',
    budget: 'Under $1K',
    timeline: 'Just exploring',
    companySize: 'Just me',
    painPoints: ['need website'],
    score: score(10, 15, 20, 35),
    stage: 'nurture',
    createdAt: now - 7 * day,
    timeToQualify: 0,
    messageCount: 4,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What are you looking for?" },
      { role: 'user', content: "I need a simple portfolio site but I don't have much budget." },
      { role: 'agent', content: "Totally understand. What's your name?" },
      { role: 'user', content: "Alex. Budget is probably under a thousand. Just exploring right now." },
    ],
  },
  {
    id: 'lead-17',
    name: 'Natasha Volkov',
    email: '',
    company: 'Redline Analytics',
    budget: '',
    timeline: '',
    companySize: '2-10',
    painPoints: ['data silos'],
    score: score(0, 0, 40, 35),
    stage: 'nurture',
    createdAt: now - 7 * day,
    timeToQualify: 0,
    messageCount: 3,
    conversation: [
      { role: 'agent', content: "Hey! I'm Angela. What's going on?" },
      { role: 'user', content: "Our analytics tools don't talk to each other. It's frustrating." },
      { role: 'agent', content: "Nate built a centralized data pipeline that syncs 4+ tools into one database. What's your name?" },
    ],
  },
]

export function generateActivities(leads: DemoLead[]): Activity[] {
  const activities: Activity[] = []

  for (const lead of leads) {
    // Every lead gets a "new conversation" event
    activities.push({
      id: `act-new-${lead.id}`,
      type: 'new_lead',
      leadName: lead.name || 'Anonymous visitor',
      leadId: lead.id,
      description: 'Started a new conversation',
      timestamp: lead.createdAt,
    })

    // Qualified+ leads get a qualified event
    if (lead.score.total >= 30 && lead.timeToQualify > 0) {
      activities.push({
        id: `act-qual-${lead.id}`,
        type: 'qualified',
        leadName: lead.name || 'Anonymous visitor',
        leadId: lead.id,
        description: `Qualified with score ${lead.score.total}`,
        timestamp: lead.createdAt + lead.timeToQualify * 60_000,
        score: lead.score.total,
      })
    }

    // Booked leads get a booked event
    if (lead.stage === 'booked') {
      activities.push({
        id: `act-book-${lead.id}`,
        type: 'booked',
        leadName: lead.name,
        leadId: lead.id,
        description: 'Meeting booked',
        timestamp: lead.createdAt + (lead.timeToQualify + 5) * 60_000,
        score: lead.score.total,
      })
    }
  }

  return activities.sort((a, b) => b.timestamp - a.timestamp)
}

interface ChatStoreSnapshot {
  leadProfile: {
    name: string | null
    email: string | null
    company: string | null
    budget: string | null
    timeline: string | null
    companySize: string | null
    painPoints: string[]
  }
  score: { total: number; breakdown: { budget: number; timeline: number; companySize: number; painPoints: number } }
  stage: string
  messages: { role: string; content: string }[]
  conversationStartTime: number | null
}

export function mergeLiveLead(leads: DemoLead[], store: ChatStoreSnapshot): DemoLead[] {
  const { leadProfile, score, stage, messages, conversationStartTime } = store

  if (!leadProfile.name) return leads

  const userMessages = messages.filter((m) => m.role === 'user')
  if (userMessages.length < 1) return leads

  const liveLead: DemoLead = {
    id: 'live-lead',
    name: leadProfile.name,
    email: leadProfile.email || '',
    company: leadProfile.company || '',
    budget: leadProfile.budget || '',
    timeline: leadProfile.timeline || '',
    companySize: leadProfile.companySize || '',
    painPoints: leadProfile.painPoints,
    score: score as DemoLead['score'],
    stage: stage as DemoLead['stage'],
    createdAt: conversationStartTime || Date.now(),
    timeToQualify: conversationStartTime
      ? Math.round((Date.now() - conversationStartTime) / 60_000)
      : 0,
    messageCount: messages.length,
    conversation: messages
      .filter((m) => m.role === 'agent' || m.role === 'user')
      .map((m) => ({ role: m.role as 'agent' | 'user', content: m.content })),
  }

  return [liveLead, ...leads]
}
