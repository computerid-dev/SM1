/**
 * pages/dashboard.js
 */
import { storage } from '../storage.js';
import { icon, formatDate, dueLabel, sortBy, formatRupiah, todayDayName, todayISO, navigate } from '../utils.js';

function computeFinanceBalance() {
  const trx = storage.list('financeTransactions');
  return trx.reduce((sum, t) => sum + (t.type === 'in' ? t.amount : -t.amount), 0);
}

function computeTodayFinance() {
  const trx = storage.list('financeTransactions').filter((t) => t.date === todayISO());
  const income = trx.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const expense = trx.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);
  return { income, expense, net: income - expense };
}

function todaySchedule() {
  const subjects = storage.list('subjects');
  const today = todayDayName();
  const slots = [];
  subjects.forEach((s) => {
    (s.schedule || []).forEach((slot) => {
      if (slot.day === today) slots.push({ ...slot, subjectName: s.name });
    });
  });
  return sortBy(slots, (s) => s.startTime);
}

export function renderDashboard() {
  const tasks = storage.list('tasks').filter((t) => !t.done);
  const exams = storage.list('exams');
  const goals = storage.list('goals');
  const settings = storage.getSettings();

  const upcomingTasks = sortBy(tasks, (t) => t.deadline || '9999').slice(0, 5);
  const upcomingExams = sortBy(exams, (e) => e.date || '9999').slice(0, 4);
  const schedule = todaySchedule();
  const balance = computeFinanceBalance();
  const todayFinance = computeTodayFinance();
  const activeGoals = goals.filter((g) => !g.done);

  return `
    <div class="flex-between mt-6" style="margin-top:0;">
      <div>
        <h2 class="topbar__subtitle" style="margin:0;">Halo, ${settings.username || 'Pelajar'} 👋</h2>
      </div>
    </div>

    <div class="grid grid--4 mt-6">
      <div class="stat-card">
        <div class="stat-card__icon" style="background:var(--color-info-bg);color:var(--color-info);">${icon('task', 17)}</div>
        <div class="stat-card__label">Tugas Belum Selesai</div>
        <div class="stat-card__value">${tasks.length}</div>
        <div class="stat-card__meta">dari seluruh mata pelajaran</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:var(--color-warning-bg);color:var(--color-warning);">${icon('exam', 17)}</div>
        <div class="stat-card__label">Ujian Mendatang</div>
        <div class="stat-card__value">${exams.length}</div>
        <div class="stat-card__meta">terjadwal ke depan</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:var(--color-success-bg);color:var(--color-success);">${icon('wallet', 17)}</div>
        <div class="stat-card__label">Saldo Uang Sangu</div>
        <div class="stat-card__value">${formatRupiah(balance)}</div>
        <div class="stat-card__meta">${todayFinance.net >= 0 ? '+' : ''}${formatRupiah(todayFinance.net)} hari ini</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:var(--accent-soft);color:var(--accent);">${icon('target', 17)}</div>
        <div class="stat-card__label">Target Aktif</div>
        <div class="stat-card__value">${activeGoals.length}</div>
        <div class="stat-card__meta">sedang dikejar</div>
      </div>
    </div>

    <div class="grid grid--2 mt-6">
      <div class="card">
        <div class="card__header">
          <h3>Jadwal Hari Ini &middot; ${todayDayName()}</h3>
          <button class="btn btn--ghost btn--sm" data-nav="jadwal">Lihat semua</button>
        </div>
        <div class="card__body">
          ${schedule.length === 0 ? emptyState('Tidak ada jadwal pelajaran hari ini.') : `
            <ul>
              ${schedule.map((s) => `
                <li class="item-row">
                  <div class="item-row__icon">${icon('schedule', 16)}</div>
                  <div class="item-row__body">
                    <div class="item-row__title">${s.subjectName}</div>
                    <div class="item-row__meta">${s.startTime} - ${s.endTime}</div>
                  </div>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </div>

      <div class="card">
        <div class="card__header">
          <h3>Tugas Terdekat</h3>
          <button class="btn btn--ghost btn--sm" data-nav="tugas">Lihat semua</button>
        </div>
        <div class="card__body">
          ${upcomingTasks.length === 0 ? emptyState('Tidak ada tugas menumpuk. Kerja bagus!') : `
            <ul>
              ${upcomingTasks.map((t) => {
                const due = dueLabel(t.deadline);
                return `
                  <li class="item-row">
                    <div class="item-row__icon">${icon('task', 16)}</div>
                    <div class="item-row__body">
                      <div class="item-row__title">${t.name}</div>
                      <div class="item-row__meta">${t.subjectName || ''}</div>
                    </div>
                    <span class="badge badge--${due.tone}">${due.text}</span>
                  </li>
                `;
              }).join('')}
            </ul>
          `}
        </div>
      </div>
    </div>

    <div class="grid grid--2 mt-6">
      <div class="card">
        <div class="card__header">
          <h3>Ujian Mendatang</h3>
          <button class="btn btn--ghost btn--sm" data-nav="ujian">Lihat semua</button>
        </div>
        <div class="card__body">
          ${upcomingExams.length === 0 ? emptyState('Belum ada ujian terjadwal.') : `
            <ul>
              ${upcomingExams.map((e) => `
                <li class="item-row">
                  <div class="item-row__icon">${icon('exam', 16)}</div>
                  <div class="item-row__body">
                    <div class="item-row__title">${e.name}</div>
                    <div class="item-row__meta">${formatDate(e.date)}</div>
                  </div>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </div>

      <div class="card">
        <div class="card__header">
          <h3>Target Belajar</h3>
          <button class="btn btn--ghost btn--sm" data-nav="target">Lihat semua</button>
        </div>
        <div class="card__body">
          ${activeGoals.length === 0 ? emptyState('Belum ada target belajar aktif.') : `
            <ul>
              ${activeGoals.slice(0, 4).map((g) => `
                <li class="item-row">
                  <div class="item-row__icon">${icon('target', 16)}</div>
                  <div class="item-row__body">
                    <div class="item-row__title">${g.text}</div>
                    ${g.targetDate ? `<div class="item-row__meta">Target: ${formatDate(g.targetDate)}</div>` : ''}
                  </div>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </div>
    </div>
  `;
}

function emptyState(text) {
  return `<div class="empty-state" style="padding:var(--sp-6) 0;">${icon('check', 28)}<p>${text}</p></div>`;
}

export function bindDashboardEvents(root) {
  root.querySelectorAll('[data-nav]').forEach((el) => {
    el.addEventListener('click', () => navigate(el.getAttribute('data-nav')));
  });
}
