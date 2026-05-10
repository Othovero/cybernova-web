import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const { email, success, reason } = await req.json();
    if (!email || typeof success !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const ip =
      req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      "unknown";
    const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? null;

    await adminClient.from("login_audit_log").insert({
      email:          email.toLowerCase().trim(),
      ip_address:     ip,
      user_agent:     userAgent,
      success,
      failure_reason: success ? null : (reason ?? "Unknown"),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Logging failed" }, { status: 500 });
  }
}
