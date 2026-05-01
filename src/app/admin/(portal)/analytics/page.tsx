import { adminClient } from "@/lib/supabase/admin";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export const revalidate = 60;

export default async function AnalyticsPage() {
  const { data: tickets } = await adminClient
    .from("tickets")
    .select("issue_type, country, status")
    .neq("status", "Archived");

  const issueMap:   Record<string, number> = {};
  const countryMap: Record<string, number> = {};
  const statusMap:  Record<string, number> = {};

  for (const t of tickets ?? []) {
    issueMap[t.issue_type]   = (issueMap[t.issue_type]   || 0) + 1;
    countryMap[t.country]    = (countryMap[t.country]    || 0) + 1;
    statusMap[t.status]      = (statusMap[t.status]      || 0) + 1;
  }

  const issueData   = Object.entries(issueMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  const countryData = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

  const total = (tickets ?? []).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Analytics</h1>
        <p className="text-text-muted text-sm mt-1">Service request trends, threat types, and regional distribution.</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Total Tickets",  String(total)],
          ["Issue Types",    String(Object.keys(issueMap).length)],
          ["Countries",      String(Object.keys(countryMap).length)],
          ["Top Issue",      issueData[0]?.name?.split("/")[0]?.trim() ?? "—"],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">{label}</p>
            <p className="font-bold text-navy-900 truncate text-lg">{value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <AnalyticsCharts issueData={issueData} countryData={countryData} />
    </div>
  );
}
