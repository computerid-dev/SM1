/**
 * pages/subjectDetail.js
 */
import { storage } from '../storage.js';
import { icon, uid, toast, openModal, closeModal, confirmAction, escapeHtml, sortBy, navigate } from '../utils.js';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function scheduleFormHtml(slot) {
  const s = slot || { day: 'Senin', startTime: '07:00', endTime: '08:30' };
  return `
    <div class="field">
      <label>Hari</label>
      <select id="f-day">
        ${DAYS.map((d) => `<option value="${d}" ${d === s.day ? 'selected' : ''}>${d}</option>`).join('')}
      </select>
    </div>
    <div class="field-row">
      <div class="field"><label>Jam Mulai</label><input type="time" id="f-start" value="${s.startTime}" /></div>
      <div class="field"><label>Jam Selesai</label><input type="time" id="f-end" value="${s.endTime}" /></div>
    </div>
  `;
}

function materialFormHtml(mat) {
  const m = mat || { chapterName: '', pages: '', summary: '', note: '' };
  return `
    <div class="field"><label>Nama Bab / Materi</label><input type="text" id="f-chapter" value="${escapeHtml(m.chapterName)}" placeholder="Contoh: Bab 3 - Trigonometri" /></div>
    <div class="field"><label>Halaman</label><input type="text" id="f-pages" value="${escapeHtml(m.pages)}" placeholder="Contoh: 45-58" /></div>
    <div class="field"><label>Ringkasan</label><textarea id="f-summary" placeholder="Ringkasan singkat materi...">${escapeHtml(m.summary)}</textarea></div>
    <div class="field"><label>Catatan</label><textarea id="f-note" placeholder="Catatan tambahan pribadi...">${escapeHtml(m.note)}</textarea></div>
  `;
}

export function renderSubjectDetail(subjectId) {
  const subject = storage.find('subjects', subjectId);
  if (!subject) {
    return `<div class="empty-state">${icon('book', 36)}<p>Mata pelajaran tidak ditemukan.</p>
      <button class="btn btn--secondary" onclick="location.hash='#/pelajaran'">Kembali ke Pelajaran</button></div>`;
  }
  const schedule = sortBy(subject.schedule || [], (s) => DAYS.indexOf(s.day) * 100 + Number(s.startTime.replace(':', '')));
  const materials = subject.materials || [];

  return `
    <button class="btn btn--ghost btn--sm" id="back-to-subjects">${icon('chevronLeft', 15)} Kembali</button>

    <div class="card mt-6">
      <div class="card__body flex-between">
        <div>
          <span class="badge badge--info">${escapeHtml(subject.category || 'Umum')}</span>
          <h2 style="margin-top:var(--sp-3);font-size:var(--fs-xl);">${escapeHtml(subject.name)}</h2>
          <p class="text-muted" style="margin-top:4px;">${escapeHtml(subject.teacher || 'Belum ada guru')}</p>
        </div>
      </div>
    </div>

    <div class="grid grid--2 mt-6">
      <div class="card">
        <div class="card__header">
          <h3>Jadwal</h3>
          <button class="btn btn--ghost btn--sm" id="add-schedule">${icon('plus', 14)} Tambah</button>
        </div>
        <div class="card__body">
          ${schedule.length === 0 ? `<div class="empty-state" style="padding:var(--sp-4) 0;">${icon('schedule', 26)}<p>Belum ada jadwal.</p></div>` : `
            <ul>
              ${schedule.map((s, i) => `
                <li class="item-row">
                  <div class="item-row__icon">${icon('clock', 16)}</div>
                  <div class="item-row__body">
                    <div class="item-row__title">${s.day}</div>
                    <div class="item-row__meta">${s.startTime} - ${s.endTime}</div>
                  </div>
                  <div class="item-row__actions">
                    <button class="icon-btn" data-del-schedule="${i}">${icon('trash', 14)}</button>
                  </div>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      </div>

      <div class="card">
        <div class="card__header">
          <h3>Materi</h3>
          <button class="btn btn--ghost btn--sm" id="add-material">${icon('plus', 14)} Tambah</button>
        </div>
        <div class="card__body">
          ${materials.length === 0 ? `<div class="empty-state" style="padding:var(--sp-4) 0;">${icon('note', 26)}<p>Belum ada materi tercatat.</p></div>` : `
            <ul>
              ${materials.map((m) => `
                <li class="item-row">
                  <div class="item-row__icon">${icon('note', 16)}</div>
                  <div class="item-row__body">
                    <div class="item-row__title">${escapeHtml(m.chapterName)}</div>
                    <div class="item-row__meta">Hal. ${escapeHtml(m.pages || '-')}${m.summary ? ` &middot; ${escapeHtml(m.summary).slice(0, 60)}${m.summary.length > 60 ? '…' : ''}` : ''}</div>
                  </div>
                  <div class="item-row__actions">
                    <button class="icon-btn" data-edit-material="${m.id}">${icon('edit', 14)}</button>
                    <button class="icon-btn" data-del-material="${m.id}">${icon('trash', 14)}</button>
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

export function bindSubjectDetailEvents(root, subjectId) {
  root.querySelector('#back-to-subjects')?.addEventListener('click', () => navigate('pelajaran'));

  root.querySelector('#add-schedule')?.addEventListener('click', () => {
    openModal({
      title: 'Tambah Jadwal',
      bodyHtml: scheduleFormHtml(null),
      footerHtml: `<button class="btn btn--secondary" data-close-modal>Batal</button><button class="btn btn--primary" id="save-schedule">Simpan</button>`,
      onMount: (m) => {
        m.querySelector('#save-schedule').addEventListener('click', () => {
          const subject = storage.find('subjects', subjectId);
          const day = m.querySelector('#f-day').value;
          const startTime = m.querySelector('#f-start').value;
          const endTime = m.querySelector('#f-end').value;
          const schedule = [...(subject.schedule || []), { day, startTime, endTime }];
          storage.update('subjects', subjectId, { schedule });
          toast('Jadwal ditambahkan.');
          closeModal();
          window.dispatchEvent(new Event('hashchange'));
        });
      },
    });
  });

  root.querySelectorAll('[data-del-schedule]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-del-schedule'));
      const subject = storage.find('subjects', subjectId);
      const schedule = sortBy(subject.schedule || [], (s) => DAYS.indexOf(s.day) * 100 + Number(s.startTime.replace(':', '')));
      const target = schedule[idx];
      const filtered = (subject.schedule || []).filter((s) => s !== target);
      storage.update('subjects', subjectId, { schedule: filtered });
      window.dispatchEvent(new Event('hashchange'));
    });
  });

  root.querySelector('#add-material')?.addEventListener('click', () => openMaterialModal(subjectId, null));
  root.querySelectorAll('[data-edit-material]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const subject = storage.find('subjects', subjectId);
      const mat = (subject.materials || []).find((x) => x.id === btn.getAttribute('data-edit-material'));
      openMaterialModal(subjectId, mat);
    });
  });
  root.querySelectorAll('[data-del-material]').forEach((btn) => {
    btn.addEventListener('click', () => {
      confirmAction({
        title: 'Hapus Materi',
        message: 'Materi ini akan dihapus permanen.',
        onConfirm: () => {
          const subject = storage.find('subjects', subjectId);
          const materials = (subject.materials || []).filter((x) => x.id !== btn.getAttribute('data-del-material'));
          storage.update('subjects', subjectId, { materials });
          toast('Materi dihapus.');
          window.dispatchEvent(new Event('hashchange'));
        },
      });
    });
  });
}

function openMaterialModal(subjectId, existing) {
  openModal({
    title: existing ? 'Edit Materi' : 'Tambah Materi',
    bodyHtml: materialFormHtml(existing),
    wide: true,
    footerHtml: `<button class="btn btn--secondary" data-close-modal>Batal</button><button class="btn btn--primary" id="save-material">Simpan</button>`,
    onMount: (m) => {
      m.querySelector('#save-material').addEventListener('click', () => {
        const chapterName = m.querySelector('#f-chapter').value.trim();
        if (!chapterName) { toast('Nama bab/materi wajib diisi.', 'danger'); return; }
        const pages = m.querySelector('#f-pages').value.trim();
        const summary = m.querySelector('#f-summary').value.trim();
        const note = m.querySelector('#f-note').value.trim();
        const subject = storage.find('subjects', subjectId);
        let materials = [...(subject.materials || [])];
        if (existing) {
          materials = materials.map((x) => (x.id === existing.id ? { ...x, chapterName, pages, summary, note } : x));
        } else {
          materials.push({ id: uid('mat'), chapterName, pages, summary, note });
        }
        storage.update('subjects', subjectId, { materials });
        toast(existing ? 'Materi diperbarui.' : 'Materi ditambahkan.');
        closeModal();
        window.dispatchEvent(new Event('hashchange'));
      });
    },
  });
}
