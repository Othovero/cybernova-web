"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp]         = useState("");
  const [step, setStep]         = useState<"credentials" | "totp">("credentials");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    // Check if MFA is required
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const totpFactor = factors?.totp?.find((f) => f.status === "verified");

    if (totpFactor) {
      setStep("totp");
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/admin");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleTotp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: "" });

    if (challengeError || !challengeData) {
      // Fallback: get the verified factor id
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const factor = factors?.totp?.find((f) => f.status === "verified");
      if (!factor) { setError("MFA factor not found."); setLoading(false); return; }

      const { data: ch } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (!ch) { setError("Could not initiate MFA challenge."); setLoading(false); return; }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: ch.id,
        code: totp.replace(/\s/g, ""),
      });

      if (verifyError) {
        setError("Invalid MFA code. Please try again.");
        setLoading(false);
        return;
      }
    }

    router.push("/admin");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
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
          <p className="text-text-muted text-sm mt-1">CyberNova Analytics — Secure Portal</p>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6">
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
                  <div className="flex items-center gap-2 text-sm text-threat bg-threat/10 rounded-lg px-3 py-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-nova-500 hover:bg-nova-400 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleTotp} className="space-y-4">
                <div className="text-center mb-2">
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
                    autoComplete="one-time-code"
                    className="text-center text-xl tracking-widest font-mono"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-sm text-threat bg-threat/10 rounded-lg px-3 py-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-nova-500 hover:bg-nova-400 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify Code"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setError(""); }}
                  className="w-full text-xs text-text-muted hover:text-navy-900 transition-colors"
                >
                  ← Back to sign in
                </button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-text-muted mt-6">
          Authorised personnel only. All access is logged.
        </p>
      </div>
    </div>
  );
}
