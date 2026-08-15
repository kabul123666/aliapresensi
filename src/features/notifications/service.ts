import "server-only";

import { and, desc, eq, isNull, sql } from "drizzle-orm";

import { getDb } from "@/db/client";
import { notifications } from "@/db/schema";

/**
 * Notifikasi dalam aplikasi.
 *
 * Persetujuan, verifikasi tindakan, dan perubahan akun semuanya menulis ke
 * sini. Tanpa layar pembacanya, seluruh pemberitahuan itu tidak pernah sampai
 * ke karyawan — jadi ini bagian wajib dari alur, bukan pelengkap.
 */

export async function daftarNotifikasi(userId: string, batas = 50) {
  const db = await getDb();
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(batas);
}

export async function jumlahBelumDibaca(userId: string) {
  const db = await getDb();
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return Number(row?.n ?? 0);
}
