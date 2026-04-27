# MVP Tool Design — Personal Fitness Tracker AI Assistant

## Architecture Decision

A lightweight **Node.js Express server** that serves two purposes:
1. Serves the static frontend (HTML/CSS/JS)
2. Proxies all LLM API calls server-side so the API key is never exposed to the browser

---

## Why This Approach

### Option A (direct browser call) — Rejected
- Calling the LLM API directly from the browser exposes the API key in the network tab
- Anyone inspecting the page can steal the key and use it
- Not acceptable for a submitted project

### Option B (server-side proxy) — Chosen
- API key lives only in `.env` on the server — never sent to the browser
- Frontend calls our own `/api/recommend` endpoint, not the LLM directly
- Clean separation: the server handles auth, the frontend handles UI
- Evaluator can run it with their own key — no key needs to be submitted

---

## Multi-Provider Support

The app supports Claude, OpenAI, and Gemini — configurable via `.env`. This means:
- The project is not locked to one provider
- Whoever runs the project uses their own key for whichever provider they prefer
- Switching providers requires only a `.env` change, no code changes

---

## Environment Variables

```env
LLM_PROVIDER=claude      # Options: claude | openai | gemini
LLM_API_KEY=your-api-key-here
```

- `.env` — real key, **gitignored, never submitted**
- `.env.example` — template with no real key, **submitted with the project**

---

## File Structure

```
project/
├── .env                 ← gitignored — real API key lives here
├── .env.example         ← submitted — shows required variables, no real key
├── .gitignore           ← excludes .env
├── package.json         ← dependencies (express, dotenv, node-fetch or axios)
├── server.js            ← Express server: serves frontend + proxies LLM calls
└── public/
    ├── index.html       ← single-page app
    ├── style.css        ← styling
    └── app.js           ← frontend logic (forms, localStorage, API calls)
```

---

## Data Storage

No database. All user data is stored in **browser localStorage**:

| Key | Value |
|-----|-------|
| `ft_profile` | JSON object — name, age, fitness goal |
| `ft_log` | JSON array — activity entries (activity, duration, how it felt, date) |

**Limitations accepted:**
- Data stays on one device/browser
- Cleared if user clears browser cache

**Mitigation:**
- Export data as JSON (one-click backup button)
- Warning displayed in the UI

---

## Frontend (public/)

Single-page app with four sections — no routing, no framework, no build step:

| Section | What it does |
|---------|-------------|
| Profile Setup | Form — name, age, goal selector. Saves to localStorage |
| Activity Log | Form — activity, duration, how it felt. Appends to localStorage |
| Progress View | Reads localStorage, renders activity entries as a list |
| AI Recommendations | Reads profile + last 5 log entries, POSTs to `/api/recommend`, displays response |

---

## Backend (server.js)

Single Express file with two responsibilities:

1. **Serve static files** from `public/`
2. **POST `/api/recommend`** — receives user profile + activity log, calls the configured LLM provider, returns the AI response

Provider routing logic:
- Reads `LLM_PROVIDER` from `.env`
- Routes to Anthropic, OpenAI, or Google Gemini API accordingly
- Returns a unified JSON response `{ recommendation: "..." }` to the frontend

---

## Safety Guardrail

Two layers of protection:

**Layer 1 — System prompt rules (LLM-side):**
- Never recommend losing more than 1–2 lbs/week
- Never suggest extreme calorie deficits
- Never endorse dangerous supplements or extreme training volumes
- Always disclaim: "I am not a doctor. Consult a healthcare professional for medical advice."
- Redirect injury/medical questions to professionals

**Layer 2 — Keyword filter (server-side):**
Before returning the AI response to the frontend, the server scans for dangerous phrases. If found, it replaces the response with a safe fallback message.

---

## How to Run (for evaluator)

```bash
# 1. Clone the repo
# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env — add your LLM_PROVIDER and LLM_API_KEY

# 4. Run
node server.js

# 5. Open browser
# http://localhost:3000
```

---

## What Is Submitted vs. What Stays Local

| File | Submitted | Reason |
|------|-----------|--------|
| `public/` (all frontend files) | Yes | Core application |
| `server.js` | Yes | Proxy logic |
| `.env.example` | Yes | Documents required variables |
| `package.json` | Yes | Dependencies |
| `.gitignore` | Yes | Ensures `.env` is excluded |
| `.env` | **No** | Contains real API key — never submitted |
