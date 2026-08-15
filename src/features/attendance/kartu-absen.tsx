"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useJamDetik } from "@/lib/gunakan-jam";
import { cn } from "@/lib/utils";
import { PanelAbsen, type Tindakan } from "./panel-absen";

type Props = {
  sudahMasuk: boolean;
  sudahPulang: boolean;
  jamMasukTercatat: string | null;
  jamPulangTercatat: string | null;
  jadwal: { nama: string; jamMasuk: string; jamPulang: string } | null;
  lokasi: { nama: string; lat: number; lng: number; radiusM: number } | null;
  isiFormTindakan: boolean;
  daftarTindakan: Tindakan[];
};

export function KartuAbsen({
  sudahMasuk,
  sudahPulang,
  jamMasukTercatat,
  jamPulangTercatat,
  jadwal,
  lokasi,
  isiFormTindakan,
  daftarTindakan,
}: Props) {
  const router = useRouter();
  const [panelTerbuka, setPanelTerbuka] = useState(false);

  // Jam dibaca dari sumber waktu bersama; nilainya baru terisi setelah
  // hidrasi sehingga render server dan klien tetap cocok.
  const jam = useJamDetik();

  const mode = sudahMasuk ? "pulang" : "masuk";
  const selesai = sudahMasuk && sudahPulang;

  return (
    <>
      <div className="px-5">
        <div className="bg-surface border-app relative rounded-[var(--radius-card)] border p-6">
          <div className="relative text-center">
            <p className="eyebrow">Waktu sekarang · WIB</p>
            <p className="tnum text-body mt-2 text-[44px] leading-none font-medium">
              {jam}
            </p>
            {jadwal ? (
              <p className="text-muted mt-2 text-sm">
                Shift <span className="text-body font-bold">{jadwal.nama}</span> ·{" "}
                {jadwal.jamMasuk.slice(0, 5)}–{jadwal.jamPulang.slice(0, 5)}
              </p>
            ) : (
              <p className="text-warn-600 dark:text-warn-500 mt-2 text-sm font-semibold">
                Shift belum diatur — hubungi HRD
              </p>
            )}
          </div>

          {/* Tombol utama */}
          <div className="relative mt-7 flex justify-center">
            {selesai ? (
              <div className="bg-surface-muted grid size-44 place-items-center rounded-full">
                <div className="text-center">
                  <p className="text-body text-base font-extrabold">Absen selesai</p>
                  <p className="text-muted mt-1 text-sm">Sampai jumpa besok</p>
                </div>
              </div>
            ) : (
              /* Satu piringan pekat, tanpa gradien maupun cahaya berdenyut —
                 tombol ini sudah jadi elemen terbesar di layar, tidak perlu
                 efek tambahan untuk menarik perhatian. */
              <button
                onClick={() => setPanelTerbuka(true)}
                disabled={!jadwal}
                className={cn(
                  "grid size-40 place-items-center rounded-full transition-colors",
                  "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45",
                  mode === "masuk"
                    ? "bg-brand-600 hover:bg-brand-700"
                    : "bg-warn-600 hover:bg-warn-700",
                )}
              >
                <span className="flex flex-col items-center gap-1">
                  <span className="text-[19px] font-semibold text-white">
                    {mode === "masuk" ? "Masuk" : "Pulang"}
                  </span>
                  <span className="text-[11px] text-white/75">
                    {mode === "masuk" ? "Mulai absen" : "Akhiri hari"}
                  </span>
                </span>
              </button>
            )}
          </div>

          {/* Ringkasan jam hari ini */}
          <div className="border-app relative mt-7 grid grid-cols-2 gap-3 border-t pt-5">
            {[
              { label: "Masuk", nilai: jamMasukTercatat, warna: "text-status-ontime" },
              { label: "Pulang", nilai: jamPulangTercatat, warna: "text-status-late" },
            ].map((k) => (
              <div key={k.label} className="text-center">
                <p className="text-subtle text-xs font-semibold">{k.label}</p>
                <p
                  className={cn(
                    "tnum mt-1 text-xl font-extrabold",
                    k.nilai ? k.warna : "text-subtle",
                  )}
                >
                  {k.nilai ?? "--:--"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {panelTerbuka && (
        <PanelAbsen
          mode={mode}
          lokasi={lokasi}
          isiFormTindakan={isiFormTindakan}
          daftarTindakan={daftarTindakan}
          onTutup={() => setPanelTerbuka(false)}
          onBerhasil={() => {
            setPanelTerbuka(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
