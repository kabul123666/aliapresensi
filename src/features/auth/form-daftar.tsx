"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { aksiDaftar, type HasilForm } from "./actions";

type Jabatan = { id: string; nama: string; departemen: string | null };

const kelasInput =
  "bg-surface border-app-strong text-body placeholder:text-subtle focus:border-brand-600 focus:ring-brand-600/15 h-11 w-full rounded-[var(--radius-input)] border px-3 text-[15px] outline-none transition-colors focus:ring-2";

function Baris({
  label,
  htmlFor,
  catatan,
  children,
}: {
  label: string;
  htmlFor: string;
  catatan?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="text-muted mb-1.5 block text-[13px] font-medium"
      >
        {label}
      </label>
      {children}
      {catatan ? <p className="text-subtle mt-1.5 text-xs">{catatan}</p> : null}
    </div>
  );
}

export function FormDaftar({ daftarJabatan }: { daftarJabatan: Jabatan[] }) {
  const [hasil, kirim, sedangKirim] = useActionState<HasilForm | null, FormData>(
    aksiDaftar,
    null,
  );
  const [lihatPassword, setLihatPassword] = useState(false);

  if (hasil?.ok) {
    return (
      <div>
        <h1 className="text-body mt-3 text-xl font-semibold">Pendaftaran terkirim</h1>
        <p className="text-muted mt-3 text-sm leading-relaxed">{hasil.pesan}</p>
        <Link
          href="/masuk"
          className="border-app-strong bg-surface text-body hover:bg-surface-muted mt-7 inline-flex h-11 items-center gap-2 rounded-[var(--radius-input)] border px-4 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke halaman masuk
        </Link>
      </div>
    );
  }

  const galat = (field: string) => (hasil?.field === field ? hasil.pesan : null);

  return (
    <div>
      <Link
        href="/masuk"
        className="text-muted hover:text-body inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors"
      >
        <ArrowLeft size={15} /> Kembali
      </Link>

      <h1 className="text-body mt-5 text-xl font-semibold">Ajukan pendaftaran</h1>
      <p className="text-muted mt-1.5 text-sm">Akun aktif setelah diverifikasi admin.</p>

      <form action={kirim} className="mt-6 space-y-4" noValidate>
        {hasil?.pesan && !hasil.ok && !hasil.field ? (
          <p
            role="alert"
            className="border-danger-500/35 bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-100 rounded-[var(--radius-input)] border px-3.5 py-2.5 text-sm"
          >
            {hasil.pesan}
          </p>
        ) : null}

        <Baris label="Nama lengkap" htmlFor="nama">
          <input id="nama" name="nama" required className={kelasInput} />
        </Baris>

        <Baris
          label="Username"
          htmlFor="username"
          catatan={galat("username") ?? "Huruf kecil, angka, titik, dan garis bawah."}
        >
          <input
            id="username"
            name="username"
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="nadia.rahmawati"
            className={`${kelasInput} font-mono`}
          />
        </Baris>

        <div className="grid grid-cols-2 gap-3">
          <Baris label="Nomor HP" htmlFor="noHp">
            <input
              id="noHp"
              name="noHp"
              type="tel"
              inputMode="tel"
              required
              className={kelasInput}
            />
          </Baris>
          <Baris label="NIK / NIP" htmlFor="nik" catatan="Boleh dikosongkan.">
            <input id="nik" name="nik" className={kelasInput} />
          </Baris>
        </div>

        {daftarJabatan.length > 0 && (
          <Baris label="Jabatan" htmlFor="positionId" catatan="Bisa diubah admin nanti.">
            <select
              id="positionId"
              name="positionId"
              defaultValue=""
              className={`${kelasInput} pr-9`}
            >
              <option value="">Belum tahu / diisi admin</option>
              {daftarJabatan.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama}
                  {j.departemen ? ` — ${j.departemen}` : ""}
                </option>
              ))}
            </select>
          </Baris>
        )}

        <Baris
          label="Password"
          htmlFor="password"
          catatan={galat("password") ?? undefined}
        >
          <div className="relative">
            <input
              id="password"
              name="password"
              type={lihatPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              className={`${kelasInput} pr-11 font-mono`}
            />
            <button
              type="button"
              onClick={() => setLihatPassword((v) => !v)}
              className="text-subtle hover:text-body absolute inset-y-0 right-0 grid w-11 place-items-center transition-colors"
              aria-label={lihatPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {lihatPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </Baris>

        <Baris
          label="Ulangi password"
          htmlFor="konfirmasi"
          catatan={galat("konfirmasi") ?? undefined}
        >
          <input
            id="konfirmasi"
            name="konfirmasi"
            type={lihatPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            className={`${kelasInput} font-mono`}
          />
        </Baris>

        <button
          type="submit"
          disabled={sedangKirim}
          className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 h-11 w-full rounded-[var(--radius-input)] text-[15px] font-medium text-white transition-colors disabled:opacity-60"
        >
          {sedangKirim ? "Mengirim…" : "Kirim pendaftaran"}
        </button>
      </form>
    </div>
  );
}
