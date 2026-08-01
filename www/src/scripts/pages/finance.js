/**
 * pages/finance.js
 */
import { storage } from '../storage.js';
import { icon, uid, toast, openModal, closeModal, confirmAction, escapeHtml, sortBy, formatDate, formatRupiah, todayISO } from '../utils.js';

function trxFormHtml(trx) {
  const t = trx || { type: 'in', amount: '', date: todayISO(), note: '' };
  return `
    <div class="field">
      <label>Jenis</label>
      <div class="chip-select">
        <button type="button" class="chip ${t.type === 'in' ? 'is-active' : ''}" data-type="in">Pemasukan</button>
        <button type="button" class="chip ${t.type === 'out' ? 'is-active' : ''}" data-type="out">Pengeluaran</button>
      </div>
      <input type="hidden" id="f-type" value="${t.type}" />
    </div>
    <div class="field-row">
      <div class="field"><label>Jumlah (Rp)</label><input type="number" id="f-amount" min="0" value="${t.amount}" placeholder="0" /></div>
      <div class="field"><label>Tanggal</label><input type="date" id="f-date" value="${t.date}" /></div>
    </div>
    <div class="field"><label>Keterangan</label><input type="text" id="f-note" value="${escapeHtml(t.note || '')}" placeholder="Contoh: Uang sangu harian, beli buku, dll" /></div>
  `;
}

export function renderFinance() {
  const trx = sortBy(storage.list('financeTransactions'), (t) => t.date).reverse();
  const balance = trx.reduce((sum, t) => sum + (t.type === 'in' ? t.amount : -t.amount), 0);
  const totalIn = trx.filter((t) => t.type === 'in').reduce((s, t) => s + t.amount, 0);
  const totalOut = trx.filter((t) => t.type === 'out').reduce((s, t) => s + t.amount, 0);

  return `
    <div class="grid grid--3">
      <div class="stat-card">
        <div class="stat-card__icon" style="background:var(--accent-soft);color:var(--accent);">${icon('wallet', 17)}</div>
        <div class="stat-card__label">Saldo Saat Ini</div>
        <div class="stat-card__value">${formatRupiah(balance)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:var(--color-success-bg);color:var(--color-success);">${icon('download', 17)}</div>
        <div class="stat-card__label">Total Pemasukan</div>
        <div class="stat-card__value">${formatRupiah(totalIn)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon" style="background:var(--color-danger-bg);color:var(--color-danger);">${icon('upload', 17)}</div>
        <div class="stat-card__label">Total Pengeluaran</div>
        <div class="stat-card__value">${formatRupiah(totalOut)}</div>
      </div>
    </div>

    <div class="flex-between mt-6">
      <h3 class="section-title" style="margin:0;">Riwayat Transaksi</h3>
      <button class="btn btn--primary" id="add-trx">${icon('plus', 15)} Catat Transaksi</button>
    </div>

    <div class="card mt-6">
      <div class="card__body">
        ${trx.length === 0 ? `<div class="empty-state">${icon('wallet', 36)}<p>Belum ada transaksi tercatat.</p></div>` : `
          <ul>
            ${trx.map((t) => `
              <li class="item-row">
                <div class="item-row__icon" style="background:${t.type === 'in' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)'};color:${t.type === 'in' ? 'var(--color-success)' : 'var(--color-danger)'};">
                  ${icon(t.type === 'in' ? 'download' : 'upload', 16)}
                </div>
                <div class="item-row__body">
                  <div class="item-row__title">${escapeHtml(t.note || (t.type === 'in' ? 'Pemasukan' : 'Pengeluaran'))}</div>
                  <div class="item-row__meta">${formatDate(t.date)}</div>
                </div>
                <div class="item-row__title" style="color:${t.type === 'in' ? 'var(--color-success)' : 'var(--color-danger)'};">
                  ${t.type === 'in' ? '+' : '-'}${formatRupiah(t.amount)}
                </div>
                <div class="item-row__actions">
                  <button class="icon-btn" data-del-trx="${t.id}">${icon('trash', 14)}</button>
                </div>
              </li>
            `).join('')}
          </ul>
        `}
      </div>
    </div>
  `;
}

function openTrxModal() {
  openModal({
    title: 'Catat Transaksi',
    bodyHtml: trxFormHtml(null),
    footerHtml: `<button class="btn btn--secondary" data-close-modal>Batal</button><button class="btn btn--primary" id="save-trx">Simpan</button>`,
    onMount: (m) => {
      m.querySelectorAll('[data-type]').forEach((chip) => {
        chip.addEventListener('click', () => {
          m.querySelectorAll('[data-type]').forEach((c) => c.classList.remove('is-active'));
          chip.classList.add('is-active');
          m.querySelector('#f-type').value = chip.getAttribute('data-type');
        });
      });
      m.querySelector('#save-trx').addEventListener('click', () => {
        const amount = Number(m.querySelector('#f-amount').value);
        if (!amount || amount <= 0) { toast('Jumlah harus lebih dari 0.', 'danger'); return; }
        const type = m.querySelector('#f-type').value;
        const date = m.querySelector('#f-date').value || todayISO();
        const note = m.querySelector('#f-note').value.trim();
        storage.insert('financeTransactions', { id: uid('trx'), type, amount, date, note });
        toast('Transaksi dicatat.');
        closeModal();
        window.dispatchEvent(new Event('hashchange'));
      });
    },
  });
}

export function bindFinanceEvents(root) {
  root.querySelector('#add-trx')?.addEventListener('click', openTrxModal);
  root.querySelectorAll('[data-del-trx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-del-trx');
      confirmAction({
        title: 'Hapus Transaksi', message: 'Transaksi ini akan dihapus permanen.',
        onConfirm: () => { storage.remove('financeTransactions', id); toast('Transaksi dihapus.'); window.dispatchEvent(new Event('hashchange')); },
      });
    });
  });
}
