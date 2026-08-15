/**
 * Kerangka halaman masuk & daftar.
 *
 * Sengaja tanpa panel pemasaran: yang membuka halaman ini adalah karyawan
 * yang sudah bekerja di sini dan sedang buru-buru absen, bukan calon pembeli.
 * Satu kolom sempit, terpusat, tanpa yang perlu dibaca.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-app flex min-h-dvh flex-col">
      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-[23rem]">{children}</div>
      </main>

      <footer className="text-subtle px-6 pb-8 text-center text-xs">
        Alia Hospital · Sistem Informasi Kepegawaian
      </footer>
    </div>
  );
}
