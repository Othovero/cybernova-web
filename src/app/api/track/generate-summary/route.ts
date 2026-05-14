import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  let body: { token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const token = body.token;
  if (!token || !uuidRegex.test(token)) {
    return NextResponse.json({ error: "Invalid tracking token." }, { status: 400 });
  }

  const { data: ticket, error: lookupErr } = await adminClient
    .from("tickets")
    .select("id, issue_type, description, ai_summary")
    .eq("tracking_token", token)
    .single();

  if (lookupErr || !ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  if (ticket.ai_summary) {
    return NextResponse.json({ summary: ticket.ai_summary });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: "AI service is not configured." }, { status: 503 });
  }

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
            content: `Issue type: ${ticket.issue_type}\n\n${ticket.description}`,
          },
        ],
        max_tokens: 200,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "AI service returned an error." }, { status: 502 });
    }

    const data = await res.json();
    const summary = data?.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return NextResponse.json({ error: "AI did not return a summary." }, { status: 502 });
    }

    await adminClient.from("tickets").update({ ai_summary: summary }).eq("id", ticket.id);
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("AI summary error:", err);
    return NextResponse.json({ error: "Failed to generate summary. Please try again." }, { status: 500 });
  }
}
