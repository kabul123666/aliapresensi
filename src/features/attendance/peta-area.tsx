"use client";

import { cn } from "@/lib/utils";

/**
 * Gambaran posisi terhadap area absen.
 *
 * Bukan peta jalan: yang perlu dijawab karyawan sebelum menekan tombol absen
 * hanyalah "apakah saya sudah di dalam area, dan kalau belum, kurang berapa
 * meter". Lingkaran berskala menjawab itu dalam sekali lihat, tetap terbaca
 * saat sinyal buruk, dan tidak menuntut memuat ubin peta di depan klinik yang
 * jaringannya sering lambat.
 *
 * Cincin ketelitian digambar apa adanya supaya orang mengerti mengapa
 * sistem kadang ragu: ketika cincin itu jauh lebih besar dari area, yang perlu
 * dilakukan adalah menunggu sebentar, bukan berpindah tempat.
 */
export function PetaArea({
  jarakM,
  radiusM,
  akurasiM,
  namaLokasi,
  diLuarArea,
}: {
  jarakM: number;
  radiusM: number;
  akurasiM: number;
  namaLokasi: string;
  diLuarArea: boolean;
}) {
  // Bidang gambar dibuat cukup lebar untuk memuat area, posisi, dan cincin
  // ketelitian sekaligus, sehingga tidak ada yang terpotong di tepi.
  const jangkauan = Math.max(radiusM * 1.6, jarakM * 1.25, akurasiM * 1.1, 30);
  const skala = 46 / jangkauan; // 46 dari 60 satuan viewBox, sisanya margin

  const rArea = radiusM * skala;
  const rAkurasi = Math.min(akurasiM * skala, 58);
  const dTitik = Math.min(jarakM * skala, 56);

  return (
    <div className="border-app bg-surface overflow-hidden rounded-[var(--radius-card)] border">
      <div className="bg-surface-muted relative grid place-items-center py-4">
        <svg
          viewBox="-60 -60 120 120"
          className="h-40 w-40"
          role="img"
          aria-label={
            diLuarArea
              ? `Di luar area ${namaLokasi}, ${jarakM} meter dari titik pusat`
              : `Berada di dalam area ${namaLokasi}`
          }
        >
          {/* Area yang diizinkan */}
          <circle
            r={rArea}
            className={cn(diLuarArea ? "fill-danger-500/10" : "fill-brand-500/15")}
          />
          <circle
            r={rArea}
            fill="none"
            strokeDasharray="3 3"
            strokeWidth="1.5"
            className={diLuarArea ? "stroke-danger-500/60" : "stroke-brand-500"}
          />

          {/* Titik kantor */}
          <circle r="3" className="fill-brand-700" />

          {/* Cincin ketelitian dan posisi karyawan */}
          <g transform={`translate(0 ${-dTitik})`}>
            <circle
              r={rAkurasi}
              className="fill-sky-500/15 stroke-sky-500/40"
              strokeWidth="1"
            />
            <circle r="4.5" className="fill-sky-500 stroke-white" strokeWidth="2" />
          </g>
        </svg>
      </div>

      <div className="border-app border-t px-4 py-3">
        <p className="text-body text-sm font-bold">
          {diLuarArea ? "Di luar area absen" : "Berada di dalam area absen"}
        </p>
        <p className="text-muted mt-0.5 text-[13px]">
          {namaLokasi} · radius {radiusM} m
        </p>

        <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { k: "Jarak", v: `${jarakM} m` },
            { k: "Batas", v: `${radiusM} m` },
            { k: "Ketelitian", v: `±${Math.round(akurasiM)} m` },
          ].map((b) => (
            <div key={b.k} className="bg-surface-muted rounded-lg py-2">
              <dt className="text-subtle text-[10px] font-semibold">{b.k}</dt>
              <dd className="tnum text-body mt-0.5 text-[13px] font-extrabold">{b.v}</dd>
            </div>
          ))}
        </dl>

        {diLuarArea && (
          <p className="text-muted mt-2.5 text-xs leading-relaxed">
            Mendekat sekitar {Math.max(1, jarakM - radiusM)} m lagi ke {namaLokasi}. Bila
            Anda merasa sudah berada di tempat, tunggu sebentar — titik biru masih menajam
            mengikuti GPS.
          </p>
        )}
      </div>
    </div>
  );
}
