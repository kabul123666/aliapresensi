import Link from "next/link";

import { daftarDepartemen, daftarLokasi } from "@/features/master/service";
import { PanelCuti, type BarisJenisCuti } from "@/features/settings/panel-cuti";
import { PanelLibur } from "@/features/settings/panel-libur";
import {
  PanelPersetujuan,
  type BarisAturan,
} from "@/features/settings/panel-persetujuan";
import { PanelTutupTahun } from "@/features/settings/panel-tutup-tahun";
import { PanelUmum } from "@/features/settings/panel-umum";
import {
  bacaPengaturan,
  daftarAturanPersetujuan,
  daftarHariLibur,
  daftarJenisCuti,
  daftarPencairan,
  kandidatPenyetuju,
  semuaPengaturan,
  sisaCutiTahunan,
  statusTutupTahun,
} from "@/features/settings/service";
import { PERAN_ADMIN, wajibPeran } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { tanggalPanjang, tanggalWIB } from "@/lib/waktu";

export const metadata = { title: "Pengaturan" };

const TAB = [
  { nilai: "umum", label: "Umum" },
  { nilai: "cuti", label: "Cuti" },
  { nilai: "persetujuan", label: "Aturan Persetujuan" },
  { nilai: "libur", label: "Hari Libur" },
  { nilai: "tutup-tahun", label: "Tutup Tahun" },
] as const;

type Tab = (typeof TAB)[number]["nilai"];

export default async function HalamanPengaturan({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await wajibPeran(...PERAN_ADMIN);
  const sp = await searchParams;
  const tab = (TAB.find((t) => t.nilai === sp.tab)?.nilai ?? "umum") as Tab;

  const tahunIni = Number(tanggalWIB().slice(0, 4));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-body text-2xl font-extrabold tracking-tight">Pengaturan</h1>
        <p className="text-muted mt-1 max-w-2xl text-sm">
          Seluruh kebijakan operasional diatur di sini — tidak ada angka yang ditanam di
          dalam kode. Setiap perubahan tercatat di audit log.
        </p>
      </div>

      <div className="border-app flex gap-1 overflow-x-auto border-b">
        {TAB.map((t) => (
          <Link
            key={t.nilai}
            href={`/admin/pengaturan?tab=${t.nilai}`}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors",
              t.nilai === tab
                ? "border-brand-600 text-brand-700 dark:text-brand-300"
                : "text-muted hover:text-body border-transparent",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "umum" && <TabUmum />}
      {tab === "cuti" && <TabCuti />}
      {tab === "persetujuan" && <TabPersetujuan />}
      {tab === "libur" && <TabLibur tahun={tahunIni} />}
      {tab === "tutup-tahun" && <TabTutupTahun tahun={tahunIni} />}
    </div>
  );
}

async function TabUmum() {
  const { profil, absensi } = await semuaPengaturan();
  return <PanelUmum profil={profil} absensi={absensi} />;
}

async function TabCuti() {
  const [kebijakan, jenis] = await Promise.all([
    bacaPengaturan("kebijakan_cuti"),
    daftarJenisCuti(),
  ]);
  return (
    <PanelCuti
      kebijakan={kebijakan}
      jenisCuti={jenis.map((j): BarisJenisCuti => ({
        id: j.id,
        nama: j.nama,
        kuotaDefault: j.kuotaDefault,
        berbayar: j.berbayar,
        butuhLampiran: j.butuhLampiran,
        bolehCarryOver: j.bolehCarryOver,
        bolehDiuangkan: j.bolehDiuangkan,
        maxCarryOverHari: j.maxCarryOverHari,
        tglKedaluwarsaCarry: j.tglKedaluwarsaCarry,
      }))}
    />
  );
}

async function TabPersetujuan() {
  const [aturan, departemen, lokasi, kandidat] = await Promise.all([
    daftarAturanPersetujuan(),
    daftarDepartemen(),
    daftarLokasi(),
    kandidatPenyetuju(),
  ]);

  return (
    <PanelPersetujuan
      aturan={aturan as BarisAturan[]}
      departemen={departemen.map((d) => ({ id: d.id, nama: d.nama }))}
      lokasi={lokasi.map((l) => ({ id: l.id, nama: l.nama }))}
      kandidat={kandidat}
    />
  );
}

async function TabLibur({ tahun }: { tahun: number }) {
  const daftar = await daftarHariLibur(tahun);
  return (
    <PanelLibur
      tahun={tahun}
      daftar={daftar.map((h) => ({ id: h.id, tanggal: h.tanggal, nama: h.nama }))}
    />
  );
}

async function TabTutupTahun({ tahun }: { tahun: number }) {
  const [daftar, jenis, kebijakan, status, pencairan] = await Promise.all([
    sisaCutiTahunan(tahun),
    daftarJenisCuti(),
    bacaPengaturan("kebijakan_cuti"),
    statusTutupTahun(tahun),
    daftarPencairan(tahun),
  ]);

  const cutiTahunan = jenis.find((j) => j.nama === "Cuti Tahunan");

  return (
    <PanelTutupTahun
      tahun={tahun}
      daftar={daftar}
      maxCarryOver={cutiTahunan?.maxCarryOverHari ?? 0}
      bolehDiuangkan={cutiTahunan?.bolehDiuangkan ?? false}
      tarifPerHari={kebijakan.tarifPencairanPerHari}
      sudahDitutup={
        status
          ? {
              dijalankanAt: tanggalPanjang(tanggalWIB(status.dijalankanAt)),
              ringkasan: status.ringkasan,
            }
          : null
      }
      ringkasanTutup={pencairan.map((p) => ({
        nama: p.nama,
        jumlahHari: p.jumlahHari,
        totalNominal: p.totalNominal,
      }))}
    />
  );
}
