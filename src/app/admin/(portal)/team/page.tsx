import { adminClient } from "@/lib/supabase/admin";
import { TeamClient } from "./TeamClient";
import type { Profile, AuditEntry } from "./TeamClient";

export const revalidate = 0;

export default async function TeamPage() {
  const [{ data: profiles }, { data: auditLog }] = await Promise.all([
    adminClient
      .from("profiles")
      .select("id, full_name, role")
      .order("role", { ascending: true })
      .order("full_name", { ascending: true }),
    adminClient
      .from("login_audit_log")
      .select("id, email, ip_address, success, failure_reason, attempted_at")
      .order("attempted_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Team &amp; Access</h1>
        <p className="text-text-muted text-sm mt-1">
          Manage team member roles and review all admin login activity.
        </p>
      </div>
      <TeamClient
        profiles={(profiles ?? []) as Profile[]}
        auditLog={(auditLog ?? []) as AuditEntry[]}
      />
    </div>
  );
}
