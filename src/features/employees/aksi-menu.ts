"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db/client";
import { employees } from "@/db/schema";
import { wajibMasuk } from "@/lib/auth/session";

const skema = z.array(z.string().trim().max(40)).max(7);

/**
 * Menyimpan menu pilihan karyawan untuk berandanya sendiri.
 *
 * Yang disimpan hanya kunci menu, bukan tautan atau labelnya — supaya
 * memperbaiki tulisan atau memindahkan halaman tidak membatalkan pilihan
 * siapa pun. Daftar kosong berarti kembali ke susunan bawaan.
 */
export async function aksiSimpanMenuBeranda(
  kunci: string[],
): Promise<{ ok: boolean; pesan: string }> {
  const pengguna = await wajibMasuk();

  const parsed = skema.safeParse(kunci);
  if (!parsed.success) {
    return { ok: false, pesan: "Pilih paling banyak 7 menu." };
  }

  const db = await getDb();
  await db
    .update(employees)
    .set({ menuBeranda: parsed.data.length ? parsed.data : null })
    .where(eq(employees.id, pengguna.employeeId));

  revalidatePath("/");
  revalidatePath("/menu/atur");

  return {
    ok: true,
    pesan: parsed.data.length
      ? "Menu beranda disimpan."
      : "Menu beranda dikembalikan ke susunan bawaan.",
  };
}
