"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Eraser, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HARI_PENDEK } from "@/lib/waktu";
import {
  aksiIsiSebaris,
  aksiKosongkanSebaris,
  aksiSalinBulanLalu,
  aksiSetJadwal,
  type HasilRoster,
} from "./actions";
import type { KaryawanRoster, ShiftRoster } from "./service";

type Isi = Record<string, { shiftId: string | null; libur: boolean }>;

/** Huruf pendek untuk sel: "Pagi" -> "P", "Non-Shift" -> "N". */
function inisialShift(nama: string) {
  return nama.trim().charAt(0).toUpperCase();
}

export function PanelRoster({
  tahun,
  bulan,
  hari,
  karyawan,
  shift,
  isiAwal,
}: {
  tahun: number;
  bulan: number;
  /** Daftar tanggal 1..n beserta indeks hari pekannya. */
  hari: { tanggal: string; tgl: number; dow: number }[];
  karyawan: KaryawanRoster[];
  shift: ShiftRoster[];
  isiAwal: Isi;
}) {
  const router = useRouter();
  const [isi, setIsi] = useState<Isi>(isiAwal);
  const [pesan, setPesan] = useState<HasilRoster | null>(null);
  const [proses, mulai] = useTransition();

  /**
   * Satu klik memutar sel: kosong → tiap shift berurutan → Libur → kosong.
   * Memutar jauh lebih cepat daripada membuka menu untuk tiap sel ketika
   * mengisi jadwal sebulan penuh.
   */
  function putarSel(employeeId: string, tanggal: string) {
    const kunci = `${employeeId}|${tanggal}`;
    const sekarang = isi[kunci];

    let berikut: { shiftId: string | null; libur: boolean } | null;
    if (!sekarang) {
      berikut =
        shift.length > 0
          ? { shiftId: shift[0].id, libur: false }
          : { shiftId: null, libur: true };
    } else if (sekarang.libur) {
      berikut = null; // kembali kosong
    } else {
      const idx = shift.findIndex((s) => s.id === sekarang.shiftId);
      berikut =
        idx >= 0 && idx < shift.length - 1
          ? { shiftId: shift[idx + 1].id, libur: false }
          : { shiftId: null, libur: true };
    }

    // Perbarui layar lebih dulu supaya pengisian terasa seketika.
    setIsi((s) => {
      const baru = { ...s };
      if (berikut) baru[kunci] = berikut;
      else delete baru[kunci];
      return baru;
    });

    mulai(async () => {
      const res = await aksiSetJadwal(
        employeeId,
        tanggal,
        berikut?.shiftId ?? null,
        berikut?.libur ?? false,
      );
      if (!res.ok) {
        setPesan(res);
        router.refresh();
      }
    });
  }

  function jalankan(fn: () => Promise<HasilRoster>) {
    mulai(async () => {
      const res = await fn();
      setPesan(res);
      router.refresh();
    });
  }

  const warnaShift = new Map(shift.map((s) => [s.id, s.warna]));
  const namaShift = new Map(shift.map((s) => [s.id, s.nama]));

  if (shift.length === 0) {
    return (
      <div className="border-app bg-surface rounded-[var(--radius-card)] border border-dashed px-6 py-12 text-center">
        <p className="text-body text-sm font-medium">Belum ada shift</p>
        <p className="text-muted mx-auto mt-1.5 max-w-sm text-[13px]">
          Buat shift lebih dulu di menu Shift &amp; Jadwal, baru jadwal jaga bisa disusun.
        </p>
      </div>
    );
  }

  if (karyawan.length === 0) {
    return (
      <div className="border-app bg-surface rounded-[var(--radius-card)] border border-dashed px-6 py-12 text-center">
        <p className="text-body text-sm font-medium">Belum ada karyawan aktif</p>
        <p className="text-muted mt-1.5 text-[13px]">
          Daftarkan karyawan lebih dulu di menu Karyawan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pesan && (
        <div
          role="status"
          className={cn(
            "rounded-[var(--radius-input)] px-4 py-2.5 text-sm",
            pesan.ok
              ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100"
              : "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-100",
          )}
        >
          {pesan.pesan}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={proses}
          onClick={() => jalankan(() => aksiSalinBulanLalu(tahun, bulan))}
        >
          {proses ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
          Salin dari bulan lalu
        </Button>

        <p className="text-subtle text-xs">
          Klik sel untuk memutar: {shift.map((s) => s.nama).join(" → ")} → Libur → kosong.
        </p>
      </div>

      <div className="bg-surface border-app overflow-x-auto rounded-[var(--radius-card)] border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-app bg-surface sticky left-0 z-10 min-w-52 border-r border-b px-3 py-2 text-left text-[11px] font-medium">
                <span className="text-subtle">Karyawan</span>
              </th>
              {hari.map((h) => (
                <th
                  key={h.tanggal}
                  className={cn(
                    "border-app w-8 border-b px-0 py-1.5 text-center text-[10px] font-medium",
                    h.dow === 0 && "bg-danger-50 dark:bg-danger-500/10",
                  )}
                >
                  <span className="text-subtle block">{HARI_PENDEK[h.dow][0]}</span>
                  <span className="text-body tnum block">{h.tgl}</span>
                </th>
              ))}
              <th className="border-app border-b border-l px-2 py-1.5 text-center text-[10px] font-medium">
                <span className="text-subtle">Jaga</span>
              </th>
              <th className="border-app w-8 border-b px-0 py-1.5" />
            </tr>
          </thead>

          <tbody>
            {karyawan.map((k) => {
              const jaga = hari.filter(
                (h) => isi[`${k.id}|${h.tanggal}`]?.shiftId,
              ).length;

              return (
                <tr key={k.id} className="hover:bg-surface-muted/60">
                  <td className="border-app bg-surface sticky left-0 z-10 border-r border-b px-3 py-1.5">
                    <p className="text-body truncate text-[13px] font-medium">{k.nama}</p>
                    <p className="text-subtle truncate text-[11px]">
                      {k.jabatan ?? "Jabatan belum diatur"}
                    </p>
                  </td>

                  {hari.map((h) => {
                    const sel = isi[`${k.id}|${h.tanggal}`];
                    const warna = sel?.shiftId ? warnaShift.get(sel.shiftId) : undefined;

                    return (
                      <td
                        key={h.tanggal}
                        className={cn(
                          "border-app border-b p-0",
                          h.dow === 0 && "bg-danger-50/60 dark:bg-danger-500/5",
                        )}
                      >
                        <button
                          onClick={() => putarSel(k.id, h.tanggal)}
                          /* Sengaja tidak dinonaktifkan saat penyimpanan
                             berjalan: layar ini dipakai mengklik cepat sebulan
                             penuh, dan membekukan grid tiap simpan membuatnya
                             terasa macet. Tampilan sudah diperbarui lebih dulu
                             secara optimistis, dan kegagalan memicu muat ulang. */
                          title={
                            sel?.libur
                              ? "Libur"
                              : sel?.shiftId
                                ? namaShift.get(sel.shiftId)
                                : "Belum dijadwalkan"
                          }
                          aria-label={`Jadwal ${k.nama} tanggal ${h.tgl}`}
                          className={cn(
                            "grid h-9 w-full place-items-center text-[11px] font-semibold transition-colors",
                            sel?.libur && "text-subtle bg-ink-100 dark:bg-ink-800",
                            !sel && "text-subtle hover:bg-ink-100 dark:hover:bg-ink-800",
                          )}
                          style={
                            sel?.shiftId && warna
                              ? { backgroundColor: warna, color: "#fff" }
                              : undefined
                          }
                        >
                          {sel?.libur
                            ? "L"
                            : sel?.shiftId
                              ? inisialShift(namaShift.get(sel.shiftId) ?? "?")
                              : "·"}
                        </button>
                      </td>
                    );
                  })}

                  <td className="border-app tnum text-body border-b border-l px-2 text-center text-[12px]">
                    {jaga}
                  </td>

                  <td className="border-app border-b p-0">
                    <div className="flex flex-col">
                      <button
                        onClick={() =>
                          jalankan(() => aksiIsiSebaris(k.id, tahun, bulan, shift[0].id))
                        }
                        disabled={proses}
                        title={`Isi sebulan penuh dengan shift ${shift[0].nama}`}
                        className="text-subtle hover:text-body grid h-4.5 place-items-center text-[10px]"
                      >
                        ↦
                      </button>
                      <button
                        onClick={() =>
                          jalankan(() => aksiKosongkanSebaris(k.id, tahun, bulan))
                        }
                        disabled={proses}
                        title="Kosongkan baris ini"
                        className="text-subtle hover:text-danger-600 grid h-4.5 place-items-center"
                      >
                        <Eraser size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Keterangan warna */}
      <div className="text-subtle flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px]">
        {shift.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5">
            <span
              className="grid size-4 place-items-center rounded-sm text-[9px] font-bold text-white"
              style={{ backgroundColor: s.warna }}
            >
              {inisialShift(s.nama)}
            </span>
            {s.nama} · {s.jamMasuk.slice(0, 5)}–{s.jamPulang.slice(0, 5)}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="bg-ink-100 dark:bg-ink-800 grid size-4 place-items-center rounded-sm text-[9px] font-bold">
            L
          </span>
          Libur
        </span>
        <span className="flex items-center gap-1.5">
          <span className="border-app grid size-4 place-items-center rounded-sm border text-[9px]">
            ·
          </span>
          Ikut shift default karyawan
        </span>
      </div>
    </div>
  );
}
