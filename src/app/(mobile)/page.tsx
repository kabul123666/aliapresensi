import Link from "next/link";
import { desc, eq, isNotNull } from "drizzle-orm";
import { Bell, ChevronRight, Megaphone } from "lucide-react";

import { BadgeAbsen } from "@/components/ui/status";
import { getDb } from "@/db/client";
import { announcements, employees, locations, procedureCatalog } from "@/db/schema";
import { IconFee } from "@/components/icons3d";
import { MenuUtama } from "@/components/mobile/menu-aplikasi";
import { KartuAbsen } from "@/features/attendance/kartu-absen";
import {
  absensiAktif,
  ringkasanBulan,
  shiftBerlaku,
} from "@/features/attendance/service";
import { jumlahBelumDibaca } from "@/features/notifications/service";
import { bacaPengaturan } from "@/features/settings/service";
import { wajibMasuk } from "@/lib/auth/session";
import { formatDurasi, formatRupiah } from "@/lib/utils";
import { jamWIB, namaBulan, tanggalPanjang, tanggalWIB } from "@/lib/waktu";

function salam() {
  const jam = Number(
    new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      hour: "2-digit",
      hour12: false,
    }).format(new Date()),
  );
  if (jam < 11) return "Selamat pagi";
  if (jam < 15) return "Selamat siang";
  if (jam < 18) return "Selamat sore";
  return "Selamat malam";
}

export default async function BerandaKaryawan() {
  const pengguna = await wajibMasuk();
  const db = await getDb();

  const hariIni = tanggalWIB();
  const [tahun, bulan] = hariIni.split("-").map(Number);

  const [absen, jadwal, ringkas, kebijakan] = await Promise.all([
    absensiAktif(pengguna.employeeId),
    shiftBerlaku(pengguna.employeeId, hariIni),
    ringkasanBulan(pengguna.employeeId, tahun, bulan),
    bacaPengaturan("kebijakan_absensi"),
  ]);

  const [karyawan] = await db
    .select({ menuBeranda: employees.menuBeranda })
    .from(employees)
    .where(eq(employees.id, pengguna.employeeId))
    .limit(1);

  const [lokasi] = pengguna.locationId
    ? await db
        .select()
        .from(locations)
        .where(eq(locations.id, pengguna.locationId))
        .limit(1)
    : [];

  const daftarTindakan = pengguna.isiFormTindakan
    ? await db
        .select({
          id: procedureCatalog.id,
          nama: procedureCatalog.nama,
          kategori: procedureCatalog.kategori,
          fee: procedureCatalog.feeDefault,
        })
        .from(procedureCatalog)
        .where(eq(procedureCatalog.aktif, true))
    : [];

  const belumDibaca = await jumlahBelumDibaca(pengguna.userId);

  const [pengumuman] = await db
    .select()
    .from(announcements)
    .where(isNotNull(announcements.publishedAt))
    .orderBy(desc(announcements.publishedAt))
    .limit(1);

  const absenHariIni =
    absen?.tanggal === hariIni ? absen : absen?.clockOutAt ? null : absen;
  const sudahMasuk = Boolean(absenHariIni?.clockInAt);
  const sudahPulang = Boolean(absenHariIni?.clockOutAt);

  return (
    <div className="pb-6">
      {/* ------------------------------------------------------- Kepala */}
      <header className="bg-surface border-app pt-safe border-b px-5 pb-16">
        <div className="flex items-center justify-between pt-4">
          <div className="min-w-0">
            <p className="text-muted text-[13px] font-medium">{salam()},</p>
            <h1 className="text-body truncate text-[19px] leading-tight font-extrabold">
              {pengguna.nama}
            </h1>
            <p className="text-subtle mt-0.5 truncate text-xs">
              {pengguna.namaJabatan ?? "Karyawan"}
              {pengguna.namaLokasi ? ` · ${pengguna.namaLokasi}` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/notifikasi"
              className="text-muted hover:text-body relative grid size-11 place-items-center rounded-full transition-colors"
              aria-label={
                belumDibaca > 0 ? `Notifikasi, ${belumDibaca} belum dibaca` : "Notifikasi"
              }
            >
              <Bell size={20} />
              {belumDibaca > 0 && (
                <span className="bg-danger-500 tnum absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full px-1 text-[10px] leading-4 font-semibold text-white">
                  {belumDibaca > 9 ? "9+" : belumDibaca}
                </span>
              )}
            </Link>

            <Link
              href="/profil"
              className="bg-brand-600 grid size-10 place-items-center rounded-full text-sm font-semibold text-white"
              aria-label="Profil"
            >
              {pengguna.nama.slice(0, 1).toUpperCase()}
            </Link>
          </div>
        </div>
        <p className="text-subtle mt-3 text-xs">{tanggalPanjang(hariIni)}</p>
      </header>

      {/* -------------------------------------------------- Kartu absen */}
      <div className="-mt-12">
        <KartuAbsen
          sudahMasuk={sudahMasuk}
          sudahPulang={sudahPulang}
          jamMasukTercatat={
            absenHariIni?.clockInAt ? jamWIB(absenHariIni.clockInAt) : null
          }
          jamPulangTercatat={
            absenHariIni?.clockOutAt ? jamWIB(absenHariIni.clockOutAt) : null
          }
          jadwal={
            jadwal.shift
              ? {
                  nama: jadwal.shift.nama,
                  jamMasuk: jadwal.shift.jamMasuk,
                  jamPulang: jadwal.shift.jamPulang,
                }
              : null
          }
          lokasi={
            lokasi
              ? {
                  nama: lokasi.nama,
                  lat: lokasi.lat,
                  lng: lokasi.lng,
                  radiusM: lokasi.radiusM,
                }
              : null
          }
          bolehTanpaShift={kebijakan.izinkanAbsenTanpaShift}
          isiFormTindakan={pengguna.isiFormTindakan}
          daftarTindakan={daftarTindakan}
        />
      </div>

      {/* Status hari ini */}
      {absenHariIni && (
        <div className="mt-4 px-5">
          <div className="bg-surface border-app flex items-center justify-between rounded-[var(--radius-card)] border px-4 py-3">
            <span className="text-muted text-sm font-semibold">Status hari ini</span>
            <BadgeAbsen status={absenHariIni.status} />
          </div>
        </div>
      )}

      <MenuUtama pilihan={karyawan?.menuBeranda} />

      {/* ---------------------------------------------------- Ringkasan */}
      <section className="mt-6 px-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-body text-sm font-extrabold tracking-tight">
            Rekap {namaBulan(tahun, bulan)}
          </h2>
          <Link
            href="/riwayat"
            className="text-brand-700 dark:text-brand-300 inline-flex items-center text-xs font-semibold"
          >
            Lihat semua <ChevronRight size={14} />
          </Link>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {[
            {
              label: "Hari hadir",
              nilai: String(ringkas.hadir),
              satuan: "hari",
              warna: "text-status-ontime",
            },
            {
              label: "Terlambat",
              nilai: String(ringkas.terlambat),
              satuan: `kali · ${formatDurasi(ringkas.totalMenitTerlambat)}`,
              warna: "text-status-late",
            },
            {
              label: "Total lembur",
              nilai: formatDurasi(ringkas.totalMenitLembur),
              satuan: "bulan ini",
              warna: "text-status-overtime",
            },
            {
              label: "Jam kerja",
              nilai: formatDurasi(ringkas.totalMenitKerja),
              satuan: "terakumulasi",
              warna: "text-body",
            },
          ].map((k) => (
            <div
              key={k.label}
              className="bg-surface border-app rounded-[var(--radius-card)] border px-4 py-3.5"
            >
              <p className="text-subtle text-xs font-semibold">{k.label}</p>
              <p className={`tnum mt-1 text-xl font-extrabold ${k.warna}`}>{k.nilai}</p>
              <p className="text-subtle mt-0.5 text-[11px]">{k.satuan}</p>
            </div>
          ))}
        </div>

        {pengguna.isiFormTindakan && (
          <Link
            href="/fee"
            className="from-brand-600 to-brand-800 mt-2.5 flex items-center justify-between rounded-[var(--radius-card)] bg-gradient-to-br px-4 py-4 shadow-[var(--shadow-brand)]"
          >
            <div>
              <p className="text-muted text-xs font-semibold">
                Estimasi fee tindakan bulan ini
              </p>
              <p className="tnum text-body mt-1 text-2xl font-extrabold">
                {formatRupiah(ringkas.totalFee)}
              </p>
              <p className="text-subtle mt-0.5 text-[11px]">
                {ringkas.jumlahTindakan} tindakan ·{" "}
                {formatRupiah(ringkas.feeTerverifikasi)} terverifikasi
              </p>
            </div>
            <IconFee size={52} />
          </Link>
        )}
      </section>

      {/* --------------------------------------------------- Pengumuman */}
      {pengumuman && (
        <section className="mt-6 px-5">
          <div className="border-app bg-surface rounded-[var(--radius-card)] border p-4">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-brand-600 dark:text-brand-400" />
              <h2 className="text-body text-sm font-extrabold">Pengumuman</h2>
            </div>
            <p className="text-body mt-2.5 text-sm font-bold">{pengumuman.judul}</p>
            <p className="text-muted mt-1 text-[13px] leading-relaxed">
              {pengumuman.isi}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
