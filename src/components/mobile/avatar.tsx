import { cn } from "@/lib/utils";

/**
 * Gambar diri karyawan.
 *
 * Urutannya: foto yang diunggah, lalu gambar bawaan sesuai jenis kelamin,
 * dan terakhir inisial. Gambar bawaan dibuat sebagai SVG datar — bukan foto
 * orang lain — supaya tidak ada yang merasa diwakili wajah yang bukan
 * dirinya, dan tetap tajam pada ukuran berapa pun.
 */
export type JenisKelamin = "PRIA" | "WANITA" | null | undefined;

function StikerPria({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="presentation" aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#D3E4DD" />
      <circle cx="32" cy="26" r="11" fill="#0f5340" />
      <path
        d="M21 20a11 11 0 0 1 22 0c0 1-1.6 1.4-3 .6-2.4-1.4-5-2-8-2s-5.6.6-8 2c-1.4.8-3-.4-3-.6z"
        fill="#082b21"
      />
      <path d="M11 60c1.6-10 10.4-16 21-16s19.4 6 21 16z" fill="#0b4433" />
      <path d="M26 44h12v5a6 6 0 0 1-12 0z" fill="#f7f8f6" opacity="0.9" />
    </svg>
  );
}

function StikerWanita({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="presentation" aria-hidden>
      <circle cx="32" cy="32" r="32" fill="#F5DADE" />
      <path
        d="M18 30c0-10 6-16 14-16s14 6 14 16v6c0 3-2 4-3 3V26H21v13c-1 1-3 0-3-3z"
        fill="#7c0e2c"
      />
      <circle cx="32" cy="27" r="10.5" fill="#9f1239" />
      <path d="M11 60c1.6-10 10.4-16 21-16s19.4 6 21 16z" fill="#e11d48" />
      <path d="M26 44h12v5a6 6 0 0 1-12 0z" fill="#f7f8f6" opacity="0.9" />
    </svg>
  );
}

export function Avatar({
  nama,
  fotoUrl,
  jenisKelamin,
  className,
}: {
  nama: string;
  fotoUrl?: string | null;
  jenisKelamin?: JenisKelamin;
  className?: string;
}) {
  const kelas = cn("overflow-hidden rounded-full object-cover", className);

  if (fotoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fotoUrl} alt={`Foto ${nama}`} className={kelas} />;
  }

  if (jenisKelamin === "PRIA") return <StikerPria className={kelas} />;
  if (jenisKelamin === "WANITA") return <StikerWanita className={kelas} />;

  return (
    <span
      className={cn(
        "bg-brand-600 grid place-items-center rounded-full font-bold text-white",
        className,
      )}
    >
      {nama.slice(0, 1).toUpperCase()}
    </span>
  );
}

export { StikerPria, StikerWanita };
