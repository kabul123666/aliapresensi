# PRD — AliaPresensi

**Aplikasi Absensi & Manajemen Kehadiran Karyawan — Alia Hospital**

|                      |                                          |
| -------------------- | ---------------------------------------- |
| **Versi**            | 1.0 (Draft)                              |
| **Tanggal**          | 14 Agustus 2026                          |
| **Status**           | Menunggu persetujuan sebelum development |
| **Owner**            | Kabul Laksana                            |
| **Target rilis MVP** | 6 minggu setelah approval                |

---

## 1. Ringkasan Eksekutif

AliaPresensi adalah aplikasi absensi berbasis web (PWA) untuk karyawan Alia Hospital yang menggantikan proses absensi manual/fingerprint. Karyawan melakukan clock in/clock out lewat HP dengan **selfie + watermark timestamp + geotag lokasi**, lalu saat clock out mengisi **catatan tindakan yang dikerjakan hari itu**, termasuk tindakan ber-fee (odontectomy, implant, pemasangan ortho, dll) yang otomatis terhitung untuk keperluan insentif/payroll.

Admin/HR mendapat dashboard web penuh untuk monitoring real-time, rekap absensi, approval (lembur, backdate, cuti, izin), pendaftaran akun karyawan, master data tarif tindakan, dan export laporan.

### Masalah yang diselesaikan

| Masalah saat ini                                      | Solusi AliaPresensi                                         |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| Absensi manual rawan titip absen                      | Selfie wajib + geofence + device binding + deteksi fake GPS |
| Rekap absensi dikerjakan manual di Excel tiap bulan   | Rekap otomatis, export XLSX/PDF sekali klik                 |
| Fee tindakan perawat dicatat terpisah, sering selisih | Tercatat menyatu dengan absensi harian, auto-kalkulasi      |
| Pengajuan cuti/lembur lewat WA, tidak ada jejak       | Workflow approval berjenjang + audit log                    |
| Tidak ada visibilitas kehadiran real-time             | Dashboard monitoring live untuk manajemen                   |

### Tujuan terukur (6 bulan pasca-rilis)

- ≥ 95% karyawan aktif memakai aplikasi setiap hari kerja
- Waktu penyusunan rekap absensi bulanan turun dari ~8 jam → < 15 menit
- 0 kasus titip absen yang lolos verifikasi
- Selisih perhitungan fee tindakan < 1% per bulan
- Clock in selesai dalam < 15 detik (dari buka app sampai sukses)

---

## 2. Pengguna & Peran (RBAC)

| Peran                          | Deskripsi                             | Akses                                                                         |
| ------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------- |
| **Super Admin**                | Owner/IT. Satu-dua orang saja.        | Semua akses + kelola admin, pengaturan sistem, audit log, hard delete         |
| **Admin / HR**                 | Kelola operasional harian kepegawaian | Semua modul kecuali kelola Super Admin & pengaturan sistem kritikal           |
| **Manager / Kepala Unit**      | Kepala poli/departemen                | Approval level-1 untuk anggota timnya, lihat rekap timnya saja                |
| **Karyawan**                   | Perawat Gigi dan Staf Front Office    | Absensi diri sendiri, ajukan cuti/lembur/koreksi, lihat riwayat & fee sendiri |
| **Finance (opsional, fase 2)** | Payroll                               | Read-only rekap absensi + rekap fee tindakan, export                          |

### Persona utama

**Nadia — Perawat Gigi**
Masuk shift pagi, mengasisteni tindakan sepanjang hari. Butuh clock in cepat (< 15 detik) tanpa ribet. Saat pulang mencatat 3–8 tindakan yang diasisteni, sebagian ber-fee. Ingin lihat estimasi fee bulan berjalan kapan saja.

**Ibu Sari — Staff HR**
Setiap tanggal 25 harus tutup periode payroll. Butuh rekap absensi + rekap fee per perawat dalam satu file. Sering menerima pengajuan koreksi absen lewat WA — ingin semua masuk sistem.

**Intan — Staf Front Office**
Membuka pendaftaran pasien pagi hari dan bergilir shift dengan rekannya. Butuh absen cepat dan melihat jadwal jaganya bulan ini. Tidak mencatat tindakan.

---

## 3. Ruang Lingkup

### Siapa yang memakai

Aplikasi ini melayani **dua jenis staf saja**: **Perawat Gigi** dan **Staf Front
Office**. Dokter tidak dibuatkan akun — fee dokter dihitung terpisah di luar
sistem ini. Pencatatan tindakan ber-fee melekat pada perawat gigi yang
mengasisteni tindakan, bukan pada dokter yang melakukannya.

### ✅ MVP (Fase 1 — wajib rilis)

1. Autentikasi multi-user + RBAC (4 peran)
2. Registrasi karyawan: didaftarkan admin **atau** self-register dengan approval admin
3. Clock in / clock out: selfie + watermark timestamp + geotag + geofence
4. Work log tindakan saat clock out (dengan katalog tindakan ber-fee)
5. Dashboard karyawan (mobile) & dashboard admin (web) — **layout terpisah**
6. Pengajuan & approval: lembur, koreksi/backdate absen, cuti & izin
7. Rekap absensi + export XLSX/PDF
8. Master data: departemen, jabatan, lokasi/cabang, shift, jenis tindakan & tarif
9. Jadwal jaga bulanan (roster) per karyawan per tanggal
10. Pengaturan: jam kerja, toleransi terlambat, radius geofence, hari libur
11. Notifikasi in-app
12. Audit log

### 🔜 Fase 2

- Rekap fee tindakan → slip insentif per karyawan (PDF)
- Push notification (Web Push) + pengingat absen
- Face verification (pencocokan wajah otomatis dengan foto profil)
- Import karyawan massal dari Excel
- Dashboard analitik lanjutan (tren keterlambatan, absensi per unit)

### ❌ Di luar lingkup

- Payroll penuh (perhitungan gaji pokok, PPh 21, BPJS) — hanya menyediakan data absensi & fee
- Rekam medis pasien / integrasi SIMRS
- Aplikasi native iOS/Android (pakai PWA installable)
- Hardware fingerprint / face recognition device

---

## 4. Rekomendasi Teknis — Foto, Timestamp & Maps (Gratis)

Ini menjawab langsung pertanyaan poin 3. **Rekomendasi: pakai keduanya (timestamp + maps), semuanya gratis tanpa API key berbayar.**

| Kebutuhan             | Rekomendasi                                                                         | Biaya                        | Alasan                                                                  |
| --------------------- | ----------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| Ambil foto            | `getUserMedia` (kamera browser), **kamera depan, live only**                        | Gratis                       | Tidak bisa upload dari galeri → anti foto lama                          |
| Watermark timestamp   | Render di `<canvas>` di sisi klien + **stempel ulang di server**                    | Gratis                       | Klien untuk tampilan, server sebagai sumber kebenaran (anti-manipulasi) |
| Koordinat GPS         | Browser `navigator.geolocation` (`enableHighAccuracy`)                              | Gratis                       | Native, akurasi 5–20 m di HP                                            |
| Alamat dari koordinat | **Nominatim (OpenStreetMap)** reverse geocoding                                     | Gratis                       | Tanpa API key. Cache di server, patuhi rate limit 1 req/detik           |
| Tampilan peta         | **Leaflet + tile OpenStreetMap**                                                    | Gratis                       | Tanpa API key, ringan (~40 KB), tanpa batas kuota seperti Google Maps   |
| Geofence              | Perhitungan Haversine di server, radius **diatur admin per lokasi** (default 150 m) | Gratis                       | Tidak perlu layanan eksternal                                           |
| Simpan foto           | **Cloudflare R2** (bucket privat) via storage adapter                               | Gratis 10 GB + egress gratis | Foto diakses hanya lewat signed URL berumur pendek                      |

**Kenapa bukan Google Maps API?** Butuh kartu kredit, ada kuota, dan biaya per request setelah kredit gratis habis. Leaflet + OSM + Nominatim cukup untuk kebutuhan absensi (menampilkan titik lokasi + nama jalan) dan **benar-benar gratis selamanya**.

### Anatomi foto absensi (hasil akhir)

```
┌──────────────────────────────┐
│                              │
│      [ selfie karyawan ]     │
│                              │
│ ┌──────────────────────────┐ │
│ │ 14 Agu 2026 · 08:03:21   │ │  ← waktu server (WIB), bukan waktu HP
│ │ Jl. Raya Alia No. 12     │ │  ← Nominatim reverse geocode
│ │ -6.20881, 106.84559 ±8m  │ │  ← koordinat + akurasi
│ │ ✓ Dalam area RS (42 m)   │ │  ← status geofence
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

Watermark di-_burn_ ke gambar oleh **server** (sharp/canvas), bukan hanya oleh klien, sehingga foto tidak bisa dipalsukan dari sisi HP. EXIF asli di-strip, metadata disimpan di database.

---

## 5. Rekomendasi Stack Teknologi

Semua komponen punya free tier yang cukup untuk ≤ 100 karyawan.

| Layer        | Pilihan                                         | Alasan                                                                                                             |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Framework    | **Next.js 16 (App Router) + TypeScript strict** | Satu codebase untuk web & mobile PWA, server actions, deploy mulus ke Vercel                                       |
| Styling      | **Tailwind CSS v4 + shadcn/ui**                 | Konsisten, cepat, komponen accessible, mudah di-custom agar tidak generic                                          |
| Database     | **PostgreSQL — Neon** (free tier)               | Postgres murni, tanpa lock-in. Volume data 30 karyawan hanya ~30 MB/tahun → cukup 10+ tahun                        |
| ORM          | **Drizzle ORM + migrasi versioned**             | Type-safe, SQL-first, migrasi rapi untuk git                                                                       |
| Auth         | **Auth.js (NextAuth) v5** + session di database | Kontrol penuh, mudah tambah SSO nanti                                                                              |
| Storage foto | **Cloudflare R2** via _storage adapter_         | 10 GB gratis + egress gratis. Adapter membuat provider dapat diganti (R2 ↔ Supabase ↔ S3) tanpa ubah kode aplikasi |
| Peta         | Leaflet + OSM                                   | Gratis, tanpa key                                                                                                  |
| Grafik       | Recharts                                        | Ringan, mudah di-tema                                                                                              |
| Export       | ExcelJS (XLSX) + React-PDF (PDF)                | Server-side, tanpa lisensi                                                                                         |
| Validasi     | Zod (dipakai bersama di klien & server)         | Satu skema, satu sumber kebenaran                                                                                  |
| Email        | Resend free tier / SMTP klinik                  | Notifikasi & reset password                                                                                        |
| Testing      | Vitest (unit) + Playwright (E2E alur kritis)    | Mencegah regresi pada alur absensi                                                                                 |
| Hosting      | **Vercel** + GitHub (CI: lint, typecheck, test) | Sesuai rencana deploy                                                                                              |

### 5.1 Strategi Penyimpanan Foto (kapasitas jangka panjang)

Volume: **30 karyawan × 2 foto × 22 hari kerja = 1.320 foto/bulan (± 15.840/tahun)**.

| Strategi                             | Konsumsi/tahun          | Ketahanan di 10 GB gratis |
| ------------------------------------ | ----------------------- | ------------------------- |
| Tanpa kompresi (± 300 KB/foto)       | 4,8 GB                  | ~2 tahun                  |
| Kompresi 720×960 q0,7 (± 80 KB/foto) | 1,3 GB                  | ~7 tahun                  |
| **Kompresi + tiering (dipakai)**     | ± 0,3 GB _steady state_ | **Tidak terbatas**        |

**Aturan tiering yang diterapkan:**

1. Foto diunggah dikompresi di klien ke maks 720×960, JPEG q0,7 (± 80 KB) sebelum dikirim.
2. Umur 0–3 bulan: simpan resolusi penuh (periode aktif audit & sengketa absensi).
3. Umur > 3 bulan: job bulanan menurunkan ke thumbnail 240×320 (± 8 KB) — masih cukup untuk verifikasi identitas visual.
4. Umur > 24 bulan: dihapus otomatis sesuai kebijakan retensi. Metadata absensi (jam, lokasi, status) **tetap disimpan permanen**.
5. Kuota storage dimonitor; peringatan otomatis ke admin pada 70% dan 90%.

**Storage adapter:** seluruh akses berkas melalui satu antarmuka (`put`, `getSignedUrl`, `delete`, `stat`). Berpindah provider = mengganti satu implementasi + variabel environment, tanpa menyentuh kode fitur.

**Kualitas kode (agar rapi & siap push ke GitHub):** ESLint + Prettier + TypeScript strict + Husky pre-commit + Conventional Commits + struktur folder per-domain (feature-based, bukan tumpukan file).

---

## 6. Spesifikasi Fitur

### 6.0 Prinsip Utama — Zero Hardcode

Seluruh aturan operasional **dikelola dari akun admin lewat antarmuka**, tidak ditanam di kode. Tidak boleh ada satu pun angka kebijakan yang butuh developer untuk mengubahnya.

| Yang diatur admin          | Contoh                                                                         |
| -------------------------- | ------------------------------------------------------------------------------ |
| Shift & jam kerja          | Nama shift, jam masuk–pulang, toleransi, hari kerja, lintas hari (shift malam) |
| Lokasi & geofence          | Titik, radius, kebijakan luar area, toleransi akurasi GPS                      |
| Jabatan & hak fee tindakan | Jabatan mana yang mengisi form tindakan                                        |
| Katalog tindakan & tarif   | Nama tindakan, kategori, nominal fee, tarif berbeda per jabatan                |
| Cuti                       | Jenis cuti, kuota, aturan carry-over, aturan pencairan (uang)                  |
| Approval                   | Siapa yang boleh menyetujui, jenis pengajuan apa, dan cakupannya               |
| Hari libur                 | Kalender libur nasional & libur internal RS                                    |
| Kebijakan absensi          | Toleransi terlambat, ambang lembur, batas mundur backdate                      |

Konsekuensi teknis: tidak ada nilai kebijakan yang ditulis sebagai konstanta di kode. Semua dibaca dari tabel master/`settings`, dengan nilai awal diisi lewat seed saat instalasi. Setiap perubahan tercatat di audit log (siapa, kapan, nilai lama → nilai baru).

### 6.1 Autentikasi & Onboarding

**Dua jalur pendaftaran:**

**A. Didaftarkan Admin (jalur utama)**

1. Admin isi form: nama, NIK/NIP, email, no. HP, departemen, jabatan, tipe karyawan, lokasi kerja, shift default, tanggal masuk
2. Sistem kirim email undangan berisi link aktivasi (kedaluwarsa 7 hari)
3. Karyawan buka link → set password → upload foto profil → akun aktif

**B. Self-register (jalur alternatif)**

1. Karyawan isi form pendaftaran + kode undangan klinik (opsional, dari admin)
2. Status akun: `PENDING_APPROVAL` — belum bisa absen
3. Admin melihat antrean "Pendaftaran Baru", verifikasi data, lalu Setujui / Tolak (dengan alasan)
4. Karyawan dapat email hasilnya

**Form login profesional:**

- Split-screen: kiri branding rumah sakit + ilustrasi 3D, kanan form (desktop). Full-screen form di mobile.
- Login pakai email **atau** NIK
- Show/hide password, "Ingat saya", Lupa password (email reset token 1 jam)
- Error message spesifik tapi tidak membocorkan keberadaan akun ("Email atau password salah")
- Rate limit: 5 percobaan gagal → lockout 15 menit + notifikasi email
- Opsional 2FA (TOTP) untuk peran Admin & Super Admin

### 6.2 Clock In / Clock Out

**Alur clock in (target < 15 detik):**

1. Buka app → tombol besar melingkar **CLOCK IN** dengan jam berjalan real-time
2. Sistem minta izin lokasi & kamera (dengan penjelasan alasan sebelum prompt browser)
3. Tampilkan peta kecil: posisi saya vs area kantor + jarak
4. Jika di luar radius → perilaku mengikuti **kebijakan yang diatur admin** (lihat 6.2.1)
5. Buka kamera depan → preview → ambil foto (tidak ada opsi pilih dari galeri)
6. Kirim: foto + koordinat + akurasi + device fingerprint
7. Server: validasi sesi → hitung geofence → reverse geocode → burn watermark → simpan → tentukan status
8. Layar sukses: jam masuk, status (Tepat Waktu / Terlambat X menit), sisa jam kerja

#### 6.2.1 Geofence — sepenuhnya dikendalikan admin

Admin mengatur **dua hal terpisah** per lokasi kerja, tanpa perlu developer:

**a. Besar radius** — nilai bebas dalam meter (default 150 m), diatur di Master Data → Lokasi. Disediakan peta interaktif: admin menggeser titik pusat lokasi dan menarik lingkaran radius, nilai meter terlihat langsung. Setiap perubahan tercatat di audit log.

**b. Kebijakan bila absen di luar radius** — dipilih per lokasi:

| Mode                           | Perilaku                                                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `BLOCK`                        | Tombol clock in dinonaktifkan. Karyawan hanya bisa mengajukan koreksi absen. Paling ketat                                |
| `REQUIRE_REASON` **(default)** | Absen tetap tercatat, wajib isi alasan, ditandai merah, masuk antrean approval admin. Bila ditolak → status menjadi Alpa |
| `FLAG_ONLY`                    | Tercatat normal, hanya ditandai di rekap, tanpa approval                                                                 |

Tersedia juga _toleransi akurasi GPS_: bila akurasi perangkat buruk (mis. ±50 m di dalam gedung), sistem menghitung jarak dikurangi nilai akurasi agar karyawan tidak dirugikan sinyal lemah. Ambang toleransi ini pun dapat diatur admin.

**Status kehadiran yang dihitung otomatis:**

| Status                | Aturan                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| `ON_TIME`             | Clock in ≤ jam masuk + toleransi (default 10 menit)                                 |
| `LATE`                | Clock in > toleransi. Menit keterlambatan dicatat                                   |
| `EARLY_LEAVE`         | Clock out < jam pulang shift                                                        |
| `OVERTIME`            | Clock out > jam pulang + ambang lembur (default 30 menit) → memicu pengajuan lembur |
| `ABSENT`              | Tidak clock in sampai akhir hari & tidak ada cuti/izin (job harian jam 23.55)       |
| `ON_LEAVE`            | Ada pengajuan cuti/izin yang disetujui                                              |
| `HOLIDAY` / `DAY_OFF` | Hari libur nasional atau libur shift                                                |
| `INCOMPLETE`          | Clock in ada, clock out tidak ada (auto-flag untuk koreksi)                         |

**Anti-kecurangan (poin "jangan sampai ada celah"):**

- Waktu absensi **selalu dari server**, waktu HP diabaikan
- Foto hanya dari kamera live (`getUserMedia`), tanpa input file
- Deteksi mock location (flag `isMocked` bila tersedia) + anomali akurasi GPS
- Device binding: 1 akun = 1 device utama; ganti device butuh approval admin
- Deteksi lompatan lokasi tidak wajar (jarak/waktu > kecepatan wajar)
- Foto disimpan permanen sebagai bukti; admin bisa audit kapan saja
- Semua percobaan mencurigakan masuk audit log & ditandai di dashboard admin

#### 6.2.2 Shift & Jadwal Kerja (sepenuhnya dibuat admin)

Tidak ada shift bawaan di kode. Admin membuat sendiri shift sesuai operasional Alia Hospital di **Master Data → Shift**.

**Field per shift:**

| Field               | Contoh                                | Keterangan                                                                    |
| ------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| Nama shift          | "Pagi", "Siang", "Malam", "Non-Shift" | Bebas                                                                         |
| Jam masuk           | 08:00                                 |                                                                               |
| Jam pulang          | 16:00                                 |                                                                               |
| Lintas hari         | on/off                                | Untuk shift malam (mis. 22:00–06:00) — jam pulang jatuh di tanggal berikutnya |
| Toleransi terlambat | 10 menit                              | Per shift, bukan global                                                       |
| Ambang lembur       | 30 menit                              | Lewat dari ini baru terhitung lembur                                          |
| Hari kerja          | Sen–Jum / Sen–Sab / pola bebas        | Centang per hari                                                              |
| Durasi istirahat    | 60 menit                              | Dipotong dari total jam kerja                                                 |
| Batas clock in dini | 60 menit sebelum jam masuk            | Cegah absen kepagian dari rumah                                               |

**Penugasan shift ke karyawan — dua cara, keduanya milik admin:**

1. **Shift tetap** — karyawan dipasangkan ke satu shift default (mayoritas kasus).
2. **Roster/jadwal per tanggal** — untuk unit yang berotasi, admin menyusun jadwal bulanan (tabel karyawan × tanggal, isi shift). Bisa disalin dari bulan sebelumnya dan diedit.

Status kehadiran (`ON_TIME`/`LATE`/dst.) selalu dihitung terhadap shift yang berlaku pada tanggal tersebut — bukan jam kerja global.

### 6.3 Work Log — Catatan Tindakan (saat Clock Out)

Setelah foto clock out, muncul form catatan kerja:

**a. Catatan umum (wajib, min. 10 karakter)**
Ringkasan pekerjaan hari ini.

**b. Daftar tindakan (opsional, bisa lebih dari satu)**
Setiap baris:

| Field               | Keterangan                                                                                                            |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Jenis tindakan      | Pilih dari katalog (searchable), mis. Odontectomy, Implant, Pemasangan Ortho, Scaling, Tambal, Pencabutan, Root Canal |
| Kategori            | Tindakan Besar / Sedang / Ringan / Non-fee                                                                            |
| Jumlah              | Default 1                                                                                                             |
| Kode/inisial pasien | Opsional, **tanpa data medis** (privasi)                                                                              |
| Nominal fee         | Auto dari katalog tarif, bisa di-override admin                                                                       |
| Catatan             | Opsional                                                                                                              |
| Status              | `DRAFT` → `SUBMITTED` → `VERIFIED` / `REJECTED` oleh admin                                                            |

- Total fee hari ini ditampilkan langsung ke karyawan (angka estimasi, final setelah verifikasi)
- Katalog tindakan & tarif dikelola admin (master data), mendukung tarif berbeda per jabatan

**Siapa yang mengisi form tindakan — ditentukan admin per jabatan.** Setiap jabatan punya sakelar `isi_form_tindakan` (on/off). Karyawan dengan sakelar off hanya melihat catatan kerja umum; bagian tindakan tidak muncul sama sekali.

| Jabatan               | Default awal | Keterangan                                                                    |
| --------------------- | ------------ | ----------------------------------------------------------------------------- |
| **Perawat / Asisten** | **ON**       | Mendapat fee asistensi tindakan (odontectomy, implant, pemasangan ortho, dll) |
| Front Office          | OFF          | Cukup catatan kerja umum                                                      |
| _(jabatan lain)_      | OFF          | Cukup catatan kerja umum                                                      |
| Jabatan lain          | OFF          | Admin dapat menyalakan kapan saja                                             |

Sakelar ini dikelola admin per jabatan, sehingga kebijakan bisa berubah tanpa bantuan developer.

- Karyawan yang sakelarnya ON bisa lihat rekap fee bulan berjalan di menu "Fee Saya"

### 6.4 Pengajuan & Approval

Semua pengajuan memakai mesin workflow yang sama: `DRAFT → PENDING → APPROVED/REJECTED`.

**Siapa yang boleh approve ditentukan admin, bukan ditanam di kode.** Di menu **Pengaturan → Aturan Persetujuan**, admin menyusun aturan bebas:

| Kolom aturan                 | Pilihan                                                               |
| ---------------------------- | --------------------------------------------------------------------- |
| Jenis pengajuan              | Cuti / Lembur / Koreksi Absen / Izin / Absen Luar Area / Ganti Device |
| Cakupan                      | Semua karyawan, atau hanya departemen/lokasi tertentu                 |
| Approver                     | Pilih **orang tertentu** (bisa lebih dari satu) atau **peran**        |
| Jumlah langkah               | 1 langkah (langsung final) atau berjenjang (mis. Kepala Unit → HR)    |
| Mode bila banyak approver    | Cukup salah satu (_any_) atau harus semua (_all_)                     |
| Pengganti saat approver cuti | Approver cadangan (delegasi)                                          |

Contoh: "Cuti · Semua karyawan · Kepala Unit → HR (2 langkah)" berdampingan dengan "Lembur · Unit Rawat Jalan · Pak Doni saja (1 langkah)". Bila tidak ada aturan yang cocok, pengajuan jatuh ke Admin/HR sebagai _fallback_ agar tidak pernah ada pengajuan yang menggantung tanpa approver. Perubahan aturan tidak memengaruhi pengajuan yang sudah berjalan.

| Jenis                        | Data yang diisi                                                         | Alur                                                                              |
| ---------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Lembur**                   | Tanggal, jam mulai–selesai, alasan, lampiran (opsional)                 | Auto-terpicu bila clock out melewati ambang, atau diajukan manual sebelum/sesudah |
| **Koreksi / Backdate absen** | Tanggal, jam masuk/pulang yang benar, alasan, bukti (opsional)          | Wajib approval. Batas maksimal mundur: 7 hari (dapat diatur)                      |
| **Cuti**                     | Jenis cuti, tanggal mulai–selesai, jumlah hari, alasan, pengganti tugas | Cek saldo cuti otomatis, tolak bila saldo kurang                                  |
| **Izin / Sakit**             | Tanggal, jenis, alasan, upload surat dokter (untuk sakit > 1 hari)      | Approval HR                                                                       |
| **Absen luar area**          | Alasan + foto + lokasi aktual                                           | Review admin, bisa disetujui/ditolak (menjadi alpa)                               |
| **Ganti device**             | Alasan                                                                  | Approval admin, mengganti device binding                                          |

#### 6.4.1 Cuti Tahunan, Carry-Over & Pencairan (uang)

**Kuota:** Cuti Tahunan 12 hari/tahun (nilai awal — admin dapat mengubah, termasuk membedakan kuota per jabatan atau per masa kerja). Jenis cuti lain yang tersedia dan dapat dikonfigurasi: Cuti Sakit, Cuti Melahirkan, Cuti Menikah, Cuti Duka, Cuti Besar, Izin Tidak Dibayar.

**Perlakuan sisa cuti di akhir tahun — tiga pilihan, ditentukan admin:**

| Opsi                      | Perilaku                                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Diuangkan**             | Sisa hari dikonversi jadi uang: `sisa_hari × tarif_per_hari`. Masuk daftar "Pencairan Cuti" untuk diteruskan ke payroll. Saldo tahun depan kembali ke kuota normal (12 hari)       |
| **Dibawa ke tahun depan** | Sisa hari ditambahkan ke kuota tahun berikutnya → saldo tahun depan = 12 + sisa. Ada batas maksimal carry-over & tanggal kedaluwarsa (mis. hangus 31 Maret), keduanya diatur admin |
| **Sebagian–sebagian**     | Karyawan/HR menentukan berapa hari diuangkan dan berapa hari dibawa. Contoh: sisa 5 hari → 3 diuangkan, 2 dibawa (kuota tahun depan jadi 14)                                       |

**Tarif pencairan per hari** diatur admin: nilai tetap (rupiah per hari) **atau** rumus dari gaji pokok (mis. `gaji_pokok ÷ 21`). Bisa diatur global maupun per karyawan.

**Proses tutup tahun (Desember, dijalankan admin):**

1. Sistem menampilkan tabel semua karyawan + sisa cutinya
2. Admin (atau karyawan lewat form pilihan, bila diizinkan) menentukan: uangkan / bawa / sebagian
3. Admin klik **Proses Tutup Tahun** → sistem menghasilkan:
   - Saldo cuti tahun baru (kuota + carry-over yang disetujui)
   - Rekap Pencairan Cuti siap export untuk payroll
4. Seluruh proses dicatat di audit log dan tidak dapat dijalankan dua kali untuk tahun yang sama

**Saldo cuti** dihitung per tahun berjalan, menampilkan rincian: kuota + carry-over − terpakai − diajukan (pending) = sisa. Penyesuaian manual oleh HR dimungkinkan dan wajib berisi alasan (tercatat di audit log). Karyawan melihat saldo dan simulasi nilai pencairan di menu Profil.

**Approval untuk approver:**

- Inbox terpusat "Butuh Persetujuan" dengan badge jumlah
- Bulk approve/reject
- Wajib isi catatan bila menolak
- Notifikasi ke pengaju (in-app + email)

### 6.5 Dashboard Admin (Web)

**Beranda / Monitoring**

- Kartu ringkasan: Hadir, Terlambat, Cuti, Alpa, Belum Absen — **live hari ini**
- Grafik kehadiran 30 hari terakhir
- Daftar "Belum clock in" (dengan tombol ingatkan)
- Antrean approval + antrean pendaftaran baru
- Feed absensi real-time (nama, jam, foto thumbnail, status, lokasi)
- Panel flag mencurigakan (di luar area, mock GPS, device baru)

**Modul lain**

- **Karyawan** — daftar, filter (departemen/jabatan/status), detail, edit, nonaktifkan, reset password, riwayat lengkap
- **Rekap Absensi** — tabel per periode, filter multi-dimensi, kolom: hadir/terlambat/menit telat/lembur/cuti/alpa, drill-down ke detail harian + foto, export XLSX & PDF
- **Rekap Tindakan & Fee** — per karyawan/per jenis tindakan/per periode, verifikasi massal, export
- **Approval** — semua pengajuan, filter status
- **Master Data** — departemen, jabatan (+ sakelar isi form tindakan), **lokasi & geofence (peta interaktif: geser titik + tarik radius, pilih kebijakan luar area)**, **shift & roster bulanan**, katalog tindakan & tarif, jenis cuti, hari libur
- **Aturan Persetujuan** — susun siapa boleh approve apa, cakupan, jumlah langkah, delegasi
- **Tutup Tahun Cuti** — tabel sisa cuti seluruh karyawan, pilih uangkan / bawa / sebagian, proses sekali klik, hasilkan rekap pencairan
- **Pengaturan** — profil perusahaan, toleransi & ambang default, kebijakan backdate, tarif pencairan cuti, template email
- **Audit Log** — siapa, kapan, aksi apa, data lama → data baru, IP, user agent
- **Laporan** — laporan bulanan siap cetak (kop surat rumah sakit)

### 6.6 Aplikasi Karyawan (Mobile)

- **Beranda** — jam besar, tombol clock in/out, status hari ini, jadwal shift, ringkasan bulan berjalan
- **Riwayat** — kalender bulanan berwarna per status + list detail
- **Pengajuan** — buat & pantau status cuti/lembur/koreksi
- **Fee Saya** — daftar tindakan + total estimasi fee bulan berjalan
- **Profil** — data diri, ubah password, saldo cuti, device terdaftar, logout
- **Notifikasi** — pengumuman, hasil approval, pengingat absen

### 6.7 Fitur Tambahan yang Direkomendasikan

| Fitur                                     | Manfaat                                                                                 | Fase   |
| ----------------------------------------- | --------------------------------------------------------------------------------------- | ------ |
| **Shift & jadwal kerja**                  | RS punya shift pagi/siang/malam — status kehadiran harus mengacu shift, bukan jam tetap | MVP    |
| **Hari libur nasional**                   | Agar tidak dihitung alpa                                                                | MVP    |
| **Pengumuman/broadcast**                  | Info internal dari HR                                                                   | MVP    |
| **PWA installable + mode offline ringan** | Absen tetap tercatat saat sinyal lemah, sinkron saat online                             | MVP    |
| **Dark mode**                             | Kenyamanan shift malam                                                                  | MVP    |
| **Pengingat absen**                       | Notifikasi 15 menit sebelum jam masuk & jam pulang                                      | Fase 2 |
| **Face matching**                         | Verifikasi otomatis wajah vs foto profil                                                | Fase 2 |
| **Slip insentif PDF**                     | Transparansi fee ke perawat                                                             | Fase 2 |
| **QR absen cadangan**                     | Bila kamera/GPS bermasalah, scan QR di resepsionis                                      | Fase 2 |
| **Multi-cabang**                          | Bila Alia Hospital membuka cabang                                                       | Fase 2 |

---

## 7. Model Data (Ringkas)

```
users                 id, email, nik, password_hash, role, status, employee_id, 2fa_secret
employees             id, user_id, nama, no_hp, department_id, position_id, location_id,
                      shift_id, tipe_karyawan, tgl_masuk, foto_profil, status, device_id
departments           id, nama, manager_id
positions             id, nama, department_id, isi_form_tindakan (bool), kuota_cuti_override
locations             id, nama, alamat, lat, lng, radius_m,
                      outside_policy (BLOCK|REQUIRE_REASON|FLAG_ONLY), gps_accuracy_tolerance_m
shifts                id, nama, jam_masuk, jam_pulang, lintas_hari, toleransi_menit,
                      ambang_lembur_menit, hari_kerja[], istirahat_menit, batas_clockin_dini_menit
shift_schedules       id, employee_id, tanggal, shift_id   (roster per tanggal; menimpa shift default)

attendances           id, employee_id, tanggal, shift_id, status,
                      clock_in_at, clock_in_photo, clock_in_lat, clock_in_lng,
                      clock_in_accuracy, clock_in_address, clock_in_distance_m,
                      clock_in_outside_area, clock_in_reason,
                      clock_out_at, clock_out_photo, ... (simetris),
                      menit_terlambat, menit_lembur, durasi_kerja_menit,
                      device_fingerprint, flags[], catatan_kerja

procedure_catalog     id, nama, kategori, fee_default, aktif
procedure_fee_rates   id, procedure_id, position_id, fee   (tarif per jabatan)
work_log_items        id, attendance_id, procedure_id, jumlah, kode_pasien,
                      fee_snapshot, catatan, status_verifikasi, verified_by, verified_at

requests              id, employee_id, tipe (OVERTIME|BACKDATE|LEAVE|PERMIT|OUTSIDE|DEVICE),
                      payload jsonb, status, current_step, alasan,
                      lampiran, created_at
approval_rules        id, tipe_pengajuan, scope (ALL|DEPARTMENT|LOCATION), scope_id,
                      urutan_step, mode (ANY|ALL), aktif
approval_rule_actors  id, rule_id, step, approver_user_id | approver_role, delegate_user_id
request_approvals     id, request_id, step, approver_id, keputusan, catatan, acted_at

leave_types           id, nama, kuota_default, berbayar, butuh_lampiran,
                      boleh_carry_over, boleh_diuangkan, max_carry_over_hari, tgl_kedaluwarsa_carry
leave_balances        id, employee_id, leave_type_id, tahun, kuota, carry_over_masuk,
                      terpakai, pending, sisa
leave_encashments     id, employee_id, tahun, jumlah_hari, tarif_per_hari, total_nominal,
                      status (DRAFT|APPROVED|PAID), diproses_oleh, created_at
year_end_closings     id, tahun, dijalankan_oleh, dijalankan_at, ringkasan jsonb  (idempoten)
holidays              id, tanggal, nama, nasional
announcements         id, judul, isi, target_role[], published_at
notifications         id, user_id, tipe, judul, isi, read_at, link
audit_logs            id, actor_id, aksi, entitas, entitas_id, before jsonb,
                      after jsonb, ip, user_agent, created_at
settings              key, value jsonb
```

**Indeks penting:** `attendances(employee_id, tanggal)` unik, `attendances(tanggal, status)`, `requests(status, tipe)`, `audit_logs(created_at)`.

---

## 8. Desain UI/UX

### Prinsip

1. **Terasa seperti produk HR profesional** (rujukan rasa: Talenta, Gadjian, Gaji.id) — bukan template dashboard generik.
2. **Mobile ≠ Web.** Dua pengalaman berbeda, bukan satu layout yang di-_squeeze_:
   - **Mobile (karyawan):** navigasi bottom-tab, kartu besar, tombol absen jumbo dengan ring progress, gestur swipe, safe-area, satu kolom, target sentuh ≥ 44 px.
   - **Web (admin):** sidebar kiri + topbar, tabel padat dengan filter & bulk action, split-view detail, keyboard shortcut, multi-kolom.
   - Deteksi otomatis lewat middleware (user-agent + lebar layar), dengan opsi manual pindah tampilan.
3. **Ikon 3D penuh.** Set ikon gaya 3D soft/claymorphism untuk elemen utama (clock in/out, cuti, lembur, fee, laporan, approval) — dibuat sebagai SVG bergradien berlapis + shadow, jadi ringan, tajam di semua resolusi, dan konsisten satu keluarga visual. Ikon fungsional kecil (tabel, menu) tetap pakai ikon garis agar tidak berisik.
4. **Hindari kesan "buatan AI":** tanpa gradien ungu-biru default, tanpa emoji sebagai ikon, tanpa teks generik ("Welcome to your dashboard"), tanpa spacing seragam yang datar. Gunakan hierarki tipografi tegas, ritme spasi bervariasi, ilustrasi kustom, microcopy berbahasa Indonesia yang natural dan spesifik.

### Bahasa visual

| Elemen        | Ketentuan                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------ |
| Warna utama   | Teal/hijau medis — kesan sehat, tenang, khas rumah sakit (bukan biru korporat generik)     |
| Warna aksen   | Amber (perhatian/terlambat), Merah (alpa/tolak), Hijau (hadir/setuju)                      |
| Tipografi     | Plus Jakarta Sans / Inter — heading tebal, angka tabular untuk jam & durasi                |
| Radius        | 16–24 px pada kartu, 12 px pada input — ramah, tidak kaku                                  |
| Bayangan      | Halus & berlapis (bukan `box-shadow` default)                                              |
| Mode gelap    | Wajib, dengan palet yang disetel ulang (bukan sekadar invert)                              |
| Animasi       | Transisi 150–250 ms, animasi sukses absen yang memuaskan, hormati `prefers-reduced-motion` |
| Empty state   | Ilustrasi + kalimat jelas + aksi berikutnya                                                |
| Aksesibilitas | Kontras WCAG AA, fokus terlihat, label form, navigasi keyboard penuh                       |

---

## 9. Keamanan (Non-Negotiable)

| Area         | Kontrol                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------- |
| Password     | Argon2id / bcrypt cost ≥ 12, minimal 8 karakter + cek password bocor                                          |
| Sesi         | HTTP-only, Secure, SameSite=Lax cookie; rotasi token; idle timeout 12 jam                                     |
| Otorisasi    | Cek peran **di server** pada setiap route & server action. Tidak pernah mengandalkan UI menyembunyikan tombol |
| Isolasi data | Karyawan hanya bisa membaca datanya sendiri (dipaksa di layer query, bukan filter di klien)                   |
| Foto         | Bucket privat, akses hanya via signed URL 5 menit, EXIF di-strip, batas ukuran 5 MB                           |
| Input        | Validasi Zod di server untuk semua input, parameterized query (Drizzle)                                       |
| Serangan     | Rate limit login & endpoint absen, CSRF token, header keamanan (CSP, HSTS, X-Frame-Options), proteksi bot     |
| Upload       | Whitelist MIME, verifikasi magic bytes, re-encode gambar di server                                            |
| Audit        | Semua aksi tulis oleh admin tercatat lengkap (before/after) dan tidak dapat dihapus                           |
| Rahasia      | Semua kredensial di environment variable, tidak ada di repo; `.env.example` disediakan                        |
| Privasi      | Tidak menyimpan data medis pasien. Retensi foto absensi 24 bulan lalu dihapus otomatis                        |
| Backup       | Backup harian database, uji restore berkala                                                                   |

---

## 10. Kebutuhan Non-Fungsional

| Aspek        | Target                                                                  |
| ------------ | ----------------------------------------------------------------------- |
| Performa     | LCP < 2 detik di 4G, clock in end-to-end < 3 detik                      |
| Ukuran foto  | Kompres ke ≤ 300 KB sebelum upload                                      |
| Ketersediaan | ≥ 99,5% pada jam kerja                                                  |
| Kapasitas    | 200 karyawan, 400 transaksi absen/hari, puncak 100 absen dalam 10 menit |
| Browser      | Chrome/Safari/Edge 2 versi terakhir; iOS Safari 15+                     |
| Bahasa       | Indonesia (struktur i18n disiapkan untuk penambahan bahasa)             |
| Zona waktu   | WIB (Asia/Jakarta), disimpan sebagai UTC di database                    |

---

## 11. Struktur Proyek (agar rapi & siap GitHub)

```
src/
  app/
    (auth)/           login, register, forgot-password
    (mobile)/         tampilan karyawan
    (web)/            tampilan admin
    api/
  features/
    attendance/       komponen, aksi server, skema, query
    employees/
    requests/
    worklog/
    reports/
    settings/
  components/ui/      primitif shadcn
  components/icons3d/ set ikon 3D
  lib/                auth, db, geo, image, permission, utils
  db/                 schema.ts, migrations/
docs/                 PRD.md, ARCHITECTURE.md, SETUP.md, SECURITY.md
tests/                unit + e2e
```

**Aturan kode:** TypeScript strict, tanpa `any`, komponen < 200 baris, logika bisnis di `features/*/server`, penamaan konsisten bahasa Inggris untuk kode & bahasa Indonesia untuk teks UI, commit ber-Conventional Commits, PR wajib lolos lint + typecheck + test.

---

## 12. Rencana Pengerjaan

| Milestone                       | Isi                                                                                                                                                    | Perkiraan |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| **M0 — Fondasi**                | Setup proyek, design system, ikon 3D, database schema, seed                                                                                            | Minggu 1  |
| **M1 — Auth**                   | Login, register + approval, RBAC, middleware, reset password                                                                                           | Minggu 2  |
| **M2 — Absensi inti**           | Clock in/out, kamera, GPS, geofence, watermark, status otomatis                                                                                        | Minggu 3  |
| **M3 — Work log & fee**         | Katalog tindakan, form tindakan, kalkulasi fee, verifikasi                                                                                             | Minggu 4  |
| **M4 — Approval & master data** | Cuti, lembur, backdate, saldo cuti, **aturan persetujuan konfigurabel**, **shift & roster**, **tutup tahun + pencairan cuti**, master data, pengaturan | Minggu 5  |
| **M5 — Dashboard & laporan**    | Monitoring, rekap, export, notifikasi, audit log                                                                                                       | Minggu 6  |
| **M6 — Pengerasan**             | Security review, uji beban, E2E test, PWA, deploy Vercel                                                                                               | Minggu 7  |

---

## 13. Kriteria Penerimaan (Definition of Done)

- [ ] Karyawan dapat clock in/out dengan foto + lokasi, tercatat akurat, < 15 detik
- [ ] Absen di luar radius tidak bisa lolos tanpa alasan & review admin
- [ ] Tindakan ber-fee tercatat dan totalnya sesuai tarif master data
- [ ] Admin dapat menyetujui/menolak seluruh jenis pengajuan dan pengaju mendapat notifikasi
- [ ] Rekap bulanan dapat diekspor ke XLSX & PDF dengan angka yang cocok dengan data harian
- [ ] Karyawan A tidak dapat mengakses data karyawan B melalui cara apa pun (diuji)
- [ ] Tampilan mobile & web benar-benar berbeda dan keduanya nyaman dipakai
- [ ] Lolos lint, typecheck, unit test, dan E2E alur kritis
- [ ] Tidak ada kredensial di repo; `.env.example` lengkap; README setup jelas
- [ ] Skor Lighthouse ≥ 90 (Performance, Accessibility, Best Practices)

---

## 14. Risiko & Mitigasi

| Risiko                                 | Dampak              | Mitigasi                                                                                 |
| -------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------- |
| Izin kamera/GPS ditolak karyawan       | Tidak bisa absen    | Layar edukasi + panduan aktifkan izin per browser + jalur cadangan QR (fase 2)           |
| Sinyal lemah di area tertentu RS       | Absen gagal         | Antrean offline, sinkron otomatis saat online, waktu tetap dari saat perekaman           |
| Fake GPS / root device                 | Kecurangan          | Deteksi mock location, anomali akurasi, device binding, foto sebagai bukti, audit admin  |
| Free tier storage penuh                | Upload gagal        | Kompresi agresif, retensi 24 bulan, monitor kuota, jalur upgrade jelas                   |
| Resistensi karyawan terhadap perubahan | Adopsi rendah       | Onboarding sederhana, sesi sosialisasi, masa paralel 2 minggu dengan sistem lama         |
| Nominatim rate limit                   | Alamat tidak muncul | Cache per koordinat (dibulatkan), fallback tampil koordinat saja — tidak memblokir absen |

---

## 15. Status Keputusan

### ✅ Sudah diputuskan

| Topik         | Keputusan                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Stack         | Next.js + Neon Postgres + Cloudflare R2 (via storage adapter) + Vercel                                        |
| Geofence      | Radius & kebijakan luar area diatur admin per lokasi (§6.2.1)                                                 |
| Shift         | Tidak ada shift bawaan — admin membuat sendiri nama & jamnya, plus roster per tanggal (§6.2.2)                |
| Form tindakan | ON untuk Perawat Gigi; OFF untuk Front Office. Diatur per jabatan oleh admin (§6.3)                           |
| Cuti tahunan  | 12 hari. Sisa akhir tahun dapat **diuangkan**, **dibawa ke tahun depan**, atau **sebagian–sebagian** (§6.4.1) |
| Approval      | Admin menentukan siapa yang boleh approve, per jenis pengajuan & cakupan, dengan fallback ke HR (§6.4)        |
| Prinsip       | Zero hardcode — semua kebijakan dikelola dari antarmuka admin (§6.0)                                          |

### ❓ Masih perlu jawaban (tidak memblokir M0, dibutuhkan saat seeding)

1. Jumlah karyawan saat rilis dan berapa lokasi/cabang?
2. Daftar tindakan + tarif fee asistensi perawat (bisa diisi belakangan lewat menu admin)
3. Tarif pencairan cuti per hari: nilai tetap, atau rumus dari gaji pokok?
4. Domain yang akan dipakai untuk hosting

---

_Dokumen ini adalah acuan tunggal untuk pengembangan AliaPresensi. Perubahan ruang lingkup dicatat sebagai revisi versi._
