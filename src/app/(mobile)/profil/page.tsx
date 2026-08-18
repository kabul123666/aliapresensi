import Link from "next/link";
import { eq } from "drizzle-orm";
import { AtSign, Building2, IdCard, LogOut, MapPin, Phone, Shield } from "lucide-react";

import { PilihTema } from "@/components/mobile/pilih-tema";
import { Button } from "@/components/ui/button";
import { getDb } from "@/db/client";
import { departments, employees } from "@/db/schema";
import { aksiKeluar } from "@/features/auth/actions";
import { FormGantiPassword } from "@/features/employees/form-ganti-password";
import { wajibMasuk } from "@/lib/auth/session";
import { tanggalPanjang } from "@/lib/waktu";

export const metadata = { title: "Profil" };

const LABEL_PERAN: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin / HRD",
  MANAGER: "Kepala Unit",
  KARYAWAN: "Karyawan",
};

export default async function HalamanProfil() {
  const pengguna = await wajibMasuk();
  const db = await getDb();

  const [detail] = await db
    .select({
      noHp: employees.noHp,
      tanggalMasuk: employees.tanggalMasuk,
      tipeKaryawan: employees.tipeKaryawan,
      deviceFingerprint: employees.deviceFingerprint,
      departemen: departments.nama,
    })
    .from(employees)
    .leftJoin(departments, eq(departments.id, employees.departmentId))
    .where(eq(employees.id, pengguna.employeeId))
    .limit(1);

  const baris = [
    { Ikon: IdCard, label: "NIK / NIP", nilai: pengguna.nik ?? "—" },
    { Ikon: AtSign, label: "Username", nilai: pengguna.username },
    { Ikon: Phone, label: "Nomor HP", nilai: detail?.noHp ?? "—" },
    { Ikon: Building2, label: "Departemen", nilai: detail?.departemen ?? "—" },
    { Ikon: MapPin, label: "Lokasi kerja", nilai: pengguna.namaLokasi ?? "—" },
    {
      Ikon: Shield,
      label: "Perangkat terikat",
      nilai: detail?.deviceFingerprint ?? "Belum ada",
    },
  ];

  return (
    <div className="pb-6">
      <header className="bg-surface border-app pt-safe border-b px-5 pb-16">
        <div className="flex items-center gap-4 pt-4">
          <div className="text-body grid size-16 shrink-0 place-items-center rounded-full bg-white/12 text-2xl font-extrabold ring-1 ring-white/20">
            {pengguna.nama.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-body truncate text-[19px] leading-tight font-extrabold">
              {pengguna.nama}
            </h1>
            <p className="text-muted mt-0.5 truncate text-[13px]">
              {pengguna.namaJabatan ?? "—"}
            </p>
            <span className="text-body mt-1.5 inline-block rounded-full bg-white/12 px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-white/20">
              {LABEL_PERAN[pengguna.role] ?? pengguna.role}
            </span>
          </div>
        </div>
      </header>

      <div className="-mt-12 space-y-4 px-5">
        <div className="bg-surface rounded-[var(--radius-sheet)] p-5 shadow-[var(--shadow-raised)]">
          <h2 className="text-body text-sm font-extrabold tracking-tight">
            Data kepegawaian
          </h2>
          <dl className="mt-4 space-y-3.5">
            {baris.map(({ Ikon, label, nilai }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="bg-surface-muted text-muted grid size-9 shrink-0 place-items-center rounded-xl">
                  <Ikon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <dt className="text-subtle text-[11px] font-semibold">{label}</dt>
                  <dd className="text-body mt-0.5 truncate text-sm font-semibold">
                    {nilai}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          {detail?.tanggalMasuk && (
            <p className="border-app text-subtle mt-4 border-t pt-3 text-xs">
              Bergabung sejak {tanggalPanjang(detail.tanggalMasuk)} ·{" "}
              {detail.tipeKaryawan}
            </p>
          )}
        </div>

        <div className="bg-surface border-app rounded-[var(--radius-card)] border p-5">
          <h2 className="text-body text-sm font-extrabold tracking-tight">Keamanan</h2>
          <p className="text-muted mt-1 text-[13px]">
            Ganti password secara berkala, terutama bila akun ini masih memakai password
            bawaan dari admin.
          </p>
          <FormGantiPassword />
        </div>

        <div className="bg-surface border-app rounded-[var(--radius-card)] border p-5">
          <h2 className="text-body text-sm font-extrabold tracking-tight">Tampilan</h2>
          <p className="text-muted mt-1 text-[13px]">
            Mode gelap membantu saat bertugas shift malam.
          </p>
          <PilihTema />
        </div>

        {(pengguna.role === "ADMIN" || pengguna.role === "SUPER_ADMIN") && (
          <Link href="/admin" className="block">
            <div className="from-brand-600 to-brand-800 flex items-center justify-between rounded-[var(--radius-card)] bg-gradient-to-br px-5 py-4 shadow-[var(--shadow-brand)]">
              <div>
                <p className="text-body text-sm font-extrabold">Dashboard Admin</p>
                <p className="text-muted mt-0.5 text-xs">
                  Monitoring, rekap, dan persetujuan
                </p>
              </div>
              <span className="text-body text-lg">→</span>
            </div>
          </Link>
        )}

        <form action={aksiKeluar}>
          <Button type="submit" variant="outline" size="lg" className="w-full">
            <LogOut size={18} /> Keluar dari akun
          </Button>
        </form>

        <p className="text-subtle pt-2 text-center text-[11px]">
          Presensi Karyawan v0.1
        </p>
      </div>
    </div>
  );
}
