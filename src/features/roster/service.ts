import "server-only";

import { and, asc, eq, gte, lte } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  employees,
  holidays,
  positions,
  shiftSchedules,
  shifts,
  users,
} from "@/db/schema";
import { batasBulan, hariPekanWIB, rentangTanggal } from "@/lib/waktu";

/**
 * Jadwal jaga bulanan.
 *
 * Shift default di data karyawan hanya berlaku bila tanggal itu tidak punya
 * jadwal khusus. Roster inilah yang menimpanya — dan perhitungan status
 * kehadiran (terlambat, pulang cepat, lembur) selalu mengacu ke shift yang
 * berlaku pada tanggal tersebut.
 */

export type KaryawanRoster = {
  id: string;
  nama: string;
  jabatan: string | null;
  shiftDefaultId: string | null;
};

export type ShiftRoster = {
  id: string;
  nama: string;
  jamMasuk: string;
  jamPulang: string;
  warna: string;
};

/** Karyawan aktif yang perlu dijadwalkan. Admin sendiri ikut bila ia bertugas. */
export async function karyawanRoster(): Promise<KaryawanRoster[]> {
  const db = await getDb();
  return db
    .select({
      id: employees.id,
      nama: employees.nama,
      jabatan: positions.nama,
      shiftDefaultId: employees.shiftId,
    })
    .from(employees)
    .innerJoin(users, eq(users.id, employees.userId))
    .leftJoin(positions, eq(positions.id, employees.positionId))
    .where(and(eq(employees.aktif, true), eq(users.status, "ACTIVE")))
    .orderBy(asc(employees.nama));
}

export async function shiftRoster(): Promise<ShiftRoster[]> {
  const db = await getDb();
  return db
    .select({
      id: shifts.id,
      nama: shifts.nama,
      jamMasuk: shifts.jamMasuk,
      jamPulang: shifts.jamPulang,
      warna: shifts.warna,
    })
    .from(shifts)
    .where(eq(shifts.aktif, true))
    .orderBy(asc(shifts.jamMasuk));
}

/** Isi roster satu bulan, dikunci per "employeeId|tanggal". */
export async function jadwalBulan(tahun: number, bulan: number) {
  const db = await getDb();
  const { mulai, akhir } = batasBulan(tahun, bulan);

  const baris = await db
    .select({
      employeeId: shiftSchedules.employeeId,
      tanggal: shiftSchedules.tanggal,
      shiftId: shiftSchedules.shiftId,
      libur: shiftSchedules.libur,
    })
    .from(shiftSchedules)
    .where(and(gte(shiftSchedules.tanggal, mulai), lte(shiftSchedules.tanggal, akhir)));

  const peta: Record<string, { shiftId: string | null; libur: boolean }> = {};
  for (const b of baris) {
    peta[`${b.employeeId}|${b.tanggal}`] = { shiftId: b.shiftId, libur: b.libur };
  }
  return peta;
}

/** Berapa hari kerja yang sudah terisi per karyawan, untuk kolom ringkasan. */
export function hitungBebanJaga(
  peta: Record<string, { shiftId: string | null; libur: boolean }>,
  employeeId: string,
) {
  let jaga = 0;
  let libur = 0;
  for (const [kunci, nilai] of Object.entries(peta)) {
    if (!kunci.startsWith(`${employeeId}|`)) continue;
    if (nilai.libur) libur++;
    else if (nilai.shiftId) jaga++;
  }
  return { jaga, libur };
}

/* ==========================================================================
 * Jadwal milik satu karyawan
 * ========================================================================== */

export type HariJaga = {
  tanggal: string;
  /** Shift yang berlaku hari itu; null berarti tidak dijadwalkan. */
  shift: ShiftRoster | null;
  libur: boolean;
  /** Alasan hari itu kosong: libur nasional, libur terjadwal, atau di luar hari kerja shift. */
  keterangan: string | null;
  /** Sumber jadwal, supaya karyawan tahu mana yang khusus dan mana yang pola tetap. */
  sumber: "ROSTER" | "SHIFT_DEFAULT" | "TIDAK_ADA";
};

/**
 * Jadwal jaga satu karyawan untuk sebulan penuh.
 *
 * Menghitungnya di sini, bukan dengan memanggil shiftBerlaku() tiga puluh
 * kali, supaya satu bulan cukup memakai tiga kueri. Urutan prioritasnya
 * tetap sama persis dengan yang dipakai saat menilai absensi: roster per
 * tanggal menimpa shift default, dan libur nasional menimpa keduanya.
 */
export async function jadwalKaryawan(
  employeeId: string,
  tahun: number,
  bulan: number,
): Promise<HariJaga[]> {
  const db = await getDb();
  const { mulai, akhir } = batasBulan(tahun, bulan);

  const [karyawan] = await db
    .select({ shiftDefaultId: employees.shiftId })
    .from(employees)
    .where(eq(employees.id, employeeId))
    .limit(1);

  const [roster, liburNasional, semuaShift] = await Promise.all([
    db
      .select({
        tanggal: shiftSchedules.tanggal,
        shiftId: shiftSchedules.shiftId,
        libur: shiftSchedules.libur,
      })
      .from(shiftSchedules)
      .where(
        and(
          eq(shiftSchedules.employeeId, employeeId),
          gte(shiftSchedules.tanggal, mulai),
          lte(shiftSchedules.tanggal, akhir),
        ),
      ),

    db
      .select({ tanggal: holidays.tanggal, nama: holidays.nama })
      .from(holidays)
      .where(and(gte(holidays.tanggal, mulai), lte(holidays.tanggal, akhir))),

    db
      .select({
        id: shifts.id,
        nama: shifts.nama,
        jamMasuk: shifts.jamMasuk,
        jamPulang: shifts.jamPulang,
        warna: shifts.warna,
        hariKerja: shifts.hariKerja,
      })
      .from(shifts),
  ]);

  const petaShift = new Map(semuaShift.map((s) => [s.id, s]));
  const petaRoster = new Map(roster.map((r) => [r.tanggal, r]));
  const petaLibur = new Map(liburNasional.map((h) => [h.tanggal, h.nama]));

  const bentuk = (s: (typeof semuaShift)[number]): ShiftRoster => ({
    id: s.id,
    nama: s.nama,
    jamMasuk: s.jamMasuk,
    jamPulang: s.jamPulang,
    warna: s.warna,
  });

  return rentangTanggal(mulai, akhir).map<HariJaga>((tanggal) => {
    const namaLibur = petaLibur.get(tanggal) ?? null;
    const khusus = petaRoster.get(tanggal);

    if (khusus?.libur) {
      return {
        tanggal,
        shift: null,
        libur: true,
        keterangan: namaLibur ?? "Libur terjadwal",
        sumber: "ROSTER",
      };
    }

    const shiftId = khusus?.shiftId ?? karyawan?.shiftDefaultId ?? null;
    const shift = shiftId ? petaShift.get(shiftId) : undefined;

    if (!shift) {
      return {
        tanggal,
        shift: null,
        libur: Boolean(namaLibur),
        keterangan: namaLibur,
        sumber: "TIDAK_ADA",
      };
    }

    const sumber = khusus?.shiftId ? "ROSTER" : "SHIFT_DEFAULT";

    if (namaLibur) {
      return {
        tanggal,
        shift: bentuk(shift),
        libur: true,
        keterangan: namaLibur,
        sumber,
      };
    }

    // Shift default hanya berlaku pada hari kerjanya; jadwal khusus dari
    // roster selalu menang karena admin memang menuliskannya untuk tanggal itu.
    if (sumber === "SHIFT_DEFAULT") {
      const dow = hariPekanWIB(new Date(`${tanggal}T05:00:00Z`));
      if (!shift.hariKerja.includes(dow)) {
        return {
          tanggal,
          shift: null,
          libur: true,
          keterangan: "Bukan hari kerja",
          sumber,
        };
      }
    }

    return { tanggal, shift: bentuk(shift), libur: false, keterangan: null, sumber };
  });
}
