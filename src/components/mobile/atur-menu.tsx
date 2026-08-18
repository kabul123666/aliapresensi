"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { aksiSimpanMenuBeranda } from "@/features/employees/aksi-menu";
import { cn } from "@/lib/utils";
import { MENU_BAWAAN, SEMUA_MENU } from "./menu-aplikasi";

const MAKS = 7;

/**
 * Pemilih isi beranda.
 *
 * Batas tujuh menyisakan satu petak untuk "Lainnya", sehingga barisnya tetap
 * genap dan seluruh menu tetap terjangkau berapa pun yang dipilih.
 */
export function AturMenu({ terpilihAwal }: { terpilihAwal: string[] }) {
  const router = useRouter();
  const [terpilih, setTerpilih] = useState<string[]>(
    terpilihAwal.length ? terpilihAwal : MENU_BAWAAN,
  );
  const [pesan, setPesan] = useState<string | null>(null);
  const [menyimpan, mulai] = useTransition();

  // Yang belum ada fiturnya tidak ikut dipilih — menaruhnya di beranda hanya
  // memindahkan tombol mati ke tempat yang paling sering dilihat.
  const dapatDipilih = SEMUA_MENU.filter((m) => m.href);

  const alihkan = (kunci: string) => {
    setPesan(null);
    setTerpilih((s) =>
      s.includes(kunci)
        ? s.filter((k) => k !== kunci)
        : s.length >= MAKS
          ? s
          : [...s, kunci],
    );
  };

  const simpan = () =>
    mulai(async () => {
      const hasil = await aksiSimpanMenuBeranda(terpilih);
      setPesan(hasil.pesan);
      if (hasil.ok) router.refresh();
    });

  return (
    <div className="px-5 pb-28">
      <p className="text-muted mt-4 text-sm leading-relaxed">
        Pilih sampai {MAKS} menu yang ingin Anda lihat langsung di beranda. Sisanya tetap
        bisa dibuka lewat tombol Lainnya.
      </p>
      <p className="text-subtle mt-1 text-xs font-semibold">
        Terpilih {terpilih.length} dari {MAKS}
      </p>

      <ul className="mt-4 space-y-2">
        {dapatDipilih.map((m) => {
          const aktif = terpilih.includes(m.kunci);
          const penuh = !aktif && terpilih.length >= MAKS;

          return (
            <li key={m.kunci}>
              <button
                type="button"
                onClick={() => alihkan(m.kunci)}
                disabled={penuh}
                aria-pressed={aktif}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[var(--radius-card)] border px-3 py-2.5 text-left transition-colors",
                  aktif
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-900/30"
                    : "border-app bg-surface",
                  penuh && "opacity-40",
                )}
              >
                <m.Ikon size={34} />
                <span className="text-body flex-1 text-sm font-semibold">{m.label}</span>
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-md border",
                    aktif ? "bg-brand-600 border-brand-600" : "border-app-strong",
                  )}
                >
                  {aktif && <Check size={13} className="text-white" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="border-app bg-surface/95 pb-safe fixed inset-x-0 bottom-0 border-t px-5 pt-3 backdrop-blur-xl">
        {pesan && (
          <p
            role="status"
            className="text-brand-700 dark:text-brand-300 mb-2 text-xs font-semibold"
          >
            {pesan}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={simpan}
            disabled={menyimpan}
            className="bg-brand-600 hover:bg-brand-700 inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-input)] text-[15px] font-semibold text-white transition-colors disabled:opacity-60"
          >
            {menyimpan && <Loader2 size={16} className="animate-spin" />}
            Simpan
          </button>
          <button
            type="button"
            onClick={() => {
              setTerpilih(MENU_BAWAAN);
              setPesan(null);
            }}
            className="border-app-strong bg-surface text-body h-12 rounded-[var(--radius-input)] border px-4 text-sm font-semibold"
          >
            Bawaan
          </button>
        </div>
      </div>
    </div>
  );
}
