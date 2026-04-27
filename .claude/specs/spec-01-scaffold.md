# Spec — Session 01: Scaffold

## Goal

Stand up a working Express server that serves a placeholder `index.html` from `public/`, with all config files in place and ready for subsequent sessions.

## Inputs

Coming into this session the repository contains only documentation files (`CLAUDE.md`, `PRD.md`, `mvp-tool-design.md`, `implementation-plan.md`, `raw_resources/`). No application code exists yet.

Previous sessions required: none — this is Session 1.

## Outputs

Files created:

| File | What it contains |
|------|-----------------|
| `package.json` | Project metadata; dependencies: `express`, `dotenv`, `node-fetch` |
| `server.js` | Express app — serves `public/` as static files on port 3000 |
| `.env.example` | Template with `LLM_PROVIDER` and `LLM_API_KEY` placeholders (no real values) |
| `.gitignore` | Excludes `.env` and `node_modules/` |
| `public/index.html` | Bare HTML5 boilerplate — `<html>`, `<head>`, `<body>` only; no content |
| `public/style.css` | Empty file (placeholder for Session 2) |
| `public/app.js` | Empty file (placeholder for Session 2) |

No other files are created. No existing files are modified.

## Acceptance Criteria

- [ ] `npm install` completes without errors
- [ ] `node server.js` starts and prints a confirmation message (e.g. `Server running on http://localhost:3000`)
- [ ] `http://localhost:3000` returns a 200 response and renders a blank page in the browser
- [ ] `http://localhost:3000` loads `public/index.html` (verify via network tab or page source)
- [ ] `.env` is listed in `.gitignore` — running `git status` after creating a `.env` file does not show it as tracked
- [ ] `node_modules/` is listed in `.gitignore`
- [ ] `.env.example` contains `LLM_PROVIDER=` and `LLM_API_KEY=` with no real values
- [ ] No API key appears anywhere in committed files

## Implementation Notes

**`package.json`**
- Set `"main": "server.js"` and `"type": "commonjs"` (use `require`, not `import`)
- Include a `"start"` script: `"node server.js"`
- Dependencies: `express`, `dotenv`, `node-fetch`

**`server.js`**
- Load env vars at the top: `require('dotenv').config()`
- Serve `public/` as static files: `app.use(express.static('public'))`
- Listen on `process.env.PORT || 3000`
- Log startup message to console
- No routes beyond static file serving — the `/api/recommend` endpoint is built in Session 4

**`public/index.html`**
- Valid HTML5 boilerplate with `<!DOCTYPE html>`, `<html lang="en">`, `<head>` (charset, viewport, title "FitBuddy"), and an empty `<body>`
- Link `style.css` and `app.js` in the correct positions (CSS in `<head>`, JS before `</body>`)
- No visible content — just the skeleton for Session 2 to fill

**Hard rules (from CLAUDE.md):**
- No frameworks — vanilla HTML, CSS, JS only
- No database — localStorage only (keys: `ft_profile`, `ft_log`)
- API key never in code — read from `process.env` in `server.js` only
- No extra files beyond what this spec defines
- No extra features beyond what this session describes
- `server.js` is the only backend file — no `routes/`, `controllers/`, or any other server-side files
