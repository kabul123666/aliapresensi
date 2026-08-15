"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { terapkanTema, useTema, type Tema } from "@/lib/tema";
import { cn } from "@/lib/utils";

const PILIHAN = [
  { nilai: "terang" as const, label: "Terang", Ikon: Sun },
  { nilai: "gelap" as const, label: "Gelap", Ikon: Moon },
  { nilai: "sistem" as const, label: "Sistem", Ikon: Monitor },
] satisfies { nilai: Tema; label: string; Ikon: typeof Sun }[];

/**
 * Pengalih tema. Nilainya dibaca langsung dari localStorage lewat
 * useTema(), dan skrip inline di root layout menerapkannya sebelum paint
 * sehingga tidak ada kedipan saat halaman dimuat.
 */
export function PilihTema() {
  const tema = useTema();

  return (
    <div className="bg-surface-muted mt-4 grid grid-cols-3 gap-1 rounded-[var(--radius-input)] p-1">
      {PILIHAN.map(({ nilai, label, Ikon }) => (
        <button
          key={nilai}
          onClick={() => terapkanTema(nilai)}
          aria-pressed={tema === nilai}
          className={cn(
            "flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-[11px] font-semibold transition-colors",
            tema === nilai
              ? "bg-surface text-body shadow-[var(--shadow-soft)]"
              : "text-muted hover:text-body",
          )}
        >
          <Ikon size={17} />
          {label}
        </button>
      ))}
    </div>
  );
}
