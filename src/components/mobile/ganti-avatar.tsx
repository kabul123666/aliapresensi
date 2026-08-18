"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";

import { aksiPilihStiker, aksiUnggahFotoProfil } from "@/features/employees/aksi-profil";
import { cn } from "@/lib/utils";
import { Avatar, StikerPria, StikerWanita, type JenisKelamin } from "./avatar";

export function GantiAvatar({
  nama,
  fotoUrl,
  jenisKelamin,
}: {
  nama: string;
  fotoUrl: string | null;
  jenisKelamin: JenisKelamin;
}) {
  const router = useRouter();
  const berkasRef = useRef<HTMLInputElement>(null);
  const [buka, setBuka] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [proses, mulai] = useTransition();

  const unggah = (file: File) =>
    mulai(async () => {
      const fd = new FormData();
      fd.append("foto", file);
      const hasil = await aksiUnggahFotoProfil(fd);
      setPesan(hasil.pesan);
      if (hasil.ok) {
        setBuka(false);
        router.refresh();
      }
    });

  const pilih = (nilai: string) =>
    mulai(async () => {
      const hasil = await aksiPilihStiker(nilai);
      setPesan(hasil.pesan);
      if (hasil.ok) {
        setBuka(false);
        router.refresh();
      }
    });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setPesan(null);
          setBuka(true);
        }}
        className="relative shrink-0"
        aria-label="Ubah gambar diri"
      >
        <Avatar
          nama={nama}
          fotoUrl={fotoUrl}
          jenisKelamin={jenisKelamin}
          className="size-20 text-2xl ring-4 ring-white/25"
        />
        <span className="bg-surface absolute -right-0.5 -bottom-0.5 grid size-7 place-items-center rounded-full shadow-[var(--shadow-soft)]">
          <Camera size={14} className="text-brand-600" />
        </span>
      </button>

      {buka && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            className="absolute inset-0 bg-[var(--overlay)]"
            onClick={() => setBuka(false)}
            aria-label="Tutup"
          />
          <div className="bg-surface pb-safe relative w-full rounded-t-[var(--radius-sheet)] px-5 pt-5 pb-6">
            <h2 className="text-body text-base font-extrabold">Ubah gambar diri</h2>
            <p className="text-muted mt-1 text-[13px] leading-relaxed">
              Unggah foto, atau pilih gambar bawaan bila tidak ingin memakai foto.
            </p>

            {pesan && (
              <p
                role="status"
                className="text-brand-700 dark:text-brand-300 mt-3 text-xs font-semibold"
              >
                {pesan}
              </p>
            )}

            <input
              ref={berkasRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) unggah(f);
              }}
            />

            <button
              type="button"
              disabled={proses}
              onClick={() => berkasRef.current?.click()}
              className="bg-brand-600 hover:bg-brand-700 mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-input)] text-[15px] font-semibold text-white disabled:opacity-60"
            >
              {proses ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={17} />
              )}
              Unggah foto
            </button>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { nilai: "PRIA", label: "Pria", Gambar: StikerPria },
                { nilai: "WANITA", label: "Wanita", Gambar: StikerWanita },
              ].map((s) => (
                <button
                  key={s.nilai}
                  type="button"
                  disabled={proses}
                  onClick={() => pilih(s.nilai)}
                  className={cn(
                    "border-app flex flex-col items-center gap-2 rounded-[var(--radius-card)] border p-3 disabled:opacity-60",
                    jenisKelamin === s.nilai && "border-brand-500 bg-brand-50",
                  )}
                >
                  <s.Gambar className="size-14 rounded-full" />
                  <span className="text-body text-xs font-semibold">{s.label}</span>
                </button>
              ))}

              <button
                type="button"
                disabled={proses}
                onClick={() => pilih("TANPA")}
                className="border-app flex flex-col items-center gap-2 rounded-[var(--radius-card)] border p-3 disabled:opacity-60"
              >
                <span className="bg-brand-600 grid size-14 place-items-center rounded-full text-xl font-bold text-white">
                  {nama.slice(0, 1).toUpperCase()}
                </span>
                <span className="text-body text-xs font-semibold">Inisial</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
