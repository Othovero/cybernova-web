import { adminClient } from "@/lib/supabase/admin";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";

export const revalidate = 60;

export default async function AnalyticsPage() {
  const { data: tickets } = await adminClient
    .from("tickets")
    .select("ref, full_name, organisation, country, issue_type, status, created_at")
    .neq("status", "Archived")
    .order("created_at", { ascending: false });

  const rows = (tickets ?? []).map((t) => ({
    ref:          t.ref,
    full_name:    t.full_name,
    organisation: t.organisation,
    country:      t.country,
    issue_type:   t.issue_type,
    status:       t.status,
    created_at:   t.created_at,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Analytics</h1>
        <p className="text-text-muted text-sm mt-1">
          Click any chart element to drill down. Export as CSV or generate an AI report.
        </p>
      </div>
      <AnalyticsDashboard tickets={rows} />
    </div>
  );
}
