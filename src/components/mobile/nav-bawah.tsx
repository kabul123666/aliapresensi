"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  IconBeranda,
  IconKaryawan,
  IconMenu,
  IconRiwayat,
} from "@/components/icons3d";
import type { Role } from "@/db/schema";
import { cn } from "@/lib/utils";

/**
 * Bilah bawah sengaja hanya memuat empat tujuan.
 *
 * Cuti, izin, lembur, dan fee sudah punya petaknya sendiri di beranda, jadi
 * mengulangnya di sini hanya membuat dua jalan menuju tempat yang sama dan
 * memakan ruang yang seharusnya membuat sasaran sentuh tetap lebar.
 */
const MENU = [
  { href: "/", label: "Beranda", Ikon: IconBeranda },
  { href: "/riwayat", label: "Riwayat", Ikon: IconRiwayat },
  { href: "/menu", label: "Menu", Ikon: IconMenu },
  { href: "/profil", label: "Profil", Ikon: IconKaryawan },
] as const;

export function NavBawah({ role }: { role: Role }) {
  const pathname = usePathname();
  void role;

  return (
    <nav
      aria-label="Navigasi utama"
      className="border-app bg-surface/92 pb-safe shrink-0 border-t backdrop-blur-xl"
    >
      <ul className="grid grid-cols-4">
        {MENU.map(({ href, label, Ikon }) => {
          const aktif = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={aktif ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 pt-1.5 pb-2 transition-colors",
                  aktif ? "text-brand-700 dark:text-brand-300" : "text-subtle",
                )}
              >
                {/* Warnanya hanya menyala pada tujuan yang sedang dibuka, supaya
                    bilah ini menunjukkan posisi alih-alih ikut menarik perhatian
                    dari tombol absen yang menjadi aksi utama layar. */}
                <Ikon
                  size={30}
                  className={cn(
                    "transition-[filter,opacity]",
                    aktif ? "" : "opacity-60 grayscale",
                  )}
                />
                <span
                  className={cn(
                    "text-[10.5px] leading-none",
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
