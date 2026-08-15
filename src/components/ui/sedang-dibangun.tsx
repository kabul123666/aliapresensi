import Link from "next/link";
import { Construction } from "lucide-react";

/**
 * Penanda jujur untuk rute yang tautannya sudah ada di navigasi tetapi
 * halamannya belum dibangun. Lebih baik menyatakannya terang-terangan
 * daripada membiarkan pengguna menabrak 404 tanpa penjelasan.
 */
export function SedangDibangun({
  judul,
  isi,
  milestone,
  kembali = "/",
  labelKembali = "Kembali ke beranda",
}: {
  judul: string;
  isi: string;
  milestone: string;
  kembali?: string;
  labelKembali?: string;
}) {
  return (
    <div className="grid min-h-[60dvh] place-items-center px-6 py-12">
      <div className="max-w-md text-center">
        <div className="bg-warn-50 dark:bg-warn-500/15 mx-auto grid size-16 place-items-center rounded-full">
          <Construction className="text-warn-600 dark:text-warn-500" size={30} />
        </div>
        <h1 className="text-body mt-5 text-xl font-extrabold tracking-tight">{judul}</h1>
        <p className="text-muted mt-3 text-[15px] leading-relaxed">{isi}</p>
        <p className="text-subtle bg-surface-muted mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold">
          Dijadwalkan pada {milestone}
        </p>
        <div className="mt-7">
          <Link
            href={kembali}
            className="border-app-strong bg-surface text-body hover:bg-surface-muted inline-flex h-11 items-center rounded-[var(--radius-input)] border px-5 text-sm font-semibold transition-colors"
          >
            {labelKembali}
          </Link>
        </div>
      </div>
    </div>
  );
}
