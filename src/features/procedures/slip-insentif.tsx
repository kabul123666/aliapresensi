import { LambangAplikasi } from "@/components/lambang";
import type { ProfilPerusahaan } from "@/features/settings/service";
import { formatRupiah } from "@/lib/utils";
import { namaBulan, tanggalPendek } from "@/lib/waktu";
import type { SlipInsentif } from "./service";

const LABEL_STATUS: Record<string, string> = {
  DRAFT: "Draf",
  SUBMITTED: "Menunggu verifikasi",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak",
};

/**
 * Slip insentif tindakan, satu karyawan satu bulan.
 *
 * Dipakai apa adanya oleh karyawan (slipnya sendiri) maupun admin (slip siapa
 * pun), sehingga angka yang dilihat keduanya dijamin berasal dari susunan yang
 * sama persis — tidak ada versi karyawan dan versi HRD yang bisa berselisih.
 *
 * Tata letaknya sengaja dibuat untuk kertas: kop, identitas, tabel, lalu blok
 * tanda tangan. Aturan @page di bawah menimpa setelan lanskap milik laporan
 * rekap, karena slip perorangan lebih pas dicetak potret.
 */
export function SlipInsentifCetak({
  slip,
  profil,
  tahun,
  bulan,
}: {
  slip: SlipInsentif;
  profil: ProfilPerusahaan;
  tahun: number;
  bulan: number;
}) {
  const { karyawan, baris } = slip;

  return (
    <>
      <style>{`@media print { @page { size: A4 portrait; margin: 16mm; } }`}</style>

      <article className="bg-surface border-app rounded-[var(--radius-card)] border p-6 print:rounded-none print:border-0 print:p-0">
        {/* Kop */}
        <header className="border-app flex items-start justify-between gap-4 border-b pb-5">
          <div className="flex items-center gap-3">
            <LambangAplikasi className="size-11 print:hidden" />
            <div>
              <p className="text-body text-base font-extrabold tracking-tight">
                {profil.nama}
              </p>
              {profil.alamat ? (
                <p className="text-subtle mt-0.5 text-xs">{profil.alamat}</p>
              ) : null}
              {profil.telepon ? (
                <p className="text-subtle text-xs">Telp. {profil.telepon}</p>
              ) : null}
            </div>
          </div>
          <div className="text-right">
            <p className="eyebrow">Slip Insentif</p>
            <p className="text-body mt-1 text-sm font-bold">{namaBulan(tahun, bulan)}</p>
          </div>
        </header>

        {/* Identitas */}
        <dl className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
          {[
            { k: "Nama", v: karyawan?.nama ?? "—" },
            { k: "NIK", v: karyawan?.nik ?? "—" },
            { k: "Jabatan", v: karyawan?.jabatan ?? "—" },
            { k: "Departemen", v: karyawan?.departemen ?? "—" },
          ].map((b) => (
            <div key={b.k}>
              <dt className="text-subtle text-[11px] font-semibold">{b.k}</dt>
              <dd className="text-body mt-0.5 font-semibold">{b.v}</dd>
            </div>
          ))}
        </dl>

        {/* Rincian */}
        {baris.length === 0 ? (
          <p className="border-app text-muted mt-5 rounded-[var(--radius-input)] border border-dashed px-4 py-8 text-center text-sm">
            Tidak ada tindakan ber-fee yang tercatat pada periode ini.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-app border-b">
                  <th className="text-subtle py-2 text-left text-[11px] font-bold">
                    Tanggal
                  </th>
                  <th className="text-subtle py-2 text-left text-[11px] font-bold">
                    Tindakan
                  </th>
                  <th className="text-subtle py-2 text-right text-[11px] font-bold">
                    Jml
                  </th>
                  <th className="text-subtle py-2 text-right text-[11px] font-bold">
                    Fee satuan
                  </th>
                  <th className="text-subtle py-2 text-right text-[11px] font-bold">
                    Subtotal
                  </th>
                  <th className="text-subtle py-2 text-right text-[11px] font-bold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {baris.map((b) => (
                  <tr key={b.id} className="border-app border-b last:border-0">
                    <td className="tnum text-muted py-2 whitespace-nowrap">
                      {tanggalPendek(b.tanggal)}
                    </td>
                    <td className="text-body py-2">
                      <span className="font-semibold">{b.namaTindakan}</span>
                      {b.kodePasien ? (
                        <span className="text-subtle"> · {b.kodePasien}</span>
                      ) : null}
                    </td>
                    <td className="tnum text-body py-2 text-right">{b.jumlah}</td>
                    <td className="tnum text-muted py-2 text-right whitespace-nowrap">
                      {formatRupiah(b.feeSatuan)}
                    </td>
                    <td className="tnum text-body py-2 text-right font-semibold whitespace-nowrap">
                      {formatRupiah(b.subtotal)}
                    </td>
                    <td className="text-muted py-2 text-right text-xs whitespace-nowrap">
                      {LABEL_STATUS[b.status] ?? b.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ringkasan nominal */}
        <div className="border-app mt-5 border-t pt-4">
          <dl className="ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between gap-6">
              <dt className="text-muted">Menunggu verifikasi</dt>
              <dd className="tnum text-body">{formatRupiah(slip.totalMenunggu)}</dd>
            </div>
            {slip.totalDitolak > 0 && (
              <div className="flex justify-between gap-6">
                <dt className="text-muted">Ditolak</dt>
                <dd className="tnum text-muted line-through">
                  {formatRupiah(slip.totalDitolak)}
                </dd>
              </div>
            )}
            <div className="border-app flex justify-between gap-6 border-t pt-2">
              <dt className="text-body font-bold">Terverifikasi</dt>
              <dd className="tnum text-brand-700 dark:text-brand-300 text-base font-extrabold">
                {formatRupiah(slip.totalTerverifikasi)}
              </dd>
            </div>
          </dl>

          <p className="text-subtle mt-3 text-xs leading-relaxed">
            Yang dibayarkan hanya nominal terverifikasi. Tindakan yang masih menunggu
            verifikasi belum menjadi hak dan dapat berubah setelah ditinjau HRD.
          </p>
        </div>

        {/* Tanda tangan — hanya berguna di atas kertas */}
        <div className="mt-10 hidden grid-cols-2 gap-10 text-sm print:grid">
          {["Karyawan", "HRD"].map((peran) => (
            <div key={peran} className="text-center">
              <p className="text-muted">{peran}</p>
              <div className="border-app mt-16 border-t" />
              <p className="text-muted mt-1 text-xs">
                {peran === "Karyawan" ? (karyawan?.nama ?? "") : ""}
              </p>
            </div>
          ))}
        </div>
      </article>
    </>
  );
}
