"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { aksiMasuk, type HasilForm } from "./actions";

const kelasInput =
  "bg-surface border-app-strong text-body placeholder:text-subtle focus:border-brand-600 focus:ring-brand-600/15 h-12 w-full rounded-[var(--radius-input)] border px-3.5 text-[15px] outline-none transition-colors focus:ring-2";

/**
 * Judul, penjelas, dan catatan kaki dipusatkan mengikuti sumbu lambang di
 * atasnya. Label isian tetap rata kiri — label adalah bagian dari kotak
 * isiannya, dan memusatkannya akan melepas label dari kolom yang ia terangkan.
 */
export function FormMasuk() {
  const [hasil, kirim, sedangKirim] = useActionState<HasilForm | null, FormData>(
    aksiMasuk,
    null,
  );
  const [lihatPassword, setLihatPassword] = useState(false);

  return (
    <div>
      <div className="text-center">
        <h1 className="text-body text-[22px] leading-tight font-bold tracking-tight">
          Masuk
        </h1>
        <p className="text-muted mx-auto mt-2 max-w-[17rem] text-sm leading-relaxed">
          Gunakan username kepegawaian Anda — bukan email.
        </p>
      </div>

      <form action={kirim} className="mt-7 space-y-4" noValidate>
        {hasil?.pesan && !hasil.ok ? (
          <p
            role="alert"
            className="border-danger-500/35 bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-100 rounded-[var(--radius-input)] border px-3.5 py-2.5 text-center text-sm"
          >
            {hasil.pesan}
          </p>
        ) : null}

        <div>
          <label
            htmlFor="identitas"
            className="text-muted mb-1.5 block text-[13px] font-medium"
          >
            Username
          </label>
          <input
            id="identitas"
            name="identitas"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
            autoFocus
            className={`${kelasInput} font-mono`}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-muted mb-1.5 block text-[13px] font-medium"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={lihatPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className={`${kelasInput} pr-12 font-mono`}
            />
            <button
              type="button"
              onClick={() => setLihatPassword((v) => !v)}
              className="text-subtle hover:text-body absolute inset-y-0 right-0 grid w-12 place-items-center transition-colors"
              aria-label={lihatPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {lihatPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={sedangKirim}
          className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 mt-1 h-12 w-full rounded-[var(--radius-input)] text-[15px] font-semibold text-white transition-colors disabled:opacity-60"
        >
          {sedangKirim ? "Memeriksa…" : "Masuk"}
        </button>
      </form>

      <div className="border-app text-muted mt-7 space-y-2 border-t pt-5 text-center text-[13px] leading-relaxed">
        <p className="mx-auto max-w-[15rem]">
          Lupa username atau password? Hubungi admin.
        </p>
        <p>
          Karyawan baru?{" "}
          <Link
            href="/daftar"
            className="text-brand-700 dark:text-brand-300 font-semibold underline underline-offset-2"
          >
            Ajukan pendaftaran
          </Link>
        </p>
      </div>
    </div>
  );
}
