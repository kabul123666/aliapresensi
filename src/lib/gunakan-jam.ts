"use client";

import { useSyncExternalStore } from "react";

import { jamDetikWIB, jamWIB } from "./waktu";

/**
 * Jam berjalan. Waktu adalah sistem di luar React, jadi dibaca lewat
 * useSyncExternalStore alih-alih disalin ke state di dalam useEffect.
 *
 * Satu timer dipakai bersama oleh semua komponen yang menampilkan jam yang
 * sama, dan berhenti sendiri ketika komponen terakhir dilepas.
 */
function buatJam(format: () => string, intervalMs: number, awal: string) {
  let nilai = "";
  let timer: ReturnType<typeof setInterval> | null = null;
  const pendengar = new Set<() => void>();

  const detak = () => {
    const baru = format();
    if (baru === nilai) return;
    nilai = baru;
    for (const beriTahu of pendengar) beriTahu();
  };

  return {
    langganan(beriTahu: () => void) {
      pendengar.add(beriTahu);
      if (!timer) {
        // Isi nilai awal tanpa memberi tahu: React membaca ulang snapshot
        // tepat setelah langganan terpasang.
        nilai = format();
        timer = setInterval(detak, intervalMs);
      }
      return () => {
        pendengar.delete(beriTahu);
        if (pendengar.size === 0 && timer) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
    baca: () => nilai || awal,
    awal: () => awal,
  };
}

const jamDetik = buatJam(() => jamDetikWIB(new Date()), 1000, "--:--:--");

const jamLengkap = buatJam(
  () => {
    const kini = new Date();
    const tanggal = new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(kini);
    return `${tanggal} · ${jamWIB(kini)}`;
  },
  15_000,
  "",
);

/** Jam WIB dengan detik, mis. "08:03:21". */
export function useJamDetik() {
  return useSyncExternalStore(jamDetik.langganan, jamDetik.baca, jamDetik.awal);
}

/** Tanggal panjang beserta jam, mis. "Jumat, 14 Agustus 2026 · 08:03". */
export function useJamLengkap() {
  return useSyncExternalStore(jamLengkap.langganan, jamLengkap.baca, jamLengkap.awal);
}
