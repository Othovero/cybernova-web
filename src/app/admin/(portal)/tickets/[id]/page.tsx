import { notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { TicketWorkflow } from "@/components/admin/TicketWorkflow";
import {
  ArrowLeft, User, Building2, Globe, Phone, Mail, Briefcase,
  ShieldAlert, FileText, Sparkles, Paperclip, Clock, CheckCircle2,
} from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  Pending:       "bg-pending/10 text-pending",
  Assigned:      "bg-nova-100 text-nova-500",
  "In Progress": "bg-cyan-50 text-cyan-700",
  Resolved:      "bg-secure/10 text-secure",
  Archived:      "bg-gray-100 text-gray-500",
};

export const revalidate = 0;

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
  const [
    { data: ticket },
    { data: history },
    { data: profiles },
  ] = await Promise.all([
    adminClient
      .from("tickets")
      .select("*, profiles:assigned_to(id, full_name, role)")
      .eq("id", params.id)
      .single(),
    adminClient
      .from("ticket_history")
      .select("id, status, note, created_at, changer:changed_by(full_name)")
      .eq("ticket_id", params.id)
      .order("created_at", { ascending: false }),
    adminClient
      .from("profiles")
      .select("id, full_name, role")
      .order("full_name"),
  ]);

  if (!ticket) notFound();

  // Generate signed download URL for attachment if present
  let attachmentUrl: string | null = null;
  if (ticket.attachment_path) {
    const { data: signed } = await adminClient.storage
      .from("ticket-attachments")
      .createSignedUrl(ticket.attachment_path, 3600);
    attachmentUrl = signed?.signedUrl ?? null;
  }

  const assigned = (() => {
    const p = ticket.profiles as unknown;
    return Array.isArray(p) ? (p[0] as { id: string; full_name: string | null } | undefined) ?? null
      : (p as { id: string; full_name: string | null } | null);
  })();

  return (
    <div className="max-w-5xl space-y-6">

      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/admin/tickets" className="mt-1 text-text-muted hover:text-navy-900 transition-colors shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-navy-900 font-mono">{ticket.ref}</h1>
            <Badge className={`text-xs ${STATUS_STYLES[ticket.status] ?? ""}`}>{ticket.status}</Badge>
            {assigned && (
              <span className="text-xs text-text-muted bg-surface border border-border rounded-full px-2.5 py-0.5">
                Assigned to {assigned.full_name ?? "—"}
              </span>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1">
            Submitted {new Date(ticket.created_at).toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Ticket info ───────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Submitter */}
          <div className="bg-white border border-border rounded-xl p-5 space-y-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Submitter Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: User,      label: "Full Name",    value: ticket.full_name },
                { icon: Mail,      label: "Email",        value: ticket.email },
                { icon: Phone,     label: "Phone",        value: ticket.phone ?? "—" },
                { icon: Building2, label: "Organisation", value: ticket.organisation },
                { icon: Globe,     label: "Country",      value: ticket.country },
                { icon: Briefcase, label: "Job Title",    value: ticket.job_title ?? "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <div className="mt-0.5 p-1.5 bg-surface rounded-md shrink-0">
                    <Icon size={13} className="text-nova-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-text-muted">{label}</p>
                    <p className="text-sm text-navy-900 font-medium truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Request */}
          <div className="bg-white border border-border rounded-xl p-5 space-y-4">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Request Details</p>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-threat/10 rounded-md shrink-0">
                <ShieldAlert size={13} className="text-threat" />
              </div>
              <div>
                <p className="text-xs text-text-muted">Issue Type</p>
                <p className="text-sm font-semibold text-navy-900">{ticket.issue_type}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Description</p>
              <p className="text-sm text-navy-900 leading-relaxed whitespace-pre-wrap bg-surface rounded-lg px-4 py-3 border border-border">
                {ticket.description}
              </p>
            </div>
          </div>

          {/* AI Summary */}
          {ticket.ai_summary && (
            <div className="bg-navy-900 border border-navy-700 rounded-xl p-5 space-y-3">
              <p className="text-xs font-bold text-nova-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={12} /> AI Summary
              </p>
              <p className="text-sm text-white/80 leading-relaxed">{ticket.ai_summary}</p>
            </div>
          )}

          {/* Attachment */}
          {ticket.attachment_path && (
            <div className="bg-white border border-border rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-nova-100 rounded-lg">
                  <Paperclip size={15} className="text-nova-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-900">Uploaded File</p>
                  <p className="text-xs text-text-muted truncate max-w-xs">
                    {ticket.attachment_path.split("/").pop()}
                  </p>
                </div>
              </div>
              {attachmentUrl ? (
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs bg-nova-500 hover:bg-nova-400 text-white rounded-lg px-3 h-8 transition-colors font-medium"
                >
                  <FileText size={13} /> Download
                </a>
              ) : (
                <span className="text-xs text-text-muted">Link expired</span>
              )}
            </div>
          )}

          {/* Tracking info */}
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-3">Tracking</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-text-muted">Public tracking link:</p>
              <code className="text-xs bg-surface px-2 py-1 rounded font-mono text-navy-700 border border-border truncate max-w-xs">
                /track/{ticket.tracking_token}
              </code>
            </div>
          </div>
        </div>

        {/* ── Right: Workflow + History ────────────────────────────────── */}
        <div className="space-y-5">

          {/* Workflow */}
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Manage Ticket</p>
            <TicketWorkflow
              ticketId={ticket.id}
              currentStatus={ticket.status}
              currentAssigned={assigned?.id ?? null}
              profiles={(profiles ?? []).map((p) => ({
                id:        p.id,
                full_name: p.full_name,
                role:      p.role,
              }))}
            />
          </div>

          {/* History */}
          <div className="bg-white border border-border rounded-xl p-5">
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Activity</p>
            {(!history || history.length === 0) ? (
              <p className="text-xs text-text-muted text-center py-4">No activity yet.</p>
            ) : (
              <ol className="relative border-l border-border ml-2 space-y-4">
                {history.map((h) => {
                  const changer = (() => {
                    const c = h.changer as unknown;
                    return Array.isArray(c)
                      ? (c[0] as { full_name: string } | undefined)?.full_name
                      : (c as { full_name: string } | null)?.full_name;
                  })();
                  const isResolved = h.status === "Resolved";
                  return (
                    <li key={h.id} className="ml-4 relative">
                      <span className={`absolute -left-[21px] top-1 flex items-center justify-center w-4 h-4 rounded-full border-2 border-white ${isResolved ? "bg-secure" : "bg-nova-500"}`}>
                        {isResolved
                          ? <CheckCircle2 size={9} className="text-white" />
                          : <Clock size={9} className="text-white" />}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${STATUS_STYLES[h.status] ?? ""}`}>{h.status}</Badge>
                          {changer && <span className="text-xs text-text-muted">by {changer.split("—")[0].trim()}</span>}
                        </div>
                        {h.note && (
                          <p className="text-xs text-navy-900 mt-1 bg-surface rounded px-2 py-1.5 border border-border">
                            {h.note}
                          </p>
                        )}
                        <p className="text-xs text-text-muted mt-1">
                          {new Date(h.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
