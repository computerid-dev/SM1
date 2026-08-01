/**
 * pages/schedule.js
 */
import { storage } from '../storage.js';
import { icon, sortBy, escapeHtml, navigate } from '../utils.js';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export function renderSchedule() {
  const subjects = storage.list('subjects');
  const byDay = {};
  DAYS.forEach((d) => { byDay[d] = []; });
  subjects.forEach((s) => {
    (s.schedule || []).forEach((slot) => {
      if (byDay[slot.day]) byDay[slot.day].push({ ...slot, subjectName: s.name, subjectId: s.id });
    });
  });
  DAYS.forEach((d) => { byDay[d] = sortBy(byDay[d], (s) => s.startTime); });

  const hasAny = subjects.some((s) => (s.schedule || []).length > 0);

  if (!hasAny) {
    return `
      <div class="card">
        <div class="empty-state">
          ${icon('schedule', 36)}
          <p>Belum ada jadwal. Tambahkan jadwal lewat halaman detail masing-masing mata pelajaran.</p>
          <button class="btn btn--primary" id="go-subjects">Buka Pelajaran</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="grid grid--3">
      ${DAYS.map((day) => `
        <div class="card">
          <div class="card__header"><h3>${day}</h3></div>
          <div class="card__body">
            ${byDay[day].length === 0 ? '<p class="text-muted" style="font-size:var(--fs-xs);">Tidak ada jadwal.</p>' : `
              <ul>
                ${byDay[day].map((s) => `
                  <li class="item-row" style="cursor:pointer;" data-goto-subject="${s.subjectId}">
                    <div class="item-row__icon">${icon('clock', 15)}</div>
                    <div class="item-row__body">
                      <div class="item-row__title">${escapeHtml(s.subjectName)}</div>
                      <div class="item-row__meta">${s.startTime} - ${s.endTime}</div>
                    </div>
                  </li>
                `).join('')}
              </ul>
            `}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function bindScheduleEvents(root) {
  root.querySelector('#go-subjects')?.addEventListener('click', () => navigate('pelajaran'));
  root.querySelectorAll('[data-goto-subject]').forEach((el) => {
    el.addEventListener('click', () => navigate(`pelajaran-detail/${el.getAttribute('data-goto-subject')}`));
  });
}
