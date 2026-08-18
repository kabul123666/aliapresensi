import Link from "next/link";

import {
  IconApproval,
  IconCuti,
  IconFee,
  IconKamera,
  IconKaryawan,
  IconKeamanan,
  IconLaporan,
  IconLembur,
  IconLokasi,
  IconNotifikasi,
  IconRiwayat,
  IconTindakan,
  type Icon3DProps,
} from "@/components/icons3d";

type Menu = {
  label: string;
  Ikon: (p: Icon3DProps) => React.ReactElement;
  /** Kosong berarti fiturnya belum dibangun — ditandai dan tidak bisa dibuka. */
  href?: string;
  /** Hanya tampil bagi yang berwenang menyetujui. */
  penyetuju?: boolean;
};

/**
 * Peta menu aplikasi karyawan.
 *
 * Menu tanpa `href` sengaja tetap ditampilkan meski fiturnya belum ada, agar
 * bentuk akhir aplikasi terlihat utuh sejak awal. Yang belum jadi ditandai
 * "Segera" dan tidak bisa ditekan — lebih jujur daripada tombol yang tampak
 * hidup lalu membuka halaman kosong.
 */
const KELOMPOK: { judul: string; menu: Menu[] }[] = [
  {
    judul: "Kehadiran",
    menu: [
      { label: "Riwayat", href: "/riwayat", Ikon: IconRiwayat },
      { label: "Jadwal Shift", href: "/jadwal", Ikon: IconLaporan },
      { label: "Presensi Backdate", href: "/pengajuan/koreksi", Ikon: IconKamera },
      { label: "Aktivitas Harian", Ikon: IconTindakan },
    ],
  },
  {
    judul: "Pengajuan",
    menu: [
      { label: "Cuti", href: "/pengajuan/cuti", Ikon: IconCuti },
      { label: "Izin", href: "/pengajuan/izin", Ikon: IconKaryawan },
      { label: "Lembur", href: "/pengajuan/lembur", Ikon: IconLembur },
      { label: "Dinas", Ikon: IconLokasi },
      { label: "WFH", Ikon: IconKeamanan },
      {
        label: "Persetujuan",
        href: "/admin/persetujuan",
        Ikon: IconApproval,
        penyetuju: true,
      },
    ],
  },
  {
    judul: "Finance",
    menu: [
      { label: "Fee Saya", href: "/fee", Ikon: IconFee },
      { label: "Slip Insentif", href: "/fee/slip", Ikon: IconLaporan },
      { label: "Claim", Ikon: IconFee },
      { label: "Bonus", Ikon: IconFee },
      { label: "Slip Gaji", Ikon: IconLaporan },
      { label: "Perjalanan Dinas", Ikon: IconLokasi },
    ],
  },
  {
    judul: "Lainnya",
    menu: [
      { label: "Notifikasi", href: "/notifikasi", Ikon: IconNotifikasi },
      { label: "Profil", href: "/profil", Ikon: IconKaryawan },
      { label: "Performance", Ikon: IconTindakan },
    ],
  },
];

function Petak({ m }: { m: Menu }) {
  const isi = (
    <>
      <span className="relative">
        <m.Ikon size={44} />
        {!m.href && (
          <span className="bg-warn-500 absolute -top-1 -right-2 rounded-full px-1.5 py-px text-[9px] font-bold text-white">
            Segera
          </span>
        )}
      </span>
      <span
        className={
          m.href
            ? "text-body text-center text-[11px] leading-tight font-semibold"
            : "text-subtle text-center text-[11px] leading-tight font-semibold"
        }
      >
        {m.label}
      </span>
    </>
  );

  // Tanpa bingkai maupun latar: ikon 3D-nya sudah punya bentuk dan bayangan
  // sendiri, sehingga kotak di sekelilingnya hanya menambah garis yang ramai.
  const kelas = "flex flex-col items-center gap-2 rounded-xl px-1 py-2.5";

  if (!m.href) {
    return (
      <span
        aria-disabled
        title="Fitur ini belum tersedia"
        className={`${kelas} opacity-45`}
      >
        {isi}
      </span>
    );
  }

  return (
    <Link href={m.href} className={`${kelas} active:bg-surface-muted transition-colors`}>
      {isi}
    </Link>
  );
}

export function MenuAplikasi({ penyetuju }: { penyetuju: boolean }) {
  return (
    <div className="mt-6 space-y-6 px-5">
      {KELOMPOK.map((k) => {
        const menu = k.menu.filter((m) => !m.penyetuju || penyetuju);
        if (menu.length === 0) return null;

        return (
          <section key={k.judul}>
            <h2 className="text-body text-sm font-extrabold tracking-tight">{k.judul}</h2>
            <div className="mt-2 grid grid-cols-4 gap-x-1 gap-y-3">
              {menu.map((m) => (
                <Petak key={m.label} m={m} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
