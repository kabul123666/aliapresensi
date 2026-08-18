import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

/**
 * IBM Plex dipilih dengan sengaja: ia dirancang untuk sistem kerja sebuah
 * institusi, bukan untuk halaman pemasaran. Pasangan Sans + Mono membuat
 * seluruh nilai waktu bisa diset monospace, sehingga kolom jam berbaris rata
 * seperti kartu absen cetak — itulah karakter tipografi aplikasi ini.
 */
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AliaPresensi",
    template: "%s · AliaPresensi",
  },
  description: "Sistem absensi karyawan Alia Hospital.",
  applicationName: "AliaPresensi",
  appleWebApp: { capable: true, title: "AliaPresensi", statusBarStyle: "default" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  // Warna bilah peramban mengikuti tema bawaan aplikasi (terang), bukan
  // preferensi sistem — supaya bilah tidak gelap sementara halamannya putih.
  themeColor: "#f2f4f1",
};

/**
 * Menerapkan tema sebelum paint agar tidak ada kedipan saat mode gelap.
 * Harus inline dan berjalan lebih dulu dari React.
 *
 * Tanpa nilai tersimpan hasilnya terang — itu tema bawaan aplikasi. Preferensi
 * gelap milik sistem operasi hanya diikuti bila pengguna memilih "Sistem"
 * secara sadar di Profil (lihat src/lib/tema.ts).
 */
const themeScript = `(function(){try{var t=localStorage.getItem("alia-theme");var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${plex.variable} ${plexMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
