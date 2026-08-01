/**
 * router.js
 * Router berbasis hash — cocok untuk dibungkus WebView/APK tanpa server.
 */

import { icon } from './utils.js';

export const NAV_GROUPS = [
  {
    label: 'Utama',
    items: [
      { path: 'dashboard', label: 'Dashboard', iconName: 'dashboard' },
      { path: 'pelajaran', label: 'Pelajaran', iconName: 'book' },
      { path: 'tugas', label: 'Tugas & PR', iconName: 'task' },
      { path: 'ujian', label: 'Ujian & Ulangan', iconName: 'exam' },
    ],
  },
  {
    label: 'Perencanaan',
    items: [
      { path: 'jadwal', label: 'Jadwal Pelajaran', iconName: 'schedule' },
      { path: 'kalender', label: 'Kalender Akademik', iconName: 'calendar' },
      { path: 'target', label: 'Target Belajar', iconName: 'target' },
      { path: 'catatan', label: 'Catatan Materi', iconName: 'note' },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { path: 'keuangan', label: 'Keuangan Sekolah', iconName: 'wallet' },
      { path: 'pengaturan', label: 'Pengaturan', iconName: 'settings' },
      { path: 'developer', label: 'Info Developer', iconName: 'info' },
    ],
  },
];

const FLAT_ROUTES = NAV_GROUPS.flatMap((g) => g.items);

function currentPath() {
  const hash = window.location.hash.replace('#/', '') || 'dashboard';
  return hash.split('/')[0];
}

function currentParam() {
  const hash = window.location.hash.replace('#/', '');
  const parts = hash.split('/');
  return parts.length > 1 ? decodeURIComponent(parts[1]) : null;
}

export function navigate(path) {
  window.location.hash = `/${path}`;
}

export function renderSidebar() {
  const active = currentPath();
  const groups = NAV_GROUPS.map((group) => `
    <div class="sidebar__group-label">${group.label}</div>
    ${group.items.map((item) => `
      <a class="nav-link ${item.path === active ? 'is-active' : ''}" href="#/${item.path}">
        ${icon(item.iconName, 17)}
        <span>${item.label}</span>
      </a>
    `).join('')}
  `).join('');

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__brand">
        <div class="sidebar__brand-mark">SM</div>
        <div class="sidebar__brand-text">
          <strong>Study Mate</strong>
          <span>Teman Belajar Digital</span>
        </div>
      </div>
      <nav class="sidebar__nav">${groups}</nav>
      <div class="sidebar__footer">Study Mate v1.0.0 &middot; offline-first</div>
    </aside>
    <div class="sidebar__backdrop" id="sidebar-backdrop"></div>
  `;
}

export function currentRouteMeta() {
  const active = currentPath();
  return FLAT_ROUTES.find((r) => r.path === active) || { label: 'Study Mate' };
}

export function initRouter(renderPage) {
  const run = () => {
    document.querySelectorAll('.nav-link').forEach((el) => {
      const path = el.getAttribute('href').replace('#/', '');
      el.classList.toggle('is-active', path === currentPath());
    });
    renderPage(currentPath(), currentParam());
    document.getElementById('sidebar')?.classList.remove('is-open');
    document.getElementById('sidebar-backdrop')?.classList.remove('is-open');
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', run);
  run();
}
