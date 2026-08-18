import Link from "next/link";

import { SidebarAdmin } from "@/components/web/sidebar-admin";
import { TopbarAdmin } from "@/components/web/topbar-admin";
import { ringkasanHariIni } from "@/features/admin/service";
import { bolehKelolaSemua, PERAN_PENYETUJU, wajibPeran } from "@/lib/auth/session";

/**
 * Kerangka dashboard admin — sengaja dibuat berbeda total dari aplikasi
 * karyawan: sidebar tetap di kiri, topbar informatif, area konten lebar
 * untuk tabel padat. Alur kerjanya memang untuk layar besar.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pengguna = await wajibPeran(...PERAN_PENYETUJU);
  const ringkas = await ringkasanHariIni();

  return (
    <div className="bg-app min-h-dvh">
      <SidebarAdmin
        badge={{
          persetujuan: ringkas.menungguPersetujuan,
          pendaftaran: ringkas.pendaftaranBaru,
        }}
        adminPenuh={bolehKelolaSemua(pengguna.role)}
      />

      <div className="lg:pl-[248px]">
        <TopbarAdmin
          nama={pengguna.nama}
          peran={pengguna.role}
          jabatan={pengguna.namaJabatan}
        />
        <main className="mx-auto max-w-[1400px] px-5 py-6 lg:px-8">{children}</main>
        <footer className="text-subtle border-app mt-8 border-t px-5 py-5 text-xs lg:px-8">
          Presensi Karyawan ·{" "}
          <Link href="/" className="hover:text-body font-semibold">
            Buka tampilan karyawan
          </Link>
        </footer>
      </div>
    </div>
  );
}
