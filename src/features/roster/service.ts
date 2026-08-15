import "server-only";

import { and, asc, eq, gte, lte } from "drizzle-orm";

import { getDb } from "@/db/client";
import { employees, positions, shiftSchedules, shifts, users } from "@/db/schema";
import { batasBulan } from "@/lib/waktu";

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
