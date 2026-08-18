import "server-only";

/**
 * Adapter penyimpanan berkas.
 *
 * Seluruh aplikasi hanya mengenal antarmuka ini, tidak pernah memanggil SDK
 * penyedia secara langsung. Pindah dari penyimpanan lokal ke Cloudflare R2
 * (atau S3 mana pun) cukup mengganti implementasi di berkas ini — kode fitur
 * tidak ikut berubah (PRD §5.1).
 */
export type Storage = {
  /** Simpan berkas, kembalikan kunci objek. */
  put(kunci: string, data: Buffer, contentType: string): Promise<string>;
  /** URL sementara untuk melihat berkas privat. */
  getSignedUrl(kunci: string, detik?: number): Promise<string>;
  /**
   * Baca isi berkas. Dipakai route /api/berkas untuk driver yang tidak
   * menyajikan berkas lewat URL bertanda tangan (lokal dan Blob privat).
   * Mengembalikan null bila berkas tidak ada.
   */
  ambil(kunci: string): Promise<ReadableStream<Uint8Array> | null>;
  delete(kunci: string): Promise<void>;
};

/** Membungkus buffer menjadi stream agar seluruh driver seragam. */
function aliranDari(data: Uint8Array): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    },
  });
}

/**
 * Driver lokal untuk pengembangan: menulis ke ./.data/uploads dan disajikan
 * lewat route /api/berkas yang tetap memeriksa sesi pengguna.
 */
function driverLokal(): Storage {
  const DIR = ".data/uploads";

  return {
    async put(kunci, data) {
      const { mkdir, writeFile } = await import("node:fs/promises");
      const { dirname, join } = await import("node:path");
      const tujuan = join(DIR, kunci);
      await mkdir(dirname(tujuan), { recursive: true });
      await writeFile(tujuan, data);
      return kunci;
    },
    async getSignedUrl(kunci) {
      return `/api/berkas/${kunci}`;
    },
    async ambil(kunci) {
      const { readFile } = await import("node:fs/promises");
      const { join } = await import("node:path");
      try {
        return aliranDari(new Uint8Array(await readFile(join(DIR, kunci))));
      } catch {
        return null;
      }
    },
    async delete(kunci) {
      const { rm } = await import("node:fs/promises");
      const { join } = await import("node:path");
      await rm(join(DIR, kunci), { force: true });
    },
  };
}

/**
 * Driver Vercel Blob. Diaktifkan dengan STORAGE_DRIVER=blob.
 *
 * Foto disimpan sebagai objek **privat** — tidak punya URL publik sama sekali.
 * Karena itu penyajiannya tetap lewat /api/berkas, yang memeriksa sesi dan
 * memastikan karyawan hanya bisa membuka fotonya sendiri. Ini sengaja berbeda
 * dari R2 yang memakai URL bertanda tangan: pada Blob, pemeriksaan hak akses
 * tidak pernah lepas dari server aplikasi.
 *
 * Token BLOB_READ_WRITE_TOKEN diisi otomatis oleh Vercel saat store Blob
 * ditautkan ke proyek.
 */
function driverBlob(): Storage {
  return {
    async put(kunci, data, contentType) {
      const { put } = await import("@vercel/blob");
      await put(kunci, data, {
        access: "private",
        contentType,
        // Kunci sudah unik lewat stempel waktu di kunciFotoAbsensi().
        addRandomSuffix: false,
      });
      return kunci;
    },
    async getSignedUrl(kunci) {
      return `/api/berkas/${kunci}`;
    },
    async ambil(kunci) {
      const { get, BlobNotFoundError } = await import("@vercel/blob");
      try {
        const hasil = await get(kunci, { access: "private" });
        return hasil?.statusCode === 200 ? hasil.stream : null;
      } catch (galat) {
        if (galat instanceof BlobNotFoundError) return null;
        throw galat;
      }
    },
    async delete(kunci) {
      const { del } = await import("@vercel/blob");
      await del(kunci);
    },
  };
}

/**
 * Driver Cloudflare R2. Diaktifkan dengan STORAGE_DRIVER=r2.
 * Memerlukan paket @aws-sdk/client-s3 dan @aws-sdk/s3-request-presigner.
 */
function driverR2(): Storage {
  const bucket = process.env.R2_BUCKET!;
  const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  const klien = async () => {
    const { S3Client } = await import("@aws-sdk/client-s3");
    return new S3Client({
      region: "auto",
      endpoint,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  };

  return {
    async put(kunci, data, contentType) {
      const { PutObjectCommand } = await import("@aws-sdk/client-s3");
      const s3 = await klien();
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: kunci,
          Body: data,
          ContentType: contentType,
        }),
      );
      return kunci;
    },
    async getSignedUrl(kunci, detik = 300) {
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const s3 = await klien();
      return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: kunci }), {
        expiresIn: detik,
      });
    },
    async ambil(kunci) {
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");
      const s3 = await klien();
      try {
        const hasil = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: kunci }));
        return hasil.Body?.transformToWebStream() ?? null;
      } catch {
        return null;
      }
    },
    async delete(kunci) {
      const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
      const s3 = await klien();
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: kunci }));
    },
  };
}

let instance: Storage | null = null;

export function storage(): Storage {
  if (!instance) {
    // Menautkan store Blob di Vercel sudah menitipkan tokennya sendiri, dan
    // keberadaan token itu satu-satunya alasan store tersebut ada. Jadi ia
    // dipakai sebagai penanda: tidak perlu menyetel STORAGE_DRIVER secara
    // terpisah hanya untuk mengulang apa yang sudah jelas. Setelan eksplisit
    // tetap menang, supaya perpindahan ke R2 nanti cukup satu variabel.
    const pilihan =
      process.env.STORAGE_DRIVER ??
      (process.env.BLOB_READ_WRITE_TOKEN ? "blob" : undefined);

    instance =
      pilihan === "r2" ? driverR2() : pilihan === "blob" ? driverBlob() : driverLokal();
  }
  return instance;
}

/** Kunci objek foto absensi: absensi/2026/08/<employeeId>/<jenis>-<waktu>.jpg */
export function kunciFotoAbsensi(
  employeeId: string,
  tanggal: string,
  jenis: "masuk" | "pulang",
) {
  const [tahun, bulan] = tanggal.split("-");
  return `absensi/${tahun}/${bulan}/${employeeId}/${jenis}-${Date.now()}.jpg`;
}
