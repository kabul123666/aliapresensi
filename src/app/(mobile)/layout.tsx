import Link from "next/link";

import { NavBawah } from "@/components/mobile/nav-bawah";
import { wajibMasuk } from "@/lib/auth/session";

/**
 * Kerangka aplikasi karyawan.
 *
 * Sengaja dipisah total dari tampilan admin: di sini navigasinya bottom-tab,
 * satu kolom, target sentuh besar, dan lebar dikunci selebar ponsel. Ketika
 * dibuka di desktop, kerangka ini ditampilkan terpusat di atas latar bermerek
 * — bukan direntangkan, karena alur kerjanya memang dirancang untuk ponsel.
 */
export default async function MobileLayout({ children }: { children: React.ReactNode }) {
  const pengguna = await wajibMasuk();

  return (
    <div className="from-brand-950 via-brand-900 to-ink-950 flex min-h-dvh flex-col bg-gradient-to-br lg:items-center lg:justify-center lg:py-8">
      {/* Penanda konteks saat dibuka di layar besar */}
      <div className="mb-5 hidden w-full max-w-[430px] items-center justify-between px-1 lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-white/12 ring-1 ring-white/20">
            <span className="text-sm font-extrabold text-white">A</span>
          </span>
          <span>
            <span className="block text-sm font-bold text-white">AliaPresensi</span>
            <span className="text-brand-300/80 block text-[11px]">Tampilan karyawan</span>
          </span>
        </div>
        {(pengguna.role === "ADMIN" || pengguna.role === "SUPER_ADMIN") && (
          <Link
            href="/admin"
            className="rounded-full bg-white/12 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
          >
            Buka dashboard admin →
          </Link>
        )}
      </div>

      {/*
        Tinggi kerangka dikunci ke tinggi layar (bukan mengikuti konten) supaya
        hanya area isi yang bergulir. Dengan begitu navigasi bawah cukup menjadi
        elemen flex biasa dan selalu menempel di dasar layar — bukan ikut
        tergulir seperti kalau ia dipasang absolute di kontainer setinggi konten.
      */}
      <div className="bg-app flex h-dvh w-full max-w-[430px] flex-col overflow-hidden lg:h-[min(860px,calc(100dvh-8rem))] lg:rounded-[2.5rem] lg:shadow-[0_40px_100px_-20px_rgb(0_0_0/0.55)] lg:ring-1 lg:ring-white/10">
        <div className="scrollbar-slim min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
        <NavBawah role={pengguna.role} />
      </div>
    </div>
  );
}
