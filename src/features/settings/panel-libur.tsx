"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import {
  aksiHapusHariLibur,
  aksiTambahHariLibur,
  type HasilMaster,
} from "@/features/master/actions";
import { cn } from "@/lib/utils";
import { tanggalPanjang } from "@/lib/waktu";

export function PanelLibur({
  tahun,
  daftar,
}: {
  tahun: number;
  daftar: { id: string; tanggal: string; nama: string }[];
}) {
  const router = useRouter();
  const [hasil, kirim, sedang] = useActionState<HasilMaster | null, FormData>(
    aksiTambahHariLibur,
    null,
  );
  const [proses, mulai] = useTransition();

  return (
    <div className="grid gap-5 lg:grid-cols-[22rem_1fr]">
      <form
        action={kirim}
        className="bg-surface border-app h-fit space-y-4 rounded-[var(--radius-card)] border p-5"
      >
        <div>
          <h2 className="text-body text-base font-extrabold">Tambah hari libur</h2>
          <p className="text-muted mt-1 text-sm">
            Hari libur tidak dihitung sebagai alpa pada rekap.
          </p>
        </div>

        {hasil && (
          <div
            role="status"
            className={cn(
              "rounded-[var(--radius-input)] px-4 py-3 text-sm font-medium",
              hasil.ok
                ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100"
                : "bg-danger-50 text-danger-700 dark:bg-danger-500/12 dark:text-danger-100",
            )}
          >
            {hasil.pesan}
          </div>
        )}

        <div>
          <Label htmlFor="tanggal">Tanggal</Label>
          <Input id="tanggal" name="tanggal" type="date" required />
        </div>
        <div>
          <Label htmlFor="nama">Keterangan</Label>
          <Input id="nama" name="nama" placeholder="Hari Kemerdekaan RI" required />
        </div>

        <Button type="submit" className="w-full" disabled={sedang}>
          {sedang && <Loader2 size={16} className="animate-spin" />}
          Tambahkan
        </Button>
      </form>

      <div className="bg-surface border-app overflow-hidden rounded-[var(--radius-card)] border">
        <h2 className="border-app text-body border-b px-5 py-4 text-base font-extrabold">
          Hari libur {tahun}
          <span className="text-subtle ml-2 text-sm font-semibold">{daftar.length}</span>
        </h2>

        {daftar.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <CalendarDays className="text-subtle mx-auto" size={28} />
            <p className="text-muted mt-3 text-sm">
              Belum ada hari libur terdaftar untuk tahun ini.
            </p>
          </div>
        ) : (
          <ul className="divide-app divide-y">
            {daftar.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="text-body text-sm font-semibold">{h.nama}</p>
                  <p className="text-subtle text-xs">{tanggalPanjang(h.tanggal)}</p>
                </div>
                <button
                  disabled={proses}
                  onClick={() =>
                    mulai(async () => {
                      await aksiHapusHariLibur(h.id);
                      router.refresh();
                    })
                  }
                  className="text-subtle hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/15 grid size-9 place-items-center rounded-lg transition-colors"
                  aria-label={`Hapus ${h.nama}`}
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
