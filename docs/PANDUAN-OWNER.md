# Panduan Mencoba AliaPresensi

Panduan ini untuk **mencoba aplikasi di komputer sendiri**. Tidak perlu membeli
domain, tidak perlu menyewa server, dan tidak perlu memasang database apa pun.

---

## Yang perlu dipahami lebih dulu

Aplikasi ini belum dipasang di internet. Artinya:

| Bisa sekarang                                       | Belum bisa sekarang                             |
| --------------------------------------------------- | ----------------------------------------------- |
| Dibuka di komputer tempat aplikasi dijalankan       | Dibuka karyawan dari HP masing-masing           |
| Mencoba seluruh menu admin dan menu karyawan        | Dipakai absensi harian yang sesungguhnya        |
| Absen memakai kamera laptop                         | Absen dari HP karyawan                          |
| Menilai tampilan, alur kerja, dan kelengkapan fitur | Dipakai dua orang bersamaan di komputer berbeda |

Data yang Anda masukkan saat mencoba **hanya tersimpan di komputer Anda**, tidak
terkirim ke mana pun.

Supaya bisa dipakai karyawan sungguhan dari HP mereka, aplikasi perlu dipasang
ke server (hosting) dan diberi alamat web ber-HTTPS. Itu tahap berikutnya —
kamera dan GPS hanya diizinkan browser pada alamat HTTPS.

---

## Langkah 1 — Pasang Node.js

Node.js adalah program yang menjalankan aplikasi ini. Cukup dipasang sekali.

1. Buka **https://nodejs.org**
2. Unduh versi **LTS** (tombol kiri, yang bertuliskan "Recommended For Most Users")
3. Jalankan file yang terunduh, klik **Next / Continue** sampai selesai

> Perlu Node.js versi 20 ke atas. Versi LTS di situs resminya sudah memenuhi.

---

## Langkah 2 — Unduh aplikasinya

1. Buka **https://github.com/kabul123666/aliapresensi**
2. Klik tombol hijau **Code**
3. Pilih **Download ZIP**
4. Buka file ZIP yang terunduh, lalu pindahkan foldernya ke Desktop agar mudah dicari

---

## Langkah 3 — Buka Terminal di folder aplikasi

**Mac**

1. Buka aplikasi **Terminal** (cari lewat Spotlight: tekan `Cmd + Spasi`, ketik "Terminal")
2. Ketik `cd ` (dengan satu spasi setelahnya) — **jangan tekan Enter dulu**
3. Seret folder aplikasi dari Desktop ke jendela Terminal — alamatnya akan terisi sendiri
4. Tekan **Enter**

**Windows**

1. Buka folder aplikasi lewat File Explorer
2. Klik kolom alamat di atas, ketik `cmd`, lalu tekan **Enter**

---

## Langkah 4 — Siapkan aplikasi

Ketik perintah berikut satu per satu, tekan **Enter** setiap selesai satu baris,
dan **tunggu sampai berhenti berjalan** sebelum mengetik berikutnya.

Memasang komponen yang dibutuhkan — paling lama, bisa 2–5 menit:

```bash
npm install
```

Menyiapkan database dan membuat akun administrator:

```bash
npm run db:setup
```

---

## Langkah 5 — Jalankan

```bash
npm run dev
```

Setelah muncul tulisan `Ready`, buka browser lalu kunjungi:

**http://localhost:3000**

> **Jangan tutup jendela Terminal selama memakai aplikasi.** Menutupnya akan
> mematikan aplikasi. Untuk berhenti, tekan `Ctrl + C` di Terminal.
>
> Untuk menjalankan lagi besok, cukup ulangi Langkah 3 dan ketik `npm run dev`.

---

## Masuk pertama kali

| Username | Password   |
| -------- | ---------- |
| `admin`  | `admin123` |

**Segera ganti password ini** lewat menu Profil setelah masuk. Password di atas
tertulis terbuka di halaman GitHub, jadi jangan dipakai saat aplikasi sudah
online nanti.

- Halaman administrator: **http://localhost:3000/admin**
- Halaman karyawan: **http://localhost:3000**

---

## Mengisi data — urutannya penting

Aplikasi sengaja dimulai kosong, tanpa data contoh. Isi dari atas ke bawah,
karena yang bawah membutuhkan yang atas:

1. **Departemen & Jabatan** — misalnya Departemen "Poli Gigi", Jabatan "Perawat Gigi"
   - Saat membuat jabatan, ada sakelar **pencatatan tindakan**. Nyalakan untuk
     Perawat Gigi supaya ia bisa mencatat tindakan ber-fee; matikan untuk Front Office.
2. **Lokasi & Geofence** — titik klinik dan radius area absen (misalnya 150 meter)
3. **Shift** — jam kerja, misalnya "Pagi 08:00–16:00", termasuk toleransi terlambat
4. **Karyawan** — tambahkan orangnya, lalu pasangkan departemen, jabatan, lokasi, dan shiftnya
5. **Tindakan & Fee → Katalog** — daftar tindakan beserta nominal fee asistensinya

Setelah itu barulah menu Jadwal Jaga, Rekap Absensi, dan Fee terisi angka.

> Staf yang datang hanya bila ada pasien tidak wajib diberi shift — ia tetap bisa
> absen, hanya tidak dinilai terlambat atau lembur. Aturan ini bisa dimatikan di
> **Pengaturan → Kebijakan absensi**.

---

## Mencoba absen

1. Buka **http://localhost:3000** (halaman karyawan)
2. Tekan tombol bulat **Masuk**
3. Browser akan meminta izin **kamera** dan **lokasi** — pilih **Izinkan**
4. Ambil foto, lalu kirim

Foto akan diberi cap waktu, koordinat, dan status area secara otomatis oleh
aplikasi — bukan oleh HP — sehingga tidak bisa dipalsukan.

---

## Kalau ada masalah

| Yang terjadi                         | Sebabnya & solusinya                                                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `command not found: npm`             | Node.js belum terpasang atau Terminal belum dibuka ulang. Tutup Terminal, buka lagi, ulangi Langkah 3.    |
| Halaman tidak terbuka                | Pastikan Terminal masih menampilkan `Ready` dan alamatnya `http://localhost:3000` (bukan `https`).        |
| Kamera atau lokasi tidak muncul      | Izin ditolak. Klik ikon gembok di kolom alamat browser → izinkan Kamera dan Lokasi → muat ulang halaman.  |
| `port 3000 is already in use`        | Aplikasi sudah berjalan di Terminal lain. Tutup Terminal yang lama, atau buka saja http://localhost:3000. |
| Ingin menghapus semua data percobaan | Tekan `Ctrl + C` untuk menghentikan aplikasi, lalu ketik `npm run db:reset`, kemudian `npm run dev` lagi. |

> Aplikasi hanya boleh berjalan di satu jendela Terminal. Hentikan dulu dengan
> `Ctrl + C` sebelum menjalankan `npm run db:reset`.

---

## Bila nanti diputuskan untuk dipakai sungguhan

Yang dibutuhkan pada tahap itu:

- **Hosting** untuk aplikasinya
- **Database** yang berjalan terus-menerus, menggantikan database lokal ini
- **Penyimpanan foto** absensi
- **Nama domain** ber-HTTPS, syarat mutlak agar kamera dan GPS berfungsi di HP

Rinciannya ada di [README.md](../README.md) bagian "Pindah ke produksi".
