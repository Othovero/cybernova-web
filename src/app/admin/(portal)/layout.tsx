import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Admin — CyberNova Analytics" };

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AdminShell userEmail={user?.email ?? "—"}>
      {children}
    </AdminShell>
  );
}
