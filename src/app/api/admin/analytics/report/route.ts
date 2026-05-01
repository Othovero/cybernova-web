import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { filter, tickets, stats } = await req.json();

  const filterLabel = filter
    ? `${filter.type === "service" ? "Service Type" : "Country"}: ${filter.value}`
    : "All Incidents";

  const topIssues = Object.entries(
    (tickets as { issue_type: string }[]).reduce((acc: Record<string, number>, t) => {
      acc[t.issue_type] = (acc[t.issue_type] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => `${k} (${v})`)
    .join(", ");

  const topCountries = Object.entries(
    (tickets as { country: string }[]).reduce((acc: Record<string, number>, t) => {
      acc[t.country] = (acc[t.country] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k, v]) => `${k} (${v})`)
    .join(", ");

  const sampleLines = (tickets as { ref: string; organisation: string; country: string; issue_type: string; status: string }[])
    .slice(0, 12)
    .map((t) => `- ${t.ref} | ${t.organisation}, ${t.country} | ${t.issue_type} | ${t.status}`)
    .join("\n");

  const prompt = `You are a senior cybersecurity analyst at CyberNova Analytics Ltd, Gaborone, Botswana — a leading cybersecurity firm serving government, financial, and enterprise clients across Southern Africa.

Generate a professional executive security incident analysis report in clean Markdown.

REPORT CONTEXT
- Filter applied: ${filterLabel}
- Total incidents: ${tickets.length}
- Status breakdown: Pending ${stats.pending}, Assigned ${stats.assigned}, In Progress ${stats.inProgress}, Resolved ${stats.resolved}, Archived ${stats.archived}
- Top issue types: ${topIssues || "N/A"}
- Countries represented: ${topCountries || "N/A"}

INCIDENT SAMPLE (up to 12)
${sampleLines || "No incidents."}

Generate the following sections:
## Executive Summary
(3–4 sentences: what the data shows, the threat level, and the regional significance)

## Incident Distribution Analysis
(2–3 sentences on the spread across issue types and countries)

## Key Risk Observations
(3–4 bullet points drawn directly from the data — no invented observations)

## Recommended Actions
(4–5 prioritised, actionable bullet points for the security team or client)

## Analyst Notes
(1–2 sentences on data quality, caveats, or follow-up suggested)

Keep the total report under 550 words. Use professional security advisory language. Do not reference or repeat raw data already shown in the dashboard.`;

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
      }),
      signal: AbortSignal.timeout(25000),
    });

    const data = await res.json();
    const report = data?.choices?.[0]?.message?.content?.trim() ?? "Report generation failed.";
    return NextResponse.json({ report });
  } catch {
    return NextResponse.json({ error: "Report generation timed out. Please try again." }, { status: 504 });
  }
}
