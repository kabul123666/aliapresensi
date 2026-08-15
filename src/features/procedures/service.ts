import "server-only";

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  attendances,
  employees,
  positions,
  procedureCatalog,
  workLogItems,
  type WorklogStatus,
} from "@/db/schema";
import { batasBulan } from "@/lib/waktu";

export type FilterTindakan = {
  tahun: number;
  bulan: number;
  status?: WorklogStatus | "SEMUA";
};

/** Daftar tindakan yang dicatat karyawan pada satu periode. */
export async function daftarTindakanTercatat(filter: FilterTindakan) {
  const db = await getDb();
  const { mulai, akhir } = batasBulan(filter.tahun, filter.bulan);

  const syarat = [gte(attendances.tanggal, mulai), lte(attendances.tanggal, akhir)];
  if (filter.status && filter.status !== "SEMUA") {
    syarat.push(eq(workLogItems.status, filter.status));
  }

  return db
    .select({
      id: workLogItems.id,
      namaTindakan: workLogItems.namaTindakan,
      jumlah: workLogItems.jumlah,
      feeSnapshot: workLogItems.feeSnapshot,
      kodePasien: workLogItems.kodePasien,
      catatan: workLogItems.catatan,
      status: workLogItems.status,
      tanggal: attendances.tanggal,
      employeeId: attendances.employeeId,
      nama: employees.nama,
      jabatan: positions.nama,
      kategori: procedureCatalog.kategori,
    })
    .from(workLogItems)
    .innerJoin(attendances, eq(attendances.id, workLogItems.attendanceId))
    .innerJoin(employees, eq(employees.id, attendances.employeeId))
    .leftJoin(positions, eq(positions.id, employees.positionId))
    .leftJoin(procedureCatalog, eq(procedureCatalog.id, workLogItems.procedureId))
    .where(and(...syarat))
    .orderBy(desc(attendances.tanggal))
    .limit(500);
}

/** Rekap fee per karyawan pada satu periode. */
export async function rekapFeePerKaryawan(tahun: number, bulan: number) {
  const db = await getDb();
  const { mulai, akhir } = batasBulan(tahun, bulan);

  const baris = await db
    .select({
      employeeId: attendances.employeeId,
      nama: employees.nama,
      jabatan: positions.nama,
      jumlahTindakan: sql<number>`coalesce(sum(${workLogItems.jumlah}), 0)`,
      totalDiajukan: sql<number>`coalesce(sum(${workLogItems.feeSnapshot} * ${workLogItems.jumlah}), 0)`,
      totalTerverifikasi: sql<number>`coalesce(sum(case when ${workLogItems.status} = 'VERIFIED' then ${workLogItems.feeSnapshot} * ${workLogItems.jumlah} else 0 end), 0)`,
      menunggu: sql<number>`count(*) filter (where ${workLogItems.status} = 'SUBMITTED')`,
    })
    .from(workLogItems)
    .innerJoin(attendances, eq(attendances.id, workLogItems.attendanceId))
    .innerJoin(employees, eq(employees.id, attendances.employeeId))
    .leftJoin(positions, eq(positions.id, employees.positionId))
    .where(and(gte(attendances.tanggal, mulai), lte(attendances.tanggal, akhir)))
    .groupBy(attendances.employeeId, employees.nama, positions.nama)
    .orderBy(
      desc(sql`coalesce(sum(${workLogItems.feeSnapshot} * ${workLogItems.jumlah}), 0)`),
    );

  return baris.map((b) => ({
    employeeId: b.employeeId,
    nama: b.nama,
    jabatan: b.jabatan,
    jumlahTindakan: Number(b.jumlahTindakan),
    totalDiajukan: Number(b.totalDiajukan),
    totalTerverifikasi: Number(b.totalTerverifikasi),
    menunggu: Number(b.menunggu),
  }));
}

/** Rekap per jenis tindakan — memperlihatkan tindakan mana yang paling sering. */
export async function rekapPerJenis(tahun: number, bulan: number) {
  const db = await getDb();
  const { mulai, akhir } = batasBulan(tahun, bulan);

  const baris = await db
    .select({
      nama: workLogItems.namaTindakan,
      kategori: procedureCatalog.kategori,
      jumlah: sql<number>`coalesce(sum(${workLogItems.jumlah}), 0)`,
      total: sql<number>`coalesce(sum(${workLogItems.feeSnapshot} * ${workLogItems.jumlah}), 0)`,
    })
    .from(workLogItems)
    .innerJoin(attendances, eq(attendances.id, workLogItems.attendanceId))
    .leftJoin(procedureCatalog, eq(procedureCatalog.id, workLogItems.procedureId))
    .where(and(gte(attendances.tanggal, mulai), lte(attendances.tanggal, akhir)))
    .groupBy(workLogItems.namaTindakan, procedureCatalog.kategori)
    .orderBy(desc(sql`coalesce(sum(${workLogItems.jumlah}), 0)`));

  return baris.map((b) => ({
    nama: b.nama,
    kategori: b.kategori ?? "—",
    jumlah: Number(b.jumlah),
    total: Number(b.total),
  }));
}

/** Angka ringkas untuk kepala halaman. */
export async function ringkasanTindakan(tahun: number, bulan: number) {
  const db = await getDb();
  const { mulai, akhir } = batasBulan(tahun, bulan);

  const [row] = await db
    .select({
      total: sql<number>`count(*)`,
      menunggu: sql<number>`count(*) filter (where ${workLogItems.status} = 'SUBMITTED')`,
      nilaiTotal: sql<number>`coalesce(sum(${workLogItems.feeSnapshot} * ${workLogItems.jumlah}), 0)`,
      nilaiMenunggu: sql<number>`coalesce(sum(case when ${workLogItems.status} = 'SUBMITTED' then ${workLogItems.feeSnapshot} * ${workLogItems.jumlah} else 0 end), 0)`,
    })
    .from(workLogItems)
    .innerJoin(attendances, eq(attendances.id, workLogItems.attendanceId))
    .where(and(gte(attendances.tanggal, mulai), lte(attendances.tanggal, akhir)));

  return {
    total: Number(row?.total ?? 0),
    menunggu: Number(row?.menunggu ?? 0),
    nilaiTotal: Number(row?.nilaiTotal ?? 0),
    nilaiMenunggu: Number(row?.nilaiMenunggu ?? 0),
  };
}
