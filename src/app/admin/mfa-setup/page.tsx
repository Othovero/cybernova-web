"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, ShieldCheck, Smartphone } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function MfaSetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode]     = useState("");
  const [secret, setSecret]     = useState("");
  const [code, setCode]         = useState("");
  const [enrolling, setEnrolling] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError]         = useState("");

  useEffect(() => {
    async function enroll() {
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        issuer: "CyberNova Analytics",
        friendlyName: "Admin Authenticator",
      });

      if (enrollError || !data) {
        setError("Failed to generate MFA setup. Please sign out and try again.");
        setEnrolling(false);
        return;
      }

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setEnrolling(false);
    }

    enroll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setVerifying(true);

    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
    if (!ch || chErr) {
      setError("Challenge failed. Please try again.");
      setVerifying(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: ch.id,
      code: code.replace(/\s/g, ""),
    });

    if (verifyError) {
      setError("Invalid code — check your authenticator app and try again.");
      setVerifying(false);
      return;
    }

    toast.success("MFA enabled. Welcome to the admin portal.");
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
          <h1 className="text-2xl font-bold text-navy-900">Set Up Two-Factor Auth</h1>
          <p className="text-text-muted text-sm mt-1">Required for admin access — takes 30 seconds</p>
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6 space-y-5">
            {enrolling ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 size={24} className="animate-spin text-nova-500" />
                <p className="text-sm text-text-muted">Generating your MFA secret…</p>
              </div>
            ) : error && !qrCode ? (
              <div className="flex items-center gap-2 text-sm text-threat bg-threat/10 rounded-lg px-3 py-2">
                <AlertCircle size={14} /> {error}
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 bg-nova-100 rounded-lg p-3">
                  <Smartphone size={16} className="text-nova-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-navy-900 leading-relaxed">
                    Scan this QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP app.
                    Then enter the 6-digit code to activate.
                  </p>
                </div>

                {qrCode && (
                  <div className="flex justify-center">
                    <div className="p-3 bg-white border border-border rounded-xl shadow-sm">
                      {/* QR code is a data URI returned by Supabase */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrCode} alt="MFA QR Code" width={168} height={168} className="rounded" />
                    </div>
                  </div>
                )}

                <details className="text-center">
                  <summary className="text-xs text-text-muted cursor-pointer hover:text-navy-900 transition-colors select-none">
                    Can&apos;t scan? Enter the key manually
                  </summary>
                  <p className="mt-2 font-mono text-xs bg-surface rounded-lg px-3 py-2 break-all text-navy-900 select-all">
                    {secret}
                  </p>
                </details>

                <form onSubmit={handleVerify} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="000 000"
                      maxLength={7}
                      required
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
                    disabled={verifying}
                  >
                    {verifying ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={14} className="mr-1.5" />
                        Activate MFA &amp; Enter Portal
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-text-muted mt-6">
          You will be asked for this code on every login.
        </p>
      </div>
    </div>
  );
}
