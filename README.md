# Study Mate (SM)

Teman belajar digital untuk mengelola pelajaran, tugas, ujian, jadwal, catatan
materi, target belajar, dan keuangan sekolah dalam satu aplikasi — **offline
sepenuhnya**, tanpa perlu akun atau koneksi internet.

- **Package ID:** `com.studymate.sm.cid`
- **Versi:** v1.0.0
- **Developer:** Nugroho Y.R.
- **Tema warna:** navy (`#0f1c38`) + hijau (`#1f9d63`) — nuansa khas pelajar, tanpa neon

## Fitur

| Fitur | Deskripsi |
|---|---|
| Dashboard | Ringkasan tugas, ujian, jadwal hari ini, saldo, dan target |
| Pelajaran | Daftar mata pelajaran + kategori yang bisa dikelola sendiri |
| Detail Pelajaran | Guru, jadwal, dan materi (bab/halaman/ringkasan/catatan) per pelajaran |
| Tugas & PR | Daftar tugas dengan tenggat waktu dan status selesai |
| Ujian & Ulangan | Jadwal ujian beserta materi yang diujikan |
| Jadwal Pelajaran | Rekap jadwal mingguan dari seluruh mata pelajaran |
| Catatan Materi | Catatan belajar bebas, bisa dikaitkan ke mata pelajaran |
| Kalender Akademik | Kalender bulanan untuk libur, acara, ujian, deadline |
| Target Belajar | Daftar target dengan progres keseluruhan |
| Keuangan Sekolah | Catatan uang sangu (pemasukan/pengeluaran) dan saldo berjalan |
| Pengaturan | Nama pengguna, backup JSON, import JSON, reset data |
| Info Developer | Profil developer, tautan GitHub, saluran & CS WhatsApp |

## Struktur Proyek

```
studymate/
├── www/                      # seluruh aset web (yang dibungkus jadi APK)
│   ├── index.html
│   ├── manifest.json
│   └── src/
│       ├── styles/           # tokens.css (variabel desain) + app.css
│       └── scripts/
│           ├── app.js        # entry point + router wiring
│           ├── router.js     # hash router + navigasi
│           ├── storage.js    # lapisan localStorage + backup/import
│           ├── utils.js      # helper (format, modal, toast, ikon)
│           └── pages/        # satu modul per halaman
├── resources/                # sumber ikon & splash untuk pembungkusan APK
│   ├── icon.png
│   └── splash.png
├── capacitor.config.json     # konfigurasi pembungkus APK
├── package.json
└── .github/workflows/build-apk.yml
```

Data disimpan di `localStorage` perangkat — cocok untuk WebView/APK karena
tidak bergantung pada server atau API eksternal.

## Menjalankan secara lokal (browser)

Buka `www/index.html` lewat server statis apa pun, misalnya:

```bash
npx serve www
```

## Membangun APK lewat GitHub Actions

Workflow di `.github/workflows/build-apk.yml` hanya melakukan satu hal:
membungkus folder `www/` menjadi satu berkas APK memakai Capacitor.

1. Push proyek ini ke repository GitHub.
2. Jalankan workflow **Build APK** (otomatis saat push ke `main`, atau manual
   lewat tab **Actions → Build APK → Run workflow**).
3. Unduh hasilnya dari artifact **studymate-debug-apk** setelah workflow selesai.

### Membangun APK secara lokal

```bash
npm install
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug
```

APK debug akan tersedia di `android/app/build/outputs/apk/debug/app-debug.apk`.

## Kontak

- GitHub: [computerid-dev](https://github.com/computerid-dev) · [Portofolio](https://github.com/computerindo-creator/Portfolio-01)
- Saluran WhatsApp (info aplikasi): https://whatsapp.com/channel/0029Vb86wmKEquiX3JfClN2i
- WhatsApp CS/fitur: https://wa.me/6281522851050/
