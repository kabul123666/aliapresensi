import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FormMasuk } from "@/features/auth/form-masuk";
import { ambilPengguna, PERAN_ADMIN } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Masuk" };

export default async function HalamanMasuk() {
  const pengguna = await ambilPengguna();
  if (pengguna) redirect(PERAN_ADMIN.includes(pengguna.role) ? "/admin" : "/");
  return <FormMasuk />;
}
