# Memasang AliaPresensi ke internet (paket gratis)

**Vercel** menjalankan aplikasi, **Neon** menyimpan data, **Vercel Blob**
menyimpan foto. Semuanya paket gratis, tanpa kartu kredit, dan seluruhnya
dikerjakan dari browser — tidak perlu membuka Terminal sama sekali.

Hanya ada **satu** hal yang perlu diketik: password administrator.

---

## 1. Buat proyek

1. Masuk ke **https://vercel.com**
2. **Add New → Project** → pilih repo **presensikaryawan** → **Import**
3. Buka **Environment Variables**, isi satu baris:

| Nama             | Isi                                 |
| ---------------- | ----------------------------------- |
| `ADMIN_PASSWORD` | password administrator pilihan Anda |

4. Tekan **Deploy**, tunggu sampai selesai

Deploy pertama ini **sukses tetapi aplikasinya belum bisa dipakai** — databasenya
memang belum ada. Itu normal, lanjutkan ke langkah berikutnya.

> Kalau repo `presensikaryawan` tidak muncul saat Import, klik **Adjust GitHub App
> Permissions** lalu centang repo itu. Repo boleh berada di akun GitHub yang
> berbeda dari akun Vercel — Vercel hanya perlu izin membacanya.

---

## 2. Pasang database dan penyimpanan foto

Di proyek yang sama, buka tab **Storage**:

1. **Create Database** → **Neon** → region **Singapore** → **Create**
2. **Create Database** → **Blob** → **Create**

Pastikan keduanya tersambung ke proyek `presensikaryawan`. Vercel mengisi
`DATABASE_URL` dan `BLOB_READ_WRITE_TOKEN` sendiri — tidak ada yang perlu
disalin atau diketik.

> Bila Neon tidak ada di daftar Storage, cari lewat **Marketplace**. Bila muncul
> permintaan menyetujui syarat layanan Neon, itu harus Anda yang menyetujui.

---

## 3. Redeploy

Tab **Deployments** → titik tiga pada deployment teratas → **Redeploy**.

Redeploy inilah yang menyelesaikan segalanya secara otomatis:

- seluruh tabel database dibuat
- akun administrator dibuat memakai `ADMIN_PASSWORD` yang Anda isi
- foto absensi diarahkan ke Blob

Setelah selesai, aplikasi siap dipakai di alamat `https://<nama-proyek>.vercel.app`.

---

## 4. Pemeriksaan

1. Buka alamatnya, masuk dengan username `admin` dan password yang Anda isi tadi
2. Isi data dasar berurutan, karena yang bawah membutuhkan yang atas:
   departemen → jabatan → lokasi → shift → karyawan → katalog tindakan
3. Coba satu kali clock in dari HP untuk memastikan kamera, GPS, dan penyimpanan
   foto bekerja

Kamera dan GPS hanya diizinkan browser pada alamat HTTPS. Alamat Vercel sudah
HTTPS, jadi absen dari HP karyawan akan berfungsi.

---

## Kalau ada yang gagal

| Gejala                                  | Sebabnya                                                                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Halaman menampilkan "Application error" | Database belum tertaut. Ulangi langkah 2, lalu Redeploy.                                        |
| Bisa masuk, tetapi foto absensi gagal   | Store Blob belum tertaut atau belum Redeploy setelah menautkannya.                              |
| Username `admin` ditolak                | `ADMIN_PASSWORD` belum terisi saat Redeploy. Isi di Settings → Environment Variables, Redeploy. |
| Build gagal                             | Buka deployment yang merah → tab **Building** → baca baris paling bawah yang berwarna merah.    |

Log setiap tahap penyiapan bisa dibaca di tab **Building** pada deployment —
termasuk keterangan bila migrasi atau pembuatan admin sengaja dilewati.

---

## Daya tahan paket gratis

| Layanan      | Jatah gratis       | Perkiraan untuk 20 karyawan  |
| ------------ | ------------------ | ---------------------------- |
| Neon         | ~0,5 GB            | belasan tahun (~40 MB/tahun) |
| Vercel Blob  | 1 GB               | ~1,3 tahun (~0,76 GB/tahun)  |
| Vercel Hobby | 100 GB lalu-lintas | cukup                        |

Foto disimpan 720×960 kualitas 72, sekitar 75 KB per lembar; dua lembar per
karyawan per hari. Angka jatah gratis berlaku saat dokumen ini ditulis dan bisa
berubah — periksa di situs masing-masing.

### Yang perlu diantisipasi

**Blob penuh sekitar tahun kedua.** Saat mendekati 1 GB, pilihannya menaikkan
paket Blob atau pindah ke Cloudflare R2 (gratis 10 GB, tahan belasan tahun).
Pindah ke R2 cukup mengisi `STORAGE_DRIVER=r2` beserta kredensialnya — kodenya
sudah mendukung — tetapi foto lama perlu disalin manual.

**Retensi foto belum berjalan.** Di Pengaturan ada "Retensi foto absensi
(bulan)", tetapi belum ada penjadwal yang benar-benar menghapus foto lama,
sehingga penyimpanan tumbuh terus. Bila penghapusan otomatis itu dijalankan,
konsumsi berhenti tumbuh di sekitar 1,5 GB.

**Vercel Hobby melarang penggunaan komersial.** Untuk dipakai operasional
sungguhan, paketnya perlu dinaikkan ke Pro (sekitar $20/bulan). Menaikkan paket
tidak memindahkan data dan tidak mengubah alamat.
