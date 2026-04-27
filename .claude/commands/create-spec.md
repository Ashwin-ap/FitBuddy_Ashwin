---
description: Create a spec file and feature branch for the next FitBuddy session
argument-hint: "Session number and feature name e.g. 2 frontend-shell"
allowed-tools: Read, Write, Glob, Bash(git:*)
---

You are a senior developer spinning up a new session for the
FitBuddy personal fitness tracker. Always follow the rules in CLAUDE.md.

User input: $ARGUMENTS

## Step 1 — Check working directory is clean

Run `git status` and check for uncommitted, unstaged, or
untracked files. If any exist, stop immediately and tell
the user to commit or stash changes before proceeding.
DO NOT CONTINUE until the working directory is clean.

## Step 2 — Parse the arguments

From $ARGUMENTS extract:

1. `session_number` — zero-padded to 2 digits: 2 → 02, 11 → 11
2. `feature_title` — human-readable title in Title Case
   - Example: "Frontend Shell" or "AI Integration"
3. `feature_slug` — git- and file-safe slug
   - Lowercase, kebab-case
   - Only a-z, 0-9 and -
   - Maximum 40 characters
   - Example: frontend-shell, ai-integration
4. `branch_name` — format: `session/<feature_slug>`
   - Example: `session/frontend-shell`

If you cannot infer these from $ARGUMENTS, ask the user
to clarify before proceeding.

## Step 3 — Check branch name is not taken

Run `git branch` to list existing branches.
If `branch_name` is already taken, append a number:
`session/frontend-shell-01`, `session/frontend-shell-02` etc.

## Step 4 — Switch to main and pull latest

Run:
```
git checkout main
git pull origin main
```

## Step 5 — Create and switch to the feature branch

Run:
```
git checkout -b <branch_name>
```

## Step 6 — Research the codebase

Read these files before writing the spec:

- `CLAUDE.md` — roadmap, conventions, hard rules, project structure
- `PRD.md` — product spec, user flows, AI design, success criteria
- `mvp-tool-design.md` — architecture decisions and reasoning
- `implementation-plan.md` — session breakdown and build order
- `server.js` — existing Express server and routes (if it exists)
- `public/index.html` — current frontend markup (if it exists)
- `public/style.css` — current styles (if it exists)
- `public/app.js` — current frontend logic (if it exists)
- All files in `.claude/specs/` — avoid duplicating existing specs

Check `CLAUDE.md` and `implementation-plan.md` to confirm the
requested session is not already marked complete. If it is,
warn the user and stop.

## Step 7 — Write the spec

Generate a spec document with this exact structure:

---

```
# Spec — Session <session_number>: <feature_title>

## Goal
One sentence describing what this session delivers.

## Inputs
What exists coming into this session — files, state,
and which previous sessions must be complete.

## Outputs
Exact list of files created or modified, and what changes
in each.

## Acceptance Criteria
Checklist — done when all boxes are ticked. Each item must
be something that can be verified by running the app.

## Implementation Notes
Specific logic, edge cases, or constraints to keep in mind.
Always include the following hard rules from CLAUDE.md:

- No frameworks — vanilla HTML, CSS, JS only
- No database — localStorage only (keys: ft_profile, ft_log)
- API key never in code — read from process.env in server.js only
- No extra files beyond what the spec or project structure defines
- No extra features beyond what this session spec describes
- server.js is the only backend file — no routes/, controllers/, etc.
```

---

## Step 8 — Save the spec

Save to: `.claude/specs/spec-<session_number>-<feature_slug>.md`

Example: `.claude/specs/spec-02-frontend-shell.md`

## Step 9 — Report to the user

Print a short summary in this exact format:

```
Branch:    <branch_name>
Spec file: .claude/specs/spec-<session_number>-<feature_slug>.md
Title:     <feature_title>
```

Then tell the user:

"Review the spec at `.claude/specs/spec-<session_number>-<feature_slug>.md`
then enter Plan Mode with Shift+Tab twice to begin implementation."

Do not print the full spec in chat unless explicitly asked.