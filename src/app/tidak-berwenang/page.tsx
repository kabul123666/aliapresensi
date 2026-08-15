import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Akses Ditolak" };

export default function HalamanTidakBerwenang() {
  return (
    <div className="bg-app grid min-h-dvh place-items-center px-6">
      <div className="max-w-sm text-center">
        <div className="bg-danger-50 dark:bg-danger-500/15 mx-auto grid size-16 place-items-center rounded-full">
          <ShieldAlert className="text-danger-600 dark:text-danger-400" size={32} />
        </div>
        <h1 className="text-body mt-5 text-2xl font-extrabold tracking-tight">
          Akses ditolak
        </h1>
        <p className="text-muted mt-3 text-[15px] leading-relaxed">
          Peran akun Anda tidak memiliki izin untuk membuka halaman ini. Hubungi HRD bila
          Anda merasa seharusnya punya akses.
        </p>
        <Link href="/" className="mt-7 inline-block">
          <Button size="lg">Kembali ke beranda</Button>
        </Link>
      </div>
    </div>
  );
}
