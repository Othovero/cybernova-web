"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Pending:      "#D97706",
  Assigned:     "#005CE6",
  "In Progress":"#0891B2",
  Resolved:     "#059669",
  Archived:     "#94A3B8",
};

const ISSUE_COLORS = ["#005CE6", "#0891B2", "#059669", "#D97706", "#DC2626", "#7C3AED", "#DB2777", "#0B1F3A"];

interface StatusEntry  { status: string; count: number }
interface IssueEntry   { issue: string;  count: number }

interface Props {
  statusData: StatusEntry[];
  issueData:  IssueEntry[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-navy-900">{label}</p>
      <p className="text-text-muted">{payload[0].value} ticket{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
};

export function DashboardCharts({ statusData, issueData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tickets by Status — bar chart */}
      <div className="bg-white border border-border rounded-xl p-5">
        <p className="text-sm font-bold text-navy-900 mb-4">Tickets by Status</p>
        {statusData.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-12">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="status" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {statusData.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#005CE6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Issue type breakdown — pie chart */}
      <div className="bg-white border border-border rounded-xl p-5">
        <p className="text-sm font-bold text-navy-900 mb-4">Issue Type Breakdown</p>
        {issueData.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-12">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={issueData}
                dataKey="count"
                nameKey="issue"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={44}
                paddingAngle={2}
              >
                {issueData.map((entry, i) => (
                  <Cell key={entry.issue} fill={ISSUE_COLORS[i % ISSUE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [`${val} tickets`, name]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span style={{ fontSize: 11, color: "#64748B" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
