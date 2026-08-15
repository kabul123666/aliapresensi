import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import { IconApproval, IconCuti, IconLembur, IconRiwayat } from "@/components/icons3d";
import { BadgePengajuan } from "@/components/ui/status";
import { getDb } from "@/db/client";
import { leaveBalances, leaveTypes, requests, type RequestType } from "@/db/schema";
import { TombolBatal } from "@/features/requests/tombol-batal";
import { wajibMasuk } from "@/lib/auth/session";
import { tanggalPendek, tanggalWIB } from "@/lib/waktu";

export const metadata = { title: "Pengajuan" };

const LABEL_TIPE: Record<RequestType, string> = {
  LEAVE: "Cuti",
  OVERTIME: "Lembur",
  BACKDATE: "Koreksi Absen",
  PERMIT: "Izin",
  OUTSIDE_AREA: "Absen Luar Area",
  DEVICE_CHANGE: "Ganti Perangkat",
};

export default async function HalamanPengajuan() {
  const pengguna = await wajibMasuk();
  const db = await getDb();
  const tahun = Number(tanggalWIB().slice(0, 4));

  const [daftar, saldo] = await Promise.all([
    db
      .select()
      .from(requests)
      .where(eq(requests.employeeId, pengguna.employeeId))
      .orderBy(desc(requests.createdAt))
      .limit(30),
    db
      .select({
        nama: leaveTypes.nama,
        kuota: leaveBalances.kuota,
        carryOver: leaveBalances.carryOverMasuk,
        terpakai: leaveBalances.terpakai,
        pending: leaveBalances.pending,
      })
      .from(leaveBalances)
      .innerJoin(leaveTypes, eq(leaveTypes.id, leaveBalances.leaveTypeId))
      .where(eq(leaveBalances.employeeId, pengguna.employeeId)),
  ]);

  const cutiTahunan = saldo.find((s) => s.nama === "Cuti Tahunan");
  const sisaCuti = cutiTahunan
    ? cutiTahunan.kuota +
      cutiTahunan.carryOver -
      cutiTahunan.terpakai -
      cutiTahunan.pending
    : 0;

  const jenisAjuan = [
    { href: "/pengajuan/cuti", label: "Ajukan Cuti", Ikon: IconCuti },
    { href: "/pengajuan/lembur", label: "Ajukan Lembur", Ikon: IconLembur },
    { href: "/pengajuan/koreksi", label: "Koreksi Absen", Ikon: IconRiwayat },
    { href: "/pengajuan/izin", label: "Izin / Sakit", Ikon: IconApproval },
  ];

  return (
    <div className="pb-6">
      <header className="bg-surface border-app pt-safe border-b px-5 pb-16">
        <h1 className="text-body pt-4 text-[19px] font-extrabold">Pengajuan</h1>
        <p className="text-subtle mt-0.5 text-xs">Cuti, lembur, dan koreksi kehadiran</p>
      </header>

      {/* Saldo cuti */}
      <div className="-mt-12 px-5">
        <div className="bg-surface rounded-[var(--radius-sheet)] p-5 shadow-[var(--shadow-raised)]">
          <p className="text-subtle text-xs font-semibold">Sisa cuti tahunan {tahun}</p>
          <p className="tnum text-body mt-1 text-[32px] leading-none font-extrabold">
            {sisaCuti} <span className="text-muted text-base font-bold">hari</span>
          </p>
          {cutiTahunan && (
            <div className="border-app text-muted mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center text-[11px]">
              <div>
                <p className="text-body tnum text-sm font-extrabold">
                  {cutiTahunan.kuota}
                </p>
                <p className="mt-0.5">Kuota</p>
              </div>
              <div>
                <p className="text-body tnum text-sm font-extrabold">
                  +{cutiTahunan.carryOver}
                </p>
                <p className="mt-0.5">Sisa tahun lalu</p>
              </div>
              <div>
                <p className="text-body tnum text-sm font-extrabold">
                  {cutiTahunan.terpakai}
                </p>
                <p className="mt-0.5">Terpakai</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Jenis pengajuan */}
      <section className="mt-6 px-5">
        <h2 className="text-body text-sm font-extrabold tracking-tight">
          Buat pengajuan
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          {jenisAjuan.map(({ href, label, Ikon }) => (
            <Link
              key={href}
              href={href}
              className="bg-surface border-app hover:border-brand-300 flex items-center gap-3 rounded-[var(--radius-card)] border px-3.5 py-3.5 transition-colors"
            >
              <Ikon size={36} />
              <span className="text-body text-[13px] leading-tight font-bold">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Riwayat pengajuan */}
      <section className="mt-6 px-5">
        <h2 className="text-body text-sm font-extrabold tracking-tight">
          Riwayat pengajuan
        </h2>

        {daftar.length === 0 ? (
          <div className="border-app bg-surface mt-3 rounded-[var(--radius-card)] border border-dashed px-5 py-10 text-center">
            <p className="text-body text-sm font-bold">Belum ada pengajuan</p>
            <p className="text-muted mt-1 text-[13px]">
              Pengajuan yang Anda buat akan muncul di sini.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {daftar.map((r) => (
              <li
                key={r.id}
                className="bg-surface border-app flex items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-body text-sm font-bold">{LABEL_TIPE[r.tipe]}</p>
                  <p className="text-subtle mt-0.5 truncate text-[12px]">
                    {tanggalPendek(tanggalWIB(r.createdAt))}
                    {r.alasan ? ` · ${r.alasan}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.status === "PENDING" && (
                    <TombolBatal id={r.id} label={LABEL_TIPE[r.tipe]} />
                  )}
                  <BadgePengajuan status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
