import type { OutsidePolicy } from "@/db/schema";

/**
 * Perhitungan geofence. Semuanya lokal — tidak memanggil layanan berbayar.
 */

const RADIUS_BUMI_M = 6_371_000;

/** Jarak dua titik koordinat dalam meter (formula Haversine). */
export function jarakMeter(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * RADIUS_BUMI_M * Math.asin(Math.sqrt(a)));
}

export type HasilGeofence = {
  jarakM: number;
  /** Jarak setelah dikurangi margin akurasi GPS — dipakai untuk keputusan. */
  jarakEfektifM: number;
  diLuarArea: boolean;
  /** Apakah absen boleh dilanjutkan sama sekali. */
  diizinkan: boolean;
  /** Apakah pengguna wajib mengisi alasan. */
  butuhAlasan: boolean;
  pesan: string;
};

/**
 * Menerapkan kebijakan geofence milik sebuah lokasi.
 *
 * Akurasi GPS ikut diperhitungkan: di dalam gedung rumah sakit sinyal sering
 * meleset puluhan meter, sehingga jarak dikurangi margin akurasi (dibatasi
 * oleh toleransi yang diatur admin) sebelum dinilai di luar area atau tidak.
 */
export function evaluasiGeofence(params: {
  lat: number;
  lng: number;
  akurasiM: number | null;
  lokasi: {
    nama: string;
    lat: number;
    lng: number;
    radiusM: number;
    outsidePolicy: OutsidePolicy;
    gpsAccuracyToleranceM: number;
  };
}): HasilGeofence {
  const { lat, lng, akurasiM, lokasi } = params;

  const jarakM = jarakMeter(lat, lng, lokasi.lat, lokasi.lng);
  const margin = Math.min(Math.max(akurasiM ?? 0, 0), lokasi.gpsAccuracyToleranceM);
  const jarakEfektifM = Math.max(0, jarakM - margin);
  const diLuarArea = jarakEfektifM > lokasi.radiusM;

  if (!diLuarArea) {
    return {
      jarakM,
      jarakEfektifM,
      diLuarArea: false,
      diizinkan: true,
      butuhAlasan: false,
      pesan: `Berada di area ${lokasi.nama} (${jarakM} m dari titik pusat)`,
    };
  }

  switch (lokasi.outsidePolicy) {
    case "BLOCK":
      return {
        jarakM,
        jarakEfektifM,
        diLuarArea: true,
        diizinkan: false,
        butuhAlasan: false,
        pesan: `Anda berada ${jarakM} m dari ${lokasi.nama}. Absen hanya bisa dilakukan di dalam radius ${lokasi.radiusM} m.`,
      };
    case "REQUIRE_REASON":
      return {
        jarakM,
        jarakEfektifM,
        diLuarArea: true,
        diizinkan: true,
        butuhAlasan: true,
        pesan: `Anda berada ${jarakM} m di luar area. Wajib mengisi alasan dan menunggu persetujuan admin.`,
      };
    case "FLAG_ONLY":
      return {
        jarakM,
        jarakEfektifM,
        diLuarArea: true,
        diizinkan: true,
        butuhAlasan: false,
        pesan: `Tercatat di luar area (${jarakM} m dari ${lokasi.nama}).`,
      };
  }
}

/**
 * Reverse geocoding gratis lewat Nominatim (OpenStreetMap).
 * Kegagalan tidak boleh memblokir absensi — cukup kembalikan null dan
 * biarkan koordinat yang ditampilkan.
 */
const cacheAlamat = new Map<string, string>();

export async function alamatDariKoordinat(
  lat: number,
  lng: number,
): Promise<string | null> {
  // Dibulatkan ~11 m supaya permintaan berulang dari titik yang sama
  // terlayani dari cache dan tidak menabrak rate limit Nominatim.
  const kunci = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const tersimpan = cacheAlamat.get(kunci);
  if (tersimpan) return tersimpan;

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "18");
    url.searchParams.set("accept-language", "id");

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          process.env.NOMINATIM_USER_AGENT ?? "AliaPresensi/1.0 (kontak@example.com)",
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { display_name?: string };
    const alamat = data.display_name?.split(",").slice(0, 4).join(",").trim() ?? null;
    if (alamat) cacheAlamat.set(kunci, alamat);
    return alamat;
  } catch {
    return null;
  }
}
