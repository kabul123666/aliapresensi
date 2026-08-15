"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import { Badge } from "@/components/ui/status";
import { cn } from "@/lib/utils";
import {
  aksiHapusPengumuman,
  aksiSimpanPengumuman,
  aksiUbahTerbit,
  type HasilPengumuman,
} from "./actions";

export type BarisPengumuman = {
  id: string;
  judul: string;
  isi: string;
  terbit: boolean;
  waktu: string;
  pembuat: string | null;
};

function FormPengumuman({
  data,
  onSelesai,
}: {
  data: BarisPengumuman | null;
  onSelesai: () => void;
}) {
  const [hasil, kirim, sedang] = useActionState<HasilPengumuman | null, FormData>(
    aksiSimpanPengumuman,
    null,
  );

  useEffect(() => {
    if (hasil?.ok) onSelesai();
  }, [hasil, onSelesai]);

  return (
    <form action={kirim} className="space-y-4">
      {data && <input type="hidden" name="id" value={data.id} />}

      {hasil && !hasil.ok && (
        <p className="bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-100 rounded-[var(--radius-input)] px-3.5 py-2.5 text-sm">
          {hasil.pesan}
        </p>
      )}

      <div>
        <Label htmlFor="judul">Judul</Label>
        <Input
          id="judul"
          name="judul"
          defaultValue={data?.judul}
          placeholder="Libur bersama Idul Fitri"
          required
        />
      </div>

      <div>
        <Label htmlFor="isi">Isi pengumuman</Label>
        <Textarea
          id="isi"
          name="isi"
          defaultValue={data?.isi}
          className="min-h-32"
          placeholder="Tulis informasi yang perlu diketahui seluruh karyawan…"
          required
        />
      </div>

      <label className="border-app bg-surface-muted flex cursor-pointer items-start gap-3 rounded-[var(--radius-input)] border p-3.5">
        <input
          type="checkbox"
          name="terbitkan"
          defaultChecked={data ? data.terbit : true}
          className="accent-brand-600 mt-0.5 size-4"
        />
        <span>
          <span className="text-body block text-sm font-medium">Terbitkan sekarang</span>
          <span className="text-muted mt-0.5 block text-[13px]">
            Langsung tampil di beranda aplikasi karyawan. Hilangkan centang untuk
            menyimpannya sebagai draf.
          </span>
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={sedang}>
        {sedang && <Loader2 size={17} className="animate-spin" />}
        Simpan pengumuman
      </Button>
    </form>
  );
}

export function PanelPengumuman({ daftar }: { daftar: BarisPengumuman[] }) {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [terpilih, setTerpilih] = useState<BarisPengumuman | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [proses, mulai] = useTransition();

  function jalankan(fn: () => Promise<HasilPengumuman>) {
    mulai(async () => {
      const res = await fn();
      setPesan(res.pesan);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {pesan && (
        <p
          role="status"
          className="bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100 rounded-[var(--radius-input)] px-4 py-2.5 text-sm"
        >
          {pesan}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => {
            setTerpilih(null);
            setModal(true);
          }}
        >
          <Plus size={16} /> Tulis pengumuman
        </Button>
      </div>

      {daftar.length === 0 ? (
        <div className="border-app bg-surface rounded-[var(--radius-card)] border border-dashed px-6 py-12 text-center">
          <p className="text-body text-sm font-medium">Belum ada pengumuman</p>
          <p className="text-muted mx-auto mt-1.5 max-w-sm text-[13px]">
            Pengumuman yang diterbitkan tampil di beranda aplikasi karyawan.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {daftar.map((p) => (
            <li
              key={p.id}
              className={cn(
                "bg-surface border-app rounded-[var(--radius-card)] border p-4",
                !p.terbit && "opacity-70",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-body text-sm font-semibold">{p.judul}</h3>
                    <Badge tone={p.terbit ? "brand" : "netral"}>
                      {p.terbit ? "Terbit" : "Draf"}
                    </Badge>
                  </div>
                  <p className="text-muted mt-1.5 text-[13px] leading-relaxed">{p.isi}</p>
                  <p className="text-subtle mt-1.5 text-[11px]">
                    {p.waktu}
                    {p.pembuat ? ` · ${p.pembuat}` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => jalankan(() => aksiUbahTerbit(p.id, !p.terbit))}
                    disabled={proses}
                    title={p.terbit ? "Tarik dari beranda" : "Terbitkan"}
                    aria-label={p.terbit ? "Tarik pengumuman" : "Terbitkan pengumuman"}
                    className="text-muted hover:bg-surface-muted hover:text-body grid size-9 place-items-center rounded-lg transition-colors"
                  >
                    {p.terbit ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => {
                      setTerpilih(p);
                      setModal(true);
                    }}
                    title="Ubah"
                    aria-label={`Ubah ${p.judul}`}
                    className="text-muted hover:bg-surface-muted hover:text-body grid size-9 place-items-center rounded-lg transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => jalankan(() => aksiHapusPengumuman(p.id))}
                    disabled={proses}
                    title="Hapus"
                    aria-label={`Hapus ${p.judul}`}
                    className="text-muted hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/15 grid size-9 place-items-center rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-5 py-10">
          <button
            className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm"
            onClick={() => setModal(false)}
            aria-label="Tutup"
          />
          <div className="bg-surface relative w-full max-w-lg rounded-[var(--radius-sheet)] p-6 shadow-[var(--shadow-float)]">
            <div className="mb-5 flex items-start justify-between">
              <h2 className="text-body text-lg font-semibold">
                {terpilih ? "Ubah pengumuman" : "Tulis pengumuman"}
              </h2>
              <button
                onClick={() => setModal(false)}
                className="text-subtle hover:text-body grid size-9 place-items-center rounded-lg"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>
            <FormPengumuman
              data={terpilih}
              onSelesai={() => {
                setModal(false);
                setPesan("Pengumuman disimpan.");
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
