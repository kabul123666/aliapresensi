import Link from "next/link";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

import { Card, CardBody } from "@/components/ui/card";
import { TombolCetak } from "@/features/reports/tombol-cetak";
import { opsiPenyaring, rekapPeriode, totalRekap } from "@/features/reports/service";
import { PERAN_PENYETUJU, wajibPeran } from "@/lib/auth/session";
import { cn, formatDurasi, formatRupiah } from "@/lib/utils";
import { namaBulan, tanggalWIB } from "@/lib/waktu";

export const metadata = { title: "Rekap Absensi" };

export default async function HalamanRekapAbsensi({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; dept?: string }>;
}) {
  await wajibPeran(...PERAN_PENYETUJU);
  const sp = await searchParams;

  const kini = tanggalWIB();
  const cocok = /^(\d{4})-(\d{2})$/.exec(sp.bulan ?? "");
  const tahun = cocok ? Number(cocok[1]) : Number(kini.slice(0, 4));
  const bulan = cocok ? Number(cocok[2]) : Number(kini.slice(5, 7));

  const [baris, opsi] = await Promise.all([
    rekapPeriode({ tahun, bulan, departmentId: sp.dept }),
    opsiPenyaring(),
  ]);
  const total = totalRekap(baris);

  const geser = (delta: number) => {
    const m = bulan + delta;
    const t = tahun + Math.floor((m - 1) / 12);
    const b = ((((m - 1) % 12) + 12) % 12) + 1;
    const q = new URLSearchParams({ bulan: `${t}-${String(b).padStart(2, "0")}` });
    if (sp.dept) q.set("dept", sp.dept);
    return `/admin/absensi?${q}`;
  };

  const paramEkspor = new URLSearchParams({
    tahun: String(tahun),
    bulan: String(bulan),
  });
  if (sp.dept) paramEkspor.set("dept", sp.dept);

  return (
    <div className="space-y-6">
      {/* Kepala — disembunyikan saat dicetak agar kertas tidak boros */}
      <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-body text-2xl font-extrabold tracking-tight">
            Rekap Absensi
          </h1>
          <p className="text-muted mt-1 text-sm">
            Ringkasan kehadiran seluruh karyawan per periode.
          </p>
        </div>
        <div className="flex gap-2">
          <TombolCetak />
          <a
            href={`/api/ekspor/absensi?${paramEkspor}`}
            className="bg-brand-600 hover:bg-brand-700 inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-input)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-brand)] transition-colors"
          >
            <Download size={15} /> Unduh Excel
          </a>
        </div>
      </div>

      {/* Kop cetak — hanya tampil di kertas */}
      <div className="hidden print:block">
        <h1 className="text-center text-lg font-extrabold">
          REKAP ABSENSI KARYAWAN — ALIA HOSPITAL
        </h1>
        <p className="text-center text-sm">Periode {namaBulan(tahun, bulan)}</p>
      </div>

      {/* Penyaring */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <div className="bg-surface border-app flex items-center rounded-[var(--radius-input)] border">
          <Link
            href={geser(-1)}
            className="text-muted hover:bg-surface-muted grid size-10 place-items-center rounded-l-[var(--radius-input)]"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft size={18} />
          </Link>
          <span className="text-body min-w-40 px-3 text-center text-sm font-bold">
            {namaBulan(tahun, bulan)}
          </span>
          <Link
            href={geser(1)}
            className="text-muted hover:bg-surface-muted grid size-10 place-items-center rounded-r-[var(--radius-input)]"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight size={18} />
          </Link>
        </div>

        <form action="/admin/absensi" className="flex gap-2">
          <input
            type="hidden"
            name="bulan"
            value={`${tahun}-${String(bulan).padStart(2, "0")}`}
          />
          <select
            name="dept"
            defaultValue={sp.dept ?? ""}
            className="bg-surface border-app-strong text-body h-10 rounded-[var(--radius-input)] border px-3 text-sm outline-none"
          >
            <option value="">Semua departemen</option>
            {opsi.departemen.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nama}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="border-app-strong bg-surface text-body hover:bg-surface-muted h-10 rounded-[var(--radius-input)] border px-4 text-sm font-semibold transition-colors"
          >
            Terapkan
          </button>
        </form>
      </div>

      {/* Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
        {[
          {
            label: "Total kehadiran",
            nilai: String(total.hadir),
            catatan: `${baris.length} karyawan`,
            warna: "text-status-ontime",
          },
          {
            label: "Keterlambatan",
            nilai: String(total.terlambat),
            catatan: formatDurasi(total.menitTerlambat),
            warna: "text-status-late",
          },
          {
            label: "Total lembur",
            nilai: formatDurasi(total.menitLembur),
            catatan: "Sudah disetujui & tercatat",
            warna: "text-status-overtime",
          },
          {
            label: "Fee tindakan",
            nilai: formatRupiah(total.totalFee),
            catatan: "Seluruh karyawan",
            warna: "text-body",
          },
        ].map((k) => (
          <Card key={k.label}>
            <CardBody>
              <p className="text-subtle text-xs font-bold tracking-wide uppercase">
                {k.label}
              </p>
              <p
                className={cn("tnum mt-2 text-2xl leading-none font-extrabold", k.warna)}
              >
                {k.nilai}
              </p>
              <p className="text-muted mt-2 text-xs">{k.catatan}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabel rekap */}
      <div className="bg-surface border-app overflow-hidden rounded-[var(--radius-card)] border print:border-0">
        {baris.length === 0 ? (
          <p className="text-muted px-5 py-16 text-center text-sm">
            Belum ada data absensi pada periode ini.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-app text-subtle border-b text-left text-[11px] font-bold tracking-wide uppercase">
                  <th className="px-5 py-2.5">Karyawan</th>
                  <th className="px-2 py-2.5 text-center">Hadir</th>
                  <th className="px-2 py-2.5 text-center">Tepat</th>
                  <th className="px-2 py-2.5 text-center">Telat</th>
                  <th className="px-2 py-2.5 text-right">Total telat</th>
                  <th className="px-2 py-2.5 text-right">Lembur</th>
                  <th className="px-2 py-2.5 text-center">Cuti</th>
                  <th className="px-2 py-2.5 text-center">Alpa</th>
                  <th className="px-2 py-2.5 text-right">Jam kerja</th>
                  <th className="px-5 py-2.5 text-right">Fee</th>
                </tr>
              </thead>
              <tbody>
                {baris.map((b) => (
                  <tr
                    key={b.employeeId}
                    className="border-app hover:bg-surface-muted border-b transition-colors last:border-0"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/absensi/${b.employeeId}?bulan=${tahun}-${String(bulan).padStart(2, "0")}`}
                        className="text-body hover:text-brand-700 dark:hover:text-brand-300 font-semibold"
                      >
                        {b.nama}
                      </Link>
                      <p className="text-subtle text-xs">
                        {b.jabatan ?? "—"}
                        {b.departemen ? ` · ${b.departemen}` : ""}
                      </p>
                    </td>
                    <td className="text-body tnum px-2 py-3 text-center font-semibold">
                      {b.hadir}
                    </td>
                    <td className="text-muted tnum px-2 py-3 text-center">
                      {b.tepatWaktu}
                    </td>
                    <td
                      className={cn(
                        "tnum px-2 py-3 text-center font-semibold",
                        b.terlambat > 0 ? "text-status-late" : "text-muted",
                      )}
                    >
                      {b.terlambat}
                    </td>
                    <td className="text-muted tnum px-2 py-3 text-right">
                      {b.menitTerlambat > 0 ? formatDurasi(b.menitTerlambat) : "—"}
                    </td>
                    <td className="text-muted tnum px-2 py-3 text-right">
                      {b.menitLembur > 0 ? formatDurasi(b.menitLembur) : "—"}
                    </td>
                    <td className="text-muted tnum px-2 py-3 text-center">{b.cuti}</td>
                    <td
                      className={cn(
                        "tnum px-2 py-3 text-center font-semibold",
                        b.alpa > 0 ? "text-status-absent" : "text-muted",
                      )}
                    >
                      {b.alpa}
                    </td>
                    <td className="text-body tnum px-2 py-3 text-right">
                      {formatDurasi(b.menitKerja)}
                    </td>
                    <td className="text-body tnum px-5 py-3 text-right font-semibold">
                      {b.totalFee > 0 ? formatRupiah(b.totalFee) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-surface-muted text-body border-app border-t-2 font-extrabold">
                  <td className="px-5 py-3">TOTAL</td>
                  <td className="tnum px-2 py-3 text-center">{total.hadir}</td>
                  <td />
                  <td className="tnum px-2 py-3 text-center">{total.terlambat}</td>
                  <td className="tnum px-2 py-3 text-right">
                    {formatDurasi(total.menitTerlambat)}
                  </td>
                  <td className="tnum px-2 py-3 text-right">
                    {formatDurasi(total.menitLembur)}
                  </td>
                  <td className="tnum px-2 py-3 text-center">{total.cuti}</td>
                  <td className="tnum px-2 py-3 text-center">{total.alpa}</td>
                  <td className="tnum px-2 py-3 text-right">
                    {formatDurasi(total.menitKerja)}
                  </td>
                  <td className="tnum px-5 py-3 text-right">
                    {formatRupiah(total.totalFee)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="text-subtle text-xs print:mt-4">
        Klik nama karyawan untuk melihat rincian harian beserta foto absensinya.
      </p>
    </div>
  );
}
