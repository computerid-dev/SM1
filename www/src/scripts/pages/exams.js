/**
 * pages/exams.js
 */
import { storage } from '../storage.js';
import { icon, uid, toast, openModal, closeModal, confirmAction, escapeHtml, sortBy, formatDate, daysUntil } from '../utils.js';

function subjectOptions(selectedId) {
  const subjects = storage.list('subjects');
  if (subjects.length === 0) return '<option value="">Belum ada mata pelajaran</option>';
  return subjects.map((s) => `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('');
}

function examFormHtml(exam) {
  const e = exam || { name: '', subjectId: '', date: '', material: '' };
  return `
    <div class="field"><label>Nama Ujian</label><input type="text" id="f-name" value="${escapeHtml(e.name)}" placeholder="Contoh: Ulangan Harian Bab 3" /></div>
    <div class="field"><label>Mata Pelajaran</label><select id="f-subject">${subjectOptions(e.subjectId)}</select></div>
    <div class="field"><label>Tanggal</label><input type="date" id="f-date" value="${e.date || ''}" /></div>
    <div class="field"><label>Materi yang Diujikan</label><textarea id="f-material" placeholder="Contoh: Trigonometri, Bab 3-4">${escapeHtml(e.material || '')}</textarea></div>
  `;
}

export function renderExams() {
  const exams = storage.list('exams');
  const subjects = storage.list('subjects');
  const withNames = sortBy(exams.map((e) => ({ ...e, subjectName: subjects.find((s) => s.id === e.subjectId)?.name || '' })), (e) => e.date || '9999');

  return `
    <div class="flex-between">
      <div></div>
      <button class="btn btn--primary" id="add-exam">${icon('plus', 15)} Tambah Ujian</button>
    </div>
    <div class="card mt-6">
      <div class="card__body">
        ${withNames.length === 0 ? `<div class="empty-state">${icon('exam', 36)}<p>Belum ada ujian terjadwal.</p></div>` : `
          <ul>
            ${withNames.map((e) => {
              const diff = daysUntil(e.date);
              const tone = diff === null ? 'neutral' : diff < 0 ? 'neutral' : diff <= 3 ? 'danger' : diff <= 7 ? 'warning' : 'info';
              return `
                <li class="item-row">
                  <div class="item-row__icon">${icon('exam', 16)}</div>
                  <div class="item-row__body">
                    <div class="item-row__title">${escapeHtml(e.name)}</div>
                    <div class="item-row__meta">${escapeHtml(e.subjectName)} &middot; ${formatDate(e.date, { withDay: true })}${e.material ? ` &middot; ${escapeHtml(e.material)}` : ''}</div>
                  </div>
                  ${diff !== null && diff >= 0 ? `<span class="badge badge--${tone}">${diff === 0 ? 'Hari ini' : diff + ' hari lagi'}</span>` : ''}
                  <div class="item-row__actions">
                    <button class="icon-btn" data-edit-exam="${e.id}">${icon('edit', 14)}</button>
                    <button class="icon-btn" data-del-exam="${e.id}">${icon('trash', 14)}</button>
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        `}
      </div>
    </div>
  `;
}

function openExamModal(existing) {
  if (storage.list('subjects').length === 0) { toast('Tambahkan mata pelajaran terlebih dahulu.', 'danger'); return; }
  openModal({
    title: existing ? 'Edit Ujian' : 'Tambah Ujian',
    bodyHtml: examFormHtml(existing),
    footerHtml: `<button class="btn btn--secondary" data-close-modal>Batal</button><button class="btn btn--primary" id="save-exam">Simpan</button>`,
    onMount: (m) => {
      m.querySelector('#save-exam').addEventListener('click', () => {
        const name = m.querySelector('#f-name').value.trim();
        if (!name) { toast('Nama ujian wajib diisi.', 'danger'); return; }
        const subjectId = m.querySelector('#f-subject').value;
        const date = m.querySelector('#f-date').value;
        const material = m.querySelector('#f-material').value.trim();
        if (existing) {
          storage.update('exams', existing.id, { name, subjectId, date, material });
          toast('Ujian diperbarui.');
        } else {
          storage.insert('exams', { id: uid('exam'), name, subjectId, date, material });
          toast('Ujian ditambahkan.');
        }
        closeModal();
        window.dispatchEvent(new Event('hashchange'));
      });
    },
  });
}

export function bindExamsEvents(root) {
  root.querySelector('#add-exam')?.addEventListener('click', () => openExamModal(null));
  root.querySelectorAll('[data-edit-exam]').forEach((btn) => {
    btn.addEventListener('click', () => openExamModal(storage.find('exams', btn.getAttribute('data-edit-exam'))));
  });
  root.querySelectorAll('[data-del-exam]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del-exam');
      confirmAction({
        title: 'Hapus Ujian', message: 'Data ujian ini akan dihapus permanen.',
        onConfirm: () => { storage.remove('exams', id); toast('Ujian dihapus.'); window.dispatchEvent(new Event('hashchange')); },
      });
    });
  });
}
