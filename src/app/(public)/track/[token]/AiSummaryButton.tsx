"use client";

import { useState } from "react";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiSummaryButton({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/track/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate summary.");
        return;
      }
      setSummary(data.summary);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (summary) {
    return <p className="text-sm text-navy-900 leading-relaxed">{summary}</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">
        Generate an AI-powered triage summary for this ticket.
      </p>
      <Button
        onClick={generate}
        disabled={loading}
        className="bg-nova-500 hover:bg-nova-400 text-white"
        size="sm"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin mr-2" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles size={14} className="mr-2" />
            Generate AI Summary
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-threat flex items-center gap-1.5">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}
