# Deploy Angela for a New Client

Step-by-step guide to spin up Angela for a different company. Estimated time: 2-3 hours for a full custom deployment.

## 1. Clone and rename

```bash
cp -r lead-agent/ client-name-agent/
cd client-name-agent/
```

## 2. Swap the personality (api/_lib/prompts.ts)

This is the single most important file. It controls everything Angela says and knows.

**Replace these sections:**

### Agent identity (line 1)
```
You are Angela, [CLIENT NAME]'s virtual assistant. [CLIENT] is a [WHAT THEY DO].
Your job is to [THEIR GOAL - qualify leads / book demos / answer questions / etc].
```

### Personality block
Keep the conversational rules (one question per message, short responses, etc). Change:
- Name if they want a different agent name
- Tone to match their brand (formal vs casual)

### Portfolio/products section
Replace Nate's 4 projects with the client's offerings:
```
### 1. [Product/Service Name]
- What: [one line]
- Problem it solved: [one line]
- Key details: [3-5 bullet points]
- Reference when: [visitor mentions X, Y, Z]
```

### Qualification fields
Adjust based on what matters to this client:
- B2B SaaS: company size, current tools, contract timeline
- Agency: project scope, budget, industry
- E-commerce: order volume, platform, pain points

### Budget/timeline norms
Update the normalization ranges in the `Field Rules` section to match the client's price points.

## 3. Update scoring (api/_lib/scoring.ts)

Adjust weights and score maps to reflect what qualifies a good lead for THIS client:

```typescript
const WEIGHTS = {
  budget: 30,      // How much does budget matter?
  timeline: 25,    // How urgent should leads be?
  companySize: 20, // Does company size correlate with deal quality?
  painPoints: 25,  // How important is problem-solution fit?
}
```

Update `BUDGET_SCORES`, `TIMELINE_SCORES`, `SIZE_SCORES` to match the client's ranges.

## 4. Update the greeting (src/stores/chatStore.ts)

Change `DEFAULT_GREETING`:
```typescript
const DEFAULT_GREETING: Message = {
  id: 'greeting',
  role: 'agent',
  content: "Hey! I'm [NAME], [CLIENT]'s [ROLE]. [WHAT I DO]. How can I help?",
  timestamp: Date.now(),
  quickReplies: ['[Option 1]', '[Option 2]', '[Option 3]'],
}
```

Update `RETURN_GREETINGS_WITH_NAME` and `RETURN_GREETINGS_ANONYMOUS` arrays to match the agent's personality.

## 5. Theme the UI (src/index.css)

Replace colors in the `@theme` block:

```css
@theme {
  --color-bg: #f2efe9;              /* Page background */
  --color-surface: #e8e4de;         /* Card backgrounds */
  --color-surface-elevated: #fff;   /* Elevated cards */
  --color-border: #c8c4bc;          /* Borders */
  --color-text: #0a0a0a;            /* Primary text */
  --color-text-muted: #999;         /* Secondary text */
  --color-agent-bubble: #e8e4de;    /* Agent chat bubble */
  --color-user-bubble: #0a0a0a;     /* User chat bubble */
}
```

Update fonts if the client has brand fonts (swap Google Fonts in `index.html` too).

## 6. Update the landing page (src/App.tsx)

- Header: swap AngelaAvatar for client's logo, update name
- Hero: rewrite headline and subtext for the client's value prop
- Differentiator cards: update to reflect what makes their chatbot unique
- Capabilities: adjust the Engagement/Intelligence/Conversion lists
- Tech stack pills: keep or remove based on audience

## 7. Update the avatar (src/components/AngelaAvatar.tsx)

Replace the avatar SVG/component with the client's agent avatar or brand mark.

## 8. Set up infrastructure

### Supabase
1. Create new Supabase project
2. Run the leads table migration (schema in `api/_lib/supabase.ts`)
3. Get URL + service role key

### Google Calendar
1. Create Google Cloud project
2. Enable Calendar API
3. Create service account, download JSON key
4. Share the client's calendar with the service account email

### Vercel
1. `npx vercel` to create new project
2. Set env vars in dashboard:
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
   - `GOOGLE_CALENDAR_ID`
3. `npx vercel --prod` to deploy

## 9. Embed on client's site (optional)

Angela can run as a standalone page (current setup) or be embedded as a widget. For embedding, the ChatWidget component accepts an `inline` prop. To make it a floating widget on an external site, you'd wrap it in a script tag that injects an iframe or shadow DOM mount point.

## 10. Test

- [ ] Fresh visitor gets correct greeting
- [ ] Return visitor gets worried/human return greeting
- [ ] Chat flows naturally, asks one question at a time
- [ ] Lead scoring updates live in the dashboard
- [ ] Qualification UI (budget slider, timeline picker) appears at the right moment
- [ ] Booking flow works (name + email triggers calendar)
- [ ] Mock fallback works when API key is missing/rate-limited
- [ ] Mobile layout: metrics bar visible, chat usable
- [ ] Admin panel shows captured leads

## Customization Checklist

```
[ ] api/_lib/prompts.ts    - Personality, portfolio, qualification rules
[ ] api/_lib/scoring.ts    - Scoring weights and ranges
[ ] src/stores/chatStore.ts - Greeting + return visitor messages
[ ] src/index.css           - Color palette and fonts
[ ] src/App.tsx             - Landing page copy and layout
[ ] src/components/AngelaAvatar.tsx - Agent avatar
[ ] index.html              - Favicon, meta tags, Google Fonts
[ ] .env.local              - API keys for local dev
[ ] Vercel env vars         - API keys for production
```
