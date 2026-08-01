/**
 * storage.js
 * Lapisan persistensi Study Mate. Semua data disimpan di localStorage
 * sehingga aplikasi bisa dipakai sepenuhnya offline (termasuk saat
 * dibungkus jadi APK lewat WebView).
 */

const PREFIX = 'sm_';
const SCHEMA_VERSION = 1;

const COLLECTIONS = [
  'subjects',
  'categories',
  'tasks',
  'financeTransactions',
  'exams',
  'notes',
  'calendarEvents',
  'goals',
];

const DEFAULT_CATEGORIES = ['Eksakta', 'Bahasa', 'Sosial', 'Seni', 'Olahraga'];

const DEFAULT_SETTINGS = {
  username: 'Pelajar',
  theme: 'light',
  version: 'v1.0.0',
};

function key(name) {
  return `${PREFIX}${name}`;
}

function readRaw(name, fallback) {
  try {
    const raw = localStorage.getItem(key(name));
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Gagal membaca "${name}" dari penyimpanan`, err);
    return fallback;
  }
}

function writeRaw(name, value) {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Gagal menyimpan "${name}"`, err);
    return false;
  }
}

/** Menyiapkan data awal saat aplikasi pertama kali dijalankan. */
function ensureSeeded() {
  if (localStorage.getItem(key('seeded'))) return;
  COLLECTIONS.forEach((name) => {
    if (localStorage.getItem(key(name)) === null) writeRaw(name, []);
  });
  writeRaw('categories', DEFAULT_CATEGORIES);
  writeRaw('settings', DEFAULT_SETTINGS);
  localStorage.setItem(key('seeded'), '1');
}

/* ------------------------------ CRUD generik ------------------------------ */

function list(collection) {
  return readRaw(collection, []);
}

function find(collection, id) {
  return list(collection).find((item) => item.id === id) || null;
}

function insert(collection, item) {
  const items = list(collection);
  items.push(item);
  writeRaw(collection, items);
  return item;
}

function update(collection, id, patch) {
  const items = list(collection);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch };
  writeRaw(collection, items);
  return items[idx];
}

function remove(collection, id) {
  const items = list(collection).filter((item) => item.id !== id);
  writeRaw(collection, items);
}

function replaceAll(collection, items) {
  writeRaw(collection, items);
}

/* ------------------------------ Settings ------------------------------ */

function getSettings() {
  return readRaw('settings', DEFAULT_SETTINGS);
}

function updateSettings(patch) {
  const current = getSettings();
  const next = { ...current, ...patch };
  writeRaw('settings', next);
  return next;
}

/* ------------------------------ Backup / Import ------------------------------ */

function exportBackup() {
  const payload = { schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString() };
  COLLECTIONS.forEach((name) => { payload[name] = list(name); });
  payload.settings = getSettings();
  return payload;
}

function downloadBackup() {
  const payload = exportBackup();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `studymate-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importBackup(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Berkas JSON tidak valid.');
  }
  COLLECTIONS.forEach((name) => {
    if (Array.isArray(payload[name])) writeRaw(name, payload[name]);
  });
  if (payload.settings) writeRaw('settings', { ...DEFAULT_SETTINGS, ...payload.settings });
}

function resetAll() {
  COLLECTIONS.forEach((name) => writeRaw(name, []));
  writeRaw('categories', DEFAULT_CATEGORIES);
  writeRaw('settings', DEFAULT_SETTINGS);
}

export const storage = {
  ensureSeeded,
  list,
  find,
  insert,
  update,
  remove,
  replaceAll,
  getSettings,
  updateSettings,
  exportBackup,
  downloadBackup,
  importBackup,
  resetAll,
  COLLECTIONS,
};
