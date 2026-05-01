import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CTABanner } from "@/components/home/CTABanner";
import { CircuitPattern } from "@/components/ui/CircuitPattern";

const CASE_STUDIES = [
  {
    tag: "Financial",
    tagClass: "bg-nova-100 text-nova-500",
    title: "Ransomware Containment at a Regional Bank",
    client: "Mid-size commercial bank, Botswana",
    year: "2024",
    problem:
      "At 02:14 AM, the bank's monitoring system flagged unusual file encryption activity across 40 endpoints in the core banking segment. The attack was identified as LockBit 3.0.",
    solution:
      "CyberNova's SOC isolated affected network segments within 8 minutes of detection. Forensic tools were deployed to map lateral movement. The attack vector — a compromised vendor VPN account — was identified and closed. Backups were validated clean and restoration initiated.",
    outcome:
      "Zero data exfiltration confirmed. Full banking operations restored within 6 hours. Zero ransom paid. Post-incident review led to zero-trust network redesign.",
  },
  {
    tag: "Government",
    tagClass: "bg-navy-100 text-navy-700",
    title: "Securing a National e-Government Portal",
    client: "Government Ministry, Botswana",
    year: "2024",
    problem:
      "Automated scanners detected persistent SQL injection attempts against a citizen-facing portal handling tax filings and ID renewals. Over 12,000 probing attempts per day.",
    solution:
      "Deployed a web application firewall with custom ruleset, re-architected the API layer to use parameterised queries throughout, and conducted a full OWASP Top 10 audit. Staff were trained on secure development practices.",
    outcome:
      "Malicious traffic dropped 99.7%. No successful injection in 12 months. Portal achieved ISO 27001-aligned security posture, enabling SADC cross-border service integration.",
  },
  {
    tag: "SME",
    tagClass: "bg-surface text-navy-700",
    title: "Phishing Campaign Neutralised — Logistics SME",
    client: "Logistics company, Zimbabwe",
    year: "2023",
    problem:
      "Staff received spoofed invoice emails mimicking a key supplier. Three employees clicked the link, entering credentials on a fake Microsoft 365 login page.",
    solution:
      "Immediate credential reset for all affected accounts. Email gateway configured with DMARC, DKIM, and SPF. Conditional access policies enforced MFA. A month-long phishing simulation programme ran for all 45 staff.",
    outcome:
      "Zero repeat incidents over 12 months. Security awareness score (measured via simulation click-rate) improved by 84%. Company now conducts quarterly drills independently.",
  },
  {
    tag: "Financial",
    tagClass: "bg-nova-100 text-nova-500",
    title: "PCI-DSS Compliance for a Mobile Payment Processor",
    client: "Fintech startup, Namibia",
    year: "2023",
    problem:
      "A rapidly growing mobile payment platform needed PCI-DSS Level 1 compliance to onboard Visa and Mastercard. Their cloud infrastructure had 23 critical and 47 high-severity findings.",
    solution:
      "12-week remediation programme: network segmentation, encryption at rest and in transit, logging and monitoring overhaul, secure code review of payment APIs, and staff training.",
    outcome:
      "Achieved PCI-DSS Level 1 certification. Onboarded both card networks within 4 months of engagement start. Zero card-data incidents since.",
  },
];

export default function CaseStudiesPage() {
  return (
    <>
      <section className="relative bg-navy-900 text-white py-16 overflow-hidden">
        <CircuitPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-nova-400 text-sm font-semibold tracking-widest uppercase mb-3">Proven Results</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Case Studies</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            Real threat scenarios. Real outcomes. Evidence of CyberNova&apos;s capability across the region.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {CASE_STUDIES.map((cs) => (
            <Card key={cs.title} className="border-border">
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className={`text-xs ${cs.tagClass}`}>{cs.tag}</Badge>
                  <span className="text-xs text-text-muted">{cs.client}</span>
                  <span className="text-xs text-text-muted">· {cs.year}</span>
                </div>
                <h2 className="text-xl font-bold text-navy-900 mb-6">{cs.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-threat mb-2">Problem</p>
                    <p className="text-sm text-navy-900 leading-relaxed">{cs.problem}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-navy-700 mb-2">Solution</p>
                    <p className="text-sm text-navy-900 leading-relaxed">{cs.solution}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-widest uppercase text-secure mb-2">Outcome</p>
                    <p className="text-sm text-navy-900 leading-relaxed">{cs.outcome}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <CTABanner />
    </>
  );
}
