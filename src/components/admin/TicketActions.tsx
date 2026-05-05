"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["Pending", "Assigned", "In Progress", "Resolved", "Archived"] as const;

const STATUS_STYLES: Record<string, string> = {
  Pending:      "bg-pending/10 text-pending",
  Assigned:     "bg-nova-100 text-nova-500",
  "In Progress":"bg-cyan-50 text-cyan-700",
  Resolved:     "bg-secure/10 text-secure",
  Archived:     "bg-gray-100 text-gray-500",
};

interface Props {
  id: string;
  currentStatus: string;
}

export function TicketActions({ id, currentStatus }: Props) {
  const router = useRouter();
  const [open, setOpen]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function update(status: string) {
    setLoading(true);
    setOpen(false);
    const res = await fetch(`/api/admin/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Ticket moved to ${status}`);
    } else {
      toast.error("Failed to update ticket status");
    }
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity ${STATUS_STYLES[currentStatus] ?? "bg-gray-100 text-gray-500"} ${loading ? "opacity-50" : "hover:opacity-80"}`}
      >
        {loading ? <Loader2 size={10} className="animate-spin" /> : null}
        {currentStatus}
        <ChevronDown size={10} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
            {STATUSES.filter((s) => s !== currentStatus).map((s) => (
              <button
                key={s}
                onClick={() => update(s)}
                className="w-full text-left px-3 py-1.5 text-xs text-navy-900 hover:bg-surface transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
