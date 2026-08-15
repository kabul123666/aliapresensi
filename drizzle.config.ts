import type { Config } from "drizzle-kit";

/**
 * Hanya dipakai untuk menghasilkan berkas migrasi SQL (`npm run db:generate`).
 * Penerapan migrasi dilakukan oleh scripts/migrate.ts agar driver dev (PGlite)
 * dan produksi (Postgres) memakai jalur yang sama.
 */
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
} satisfies Config;
