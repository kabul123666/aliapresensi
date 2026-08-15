"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, ShieldCheck, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Hint, Label, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/status";
import type { RequestType, Role } from "@/db/schema";
import { cn } from "@/lib/utils";
import {
  aksiHapusAturanPersetujuan,
  aksiSimpanAturanPersetujuan,
  type HasilPengaturan,
} from "./actions";

const LABEL_TIPE: Record<RequestType, string> = {
  LEAVE: "Cuti",
  OVERTIME: "Lembur",
  BACKDATE: "Koreksi Absen",
  PERMIT: "Izin / Sakit",
  OUTSIDE_AREA: "Absen di Luar Area",
  DEVICE_CHANGE: "Ganti Perangkat",
};

const LABEL_PERAN: Record<string, string> = {
  SUPER_ADMIN: "Semua Super Admin",
  ADMIN: "Semua Admin / HRD",
  MANAGER: "Semua Kepala Unit",
};

export type BarisAturan = {
  id: string;
  tipePengajuan: RequestType;
  scope: "ALL" | "DEPARTMENT" | "LOCATION";
  scopeId: string | null;
  namaScope: string | null;
  totalStep: number;
  mode: "ANY" | "ALL";
  aktif: boolean;
  pelaku: {
    id: string;
    step: number;
    approverUserId: string | null;
    approverRole: Role | null;
    nama: string | null;
  }[];
};

type Kandidat = { userId: string; nama: string; role: Role };

function FormAturan({
  departemen,
  lokasi,
  kandidat,
  onSelesai,
}: {
  departemen: { id: string; nama: string }[];
  lokasi: { id: string; nama: string }[];
  kandidat: Kandidat[];
  onSelesai: () => void;
}) {
  const [hasil, kirim, sedang] = useActionState<HasilPengaturan | null, FormData>(
    aksiSimpanAturanPersetujuan,
    null,
  );
  const [scope, setScope] = useState<"ALL" | "DEPARTMENT" | "LOCATION">("ALL");
  const [totalStep, setTotalStep] = useState(1);
  const [pelaku, setPelaku] = useState<{ step: number; penanda: string }[]>([
    { step: 1, penanda: "ADMIN" },
  ]);

  useEffect(() => {
    if (hasil?.ok) onSelesai();
  }, [hasil, onSelesai]);

  const pilihan = [
    { nilai: "ADMIN", label: LABEL_PERAN.ADMIN },
    { nilai: "MANAGER", label: LABEL_PERAN.MANAGER },
    ...kandidat.map((k) => ({ nilai: k.userId, label: k.nama })),
  ];

  return (
    <form action={kirim} className="space-y-4">
      <input
        type="hidden"
        name="pelaku"
        value={pelaku.map((p) => `${p.step}:${p.penanda}`).join(",")}
      />

      {hasil && !hasil.ok && (
        <div className="bg-danger-50 text-danger-700 dark:bg-danger-500/12 dark:text-danger-100 rounded-[var(--radius-input)] px-4 py-3 text-sm font-medium">
          {hasil.pesan}
        </div>
      )}

      <div>
        <Label htmlFor="tipePengajuan">Jenis pengajuan</Label>
        <Select id="tipePengajuan" name="tipePengajuan" defaultValue="LEAVE">
          {(Object.keys(LABEL_TIPE) as RequestType[]).map((t) => (
            <option key={t} value={t}>
              {LABEL_TIPE[t]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="scope">Berlaku untuk</Label>
          <Select
            id="scope"
            name="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value as typeof scope)}
          >
            <option value="ALL">Semua karyawan</option>
            <option value="DEPARTMENT">Departemen tertentu</option>
            <option value="LOCATION">Lokasi tertentu</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="scopeId">Pilih cakupan</Label>
          <Select id="scopeId" name="scopeId" disabled={scope === "ALL"} defaultValue="">
            <option value="">—</option>
            {(scope === "DEPARTMENT"
              ? departemen
              : scope === "LOCATION"
                ? lokasi
                : []
            ).map((o) => (
              <option key={o.id} value={o.id}>
                {o.nama}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="totalStep">Jumlah langkah</Label>
          <Select
            id="totalStep"
            name="totalStep"
            value={totalStep}
            onChange={(e) => setTotalStep(Number(e.target.value))}
          >
            <option value={1}>1 langkah — langsung final</option>
            <option value={2}>2 langkah — berjenjang</option>
            <option value={3}>3 langkah</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="mode">Bila penyetuju lebih dari satu</Label>
          <Select id="mode" name="mode" defaultValue="ANY">
            <option value="ANY">Cukup salah satu</option>
            <option value="ALL">Harus semua</option>
          </Select>
        </div>
      </div>

      <div>
        <Label>Penyetuju</Label>
        <div className="mt-1 space-y-2">
          {pelaku.map((p, i) => (
            <div key={i} className="flex gap-2">
              <Select
                value={p.step}
                onChange={(e) =>
                  setPelaku((s) =>
                    s.map((x, j) =>
                      j === i ? { ...x, step: Number(e.target.value) } : x,
                    ),
                  )
                }
                className="w-32"
              >
                {Array.from({ length: totalStep }, (_, n) => (
                  <option key={n + 1} value={n + 1}>
                    Langkah {n + 1}
                  </option>
                ))}
              </Select>
              <Select
                value={p.penanda}
                onChange={(e) =>
                  setPelaku((s) =>
                    s.map((x, j) => (j === i ? { ...x, penanda: e.target.value } : x)),
                  )
                }
                className="flex-1"
              >
                {pilihan.map((o) => (
                  <option key={o.nilai} value={o.nilai}>
                    {o.label}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => setPelaku((s) => s.filter((_, j) => j !== i))}
                className="text-subtle hover:text-danger-600 grid size-11 shrink-0 place-items-center rounded-lg"
                aria-label="Hapus penyetuju"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setPelaku((s) => [...s, { step: 1, penanda: "ADMIN" }])}
        >
          <Plus size={15} /> Tambah penyetuju
        </Button>
        <Hint>
          Pengajuan yang tidak tercakup aturan mana pun otomatis jatuh ke Admin/HRD,
          sehingga tidak pernah ada yang menggantung tanpa penyetuju.
        </Hint>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={sedang}>
        {sedang && <Loader2 size={17} className="animate-spin" />}
        Simpan aturan
      </Button>
    </form>
  );
}

export function PanelPersetujuan({
  aturan,
  departemen,
  lokasi,
  kandidat,
}: {
  aturan: BarisAturan[];
  departemen: { id: string; nama: string }[];
  lokasi: { id: string; nama: string }[];
  kandidat: Kandidat[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
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
        <Button onClick={() => setModal(true)}>
          <Plus size={16} /> Tambah aturan
        </Button>
      </div>

      {aturan.length === 0 ? (
        <div className="border-app bg-surface rounded-[var(--radius-card)] border border-dashed px-6 py-14 text-center">
          <ShieldCheck className="text-subtle mx-auto" size={30} />
          <p className="text-body mt-3 text-sm font-bold">Belum ada aturan khusus</p>
          <p className="text-muted mx-auto mt-1.5 max-w-md text-sm">
            Seluruh pengajuan saat ini jatuh ke Admin/HRD sebagai penyetuju bawaan.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {aturan.map((a) => (
            <div
              key={a.id}
              className={cn(
                "bg-surface border-app rounded-[var(--radius-card)] border p-4",
                !a.aktif && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-body text-sm font-extrabold">
                    {LABEL_TIPE[a.tipePengajuan]}
                  </h3>
                  <p className="text-subtle mt-0.5 text-xs">
                    {a.scope === "ALL"
                      ? "Semua karyawan"
                      : `${a.scope === "DEPARTMENT" ? "Departemen" : "Lokasi"}: ${a.namaScope}`}
                    {" · "}
                    {a.totalStep} langkah ·{" "}
                    {a.mode === "ANY" ? "cukup satu" : "harus semua"}
                  </p>
                </div>
                <button
                  disabled={proses}
                  onClick={() =>
                    mulai(async () => {
                      const r = await aksiHapusAturanPersetujuan(a.id);
                      setPesan(r.pesan);
                      router.refresh();
                    })
                  }
                  className="text-subtle hover:bg-danger-50 hover:text-danger-600 dark:hover:bg-danger-500/15 grid size-9 shrink-0 place-items-center rounded-lg transition-colors"
                  aria-label="Hapus aturan"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="mt-3 space-y-1.5">
                {Array.from({ length: a.totalStep }, (_, i) => i + 1).map((step) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="text-subtle w-20 shrink-0 text-[11px] font-bold">
                      Langkah {step}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {a.pelaku
                        .filter((p) => p.step === step)
                        .map((p) => (
                          <Badge key={p.id} tone="brand">
                            {p.approverRole
                              ? (LABEL_PERAN[p.approverRole] ?? p.approverRole)
                              : (p.nama ?? "—")}
                          </Badge>
                        ))}
                      {a.pelaku.filter((p) => p.step === step).length === 0 && (
                        <span className="text-subtle text-xs">
                          belum ada — jatuh ke Admin
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
              <div>
                <h2 className="text-body text-lg font-extrabold tracking-tight">
                  Tambah aturan persetujuan
                </h2>
                <p className="text-muted mt-1 text-sm">
                  Aturan dengan jenis &amp; cakupan yang sama akan digantikan.
                </p>
              </div>
              <button
                onClick={() => setModal(false)}
                className="text-subtle hover:text-body grid size-9 place-items-center rounded-lg"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>
            <FormAturan
              departemen={departemen}
              lokasi={lokasi}
              kandidat={kandidat}
              onSelesai={() => {
                setModal(false);
                setPesan("Aturan persetujuan disimpan.");
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
