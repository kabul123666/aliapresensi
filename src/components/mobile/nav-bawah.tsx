"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, FileText, House, UserRound, Wallet } from "lucide-react";

import type { Role } from "@/db/schema";
import { cn } from "@/lib/utils";

const MENU = [
  { href: "/", label: "Beranda", Ikon: House },
  { href: "/riwayat", label: "Riwayat", Ikon: CalendarClock },
  { href: "/pengajuan", label: "Pengajuan", Ikon: FileText },
  { href: "/fee", label: "Fee Saya", Ikon: Wallet },
  { href: "/profil", label: "Profil", Ikon: UserRound },
] as const;

export function NavBawah({ role }: { role: Role }) {
  const pathname = usePathname();
  void role;

  return (
    <nav
      aria-label="Navigasi utama"
      className="border-app bg-surface/92 pb-safe shrink-0 border-t backdrop-blur-xl"
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
                  aktif
                    ? "text-brand-700 dark:text-brand-300"
                    : "text-subtle hover:text-body",
                )}
              >
                <span className="relative">
                  {aktif && (
                    <span className="bg-brand-500/12 absolute -inset-x-3 -inset-y-1.5 rounded-full" />
                  )}
                  <Ikon size={21} strokeWidth={aktif ? 2.4 : 1.9} className="relative" />
                </span>
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
