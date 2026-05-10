"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp]         = useState("");
  const [factorId, setFactorId] = useState("");
  const [step, setStep]         = useState<"credentials" | "totp">("credentials");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  function logAttempt(attemptEmail: string, success: boolean, reason?: string) {
    fetch("/api/admin/audit/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: attemptEmail, success, reason }),
    }).catch(() => {});
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      logAttempt(email, false, "Invalid credentials");
      setError("Invalid email or password.");
      toast.error("Sign in failed");
      setLoading(false);
      return;
    }

    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verifiedFactor = factors?.totp?.find((f) => f.status === "verified");

    if (!verifiedFactor) {
      // No MFA enrolled — send to setup
      router.push("/admin/mfa-setup");
      return;
    }

    setFactorId(verifiedFactor.id);
    setStep("totp");
    setLoading(false);
  }

  async function handleTotp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (!ch || chErr) {
      setError("Could not initiate MFA challenge. Please try again.");
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: ch.id,
      code: totp.replace(/\s/g, ""),
    });

    if (verifyError) {
      logAttempt(email, false, "Invalid MFA code");
      setError("Invalid code. Please try again.");
      toast.error("Incorrect authentication code");
      setLoading(false);
      return;
    }

    logAttempt(email, true);
    toast.success("Signed in successfully");
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-enter">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="bg-navy-900 rounded-xl px-5 py-3">
              <Image
                src="/logotransparent.png"
                alt="CyberNova Analytics"
                width={148}
                height={42}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-navy-900">Admin Access</h1>
          <p className="text-text-muted text-sm mt-1">CyberNova Analytics Secure Portal</p>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            <div className="animate-scale-in" key={step}>
              {step === "credentials" ? (
                <form onSubmit={handleCredentials} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@cybernova.bw"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-threat bg-threat/10 rounded-lg px-3 py-2 animate-fade">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-nova-500 hover:bg-nova-400 text-white font-semibold transition-all duration-150 active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleTotp} className="space-y-4">
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-nova-100 rounded-full mb-3">
                      <ShieldCheck size={20} className="text-nova-500" />
                    </div>
                    <p className="text-sm text-navy-900 font-semibold">Two-Factor Authentication</p>
                    <p className="text-xs text-text-muted mt-1">Enter the 6-digit code from your authenticator app.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="totp">Authentication Code</Label>
                    <Input
                      id="totp"
                      value={totp}
                      onChange={(e) => setTotp(e.target.value)}
                      placeholder="000 000"
                      maxLength={7}
                      required
                      autoFocus
                      autoComplete="one-time-code"
                      className="text-center text-xl tracking-widest font-mono"
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 text-sm text-threat bg-threat/10 rounded-lg px-3 py-2 animate-fade">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-nova-500 hover:bg-nova-400 text-white font-semibold transition-all duration-150 active:scale-[0.98]"
                    disabled={loading}
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify Code"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => { setStep("credentials"); setError(""); setTotp(""); }}
                    className="w-full text-xs text-text-muted hover:text-navy-900 transition-colors"
                  >
                    ← Back to sign in
                  </button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-text-muted mt-6">
          All access is logged.
        </p>
        <div className="text-center mt-3">
          <a
            href="/"
            className="text-xs text-text-muted hover:text-nova-500 transition-colors inline-flex items-center gap-1"
          >
            ← Back to homepage
          </a>
        </div>
      </div>
    </div>
  );
}
