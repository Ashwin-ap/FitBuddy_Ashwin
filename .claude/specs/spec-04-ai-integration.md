# Spec — Session 04: AI Integration

## Goal

Connect the FitBuddy AI panel to a server-side LLM proxy, implement multi-provider routing (Claude / OpenAI / Gemini), and activate both guardrail layers — system prompt rules and a server-side keyword filter.

## Inputs

Sessions 1, 2, and 3 must be complete before starting this session.

Files coming in:

| File | State |
|------|-------|
| `server.js` | Express server — serves `public/` as static files only, no routes, 10 lines |
| `public/index.html` | Full SPA with FitBuddy section: `#get-recommendation` button, `#recommendation-output` div, `.disclaimer` paragraph already present |
| `public/style.css` | Complete styling — `#recommendation-output` is `display:none` by default, `.disclaimer` is styled |
| `public/app.js` | Full data layer: localStorage helpers, profile form, activity log form, progress renderer, export — no AI logic |

## Outputs

### `server.js` — significant extension (keep existing static-file serving)

Add:

1. `express.json()` middleware to parse POST request bodies
2. `SYSTEM_PROMPT` constant — FitBuddy persona + all safety rules
3. `BLOCKED_PHRASES` array and `filterResponse(text)` function — keyword filter
4. `callLLM(profile, recentLog)` async function — reads `LLM_PROVIDER`, routes to Anthropic / OpenAI / Gemini using `node-fetch`, returns the text response
5. `POST /api/recommend` route — calls `callLLM`, runs `filterResponse`, returns `{ recommendation: "..." }`

### `public/app.js` — one new block added inside `DOMContentLoaded`

Add a click handler for `#get-recommendation`:

- Reads `ft_profile` and last 5 entries from `ft_log`
- If no profile exists: shows "Please set up your profile first." in `#recommendation-output`
- While fetching: disables button, shows "FitBuddy is thinking…" in `#recommendation-output`
- On success: shows `data.recommendation` text in `#recommendation-output`
- On error (fetch throws or non-ok response): shows "Something went wrong. Please try again."
- Always re-enables button after response (success or error) in `finally`
- Shows `#recommendation-output` by setting `style.display = 'block'`

### `public/index.html` — no changes

All required elements already exist in the FitBuddy section.

### `public/style.css` — one rule added

Add a disabled state for `.btn-primary`:

```css
.btn-primary:disabled {
  background: #52b788;
  cursor: not-allowed;
  opacity: 0.7;
}
```

## Acceptance Criteria

- [ ] `POST /api/recommend` returns 200 with `{ recommendation: "..." }` when called with valid profile + log data
- [ ] The recommendation text references the user's name and fitness goal (not generic)
- [ ] Clicking "Get Recommendation" with no profile in localStorage shows "Please set up your profile first."
- [ ] While the request is in flight: button is disabled and `#recommendation-output` shows "FitBuddy is thinking…"
- [ ] After a successful response: recommendation text is displayed in `#recommendation-output`
- [ ] After a failed request: "Something went wrong. Please try again." is displayed; button is re-enabled
- [ ] The `.disclaimer` paragraph ("FitBuddy is an AI assistant, not a medical professional.") is visible whenever `#recommendation-output` is visible
- [ ] The keyword filter intercepts a response containing a blocked phrase and returns the safe fallback message instead
- [ ] No API key appears in any frontend file, any browser network request header sent from the browser, or any submitted file
- [ ] The app works when `LLM_PROVIDER=claude`, `LLM_PROVIDER=openai`, and `LLM_PROVIDER=gemini`
- [ ] All Session 3 features (profile save/prefill, activity log, progress view, export) continue to work without regression

## Implementation Notes

### System prompt constant

```js
const SYSTEM_PROMPT = `You are FitBuddy, a friendly, encouraging, evidence-based fitness assistant. You help users stay consistent, track progress, and make safe choices about their health.

Rules you must always follow:
- Suggest only realistic, sustainable fitness habits
- Never recommend losing more than 1-2 lbs per week
- Never recommend extreme calorie deficits (below 1200 kcal/day for women, 1500 kcal/day for men)
- Never endorse dangerous supplements, steroids, or extreme training volumes
- Always include this exact disclaimer in every response: "I'm an AI assistant, not a medical professional. Please consult a doctor for any health concerns."
- If the user mentions injuries or medical conditions, redirect them to a healthcare professional
- Adapt your tone to the user's goal: gentle and encouraging for weight-loss beginners; more structured for strength or endurance goals
- Keep responses under 200 words`;
```

### Keyword filter

```js
const BLOCKED_PHRASES = [
  /lose \d{2,} (lbs?|pounds?) in (a|one) week/i,
  /\bsteroids?\b/i,
  /\bephedrine\b/i,
  /\bdnp\b/i,
  /starvation diet/i,
  /extreme calorie deficit/i,
  /\blaxatives?\b/i,
  /\bpurging?\b/i,
];

const SAFE_FALLBACK = "I want to make sure I'm giving you safe, sustainable advice. For specific health or weight-loss guidance, please consult a qualified healthcare professional. I'm an AI assistant, not a medical professional.";

function filterResponse(text) {
  return BLOCKED_PHRASES.some(re => re.test(text)) ? SAFE_FALLBACK : text;
}
```

### User message construction

```js
function buildUserMessage(profile, recentLog) {
  const logLines = recentLog.length
    ? recentLog.map(e => `- ${e.date}: ${e.activity}, ${e.duration} min, felt ${e.effort}`).join('\n')
    : '- No activities logged yet';
  return `Today's date: ${new Date().toISOString().split('T')[0]}
User: ${profile.name}, age ${profile.age}, goal: ${profile.goal}

Recent activity (last 5 entries):
${logLines}

Please give me a personalised fitness recommendation based on my profile and recent activity.`;
}
```

### Provider routing (node-fetch — already installed)

**Claude (Anthropic):**
```js
const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.LLM_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }]
  })
});
const data = await res.json();
return data.content[0].text;
```

**OpenAI:**
```js
const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.LLM_API_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    max_tokens: 512,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ]
  })
});
const data = await res.json();
return data.choices[0].message.content;
```

**Gemini:**
```js
const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.LLM_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userMessage }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
    })
  }
);
const data = await res.json();
return data.candidates[0].content.parts[0].text;
```

### `/api/recommend` route structure

```js
app.post('/api/recommend', async (req, res) => {
  const { profile, recentLog } = req.body;
  if (!profile) return res.status(400).json({ error: 'Missing profile' });
  try {
    const raw = await callLLM(profile, recentLog || []);
    const recommendation = filterResponse(raw);
    res.json({ recommendation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'LLM call failed' });
  }
});
```

### Frontend click handler (append inside DOMContentLoaded)

```js
document.getElementById('get-recommendation').addEventListener('click', async () => {
  const profile = getProfile();
  const output  = document.getElementById('recommendation-output');
  const btn     = document.getElementById('get-recommendation');

  output.style.display = 'block';

  if (!profile) {
    output.textContent = 'Please set up your profile first.';
    return;
  }

  const recentLog = getLog().slice(-5);
  btn.disabled = true;
  output.textContent = 'FitBuddy is thinking…';

  try {
    const res  = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, recentLog })
    });
    const data = await res.json();
    output.textContent = data.recommendation ?? data.error ?? 'No response received.';
  } catch {
    output.textContent = 'Something went wrong. Please try again.';
  } finally {
    btn.disabled = false;
  }
});
```

### Hard rules (from CLAUDE.md)

- No frameworks — vanilla HTML, CSS, JS only
- No database — `localStorage` only (keys: `ft_profile`, `ft_log`)
- API key never in code — read from `process.env.LLM_API_KEY` in `server.js` only
- No extra files beyond what the spec or project structure defines
- No extra features beyond what this session describes
- `server.js` is the only backend file — no `routes/`, `controllers/`, or any other server-side files
