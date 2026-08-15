"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Crosshair, Loader2, MapPin, Pencil, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Hint, Input, Label, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/status";
import type { OutsidePolicy } from "@/db/schema";
import { cn } from "@/lib/utils";
import { aksiSimpanLokasi, type HasilMaster } from "./actions";

export type BarisLokasi = {
  id: string;
  nama: string;
  alamat: string | null;
  lat: number;
  lng: number;
  radiusM: number;
  outsidePolicy: OutsidePolicy;
  gpsAccuracyToleranceM: number;
  aktif: boolean;
  jumlahKaryawan: number;
};

const LABEL_KEBIJAKAN: Record<OutsidePolicy, { judul: string; isi: string }> = {
  BLOCK: {
    judul: "Blokir total",
    isi: "Tombol absen mati di luar radius. Paling ketat, tapi karyawan bisa terhambat bila GPS meleset.",
  },
  REQUIRE_REASON: {
    judul: "Wajib alasan + persetujuan",
    isi: "Absen tetap tercatat, ditandai merah, dan masuk antrean persetujuan admin.",
  },
  FLAG_ONLY: {
    judul: "Tandai saja",
    isi: "Tercatat normal dan hanya diberi penanda di rekap. Paling longgar.",
  },
};

/** Peta OpenStreetMap — gratis, tanpa API key. */
function petaUrl(lat: number, lng: number, radiusM: number) {
  // Bentang kotak disesuaikan radius supaya lingkaran area selalu terlihat.
  const delta = Math.max(0.002, radiusM / 60000);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta}%2C${lat - delta / 2}%2C${lng + delta}%2C${lat + delta / 2}&layer=mapnik&marker=${lat}%2C${lng}`;
}

function FormLokasi({
  lokasi,
  onSelesai,
}: {
  lokasi: BarisLokasi | null;
  onSelesai: () => void;
}) {
  const [hasil, kirim, sedang] = useActionState<HasilMaster | null, FormData>(
    aksiSimpanLokasi,
    null,
  );
  const [lat, setLat] = useState(lokasi?.lat ?? -6.2608);
  const [lng, setLng] = useState(lokasi?.lng ?? 106.8127);
  const [radius, setRadius] = useState(lokasi?.radiusM ?? 150);
  const [kebijakan, setKebijakan] = useState<OutsidePolicy>(
    lokasi?.outsidePolicy ?? "REQUIRE_REASON",
  );
  const [ambilLokasi, setAmbilLokasi] = useState(false);

  useEffect(() => {
    if (hasil?.ok) onSelesai();
  }, [hasil, onSelesai]);

  function pakaiLokasiSaya() {
    setAmbilLokasi(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setAmbilLokasi(false);
      },
      () => setAmbilLokasi(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  return (
    <form action={kirim} className="space-y-4">
      {lokasi && <input type="hidden" name="id" value={lokasi.id} />}

      {hasil && !hasil.ok && (
        <div className="bg-danger-50 text-danger-700 dark:bg-danger-500/12 dark:text-danger-100 rounded-[var(--radius-input)] px-4 py-3 text-sm font-medium">
          {hasil.pesan}
        </div>
      )}

      <div>
        <Label htmlFor="nama">Nama lokasi</Label>
        <Input
          id="nama"
          name="nama"
          defaultValue={lokasi?.nama}
          placeholder="Alia Hospital — Pusat"
          required
        />
      </div>

      <div>
        <Label htmlFor="alamat">Alamat</Label>
        <Input id="alamat" name="alamat" defaultValue={lokasi?.alamat ?? ""} />
      </div>

      {/* Peta pratinjau */}
      <div>
        <Label>Titik pusat</Label>
        <div className="border-app mt-1 aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] border">
          <iframe
            title="Peta lokasi kerja"
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer"
            src={petaUrl(lat, lng, radius)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={pakaiLokasiSaya}
          disabled={ambilLokasi}
        >
          {ambilLokasi ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Crosshair size={15} />
          )}
          Pakai lokasi saya sekarang
        </Button>
        <Hint>
          Buka halaman ini dari perangkat yang berada di rumah sakit agar titiknya akurat.
        </Hint>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="0.000001"
            value={lat}
            onChange={(e) => setLat(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="0.000001"
            value={lng}
            onChange={(e) => setLng(Number(e.target.value))}
            required
          />
        </div>
      </div>

      {/* Radius */}
      <div>
        <div className="flex items-baseline justify-between">
          <Label htmlFor="radiusM" className="mb-0">
            Radius area absensi
          </Label>
          <span className="text-brand-700 dark:text-brand-300 tnum text-sm font-extrabold">
            {radius} m
          </span>
        </div>
        <input
          id="radiusM"
          name="radiusM"
          type="range"
          min={20}
          max={1000}
          step={10}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="accent-brand-600 mt-3 w-full"
        />
        <div className="text-subtle mt-1 flex justify-between text-[11px]">
          <span>20 m</span>
          <span>1.000 m</span>
        </div>
      </div>

      {/* Kebijakan luar area */}
      <div>
        <Label htmlFor="outsidePolicy">Bila absen di luar radius</Label>
        <Select
          id="outsidePolicy"
          name="outsidePolicy"
          value={kebijakan}
          onChange={(e) => setKebijakan(e.target.value as OutsidePolicy)}
        >
          {(Object.keys(LABEL_KEBIJAKAN) as OutsidePolicy[]).map((k) => (
            <option key={k} value={k}>
              {LABEL_KEBIJAKAN[k].judul}
            </option>
          ))}
        </Select>
        <p className="text-muted bg-surface-muted mt-2 rounded-lg px-3 py-2 text-[13px] leading-relaxed">
          {LABEL_KEBIJAKAN[kebijakan].isi}
        </p>
      </div>

      <div>
        <Label htmlFor="gpsAccuracyToleranceM">Toleransi akurasi GPS (meter)</Label>
        <Input
          id="gpsAccuracyToleranceM"
          name="gpsAccuracyToleranceM"
          type="number"
          min={0}
          max={300}
          defaultValue={lokasi?.gpsAccuracyToleranceM ?? 50}
          required
        />
        <Hint>
          Jarak dikurangi margin ini sebelum dinilai. Di dalam gedung sinyal GPS sering
          meleset puluhan meter — tanpa toleransi, karyawan yang benar-benar hadir bisa
          terbaca di luar area.
        </Hint>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={sedang}>
        {sedang && <Loader2 size={17} className="animate-spin" />}
        Simpan lokasi
      </Button>
    </form>
  );
}

export function PanelLokasi({ daftar }: { daftar: BarisLokasi[] }) {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [terpilih, setTerpilih] = useState<BarisLokasi | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setTerpilih(null);
            setModal(true);
          }}
        >
          <Plus size={16} /> Tambah lokasi
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {daftar.map((l) => (
          <div
            key={l.id}
            className="bg-surface border-app overflow-hidden rounded-[var(--radius-card)] border"
          >
            <div className="aspect-[16/7]">
              <iframe
                title={`Peta ${l.nama}`}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer"
                src={petaUrl(l.lat, l.lng, l.radiusM)}
              />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-body flex items-center gap-1.5 text-base font-extrabold">
                    <MapPin size={16} className="text-brand-600 shrink-0" />
                    {l.nama}
                  </h3>
                  <p className="text-muted mt-0.5 text-sm">{l.alamat ?? "—"}</p>
                </div>
                <button
                  onClick={() => {
                    setTerpilih(l);
                    setModal(true);
                  }}
                  className="text-muted hover:bg-surface-muted hover:text-body grid size-9 shrink-0 place-items-center rounded-lg transition-colors"
                  aria-label={`Ubah lokasi ${l.nama}`}
                >
                  <Pencil size={16} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="brand">Radius {l.radiusM} m</Badge>
                <Badge
                  tone={
                    l.outsidePolicy === "BLOCK"
                      ? "danger"
                      : l.outsidePolicy === "REQUIRE_REASON"
                        ? "warn"
                        : "netral"
                  }
                >
                  {LABEL_KEBIJAKAN[l.outsidePolicy].judul}
                </Badge>
                <Badge tone="netral">Toleransi GPS ±{l.gpsAccuracyToleranceM} m</Badge>
                <Badge tone="netral">{l.jumlahKaryawan} karyawan</Badge>
              </div>

              <p className="text-subtle tnum mt-3 text-xs">
                {l.lat.toFixed(5)}, {l.lng.toFixed(5)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-5 py-10">
          <button
            className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm"
            onClick={() => setModal(false)}
            aria-label="Tutup"
          />
          <div
            className={cn(
              "bg-surface relative w-full max-w-lg rounded-[var(--radius-sheet)] p-6",
              "shadow-[var(--shadow-float)]",
            )}
          >
            <div className="mb-5 flex items-start justify-between">
              <h2 className="text-body text-lg font-extrabold tracking-tight">
                {terpilih ? `Ubah ${terpilih.nama}` : "Tambah lokasi kerja"}
              </h2>
              <button
                onClick={() => setModal(false)}
                className="text-subtle hover:text-body grid size-9 place-items-center rounded-lg"
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>
            <FormLokasi
              lokasi={terpilih}
              onSelesai={() => {
                setModal(false);
                router.refresh();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
