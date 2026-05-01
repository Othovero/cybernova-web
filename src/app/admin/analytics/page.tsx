import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart2, Globe } from "lucide-react";
import { adminClient } from "@/lib/supabase/admin";

export const revalidate = 60;

export default async function AnalyticsPage() {
  const { data: tickets } = await adminClient
    .from("tickets")
    .select("issue_type, country")
    .neq("status", "Archived");

  const issueMap: Record<string, number> = {};
  const countryMap: Record<string, number> = {};

  for (const t of tickets ?? []) {
    issueMap[t.issue_type]  = (issueMap[t.issue_type]  || 0) + 1;
    countryMap[t.country]   = (countryMap[t.country]   || 0) + 1;
  }

  const issueData = Object.entries(issueMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const countryData = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const maxIssue   = Math.max(...issueData.map(([, c]) => c), 1);
  const maxCountry = Math.max(...countryData.map(([, c]) => c), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Analytics</h1>
        <p className="text-text-muted text-sm mt-1">Service request trends, threat types, and regional distribution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <h2 className="font-bold text-navy-900 flex items-center gap-2 text-sm">
              <BarChart2 size={15} className="text-nova-500" /> Most Requested Service Types
            </h2>
          </CardHeader>
          <CardContent>
            {issueData.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {issueData.map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between text-xs text-navy-900 mb-1">
                      <span>{type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-nova-500 rounded-full transition-all" style={{ width: `${(count / maxIssue) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <h2 className="font-bold text-navy-900 flex items-center gap-2 text-sm">
              <Globe size={15} className="text-nova-500" /> Requests by Country
            </h2>
          </CardHeader>
          <CardContent>
            {countryData.length === 0 ? (
              <p className="text-text-muted text-sm py-8 text-center">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {countryData.map(([country, count]) => (
                  <div key={country}>
                    <div className="flex justify-between text-xs text-navy-900 mb-1">
                      <span>{country}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                    <div className="h-2 bg-surface rounded-full overflow-hidden">
                      <div className="h-full bg-navy-700 rounded-full" style={{ width: `${(count / maxCountry) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-2">
            <h2 className="font-bold text-navy-900 text-sm">Summary</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["Total Tickets",   String((tickets ?? []).length)],
                ["Issue Types",     String(Object.keys(issueMap).length)],
                ["Countries",       String(Object.keys(countryMap).length)],
                ["Top Issue",       issueData[0]?.[0]?.split("/")[0]?.trim() ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface rounded-lg p-4">
                  <p className="text-xs text-text-muted mb-1">{label}</p>
                  <p className="font-bold text-navy-900 truncate">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
