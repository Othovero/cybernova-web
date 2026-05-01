import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { data: tickets } = await adminClient
    .from("tickets")
    .select("ref, full_name, email, phone, organisation, country, job_title, issue_type, status, created_at")
    .order("created_at", { ascending: false });

  if (!tickets) return NextResponse.json({ error: "No data" }, { status: 500 });

  const headers = ["Ref", "Name", "Email", "Phone", "Organisation", "Country", "Job Title", "Issue Type", "Status", "Date"];
  const rows = tickets.map((t) => [
    t.ref, t.full_name, t.email, t.phone ?? "", t.organisation,
    t.country, t.job_title ?? "", t.issue_type, t.status,
    new Date(t.created_at).toLocaleDateString("en-GB"),
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="cybernova-tickets-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
