"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { aksiSimpanTarifKhusus } from "@/features/master/actions";
import { formatRupiah } from "@/lib/utils";

export type JabatanTarif = { id: string; nama: string };

/**
 * Tarif khusus per jabatan untuk satu tindakan.
 *
 * Dipakai bila fee asistensi berbeda antar jabatan — misalnya perawat gigi
 * senior dan asisten menerima nominal berbeda untuk tindakan yang sama.
 * Jabatan yang dikosongkan memakai fee default tindakan.
 */
export function ModalTarif({
  namaTindakan,
  procedureId,
  feeDefault,
  jabatan,
  tarifAwal,
  onTutup,
}: {
  namaTindakan: string;
  procedureId: string;
  feeDefault: number;
  jabatan: JabatanTarif[];
  tarifAwal: Record<string, number>;
  onTutup: () => void;
}) {
  const router = useRouter();
  const [nilai, setNilai] = useState<Record<string, string>>(() =>
    Object.fromEntries(jabatan.map((j) => [j.id, String(tarifAwal[j.id] ?? "")])),
  );
  const [pesan, setPesan] = useState<string | null>(null);
  const [proses, mulai] = useTransition();

  function simpan() {
    mulai(async () => {
      let tersimpan = 0;
      for (const j of jabatan) {
        const teks = nilai[j.id]?.trim();
        if (!teks) continue;
        const angka = Number(teks);
        if (!Number.isFinite(angka) || angka < 0) continue;
        if (tarifAwal[j.id] === angka) continue;

        const res = await aksiSimpanTarifKhusus(procedureId, j.id, Math.round(angka));
        if (!res.ok) {
          setPesan(res.pesan);
          return;
        }
        tersimpan++;
      }
      setPesan(
        tersimpan > 0
          ? `${tersimpan} tarif khusus disimpan.`
          : "Tidak ada perubahan untuk disimpan.",
      );
      router.refresh();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-5 py-10">
      <button
        className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm"
        onClick={onTutup}
        aria-label="Tutup"
      />
      <div className="bg-surface relative w-full max-w-md rounded-[var(--radius-sheet)] p-6 shadow-[var(--shadow-float)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-body text-lg font-semibold">Tarif khusus</h2>
            <p className="text-muted mt-0.5 truncate text-[13px]">{namaTindakan}</p>
          </div>
          <button
            onClick={onTutup}
            className="text-subtle hover:text-body grid size-9 shrink-0 place-items-center rounded-lg"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-muted bg-surface-muted rounded-[var(--radius-input)] px-3.5 py-2.5 text-[13px]">
          Fee default:{" "}
          <span className="text-body font-semibold">{formatRupiah(feeDefault)}</span>.
          Kosongkan sebuah jabatan agar memakai nominal default.
        </p>

        {pesan && (
          <p
            role="status"
            className="bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100 mt-3 rounded-[var(--radius-input)] px-3.5 py-2.5 text-[13px]"
          >
            {pesan}
          </p>
        )}

        {jabatan.length === 0 ? (
          <p className="text-muted mt-4 text-sm">
            Belum ada jabatan. Buat jabatan lebih dulu di menu Departemen &amp; Jabatan.
          </p>
        ) : (
          <div className="mt-4 space-y-2.5">
            {jabatan.map((j) => (
              <div key={j.id} className="flex items-center gap-3">
                <label
                  htmlFor={`tarif-${j.id}`}
                  className="text-body min-w-0 flex-1 truncate text-[13px]"
                >
                  {j.nama}
                </label>
                <input
                  id={`tarif-${j.id}`}
                  type="number"
                  min={0}
                  step={5000}
                  value={nilai[j.id] ?? ""}
                  onChange={(e) => setNilai((s) => ({ ...s, [j.id]: e.target.value }))}
                  placeholder={String(feeDefault)}
                  className="bg-surface border-app-strong text-body focus:border-brand-600 h-10 w-36 rounded-[var(--radius-input)] border px-3 text-right font-mono text-sm outline-none"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onTutup}>
            Tutup
          </Button>
          <Button
            className="flex-1"
            onClick={simpan}
            disabled={proses || jabatan.length === 0}
          >
            {proses && <Loader2 size={16} className="animate-spin" />}
            Simpan tarif
          </Button>
        </div>
      </div>
    </div>
  );
}
