import { cn } from "@/lib/utils";

/**
 * Lambang aplikasi.
 *
 * Sengaja tidak memuat inisial atau nama tempat mana pun: satu aplikasi ini
 * dipakai oleh beberapa unit milik pemilik yang sama, dan masing-masing punya
 * nama sendiri. Palang medis berlaku untuk semuanya, sedangkan monogram akan
 * salah begitu dibuka dari unit dengan nama berbeda.
 *
 * Nama unit yang sebenarnya tetap muncul di tempat yang memang perlu
 * menyebutnya — kop slip dan berkas ekspor — dan diambil dari Pengaturan →
 * Profil, bukan ditanam di kode.
 */
export function LambangAplikasi({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("size-10 shrink-0", className)}
      role="img"
      aria-label="Lambang aplikasi presensi"
    >
      <rect width="40" height="40" rx="10" className="fill-brand-600" />
      {/* Dua batang tebal yang saling menimpa, bukan garis tipis: palang medis
          punya lengan lebar, dan garis tipis terbaca sebagai tanda tambah. */}
      <rect x="16.2" y="10" width="7.6" height="20" rx="2.4" fill="white" />
      <rect x="10" y="16.2" width="20" height="7.6" rx="2.4" fill="white" />
    </svg>
  );
}
