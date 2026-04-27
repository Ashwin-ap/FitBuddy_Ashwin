# Product Requirements Document
## Personal Fitness Tracker AI Assistant

---

## Executive Summary

A lightweight, web-based fitness tracking application that uses an AI assistant to deliver personalised workout guidance. The app allows users to set a fitness goal, log daily activity, and receive contextual AI recommendations — all without requiring an account, backend database, or complex setup. Built for a student submission, it prioritises clarity, safety, and ease of use over feature depth.

---

## Mission

To give anyone — regardless of fitness level — a simple, honest AI companion that helps them stay consistent, track progress, and make safe decisions about their health.

---

## Target Users

| User Type | Description |
|-----------|-------------|
| **Beginner** | Little to no exercise history. Needs encouragement, simple language, and conservative recommendations. |
| **Intermediate / Active** | Has a routine but wants structure and smarter next steps. Comfortable with fitness terminology. |

The UI and AI responses must work well for both. The system prompt adapts tone based on the user's stated goal and age.

---

## MVP Scope

### In Scope

- User profile setup (name, age, fitness goal)
- Activity log (activity type, duration, perceived effort)
- Progress view (chronological list of logged activities)
- AI recommendation panel (contextual suggestions from LLM)
- Safety guardrail (system prompt rules + server-side keyword filter)
- Multi-provider LLM support (Claude, OpenAI, Gemini) via `.env`
- Local data persistence via `localStorage`
- Data export (JSON download)

### Out of Scope (Post-MVP)

- User authentication / accounts
- Cloud data sync across devices
- Charts, graphs, or analytics dashboards
- Calorie or nutrition tracking
- Wearable device integration
- Social or sharing features

---

## Core User Flows

### 1. First-Time Setup
User lands on the app → fills in name, age, and selects a fitness goal → profile saved to `localStorage` → directed to the main dashboard.

### 2. Log an Activity
User clicks "Log Activity" → fills in what they did, how long, and how it felt → entry appended to `localStorage` log → confirmation shown.

### 3. Get AI Recommendation
User clicks "Get Recommendation" → app reads profile + last 5 log entries → sends to backend proxy → LLM returns personalised suggestion → displayed with a safety disclaimer.

### 4. View Progress
User clicks "My Progress" → chronological list of all logged activities rendered from `localStorage`.

### 5. Export Data
User clicks "Export" → full profile + log downloaded as a `.json` file.

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework, no build step) |
| Backend | Node.js + Express (single `server.js` file) |
| AI Integration | Anthropic Claude / OpenAI / Google Gemini (configurable) |
| Data Storage | Browser `localStorage` |
| Config | `.env` file (gitignored) |

### Key Design Decisions

- **No database** — `localStorage` is sufficient for a single-user demo app
- **Server-side proxy** — API key never exposed to the browser
- **Provider-agnostic** — `LLM_PROVIDER` env var switches between Claude, OpenAI, and Gemini with no code changes
- **No framework** — keeps the codebase readable, auditable, and dependency-light

---

## AI Agent Design

### Persona — FitBuddy

A friendly, evidence-based fitness assistant named **FitBuddy**. Encouraging, non-judgmental, and honest about being an AI — not a doctor.

### Context Passed to the LLM (per request)

- User name, age, and fitness goal
- Last 5 activity log entries (activity, duration, how it felt)
- Current date

### System Prompt Rules

- Suggest only realistic, sustainable fitness habits
- Never recommend extreme calorie deficits or dangerous supplements
- Never recommend losing more than 1–2 lbs per week
- Always include: *"I'm an AI assistant, not a medical professional. Consult a doctor for health concerns."*
- Redirect injury or medical questions to healthcare professionals
- Adapt tone to the user's goal (gentle for weight loss beginners, more structured for strength goals)

### Guardrail Layers

| Layer | Where | What it does |
|-------|-------|-------------|
| System prompt | LLM-side | Instructs the model to refuse harmful advice |
| Keyword filter | Server-side (`server.js`) | Scans AI response before returning it; replaces flagged content with a safe fallback |

---

## File Structure

```
project/
├── .env                 ← gitignored (real API key)
├── .env.example         ← submitted (variable template, no key)
├── .gitignore
├── package.json
├── server.js            ← Express: static file serving + /api/recommend proxy
├── PRD.md
├── project-outline.md
├── mvp-tool-design.md
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

---

## Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page load time | Under 2 seconds (no heavy assets) |
| AI response time | Under 10 seconds (dependent on LLM provider) |
| Mobile responsiveness | Usable on phone and desktop |
| Browser support | Latest Chrome, Firefox, Safari, Edge |
| Accessibility | Readable font sizes, sufficient colour contrast, labelled form inputs |

---

## Success Criteria (MVP)

- [ ] A new user can complete profile setup in under 1 minute
- [ ] A user can log an activity in under 30 seconds
- [ ] AI recommendations reference the user's actual profile and log (not generic)
- [ ] At least one guardrail demonstrably blocks or softens unsafe advice
- [ ] The app works for both a beginner and an advanced user without confusion
- [ ] The project runs locally with only `npm install` + `.env` setup — no other configuration needed
- [ ] No API key is present in any submitted file
