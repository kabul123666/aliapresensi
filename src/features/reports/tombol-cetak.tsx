"use client";

import { Printer } from "lucide-react";

/**
 * Mencetak halaman lewat dialog cetak peramban.
 *
 * Jalur ini dipilih daripada membuat PDF di server: hasilnya tetap PDF asli
 * (lewat "Simpan sebagai PDF"), tetapi tata letaknya selalu mengikuti tabel
 * yang sedang dilihat admin dan tidak menambah dependensi pembuat PDF.
 */
export function TombolCetak({ label = "Cetak / PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border-app-strong bg-surface text-body hover:bg-surface-muted inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-input)] border px-4 text-sm font-semibold transition-colors"
    >
      <Printer size={15} /> {label}
    </button>
  );
}
