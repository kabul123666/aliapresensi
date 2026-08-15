"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Coins, Loader2, Pencil, Plus, Power, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Hint, Input, Label, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/status";
import {
  aksiSimpanTindakan,
  aksiUbahAktifTindakan,
  type HasilMaster,
} from "@/features/master/actions";
import { cn, formatRupiah } from "@/lib/utils";
import { ModalTarif, type JabatanTarif } from "./modal-tarif";

export type BarisKatalog = {
  id: string;
  nama: string;
  kategori: string;
  feeDefault: number;
  keterangan: string | null;
  aktif: boolean;
  jumlahTarifKhusus: number;
};

const NADA_KATEGORI: Record<string, "danger" | "warn" | "netral" | "brand"> = {
  BESAR: "danger",
  SEDANG: "warn",
  RINGAN: "netral",
  NON_FEE: "brand",
};

function FormTindakan({
  data,
  onSelesai,
}: {
  data: BarisKatalog | null;
  onSelesai: () => void;
}) {
  const [hasil, kirim, sedang] = useActionState<HasilMaster | null, FormData>(
    aksiSimpanTindakan,
    null,
  );
  useEffect(() => {
    if (hasil?.ok) onSelesai();
  }, [hasil, onSelesai]);

  return (
    <form action={kirim} className="space-y-4">
      {data && <input type="hidden" name="id" value={data.id} />}
      {hasil && !hasil.ok && (
        <div className="bg-danger-50 text-danger-700 dark:bg-danger-500/12 dark:text-danger-100 rounded-[var(--radius-input)] px-4 py-3 text-sm font-medium">
          {hasil.pesan}
        </div>
      )}

      <div>
        <Label htmlFor="nama">Nama tindakan</Label>
        <Input
          id="nama"
          name="nama"
          defaultValue={data?.nama}
          placeholder="Odontectomy (Operasi Gigi Bungsu)"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="kategori">Kategori</Label>
          <Select id="kategori" name="kategori" defaultValue={data?.kategori ?? "RINGAN"}>
            <option value="BESAR">Tindakan besar</option>
            <option value="SEDANG">Tindakan sedang</option>
            <option value="RINGAN">Tindakan ringan</option>
            <option value="NON_FEE">Tanpa fee</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="feeDefault">Fee default (Rp)</Label>
          <Input
            id="feeDefault"
            name="feeDefault"
            type="number"
            min={0}
            step={5000}
            defaultValue={data?.feeDefault ?? 0}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="keterangan">Keterangan</Label>
        <Input
          id="keterangan"
          name="keterangan"
          defaultValue={data?.keterangan ?? ""}
          placeholder="Opsional"
        />
        <Hint>
          Mengubah tarif tidak mengubah tindakan yang sudah tercatat — nominalnya
          dibekukan saat pencatatan.
        </Hint>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={sedang}>
        {sedang && <Loader2 size={17} className="animate-spin" />}
        Simpan tindakan
      </Button>
    </form>
  );
}

export function PanelKatalog({
  daftar,
  jabatan,
  tarif,
}: {
  daftar: BarisKatalog[];
  jabatan: JabatanTarif[];
  tarif: Record<string, Record<string, number>>;
}) {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [terpilih, setTerpilih] = useState<BarisKatalog | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [tarifUntuk, setTarifUntuk] = useState<BarisKatalog | null>(null);
  const [proses, mulai] = useTransition();

  return (
    <div className="space-y-4">
      {pesan && (
        <div
          role="status"
          className="bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100 rounded-[var(--radius-input)] px-4 py-3 text-sm font-medium"
        >
          {pesan}
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => {
            setTerpilih(null);
            setModal(true);
          }}
        >
          <Plus size={16} /> Tambah tindakan
        </Button>
      </div>

      <div className="bg-surface border-app overflow-hidden rounded-[var(--radius-card)] border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-app text-subtle border-b text-left text-[11px] font-bold tracking-wide uppercase">
              <th className="px-5 py-2.5">Tindakan</th>
              <th className="px-3 py-2.5">Kategori</th>
              <th className="px-3 py-2.5 text-right">Fee default</th>
              <th className="px-5 py-2.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.map((t) => (
              <tr
                key={t.id}
                className={cn(
                  "border-app hover:bg-surface-muted border-b transition-colors last:border-0",
                  !t.aktif && "opacity-55",
                )}
              >
                <td className="px-5 py-3">
                  <p className="text-body font-semibold">{t.nama}</p>
                  {t.keterangan && <p className="text-subtle text-xs">{t.keterangan}</p>}
                </td>
                <td className="px-3 py-3">
                  <Badge tone={NADA_KATEGORI[t.kategori] ?? "netral"}>{t.kategori}</Badge>
                </td>
                <td className="text-body tnum px-3 py-3 text-right font-semibold">
                  {t.feeDefault > 0 ? formatRupiah(t.feeDefault) : "—"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setTarifUntuk(t)}
                      title={
                        t.jumlahTarifKhusus > 0
                          ? `${t.jumlahTarifKhusus} tarif khusus`
                          : "Atur tarif khusus per jabatan"
                      }
                      aria-label={`Tarif khusus ${t.nama}`}
                      className={cn(
                        "relative grid size-9 place-items-center rounded-lg transition-colors",
                        t.jumlahTarifKhusus > 0
                          ? "text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/40"
                          : "text-muted hover:bg-surface-muted hover:text-body",
                      )}
                    >
                      <Coins size={15} />
                    </button>
                    <button
                      onClick={() => {
                        setTerpilih(t);
                        setModal(true);
                      }}
                      className="text-muted hover:bg-surface-muted hover:text-body grid size-9 place-items-center rounded-lg transition-colors"
                      aria-label={`Ubah ${t.nama}`}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      disabled={proses}
                      onClick={() =>
                        mulai(async () => {
                          const r = await aksiUbahAktifTindakan(t.id, !t.aktif);
                          setPesan(r.pesan);
                          router.refresh();
                        })
                      }
                      className={cn(
                        "grid size-9 place-items-center rounded-lg transition-colors",
                        t.aktif
                          ? "text-muted hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/15"
                          : "text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/40",
                      )}
                      aria-label={
                        t.aktif ? `Nonaktifkan ${t.nama}` : `Aktifkan ${t.nama}`
                      }
                    >
                      <Power size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tarifUntuk && (
        <ModalTarif
          namaTindakan={tarifUntuk.nama}
          procedureId={tarifUntuk.id}
          feeDefault={tarifUntuk.feeDefault}
          jabatan={jabatan}
          tarifAwal={tarif[tarifUntuk.id] ?? {}}
          onTutup={() => setTarifUntuk(null)}
        />
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
              <h2 className="text-body text-lg font-extrabold tracking-tight">
                {terpilih ? `Ubah ${terpilih.nama}` : "Tambah tindakan"}
              </h2>
              <button
                onClick={() => setModal(false)}
                className="text-subtle hover:text-body grid size-9 place-items-center rounded-lg"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>
            <FormTindakan
              data={terpilih}
              onSelesai={() => {
                setModal(false);
                setPesan("Tindakan disimpan.");
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
