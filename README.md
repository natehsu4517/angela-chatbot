# Angela - AI Lead Qualification Agent

Live: https://angela-chatbot.vercel.app

AI chatbot that has real conversations with website visitors, qualifies them with live scoring, and books meetings on your calendar. Built with React, Claude API, Supabase, and Google Calendar.

## Architecture

```
lead-agent/
  src/                    # React frontend (Vite + Tailwind v4)
    components/           # UI: ChatWidget, DemoDashboard, qualification UIs
    stores/chatStore.ts   # Zustand state (messages, lead profile, score, stage)
    hooks/useChat.ts      # Chat logic, streaming, token buffering
    utils/api.ts          # API calls with automatic mock fallback
    utils/mockApi.ts      # Full offline conversation engine (567 lines)
  api/                    # Vercel serverless functions
    chat.ts               # Claude streaming endpoint
    book.ts               # Google Calendar booking
    availability.ts       # Calendar availability check
    leads.ts              # Supabase lead retrieval
    _lib/prompts.ts       # System prompt, personality, portfolio references
    _lib/scoring.ts       # Lead scoring algorithm (0-100)
    _lib/supabase.ts      # Supabase client
    _lib/google.ts        # Google Calendar client
```

## Stack

React 19, Vite 7, Tailwind CSS v4, Framer Motion 12, Zustand 5, Claude API, Supabase, Google Calendar API, Vercel serverless

## Key Files for Customization

| What | File | Notes |
|------|------|-------|
| Personality + portfolio | `api/_lib/prompts.ts` | System prompt, tone, project references |
| Greeting message | `src/stores/chatStore.ts` | DEFAULT_GREETING + return visitor greetings |
| Lead scoring weights | `api/_lib/scoring.ts` | Budget/timeline/size/pain point weights |
| Color palette | `src/index.css` | Tailwind v4 @theme block |
| Landing page | `src/App.tsx` | Hero, features, differentiators |
| Qualification UI | `src/components/qualification/` | Budget slider, timeline picker, etc. |

## Environment Variables

```
ANTHROPIC_API_KEY=                # Claude API key
SUPABASE_URL=                     # Supabase project URL
SUPABASE_SERVICE_KEY=             # Supabase service role key
GOOGLE_SERVICE_ACCOUNT_JSON=      # Stringified JSON service account
GOOGLE_CALENDAR_ID=               # Calendar ID for booking
```

## Run Locally

```bash
cd lead-agent
npm install
npm run dev
```

Dev mode proxies `/api/chat` through Vite using `ANTHROPIC_API_KEY` from `.env.local`. Falls back to mock API automatically if Claude fails.

## Deploy

```bash
npx vercel --prod
```

Vercel project: `angela-chatbot`. Set env vars in Vercel dashboard.

## See Also

- `DEPLOY-PLAYBOOK.md` - Step-by-step guide to deploy Angela for a new client
