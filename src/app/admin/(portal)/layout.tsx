import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Admin — CyberNova Analytics" };

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex bg-surface">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-border px-6 py-3 flex items-center shrink-0 h-[72px]">
          <p className="text-xs text-text-muted">
            Logged in as{" "}
            <span className="font-semibold text-navy-900">{user?.email ?? "—"}</span>
            <span className="ml-3 inline-flex items-center gap-1 text-secure font-medium">
              <ShieldCheck size={12} /> MFA Verified
            </span>
          </p>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
