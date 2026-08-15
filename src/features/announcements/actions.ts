"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db/client";
import { announcements, auditLogs, employees, users } from "@/db/schema";
import { PERAN_ADMIN, wajibPeran } from "@/lib/auth/session";

export type HasilPengumuman = { ok: boolean; pesan: string };

async function catat(
  actorId: string,
  aksi: string,
  entitasId: string,
  after?: Record<string, unknown>,
) {
  const db = await getDb();
  const h = await headers();
  await db.insert(auditLogs).values({
    actorId,
    aksi,
    entitas: "announcements",
    entitasId,
    after: after ?? null,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  });
}

function segarkan() {
  revalidatePath("/admin/pengumuman");
  revalidatePath("/");
}

const skema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  judul: z.string().trim().min(3, "Judul minimal 3 karakter").max(200),
  isi: z.string().trim().min(5, "Isi pengumuman minimal 5 karakter"),
  terbitkan: z.coerce.boolean().optional(),
});

/**
 * Menyimpan pengumuman.
 *
 * Pengumuman yang belum diterbitkan tersimpan sebagai draf dan tidak muncul
 * di beranda karyawan — supaya admin bisa menyiapkan teksnya lebih dulu.
 */
export async function aksiSimpanPengumuman(
  _prev: HasilPengumuman | null,
  formData: FormData,
): Promise<HasilPengumuman> {
  const pengguna = await wajibPeran(...PERAN_ADMIN);
  const mentah = Object.fromEntries(formData);
  const parsed = skema.safeParse({
    ...mentah,
    terbitkan: mentah.terbitkan === "on" || mentah.terbitkan === "true",
  });
  if (!parsed.success) return { ok: false, pesan: parsed.error.issues[0].message };

  const d = parsed.data;
  const db = await getDb();

  const nilai = {
    judul: d.judul,
    isi: d.isi,
    targetRole: ["KARYAWAN", "MANAGER", "ADMIN"],
    dibuatOleh: pengguna.userId,
    publishedAt: d.terbitkan ? new Date() : null,
  };

  if (d.id) {
    await db.update(announcements).set(nilai).where(eq(announcements.id, d.id));
    await catat(pengguna.userId, "UBAH_PENGUMUMAN", d.id, { judul: d.judul });
  } else {
    const [baru] = await db.insert(announcements).values(nilai).returning();
    await catat(pengguna.userId, "TAMBAH_PENGUMUMAN", baru.id, { judul: d.judul });
  }

  segarkan();
  return {
    ok: true,
    pesan: d.terbitkan
      ? "Pengumuman diterbitkan dan langsung tampil di beranda karyawan."
      : "Pengumuman disimpan sebagai draf.",
  };
}

/** Menerbitkan atau menarik kembali sebuah pengumuman. */
export async function aksiUbahTerbit(
  id: string,
  terbitkan: boolean,
): Promise<HasilPengumuman> {
  const pengguna = await wajibPeran(...PERAN_ADMIN);
  const db = await getDb();

  await db
    .update(announcements)
    .set({ publishedAt: terbitkan ? new Date() : null })
    .where(eq(announcements.id, id));

  await catat(pengguna.userId, terbitkan ? "TERBIT_PENGUMUMAN" : "TARIK_PENGUMUMAN", id);
  segarkan();
  return {
    ok: true,
    pesan: terbitkan ? "Pengumuman diterbitkan." : "Pengumuman ditarik dari beranda.",
  };
}

export async function aksiHapusPengumuman(id: string): Promise<HasilPengumuman> {
  const pengguna = await wajibPeran(...PERAN_ADMIN);
  const db = await getDb();
  await db.delete(announcements).where(eq(announcements.id, id));
  await catat(pengguna.userId, "HAPUS_PENGUMUMAN", id);
  segarkan();
  return { ok: true, pesan: "Pengumuman dihapus." };
}

/** Daftar pengumuman untuk panel admin. */
export async function daftarPengumuman() {
  const db = await getDb();
  return db
    .select({
      id: announcements.id,
      judul: announcements.judul,
      isi: announcements.isi,
      publishedAt: announcements.publishedAt,
      createdAt: announcements.createdAt,
      pembuat: employees.nama,
    })
    .from(announcements)
    .leftJoin(users, eq(users.id, announcements.dibuatOleh))
    .leftJoin(employees, eq(employees.userId, users.id))
    .orderBy(desc(announcements.createdAt))
    .limit(50);
}
