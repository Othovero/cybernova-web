import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const REQUIRED = ["full_name", "email", "organisation", "country", "issue_type", "description"] as const;

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET;
  if (!secret) return true; // skip if not configured
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json();
  return data.success === true;
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Turnstile verification
  const ip = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-forwarded-for") ?? "";
  const captchaOk = await verifyTurnstile(body.captchaToken ?? "", ip);
  if (!captchaOk) {
    return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 400 });
  }

  for (const field of REQUIRED) {
    if (!body[field]?.toString().trim()) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const sanitise = (v: unknown) => typeof v === "string" ? v.slice(0, 2000).trim() : "";

  const payload = {
    full_name:    sanitise(body.full_name),
    email:        sanitise(body.email).toLowerCase(),
    phone:        sanitise(body.phone) || null,
    organisation: sanitise(body.organisation),
    country:      sanitise(body.country),
    job_title:    sanitise(body.job_title) || null,
    issue_type:   sanitise(body.issue_type),
    description:  sanitise(body.description),
  };

  const { data: ticket, error } = await adminClient
    .from("tickets")
    .insert(payload)
    .select("id, ref, tracking_token, issue_type, description")
    .single();

  if (error || !ticket) {
    console.error("Ticket insert error:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }

  // AI summary (fire-and-forget — don't block the response)
  generateAiSummary(ticket.id, ticket.issue_type, ticket.description);

  // Prefer a real site URL; fall back to Vercel's auto-set VERCEL_URL so the link
  // is never localhost in production even if NEXT_PUBLIC_SITE_URL wasn't updated.
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
  const trackUrl = `${siteUrl}/track/${ticket.tracking_token}`;
  await sendConfirmationEmail(body.email, body.full_name, ticket.ref, trackUrl, ticket.issue_type);

  return NextResponse.json({ ref: ticket.ref, tracking_token: ticket.tracking_token }, { status: 201 });
}

async function generateAiSummary(ticketId: string, issueType: string, description: string) {
  if (!process.env.DEEPSEEK_API_KEY) return;
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are a cybersecurity triage assistant for CyberNova Analytics. Summarise the following security request in 2–3 concise sentences for internal use. Focus on threat type, urgency, and key details. Do not include the submitter's name.",
          },
          {
            role: "user",
            content: `Issue type: ${issueType}\n\n${description}`,
          },
        ],
        max_tokens: 200,
      }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    const summary = data?.choices?.[0]?.message?.content?.trim();
    if (summary) {
      await adminClient.from("tickets").update({ ai_summary: summary }).eq("id", ticketId);
    }
  } catch (err) {
    console.error("AI summary error:", err);
  }
}

async function sendConfirmationEmail(
  to: string,
  name: string,
  ref: string,
  trackUrl: string,
  issueType: string
) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to,
      subject: `CyberNova Security Request Received — ${ref}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;color:#0B1F3A">
          <div style="background:#0B1F3A;padding:24px 32px;border-radius:8px 8px 0 0">
            <h1 style="color:#fff;font-size:20px;margin:0">CyberNova Analytics</h1>
            <p style="color:#ffffff99;margin:4px 0 0;font-size:13px">Security Request Confirmation</p>
          </div>
          <div style="background:#F5F7FA;padding:32px;border-radius:0 0 8px 8px">
            <p style="margin:0 0 16px">Hi ${name},</p>
            <p>Your security request has been received and assigned reference <strong>${ref}</strong>.</p>
            <p><strong>Issue type:</strong> ${issueType}</p>
            <p>Our team will respond within <strong>2 hours</strong>. Active incidents receive immediate escalation.</p>
            <p style="margin:24px 0">
              <a href="${trackUrl}" style="background:#005CE6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
                Track Your Request →
              </a>
            </p>
            <p style="font-size:12px;color:#64748B">
              This link is unique to your request — keep it private.<br/>
              CyberNova Analytics Ltd, Gaborone, Botswana
            </p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error("Email send error:", err);
  }
}
