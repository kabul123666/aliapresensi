"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";

import { getDb } from "@/db/client";
import { notifications } from "@/db/schema";
import { wajibMasuk } from "@/lib/auth/session";

export type HasilNotifikasi = { ok: boolean; pesan: string };

/** Menandai satu notifikasi milik sendiri sebagai sudah dibaca. */
export async function aksiTandaiDibaca(id: string): Promise<HasilNotifikasi> {
  const pengguna = await wajibMasuk();
  const db = await getDb();

  // Kepemilikan ikut disaring di query: id saja tidak cukup jadi izin.
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, pengguna.userId)));

  revalidatePath("/notifikasi");
  revalidatePath("/");
  return { ok: true, pesan: "Ditandai sudah dibaca." };
}

export async function aksiTandaiSemuaDibaca(): Promise<HasilNotifikasi> {
  const pengguna = await wajibMasuk();
  const db = await getDb();

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, pengguna.userId), isNull(notifications.readAt)));

  revalidatePath("/notifikasi");
  revalidatePath("/");
  return { ok: true, pesan: "Semua notifikasi ditandai sudah dibaca." };
}
