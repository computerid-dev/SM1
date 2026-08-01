/**
 * utils.js
 * Kumpulan fungsi bantu yang dipakai di seluruh halaman.
 */

const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function todayDayName() {
  return DAY_NAMES[new Date().getDay()];
}

export function formatDate(iso, opts = {}) {
  if (!iso) return '-';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const { withDay = false } = opts;
  const base = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  return withDay ? `${DAY_NAMES[d.getDay()]}, ${base}` : base;
}

export function daysUntil(iso) {
  if (!iso) return null;
  const target = new Date(`${iso}T00:00:00`);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

export function dueLabel(iso) {
  const diff = daysUntil(iso);
  if (diff === null) return { text: 'Tanpa tenggat', tone: 'neutral' };
  if (diff < 0) return { text: `Terlambat ${Math.abs(diff)} hari`, tone: 'danger' };
  if (diff === 0) return { text: 'Hari ini', tone: 'warning' };
  if (diff === 1) return { text: 'Besok', tone: 'warning' };
  if (diff <= 3) return { text: `${diff} hari lagi`, tone: 'warning' };
  return { text: `${diff} hari lagi`, tone: 'info' };
}

export function formatRupiah(amount) {
  const n = Number(amount) || 0;
  return `Rp${n.toLocaleString('id-ID')}`;
}

export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function sortBy(arr, fn) {
  return [...arr].sort((a, b) => {
    const va = fn(a);
    const vb = fn(b);
    if (va < vb) return -1;
    if (va > vb) return 1;
    return 0;
  });
}

/* ------------------------------ Toast ------------------------------ */

export function toast(message, type = 'success') {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 160ms ease';
    setTimeout(() => el.remove(), 180);
  }, 2600);
}

/* ------------------------------ Modal ------------------------------ */

export function openModal({ title, bodyHtml, footerHtml, wide = false, onMount }) {
  const root = document.getElementById('modal-root');
  root.innerHTML = `
    <div class="modal-backdrop" data-close-modal>
      <div class="modal ${wide ? 'modal--wide' : ''}" role="dialog" aria-modal="true">
        <div class="modal__header">
          <h3>${title}</h3>
          <button type="button" class="icon-btn" data-close-modal aria-label="Tutup">
            ${icon('x')}
          </button>
        </div>
        <div class="modal__body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal__footer">${footerHtml}</div>` : ''}
      </div>
    </div>
  `;
  const backdrop = root.querySelector('.modal-backdrop');
  backdrop.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close-modal')) closeModal();
  });
  if (onMount) onMount(root);
}

export function closeModal() {
  const root = document.getElementById('modal-root');
  root.innerHTML = '';
}

export function confirmAction({ title, message, confirmText = 'Hapus', danger = true, onConfirm }) {
  openModal({
    title,
    bodyHtml: `<p>${message}</p>`,
    footerHtml: `
      <button type="button" class="btn btn--secondary" data-close-modal>Batal</button>
      <button type="button" class="btn ${danger ? 'btn--danger' : 'btn--primary'}" id="confirm-yes">${confirmText}</button>
    `,
    onMount: (root) => {
      root.querySelector('#confirm-yes').addEventListener('click', () => {
        closeModal();
        onConfirm();
      });
    },
  });
}

/* ------------------------------ Ikon (inline SVG, ringan) ------------------------------ */

const ICONS = {
  dashboard: '<path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5V4.5"/>',
  task: '<path d="M9 11l3 3 5-6"/><rect x="3" y="3" width="18" height="18" rx="3"/>',
  wallet: '<rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M16 12h4"/><path d="M2.5 9h19"/>',
  exam: '<path d="M4 3h11l5 5v13H4z"/><path d="M15 3v5h5"/><path d="M8 13h8M8 17h5"/>',
  schedule: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  note: '<path d="M4 4h13l3 3v13H4z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/><circle cx="9" cy="14" r="1"/><circle cx="15" cy="14" r="1"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2M6 6l1 14h10l1-14"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  chevronLeft: '<path d="M15 18l-6-6 6-6"/>',
  chevronRight: '<path d="M9 18l6-6-6-6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
  upload: '<path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  download: '<path d="M12 21V9"/><path d="M7 16l5 5 5-5"/><path d="M4 4h16"/>',
  whatsapp: '<path d="M20.5 3.5A10.4 10.4 0 0 0 3.4 16.7L2 22l5.4-1.4A10.4 10.4 0 1 0 20.5 3.5z"/><path d="M8.5 8.7c.2-.5.5-.5.8-.5h.6c.2 0 .4 0 .6.5s.7 1.7.8 1.8a.5.5 0 0 1 0 .5c-.1.2-.2.3-.4.5s-.4.4-.2.7a7 7 0 0 0 3 2.9c.3.1.5.1.7-.1s.6-.7.8-.9.4-.2.6-.1l1.6.8c.2.1.4.2.4.4s0 1-.4 1.5-1.4 1-2.6 1c-2.3 0-4.7-1.6-6.3-4.1-1-1.5-1-2.9-.9-3.3z"/>',
  github: '<path d="M12 2a10 10 0 0 0-3.16 19.5c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-1.99 1.03-2.7-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.71 1.03 1.6 1.03 2.7 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.74c0 .26.18.58.69.48A10 10 0 0 0 12 2z"/>',
};

export function icon(name, size = 17) {
  const path = ICONS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}
