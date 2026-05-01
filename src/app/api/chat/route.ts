import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({
      reply: "AI assistant is not configured. Please contact CyberNova directly via the contact form.",
    });
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
              "You are CyberBot, the AI assistant for CyberNova Analytics Ltd — a cybersecurity firm based in Gaborone, Botswana. You help visitors understand cybersecurity threats, CyberNova's services (incident response, pen testing, compliance, SOC-as-a-service), and guide them to submit a security request. Be professional, concise, and helpful. Do not give specific exploit details. For active incidents, always direct the user to submit a contact form immediately.",
          },
          ...messages.slice(-10),
        ],
        max_tokens: 400,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? "I couldn't generate a response. Please try again.";
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ reply: "Request timed out. Please try again or contact us directly." });
  }
}
