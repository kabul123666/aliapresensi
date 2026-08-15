import { createConnection } from "node:net";

/**
 * Penjaga akses database untuk skrip CLI.
 *
 * PGlite adalah Postgres yang berjalan di dalam satu proses. Berbeda dari
 * Postgres biasa, ia TIDAK bisa dibuka dua proses sekaligus — bila server dev
 * sedang memegang folder datanya lalu skrip migrasi/seed ikut membukanya,
 * berkasnya bisa rusak dan seluruh data hilang.
 *
 * Karena itu skrip menolak jalan selama server dev masih hidup, dan
 * menjelaskan apa yang harus dilakukan alih-alih membiarkannya merusak data.
 */

const PORT_DEV = Number(process.env.PORT ?? 3000);

function portTerpakai(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const soket = createConnection({ port, host: "127.0.0.1" });
    const selesai = (hasil: boolean) => {
      soket.destroy();
      resolve(hasil);
    };
    soket.setTimeout(600);
    soket.once("connect", () => selesai(true));
    soket.once("timeout", () => selesai(false));
    soket.once("error", () => selesai(false));
  });
}

/**
 * Pastikan tidak ada proses lain yang sedang memegang database.
 * Hanya berlaku untuk PGlite; Postgres sungguhan aman diakses bersamaan.
 */
export async function pastikanDatabaseBebas() {
  if (process.env.DATABASE_URL) return; // Postgres asli, tidak ada batasan ini.

  if (await portTerpakai(PORT_DEV)) {
    console.error(
      [
        "",
        "✗ Server pengembangan masih berjalan di port " + PORT_DEV + ".",
        "",
        "  PGlite hanya boleh dibuka oleh satu proses. Menjalankan skrip ini",
        "  sekarang berisiko merusak berkas database.",
        "",
        "  Hentikan dulu `npm run dev` (Ctrl+C), jalankan ulang perintah ini,",
        "  lalu nyalakan kembali server dev.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
}

/** Ubah galat PGlite yang tidak informatif menjadi pesan yang bisa ditindaklanjuti. */
export function jelaskanGalat(err: unknown): string {
  const pesan = err instanceof Error ? `${err.message} ${err.cause ?? ""}` : String(err);

  if (pesan.includes("Aborted()")) {
    return [
      "Database lokal tidak bisa dibuka — kemungkinan besar rusak karena",
      "sempat diakses dua proses sekaligus.",
      "",
      "Perbaiki dengan mengisi ulang dari nol:",
      "  npm run db:reset",
    ].join("\n");
  }

  return pesan;
}
