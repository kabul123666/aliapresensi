"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db/client";
import {
  attendances,
  auditLogs,
  notifications,
  employees,
  workLogItems,
} from "@/db/schema";
import { PERAN_PENYETUJU, wajibPeran } from "@/lib/auth/session";

export type HasilVerifikasi = { ok: boolean; pesan: string };

const skema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
  catatan: z.string().trim().max(300).optional(),
});

/**
 * Memverifikasi atau menolak tindakan yang dicatat karyawan.
 *
 * Nominal tidak pernah diubah di sini — fee sudah dibekukan saat pencatatan.
 * Verifikasi hanya menyatakan bahwa tindakan itu benar terjadi.
 */
async function putuskanTindakan(
  ids: string[],
  verifikasi: boolean,
  catatan?: string,
): Promise<HasilVerifikasi> {
  const pengguna = await wajibPeran(...PERAN_PENYETUJU);
  const parsed = skema.safeParse({ ids, catatan });
  if (!parsed.success) return { ok: false, pesan: "Data tindakan tidak valid." };

  const db = await getDb();

  const sasaran = await db
    .select({
      id: workLogItems.id,
      status: workLogItems.status,
      nama: workLogItems.namaTindakan,
      employeeId: attendances.employeeId,
    })
    .from(workLogItems)
    .innerJoin(attendances, eq(attendances.id, workLogItems.attendanceId))
    .where(inArray(workLogItems.id, parsed.data.ids));

  const bisaDiproses = sasaran.filter((s) => s.status === "SUBMITTED");
  if (bisaDiproses.length === 0) {
    return {
      ok: false,
      pesan: "Tidak ada tindakan berstatus menunggu pada pilihan ini.",
    };
  }

  await db
    .update(workLogItems)
    .set({
      status: verifikasi ? "VERIFIED" : "REJECTED",
      verifiedBy: pengguna.userId,
      verifiedAt: new Date(),
      catatan: catatan ?? undefined,
    })
    .where(
      inArray(
        workLogItems.id,
        bisaDiproses.map((s) => s.id),
      ),
    );

  // Beri tahu tiap karyawan sekali saja, bukan sekali per tindakan.
  const perKaryawan = new Map<string, number>();
  for (const s of bisaDiproses) {
    perKaryawan.set(s.employeeId, (perKaryawan.get(s.employeeId) ?? 0) + 1);
  }

  for (const [employeeId, jumlah] of perKaryawan) {
    const [k] = await db
      .select({ userId: employees.userId })
      .from(employees)
      .where(eq(employees.id, employeeId))
      .limit(1);
    if (!k) continue;

    await db.insert(notifications).values({
      userId: k.userId,
      tipe: "TINDAKAN",
      judul: verifikasi
        ? `${jumlah} tindakan Anda terverifikasi`
        : `${jumlah} tindakan Anda ditolak`,
      isi: catatan ?? null,
      link: "/fee",
    });
  }

  const h = await headers();
  await db.insert(auditLogs).values({
    actorId: pengguna.userId,
    aksi: verifikasi ? "VERIFIKASI_TINDAKAN" : "TOLAK_TINDAKAN",
    entitas: "work_log_items",
    entitasId: bisaDiproses[0].id,
    after: { jumlah: bisaDiproses.length, catatan: catatan ?? null },
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  });

  revalidatePath("/admin/tindakan");
  revalidatePath("/fee");

  return {
    ok: true,
    pesan: `${bisaDiproses.length} tindakan ${verifikasi ? "diverifikasi" : "ditolak"}.`,
  };
}

export async function aksiVerifikasiTindakan(ids: string[]) {
  return putuskanTindakan(ids, true);
}

export async function aksiTolakTindakan(ids: string[], catatan: string) {
  if (catatan.trim().length < 5) {
    return { ok: false, pesan: "Alasan penolakan wajib diisi, minimal 5 karakter." };
  }
  return putuskanTindakan(ids, false, catatan.trim());
}
