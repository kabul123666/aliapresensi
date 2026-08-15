import { useId } from "react";

/**
 * Set ikon 3D AliaPresensi.
 *
 * Dibuat sebagai SVG berlapis, bukan gambar raster, supaya tajam di layar
 * kepadatan berapa pun dan ukuran berkasnya kecil. Kesan tiga dimensi datang
 * dari empat lapis yang konsisten di semua ikon:
 *
 *   1. bayangan lantai (elips kabur di bawah objek)
 *   2. sisi bawah/tebal objek (warna gelap, digeser ke bawah)
 *   3. permukaan depan (gradien terang → gelap)
 *   4. kilau (highlight putih semi-transparan di sisi kiri atas)
 *
 * Semua id gradien dibuat unik lewat useId agar aman ketika beberapa ikon
 * dirender bersamaan di satu halaman.
 */

export type Icon3DProps = {
  size?: number;
  className?: string;
  title?: string;
};

type Palet = {
  terang: string;
  utama: string;
  gelap: string;
  sisi: string;
};

const PALET = {
  teal: { terang: "#7FE9C8", utama: "#14a07c", gelap: "#056653", sisi: "#034a3c" },
  amber: { terang: "#FFD79A", utama: "#e8890c", gelap: "#a3530a", sisi: "#7c3d07" },
  indigo: { terang: "#B6C0FF", utama: "#6366f1", gelap: "#4338ca", sisi: "#332a9e" },
  rose: { terang: "#FFB3BF", utama: "#e11d48", gelap: "#9f1239", sisi: "#7c0e2c" },
  sky: { terang: "#9BDDFC", utama: "#0ea5e9", gelap: "#0369a1", sisi: "#02507c" },
  slate: { terang: "#D6E0DE", utama: "#6d7f7b", gelap: "#42514e", sisi: "#303c3a" },
} satisfies Record<string, Palet>;

export type NamaPalet = keyof typeof PALET;

/** Kerangka bersama: viewBox, bayangan lantai, dan definisi gradien. */
function Bingkai({
  size = 48,
  className,
  title,
  uid,
  palet,
  children,
}: Icon3DProps & { uid: string; palet: Palet; children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={`${uid}-muka`} x1="14" y1="8" x2="50" y2="56">
          <stop stopColor={palet.terang} />
          <stop offset="0.55" stopColor={palet.utama} />
          <stop offset="1" stopColor={palet.gelap} />
        </linearGradient>
        <linearGradient id={`${uid}-muka2`} x1="18" y1="12" x2="46" y2="52">
          <stop stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#E6EEEC" />
        </linearGradient>
        <linearGradient id={`${uid}-kilau`} x1="20" y1="10" x2="34" y2="34">
          <stop stopColor="#FFFFFF" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${uid}-lantai`} cx="0.5" cy="0.5" r="0.5">
          <stop stopColor="#0E1615" stopOpacity="0.28" />
          <stop offset="1" stopColor="#0E1615" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="32" cy="56" rx="19" ry="4.5" fill={`url(#${uid}-lantai)`} />
      {children}
    </svg>
  );
}

/* ========================================================================== */

/** Jam dengan panah masuk — tombol clock in. */
export function IconClockIn(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.teal;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <circle cx="32" cy="32" r="21" fill={p.sisi} />
      <circle cx="32" cy="29" r="21" fill={`url(#${uid}-muka)`} />
      <circle cx="32" cy="29" r="15.5" fill={`url(#${uid}-muka2)`} />
      <path
        d="M32 20.5v9l6 4"
        stroke={p.gelap}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 10c4-3.4 9-5.2 14-5.2"
        stroke="#FFFFFF"
        strokeOpacity="0.5"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="46" cy="44" r="11" fill={p.sisi} />
      <circle cx="46" cy="42.5" r="11" fill={`url(#${uid}-muka)`} />
      <path
        d="M41 42.5h9m0 0-3.5-3.6m3.5 3.6-3.5 3.6"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="26"
        cy="19"
        rx="9"
        ry="5.5"
        transform="rotate(-28 26 19)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Jam dengan panah keluar — tombol clock out. */
export function IconClockOut(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.amber;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <circle cx="32" cy="32" r="21" fill={p.sisi} />
      <circle cx="32" cy="29" r="21" fill={`url(#${uid}-muka)`} />
      <circle cx="32" cy="29" r="15.5" fill={`url(#${uid}-muka2)`} />
      <path
        d="M32 20.5v9l6 4"
        stroke={p.gelap}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="44" r="11" fill={p.sisi} />
      <circle cx="46" cy="42.5" r="11" fill={`url(#${uid}-muka)`} />
      <path
        d="M51 42.5h-9m0 0 3.5-3.6M42 42.5l3.5 3.6"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="26"
        cy="19"
        rx="9"
        ry="5.5"
        transform="rotate(-28 26 19)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Gigi — identitas klinik gigi, dipakai untuk menu tindakan. */
export function IconTindakan(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.sky;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <path
        d="M20 14c-5 0-8 4.2-8 10.5 0 7 2.4 11.5 4 18.5 1.2 5.4 2 9.5 4.8 9.5 3 0 3.4-4.6 4.6-10 .8-3.6 1.6-5.6 3.6-5.6s2.8 2 3.6 5.6c1.2 5.4 1.6 10 4.6 10 2.8 0 3.6-4.1 4.8-9.5 1.6-7 4-11.5 4-18.5C46 18.2 43 14 38 14c-3.4 0-4.8 1.8-8 1.8S23.4 14 20 14Z"
        fill={p.sisi}
      />
      <path
        d="M20 11c-5 0-8 4.2-8 10.5 0 7 2.4 11.5 4 18.5 1.2 5.4 2 9.5 4.8 9.5 3 0 3.4-4.6 4.6-10 .8-3.6 1.6-5.6 3.6-5.6s2.8 2 3.6 5.6c1.2 5.4 1.6 10 4.6 10 2.8 0 3.6-4.1 4.8-9.5 1.6-7 4-11.5 4-18.5C46 15.2 43 11 38 11c-3.4 0-4.8 1.8-8 1.8S23.4 11 20 11Z"
        fill={`url(#${uid}-muka2)`}
      />
      <path
        d="M20 11c-5 0-8 4.2-8 10.5 0 3 .5 5.6 1.2 8.3 2-1.6 4.6-2.6 7.3-2.6 3.4 0 5.2 1.4 8.5 1.4h.4c-1 .9-1.6 2.4-2.2 4.6"
        fill={p.terang}
        fillOpacity="0.35"
      />
      <ellipse
        cx="22"
        cy="20"
        rx="6"
        ry="8"
        transform="rotate(-16 22 20)"
        fill={`url(#${uid}-kilau)`}
      />
      <circle cx="46" cy="43" r="10.5" fill={p.sisi} />
      <circle cx="46" cy="41.5" r="10.5" fill={`url(#${uid}-muka)`} />
      <path
        d="M41.5 41.7 45 45.2l5.4-6"
        stroke="#FFFFFF"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Bingkai>
  );
}

/** Tumpukan koin — fee & insentif. */
export function IconFee(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.amber;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      {[44, 36, 28].map((cy, i) => (
        <g key={cy}>
          <ellipse cx="32" cy={cy + 4} rx="20" ry="7.5" fill={p.sisi} />
          <rect x="12" y={cy - 1} width="40" height="5" fill={p.gelap} />
          <ellipse
            cx="32"
            cy={cy}
            rx="20"
            ry="7.5"
            fill={i === 2 ? `url(#${uid}-muka)` : p.utama}
          />
          {i === 2 && (
            <>
              <ellipse
                cx="32"
                cy={cy}
                rx="13"
                ry="4.6"
                fill={p.terang}
                fillOpacity="0.5"
              />
              <path
                d="M28 26.6h4.4c1.7 0 2.6.7 2.6 1.8s-.9 1.8-2.6 1.8H28m0-3.6v3.6m0 0v2.4m-1.6-2.4h4.8"
                stroke={p.gelap}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </>
          )}
        </g>
      ))}
      <ellipse
        cx="24"
        cy="25"
        rx="7"
        ry="3"
        transform="rotate(-8 24 25)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Kalender dengan matahari — pengajuan cuti. */
export function IconCuti(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.indigo;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <rect x="10" y="16" width="44" height="38" rx="9" fill={p.sisi} />
      <rect x="10" y="13" width="44" height="38" rx="9" fill={`url(#${uid}-muka)`} />
      <rect x="15" y="24" width="34" height="22" rx="5" fill={`url(#${uid}-muka2)`} />
      <rect x="19" y="6" width="6" height="12" rx="3" fill={p.gelap} />
      <rect x="39" y="6" width="6" height="12" rx="3" fill={p.gelap} />
      <rect x="19" y="5" width="6" height="12" rx="3" fill={p.terang} />
      <rect x="39" y="5" width="6" height="12" rx="3" fill={p.terang} />
      <circle cx="32" cy="35" r="6" fill={PALET.amber.utama} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="32"
          y1="26.5"
          x2="32"
          y2="24"
          stroke={PALET.amber.utama}
          strokeWidth="2.2"
          strokeLinecap="round"
          transform={`rotate(${deg} 32 35)`}
        />
      ))}
      <ellipse
        cx="22"
        cy="19"
        rx="9"
        ry="4"
        transform="rotate(-10 22 19)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Bulan sabit dengan jam — lembur. */
export function IconLembur(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.indigo;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <path
        d="M40 8c-12 2-20 11.6-20 22.6C20 42.4 28.6 52 40 53.4c-13.6 3-26-7-26-21C14 18.8 26 8.6 40 8Z"
        fill={p.sisi}
      />
      <path
        d="M40 6c-12 2-20 11.6-20 22.6C20 40.4 28.6 50 40 51.4c-13.6 3-26-7-26-21C14 16.8 26 6.6 40 6Z"
        fill={`url(#${uid}-muka)`}
      />
      <circle cx="44" cy="40" r="12" fill={p.sisi} />
      <circle cx="44" cy="38.5" r="12" fill={`url(#${uid}-muka)`} />
      <circle cx="44" cy="38.5" r="8.6" fill={`url(#${uid}-muka2)`} />
      <path
        d="M44 32.6v6.2l4 2.6"
        stroke={p.gelap}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="46" cy="13" r="2.2" fill="#FFFFFF" fillOpacity="0.85" />
      <circle cx="53" cy="21" r="1.5" fill="#FFFFFF" fillOpacity="0.6" />
      <ellipse
        cx="24"
        cy="20"
        rx="5"
        ry="9"
        transform="rotate(24 24 20)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Papan jepit dengan centang — antrean persetujuan. */
export function IconApproval(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.teal;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <rect x="13" y="12" width="38" height="43" rx="8" fill={p.sisi} />
      <rect x="13" y="9" width="38" height="43" rx="8" fill={`url(#${uid}-muka)`} />
      <rect x="18" y="16" width="28" height="30" rx="5" fill={`url(#${uid}-muka2)`} />
      <rect x="25" y="4" width="14" height="9" rx="4.5" fill={p.gelap} />
      <rect x="25" y="3" width="14" height="9" rx="4.5" fill={p.terang} />
      <path
        d="M23 25.5h8M23 32h12M23 38.5h6"
        stroke={p.gelap}
        strokeOpacity="0.35"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="45" cy="43" r="11" fill={p.sisi} />
      <circle cx="45" cy="41.5" r="11" fill={`url(#${uid}-muka)`} />
      <path
        d="M40 41.7 43.6 45.3 50 38.6"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="24"
        cy="17"
        rx="7"
        ry="4"
        transform="rotate(-12 24 17)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Dokumen dengan diagram batang — rekap & laporan. */
export function IconLaporan(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.sky;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <rect x="14" y="11" width="36" height="44" rx="8" fill={p.sisi} />
      <rect x="14" y="8" width="36" height="44" rx="8" fill={`url(#${uid}-muka2)`} />
      <rect x="14" y="8" width="36" height="12" rx="8" fill={`url(#${uid}-muka)`} />
      <rect x="14" y="16" width="36" height="4" fill={p.utama} />
      <rect x="21" y="34" width="6" height="11" rx="3" fill={p.utama} />
      <rect x="29" y="28" width="6" height="17" rx="3" fill={PALET.teal.utama} />
      <rect x="37" y="24" width="6" height="21" rx="3" fill={PALET.amber.utama} />
      <ellipse
        cx="24"
        cy="13"
        rx="7"
        ry="3.5"
        transform="rotate(-10 24 13)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Kartu identitas — data karyawan. */
export function IconKaryawan(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.teal;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <rect x="8" y="17" width="48" height="35" rx="9" fill={p.sisi} />
      <rect x="8" y="14" width="48" height="35" rx="9" fill={`url(#${uid}-muka)`} />
      <rect x="13" y="19" width="19" height="25" rx="6" fill={`url(#${uid}-muka2)`} />
      <circle cx="22.5" cy="28" r="4.6" fill={p.utama} />
      <path d="M15 41c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6z" fill={p.utama} />
      <path
        d="M37 25h13M37 32h13M37 39h8"
        stroke="#FFFFFF"
        strokeOpacity="0.85"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <ellipse
        cx="22"
        cy="19"
        rx="9"
        ry="3.5"
        transform="rotate(-8 22 19)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Penanda peta — lokasi & geofence. */
export function IconLokasi(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.rose;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <path
        d="M32 9c-9.4 0-17 7.4-17 16.6 0 11.8 13.6 24 16.1 26.2.5.4 1.3.4 1.8 0C35.4 49.6 49 37.4 49 25.6 49 16.4 41.4 9 32 9Z"
        fill={p.sisi}
      />
      <path
        d="M32 7c-9.4 0-17 7.4-17 16.6 0 11.8 13.6 24 16.1 26.2.5.4 1.3.4 1.8 0C35.4 47.6 49 35.4 49 23.6 49 14.4 41.4 7 32 7Z"
        fill={`url(#${uid}-muka)`}
      />
      <circle cx="32" cy="23" r="8" fill={`url(#${uid}-muka2)`} />
      <circle cx="32" cy="23" r="4" fill={p.utama} />
      <ellipse
        cx="24"
        cy="17"
        rx="5.5"
        ry="7.5"
        transform="rotate(-24 24 17)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Kamera — pengambilan selfie absensi. */
export function IconKamera(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.slate;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <rect x="8" y="21" width="48" height="33" rx="10" fill={p.sisi} />
      <rect x="8" y="18" width="48" height="33" rx="10" fill={`url(#${uid}-muka)`} />
      <rect x="24" y="11" width="16" height="9" rx="4" fill={p.gelap} />
      <circle cx="32" cy="34" r="12" fill={p.sisi} />
      <circle cx="32" cy="34" r="10.5" fill={`url(#${uid}-muka2)`} />
      <circle cx="32" cy="34" r="6.5" fill={PALET.teal.utama} />
      <circle cx="29.5" cy="31.5" r="2.2" fill="#FFFFFF" fillOpacity="0.8" />
      <circle cx="48" cy="25" r="2.4" fill={PALET.amber.utama} />
      <ellipse
        cx="20"
        cy="24"
        rx="8"
        ry="3.5"
        transform="rotate(-8 20 24)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Lonceng — notifikasi & pengumuman. */
export function IconNotifikasi(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.amber;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <path
        d="M32 8c-8.3 0-14 6.2-14 14.8 0 9-2.2 12.4-4.2 14.8-1.2 1.4-.2 3.6 1.7 3.6h33c1.9 0 2.9-2.2 1.7-3.6-2-2.4-4.2-5.8-4.2-14.8C46 14.2 40.3 8 32 8Z"
        fill={p.sisi}
      />
      <path
        d="M32 6c-8.3 0-14 6.2-14 14.8 0 9-2.2 12.4-4.2 14.8-1.2 1.4-.2 3.6 1.7 3.6h33c1.9 0 2.9-2.2 1.7-3.6-2-2.4-4.2-5.8-4.2-14.8C46 12.2 40.3 6 32 6Z"
        fill={`url(#${uid}-muka)`}
      />
      <path d="M25 43h14c0 4.4-3.1 7.5-7 7.5S25 47.4 25 43Z" fill={p.gelap} />
      <circle cx="32" cy="5" r="3.6" fill={p.terang} />
      <ellipse
        cx="24"
        cy="18"
        rx="5"
        ry="8"
        transform="rotate(-14 24 18)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Kalender dengan jam — riwayat kehadiran. */
export function IconRiwayat(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.teal;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <rect x="9" y="15" width="42" height="38" rx="9" fill={p.sisi} />
      <rect x="9" y="12" width="42" height="38" rx="9" fill={`url(#${uid}-muka)`} />
      <rect x="14" y="23" width="32" height="22" rx="5" fill={`url(#${uid}-muka2)`} />
      <rect x="18" y="5" width="6" height="12" rx="3" fill={p.gelap} />
      <rect x="36" y="5" width="6" height="12" rx="3" fill={p.gelap} />
      <rect x="18" y="4" width="6" height="12" rx="3" fill={p.terang} />
      <rect x="36" y="4" width="6" height="12" rx="3" fill={p.terang} />
      <circle cx="45" cy="43" r="11" fill={p.sisi} />
      <circle cx="45" cy="41.5" r="11" fill={`url(#${uid}-muka)`} />
      <path
        d="M45 35.4v6.4l4.2 2.6"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="21"
        cy="18"
        rx="8"
        ry="3.5"
        transform="rotate(-10 21 18)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}

/** Perisai — keamanan & audit. */
export function IconKeamanan(props: Icon3DProps) {
  const uid = useId().replace(/:/g, "");
  const p = PALET.teal;
  return (
    <Bingkai {...props} uid={uid} palet={p}>
      <path
        d="M32 7 15 13.4v14.2C15 39.4 22.2 49.6 32 54c9.8-4.4 17-14.6 17-26.4V13.4L32 7Z"
        fill={p.sisi}
      />
      <path
        d="M32 5 15 11.4v14.2C15 37.4 22.2 47.6 32 52c9.8-4.4 17-14.6 17-26.4V11.4L32 5Z"
        fill={`url(#${uid}-muka)`}
      />
      <path
        d="M24 27.5 30 33.5 41 21.5"
        stroke="#FFFFFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="23"
        cy="16"
        rx="5.5"
        ry="8"
        transform="rotate(-18 23 16)"
        fill={`url(#${uid}-kilau)`}
      />
    </Bingkai>
  );
}
