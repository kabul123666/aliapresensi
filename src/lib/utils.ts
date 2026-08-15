import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format angka menjadi rupiah tanpa desimal. */
export function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Ubah menit menjadi teks durasi ringkas: 95 -> "1j 35m". */
export function formatDurasi(menit: number) {
  if (menit <= 0) return "0m";
  const jam = Math.floor(menit / 60);
  const sisa = menit % 60;
  if (jam === 0) return `${sisa}m`;
  if (sisa === 0) return `${jam}j`;
  return `${jam}j ${sisa}m`;
}

/** Ambil inisial dari nama untuk avatar. */
export function inisial(nama: string) {
  return nama
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((kata) => kata[0]?.toUpperCase() ?? "")
    .join("");
}
