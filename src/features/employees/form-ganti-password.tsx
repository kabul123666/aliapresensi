"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";

import { aksiGantiPasswordSendiri, type HasilKaryawan } from "./actions";
import { cn } from "@/lib/utils";

const kelasInput =
  "bg-surface border-app-strong text-body focus:border-brand-600 focus:ring-brand-600/15 h-11 w-full rounded-[var(--radius-input)] border px-3 font-mono text-[15px] outline-none transition-colors focus:ring-2";

/** Ganti password sendiri — satu-satunya cara mengganti password bawaan admin. */
export function FormGantiPassword() {
  const [hasil, kirim, sedang] = useActionState<HasilKaryawan | null, FormData>(
    aksiGantiPasswordSendiri,
    null,
  );
  const [buka, setBuka] = useState(false);
  const [lihat, setLihat] = useState(false);

  if (!buka) {
    return (
      <button
        onClick={() => setBuka(true)}
        className="border-app-strong bg-surface text-body hover:bg-surface-muted mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-input)] border text-sm font-medium transition-colors"
      >
        <KeyRound size={16} /> Ganti password
      </button>
    );
  }

  return (
    <form action={kirim} className="mt-4 space-y-3">
      {hasil && (
        <p
          role="status"
          className={cn(
            "rounded-[var(--radius-input)] px-3.5 py-2.5 text-[13px]",
            hasil.ok
              ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-100"
              : "bg-danger-50 text-danger-700 dark:bg-danger-500/10 dark:text-danger-100",
          )}
        >
          {hasil.pesan}
        </p>
      )}

      <div>
        <label
          htmlFor="passwordLama"
          className="text-muted mb-1.5 block text-[13px] font-medium"
        >
          Password lama
        </label>
        <input
          id="passwordLama"
          name="passwordLama"
          type={lihat ? "text" : "password"}
          autoComplete="current-password"
          required
          className={kelasInput}
        />
      </div>

      <div>
        <label
          htmlFor="passwordBaru"
          className="text-muted mb-1.5 block text-[13px] font-medium"
        >
          Password baru
        </label>
        <div className="relative">
          <input
            id="passwordBaru"
            name="passwordBaru"
            type={lihat ? "text" : "password"}
            autoComplete="new-password"
            required
            className={`${kelasInput} pr-11`}
          />
          <button
            type="button"
            onClick={() => setLihat((v) => !v)}
            className="text-subtle hover:text-body absolute inset-y-0 right-0 grid w-11 place-items-center"
            aria-label={lihat ? "Sembunyikan password" : "Tampilkan password"}
          >
            {lihat ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <p className="text-subtle mt-1.5 text-xs">
          Minimal 8 karakter, mengandung huruf dan angka.
        </p>
      </div>

      <div>
        <label
          htmlFor="konfirmasi"
          className="text-muted mb-1.5 block text-[13px] font-medium"
        >
          Ulangi password baru
        </label>
        <input
          id="konfirmasi"
          name="konfirmasi"
          type={lihat ? "text" : "password"}
          autoComplete="new-password"
          required
          className={kelasInput}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => setBuka(false)}
          className="border-app-strong bg-surface text-body hover:bg-surface-muted h-11 flex-1 rounded-[var(--radius-input)] border text-sm font-medium transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={sedang}
          className="bg-brand-600 hover:bg-brand-700 inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-input)] text-sm font-medium text-white transition-colors disabled:opacity-60"
        >
          {sedang && <Loader2 size={16} className="animate-spin" />}
          Simpan
        </button>
      </div>
    </form>
  );
}
