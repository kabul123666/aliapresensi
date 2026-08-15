"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { aksiMasuk, type HasilForm } from "./actions";

export function FormMasuk() {
  const [hasil, kirim, sedangKirim] = useActionState<HasilForm | null, FormData>(
    aksiMasuk,
    null,
  );
  const [lihatPassword, setLihatPassword] = useState(false);

  return (
    <div>
      <div className="mb-8 flex items-center gap-2.5">
        <span className="bg-brand-600 grid size-9 place-items-center rounded-[var(--radius-input)]">
          <span className="text-sm font-semibold text-white">A</span>
        </span>
        <span>
          <span className="text-body block text-sm font-semibold">AliaPresensi</span>
          <span className="text-subtle block text-[11px]">Alia Hospital</span>
        </span>
      </div>

      <h1 className="text-body text-xl font-semibold">Masuk</h1>

      <form action={kirim} className="mt-6 space-y-4" noValidate>
        {hasil?.pesan && !hasil.ok ? (
          <p
            role="alert"
            className="border-danger-500/35 bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-100 rounded-[var(--radius-input)] border px-3.5 py-2.5 text-sm"
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
            className="bg-surface border-app-strong text-body placeholder:text-subtle focus:border-brand-600 focus:ring-brand-600/15 h-11 w-full rounded-[var(--radius-input)] border px-3 font-mono text-[15px] transition-colors outline-none focus:ring-2"
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
              className="bg-surface border-app-strong text-body focus:border-brand-600 focus:ring-brand-600/15 h-11 w-full rounded-[var(--radius-input)] border pr-11 pl-3 font-mono text-[15px] transition-colors outline-none focus:ring-2"
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
        </div>

        <button
          type="submit"
          disabled={sedangKirim}
          className="bg-brand-600 hover:bg-brand-700 active:bg-brand-800 h-11 w-full rounded-[var(--radius-input)] text-[15px] font-medium text-white transition-colors disabled:opacity-60"
        >
          {sedangKirim ? "Memeriksa…" : "Masuk"}
        </button>
      </form>

      <div className="border-app text-muted mt-8 space-y-1.5 border-t pt-5 text-[13px]">
        <p>
          Lupa username atau password? Hubungi admin — akun hanya bisa direset dari sana.
        </p>
        <p>
          Karyawan baru?{" "}
          <Link
            href="/daftar"
            className="text-brand-700 dark:text-brand-300 font-medium underline underline-offset-2"
          >
            Ajukan pendaftaran
          </Link>
        </p>
      </div>
    </div>
  );
}
