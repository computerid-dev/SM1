/**
 * pages/calendar.js
 */
import { storage } from '../storage.js';
import { icon, uid, toast, openModal, closeModal, confirmAction, escapeHtml, sortBy, formatDate } from '../utils.js';

const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const TYPE_LABEL = { libur: 'Libur', acara: 'Acara', ujian: 'Ujian', deadline: 'Deadline' };
const TYPE_TONE = { libur: 'success', acara: 'info', ujian: 'danger', deadline: 'warning' };

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

function pad(n) { return String(n).padStart(2, '0'); }

function eventFormHtml(ev) {
  const e = ev || { title: '', date: '', type: 'acara' };
  return `
    <div class="field"><label>Judul Acara</label><input type="text" id="f-title" value="${escapeHtml(e.title)}" placeholder="Contoh: Libur Semester Ganjil" /></div>
    <div class="field"><label>Tanggal</label><input type="date" id="f-date" value="${e.date}" /></div>
    <div class="field">
      <label>Jenis</label>
      <select id="f-type">
        ${Object.entries(TYPE_LABEL).map(([k, v]) => `<option value="${k}" ${k === e.type ? 'selected' : ''}>${v}</option>`).join('')}
      </select>
    </div>
  `;
}

export function renderCalendar() {
  const events = storage.list('calendarEvents');
  const firstDay = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7; // mulai Senin
  const todayStr = new Date().toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const eventsByDate = {};
  events.forEach((e) => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  const upcoming = sortBy(events.filter((e) => e.date >= todayStr), (e) => e.date).slice(0, 6);

  return `
    <div class="grid" style="grid-template-columns: 2fr 1fr; gap:var(--sp-6);">
      <div class="card">
        <div class="card__header">
          <div class="flex gap-2" style="align-items:center;">
            <button class="icon-btn" id="cal-prev">${icon('chevronLeft', 16)}</button>
            <h3>${MONTH_NAMES[viewMonth]} ${viewYear}</h3>
            <button class="icon-btn" id="cal-next">${icon('chevronRight', 16)}</button>
          </div>
          <button class="btn btn--primary btn--sm" id="add-event">${icon('plus', 14)} Tambah Acara</button>
        </div>
        <div class="card__body">
          <div class="calendar-grid">
            ${['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => `<div class="calendar-day-label">${d}</div>`).join('')}
            ${cells.map((d) => {
              if (!d) return '<div class="calendar-cell is-muted"></div>';
              const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
              const isToday = dateStr === todayStr;
              const dayEvents = eventsByDate[dateStr] || [];
              return `
                <div class="calendar-cell ${isToday ? 'is-today' : ''}">
                  <div class="calendar-cell__num">${d}</div>
                  ${dayEvents.map((e) => `<div class="calendar-cell__event" title="${escapeHtml(e.title)}">${escapeHtml(e.title)}</div>`).join('')}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card__header"><h3>Acara Mendatang</h3></div>
        <div class="card__body">
          ${upcoming.length === 0 ? `<p class="text-muted" style="font-size:var(--fs-sm);">Tidak ada acara mendatang.</p>` : `
            <ul>
              ${upcoming.map((e) => `
                <li class="item-row">
                  <div class="item-row__body">
                    <div class="item-row__title">${escapeHtml(e.title)}</div>
                    <div class="item-row__meta">${formatDate(e.date)}</div>
                  </div>
                  <span class="badge badge--${TYPE_TONE[e.type] || 'neutral'}">${TYPE_LABEL[e.type] || e.type}</span>
                  <button class="icon-btn" data-del-event="${e.id}">${icon('trash', 13)}</button>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </div>
    </div>
  `;
}

function openEventModal() {
  openModal({
    title: 'Tambah Acara Kalender',
    bodyHtml: eventFormHtml(null),
    footerHtml: `<button class="btn btn--secondary" data-close-modal>Batal</button><button class="btn btn--primary" id="save-event">Simpan</button>`,
    onMount: (m) => {
      m.querySelector('#save-event').addEventListener('click', () => {
        const title = m.querySelector('#f-title').value.trim();
        const date = m.querySelector('#f-date').value;
        if (!title || !date) { toast('Judul dan tanggal wajib diisi.', 'danger'); return; }
        const type = m.querySelector('#f-type').value;
        storage.insert('calendarEvents', { id: uid('cal'), title, date, type });
        toast('Acara ditambahkan.');
        closeModal();
        window.dispatchEvent(new Event('hashchange'));
      });
    },
  });
}

export function bindCalendarEvents(root) {
  root.querySelector('#cal-prev')?.addEventListener('click', () => {
    viewMonth -= 1;
    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
    window.dispatchEvent(new Event('hashchange'));
  });
  root.querySelector('#cal-next')?.addEventListener('click', () => {
    viewMonth += 1;
    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
    window.dispatchEvent(new Event('hashchange'));
  });
  root.querySelector('#add-event')?.addEventListener('click', openEventModal);
  root.querySelectorAll('[data-del-event]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del-event');
      confirmAction({
        title: 'Hapus Acara', message: 'Acara ini akan dihapus dari kalender.',
        onConfirm: () => { storage.remove('calendarEvents', id); toast('Acara dihapus.'); window.dispatchEvent(new Event('hashchange')); },
      });
    });
  });
}
