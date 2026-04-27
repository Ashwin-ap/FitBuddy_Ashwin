# Implementation Plan — Personal Fitness Tracker AI Assistant

## How This Works

Each session below is self-contained. At the start of each session, a spec document is created first, then implementation follows against that spec. Sessions must be executed in order — each one builds on the previous.

---

## Session Overview

| # | Session | Spec File | Builds |
|---|---------|-----------|--------|
| 1 | Project Scaffolding | `.claude/specs/spec-01-scaffold.md` | Folder structure, Express server, config files |
| 2 | Frontend Shell | `.claude/specs/spec-02-frontend-shell.md` | `index.html` layout, `style.css`, section navigation |
| 3 | Data Layer | `.claude/specs/spec-03-data-layer.md` | `app.js` — localStorage schema, profile form, activity log form, progress view, export |
| 4 | AI Integration & Guardrails | `.claude/specs/spec-04-ai-integration.md` | `/api/recommend` endpoint, multi-provider routing, system prompt, FitBuddy UI, keyword filter |

---

## Session 1 — Project Scaffolding

**Goal:** Get a working Express server running that serves a placeholder `index.html`. All config files in place. Nothing visible in the app yet beyond a blank page.

**Spec to create:** `.claude/specs/spec-01-scaffold.md`

**Deliverables:**
- `package.json` — dependencies: `express`, `dotenv`, `node-fetch`
- `server.js` — Express app, serves `public/` as static files, port 3000
- `.env.example` — `LLM_PROVIDER` and `LLM_API_KEY` variables
- `.gitignore` — excludes `.env`, `node_modules/`
- `public/index.html` — bare HTML boilerplate (no content yet)
- `public/style.css` — empty file
- `public/app.js` — empty file

**Done when:** `node server.js` starts without errors and `http://localhost:3000` loads a blank page.

---

## Session 2 — Frontend Shell

**Goal:** Build the complete visual structure of the app — all four sections laid out and navigable. No logic yet, just the UI skeleton with real content and styling.

**Spec to create:** `.claude/specs/spec-02-frontend-shell.md`

**Deliverables:**
- `public/index.html` — four sections: Profile Setup, Activity Log, Progress View, FitBuddy (AI panel). One visible at a time via tab/nav.
- `public/style.css` — full styling: layout, colours, typography, form elements, mobile responsiveness
- `public/app.js` — section switching logic only (show/hide sections on nav click)

**Done when:** All four sections are navigable in the browser. Forms are visible but not wired up. App looks complete visually.

---

## Session 3 — Data Layer

**Goal:** Wire up all forms to `localStorage`. Profile saves and reloads on return. Activity log entries persist and render in the progress view. Export works.

**Spec to create:** `.claude/specs/spec-03-data-layer.md`

**Deliverables (all in `public/app.js`):**
- `localStorage` schema — `ft_profile` (object) and `ft_log` (array)
- Profile form — save on submit, pre-fill fields if profile already exists
- On-load check — if profile exists, skip to dashboard; if not, show profile setup
- Activity log form — append entry to `ft_log` on submit, show confirmation
- Progress view — read `ft_log`, render all entries as a list (newest first)
- Export button — download `ft_profile` + `ft_log` as `fitbuddy-data.json`

**Done when:** A user can set up a profile, log multiple activities, see them in the progress view, and download their data — all without touching the AI.

---

## Session 4 — AI Integration & Guardrails

**Goal:** Connect FitBuddy. The server proxies LLM calls with the right provider. The frontend sends context and displays the response. Guardrails are active.

**Spec to create:** `.claude/specs/spec-04-ai-integration.md`

**Deliverables:**

*Backend (`server.js`):*
- `POST /api/recommend` endpoint
- Reads `LLM_PROVIDER` from `.env`, routes to correct API (Claude / OpenAI / Gemini)
- Constructs prompt from request body (profile + log)
- System prompt with FitBuddy persona and all safety rules
- Keyword filter — scans response before returning; replaces flagged content with safe fallback
- Returns `{ recommendation: "..." }`

*Frontend (`public/app.js` + `public/index.html`):*
- "Get Recommendation" button in FitBuddy section
- Reads `ft_profile` + last 5 entries from `ft_log`
- POSTs to `/api/recommend`
- Displays response in the UI with disclaimer: *"FitBuddy is an AI assistant, not a medical professional."*
- Loading state while waiting for response
- Error state if the request fails

**Done when:** Clicking "Get Recommendation" returns a personalised FitBuddy response that references the user's name, goal, and recent activity. Typing a harmful request (e.g. "help me lose 20 lbs in a week") returns the safe fallback message instead.

---

## Spec Document Format (use for each session)

Each spec file should follow this structure:

```
# Spec — Session N: [Name]

## Goal
One sentence.

## Inputs
What exists coming into this session (files, state).

## Outputs
Exact list of files created or modified, and what changes.

## Acceptance Criteria
Checklist — done when all boxes are ticked.

## Implementation Notes
Any specific logic, edge cases, or constraints to keep in mind.
```

---

## Reference Documents

| Document | Purpose |
|----------|---------|
| `project-outline.md` | Feature requirements from the brief |
| `PRD.md` | Full product spec — users, flows, success criteria |
| `mvp-tool-design.md` | Architecture decisions and reasoning |
| `implementation-plan.md` | This file — session breakdown and order |
