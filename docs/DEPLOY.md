# Memasang AliaPresensi ke internet (paket gratis)

Susunan yang dipakai: **Vercel** menjalankan aplikasi, **Neon** menyimpan data,
**Cloudflare R2** menyimpan foto absensi. Ketiganya punya paket gratis.

Kenapa fotonya di R2 dan bukan di Vercel Blob: dengan 20 karyawan, jatah gratis
Vercel Blob (1 GB) habis dalam ~1,3 tahun, sedangkan R2 (10 GB) bertahan ~13
tahun. Memindahkan foto belakangan jauh lebih repot daripada memilih benar sejak
awal.

---

## 1. Neon — database

1. Masuk ke **https://neon.tech**
2. **Create project** → beri nama `aliapresensi` → region **Singapore** (terdekat)
3. Salin **Connection string**-nya, bentuknya seperti:
   `postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

Simpan baik-baik — di dalamnya ada password database.

---

## 2. Cloudflare R2 — penyimpanan foto

1. Masuk ke **https://dash.cloudflare.com** → menu **R2**
2. Aktifkan R2 (perlu kartu terdaftar untuk verifikasi, tidak ditagih selama di
   bawah 10 GB)
3. **Create bucket** → nama `aliapresensi` → biarkan **Private**
4. Masuk ke **Manage R2 API Tokens** → **Create API token**
   - Permission: **Object Read & Write**
   - Batasi ke bucket `aliapresensi` saja
5. Catat empat nilai ini: **Account ID**, **Access Key ID**, **Secret Access Key**,
   dan nama bucket

---

## 3. Vercel — menjalankan aplikasi

1. Masuk ke **https://vercel.com** dengan akun yang sama dengan GitHub
2. **Add New → Project** → pilih repo **aliapresensi** → **Import**
3. Sebelum menekan Deploy, buka **Environment Variables** dan isi:

| Nama                   | Isi                                        |
| ---------------------- | ------------------------------------------ |
| `DATABASE_URL`         | Connection string dari Neon (langkah 1)    |
| `STORAGE_DRIVER`       | `r2`                                       |
| `R2_ACCOUNT_ID`        | Account ID Cloudflare                      |
| `R2_ACCESS_KEY_ID`     | Access Key ID dari token R2                |
| `R2_SECRET_ACCESS_KEY` | Secret Access Key dari token R2            |
| `R2_BUCKET`            | `aliapresensi`                             |
| `NOMINATIM_USER_AGENT` | `AliaPresensi/1.0 (email-anda@domain.com)` |
| `TZ`                   | `Asia/Jakarta`                             |

4. Tekan **Deploy** dan tunggu sampai selesai

Hasilnya sebuah alamat seperti `https://aliapresensi.vercel.app`.

---

## 4. Siapkan isi database

Dijalankan **sekali saja**, dari komputer Anda, di dalam folder aplikasi.

Membuat seluruh tabel di Neon:

```bash
DATABASE_URL="paste-connection-string-neon-di-sini" npm run db:migrate
```

Membuat akun administrator — **ganti passwordnya**, jangan pakai contoh di bawah:

```bash
DATABASE_URL="paste-connection-string-neon-di-sini" ADMIN_USERNAME="admin" ADMIN_PASSWORD="ganti-dengan-password-kuat" npm run db:admin
```

> Password admin wajib berbeda dari `admin123`. Password bawaan itu tertulis
> terbuka di README repo publik — kalau dipakai, siapa pun yang menemukan alamat
> aplikasi bisa masuk sebagai administrator.

---

## 5. Pemeriksaan setelah online

1. Buka alamat Vercel-nya, masuk memakai akun admin yang barusan dibuat
2. Isi data dasar sesuai urutan di [PANDUAN-OWNER.md](PANDUAN-OWNER.md):
   departemen → jabatan → lokasi → shift → karyawan → katalog tindakan
3. Coba satu kali clock in dari HP untuk memastikan kamera, GPS, dan penyimpanan
   foto bekerja

Kamera dan GPS hanya diizinkan browser pada alamat HTTPS. Alamat Vercel sudah
HTTPS, jadi absen dari HP karyawan akan berfungsi.

---

## Yang perlu diketahui tentang paket gratis

| Layanan       | Jatah gratis       | Perkiraan untuk 20 karyawan  |
| ------------- | ------------------ | ---------------------------- |
| Neon          | ~0,5 GB            | belasan tahun (~40 MB/tahun) |
| Cloudflare R2 | 10 GB              | ~13 tahun (~0,76 GB/tahun)   |
| Vercel Hobby  | 100 GB lalu-lintas | cukup                        |

Angka jatah gratis di atas berlaku saat dokumen ini ditulis dan bisa berubah —
periksa di situs masing-masing.

**Vercel Hobby melarang penggunaan komersial.** Untuk dipakai operasional
sungguhan, paketnya perlu dinaikkan ke Pro (sekitar $20/bulan). Menaikkan paket
tidak memindahkan data dan tidak mengubah alamat — cukup ganti paket di
dashboard.

**Retensi foto belum berjalan.** Di Pengaturan ada "Retensi foto absensi (bulan)",
tetapi belum ada penjadwal yang benar-benar menghapus foto lama, sehingga
penyimpanan tumbuh terus. Selama masih memakai R2 hal ini belum mendesak.
