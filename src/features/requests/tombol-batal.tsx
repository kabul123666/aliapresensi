"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";

import { aksiBatalkanPengajuan } from "./actions";

/**
 * Membatalkan pengajuan sendiri yang masih menunggu.
 * Hari cuti yang tadinya ditahan dikembalikan ke saldo oleh server action.
 */
export function TombolBatal({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [konfirmasi, setKonfirmasi] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [proses, mulai] = useTransition();

  if (!konfirmasi) {
    return (
      <button
        onClick={() => setKonfirmasi(true)}
        className="text-subtle hover:text-danger-600 shrink-0 text-[11px] font-medium"
      >
        Batalkan
      </button>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-1.5">
      {galat && <span className="text-danger-600 text-[11px]">{galat}</span>}
      <button
        onClick={() => setKonfirmasi(false)}
        className="text-subtle text-[11px] font-medium"
      >
        Urung
      </button>
      <button
        disabled={proses}
        onClick={() =>
          mulai(async () => {
            const res = await aksiBatalkanPengajuan(id);
            if (res.ok) router.refresh();
            else setGalat(res.pesan);
          })
        }
        aria-label={`Batalkan ${label}`}
        className="bg-danger-500 hover:bg-danger-600 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-white"
      >
        {proses ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
        Ya, batalkan
      </button>
    </span>
  );
}
