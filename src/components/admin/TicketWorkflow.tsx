"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATUSES = ["Pending", "Assigned", "In Progress", "Resolved", "Archived"] as const;

const STATUS_STYLES: Record<string, string> = {
  Pending:       "bg-pending/10 text-pending",
  Assigned:      "bg-nova-100 text-nova-500",
  "In Progress": "bg-cyan-50 text-cyan-700",
  Resolved:      "bg-secure/10 text-secure",
  Archived:      "bg-gray-100 text-gray-500",
};

export interface Profile { id: string; full_name: string | null; role: string }

interface Props {
  ticketId:        string;
  currentStatus:   string;
  currentAssigned: string | null;
  profiles:        Profile[];
}

export function TicketWorkflow({ ticketId, currentStatus, currentAssigned, profiles }: Props) {
  const router  = useRouter();
  const [status,     setStatus]     = useState(currentStatus);
  const [assignedTo, setAssignedTo] = useState(currentAssigned ?? "");
  const [note,       setNote]       = useState("");
  const [loading,    setLoading]    = useState(false);
  const [saved,      setSaved]      = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body: Record<string, string | null> = {};
    if (status !== currentStatus) body.status = status;
    body.assigned_to = assignedTo || null;
    if (note.trim()) body.note = note.trim();

    await fetch(`/api/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaved(true);
    setNote("");
    setTimeout(() => setSaved(false), 2500);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Status</label>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                status === s
                  ? `${STATUS_STYLES[s]} border-transparent ring-2 ring-offset-1 ring-nova-500/40`
                  : "bg-white border-border text-text-muted hover:border-navy-300"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Assign */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide flex items-center gap-1.5">
          <UserCircle2 size={13} /> Assigned To
        </label>
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full h-9 rounded-lg border border-border bg-white px-3 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-nova-500/30"
        >
          <option value="">— Unassigned —</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name ?? p.id.slice(0, 8)} ({p.role})
            </option>
          ))}
        </select>
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wide">Add Note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Internal note — visible to team, not the client."
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-navy-900 resize-none focus:outline-none focus:ring-2 focus:ring-nova-500/30"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-nova-500 hover:bg-nova-400 text-white font-semibold h-9 text-sm"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin mr-2" />
        ) : saved ? (
          <CheckCircle2 size={14} className="mr-2 text-white" />
        ) : null}
        {saved ? "Saved" : "Save Changes"}
      </Button>
    </form>
  );
}
