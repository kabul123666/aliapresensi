"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  House,
  LayoutGrid,
  ScanFace,
  UserRound,
} from "lucide-react";

import type { Role } from "@/db/schema";
import { cn } from "@/lib/utils";

/**
 * Bilah bawah memakai ikon garis, bukan ikon 3D.
 *
 * Ikon 3D punya bayangan dan gradien yang bagus pada ukuran besar di beranda,
 * tetapi pada 24 piksel detailnya saling menumpuk sehingga satu ikon sulit
 * dibedakan dari tetangganya. Garis tunggal tetap terbaca pada ukuran itu,
 * dan warnanya cukup dipakai untuk menandai halaman yang sedang dibuka.
 */
const MENU = [
  { href: "/", label: "Beranda", Ikon: House },
  { href: "/riwayat", label: "Kehadiran", Ikon: ScanFace },
  { href: "/jadwal", label: "Jadwal", Ikon: CalendarDays },
  { href: "/menu", label: "Menu", Ikon: LayoutGrid },
  { href: "/profil", label: "Profil", Ikon: UserRound },
] as const;

export function NavBawah({ role }: { role: Role }) {
  const pathname = usePathname();
  void role;

  return (
    <nav
      aria-label="Navigasi utama"
      className="border-app bg-surface pb-safe shrink-0 border-t"
    >
      <ul className="grid grid-cols-5">
        {MENU.map(({ href, label, Ikon }) => {
          const aktif = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={aktif ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 px-1 pt-2.5 pb-2 transition-colors",
                  aktif ? "text-brand-600 dark:text-brand-300" : "text-subtle",
                )}
              >
                <Ikon size={23} strokeWidth={aktif ? 2.2 : 1.7} />
                <span
                  className={cn(
                    "text-[11px] leading-none",
                    aktif ? "font-bold" : "font-medium",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
