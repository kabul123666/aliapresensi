import { normalize } from "node:path";
import { NextResponse } from "next/server";

import { ambilPengguna, bolehKelolaSemua } from "@/lib/auth/session";
import { storage } from "@/lib/storage";

/**
 * Menyajikan foto absensi.
 *
 * Berkas tidak pernah terbuka untuk publik: setiap permintaan harus membawa
 * sesi yang sah, dan karyawan biasa hanya boleh membuka fotonya sendiri.
 * Dipakai oleh driver lokal (pengembangan) dan driver Vercel Blob privat —
 * pada keduanya pemeriksaan hak akses dilakukan di sini. Driver R2 memakai
 * URL bertanda tangan sehingga tidak melewati route ini.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ kunci: string[] }> },
) {
  const pengguna = await ambilPengguna();
  if (!pengguna) {
    return NextResponse.json({ pesan: "Tidak berwenang" }, { status: 401 });
  }

  const { kunci } = await params;
  const relatif = kunci.join("/");

  // Cegah path traversal: kunci hasil normalisasi harus tetap relatif.
  const aman = normalize(relatif);
  if (aman.startsWith("..") || aman.startsWith("/")) {
    return NextResponse.json({ pesan: "Jalur tidak sah" }, { status: 400 });
  }

  // Kunci foto absensi berbentuk absensi/<tahun>/<bulan>/<employeeId>/<berkas>
  const bagian = aman.split("/");
  const pemilik = bagian[0] === "absensi" ? bagian[3] : null;
  if (!bolehKelolaSemua(pengguna.role) && pemilik !== pengguna.employeeId) {
    return NextResponse.json({ pesan: "Tidak berwenang" }, { status: 403 });
  }

  const isi = await storage().ambil(aman);
  if (!isi) {
    return NextResponse.json({ pesan: "Berkas tidak ditemukan" }, { status: 404 });
  }

  return new NextResponse(isi, {
    headers: {
      "Content-Type": "image/jpeg",
      // Privat: hanya boleh disimpan di cache peramban pengguna sendiri.
      "Cache-Control": "private, max-age=300",
      "Content-Disposition": "inline",
    },
  });
}
