import { adminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import TicketFilters from "@/components/admin/TicketFilters";

const STATUS_BADGE: Record<string, string> = {
  Pending:       "bg-pending/10 text-pending",
  Assigned:      "bg-nova-100 text-nova-500",
  "In Progress": "bg-secure/10 text-secure",
  Resolved:      "bg-navy-100 text-navy-700",
  Archived:      "bg-gray-100 text-gray-500",
};

export const revalidate = 0;

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { status?: string; issue_type?: string; country?: string; q?: string };
}) {
  let query = adminClient
    .from("tickets")
    .select("id, ref, full_name, organisation, country, issue_type, status, created_at, profiles:assigned_to(full_name)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (searchParams.status)     query = query.eq("status", searchParams.status);
  if (searchParams.issue_type) query = query.eq("issue_type", searchParams.issue_type);
  if (searchParams.country)    query = query.eq("country", searchParams.country);

  const { data: tickets } = await query;

  const filtered = searchParams.q
    ? (tickets ?? []).filter((t) => {
        const q = searchParams.q!.toLowerCase();
        return t.ref.toLowerCase().includes(q) ||
               t.organisation.toLowerCase().includes(q) ||
               t.full_name.toLowerCase().includes(q);
      })
    : (tickets ?? []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Tickets</h1>
          <p className="text-text-muted text-sm mt-1">All service requests — filter, assign, and update.</p>
        </div>
        <a
          href={`/api/admin/tickets/export`}
          className="inline-flex items-center gap-2 text-sm border border-border rounded-lg px-3 h-9 hover:bg-surface transition-colors"
        >
          <Download size={14} /> Export CSV
        </a>
      </div>

      <TicketFilters />

      <Card className="border-border">
        <CardContent className="pt-0 px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wide">
                  {["Ref", "Name", "Organisation", "Country", "Issue Type", "Status", "Assigned", "Date"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((t) => (
                  <tr key={t.ref} className="hover:bg-surface transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-navy-700">{t.ref}</td>
                    <td className="px-5 py-3 text-navy-900">{t.full_name}</td>
                    <td className="px-5 py-3 text-navy-900">{t.organisation}</td>
                    <td className="px-5 py-3 text-text-muted">{t.country}</td>
                    <td className="px-5 py-3 text-text-muted">{t.issue_type}</td>
                    <td className="px-5 py-3">
                      <Badge className={`text-xs ${STATUS_BADGE[t.status] ?? ""}`}>{t.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {(() => { const p = t.profiles as unknown; return Array.isArray(p) ? (p[0] as {full_name:string}|undefined)?.full_name ?? "—" : (p as {full_name:string}|null)?.full_name ?? "—"; })()}
                    </td>
                    <td className="px-5 py-3 text-text-muted text-xs">
                      {new Date(t.created_at).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-5 py-10 text-center text-text-muted">No tickets found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
