"use client";

import { useSyncExternalStore } from "react";

/**
 * Sumber kebenaran tema aplikasi.
 *
 * Tema tinggal di localStorage dan di class pada <html> — keduanya sistem di
 * luar React. Karena itu dibaca lewat useSyncExternalStore, bukan disalin ke
 * useState di dalam useEffect: nilainya selalu mengikuti sumber aslinya dan
 * tidak menimbulkan render berantai.
 *
 * Tema bawaan adalah terang. Aplikasi ini dipakai di ruang praktik yang
 * terang benderang dan sebagian besar dibuka dari ponsel yang preferensi
 * sistemnya kebetulan gelap — mengikuti OS membuat karyawan disambut layar
 * hitam tanpa pernah memintanya. Yang mau gelap memilihnya sendiri di Profil,
 * dan pilihan "Sistem" tetap tersedia sebagai pilihan sadar, bukan bawaan.
 */

export type Tema = "terang" | "gelap" | "sistem";

const KUNCI = "alia-theme";
const PERISTIWA = "alia-tema-berubah";

function bacaTema(): Tema {
  const nilai = localStorage.getItem(KUNCI);
  if (nilai === "dark") return "gelap";
  if (nilai === "system") return "sistem";
  return "terang";
}

function langgananTema(beriTahu: () => void) {
  window.addEventListener(PERISTIWA, beriTahu);
  window.addEventListener("storage", beriTahu);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", beriTahu);

  return () => {
    window.removeEventListener(PERISTIWA, beriTahu);
    window.removeEventListener("storage", beriTahu);
    media.removeEventListener("change", beriTahu);
  };
}

/** Pilihan tema yang tersimpan: terang, gelap, atau ikut sistem. */
export function useTema(): Tema {
  return useSyncExternalStore(langgananTema, bacaTema, () => "terang");
}

/** Apakah mode gelap sedang aktif setelah memperhitungkan preferensi sistem. */
export function useGelapAktif(): boolean {
  return useSyncExternalStore(
    langgananTema,
    () => {
      const tema = bacaTema();
      if (tema === "gelap") return true;
      if (tema === "terang") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    },
    () => false,
  );
}

/** Menyimpan pilihan tema, menerapkannya ke <html>, lalu memberi tahu pembaca. */
export function terapkanTema(tema: Tema) {
  // Ketiganya disimpan eksplisit — termasuk "sistem". Tanpa nilai tersimpan
  // artinya pengguna belum pernah memilih, dan itu berarti tema bawaan:
  // terang. Menghapus kunci akan membuat "Sistem" tak bisa dibedakan dari
  // "belum pernah memilih".
  localStorage.setItem(
    KUNCI,
    tema === "gelap" ? "dark" : tema === "sistem" ? "system" : "light",
  );

  const gelap =
    tema === "gelap" ||
    (tema === "sistem" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", gelap);
  window.dispatchEvent(new Event(PERISTIWA));
}
