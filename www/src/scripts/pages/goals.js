/**
 * pages/goals.js
 */
import { storage } from '../storage.js';
import { icon, uid, toast, openModal, closeModal, confirmAction, escapeHtml, sortBy, formatDate } from '../utils.js';

function goalFormHtml(goal) {
  const g = goal || { text: '', targetDate: '' };
  return `
    <div class="field"><label>Target Belajar</label><input type="text" id="f-text" value="${escapeHtml(g.text)}" placeholder="Contoh: Hafal 50 rumus fisika" /></div>
    <div class="field"><label>Tenggat (opsional)</label><input type="date" id="f-date" value="${g.targetDate || ''}" /></div>
  `;
}

export function renderGoals() {
  const goals = sortBy(storage.list('goals'), (g) => g.targetDate || '9999');
  const active = goals.filter((g) => !g.done);
  const done = goals.filter((g) => g.done);
  const progress = goals.length === 0 ? 0 : Math.round((done.length / goals.length) * 100);

  return `
    <div class="card">
      <div class="card__body">
        <div class="flex-between">
          <div>
            <div class="stat-card__label">Progres Keseluruhan</div>
            <div class="stat-card__value" style="margin-top:var(--sp-2);">${progress}%</div>
          </div>
          <button class="btn btn--primary" id="add-goal">${icon('plus', 15)} Tambah Target</button>
        </div>
        <div class="progress-bar mt-6"><div class="progress-bar__fill" style="width:${progress}%"></div></div>
      </div>
    </div>

    <div class="grid grid--2 mt-6">
      <div class="card">
        <div class="card__header"><h3>Sedang Berjalan</h3></div>
        <div class="card__body">
          ${active.length === 0 ? `<p class="text-muted" style="font-size:var(--fs-sm);">Tidak ada target aktif.</p>` : `
            <ul>
              ${active.map((g) => `
                <li class="item-row">
                  <button class="icon-btn" data-toggle-goal="${g.id}">${icon('check', 15)}</button>
                  <div class="item-row__body">
                    <div class="item-row__title">${escapeHtml(g.text)}</div>
                    ${g.targetDate ? `<div class="item-row__meta">Target: ${formatDate(g.targetDate)}</div>` : ''}
                  </div>
                  <div class="item-row__actions">
                    <button class="icon-btn" data-del-goal="${g.id}">${icon('trash', 14)}</button>
                  </div>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </div>
      <div class="card">
        <div class="card__header"><h3>Selesai</h3></div>
        <div class="card__body">
          ${done.length === 0 ? `<p class="text-muted" style="font-size:var(--fs-sm);">Belum ada target yang selesai.</p>` : `
            <ul>
              ${done.map((g) => `
                <li class="item-row">
                  <button class="icon-btn" data-toggle-goal="${g.id}" style="color:var(--color-success);">${icon('check', 15)}</button>
                  <div class="item-row__body">
                    <div class="item-row__title" style="text-decoration:line-through;color:var(--text-secondary);">${escapeHtml(g.text)}</div>
                  </div>
                  <div class="item-row__actions">
                    <button class="icon-btn" data-del-goal="${g.id}">${icon('trash', 14)}</button>
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

function openGoalModal() {
  openModal({
    title: 'Tambah Target Belajar',
    bodyHtml: goalFormHtml(null),
    footerHtml: `<button class="btn btn--secondary" data-close-modal>Batal</button><button class="btn btn--primary" id="save-goal">Simpan</button>`,
    onMount: (m) => {
      m.querySelector('#save-goal').addEventListener('click', () => {
        const text = m.querySelector('#f-text').value.trim();
        if (!text) { toast('Target belajar wajib diisi.', 'danger'); return; }
        const targetDate = m.querySelector('#f-date').value;
        storage.insert('goals', { id: uid('goal'), text, targetDate, done: false });
        toast('Target ditambahkan.');
        closeModal();
        window.dispatchEvent(new Event('hashchange'));
      });
    },
  });
}

export function bindGoalsEvents(root) {
  root.querySelector('#add-goal')?.addEventListener('click', openGoalModal);
  root.querySelectorAll('[data-toggle-goal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const goal = storage.find('goals', btn.getAttribute('data-toggle-goal'));
      storage.update('goals', goal.id, { done: !goal.done });
      window.dispatchEvent(new Event('hashchange'));
    });
  });
  root.querySelectorAll('[data-del-goal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del-goal');
      confirmAction({
        title: 'Hapus Target', message: 'Target belajar ini akan dihapus permanen.',
        onConfirm: () => { storage.remove('goals', id); toast('Target dihapus.'); window.dispatchEvent(new Event('hashchange')); },
      });
    });
  });
}
