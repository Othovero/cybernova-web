"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";

const ISSUE_COLORS  = ["#005CE6", "#0891B2", "#059669", "#D97706", "#DC2626", "#7C3AED", "#DB2777", "#0B1F3A"];
const COUNTRY_COLORS = ["#0B1F3A", "#1A3560", "#005CE6", "#1A7AFF", "#0891B2", "#059669", "#D97706", "#DC2626"];

interface DataEntry { name: string; count: number }

interface Props {
  issueData:   DataEntry[];
  countryData: DataEntry[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-navy-900">{label}</p>
      <p className="text-text-muted">{payload[0].value} request{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
};

export function AnalyticsCharts({ issueData, countryData }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Most Requested Services — horizontal bar */}
      <div className="bg-white border border-border rounded-xl p-5">
        <p className="text-sm font-bold text-navy-900 mb-4">Most Requested Services</p>
        {issueData.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-16">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              layout="vertical"
              data={issueData}
              margin={{ top: 0, right: 24, left: 8, bottom: 0 }}
            >
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {issueData.map((entry, i) => (
                  <Cell key={entry.name} fill={ISSUE_COLORS[i % ISSUE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Regional Demand — pie chart */}
      <div className="bg-white border border-border rounded-xl p-5">
        <p className="text-sm font-bold text-navy-900 mb-4">Regional Demand by Country</p>
        {countryData.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-16">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={countryData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
              >
                {countryData.map((entry, i) => (
                  <Cell key={entry.name} fill={COUNTRY_COLORS[i % COUNTRY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [`${val} requests`, name]}
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
