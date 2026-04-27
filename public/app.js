function renderMarkdown(text) {
  const esc = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const lines = esc.split('\n');
  const out = [];
  let inUl = false, inOl = false;

  const inline = s => s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(?!\*)(.+?)\*(?!\*)/g, '<em>$1</em>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^#{1,3}\s/.test(line)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
      out.push('<h4>' + inline(line.replace(/^#{1,3}\s+/, '')) + '</h4>');
    } else if (/^---+$/.test(line.trim())) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
      out.push('<hr>');
    } else if (/^[-*]\s+/.test(line)) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push('<li>' + inline(line.replace(/^[-*]\s+/, '')) + '</li>');
    } else if (/^\d+\.\s+/.test(line)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push('<li>' + inline(line.replace(/^\d+\.\s+/, '')) + '</li>');
    } else if (line.trim() === '') {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
    } else {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
      out.push('<p>' + inline(line) + '</p>');
    }
  }
  if (inUl) out.push('</ul>');
  if (inOl) out.push('</ol>');
  return out.join('');
}

// ── Multi-user storage ──────────────────────────────────────────────────────

function getAllUsers()       { return JSON.parse(localStorage.getItem('ft_users') || '[]'); }
function saveAllUsers(u)     { localStorage.setItem('ft_users', JSON.stringify(u)); }
function getCurrentIndex()   { return parseInt(localStorage.getItem('ft_current') || '0', 10); }
function setCurrentIndex(i)  { localStorage.setItem('ft_current', String(i)); }

function getProfile() {
  const users = getAllUsers(), i = getCurrentIndex();
  return users[i]?.profile ?? null;
}
function getLog() {
  const users = getAllUsers(), i = getCurrentIndex();
  return users[i]?.log ?? [];
}
function saveProfile(data) {
  const users = getAllUsers(), i = getCurrentIndex();
  if (i < users.length) users[i].profile = data;
  else users.push({ profile: data, log: [] });
  saveAllUsers(users);
}
function saveLog(log) {
  const users = getAllUsers(), i = getCurrentIndex();
  if (users[i]) users[i].log = log;
  saveAllUsers(users);
}

function migrateIfNeeded() {
  if (localStorage.getItem('ft_users')) return;
  const old = localStorage.getItem('ft_profile');
  if (!old) return;
  saveAllUsers([{ profile: JSON.parse(old), log: JSON.parse(localStorage.getItem('ft_log') || '[]') }]);
  setCurrentIndex(0);
  localStorage.removeItem('ft_profile');
  localStorage.removeItem('ft_log');
}

// ── Hints ──────────────────────────────────────────────────────────────────

function updateLogHint() {
  const hint = document.getElementById('log-hint');
  if (!hint) return;
  const p = getProfile();
  const n = getLog().length;
  if (!p) { hint.textContent = ''; return; }
  if (n === 0) {
    hint.textContent = `Hi ${p.name}! Log your first activity below to start tracking your progress.`;
  } else {
    hint.textContent = `Keep it up, ${p.name}! You have ${n} activit${n === 1 ? 'y' : 'ies'} logged. Head to FitBuddy for an AI recommendation.`;
  }
}

function updateFitbuddyHint() {
  const hint = document.getElementById('fitbuddy-hint');
  if (!hint) return;
  const n = getLog().length;
  if (n === 0) {
    hint.textContent = 'Tip: Log at least one activity first to get a personalised recommendation.';
  } else if (n < 5) {
    hint.textContent = `You have ${n} activit${n === 1 ? 'y' : 'ies'} logged — FitBuddy will use ${n === 1 ? 'it' : 'them'} to personalise your advice.`;
  } else {
    hint.textContent = 'You have 5 or more activities logged. FitBuddy will use your last 5 to personalise your recommendation.';
  }
}

// ── Other helpers ──────────────────────────────────────────────────────────

function prefillProfile() {
  const p = getProfile();
  if (!p) return;
  document.getElementById('name').value = p.name;
  document.getElementById('age').value  = p.age;
  document.getElementById('goal').value = p.goal;
}

function renderProgress() {
  const log   = getLog();
  const list  = document.getElementById('progress-list');
  const empty = document.getElementById('progress-empty');
  list.innerHTML = '';
  if (log.length === 0) { empty.style.display = ''; list.style.display = 'none'; return; }
  empty.style.display = 'none';
  list.style.display = '';
  [...log].reverse().forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.date} — ${entry.activity}, ${entry.duration} min, felt ${entry.effort}`;
    list.appendChild(li);
  });
}

// ── App ────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const navBtns  = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('main section');

  function activateSection(targetId) {
    navBtns.forEach(b => b.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    document.querySelector(`.nav-btn[data-target="${targetId}"]`).classList.add('active');
    document.getElementById(targetId).classList.add('active');
  }

  function showUserPicker() {
    const users  = getAllUsers();
    const curIdx = getCurrentIndex();
    const list   = document.getElementById('user-list');
    list.innerHTML = '';
    users.forEach((u, i) => {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'user-btn' + (i === curIdx ? ' current' : '');
      btn.textContent = u.profile.name;
      btn.addEventListener('click', () => {
        setCurrentIndex(i);
        activateSection('log');
        updateLogHint();
      });
      list.appendChild(btn);
    });
    document.getElementById('user-picker').style.display      = '';
    document.getElementById('profile-form').style.display     = 'none';
    document.getElementById('switch-user-btn').style.display  = 'none';
  }

  function showProfileForm(isNew) {
    document.getElementById('user-picker').style.display     = 'none';
    document.getElementById('profile-form').style.display    = '';
    document.getElementById('switch-user-btn').style.display = getAllUsers().length > 0 ? '' : 'none';
    if (isNew) document.getElementById('profile-form').reset();
    else prefillProfile();
  }

  // Nav clicks
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');

      if (btn.dataset.target === 'profile') {
        if (getAllUsers().length > 0) showUserPicker();
        else showProfileForm(false);
      }
      if (btn.dataset.target === 'progress') renderProgress();
      if (btn.dataset.target === 'log')      document.getElementById('log-hint').textContent = '';
      if (btn.dataset.target === 'fitbuddy') updateFitbuddyHint();
    });
  });

  // Initial load
  migrateIfNeeded();
  const existing = getAllUsers();
  if (existing.length > 0) {
    if (getCurrentIndex() >= existing.length) setCurrentIndex(0);
    activateSection('log');
  }

  // Profile form
  document.getElementById('profile-form').addEventListener('submit', e => {
    e.preventDefault();
    const f    = e.target;
    const data = { name: f.name.value.trim(), age: Number(f.age.value), goal: f.goal.value };
    const users = getAllUsers();
    const i     = getCurrentIndex();
    if (i < users.length) { users[i].profile = data; saveAllUsers(users); }
    else { users.push({ profile: data, log: [] }); setCurrentIndex(users.length - 1); saveAllUsers(users); }
    activateSection('log');
  });

  // New user button
  document.getElementById('new-user-btn').addEventListener('click', () => {
    setCurrentIndex(getAllUsers().length);
    showProfileForm(true);
  });

  // Switch user button
  document.getElementById('switch-user-btn').addEventListener('click', () => {
    showUserPicker();
  });

  // Activity log form
  document.getElementById('log-form').addEventListener('submit', e => {
    e.preventDefault();
    const f   = e.target;
    const log = getLog();
    log.push({
      activity: f.activity.value.trim(),
      duration: Number(f.duration.value),
      effort:   f.effort.value,
      date:     new Date().toISOString().split('T')[0]
    });
    saveLog(log);
    f.reset();
    updateLogHint();
    const confirm = document.getElementById('log-confirm');
    confirm.style.display = '';
    setTimeout(() => { confirm.style.display = 'none'; }, 2000);
  });

  // Export
  document.getElementById('export-btn').addEventListener('click', () => {
    const name = getProfile()?.name || 'data';
    const data = { profile: getProfile(), log: getLog() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: `fitbuddy-${name}.json` });
    a.click();
    URL.revokeObjectURL(url);
  });

  // FitBuddy
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ profile, recentLog })
      });
      const data = await res.json();
      if (data.recommendation) {
        output.innerHTML = renderMarkdown(data.recommendation);
      } else {
        output.textContent = data.error ?? 'No response received.';
      }
    } catch {
      output.textContent = 'Something went wrong. Please try again.';
    } finally {
      btn.disabled = false;
    }
  });
});
