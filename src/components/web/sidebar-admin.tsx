"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarRange,
  ClipboardCheck,
  LayoutDashboard,
  MapPinned,
  Menu,
  Megaphone,
  ScrollText,
  Settings,
  CalendarDays,
  Stethoscope,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Badge = { persetujuan: number; pendaftaran: number };

const KELOMPOK = [
  {
    judul: "Operasional",
    menu: [
      { href: "/admin", label: "Dashboard", Ikon: LayoutDashboard, exact: true },
      { href: "/admin/absensi", label: "Rekap Absensi", Ikon: CalendarRange },
      {
        href: "/admin/persetujuan",
        label: "Persetujuan",
        Ikon: ClipboardCheck,
        badge: "persetujuan" as const,
      },
      { href: "/admin/tindakan", label: "Tindakan & Fee", Ikon: Wallet },
      { href: "/admin/pengumuman", label: "Pengumuman", Ikon: Megaphone },
    ],
  },
  {
    judul: "Kepegawaian",
    menu: [
      {
        href: "/admin/karyawan",
        label: "Karyawan",
        Ikon: Users,
        badge: "pendaftaran" as const,
      },
      { href: "/admin/organisasi", label: "Departemen & Jabatan", Ikon: Building2 },
      { href: "/admin/jadwal", label: "Jadwal Jaga", Ikon: CalendarDays },
      { href: "/admin/shift", label: "Shift", Ikon: Stethoscope },
      { href: "/admin/lokasi", label: "Lokasi & Geofence", Ikon: MapPinned },
    ],
  },
  {
    judul: "Sistem",
    menu: [
      { href: "/admin/pengaturan", label: "Pengaturan", Ikon: Settings },
      { href: "/admin/audit", label: "Audit Log", Ikon: ScrollText },
    ],
  },
];

export function SidebarAdmin({ badge }: { badge: Badge }) {
  const pathname = usePathname();
  const [terbuka, setTerbuka] = useState(false);

  const isi = (
    <nav className="flex h-full flex-col">
      <div className="border-app flex h-16 items-center gap-2.5 border-b px-5">
        <span className="bg-brand-600 grid size-9 place-items-center rounded-xl shadow-[var(--shadow-brand)]">
          <span className="text-sm font-extrabold text-white">A</span>
        </span>
        <span className="min-w-0">
          <span className="text-body block truncate text-sm font-extrabold">
            AliaPresensi
          </span>
          <span className="text-subtle block text-[11px]">Panel Admin</span>
        </span>
      </div>

      <div className="scrollbar-slim flex-1 overflow-y-auto px-3 py-4">
        {KELOMPOK.map((k) => (
          <div key={k.judul} className="mb-5">
            <p className="text-subtle px-3 pb-2 text-[10.5px] font-bold tracking-[0.12em] uppercase">
              {k.judul}
            </p>
            <ul className="space-y-0.5">
              {k.menu.map(({ href, label, Ikon, ...sisa }) => {
                const exact = "exact" in sisa && sisa.exact;
                const aktif = exact ? pathname === href : pathname.startsWith(href);
                const jumlah = "badge" in sisa && sisa.badge ? badge[sisa.badge] : 0;

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setTerbuka(false)}
                      aria-current={aktif ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold transition-colors",
                        aktif
                          ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                          : "text-muted hover:bg-surface-muted hover:text-body",
                      )}
                    >
                      <Ikon size={17.5} strokeWidth={aktif ? 2.3 : 1.9} />
                      <span className="flex-1 truncate">{label}</span>
                      {jumlah > 0 && (
                        <span className="bg-danger-500 tnum grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10.5px] font-bold text-white">
                          {jumlah}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="bg-surface border-app fixed inset-y-0 left-0 z-30 hidden w-[248px] border-r lg:block">
        {isi}
      </aside>

      {/* Mobile: laci */}
      <button
        onClick={() => setTerbuka(true)}
        className="bg-surface border-app text-body fixed top-3.5 left-4 z-30 grid size-10 place-items-center rounded-xl border shadow-[var(--shadow-soft)] lg:hidden"
        aria-label="Buka menu"
      >
        <Menu size={19} />
      </button>

      {terbuka && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-[var(--overlay)]"
            onClick={() => setTerbuka(false)}
            aria-label="Tutup menu"
          />
          <aside className="bg-surface absolute inset-y-0 left-0 w-[264px] shadow-[var(--shadow-float)]">
            <button
              onClick={() => setTerbuka(false)}
              className="text-subtle absolute top-4 right-3 grid size-9 place-items-center rounded-lg"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
            {isi}
          </aside>
        </div>
      )}
    </>
  );
}
