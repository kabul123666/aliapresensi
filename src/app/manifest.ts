import type { MetadataRoute } from "next";

/**
 * Manifest PWA (PRD §6.7 — MVP).
 *
 * `start_url` sengaja "/" dan bukan "/admin": yang memasang aplikasi ini ke
 * layar utama adalah karyawan yang absen dari ponsel. Admin bekerja dari
 * peramban desktop dan tetap bisa membuka /admin seperti biasa.
 *
 * Nama, warna, dan ikon tidak dianggap kebijakan operasional, jadi boleh
 * tinggal di kode — berbeda dengan jam shift atau radius geofence yang wajib
 * dikelola admin lewat antarmuka (§6.0).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AliaPresensi · Alia Hospital",
    short_name: "AliaPresensi",
    description: "Absensi karyawan Alia Hospital — clock in/out berfoto dengan geotag.",
    lang: "id",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e120f",
    theme_color: "#0f5340",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/ikon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/ikon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/ikon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Riwayat kehadiran", url: "/riwayat" },
      { name: "Pengajuan", url: "/pengajuan" },
    ],
  };
}
