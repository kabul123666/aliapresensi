# Memasang AliaPresensi ke internet (paket gratis)

Susunan yang dipakai: **Vercel** menjalankan aplikasi, **Neon** menyimpan data,
**Vercel Blob** menyimpan foto absensi. Semuanya paket gratis dan tanpa kartu
kredit.

---

## 1. Neon — database

1. Masuk ke **https://neon.tech**
2. **Create project** → nama `aliapresensi` → region **Singapore** (terdekat)
3. Salin **Connection string**-nya, bentuknya seperti:
   `postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

Simpan baik-baik — di dalamnya ada password database.

---

## 2. Vercel — menjalankan aplikasi

1. Masuk ke **https://vercel.com**
2. **Add New → Project** → pilih repo **aliapresensi** → **Import**
3. Buka **Environment Variables**, isi **satu baris ini saja**:

| Nama             | Isi                                 |
| ---------------- | ----------------------------------- |
| `ADMIN_PASSWORD` | password administrator pilihan Anda |

Sisanya tidak perlu diisi tangan: `DATABASE_URL` dan `BLOB_READ_WRITE_TOKEN`
diisi otomatis saat database dan penyimpanan ditautkan, zona waktu sudah
tertanam di kode, dan jenis penyimpanan terdeteksi sendiri dari token Blob.

4. Tekan **Deploy**

Hasilnya sebuah alamat seperti `https://aliapresensi.vercel.app`.

> Kalau repo `aliapresensi` tidak muncul saat Import, klik **Adjust GitHub App
> Permissions** lalu centang repo itu. Repo boleh berada di akun GitHub yang
> berbeda dari akun Vercel — Vercel hanya perlu izin membacanya.

---

## 3. Vercel Blob — penyimpanan foto

Dilakukan setelah proyeknya ada.

1. Di proyek yang sama, buka tab **Storage**
2. **Create Database** → pilih **Blob** → beri nama → **Create**
3. Pastikan store itu **Connect** ke proyek `aliapresensi`

Vercel akan mengisi `BLOB_READ_WRITE_TOKEN` sendiri — tidak perlu diketik.

4. Buka tab **Deployments** → titik tiga pada deployment teratas → **Redeploy**,
   supaya aplikasi membaca token yang baru masuk

Foto disimpan sebagai objek **privat**, tanpa URL publik. Penyajiannya lewat
`/api/berkas` yang memeriksa sesi, sehingga karyawan hanya bisa membuka fotonya
sendiri dan admin bisa membuka semuanya.

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

## Daya tahan paket gratis

| Layanan      | Jatah gratis       | Perkiraan untuk 20 karyawan  |
| ------------ | ------------------ | ---------------------------- |
| Neon         | ~0,5 GB            | belasan tahun (~40 MB/tahun) |
| Vercel Blob  | 1 GB               | ~1,3 tahun (~0,76 GB/tahun)  |
| Vercel Hobby | 100 GB lalu-lintas | cukup                        |

Foto disimpan 720×960 kualitas 72, sekitar 75 KB per lembar; dua lembar per
karyawan per hari.

Angka jatah gratis di atas berlaku saat dokumen ini ditulis dan bisa berubah —
periksa di situs masing-masing.

### Yang perlu diantisipasi

**Blob penuh sekitar tahun kedua.** Saat mendekati 1 GB, pilihannya menaikkan
paket Blob atau pindah ke Cloudflare R2 (gratis 10 GB, tahan belasan tahun).
Pindah ke R2 hanya mengganti `STORAGE_DRIVER` menjadi `r2` beserta kredensialnya
— kodenya sudah mendukung — tetapi foto lama perlu disalin manual.

**Retensi foto belum berjalan.** Di Pengaturan ada "Retensi foto absensi
(bulan)", tetapi belum ada penjadwal yang benar-benar menghapus foto lama,
sehingga penyimpanan tumbuh terus. Bila penghapusan otomatis itu dijalankan,
konsumsi berhenti tumbuh di sekitar 1,5 GB dan tidak pernah bertambah lagi.

**Vercel Hobby melarang penggunaan komersial.** Untuk dipakai operasional
sungguhan, paketnya perlu dinaikkan ke Pro (sekitar $20/bulan). Menaikkan paket
tidak memindahkan data dan tidak mengubah alamat.
