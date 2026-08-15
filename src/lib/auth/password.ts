import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  opsi: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, opsi, (err, derived) =>
      err ? reject(err) : resolve(derived),
    );
  });
}

/**
 * Parameter scrypt. N=2^15 memberi biaya komputasi yang berat untuk penyerang
 * namun masih di bawah 100 ms di server biasa.
 */
const N = 32768;
const r = 8;
const p = 1;
const KEYLEN = 64;
const MAXMEM = 256 * 1024 * 1024;

/**
 * Menghasilkan hash password.
 * Format: scrypt$N$r$p$salt_base64$hash_base64 — parameter ikut disimpan
 * supaya password lama tetap bisa diverifikasi bila parameternya dinaikkan.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password.normalize("NFKC"), salt, KEYLEN, {
    N,
    r,
    p,
    maxmem: MAXMEM,
  });
  return ["scrypt", N, r, p, salt.toString("base64"), derived.toString("base64")].join(
    "$",
  );
}

/**
 * Memverifikasi password terhadap hash tersimpan.
 * Perbandingan memakai timingSafeEqual agar tidak bocor lewat selisih waktu.
 */
export async function verifyPassword(
  password: string,
  stored: string | null,
): Promise<boolean> {
  if (!stored) return false;

  const bagian = stored.split("$");
  if (bagian.length !== 6 || bagian[0] !== "scrypt") return false;

  const [, nRaw, rRaw, pRaw, saltB64, hashB64] = bagian;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");

  try {
    const derived = await scryptAsync(password.normalize("NFKC"), salt, expected.length, {
      N: Number(nRaw),
      r: Number(rRaw),
      p: Number(pRaw),
      maxmem: MAXMEM,
    });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** Aturan kekuatan password minimum (PRD §9). */
export function periksaKekuatanPassword(password: string): string | null {
  if (password.length < 8) return "Password minimal 8 karakter";
  if (!/[a-z]/i.test(password)) return "Password harus mengandung huruf";
  if (!/\d/.test(password)) return "Password harus mengandung angka";
  const umum = ["password", "12345678", "qwerty123", "admin123", "aliahospital"];
  if (umum.includes(password.toLowerCase())) return "Password terlalu mudah ditebak";
  return null;
}
