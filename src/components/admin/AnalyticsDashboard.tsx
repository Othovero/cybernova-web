"use client";

import { useState, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import {
  Download, FileText, Loader2, X, ChevronRight, BarChart2, Globe,
  Copy, Check, FileDown,
} from "lucide-react";

export interface TicketRow {
  ref: string;
  full_name: string;
  organisation: string;
  country: string;
  issue_type: string;
  status: string;
  created_at: string;
}

interface Props { tickets: TicketRow[] }

const STATUS_STYLES: Record<string, string> = {
  Pending:       "bg-pending/10 text-pending",
  Assigned:      "bg-nova-100 text-nova-500",
  "In Progress": "bg-cyan-50 text-cyan-700",
  Resolved:      "bg-secure/10 text-secure",
  Archived:      "bg-gray-100 text-gray-500",
};

const PALETTE = ["#005CE6","#0891B2","#059669","#D97706","#DC2626","#7C3AED","#DB2777","#0B1F3A","#1A3560","#64748B"];

type FilterType = "service" | "country";
interface ActiveFilter { type: FilterType; value: string }

const CustomBarTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-navy-900 max-w-[180px]">{label}</p>
      <p className="text-text-muted">{payload[0].value} ticket{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
};

function buildCsv(rows: TicketRow[]): string {
  const headers = ["Ref", "Name", "Organisation", "Country", "Issue Type", "Status", "Date"];
  const lines = rows.map((t) =>
    [t.ref, t.full_name, t.organisation, t.country, t.issue_type, t.status,
      new Date(t.created_at).toLocaleDateString("en-GB")]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [headers.join(","), ...lines].join("\n");
}

function downloadText(content: string, filename: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function renderInline(text: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
      : part
  );
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      nodes.push(<h3 key={i} className="text-sm font-bold text-navy-900 mt-4 mb-1">{renderInline(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      nodes.push(<h2 key={i} className="text-base font-bold text-navy-900 mt-5 mb-2 pb-1 border-b border-border">{renderInline(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      nodes.push(<h1 key={i} className="text-lg font-bold text-navy-900 mt-5 mb-2">{renderInline(line.slice(2))}</h1>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-0.5 my-2 text-sm text-navy-900 leading-relaxed">
          {items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
        </ul>
      );
      continue;
    } else if (line.trim() === "") {
      nodes.push(<div key={i} className="h-2" />);
    } else {
      nodes.push(<p key={i} className="text-sm text-navy-900 leading-relaxed">{renderInline(line)}</p>);
    }
    i++;
  }
  return <div className="space-y-0.5">{nodes}</div>;
}

export function AnalyticsDashboard({ tickets }: Props) {
  const [filter, setFilter]             = useState<ActiveFilter | null>(null);
  const [reportOpen, setReportOpen]     = useState(false);
  const [reportText, setReportText]     = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [copied, setCopied]             = useState(false);
  const [pdfLoading, setPdfLoading]     = useState(false);
  const chartsRef                       = useRef<HTMLDivElement>(null);

  // ── Aggregate data ──────────────────────────────────────────────────────────
  const allServiceData = useMemo(() =>
    Object.entries(tickets.reduce((a: Record<string, number>, t) => { a[t.issue_type] = (a[t.issue_type] || 0) + 1; return a; }, {}))
      .sort((a, b) => b[1] - a[1]).slice(0, 9).map(([name, count]) => ({ name, count })),
    [tickets]
  );

  const allCountryData = useMemo(() =>
    Object.entries(tickets.reduce((a: Record<string, number>, t) => { a[t.country] = (a[t.country] || 0) + 1; return a; }, {}))
      .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count })),
    [tickets]
  );

  // ── Filtered tickets ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!filter) return tickets;
    return tickets.filter((t) =>
      filter.type === "service" ? t.issue_type === filter.value : t.country === filter.value
    );
  }, [tickets, filter]);

  // Secondary breakdown when filter is active
  const secondaryData = useMemo(() => {
    if (!filter) return [];
    const key = filter.type === "service" ? "country" : "issue_type";
    return Object.entries(
      filtered.reduce((a: Record<string, number>, t) => {
        const v = t[key as keyof TicketRow] as string;
        a[v] = (a[v] || 0) + 1;
        return a;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  }, [filter, filtered]);

  function toggle(type: FilterType, value: string) {
    setFilter((f) => (f?.type === type && f.value === value ? null : { type, value }));
  }

  // Stats for report
  const stats = useMemo(() => ({
    pending:    filtered.filter((t) => t.status === "Pending").length,
    assigned:   filtered.filter((t) => t.status === "Assigned").length,
    inProgress: filtered.filter((t) => t.status === "In Progress").length,
    resolved:   filtered.filter((t) => t.status === "Resolved").length,
    archived:   filtered.filter((t) => t.status === "Archived").length,
  }), [filtered]);

  async function generateReport() {
    setReportLoading(true);
    setReportOpen(true);
    setReportText("");
    try {
      const res = await fetch("/api/admin/analytics/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filter, tickets: filtered, stats }),
      });
      const data = await res.json();
      setReportText(data.report ?? data.error ?? "Failed to generate report.");
    } catch {
      setReportText("Request failed. Please try again.");
    }
    setReportLoading(false);
  }

  function copyReport() {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadPDF() {
    setPdfLoading(true);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 15;
      let y = margin;

      // Header bar
      doc.setFillColor(11, 31, 58);
      doc.rect(0, 0, pageW, 22, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("CyberNova Analytics", margin, 14);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("AI Security Report", pageW - margin, 14, { align: "right" });
      y = 30;

      // Sub-header
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text(filterLabel ? `Filter: ${filterLabel}` : "Scope: All Incidents", margin, y);
      doc.text(new Date().toLocaleDateString("en-GB"), pageW - margin, y, { align: "right" });
      y += 8;

      // Charts screenshot
      if (chartsRef.current) {
        const canvas = await html2canvas(chartsRef.current, {
          scale: 1.5, useCORS: true, backgroundColor: "#ffffff",
        });
        const imgW = pageW - margin * 2;
        const imgH = (canvas.height / canvas.width) * imgW;
        doc.addImage(canvas.toDataURL("image/png"), "PNG", margin, y, imgW, Math.min(imgH, 90));
        y += Math.min(imgH, 90) + 8;
      }

      // Divider + section heading
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, pageW - margin, y);
      y += 6;
      doc.setTextColor(11, 31, 58);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("AI Analysis", margin, y);
      y += 6;

      // Report text (strip markdown for plain PDF rendering)
      if (reportText) {
        const plain = reportText
          .replace(/^#{1,3}\s+/gm, "")
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/^[-*]\s+/gm, "• ");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        const splitLines = doc.splitTextToSize(plain, pageW - margin * 2) as string[];
        splitLines.forEach((line) => {
          if (y > 280) { doc.addPage(); y = margin; }
          doc.text(line, margin, y);
          y += 4.5;
        });
      }

      doc.save(`cybernova-report-${Date.now()}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  const filterLabel = filter
    ? `${filter.type === "service" ? "Service" : "Country"}: ${filter.value}`
    : null;

  return (
    <div className="space-y-6">

      {/* Active filter banner */}
      {filter && (
        <div className="flex items-center justify-between bg-nova-100 border border-nova-500/20 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-navy-900 font-medium">
            <ChevronRight size={14} className="text-nova-500" />
            Showing <span className="text-nova-500">{filtered.length}</span> ticket{filtered.length !== 1 ? "s" : ""} for&nbsp;
            <span className="font-bold">{filterLabel}</span>
          </div>
          <button onClick={() => setFilter(null)} className="text-text-muted hover:text-threat transition-colors">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Main charts */}
      <div ref={chartsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Services bar chart */}
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-sm font-bold text-navy-900 mb-1 flex items-center gap-2">
            <BarChart2 size={14} className="text-nova-500" /> Most Requested Services
          </p>
          <p className="text-xs text-text-muted mb-4">Click a bar to drill down into its tickets</p>
          {allServiceData.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-16">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart layout="vertical" data={allServiceData} margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(d: any) => toggle("service", d.name as string)}>
                  {allServiceData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={filter?.type === "service" && filter.value === entry.name ? "#005CE6" : PALETTE[i % PALETTE.length]}
                      opacity={filter?.type === "service" && filter.value !== entry.name ? 0.35 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Countries pie chart */}
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-sm font-bold text-navy-900 mb-1 flex items-center gap-2">
            <Globe size={14} className="text-nova-500" /> Regional Demand
          </p>
          <p className="text-xs text-text-muted mb-4">Click a segment to filter by country</p>
          {allCountryData.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-16">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={allCountryData} dataKey="count" nameKey="name"
                  cx="50%" cy="45%" outerRadius={90} innerRadius={48} paddingAngle={2}
                  cursor="pointer"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onClick={(d: any) => toggle("country", d.name as string)}>
                  {allCountryData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={PALETTE[i % PALETTE.length]}
                      opacity={filter?.type === "country" && filter.value !== entry.name ? 0.3 : 1}
                      stroke={filter?.type === "country" && filter.value === entry.name ? "#fff" : "none"}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [`${val} tickets`, name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E2E8F0" }} />
                <Legend iconType="circle" iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 11, color: "#64748B" }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Secondary breakdown when filter active */}
      {filter && secondaryData.length > 0 && (
        <div className="bg-white border border-border rounded-xl p-5">
          <p className="text-sm font-bold text-navy-900 mb-1">
            {filter.type === "service"
              ? `Country breakdown — ${filter.value}`
              : `Service breakdown — ${filter.value}`}
          </p>
          <p className="text-xs text-text-muted mb-4">
            {filter.type === "service"
              ? "Click a bar to add a country filter"
              : "Click a bar to add a service filter"}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart layout="vertical" data={secondaryData} margin={{ top: 0, right: 24, left: 8, bottom: 0 }}>
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onClick={(d: any) => toggle(filter.type === "service" ? "country" : "service", d.name as string)}>
                {secondaryData.map((entry, i) => (
                  <Cell key={entry.name} fill={PALETTE[(i + 3) % PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Drilldown table */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-navy-900">
              {filter ? `Tickets — ${filterLabel}` : "All Tickets"}
            </p>
            <p className="text-xs text-text-muted mt-0.5">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadText(buildCsv(filtered), `cybernova-${filter?.value ?? "all"}-${Date.now()}.csv`, "text/csv")}
              className="inline-flex items-center gap-1.5 text-xs border border-border rounded-lg px-3 h-8 hover:bg-surface transition-colors"
            >
              <Download size={13} /> Export CSV
            </button>
            <button
              onClick={generateReport}
              className="inline-flex items-center gap-1.5 text-xs bg-navy-900 hover:bg-navy-700 text-white rounded-lg px-3 h-8 transition-colors font-medium"
            >
              <FileText size={13} /> AI Report
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wide bg-surface">
                {["Ref", "Name", "Organisation", "Country", "Issue Type", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.slice(0, 50).map((t) => (
                <tr key={t.ref} className="hover:bg-surface/60 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-navy-700">{t.ref}</td>
                  <td className="px-5 py-3 text-navy-900 text-xs">{t.full_name}</td>
                  <td className="px-5 py-3 text-navy-900 text-xs">{t.organisation}</td>
                  <td className="px-5 py-3 text-xs">
                    <button onClick={() => toggle("country", t.country)}
                      className="text-nova-500 hover:text-nova-400 hover:underline transition-colors">
                      {t.country}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-xs">
                    <button onClick={() => toggle("service", t.issue_type)}
                      className="text-text-muted hover:text-navy-900 hover:underline transition-colors text-left">
                      {t.issue_type}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={`text-xs ${STATUS_STYLES[t.status] ?? ""}`}>{t.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-text-muted text-xs">
                    {new Date(t.created_at).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-text-muted text-sm">No tickets match this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !reportLoading && setReportOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div>
                <p className="font-bold text-navy-900">AI Security Report</p>
                <p className="text-xs text-text-muted mt-0.5">
                  Generated by DeepSeek · {filterLabel ?? "All Incidents"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!reportLoading && reportText && (
                  <>
                    <button onClick={copyReport}
                      className="inline-flex items-center gap-1.5 text-xs border border-border rounded-lg px-3 h-8 hover:bg-surface transition-colors">
                      {copied ? <Check size={12} className="text-secure" /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => downloadText(reportText, `cybernova-report-${Date.now()}.md`)}
                      className="inline-flex items-center gap-1.5 text-xs border border-border rounded-lg px-3 h-8 hover:bg-surface transition-colors">
                      <Download size={12} /> .md
                    </button>
                    <button
                      onClick={downloadPDF}
                      disabled={pdfLoading}
                      className="inline-flex items-center gap-1.5 text-xs bg-navy-900 hover:bg-navy-700 text-white rounded-lg px-3 h-8 transition-colors disabled:opacity-60">
                      {pdfLoading ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />}
                      {pdfLoading ? "Generating…" : "PDF"}
                    </button>
                  </>
                )}
                {!reportLoading && (
                  <button onClick={() => setReportOpen(false)}
                    className="text-text-muted hover:text-navy-900 transition-colors ml-1">
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {reportLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 size={28} className="animate-spin text-nova-500" />
                  <p className="text-sm text-text-muted">DeepSeek is analysing {filtered.length} incident{filtered.length !== 1 ? "s" : ""}…</p>
                </div>
              ) : (
                <div className="prose-sm max-w-none">{renderMarkdown(reportText)}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
