import "server-only";

import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  attendances,
  employees,
  holidays,
  shiftSchedules,
  shifts,
  workLogItems,
  type AttendanceStatus,
  type Shift,
} from "@/db/schema";
import {
  batasBulan,
  hariPekanWIB,
  jamKeMenit,
  menitHariWIB,
  tanggalWIB,
} from "@/lib/waktu";

/**
 * Aturan main absensi. Semua angka (toleransi, ambang lembur, hari kerja)
 * dibaca dari baris shift — tidak ada satu pun yang ditulis di kode.
 */

export type ShiftBerlaku = {
  shift: Shift | null;
  /** Karyawan memang tidak dijadwalkan bekerja hari itu. */
  libur: boolean;
  alasanLibur: string | null;
};

/**
 * Menentukan shift yang berlaku untuk seorang karyawan pada tanggal tertentu.
 * Urutan prioritas: roster per tanggal → shift default karyawan.
 */
export async function shiftBerlaku(
  employeeId: string,
  tanggal: string,
): Promise<ShiftBerlaku> {
  const db = await getDb();

  const [liburNasional] = await db
    .select({ nama: holidays.nama })
    .from(holidays)
    .where(eq(holidays.tanggal, tanggal))
    .limit(1);

  const [roster] = await db
    .select({ shiftId: shiftSchedules.shiftId, libur: shiftSchedules.libur })
    .from(shiftSchedules)
    .where(
      and(eq(shiftSchedules.employeeId, employeeId), eq(shiftSchedules.tanggal, tanggal)),
    )
    .limit(1);

  if (roster?.libur) {
    return { shift: null, libur: true, alasanLibur: "Libur terjadwal" };
  }

  const shiftId =
    roster?.shiftId ??
    (
      await db
        .select({ shiftId: employees.shiftId })
        .from(employees)
        .where(eq(employees.id, employeeId))
        .limit(1)
    )[0]?.shiftId;

  if (!shiftId) return { shift: null, libur: false, alasanLibur: null };

  const [shift] = await db.select().from(shifts).where(eq(shifts.id, shiftId)).limit(1);
  if (!shift) return { shift: null, libur: false, alasanLibur: null };

  if (liburNasional) {
    return { shift, libur: true, alasanLibur: liburNasional.nama };
  }

  const dow = hariPekanWIB(new Date(`${tanggal}T05:00:00Z`));
  if (!shift.hariKerja.includes(dow)) {
    return { shift, libur: true, alasanLibur: "Bukan hari kerja shift ini" };
  }

  return { shift, libur: false, alasanLibur: null };
}

/** Hasil penilaian saat clock in. */
export function nilaiClockIn(shift: Shift, waktu: Date) {
  const menitSekarang = menitHariWIB(waktu);
  const menitMasuk = jamKeMenit(shift.jamMasuk);

  // Untuk shift lintas hari, absen setelah tengah malam dihitung sebagai
  // kelanjutan hari sebelumnya sehingga tidak terbaca terlambat 20 jam.
  const geser =
    shift.lintasHari && menitSekarang < jamKeMenit(shift.jamPulang) ? 1440 : 0;
  const selisih = menitSekarang + geser - menitMasuk;

  const terlambat = Math.max(0, selisih - shift.toleransiMenit);
  const status: AttendanceStatus = terlambat > 0 ? "LATE" : "ON_TIME";

  return {
    status,
    menitTerlambat: terlambat > 0 ? selisih : 0,
    terlaluDini: selisih < -shift.batasClockinDiniMenit,
    menitTerlaluDini: Math.max(0, -selisih - shift.batasClockinDiniMenit),
  };
}

/** Hasil penilaian saat clock out. */
export function nilaiClockOut(
  shift: Shift,
  clockInAt: Date,
  waktu: Date,
  statusMasuk: AttendanceStatus,
) {
  const menitSekarang = menitHariWIB(waktu);
  const menitPulang = jamKeMenit(shift.jamPulang);
  const geser = shift.lintasHari && menitSekarang <= menitPulang ? 0 : 0;
  const selisih = menitSekarang + geser - menitPulang;

  const durasiKotor = Math.round((waktu.getTime() - clockInAt.getTime()) / 60000);
  const durasiKerjaMenit = Math.max(0, durasiKotor - shift.istirahatMenit);

  const menitLembur = selisih > shift.ambangLemburMenit ? selisih : 0;
  const pulangCepat = selisih < -1;

  let status: AttendanceStatus = statusMasuk;
  if (menitLembur > 0) status = "OVERTIME";
  else if (pulangCepat) status = "EARLY_LEAVE";

  return { status, menitLembur, durasiKerjaMenit, pulangCepat };
}

/** Baris absensi hari ini, plus baris terbuka dari shift malam kemarin. */
export async function absensiAktif(employeeId: string) {
  const db = await getDb();
  const hariIni = tanggalWIB();

  const [terbuka] = await db
    .select()
    .from(attendances)
    .where(and(eq(attendances.employeeId, employeeId), isNull(attendances.clockOutAt)))
    .orderBy(desc(attendances.tanggal))
    .limit(1);

  if (terbuka) return terbuka;

  const [hari] = await db
    .select()
    .from(attendances)
    .where(and(eq(attendances.employeeId, employeeId), eq(attendances.tanggal, hariIni)))
    .limit(1);

  return hari ?? null;
}

/** Ringkasan angka untuk kartu di beranda karyawan. */
export async function ringkasanBulan(employeeId: string, tahun: number, bulan: number) {
  const db = await getDb();
  const { mulai, akhir } = batasBulan(tahun, bulan);

  const [agregat] = await db
    .select({
      hadir: sql<number>`count(*) filter (where ${attendances.clockInAt} is not null)`,
      terlambat: sql<number>`count(*) filter (where ${attendances.menitTerlambat} > 0)`,
      totalMenitTerlambat: sql<number>`coalesce(sum(${attendances.menitTerlambat}), 0)`,
      totalMenitLembur: sql<number>`coalesce(sum(${attendances.menitLembur}), 0)`,
      totalMenitKerja: sql<number>`coalesce(sum(${attendances.durasiKerjaMenit}), 0)`,
    })
    .from(attendances)
    .where(
      and(
        eq(attendances.employeeId, employeeId),
        gte(attendances.tanggal, mulai),
        lte(attendances.tanggal, akhir),
      ),
    );

  const [fee] = await db
    .select({
      jumlahTindakan: sql<number>`coalesce(sum(${workLogItems.jumlah}), 0)`,
      totalFee: sql<number>`coalesce(sum(${workLogItems.feeSnapshot} * ${workLogItems.jumlah}), 0)`,
      terverifikasi: sql<number>`coalesce(sum(case when ${workLogItems.status} = 'VERIFIED' then ${workLogItems.feeSnapshot} * ${workLogItems.jumlah} else 0 end), 0)`,
    })
    .from(workLogItems)
    .innerJoin(attendances, eq(attendances.id, workLogItems.attendanceId))
    .where(
      and(
        eq(attendances.employeeId, employeeId),
        gte(attendances.tanggal, mulai),
        lte(attendances.tanggal, akhir),
      ),
    );

  return {
    hadir: Number(agregat?.hadir ?? 0),
    terlambat: Number(agregat?.terlambat ?? 0),
    totalMenitTerlambat: Number(agregat?.totalMenitTerlambat ?? 0),
    totalMenitLembur: Number(agregat?.totalMenitLembur ?? 0),
    totalMenitKerja: Number(agregat?.totalMenitKerja ?? 0),
    jumlahTindakan: Number(fee?.jumlahTindakan ?? 0),
    totalFee: Number(fee?.totalFee ?? 0),
    feeTerverifikasi: Number(fee?.terverifikasi ?? 0),
  };
}

/** Riwayat absensi satu bulan untuk kalender & daftar. */
export async function riwayatBulan(employeeId: string, tahun: number, bulan: number) {
  const db = await getDb();
  const { mulai, akhir } = batasBulan(tahun, bulan);

  return db
    .select()
    .from(attendances)
    .where(
      and(
        eq(attendances.employeeId, employeeId),
        gte(attendances.tanggal, mulai),
        lte(attendances.tanggal, akhir),
      ),
    )
    .orderBy(desc(attendances.tanggal));
}
