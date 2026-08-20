"use client";

import dynamic from "next/dynamic";

const PetaLeaflet = dynamic(() => import("./peta-leaflet").then((m) => m.PetaLeaflet), {
  ssr: false,
  loading: () => (
    <div className="bg-surface-muted text-subtle grid h-52 place-items-center text-xs">
      Memuat peta…
    </div>
  ),
});

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
  posisi,
  pusat,
  jarakM,
  radiusM,
  akurasiM,
  namaLokasi,
  diLuarArea,
}: {
  posisi: { lat: number; lng: number };
  pusat: { lat: number; lng: number };
  jarakM: number;
  radiusM: number;
  akurasiM: number;
  namaLokasi: string;
  diLuarArea: boolean;
}) {
  return (
    <div className="border-app bg-surface overflow-hidden rounded-[var(--radius-card)] border">
      <PetaLeaflet
        posisi={posisi}
        pusat={pusat}
        radiusM={radiusM}
        akurasiM={akurasiM}
        diLuarArea={diLuarArea}
      />

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
