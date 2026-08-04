import type { VercelRequest, VercelResponse } from '@vercel/node'

// --- Allowed Origins ---
const ALLOWED_ORIGINS = [
  'https://angela-chatbot.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

export function checkOrigin(req: VercelRequest, res: VercelResponse): boolean {
  const origin = req.headers.origin
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    res.status(403).json({ error: 'Forbidden' })
    return false
  }
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  return true
}

// --- Admin Auth ---
export function checkAdminAuth(req: VercelRequest, res: VercelResponse): boolean {
  const adminKey = process.env.ADMIN_API_KEY
  if (!adminKey) {
    console.error('ADMIN_API_KEY not configured')
    res.status(500).json({ error: 'Server misconfigured' })
    return false
  }
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token !== adminKey) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

// --- Rate Limiting (in-memory, per-instance) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  req: VercelRequest,
  res: VercelResponse,
  opts: { maxRequests: number; windowMs: number } = { maxRequests: 20, windowMs: 60_000 }
): boolean {
  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + opts.windowMs })
    return true
  }

  entry.count++
  if (entry.count > opts.maxRequests) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' })
    return false
  }
  return true
}

// --- Input Sanitization ---
export function sanitizeString(input: unknown, maxLength: number = 200): string {
  if (typeof input !== 'string') return ''
  return input.slice(0, maxLength).replace(/[<>]/g, '').trim()
}

export function sanitizeEmail(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const email = input.trim().slice(0, 254)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return null
  return email
}

// --- Security Headers ---
export function setSecurityHeaders(res: VercelResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
}

// --- CORS Preflight ---
export function handlePreflight(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      res.setHeader('Access-Control-Max-Age', '86400')
    }
    res.status(204).end()
    return true
  }
  return false
}
