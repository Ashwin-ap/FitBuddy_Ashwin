# Spec — Session 03: Data Layer

## Goal

Wire up all forms to `localStorage`, add progress rendering (newest-first), and implement one-click JSON data export — no AI calls.

## Inputs

Sessions 1 and 2 must be complete before starting this session.

Files coming in:
- `server.js` — Express server, static file serving only, no routes
- `public/index.html` — Four-section SPA: Profile, Log Activity, My Progress, FitBuddy. All form fields and nav buttons present. No export button yet.
- `public/style.css` — Complete styling, no changes needed this session
- `public/app.js` — Section-switching nav logic only (DOMContentLoaded, navBtns, sections)

## Outputs

### `public/app.js` — full rewrite / extension

Extend (do not replace) the existing nav-switching logic. Add:

1. **localStorage helpers** — thin wrappers for reading and writing `ft_profile` and `ft_log`
2. **On-load check** — if `ft_profile` exists, switch to `#log` section on page load; if not, stay on `#profile`
3. **Profile form** — save on submit; pre-fill fields if profile already exists; switch to `#log` after save
4. **Activity log form** — append entry to `ft_log` on submit; show inline confirmation; reset form
5. **Progress view renderer** — called whenever `#progress` section becomes active; reads `ft_log`, renders entries newest-first
6. **Export** — reads both keys, serialises to JSON, triggers browser download of `fitbuddy-data.json`

### `public/index.html` — minor additions only

Add to the `#progress` section (after `<ul id="progress-list">`):

```html
<button id="export-btn" class="btn-primary">Export My Data</button>
```

Add a confirmation message element inside the `#log` section (after the form):

```html
<p id="log-confirm" class="log-confirm" style="display:none;">Activity logged!</p>
```

No other HTML changes.

### `public/style.css` — one addition

Add a style rule for `.log-confirm`:

```css
.log-confirm {
  color: #2d6a4f;
  font-weight: 600;
  margin-top: 0.75rem;
}
```

No other CSS changes.

## Acceptance Criteria

- [ ] First visit (no `ft_profile` in localStorage): app shows the Profile section
- [ ] Returning visit (profile exists): app opens directly to Log Activity section
- [ ] Filling in the profile form and clicking Save stores data under `ft_profile` in localStorage and switches to Log Activity
- [ ] Re-opening the Profile section shows the saved name, age, and goal pre-filled
- [ ] Submitting the Log Activity form appends a new entry (activity, duration, effort, ISO date) to `ft_log` in localStorage
- [ ] After a successful log, the form resets and "Activity logged!" appears briefly
- [ ] Navigating to My Progress shows all logged entries, newest first
- [ ] When no activities exist, "No activities logged yet." is shown and the list is hidden
- [ ] Each progress entry displays: activity name, duration, effort, and date — all readable
- [ ] Clicking "Export My Data" downloads a file named `fitbuddy-data.json` containing both `ft_profile` and `ft_log`
- [ ] The exported JSON parses cleanly and contains the correct data
- [ ] The FitBuddy section and "Get Recommendation" button are still present and navigable (no breakage)
- [ ] Refreshing the page does not lose any saved data

## Implementation Notes

**localStorage schema**

```js
// ft_profile — object
{ name: string, age: number, goal: string }

// ft_log — array of entries
[{ activity: string, duration: number, effort: string, date: string }, ...]
```

Store and retrieve with `JSON.parse` / `JSON.stringify`. Safe-read helper:

```js
function getProfile() { return JSON.parse(localStorage.getItem('ft_profile') || 'null'); }
function getLog()     { return JSON.parse(localStorage.getItem('ft_log')     || '[]'); }
```

**On-load routing**

Inside the existing `DOMContentLoaded` handler, after the nav-switching block:

```js
if (getProfile()) {
  // activate #log, deactivate #profile
} else {
  // #profile is already active by default (from HTML class="active")
}
```

Use the same `section.active` + `navBtn.active` toggle pattern already in the file.

**Profile pre-fill**

When the user navigates to the Profile section (via nav click), check `getProfile()` and populate form fields if a profile exists. Wire this inside the nav-click handler — when `btn.dataset.target === 'profile'`, run the pre-fill.

**Activity log form submit**

```js
const entry = {
  activity: form.activity.value.trim(),
  duration: Number(form.duration.value),
  effort:   form.effort.value,
  date:     new Date().toISOString().split('T')[0]  // YYYY-MM-DD
};
const log = getLog();
log.push(entry);
localStorage.setItem('ft_log', JSON.stringify(log));
```

Show `#log-confirm` for 2 seconds then hide it. Reset the form with `form.reset()`.

**Progress renderer**

```js
function renderProgress() {
  const log = getLog();
  const list = document.getElementById('progress-list');
  const empty = document.getElementById('progress-empty');
  list.innerHTML = '';
  if (log.length === 0) {
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';
  [...log].reverse().forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.date} — ${entry.activity}, ${entry.duration} min, felt ${entry.effort}`;
    list.appendChild(li);
  });
}
```

Call `renderProgress()` inside the nav-click handler when `btn.dataset.target === 'progress'`.

**Export**

```js
document.getElementById('export-btn').addEventListener('click', () => {
  const data = { profile: getProfile(), log: getLog() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: 'fitbuddy-data.json' });
  a.click();
  URL.revokeObjectURL(url);
});
```

**Hard rules (from CLAUDE.md)**

- No frameworks — vanilla HTML, CSS, JS only
- No database — `localStorage` only (keys: `ft_profile`, `ft_log`)
- API key never in code — read from `process.env` in `server.js` only
- No extra files beyond what the spec or project structure defines
- No extra features beyond what this session spec describes
- `server.js` is the only backend file — no `routes/`, `controllers/`, or any other server-side files
