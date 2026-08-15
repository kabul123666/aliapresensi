import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { departments, positions } from "@/db/schema";
import { FormDaftar } from "@/features/auth/form-daftar";
import { ambilPengguna, PERAN_ADMIN } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Daftar Akun" };

export default async function HalamanDaftar() {
  const pengguna = await ambilPengguna();
  if (pengguna) redirect(PERAN_ADMIN.includes(pengguna.role) ? "/admin" : "/");

  const db = await getDb();
  const daftarJabatan = await db
    .select({
      id: positions.id,
      nama: positions.nama,
      departemen: departments.nama,
    })
    .from(positions)
    .leftJoin(departments, eq(departments.id, positions.departmentId))
    .where(eq(positions.aktif, true))
    .orderBy(asc(positions.nama));

  return <FormDaftar daftarJabatan={daftarJabatan} />;
}
