import { adminClient } from "@/lib/supabase/admin";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Clock, User, AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  Pending:       "bg-pending/10 text-pending border-pending/20",
  Assigned:      "bg-nova-100 text-nova-500 border-nova-500/20",
  "In Progress": "bg-secure/10 text-secure border-secure/20",
  Resolved:      "bg-navy-100 text-navy-700 border-navy-700/20",
  Archived:      "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function TrackPage({ params }: { params: { token: string } }) {
  noStore();

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(params.token)) notFound();

  const { data: ticket } = await adminClient
    .from("tickets")
    .select(`
      id, ref, status, issue_type, full_name, organisation, country,
      created_at, updated_at, assigned_to,
      profiles:assigned_to ( full_name )
    `)
    .eq("tracking_token", params.token)
    .single();

  if (!ticket) notFound();

  const { data: history } = await adminClient
    .from("ticket_history")
    .select("status, note, created_at")
    .eq("ticket_id", ticket.id)
    .order("created_at", { ascending: true });

  const profilesRaw = ticket.profiles as unknown;
  const assignedName = Array.isArray(profilesRaw)
    ? (profilesRaw[0] as { full_name: string } | undefined)?.full_name ?? "—"
    : (profilesRaw as { full_name: string } | null)?.full_name ?? "—";

  function fmt(iso: string) {
    return new Date(iso).toLocaleString("en-GB", {
      dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
    }) + " UTC";
  }

  return (
    <section className="min-h-screen bg-surface py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck size={24} className="text-nova-500" />
          <div>
            <p className="text-xs text-text-muted tracking-widest uppercase font-semibold">Ticket Tracking</p>
            <h1 className="text-2xl font-bold text-navy-900">{ticket.ref}</h1>
          </div>
          <div className="ml-auto">
            <Badge className={`border text-sm px-3 py-1 ${STATUS_STYLES[ticket.status] ?? ""}`}>
              {ticket.status}
            </Badge>
          </div>
        </div>

        <Card className="border-border mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Issue Type",   ticket.issue_type],
                ["Submitted By", ticket.full_name],
                ["Organisation", ticket.organisation],
                ["Country",      ticket.country],
                ["Submitted",    fmt(ticket.created_at)],
                ["Last Updated", fmt(ticket.updated_at)],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="font-medium text-navy-900">{value}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center gap-3 text-sm">
              <User size={16} className="text-nova-500 shrink-0" />
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wide font-medium mb-0.5">Assigned To</p>
                <p className="font-semibold text-navy-900">{assignedName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {history && history.length > 0 && (
          <Card className="border-border">
            <CardContent className="pt-6">
              <h2 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                <Clock size={14} className="text-nova-500" /> Status History
              </h2>
              <div className="space-y-5">
                {history.map((h, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-nova-500 mt-1 shrink-0" />
                      {i < history.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-semibold text-text-muted">{fmt(h.created_at)}</span>
                        <Badge className={`text-xs border ${STATUS_STYLES[h.status] ?? ""}`}>{h.status}</Badge>
                      </div>
                      {h.note && <p className="text-sm text-navy-900">{h.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-xs text-text-muted text-center mt-6 flex items-center justify-center gap-1.5">
          <AlertTriangle size={12} />
          This page is accessible only via your unique tracking link. Do not share it.
        </p>
      </div>
    </section>
  );
}
