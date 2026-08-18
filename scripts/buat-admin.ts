import { and, eq } from "drizzle-orm";

import { createDb, schema } from "../src/db/driver";
import { hashPassword } from "../src/lib/auth/password";
import { tanggalWIB } from "../src/lib/waktu";
import { jelaskanGalat, pastikanDatabaseBebas } from "./penjaga-db";

/**
 * Membuat satu akun administrator dan berhenti di situ.
 *
 * Aplikasi sengaja dimulai kosong: tidak ada departemen, jabatan, lokasi,
 * shift, maupun katalog tindakan bawaan. Semuanya diisi sendiri oleh admin
 * lewat antarmuka, karena setiap rumah sakit punya struktur yang berbeda dan
 * data contoh hanya akan menjadi sampah yang harus dibersihkan belakangan.
 */

const USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

async function main() {
  // Di Vercel, aplikasi terbuka untuk umum. Membuat administrator berpassword
  // bawaan di sana sama saja menyerahkan kunci — password bawaannya tertulis
  // di README yang bisa dibaca siapa pun. Karena itu akun hanya dibuat bila
  // ADMIN_PASSWORD memang diisi sendiri lewat Environment Variables.
  if (process.env.VERCEL) {
    if (!process.env.DATABASE_URL) {
      console.log("→ Lewati pembuatan admin: DATABASE_URL belum diatur.");
      process.exit(0);
    }
    if (!process.env.ADMIN_PASSWORD) {
      console.log(
        [
          "→ Lewati pembuatan admin: ADMIN_PASSWORD belum diatur.",
          "  Isi ADMIN_PASSWORD di Environment Variables, lalu Redeploy.",
        ].join("\n"),
      );
      process.exit(0);
    }
  }

  await pastikanDatabaseBebas();

  const { db, jenis } = await createDb();
  const { users, employees } = schema;

  const [sudahAda] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, USERNAME))
    .limit(1);

  if (sudahAda) {
    // Administrator sistem bukan karyawan yang absen. Penanda ini ditegakkan
    // ulang setiap kali skrip berjalan supaya akun yang terlanjur dibuat
    // sebelum penanda itu ada ikut diperbaiki, tanpa menyentuh apa pun yang lain.
    const { rowCount } = await db
      .update(employees)
      .set({ wajibAbsen: false })
      .where(and(eq(employees.userId, sudahAda.id), eq(employees.wajibAbsen, true)));

    console.log(`• Akun "${USERNAME}" sudah ada. Password tidak diubah.`);
    if (rowCount) console.log("  Ditandai sebagai akun non-absensi.");
    process.exit(0);
  }

  const [akun] = await db
    .insert(users)
    .values({
      username: USERNAME,
      passwordHash: await hashPassword(PASSWORD),
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    })
    .returning();

  await db.insert(employees).values({
    userId: akun.id,
    nama: "Administrator",
    tanggalMasuk: tanggalWIB(),
    aktif: true,
    // Pengelola sistem, bukan karyawan yang mencatatkan kehadiran.
    wajibAbsen: false,
  });

  console.log(`✓ Akun administrator dibuat di ${jenis}.\n`);
  console.log(`  Username : ${USERNAME}`);
  console.log(`  Password : ${PASSWORD}\n`);
  console.log("  Ganti password setelah masuk pertama kali.");
  console.log(
    "  Selanjutnya isi Departemen, Jabatan, Lokasi, dan Shift dari menu admin.\n",
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("✗ Gagal membuat akun admin:\n" + jelaskanGalat(err));
  process.exit(1);
});
