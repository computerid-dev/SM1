/**
 * pages/notes.js
 */
import { storage } from '../storage.js';
import { icon, uid, toast, openModal, closeModal, confirmAction, escapeHtml, sortBy, todayISO, formatDate } from '../utils.js';

function subjectOptions(selectedId) {
  const subjects = storage.list('subjects');
  const opts = subjects.map((s) => `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('');
  return `<option value="">Tanpa mata pelajaran</option>${opts}`;
}

function noteFormHtml(note) {
  const n = note || { title: '', content: '', subjectId: '' };
  return `
    <div class="field"><label>Judul</label><input type="text" id="f-title" value="${escapeHtml(n.title)}" placeholder="Contoh: Rumus Turunan Fungsi" /></div>
    <div class="field"><label>Mata Pelajaran</label><select id="f-subject">${subjectOptions(n.subjectId)}</select></div>
    <div class="field"><label>Isi Catatan</label><textarea id="f-content" style="min-height:140px;" placeholder="Tulis catatan belajarmu di sini...">${escapeHtml(n.content)}</textarea></div>
  `;
}

export function renderNotes() {
  const notes = sortBy(storage.list('notes'), (n) => n.createdAt || '').reverse();
  const subjects = storage.list('subjects');

  return `
    <div class="flex-between">
      <div></div>
      <button class="btn btn--primary" id="add-note">${icon('plus', 15)} Tambah Catatan</button>
    </div>
    <div class="grid grid--3 mt-6">
      ${notes.length === 0 ? `
        <div class="card" style="grid-column:1/-1;">
          <div class="empty-state">${icon('note', 36)}<p>Belum ada catatan materi.</p></div>
        </div>
      ` : notes.map((n) => `
        <div class="card">
          <div class="card__body">
            <div class="flex-between">
              <span class="badge badge--neutral">${escapeHtml(subjects.find((s) => s.id === n.subjectId)?.name || 'Umum')}</span>
              <div class="item-row__actions">
                <button class="icon-btn" data-edit-note="${n.id}">${icon('edit', 14)}</button>
                <button class="icon-btn" data-del-note="${n.id}">${icon('trash', 14)}</button>
              </div>
            </div>
            <h3 style="margin-top:var(--sp-3);font-size:var(--fs-base);">${escapeHtml(n.title)}</h3>
            <p class="text-muted" style="font-size:var(--fs-sm);margin-top:var(--sp-2);white-space:pre-wrap;">${escapeHtml(n.content).slice(0, 160)}${n.content.length > 160 ? '…' : ''}</p>
            <p class="text-muted" style="font-size:var(--fs-xs);margin-top:var(--sp-3);">${formatDate(n.createdAt?.slice(0, 10))}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function openNoteModal(existing) {
  openModal({
    title: existing ? 'Edit Catatan' : 'Tambah Catatan',
    bodyHtml: noteFormHtml(existing),
    wide: true,
    footerHtml: `<button class="btn btn--secondary" data-close-modal>Batal</button><button class="btn btn--primary" id="save-note">Simpan</button>`,
    onMount: (m) => {
      m.querySelector('#save-note').addEventListener('click', () => {
        const title = m.querySelector('#f-title').value.trim();
        if (!title) { toast('Judul catatan wajib diisi.', 'danger'); return; }
        const subjectId = m.querySelector('#f-subject').value;
        const content = m.querySelector('#f-content').value.trim();
        if (existing) {
          storage.update('notes', existing.id, { title, subjectId, content });
          toast('Catatan diperbarui.');
        } else {
          storage.insert('notes', { id: uid('note'), title, subjectId, content, createdAt: new Date().toISOString() });
          toast('Catatan ditambahkan.');
        }
        closeModal();
        window.dispatchEvent(new Event('hashchange'));
      });
    },
  });
}

export function bindNotesEvents(root) {
  root.querySelector('#add-note')?.addEventListener('click', () => openNoteModal(null));
  root.querySelectorAll('[data-edit-note]').forEach((btn) => {
    btn.addEventListener('click', () => openNoteModal(storage.find('notes', btn.getAttribute('data-edit-note'))));
  });
  root.querySelectorAll('[data-del-note]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del-note');
      confirmAction({
        title: 'Hapus Catatan', message: 'Catatan ini akan dihapus permanen.',
        onConfirm: () => { storage.remove('notes', id); toast('Catatan dihapus.'); window.dispatchEvent(new Event('hashchange')); },
      });
    });
  });
}
