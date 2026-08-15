# AliaPresensi

Aplikasi absensi karyawan **Alia Hospital** — clock in/out berfoto dengan geotag,
pencatatan tindakan ber-fee, jadwal jaga, cuti & lembur, serta dashboard untuk HRD.

Spesifikasi lengkap ada di [docs/PRD.md](docs/PRD.md).

## Siapa yang memakai

Aplikasi ini melayani **dua jenis staf**: **Perawat Gigi** dan **Staf Front Office**.
Dokter tidak dibuatkan akun — fee dokter dihitung terpisah di luar sistem ini.
Pencatatan tindakan ber-fee melekat pada perawat gigi yang mengasisteni tindakan.

---

## Menjalankan di komputer sendiri

Tidak perlu memasang database apa pun. Cukup:

```bash
npm install
```

```bash
npm run db:setup
```

```bash
npm run dev
```

Buka http://localhost:3000

`db:setup` membuat berkas migrasi, menerapkannya ke **PGlite** (Postgres embedded
yang tersimpan di `.data/pglite`), lalu membuat satu akun administrator.

### Masuk pertama kali

| Username | Password   |
| -------- | ---------- |
| `admin`  | `admin123` |

**Ganti password ini setelah masuk.** Login memakai username, bukan email — banyak
perawat dan staf front office tidak punya email kantor, dan username lebih cepat
diketik saat antre absen pagi. Karyawan yang lupa username atau password menghubungi
admin; tidak ada pemulihan lewat email.

Aplikasi sengaja dimulai **kosong**: tidak ada departemen, jabatan, lokasi, shift,
maupun katalog tindakan bawaan. Layar Dashboard menampilkan daftar langkah
penyiapan dan mencentangnya sendiri saat Anda mengisinya.

Admin masuk ke `/admin`, karyawan masuk ke `/`.

> **Catatan 1 — izin perangkat.** Clock in butuh izin **kamera** dan **lokasi**.
> Browser hanya memberikan izin ini pada `localhost` atau HTTPS, jadi jangan
> diakses lewat IP jaringan lokal tanpa sertifikat.

> **Catatan 2 — satu proses saja.** PGlite adalah Postgres yang berjalan di dalam
> proses aplikasi, sehingga **tidak boleh dibuka dua proses sekaligus**. Hentikan
> `npm run dev` sebelum menjalankan `db:migrate`, `db:admin`, atau `db:reset` —
> skripnya sudah menolak jalan bila server dev masih hidup. Batasan ini hilang
> begitu pindah ke Neon/Postgres sungguhan di produksi.

---

## Perintah yang tersedia

| Perintah              | Kegunaan                                     |
| --------------------- | -------------------------------------------- |
| `npm run dev`         | Jalankan server pengembangan                 |
| `npm run build`       | Build produksi                               |
| `npm run typecheck`   | Periksa tipe TypeScript                      |
| `npm run lint`        | Periksa gaya & aturan kode                   |
| `npm run format`      | Rapikan format kode                          |
| `npm run db:generate` | Buat berkas migrasi dari perubahan schema    |
| `npm run db:migrate`  | Terapkan migrasi                             |
| `npm run db:seed`     | Isi data awal                                |
| `npm run db:reset`    | Hapus database lokal lalu isi ulang dari nol |

---

## Struktur

```
docs/            PRD dan dokumentasi
drizzle/         Berkas migrasi SQL (versioned, ikut di-commit)
scripts/         Skrip migrasi & seed
src/
  app/
    (auth)/      Halaman masuk & daftar
    (mobile)/    Aplikasi karyawan — bottom nav, satu kolom, lebar ponsel
    (web)/       Dashboard admin — sidebar, topbar, tabel padat
    api/         Route handler (penyajian foto absensi)
  components/
    icons3d/     Set ikon 3D buatan sendiri (SVG berlapis)
    ui/          Primitif antarmuka
    mobile/      Komponen khas tampilan ponsel
    web/         Komponen khas tampilan admin
  db/            Schema Drizzle + pemilihan driver
  features/      Logika per domain: auth, attendance, admin
  lib/           Waktu (WIB), geofence, foto, storage, tema, utilitas
```

Tampilan karyawan dan tampilan admin sengaja **dipisah total** — bukan satu layout
yang diperlebar. Alur kerja keduanya memang berbeda.

---

## Pindah ke produksi

Kode ditulis agar penyedia layanan bisa ditukar tanpa menyentuh kode fitur.

### Database

Isi `DATABASE_URL` dengan connection string Postgres (mis. Neon). Begitu variabel ini
terisi, aplikasi otomatis memakai `pg` alih-alih PGlite — pemilihannya hanya ada di
[src/db/driver.ts](src/db/driver.ts).

```bash
npm run db:migrate
```

### Penyimpanan foto

Setel `STORAGE_DRIVER=r2` lalu isi kredensial Cloudflare R2. Semua akses berkas lewat
satu antarmuka di [src/lib/storage/index.ts](src/lib/storage/index.ts), jadi berpindah
ke S3 atau penyedia lain hanya menambah satu implementasi.

Salin `.env.example` menjadi `.env.local`, lalu isi. **Jangan commit `.env.local`.**

---

## Keamanan yang sudah diterapkan

- Password di-hash dengan **scrypt** (N=32768), parameter ikut disimpan agar bisa dinaikkan
- Sesi berupa token acak di cookie `httpOnly`; database hanya menyimpan hash-nya
- Lockout otomatis setelah 5 percobaan login gagal
- Pesan galat login tidak membocorkan apakah sebuah email terdaftar
- Pengecekan peran dan kepemilikan data dilakukan **di server**, bukan dengan
  menyembunyikan tombol
- Waktu absensi selalu dari server; jam ponsel diabaikan
- Watermark foto dibakar di server, EXIF dibuang, gambar di-encode ulang
- Berkas unggahan diperiksa lewat _magic bytes_, bukan content-type dari klien
- Nominal fee tindakan selalu diambil dari master data server, tidak pernah dari klien
- Foto absensi hanya bisa dibuka pemiliknya atau admin; jalur berkas dinormalisasi
  untuk mencegah path traversal
- Seluruh aksi tulis tercatat di tabel `audit_logs`

---

## Modul yang tersedia

### Aplikasi karyawan (mobile)

| Halaman   | Isi                                                           |
| --------- | ------------------------------------------------------------- |
| Beranda   | Jam berjalan, clock in/out berfoto, ringkasan bulan, pintasan |
| Riwayat   | Kalender berwarna per status + rincian harian                 |
| Pengajuan | Saldo cuti, form cuti/izin/lembur/koreksi, riwayat pengajuan  |
| Fee Saya  | Rincian tindakan dan estimasi fee bulan berjalan              |
| Profil    | Data kepegawaian, perangkat terikat, tema, keluar             |

### Dashboard admin (web)

| Halaman              | Isi                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Dashboard            | Kehadiran hari ini, tren 14 hari, tabel absensi, antrean yang butuh tindakan              |
| Rekap Absensi        | Rekap per periode, drill-down + foto, **export Excel**, cetak PDF                         |
| Persetujuan          | Antrean cuti/lembur/koreksi/luar area, aksi massal, efek otomatis                         |
| Tindakan & Fee       | Verifikasi tindakan, rekap fee per karyawan & per jenis, katalog tarif                    |
| Karyawan             | Daftar & filter, verifikasi pendaftaran, reset password, aktif/nonaktif                   |
| Departemen & Jabatan | Struktur organisasi + sakelar pencatatan tindakan                                         |
| Jadwal Jaga          | Roster bulanan: klik sel untuk memutar shift, salin dari bulan lalu, isi sebaris          |
| Shift                | Shift bebas dibuat admin, lintas hari, toleransi, hari kerja                              |
| Lokasi & Geofence    | Peta, radius, kebijakan luar area, toleransi akurasi GPS                                  |
| Pengaturan           | Profil, kebijakan absensi & cuti, jenis cuti, aturan persetujuan, hari libur, tutup tahun |
| Audit Log            | Jejak seluruh perubahan: pelaku, waktu, nilai lama → baru, IP                             |

### Belum dibangun

- Pengingat absen lewat push notification
- Pencocokan wajah otomatis (face matching)
- Roster shift bulanan berbentuk tabel (shift default per karyawan sudah ada)
- Slip insentif PDF per karyawan
- Pengiriman email sungguhan (notifikasi saat ini tersimpan di dalam aplikasi)
