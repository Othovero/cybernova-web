"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import { ShieldCheck, Clock, Globe, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

const ISSUE_TYPES = [
  "Active Incident / Breach",
  "Ransomware / Malware",
  "Phishing / Social Engineering",
  "Vulnerability Assessment",
  "Penetration Testing",
  "Compliance Assessment (POPIA/PCI-DSS)",
  "SOC-as-a-Service Enquiry",
  "General Security Advisory",
  "Other",
];

const COUNTRIES = [
  "Botswana", "South Africa", "Namibia", "Zimbabwe", "Zambia",
  "Mozambique", "Tanzania", "Malawi", "Lesotho", "Eswatini", "Other",
];

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
];

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  organisation: string;
  country: string;
  job_title: string;
  issue_type: string;
  description: string;
}

export default function ContactPage() {
  const [form, setForm] = useState<FormData>({
    full_name: "", email: "", phone: "", organisation: "",
    country: "", job_title: "", issue_type: "", description: "",
  });
  const [file, setFile]           = useState<File | null>(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState<{ ref: string; token: string } | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) { setFile(null); return; }
    if (selected.size > 10 * 1024 * 1024) { setError("File must be under 10 MB."); e.target.value = ""; return; }
    if (!ALLOWED_TYPES.includes(selected.type)) { setError("Only PDF, Word, TXT, PNG, or JPG files are allowed."); e.target.value = ""; return; }
    setError("");
    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const required: (keyof FormData)[] = ["full_name", "email", "organisation", "country", "issue_type", "description"];
    for (const f of required) {
      if (!form[f].trim()) { setError(`Please fill in all required fields.`); return; }
    }

    if (!captchaToken) { setError("Please complete the security check."); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      (Object.entries(form) as [string, string][]).forEach(([k, v]) => fd.append(k, v));
      fd.append("captchaToken", captchaToken);
      if (file) fd.append("file", file);

      const res = await fetch("/api/contact", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed. Please try again.");
        toast.error("Submission failed — please try again");
        return;
      }
      toast.success("Request submitted! Check your email for the tracking link.");
      setSuccess({ ref: data.ref, token: data.tracking_token });
    } catch {
      setError("Network error. Please try again.");
      toast.error("Network error — please check your connection");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <section className="relative bg-navy-900 text-white py-16 overflow-hidden">
          <CircuitPattern />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Request Received</h1>
          </div>
        </section>
        <section className="py-24 bg-surface flex items-center justify-center">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secure/10 rounded-full mb-6">
              <CheckCircle2 size={32} className="text-secure" />
            </div>
            <h2 className="text-2xl font-bold text-navy-900 mb-3">Your request has been submitted</h2>
            <p className="text-text-muted mb-2">Reference: <span className="font-mono font-bold text-navy-900">{success.ref}</span></p>
            <p className="text-text-muted text-sm mb-8">
              A confirmation email with your unique tracking link has been sent. Our team will respond within 2 hours.
            </p>
            <a
              href={`/track/${success.token}`}
              className="inline-flex items-center justify-center rounded-lg bg-nova-500 hover:bg-nova-400 text-white px-6 h-10 text-sm font-semibold transition-colors"
            >
              Track Your Request →
            </a>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="relative bg-navy-900 text-white py-16 overflow-hidden">
        <CircuitPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-nova-400 text-sm font-semibold tracking-widest uppercase mb-3">Get Protected</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Contact Security Team</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            Submit a request and our security team will respond within 2 hours. Active incidents receive immediate escalation.
          </p>
        </div>
      </section>

      <section className="py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="space-y-6">
              {[
                { icon: Clock,       title: "Response Time",     body: "Standard: within 2 hours. Active incident: immediate escalation to on-call SOC analyst." },
                { icon: ShieldCheck, title: "Secure Handling",   body: "All submissions are encrypted in transit, your data stays private." },
                { icon: Globe,       title: "Regional Coverage", body: "We operate across Botswana, Namibia, Zimbabwe, Zambia, Mozambique, and South Africa." },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <div className="p-2.5 bg-nova-100 rounded-lg h-fit">
                    <Icon size={18} className="text-nova-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900 text-sm mb-1">{title}</p>
                    <p className="text-text-muted text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
              <div className="bg-navy-900 text-white rounded-xl p-5 mt-4">
                <p className="text-xs text-white/50 tracking-widest uppercase font-semibold mb-2">Privacy Notice</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Information submitted is processed for service delivery only. No data is shared with third parties.
                  Handled in accordance with POPIA and GDPR principles.
                </p>
              </div>
            </div>

            <Card className="lg:col-span-2 border-border">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name <span className="text-threat">*</span></Label>
                      <Input id="name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} placeholder="Thabo Modise" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address <span className="text-threat">*</span></Label>
                      <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="thabo@organisation.bw" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+267 71 234 567" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="org">Organisation <span className="text-threat">*</span></Label>
                      <Input id="org" value={form.organisation} onChange={(e) => set("organisation", e.target.value)} placeholder="Ministry of Finance" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="country">Country <span className="text-threat">*</span></Label>
                      <Select onValueChange={(v) => set("country", String(v))}>
                        <SelectTrigger id="country"><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="jobtitle">Job Title</Label>
                      <Input id="jobtitle" value={form.job_title} onChange={(e) => set("job_title", e.target.value)} placeholder="IT Director" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="issuetype">Issue Type <span className="text-threat">*</span></Label>
                    <Select onValueChange={(v) => set("issue_type", String(v))}>
                      <SelectTrigger id="issuetype"><SelectValue placeholder="Select issue type" /></SelectTrigger>
                      <SelectContent>{ISSUE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="description">Problem Description <span className="text-threat">*</span></Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Describe the security issue, incident, or service you need."
                      rows={5}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="file">
                      Supporting Document
                      <span className="text-text-muted text-xs font-normal ml-1">(optional — PDF, Word, TXT, PNG, JPG · max 10 MB)</span>
                    </Label>
                    <input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-text-muted border border-border rounded-lg cursor-pointer bg-white px-3 py-2 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-nova-100 file:text-nova-500 hover:file:bg-nova-500 hover:file:text-white file:transition-colors"
                    />
                    {file && (
                      <p className="text-xs text-secure flex items-center gap-1">
                        <CheckCircle2 size={12} /> {file.name} ({(file.size / 1024).toFixed(0)} KB)
                      </p>
                    )}
                  </div>

                  <TurnstileWidget
                    onSuccess={(t) => setCaptchaToken(t)}
                    onExpire={() => setCaptchaToken("")}
                  />

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-threat bg-threat/10 rounded-lg px-3 py-2.5">
                      <AlertCircle size={14} className="shrink-0" /> {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-nova-500 hover:bg-nova-400 text-white font-semibold"
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin mr-2" /> Submitting…</> : "Submit Security Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
