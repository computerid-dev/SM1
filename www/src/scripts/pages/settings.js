/**
 * pages/settings.js
 */
import { storage } from '../storage.js';
import { icon, toast, confirmAction, escapeHtml } from '../utils.js';

export function renderSettings() {
  const settings = storage.getSettings();
  return `
    <div class="grid grid--2">
      <div class="card">
        <div class="card__header"><h3>Profil</h3></div>
        <div class="card__body">
          <div class="field">
            <label>Nama Panggilan</label>
            <input type="text" id="f-username" value="${escapeHtml(settings.username || '')}" placeholder="Nama kamu" />
          </div>
          <button class="btn btn--primary" id="save-profile">Simpan Perubahan</button>
        </div>
      </div>

      <div class="card">
        <div class="card__header"><h3>Cadangkan &amp; Pulihkan Data</h3></div>
        <div class="card__body">
          <p class="text-muted" style="font-size:var(--fs-sm);margin-bottom:var(--sp-4);">
            Semua data Study Mate tersimpan di perangkat ini. Unduh cadangan secara berkala,
            atau pulihkan dari berkas JSON yang pernah kamu simpan.
          </p>
          <div class="flex gap-2">
            <button class="btn btn--secondary" id="btn-backup">${icon('download', 15)} Backup JSON</button>
            <button class="btn btn--secondary" id="btn-import">${icon('upload', 15)} Import JSON</button>
          </div>
          <input type="file" id="import-file" accept="application/json" style="display:none;" />
        </div>
      </div>

      <div class="card" style="grid-column:1/-1;">
        <div class="card__header"><h3>Zona Berbahaya</h3></div>
        <div class="card__body flex-between">
          <p class="text-muted" style="font-size:var(--fs-sm);">Menghapus seluruh data pelajaran, tugas, ujian, dan catatan secara permanen.</p>
          <button class="btn btn--danger" id="btn-reset">Reset Semua Data</button>
        </div>
      </div>
    </div>
  `;
}

export function bindSettingsEvents(root) {
  root.querySelector('#save-profile')?.addEventListener('click', () => {
    const username = root.querySelector('#f-username').value.trim() || 'Pelajar';
    storage.updateSettings({ username });
    toast('Profil diperbarui.');
  });

  root.querySelector('#btn-backup')?.addEventListener('click', () => {
    storage.downloadBackup();
    toast('Backup berhasil diunduh.');
  });

  const fileInput = root.querySelector('#import-file');
  root.querySelector('#btn-import')?.addEventListener('click', () => fileInput.click());
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        storage.importBackup(payload);
        toast('Data berhasil dipulihkan.');
        window.dispatchEvent(new Event('hashchange'));
      } catch (err) {
        toast('Berkas JSON tidak valid.', 'danger');
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  root.querySelector('#btn-reset')?.addEventListener('click', () => {
    confirmAction({
      title: 'Reset Semua Data',
      message: 'Tindakan ini akan menghapus semua data secara permanen dan tidak bisa dibatalkan. Pastikan kamu sudah membuat backup.',
      confirmText: 'Ya, Reset',
      onConfirm: () => {
        storage.resetAll();
        toast('Semua data telah direset.');
        window.dispatchEvent(new Event('hashchange'));
      },
    });
  });
}
