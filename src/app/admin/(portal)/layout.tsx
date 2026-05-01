import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, LogOut } from "lucide-react";

export const metadata: Metadata = { title: "Admin — CyberNova Analytics" };

export default async function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex bg-surface">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
          <p className="text-xs text-text-muted">
            Logged in as{" "}
            <span className="font-semibold text-navy-900">{user?.email ?? "—"}</span>
            <span className="ml-2 inline-flex items-center gap-1 text-secure font-medium">
              <ShieldCheck size={12} /> MFA Verified
            </span>
          </p>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-threat transition-colors"
            >
              <LogOut size={13} /> Sign out
            </button>
          </form>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
