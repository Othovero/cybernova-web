"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function TestimonialActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function update(newStatus: "Approved" | "Rejected") {
    const res = await fetch("/api/admin/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      toast.success(newStatus === "Approved" ? "Testimonial approved" : "Testimonial rejected");
    } else {
      toast.error("Action failed — please try again");
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {status !== "Approved" && (
        <button onClick={() => update("Approved")} title="Approve" className="text-text-muted hover:text-secure transition-colors">
          <CheckCircle2 size={14} />
        </button>
      )}
      {status !== "Rejected" && (
        <button onClick={() => update("Rejected")} title="Reject" className="text-text-muted hover:text-threat transition-colors">
          <XCircle size={14} />
        </button>
      )}
    </div>
  );
}
