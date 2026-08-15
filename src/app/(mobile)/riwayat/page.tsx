import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { BadgeAbsen } from "@/components/ui/status";
import { riwayatBulan, ringkasanBulan } from "@/features/attendance/service";
import { wajibMasuk } from "@/lib/auth/session";
import { cn, formatDurasi } from "@/lib/utils";
import { HARI_PENDEK, jamWIB, namaBulan, tanggalPendek, tanggalWIB } from "@/lib/waktu";

export const metadata = { title: "Riwayat Kehadiran" };

const WARNA_STATUS: Record<string, string> = {
  ON_TIME: "bg-status-ontime",
  LATE: "bg-status-late",
  OVERTIME: "bg-status-overtime",
  EARLY_LEAVE: "bg-status-late",
  ABSENT: "bg-status-absent",
  ON_LEAVE: "bg-status-leave",
  HOLIDAY: "bg-status-holiday",
  DAY_OFF: "bg-status-holiday",
  INCOMPLETE: "bg-status-late",
};

export default async function HalamanRiwayat({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string }>;
}) {
  const pengguna = await wajibMasuk();
  const sp = await searchParams;

  const hariIni = tanggalWIB();
  const [tahunKini, bulanKini] = hariIni.split("-").map(Number);

  const cocok = /^(\d{4})-(\d{2})$/.exec(sp.bulan ?? "");
  const tahun = cocok ? Number(cocok[1]) : tahunKini;
  const bulan = cocok ? Number(cocok[2]) : bulanKini;

  const [daftar, ringkas] = await Promise.all([
    riwayatBulan(pengguna.employeeId, tahun, bulan),
    ringkasanBulan(pengguna.employeeId, tahun, bulan),
  ]);

  const petaStatus = new Map(daftar.map((d) => [d.tanggal, d]));
  const jumlahHari = new Date(Date.UTC(tahun, bulan, 0)).getUTCDate();
  const awalKolom = new Date(Date.UTC(tahun, bulan - 1, 1)).getUTCDay();

  const geser = (delta: number) => {
    const m = bulan + delta;
    const t = tahun + Math.floor((m - 1) / 12);
    const b = ((((m - 1) % 12) + 12) % 12) + 1;
    return `/riwayat?bulan=${t}-${String(b).padStart(2, "0")}`;
  };

  return (
    <div className="pb-6">
      <header className="bg-surface border-app pt-safe border-b px-5 pb-6">
        <h1 className="text-body pt-4 text-[19px] font-extrabold">Riwayat Kehadiran</h1>
        <p className="text-subtle mt-0.5 text-xs">Rekap absensi pribadi Anda per bulan</p>
      </header>

      {/* Navigasi bulan */}
      <div className="bg-surface border-app mx-5 -mt-3 flex items-center justify-between rounded-[var(--radius-card)] border px-2 py-2 shadow-[var(--shadow-soft)]">
        <Link
          href={geser(-1)}
          className="text-muted hover:bg-surface-muted grid size-9 place-items-center rounded-lg transition-colors"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft size={19} />
        </Link>
        <span className="text-body text-sm font-extrabold">
          {namaBulan(tahun, bulan)}
        </span>
        <Link
          href={geser(1)}
          className="text-muted hover:bg-surface-muted grid size-9 place-items-center rounded-lg transition-colors"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight size={19} />
        </Link>
      </div>

      {/* Ringkasan */}
      <div className="mt-4 grid grid-cols-4 gap-2 px-5">
        {[
          { label: "Hadir", nilai: ringkas.hadir, warna: "text-status-ontime" },
          { label: "Telat", nilai: ringkas.terlambat, warna: "text-status-late" },
          {
            label: "Lembur",
            nilai: formatDurasi(ringkas.totalMenitLembur),
            warna: "text-status-overtime",
          },
          {
            label: "Jam kerja",
            nilai: formatDurasi(ringkas.totalMenitKerja),
            warna: "text-body",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-surface border-app rounded-xl border px-2 py-2.5 text-center"
          >
            <p className={cn("tnum text-sm font-extrabold", k.warna)}>{k.nilai}</p>
            <p className="text-subtle mt-0.5 text-[10px] font-semibold">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Kalender */}
      <section className="mt-5 px-5">
        <div className="bg-surface border-app rounded-[var(--radius-card)] border p-4">
          <div className="grid grid-cols-7 gap-1">
            {HARI_PENDEK.map((h) => (
              <div key={h} className="text-subtle pb-1 text-center text-[10px] font-bold">
                {h}
              </div>
            ))}
            {Array.from({ length: awalKolom }).map((_, i) => (
              <div key={`kosong-${i}`} />
            ))}
            {Array.from({ length: jumlahHari }).map((_, i) => {
              const tgl = `${tahun}-${String(bulan).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
              const data = petaStatus.get(tgl);
              const iniHariIni = tgl === hariIni;
              return (
                <div
                  key={tgl}
                  className={cn(
                    "relative grid aspect-square place-items-center rounded-lg text-[11px] font-bold",
                    data ? "text-body bg-surface-muted" : "text-subtle",
                    iniHariIni && "ring-brand-500 ring-2",
                  )}
                >
                  {i + 1}
                  {data && (
                    <span
                      className={cn(
                        "absolute bottom-1 size-1.5 rounded-full",
                        WARNA_STATUS[data.status] ?? "bg-status-holiday",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Daftar harian */}
      <section className="mt-5 px-5">
        <h2 className="text-body text-sm font-extrabold tracking-tight">
          Rincian harian
        </h2>

        {daftar.length === 0 ? (
          <div className="border-app bg-surface mt-3 rounded-[var(--radius-card)] border border-dashed px-5 py-10 text-center">
            <p className="text-body text-sm font-bold">Belum ada catatan</p>
            <p className="text-muted mt-1 text-[13px]">
              Absensi bulan ini belum terekam.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {daftar.map((d) => (
              <li
                key={d.id}
                className="bg-surface border-app rounded-[var(--radius-card)] border px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body text-sm font-bold">
                      {tanggalPendek(d.tanggal)}
                    </p>
                    <p className="text-muted tnum mt-1 text-[13px]">
                      {d.clockInAt ? jamWIB(d.clockInAt) : "--:--"} →{" "}
                      {d.clockOutAt ? jamWIB(d.clockOutAt) : "--:--"}
                      {d.durasiKerjaMenit > 0 && (
                        <span className="text-subtle">
                          {" "}
                          · {formatDurasi(d.durasiKerjaMenit)}
                        </span>
                      )}
                    </p>
                    {d.menitTerlambat > 0 && (
                      <p className="text-status-late mt-0.5 text-[12px] font-semibold">
                        Terlambat {d.menitTerlambat} menit
                      </p>
                    )}
                    {d.clockInOutsideArea && (
                      <p className="text-status-absent mt-0.5 text-[12px] font-semibold">
                        Absen di luar area ({d.clockInDistanceM} m)
                      </p>
                    )}
                  </div>
                  <BadgeAbsen status={d.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
