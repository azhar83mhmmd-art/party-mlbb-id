/* ============================================
   PARTY ID — ML Group Join Website
   script.js — v2
   ============================================ */

// ---- STATE ----
const state = {
  currentStep: 1,
  totalSteps: 5,
  selectedRoles: [],
  selectedPlaystyles: [],
  selectedSchedules: [],
  groupJoined: false,
  popupShown: false,
};

// ---- COUNTER ANIMATION ----
function animateCounter(el, target, suffix = '') {
  let start = 0;
  const duration = 2000;
  const step = Math.ceil(target / (duration / 16));
  const timer = setInterval(() => {
    start += step;
    if (start >= target) { start = target; clearInterval(timer); }
    el.textContent = start + suffix;
  }, 16);
}

window.addEventListener('DOMContentLoaded', () => {
  const members = document.getElementById('counter-members');
  const winrate = document.getElementById('counter-winrate');
  if (members) animateCounter(members, 500, '+');
  if (winrate) animateCounter(winrate, 78, '%');
});

// ---- PARTICLES ----
(function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = window.innerWidth, H = window.innerHeight;
  canvas.width = W; canvas.height = H;

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W; canvas.height = H;
  });

  const PARTICLE_COUNT = 60;
  const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.5,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -Math.random() * 0.5 - 0.1,
    alpha: Math.random() * 0.5 + 0.1,
    color: Math.random() > 0.6 ? '#1eb4ff' : '#f7b731',
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ---- STEP NAVIGATION ----
function nextStep(from) {
  if (!validateStep(from)) return;
  goToStep(from + 1);
}

function prevStep(from) {
  goToStep(from - 1);
}

function goToStep(target) {
  const currentEl = document.getElementById(`step-${state.currentStep}`);
  const targetEl = document.getElementById(`step-${target}`);
  if (!targetEl) return;

  currentEl.classList.remove('active');
  targetEl.classList.add('active');

  for (let i = 1; i <= state.totalSteps; i++) {
    const ind = document.getElementById(`step-ind-${i}`);
    if (!ind) continue;
    ind.classList.remove('active', 'done');
    if (i < target) ind.classList.add('done');
    else if (i === target) ind.classList.add('active');
  }

  const lines = document.querySelectorAll('.step-line');
  lines.forEach((line, idx) => {
    line.classList.remove('done');
    if (idx < target - 1) line.classList.add('done');
  });

  state.currentStep = target;
  if (target === 5) buildSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---- VALIDATION ----
function validateStep(step) {
  clearErrors();

  if (step === 1) {
    const wa = document.getElementById('wa-number').value.trim();
    if (!wa || wa.length < 8) { showError('wa-number', 'Nomor WhatsApp tidak valid.'); return false; }
    if (!/^[0-9]+$/.test(wa)) { showError('wa-number', 'Hanya masukkan angka (tanpa +62).'); return false; }
    return true;
  }

  if (step === 2) {
    if (state.selectedRoles.length === 0) { alert('⚔️ Pilih minimal 1 role yang kamu kuasai!'); return false; }
    return true;
  }

  if (step === 3) {
    const nama = document.getElementById('nama').value.trim();
    const usia = document.getElementById('usia').value.trim();
    const gender = document.getElementById('gender').value;
    const kota = document.getElementById('kota').value.trim();
    const provinsi = document.getElementById('provinsi').value;
    const rank = document.getElementById('rank').value;

    if (!nama) { showError('nama', 'Nama / nickname wajib diisi.'); return false; }
    if (!usia || isNaN(usia) || usia < 10 || usia > 60) { showError('usia', 'Masukkan usia yang valid (10-60).'); return false; }
    if (!gender) { showError('gender', 'Pilih jenis kelamin.'); return false; }
    if (!kota) { showError('kota', 'Kota wajib diisi.'); return false; }
    if (!provinsi) { showError('provinsi', 'Pilih provinsi kamu.'); return false; }
    if (!rank) { showError('rank', 'Pilih rank sekarang.'); return false; }
    return true;
  }

  if (step === 4) {
    const agree = document.getElementById('agree-rules').checked;
    if (!agree) { alert('📜 Kamu harus menyetujui aturan grup terlebih dahulu!'); return false; }
    return true;
  }

  return true;
}

function showError(fieldId, msg) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.add('error');
    let errEl = field.parentElement.querySelector('.error-msg');
    if (!errEl) {
      errEl = document.createElement('div');
      errEl.className = 'error-msg';
      field.parentElement.appendChild(errEl);
    }
    errEl.textContent = msg;
    errEl.style.display = 'block';
    field.focus();
  }
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.error-msg').forEach(el => el.style.display = 'none');
}

// ---- ROLE TOGGLE ----
function toggleRole(card) {
  const role = card.dataset.role;
  if (card.classList.contains('selected')) {
    card.classList.remove('selected');
    state.selectedRoles = state.selectedRoles.filter(r => r !== role);
  } else {
    card.classList.add('selected');
    state.selectedRoles.push(role);
  }
  renderSelectedRoles();
}

function renderSelectedRoles() {
  const container = document.getElementById('selected-roles-display');
  if (!container) return;
  container.innerHTML = state.selectedRoles.map(r => `<span class="role-tag">${r}</span>`).join('');
}

// ---- PLAYSTYLE TOGGLE ----
function togglePlaystyle(chip) {
  const style = chip.dataset.style;
  if (chip.classList.contains('selected')) {
    chip.classList.remove('selected');
    state.selectedPlaystyles = state.selectedPlaystyles.filter(s => s !== style);
  } else {
    chip.classList.add('selected');
    state.selectedPlaystyles.push(style);
  }
}

// ---- SCHEDULE TOGGLE ----
function toggleSchedule(chip) {
  const sched = chip.dataset.sched;
  if (chip.classList.contains('selected')) {
    chip.classList.remove('selected');
    state.selectedSchedules = state.selectedSchedules.filter(s => s !== sched);
  } else {
    chip.classList.add('selected');
    state.selectedSchedules.push(sched);
  }
}

// ---- BUILD SUMMARY ----
function buildSummary() {
  const wa = document.getElementById('wa-number').value.trim();
  const nama = document.getElementById('nama').value.trim();
  const usia = document.getElementById('usia').value.trim();
  const gender = document.getElementById('gender').value;
  const kota = document.getElementById('kota').value.trim();
  const provinsi = document.getElementById('provinsi').value;
  const rank = document.getElementById('rank').value;
  const server = document.getElementById('server').value;
  const roles = state.selectedRoles.join(', ') || '-';
  const playstyles = state.selectedPlaystyles.join(', ') || '-';
  const schedules = state.selectedSchedules.join(', ') || '-';

  const rows = [
    { key: 'No. WhatsApp', val: '+62' + wa },
    { key: 'Nama / Nick', val: nama },
    { key: 'Usia', val: usia + ' tahun' },
    { key: 'Gender', val: gender },
    { key: 'Kota', val: kota },
    { key: 'Provinsi', val: provinsi },
    { key: 'Rank', val: rank },
    { key: 'Server', val: server },
    { key: 'Role', val: roles },
    { key: 'Gaya Main', val: playstyles },
    { key: 'Jadwal Main', val: schedules },
  ];

  document.getElementById('summary-content').innerHTML = rows.map(r => `
    <div class="summary-row">
      <span class="summary-key">${r.key}</span>
      <span class="summary-val">${r.val}</span>
    </div>
  `).join('');
}

// ---- LIVE MEMBER COUNTER (simulated) ----
const liveMessages = [
  '🟢 <strong>23 orang</strong> bergabung hari ini',
  '🟢 <strong>1 orang</strong> baru saja bergabung',
  '🟢 Grup <strong>aktif sekarang</strong>',
  '🟢 <strong>500+ member</strong> menunggu kamu',
];
let liveIdx = 0;
setInterval(() => {
  liveIdx = (liveIdx + 1) % liveMessages.length;
  const el = document.getElementById('live-text');
  if (el) el.innerHTML = liveMessages[liveIdx];
}, 4000);

// ---- GROUP JOIN ----
function onGroupJoin() {
  state.groupJoined = true;
  setTimeout(() => { showPopup(); }, 2000);
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state.groupJoined) showPopup();
});

window.addEventListener('focus', () => {
  if (state.groupJoined) showPopup();
});

function showPopup() {
  if (state.popupShown) return;
  state.popupShown = true;
  document.getElementById('popup-overlay').classList.add('show');
}

function closePopup() {
  document.getElementById('popup-overlay').classList.remove('show');
}

document.getElementById('popup-overlay').addEventListener('click', function(e) {
  if (e.target === this) closePopup();
});

// ---- CONTACT ADMIN ----
function contactAdmin() {
  const adminNumber = '6282357961890';
  const wa = document.getElementById('wa-number').value.trim();
  const nama = document.getElementById('nama').value.trim();
  const usia = document.getElementById('usia').value.trim();
  const gender = document.getElementById('gender').value;
  const kota = document.getElementById('kota').value.trim();
  const provinsi = document.getElementById('provinsi').value;
  const rank = document.getElementById('rank').value;
  const server = document.getElementById('server').value;
  const roles = state.selectedRoles.join(', ') || '-';
  const playstyles = state.selectedPlaystyles.join(', ') || '-';
  const schedules = state.selectedSchedules.join(', ') || '-';

  const msg =
`Halo Admin Party ID! 👋

Saya ingin bergabung ke Grup Party ID.

📋 *DATA PENDAFTARAN*
━━━━━━━━━━━━━━━━━━━━
📱 No. WA      : +62${wa}
👤 Nama/Nick   : ${nama || '-'}
🎂 Usia        : ${usia ? usia + ' tahun' : '-'}
⚧️ Gender      : ${gender || '-'}
📍 Kota        : ${kota || '-'}
🗺️ Provinsi    : ${provinsi || '-'}
🏆 Rank        : ${rank || '-'}
🌐 Server      : ${server || '-'}
⚔️ Role        : ${roles}
🎯 Gaya Main   : ${playstyles}
🕐 Jadwal Main : ${schedules}
━━━━━━━━━━━━━━━━━━━━

Mohon konfirmasi keanggotaan saya. Terima kasih! 🙏`;

  window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(msg)}`, '_blank');
}

// ---- REMOVE ERROR ON INPUT ----
document.addEventListener('input', (e) => {
  if (e.target.classList.contains('error')) {
    e.target.classList.remove('error');
    const errEl = e.target.parentElement.querySelector('.error-msg');
    if (errEl) errEl.style.display = 'none';
  }
});

document.addEventListener('change', (e) => {
  if (e.target.classList.contains('error')) {
    e.target.classList.remove('error');
    const errEl = e.target.parentElement.querySelector('.error-msg');
    if (errEl) errEl.style.display = 'none';
  }
});


