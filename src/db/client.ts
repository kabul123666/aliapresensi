import "server-only";

import { createDb, type Database } from "./driver";

/**
 * Akses database untuk kode aplikasi (Server Component & Server Action).
 * Instance disimpan di globalThis agar hot reload tidak membuka koneksi baru
 * setiap kali berkas berubah.
 */
const globalDb = globalThis as unknown as { __aliaDb?: Promise<Database> };

export function getDb(): Promise<Database> {
  globalDb.__aliaDb ??= createDb().then((bundle) => bundle.db);
  return globalDb.__aliaDb;
}

export { schema } from "./driver";
export type { Database };
