import * as schema from "./schema";

/**
 * Pemilihan driver database — satu-satunya tempat di seluruh proyek yang tahu
 * database apa yang sedang dipakai.
 *
 * Dev  : PGlite (Postgres embedded/WASM di ./.data/pglite) — tanpa instalasi.
 * Prod : Neon / Postgres apa pun lewat DATABASE_URL.
 *
 * Berkas ini sengaja bebas dari "server-only" supaya bisa dipakai juga oleh
 * skrip CLI (migrasi & seed) yang berjalan di luar Next.js.
 */

export async function createDb() {
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost")
        ? undefined
        : { rejectUnauthorized: true },
      max: 5,
    });
    return { db: drizzle(pool, { schema }), jenis: "postgres" as const };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { mkdirSync } = await import("node:fs");
  const { dirname } = await import("node:path");

  const dir = process.env.PGLITE_DIR ?? ".data/pglite";
  // PGlite hanya membuat folder terakhir, bukan induknya.
  mkdirSync(dirname(dir), { recursive: true });

  const client = new PGlite(dir);
  return { db: drizzle(client, { schema }), jenis: "pglite" as const };
}

export type DbBundle = Awaited<ReturnType<typeof createDb>>;
export type Database = DbBundle["db"];
export { schema };
