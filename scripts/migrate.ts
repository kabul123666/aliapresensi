/* eslint-disable @typescript-eslint/no-explicit-any */
import { createDb } from "../src/db/driver";
import { jelaskanGalat, pastikanDatabaseBebas } from "./penjaga-db";

/**
 * Menerapkan berkas migrasi di ./drizzle ke database aktif.
 * Driver dipilih otomatis (PGlite untuk dev, Postgres untuk produksi).
 */
async function main() {
  await pastikanDatabaseBebas();
  const { db, jenis } = await createDb();
  console.log(`→ Menerapkan migrasi ke ${jenis}…`);

  if (jenis === "pglite") {
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    await migrate(db as any, { migrationsFolder: "./drizzle" });
  } else {
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    await migrate(db as any, { migrationsFolder: "./drizzle" });
  }

  console.log("✓ Migrasi selesai");
  process.exit(0);
}

main().catch((err) => {
  console.error("✗ Migrasi gagal:\n" + jelaskanGalat(err));
  process.exit(1);
});
