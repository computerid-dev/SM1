/**
 * pages/subjects.js
 */
import { storage } from '../storage.js';
import { icon, uid, toast, openModal, closeModal, confirmAction, escapeHtml, navigate } from '../utils.js';

function categoryChips(selected, categories) {
  return categories.map((c) => `
    <button type="button" class="chip ${c === selected ? 'is-active' : ''}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>
  `).join('');
}

function subjectFormHtml(subject, categories) {
  const s = subject || { name: '', teacher: '', category: categories[0] || '' };
  return `
    <div class="field">
      <label>Nama Pelajaran</label>
      <input type="text" id="f-name" value="${escapeHtml(s.name)}" placeholder="Contoh: Matematika Peminatan" />
    </div>
    <div class="field">
      <label>Nama Guru</label>
      <input type="text" id="f-teacher" value="${escapeHtml(s.teacher || '')}" placeholder="Contoh: Bu Sari" />
    </div>
    <div class="field">
      <label>Kategori</label>
      <div class="chip-select" id="f-category-chips">${categoryChips(s.category, categories)}</div>
      <input type="hidden" id="f-category" value="${escapeHtml(s.category || '')}" />
    </div>
  `;
}

function openSubjectModal(existing) {
  const categories = storage.list('categories');
  openModal({
    title: existing ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran',
    bodyHtml: subjectFormHtml(existing, categories),
    footerHtml: `
      <button type="button" class="btn btn--secondary" data-close-modal>Batal</button>
      <button type="button" class="btn btn--primary" id="save-subject">Simpan</button>
    `,
    onMount: (root) => {
      root.querySelectorAll('#f-category-chips .chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          root.querySelectorAll('#f-category-chips .chip').forEach((c) => c.classList.remove('is-active'));
          chip.classList.add('is-active');
          root.querySelector('#f-category').value = chip.getAttribute('data-category');
        });
      });
      root.querySelector('#save-subject').addEventListener('click', () => {
        const name = root.querySelector('#f-name').value.trim();
        if (!name) { toast('Nama pelajaran wajib diisi.', 'danger'); return; }
        const teacher = root.querySelector('#f-teacher').value.trim();
        const category = root.querySelector('#f-category').value;
        if (existing) {
          storage.update('subjects', existing.id, { name, teacher, category });
          toast('Pelajaran diperbarui.');
        } else {
          storage.insert('subjects', {
            id: uid('subj'), name, teacher, category,
            schedule: [], materials: [],
          });
          toast('Pelajaran ditambahkan.');
        }
        closeModal();
        navigate('pelajaran');
        window.dispatchEvent(new Event('hashchange'));
      });
    },
  });
}

function openCategoryModal() {
  const render = () => {
    const categories = storage.list('categories');
    return `
      <ul>
        ${categories.map((c) => `
          <li class="item-row">
            <div class="item-row__body"><div class="item-row__title">${escapeHtml(c)}</div></div>
            <div class="item-row__actions">
              <button class="icon-btn" data-del-cat="${escapeHtml(c)}">${icon('trash', 15)}</button>
            </div>
          </li>
        `).join('')}
      </ul>
      <div class="field mt-6">
        <label>Tambah Kategori Baru</label>
        <div class="flex gap-2">
          <input type="text" id="new-cat" placeholder="Contoh: Ekstrakurikuler" />
          <button class="btn btn--primary btn--sm" id="add-cat">Tambah</button>
        </div>
      </div>
    `;
  };

  openModal({
    title: 'Kelola Kategori',
    bodyHtml: render(),
    onMount: (root) => {
      const refresh = () => {
        root.querySelector('.modal__body').innerHTML = render();
        bind();
      };
      const bind = () => {
        root.querySelectorAll('[data-del-cat]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-del-cat');
            const cats = storage.list('categories').filter((c) => c !== cat);
            storage.replaceAll('categories', cats);
            refresh();
          });
        });
        root.querySelector('#add-cat').addEventListener('click', () => {
          const input = root.querySelector('#new-cat');
          const val = input.value.trim();
          if (!val) return;
          const cats = storage.list('categories');
          if (cats.includes(val)) { toast('Kategori sudah ada.', 'danger'); return; }
          storage.replaceAll('categories', [...cats, val]);
          refresh();
        });
      };
      bind();
    },
  });
}

export function renderSubjects() {
  const subjects = storage.list('subjects');
  return `
    <div class="flex-between">
      <div></div>
      <div class="flex gap-2">
        <button class="btn btn--secondary" id="manage-categories">${icon('settings', 15)} Kelola Kategori</button>
        <button class="btn btn--primary" id="add-subject">${icon('plus', 15)} Tambah Pelajaran</button>
      </div>
    </div>

    <div class="grid grid--3 mt-6">
      ${subjects.length === 0 ? `
        <div class="card" style="grid-column: 1 / -1;">
          <div class="empty-state">
            ${icon('book', 36)}
            <p>Belum ada mata pelajaran. Tambahkan pelajaran pertamamu.</p>
            <button class="btn btn--primary" id="add-subject-empty">${icon('plus', 15)} Tambah Pelajaran</button>
          </div>
        </div>
      ` : subjects.map((s) => `
        <div class="card" style="cursor:pointer;" data-open-subject="${s.id}">
          <div class="card__body">
            <div class="flex-between">
              <span class="badge badge--info">${escapeHtml(s.category || 'Umum')}</span>
              <div class="item-row__actions" data-stop-propagation>
                <button class="icon-btn" data-edit-subject="${s.id}">${icon('edit', 15)}</button>
                <button class="icon-btn" data-del-subject="${s.id}">${icon('trash', 15)}</button>
              </div>
            </div>
            <h3 style="margin-top:var(--sp-3);font-size:var(--fs-md);">${escapeHtml(s.name)}</h3>
            <p class="text-muted" style="font-size:var(--fs-xs);margin-top:4px;">${escapeHtml(s.teacher || 'Belum ada guru')}</p>
            <div class="flex gap-3 mt-6" style="font-size:var(--fs-xs);color:var(--text-secondary);">
              <span>${(s.schedule || []).length} jadwal</span>
              <span>&middot;</span>
              <span>${(s.materials || []).length} materi</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function bindSubjectsEvents(root) {
  root.querySelectorAll('#add-subject, #add-subject-empty').forEach((btn) => {
    btn?.addEventListener('click', () => openSubjectModal(null));
  });
  root.querySelector('#manage-categories')?.addEventListener('click', openCategoryModal);

  root.querySelectorAll('[data-open-subject]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-stop-propagation]')) return;
      navigate(`pelajaran-detail/${card.getAttribute('data-open-subject')}`);
    });
  });
  root.querySelectorAll('[data-edit-subject]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const subject = storage.find('subjects', btn.getAttribute('data-edit-subject'));
      openSubjectModal(subject);
    });
  });
  root.querySelectorAll('[data-del-subject]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-del-subject');
      confirmAction({
        title: 'Hapus Mata Pelajaran',
        message: 'Semua jadwal dan materi pada pelajaran ini akan ikut terhapus. Lanjutkan?',
        onConfirm: () => {
          storage.remove('subjects', id);
          toast('Pelajaran dihapus.');
          window.dispatchEvent(new Event('hashchange'));
        },
      });
    });
  });
}
