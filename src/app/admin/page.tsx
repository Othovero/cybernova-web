import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, ShieldAlert, Clock, CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import { adminClient } from "@/lib/supabase/admin";

const STATUS_BADGE: Record<string, string> = {
  Pending:       "bg-pending/10 text-pending",
  Assigned:      "bg-nova-100 text-nova-500",
  "In Progress": "bg-secure/10 text-secure",
  Resolved:      "bg-navy-100 text-navy-700",
  Archived:      "bg-gray-100 text-gray-500",
};

export const revalidate = 30;

export default async function AdminDashboard() {
  const [
    { count: total },
    { count: active },
    { count: resolvedWeek },
    { data: recent },
  ] = await Promise.all([
    adminClient.from("tickets").select("*", { count: "exact", head: true }).neq("status", "Archived"),
    adminClient.from("tickets").select("*", { count: "exact", head: true }).in("status", ["Pending", "Assigned", "In Progress"]),
    adminClient.from("tickets").select("*", { count: "exact", head: true }).eq("status", "Resolved")
      .gte("updated_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    adminClient.from("tickets")
      .select("ref, organisation, issue_type, status, profiles:assigned_to(full_name)")
      .neq("status", "Archived")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const STATS = [
    { label: "Open Tickets",       value: String(total ?? 0),         icon: Ticket,       color: "text-nova-500", bg: "bg-nova-100" },
    { label: "Active Incidents",   value: String(active ?? 0),        icon: ShieldAlert,  color: "text-threat",   bg: "bg-threat/10" },
    { label: "Avg Response (est)", value: "< 2h",                     icon: Clock,        color: "text-pending",  bg: "bg-pending/10" },
    { label: "Resolved This Week", value: String(resolvedWeek ?? 0),  icon: CheckCircle2, color: "text-secure",   bg: "bg-secure/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-text-muted text-sm mt-1">Overview of all service requests and team activity.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-text-muted font-medium">{s.label}</p>
                  <div className={`p-2 rounded-lg ${s.bg}`}><Icon size={14} className={s.color} /></div>
                </div>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-navy-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-nova-500" /> Recent Tickets
            </h2>
            <a href="/admin/tickets" className="inline-flex items-center gap-1 text-xs text-nova-500 hover:text-nova-400 font-semibold">
              View all <ArrowRight size={12} />
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wide">
                  {["Ref", "Organisation", "Issue Type", "Status", "Assigned"].map((h) => (
                    <th key={h} className="text-left pb-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(recent ?? []).map((t) => (
                  <tr key={t.ref} className="hover:bg-surface transition-colors">
                    <td className="py-3 font-mono text-xs font-semibold text-navy-700">{t.ref}</td>
                    <td className="py-3 text-navy-900">{t.organisation}</td>
                    <td className="py-3 text-text-muted">{t.issue_type}</td>
                    <td className="py-3">
                      <Badge className={`text-xs ${STATUS_BADGE[t.status] ?? ""}`}>{t.status}</Badge>
                    </td>
                    <td className="py-3 text-text-muted">
                      {(() => { const p = t.profiles as unknown; return Array.isArray(p) ? (p[0] as {full_name:string}|undefined)?.full_name ?? "—" : (p as {full_name:string}|null)?.full_name ?? "—"; })()}
                    </td>
                  </tr>
                ))}
                {(!recent || recent.length === 0) && (
                  <tr><td colSpan={5} className="py-8 text-center text-text-muted text-sm">No tickets yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
