/**
 * pages/tasks.js
 */
import { storage } from '../storage.js';
import { icon, uid, toast, openModal, closeModal, confirmAction, escapeHtml, sortBy, dueLabel, formatDate } from '../utils.js';

function subjectOptions(selectedId) {
  const subjects = storage.list('subjects');
  if (subjects.length === 0) return '<option value="">Belum ada mata pelajaran</option>';
  return subjects.map((s) => `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('');
}

function taskFormHtml(task) {
  const t = task || { name: '', subjectId: '', deadline: '', note: '' };
  return `
    <div class="field"><label>Nama Tugas</label><input type="text" id="f-name" value="${escapeHtml(t.name)}" placeholder="Contoh: LKS Bab 4 nomor 1-10" /></div>
    <div class="field"><label>Mata Pelajaran</label><select id="f-subject">${subjectOptions(t.subjectId)}</select></div>
    <div class="field"><label>Tenggat Waktu</label><input type="date" id="f-deadline" value="${t.deadline || ''}" /></div>
    <div class="field"><label>Catatan</label><textarea id="f-note" placeholder="Catatan tambahan...">${escapeHtml(t.note || '')}</textarea></div>
  `;
}

let filterState = 'active';

export function renderTasks() {
  const all = storage.list('tasks');
  const subjects = storage.list('subjects');
  const withNames = all.map((t) => ({ ...t, subjectName: subjects.find((s) => s.id === t.subjectId)?.name || '' }));
  const filtered = filterState === 'all' ? withNames : filterState === 'done' ? withNames.filter((t) => t.done) : withNames.filter((t) => !t.done);
  const sorted = sortBy(filtered, (t) => t.deadline || '9999');

  return `
    <div class="flex-between">
      <div class="chip-select">
        <button class="chip ${filterState === 'active' ? 'is-active' : ''}" data-filter="active">Belum Selesai</button>
        <button class="chip ${filterState === 'done' ? 'is-active' : ''}" data-filter="done">Selesai</button>
        <button class="chip ${filterState === 'all' ? 'is-active' : ''}" data-filter="all">Semua</button>
      </div>
      <button class="btn btn--primary" id="add-task">${icon('plus', 15)} Tambah Tugas</button>
    </div>

    <div class="card mt-6">
      <div class="card__body">
        ${sorted.length === 0 ? `<div class="empty-state">${icon('task', 36)}<p>Tidak ada tugas pada filter ini.</p></div>` : `
          <ul>
            ${sorted.map((t) => {
              const due = dueLabel(t.deadline);
              return `
                <li class="item-row">
                  <button class="icon-btn" data-toggle-task="${t.id}" style="${t.done ? 'color:var(--color-success);' : ''}">${icon('check', 16)}</button>
                  <div class="item-row__body">
                    <div class="item-row__title" style="${t.done ? 'text-decoration:line-through;color:var(--text-secondary);' : ''}">${escapeHtml(t.name)}</div>
                    <div class="item-row__meta">${escapeHtml(t.subjectName || 'Tanpa mapel')} ${t.deadline ? `&middot; ${formatDate(t.deadline)}` : ''}</div>
                  </div>
                  ${!t.done ? `<span class="badge badge--${due.tone}">${due.text}</span>` : '<span class="badge badge--success">Selesai</span>'}
                  <div class="item-row__actions">
                    <button class="icon-btn" data-edit-task="${t.id}">${icon('edit', 14)}</button>
                    <button class="icon-btn" data-del-task="${t.id}">${icon('trash', 14)}</button>
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

function openTaskModal(existing) {
  if (storage.list('subjects').length === 0) {
    toast('Tambahkan mata pelajaran terlebih dahulu.', 'danger');
    return;
  }
  openModal({
    title: existing ? 'Edit Tugas' : 'Tambah Tugas',
    bodyHtml: taskFormHtml(existing),
    footerHtml: `<button class="btn btn--secondary" data-close-modal>Batal</button><button class="btn btn--primary" id="save-task">Simpan</button>`,
    onMount: (m) => {
      m.querySelector('#save-task').addEventListener('click', () => {
        const name = m.querySelector('#f-name').value.trim();
        if (!name) { toast('Nama tugas wajib diisi.', 'danger'); return; }
        const subjectId = m.querySelector('#f-subject').value;
        const deadline = m.querySelector('#f-deadline').value;
        const note = m.querySelector('#f-note').value.trim();
        if (existing) {
          storage.update('tasks', existing.id, { name, subjectId, deadline, note });
          toast('Tugas diperbarui.');
        } else {
          storage.insert('tasks', { id: uid('task'), name, subjectId, deadline, note, done: false });
          toast('Tugas ditambahkan.');
        }
        closeModal();
        window.dispatchEvent(new Event('hashchange'));
      });
    },
  });
}

export function bindTasksEvents(root) {
  root.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => { filterState = btn.getAttribute('data-filter'); window.dispatchEvent(new Event('hashchange')); });
  });
  root.querySelector('#add-task')?.addEventListener('click', () => openTaskModal(null));
  root.querySelectorAll('[data-toggle-task]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const task = storage.find('tasks', btn.getAttribute('data-toggle-task'));
      storage.update('tasks', task.id, { done: !task.done });
      window.dispatchEvent(new Event('hashchange'));
    });
  });
  root.querySelectorAll('[data-edit-task]').forEach((btn) => {
    btn.addEventListener('click', () => openTaskModal(storage.find('tasks', btn.getAttribute('data-edit-task'))));
  });
  root.querySelectorAll('[data-del-task]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del-task');
      confirmAction({
        title: 'Hapus Tugas', message: 'Tugas ini akan dihapus permanen.',
        onConfirm: () => { storage.remove('tasks', id); toast('Tugas dihapus.'); window.dispatchEvent(new Event('hashchange')); },
      });
    });
  });
}
