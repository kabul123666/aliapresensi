import { LambangAplikasi } from "@/components/lambang";

/**
 * Kerangka halaman masuk & daftar.
 *
 * Sengaja tanpa panel pemasaran: yang membuka halaman ini adalah karyawan
 * yang sudah bekerja di sini dan sedang buru-buru absen, bukan calon pembeli.
 * Satu kolom sempit dan terpusat.
 *
 * Tidak ada nama unit di sini. Aplikasi yang sama melayani beberapa tempat
 * milik pemilik yang sama dengan nama masing-masing, jadi menuliskan salah
 * satunya di layar masuk akan keliru bagi yang lain.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-app flex min-h-dvh flex-col">
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[24rem]">
          <div className="mb-7 flex justify-center">
            <LambangAplikasi className="size-14" />
          </div>

          <div className="bg-surface border-app rounded-[var(--radius-card)] border px-6 py-8 shadow-[var(--shadow-raised)] sm:px-8">
            {children}
          </div>

          <footer className="text-subtle mt-6 text-center text-xs">
            Sistem Informasi Kepegawaian
          </footer>
        </div>
      </main>
    </div>
  );
}
