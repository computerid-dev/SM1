/**
 * app.js
 * Titik masuk aplikasi Study Mate.
 */
import { storage } from './storage.js';
import { renderSidebar, initRouter } from './router.js';
import { icon } from './utils.js';

import { renderDashboard, bindDashboardEvents } from './pages/dashboard.js';
import { renderSubjects, bindSubjectsEvents } from './pages/subjects.js';
import { renderSubjectDetail, bindSubjectDetailEvents } from './pages/subjectDetail.js';
import { renderTasks, bindTasksEvents } from './pages/tasks.js';
import { renderExams, bindExamsEvents } from './pages/exams.js';
import { renderFinance, bindFinanceEvents } from './pages/finance.js';
import { renderSchedule, bindScheduleEvents } from './pages/schedule.js';
import { renderNotes, bindNotesEvents } from './pages/notes.js';
import { renderCalendar, bindCalendarEvents } from './pages/calendar.js';
import { renderGoals, bindGoalsEvents } from './pages/goals.js';
import { renderSettings, bindSettingsEvents } from './pages/settings.js';
import { renderDeveloper, bindDeveloperEvents } from './pages/developer.js';

storage.ensureSeeded();

const PAGE_TITLES = {
  dashboard: { title: 'Dashboard', subtitle: 'Ringkasan aktivitas belajarmu' },
  pelajaran: { title: 'Pelajaran', subtitle: 'Kelola mata pelajaran dan kategorinya' },
  'pelajaran-detail': { title: 'Detail Pelajaran', subtitle: 'Jadwal dan materi mata pelajaran' },
  tugas: { title: 'Tugas & PR', subtitle: 'Pantau tugas yang perlu dikerjakan' },
  ujian: { title: 'Ujian & Ulangan', subtitle: 'Jadwal ujian dan materi yang diujikan' },
  keuangan: { title: 'Keuangan Sekolah', subtitle: 'Catat uang sangu dan pengeluaran' },
  jadwal: { title: 'Jadwal Pelajaran', subtitle: 'Jadwal mingguan seluruh mata pelajaran' },
  catatan: { title: 'Catatan Materi', subtitle: 'Simpan catatan belajarmu' },
  kalender: { title: 'Kalender Akademik', subtitle: 'Libur, acara, ujian, dan deadline' },
  target: { title: 'Target Belajar', subtitle: 'Kejar target belajarmu secara konsisten' },
  pengaturan: { title: 'Pengaturan', subtitle: 'Profil, backup, dan reset data' },
  developer: { title: 'Info Developer', subtitle: 'Tentang pengembang Study Mate' },
};

function renderApp() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-shell">
      ${renderSidebar()}
      <div class="main">
        <header class="topbar">
          <div class="flex gap-3" style="align-items:center;">
            <button class="menu-toggle" id="menu-toggle" aria-label="Buka menu">${icon('menu', 20)}</button>
            <div>
              <div class="topbar__title" id="page-title">Dashboard</div>
              <div class="topbar__subtitle" id="page-subtitle"></div>
            </div>
          </div>
        </header>
        <main class="content" id="page-content"></main>
      </div>
    </div>
    <div id="modal-root"></div>
    <div class="toast-stack" id="toast-stack"></div>
  `;

  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('is-open');
    document.getElementById('sidebar-backdrop').classList.toggle('is-open');
  });
  document.getElementById('sidebar-backdrop').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('is-open');
    document.getElementById('sidebar-backdrop').classList.remove('is-open');
  });
}

function renderPage(path, param) {
  const content = document.getElementById('page-content');
  const meta = path === 'pelajaran-detail' ? PAGE_TITLES['pelajaran-detail'] : (PAGE_TITLES[path] || { title: 'Study Mate', subtitle: '' });
  document.getElementById('page-title').textContent = meta.title;
  document.getElementById('page-subtitle').textContent = meta.subtitle;

  switch (path) {
    case 'pelajaran':
      content.innerHTML = renderSubjects();
      bindSubjectsEvents(content);
      break;
    case 'pelajaran-detail':
      content.innerHTML = renderSubjectDetail(param);
      bindSubjectDetailEvents(content, param);
      break;
    case 'tugas':
      content.innerHTML = renderTasks();
      bindTasksEvents(content);
      break;
    case 'ujian':
      content.innerHTML = renderExams();
      bindExamsEvents(content);
      break;
    case 'keuangan':
      content.innerHTML = renderFinance();
      bindFinanceEvents(content);
      break;
    case 'jadwal':
      content.innerHTML = renderSchedule();
      bindScheduleEvents(content);
      break;
    case 'catatan':
      content.innerHTML = renderNotes();
      bindNotesEvents(content);
      break;
    case 'kalender':
      content.innerHTML = renderCalendar();
      bindCalendarEvents(content);
      break;
    case 'target':
      content.innerHTML = renderGoals();
      bindGoalsEvents(content);
      break;
    case 'pengaturan':
      content.innerHTML = renderSettings();
      bindSettingsEvents(content);
      break;
    case 'developer':
      content.innerHTML = renderDeveloper();
      bindDeveloperEvents(content);
      break;
    case 'dashboard':
    default:
      content.innerHTML = renderDashboard();
      bindDashboardEvents(content);
      break;
  }
}

renderApp();
initRouter(renderPage);
