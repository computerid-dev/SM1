/**
 * pages/developer.js
 */
import { icon } from '../utils.js';

const DEVELOPER = {
  name: 'Nugroho Y.R.',
  githubHandle: 'computerid-dev',
  githubPortfolio: 'https://github.com/computerindo-creator/Portfolio-01',
  whatsappChannel: 'https://whatsapp.com/channel/0029Vb86wmKEquiX3JfClN2i',
  whatsappCs: 'https://wa.me/6281522851050/',
};

export function renderDeveloper() {
  return `
    <div class="grid grid--2">
      <div class="card">
        <div class="card__header"><h3>Tentang Developer</h3></div>
        <div class="card__body">
          <div class="flex gap-3" style="align-items:center;">
            <div class="sidebar__brand-mark" style="width:48px;height:48px;font-size:var(--fs-lg);">
              ${DEVELOPER.name.charAt(0)}
            </div>
            <div>
              <div style="font-weight:700;font-size:var(--fs-md);">${DEVELOPER.name}</div>
              <div class="text-muted" style="font-size:var(--fs-xs);">Pengembang Study Mate</div>
            </div>
          </div>
          <p class="text-muted mt-6" style="font-size:var(--fs-sm);">
            Study Mate dikembangkan secara mandiri sebagai aplikasi pendamping belajar
            untuk membantu pelajar mengelola pelajaran, tugas, ujian, jadwal, dan
            keuangan sekolah dalam satu tempat — sepenuhnya offline.
          </p>
        </div>
      </div>

      <div class="card">
        <div class="card__header"><h3>Tautan &amp; Kontak</h3></div>
        <div class="card__body">
          <ul>
            <li class="item-row">
              <div class="item-row__icon">${icon('github', 16)}</div>
              <div class="item-row__body">
                <div class="item-row__title">GitHub</div>
                <div class="item-row__meta">@${DEVELOPER.githubHandle}</div>
              </div>
            </li>
            <li class="item-row">
              <div class="item-row__icon">${icon('github', 16)}</div>
              <div class="item-row__body">
                <div class="item-row__title">Portofolio</div>
                <div class="item-row__meta">github.com/computerindo-creator/Portfolio-01</div>
              </div>
              <a class="btn btn--secondary btn--sm" href="${DEVELOPER.githubPortfolio}" target="_blank" rel="noopener">Buka</a>
            </li>
            <li class="item-row">
              <div class="item-row__icon" style="background:var(--color-success-bg);color:var(--color-success);">${icon('whatsapp', 16)}</div>
              <div class="item-row__body">
                <div class="item-row__title">Saluran WhatsApp</div>
                <div class="item-row__meta">Info aplikasi &amp; update terbaru</div>
              </div>
              <a class="btn btn--secondary btn--sm" href="${DEVELOPER.whatsappChannel}" target="_blank" rel="noopener">Ikuti</a>
            </li>
            <li class="item-row">
              <div class="item-row__icon" style="background:var(--color-success-bg);color:var(--color-success);">${icon('whatsapp', 16)}</div>
              <div class="item-row__body">
                <div class="item-row__title">Tanya Fitur (CS/Bot)</div>
                <div class="item-row__meta">Pertanyaan seputar fitur aplikasi</div>
              </div>
              <a class="btn btn--secondary btn--sm" href="${DEVELOPER.whatsappCs}" target="_blank" rel="noopener">Chat</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="card" style="grid-column:1/-1;">
        <div class="card__body flex-between">
          <div>
            <div style="font-weight:700;">Study Mate</div>
            <div class="text-muted" style="font-size:var(--fs-xs);">Versi 1.0.0 &middot; com.studymate.sm.cid</div>
          </div>
          <span class="badge badge--info">Offline-First</span>
        </div>
      </div>
    </div>
  `;
}

export function bindDeveloperEvents() {}
