"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Users, ShieldCheck, ShieldAlert, Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export interface Profile {
  id: string;
  full_name: string | null;
  role: string;
}

export interface AuditEntry {
  id: string;
  email: string;
  ip_address: string | null;
  success: boolean;
  failure_reason: string | null;
  attempted_at: string;
}

const ROLE_BADGE: Record<string, string> = {
  admin:    "bg-nova-100 text-nova-500",
  manager:  "bg-navy-100 text-navy-700",
  analyst:  "bg-surface text-text-muted border border-border",
};

export function TeamClient({
  profiles,
  auditLog,
}: {
  profiles: Profile[];
  auditLog: AuditEntry[];
}) {
  const [rows, setRows]     = useState<Profile[]>(profiles);
  const [saving, setSaving] = useState<string | null>(null);

  async function handleRoleChange(id: string, role: string) {
    setSaving(id);
    const res = await fetch("/api/admin/team", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, role }),
    });
    if (res.ok) {
      setRows((prev) => prev.map((p) => (p.id === id ? { ...p, role } : p)));
      toast.success("Role updated");
    } else {
      toast.error("Failed to update role");
    }
    setSaving(null);
  }

  return (
    <div className="space-y-8">
      {/* Team roster */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <h2 className="font-bold text-navy-900 flex items-center gap-2">
            <Users size={16} className="text-nova-500" /> Team Members &amp; Roles
          </h2>
          <p className="text-xs text-text-muted">
            Admin accounts cannot be demoted. Manager and Analyst roles can be changed at any time.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wide">
                  {["Name", "Role", "Change Role"].map((h) => (
                    <th key={h} className="text-left pb-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((p) => (
                  <tr key={p.id} className="hover:bg-surface transition-colors">
                    <td className="py-3 font-medium text-navy-900">{p.full_name ?? "—"}</td>
                    <td className="py-3">
                      <Badge className={`text-xs capitalize ${ROLE_BADGE[p.role] ?? ROLE_BADGE.analyst}`}>
                        {p.role}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {p.role === "admin" ? (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <ShieldCheck size={12} className="text-secure" /> Protected
                        </span>
                      ) : (
                        <select
                          value={p.role}
                          disabled={saving === p.id}
                          onChange={(e) => handleRoleChange(p.id, e.target.value)}
                          className="text-xs border border-border rounded-md px-2 py-1 bg-white text-navy-900 focus:outline-none focus:ring-1 focus:ring-nova-500 disabled:opacity-50"
                        >
                          <option value="analyst">Analyst</option>
                          <option value="manager">Manager</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Login audit log */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <h2 className="font-bold text-navy-900 flex items-center gap-2">
            <ShieldAlert size={16} className="text-nova-500" /> Login Attempt Audit Log
          </h2>
          <p className="text-xs text-text-muted">Last 50 login attempts — IP address, outcome, and timestamp recorded.</p>
        </CardHeader>
        <CardContent>
          {auditLog.length === 0 ? (
            <p className="text-center text-text-muted text-sm py-8">
              No login attempts recorded yet. Attempts are logged after the next sign-in.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wide">
                    {["Email", "IP Address", "Outcome", "Reason", "Timestamp"].map((h) => (
                      <th key={h} className="text-left pb-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {auditLog.map((entry) => (
                    <tr key={entry.id} className="hover:bg-surface transition-colors">
                      <td className="py-3 font-mono text-xs text-navy-700">{entry.email}</td>
                      <td className="py-3 font-mono text-xs text-text-muted">{entry.ip_address ?? "—"}</td>
                      <td className="py-3">
                        {entry.success ? (
                          <span className="inline-flex items-center gap-1 text-xs text-secure font-medium">
                            <CheckCircle2 size={12} /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-threat font-medium">
                            <XCircle size={12} /> Failed
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-xs text-text-muted">{entry.failure_reason ?? "—"}</td>
                      <td className="py-3 text-xs text-text-muted whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(entry.attempted_at).toLocaleString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit", second: "2-digit",
                          })}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
