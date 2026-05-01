"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STATUSES    = ["Pending", "Assigned", "In Progress", "Resolved", "Archived"];
const ISSUE_TYPES = [
  "Active Incident / Breach", "Ransomware / Malware", "Phishing / Social Engineering",
  "Vulnerability Assessment", "Penetration Testing", "Compliance Assessment (POPIA/PCI-DSS)",
  "SOC-as-a-Service Enquiry", "General Security Advisory", "Other",
];
const COUNTRIES   = [
  "Botswana", "South Africa", "Namibia", "Zimbabwe", "Zambia",
  "Mozambique", "Tanzania", "Malawi", "Lesotho", "Eswatini", "Other",
];

export default function TicketFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value && value !== "all") p.set(key, value);
    else p.delete(key);
    router.push(`/admin/tickets?${p.toString()}`);
  }

  return (
    <Card className="border-border">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              defaultValue={params.get("q") ?? ""}
              placeholder="Search by ref, org, or name…"
              className="pl-8 text-sm"
              onChange={(e) => update("q", e.target.value)}
            />
          </div>
          <Select defaultValue={params.get("status") ?? ""} onValueChange={(v) => update("status", String(v))}>
            <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select defaultValue={params.get("issue_type") ?? ""} onValueChange={(v) => update("issue_type", String(v))}>
            <SelectTrigger className="w-48 text-sm"><SelectValue placeholder="Issue Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ISSUE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select defaultValue={params.get("country") ?? ""} onValueChange={(v) => update("country", String(v))}>
            <SelectTrigger className="w-36 text-sm"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
