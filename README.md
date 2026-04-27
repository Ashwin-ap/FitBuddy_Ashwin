# FitBuddy — Personal Fitness Tracker AI Assistant

FitBuddy is a lightweight, web-based fitness tracker with a built-in AI assistant. Set a fitness goal, log your workouts, track your progress, and get personalised recommendations — all in the browser, no account required.

---

## Features

- **Multi-user support** — multiple people can share the app on the same device, each with their own profile and activity log
- **Activity logging** — log what you did, how long, and how it felt
- **Progress view** — chronological history of all your logged activities
- **AI recommendations** — FitBuddy reads your profile and last 5 activities and gives personalised advice
- **Data export** — download your profile and log as a JSON file
- **Safety guardrails** — system prompt rules + server-side keyword filter block unsafe advice

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| AI | Claude / OpenAI / Gemini (your choice) |
| Storage | Browser `localStorage` |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Ashwin-ap/FitBuddy_Ashwin.git
cd FitBuddy_Ashwin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

Copy the example env file:

```bash
cp .env.example .env
```

Open `.env` and fill in your provider and API key:

```env
LLM_PROVIDER=claude
LLM_API_KEY=your-api-key-here
```

> See the [API Key Setup](#api-key-setup) section below for where to get a key.

### 4. Start the server

```bash
node server.js
```

### 5. Open the app

Go to **http://localhost:3000** in your browser.

---

## API Key Setup

FitBuddy supports three AI providers. Pick one, get a key, and set it in `.env`.

### Claude (Anthropic) — Recommended

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up and add billing credits
3. Navigate to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`)

```env
LLM_PROVIDER=claude
LLM_API_KEY=sk-ant-...
```

---

### OpenAI

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up and add billing credits at **Settings → Billing**
3. Navigate to **API Keys** → **Create new secret key**
4. Copy the key (starts with `sk-proj-...`)

```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-proj-...
```

---

### Google Gemini

1. Go to [aistudio.google.com](https://aistudio.google.com) — must use AI Studio, not Google Cloud Console
2. Click **Get API key** → **Create API key**
3. Copy the key (starts with `AIza...`)

```env
LLM_PROVIDER=gemini
LLM_API_KEY=AIza...
```

> **Important:** Create the key from [aistudio.google.com](https://aistudio.google.com), not from the Google Cloud Console. Keys created in GCP directly may have zero free-tier quota.

---

## How to Use

### First time
1. Open the app — you'll land on the **Profile** tab
2. Enter your name, age, and fitness goal → click **Save Profile**
3. You'll be taken to the **Log Activity** tab automatically

### Logging a workout
1. Go to **Log Activity**
2. Fill in what you did, duration, and effort level
3. Click **Log Activity** — a hint will appear pointing you to FitBuddy

### Viewing progress
- Click **My Progress** to see all your logged activities, newest first
- Click **Export My Data** to download a `fitbuddy-<name>.json` backup

### Getting an AI recommendation
1. Click **FitBuddy** in the nav
2. Click **Get Recommendation**
3. FitBuddy reads your profile and last 5 activities and returns personalised advice
4. The medical disclaimer is always shown beneath the response

### Switching users
1. Click **Profile** in the nav
2. The user picker shows all existing users — click a name to switch
3. Click **+ New User** to add another person

---

## Project Structure

```
vibe_coded_app/
├── .env                  ← your API key (never committed)
├── .env.example          ← template — copy this to .env
├── .gitignore
├── package.json
├── server.js             ← Express: static file serving + POST /api/recommend
└── public/
    ├── index.html        ← single-page app, four sections
    ├── style.css
    └── app.js            ← all frontend logic
```

---

## Safety & Ethics

FitBuddy uses two layers of protection to ensure safe, responsible advice:

**Layer 1 — System prompt (LLM-side)**
- Only suggests realistic, sustainable habits
- Never recommends losing more than 1–2 lbs per week
- Never recommends extreme calorie deficits
- Never endorses dangerous supplements or steroids
- Always includes a medical disclaimer in every response
- Redirects injury and medical questions to healthcare professionals

**Layer 2 — Keyword filter (server-side)**
Before any response reaches the browser, the server scans for dangerous phrases (e.g. rapid weight loss claims, steroids, ephedrine, DNP, starvation diets, laxatives). If found, the response is replaced with a safe fallback message.

**UI disclaimer**
> *FitBuddy is an AI assistant, not a medical professional.*

This is always visible in the FitBuddy panel.

---

## Data & Privacy

- All data is stored in your browser's `localStorage` — nothing is sent to any server except the AI provider when you click **Get Recommendation**
- Your API key is never exposed to the browser — all AI calls are proxied through the local Express server
- Clearing your browser's site data will erase all profiles and logs — use **Export My Data** to back up first

---


