# Presensi Karyawan — konteks untuk sesi Claude Code

Aplikasi presensi karyawan. Baca `README.md` untuk cara
menjalankan dan `docs/PRD.md` untuk spesifikasi lengkap.

## Aturan kerja (disepakati dengan pemilik proyek)

1. **Kerjakan hanya yang diminta.** Jangan menambah fitur, panel, atau hiasan
   atas inisiatif sendiri. Tiga tambahan sebelumnya (lini masa kehadiran, jam
   di halaman login, checklist penyiapan di dashboard) semuanya ditolak dan
   dihapus. Kalau menurut Anda ada yang perlu ditambah — **tanya dulu**,
   jangan langsung dibangun.
2. **Bahasa Indonesia** untuk seluruh teks antarmuka, nama variabel domain,
   dan komentar kode.
3. **Zero hardcode.** Semua angka kebijakan (jam shift, toleransi terlambat,
   radius geofence, kuota cuti, tarif fee) dikelola admin lewat antarmuka dan
   tinggal di database — tidak pernah ditulis sebagai konstanta di kode.
4. **Wajib bersih sebelum selesai:** `npx tsc --noEmit && npx eslint .`
5. Jangan pernah menambahkan data contoh/dummy ke database. Aplikasi sengaja
   dimulai kosong.

## Ruang lingkup

Melayani **dua jenis staf saja**: **Perawat Gigi** dan **Staf Front Office**.
Dokter tidak dibuatkan akun — fee dokter dihitung terpisah di luar sistem ini.
Pencatatan tindakan ber-fee melekat pada perawat gigi yang mengasisteni.

## Stack

- Next.js 16 (App Router, Server Actions) + TypeScript strict + Tailwind v4
- Drizzle ORM; **PGlite** untuk dev (`.data/pglite`), Neon/Postgres untuk produksi
- Auth sendiri: sesi token acak di cookie httpOnly, hash-nya di tabel `sessions`
- Login memakai **username**, bukan email. Akun awal: `admin` / `admin123`
- Penyimpanan foto lewat adapter (`src/lib/storage`): lokal untuk dev, R2 untuk produksi

## Struktur

```
src/app/(auth)     masuk, daftar
src/app/(mobile)   aplikasi karyawan — bottom nav, satu kolom, lebar ponsel
src/app/(web)      dashboard admin — sidebar, tabel padat
src/features/*     logika per domain (service = query, actions = mutasi)
src/lib/*          waktu (WIB), geofence, foto, storage, tema
```

Tampilan mobile dan web **sengaja dipisah total**, bukan satu layout yang
diperlebar.

## Perintah

| Perintah                             | Kegunaan                                    |
| ------------------------------------ | ------------------------------------------- |
| `npm run dev`                        | Server pengembangan                         |
| `npm run db:setup`                   | Migrasi + buat akun admin (instalasi baru)  |
| `npm run db:reset`                   | Hapus database lokal, buat ulang akun admin |
| `npm run typecheck` / `npm run lint` | Wajib bersih                                |

## Jebakan yang sudah diketahui

- **PGlite hanya boleh dibuka satu proses.** Hentikan `npm run dev` sebelum
  menjalankan `db:migrate`, `db:admin`, atau `db:reset`. Skripnya sudah
  menolak jalan bila port 3000 masih hidup — jangan diakali.
- **Kamera & lokasi** hanya diizinkan browser pada `localhost` atau HTTPS.
- Waktu absensi selalu diambil dari **server**, jam perangkat diabaikan.
- Nominal fee tindakan selalu dihitung ulang di server dari master data —
  angka dari klien tidak pernah dipercaya.
- Alpa tidak disimpan sebagai baris absensi; dihitung saat rekap dibuka
  (`hitungAlpa` di `src/features/reports/service.ts`).

## Yang sudah jadi

Auth & RBAC · clock in/out berfoto + geofence + watermark server · catatan
tindakan & fee · riwayat · notifikasi · pengajuan (cuti, izin, lembur, koreksi)

- pembatalan · ganti password · dashboard admin · rekap absensi + export Excel
- cetak · persetujuan · tindakan & fee + tarif khusus per jabatan · karyawan ·
  departemen & jabatan · jadwal jaga bulanan · shift · lokasi & geofence ·
  pengumuman · pengaturan (kebijakan, jenis cuti, aturan persetujuan, hari libur,
  tutup tahun cuti) · audit log.

## Yang belum dibangun

- Pengingat absen lewat push notification
- Pencocokan wajah otomatis
- Slip insentif PDF per karyawan
- Pengiriman email sungguhan (notifikasi kini hanya di dalam aplikasi)
- Rate limit tingkat IP, CSP ketat, 2FA admin — perlu sebelum produksi
