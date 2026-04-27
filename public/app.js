function getProfile() { return JSON.parse(localStorage.getItem('ft_profile') || 'null'); }
function getLog()     { return JSON.parse(localStorage.getItem('ft_log')     || '[]'); }
function saveProfile(data) { localStorage.setItem('ft_profile', JSON.stringify(data)); }
function saveLog(log)      { localStorage.setItem('ft_log',     JSON.stringify(log)); }

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

document.addEventListener('DOMContentLoaded', () => {
  const navBtns  = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('main section');

  function activateSection(targetId) {
    navBtns.forEach(b => b.classList.remove('active'));
    sections.forEach(s => s.classList.remove('active'));
    document.querySelector(`.nav-btn[data-target="${targetId}"]`).classList.add('active');
    document.getElementById(targetId).classList.add('active');
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');

      if (btn.dataset.target === 'profile')  prefillProfile();
      if (btn.dataset.target === 'progress') renderProgress();
    });
  });

  if (getProfile()) activateSection('log');

  document.getElementById('profile-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    saveProfile({ name: f.name.value.trim(), age: Number(f.age.value), goal: f.goal.value });
    activateSection('log');
  });

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
    const confirm = document.getElementById('log-confirm');
    confirm.style.display = '';
    setTimeout(() => { confirm.style.display = 'none'; }, 2000);
  });

  document.getElementById('export-btn').addEventListener('click', () => {
    const data = { profile: getProfile(), log: getLog() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'fitbuddy-data.json' });
    a.click();
    URL.revokeObjectURL(url);
  });

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
      output.textContent = data.recommendation ?? data.error ?? 'No response received.';
    } catch {
      output.textContent = 'Something went wrong. Please try again.';
    } finally {
      btn.disabled = false;
    }
  });
});
