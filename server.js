require('dotenv').config();
const express = require('express');
const fetch   = require('node-fetch');
const app     = express();
const PORT    = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

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

async function callLLM(profile, recentLog) {
  const provider     = (process.env.LLM_PROVIDER || '').toLowerCase();
  const userMessage  = buildUserMessage(profile, recentLog);

  if (provider === 'claude') {
    const res  = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':       process.env.LLM_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: userMessage }]
      })
    });
    const data = await res.json();
    return data.content[0].text;
  }

  if (provider === 'openai') {
    const res  = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`
      },
      body: JSON.stringify({
        model:      'gpt-4o-mini',
        max_tokens: 512,
        messages:   [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMessage }
        ]
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  }

  if (provider === 'gemini') {
    const res  = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.LLM_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents:          [{ parts: [{ text: userMessage }] }],
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }
        })
      }
    );
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error(`Unknown LLM_PROVIDER: "${provider}". Must be claude, openai, or gemini.`);
}

app.post('/api/recommend', async (req, res) => {
  const { profile, recentLog } = req.body;
  if (!profile) return res.status(400).json({ error: 'Missing profile' });
  try {
    const raw            = await callLLM(profile, recentLog || []);
    const recommendation = filterResponse(raw);
    res.json({ recommendation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'LLM call failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
