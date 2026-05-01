"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import { CheckCircle2, Loader2, AlertCircle, Star } from "lucide-react";

export default function TestimonialSubmitPage() {
  const [form, setForm] = useState({
    author_name: "", job_title: "", organisation: "", tag: "", rating: 0, quote: "",
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [submitted, setSubmitted] = useState(false);

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.author_name.trim() || !form.organisation.trim() || !form.tag || !form.rating || !form.quote.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Submission failed."); return; }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <section className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-secure/10 rounded-full mb-6">
            <CheckCircle2 size={32} className="text-secure" />
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-3">Thank you!</h2>
          <p className="text-text-muted">Your review has been submitted and will appear once approved by our team.</p>
          <a href="/testimonials" className="inline-flex items-center justify-center mt-6 rounded-lg bg-nova-500 hover:bg-nova-400 text-white px-6 h-9 text-sm font-semibold transition-colors">
            Back to Testimonials
          </a>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative bg-navy-900 text-white py-16 overflow-hidden">
        <CircuitPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-nova-400 text-sm font-semibold tracking-widest uppercase mb-3">Client Voices</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Submit a Review</h1>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="max-w-xl mx-auto px-4">
          <Card className="border-border">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Your Name <span className="text-threat">*</span></Label>
                  <Input value={form.author_name} onChange={(e) => set("author_name", e.target.value)} placeholder="Thabo Modise" />
                </div>
                <div className="space-y-1.5">
                  <Label>Job Title</Label>
                  <Input value={form.job_title} onChange={(e) => set("job_title", e.target.value)} placeholder="IT Director" />
                </div>
                <div className="space-y-1.5">
                  <Label>Organisation <span className="text-threat">*</span></Label>
                  <Input value={form.organisation} onChange={(e) => set("organisation", e.target.value)} placeholder="Ministry of Finance, Botswana" />
                </div>
                <div className="space-y-1.5">
                  <Label>Client Type <span className="text-threat">*</span></Label>
                  <Select onValueChange={(v) => set("tag", String(v))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {["Government", "Financial", "SME"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Rating <span className="text-threat">*</span></Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button type="button" key={n} onClick={() => set("rating", n)}>
                        <Star size={24} className={n <= form.rating ? "fill-nova-500 text-nova-500" : "text-border fill-border"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Your Review <span className="text-threat">*</span></Label>
                  <Textarea value={form.quote} onChange={(e) => set("quote", e.target.value)} placeholder="Share your experience with CyberNova Analytics…" rows={4} />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-threat bg-threat/10 rounded-lg px-3 py-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                <Button type="submit" className="w-full bg-nova-500 hover:bg-nova-400 text-white font-semibold" disabled={loading}>
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Submit Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
