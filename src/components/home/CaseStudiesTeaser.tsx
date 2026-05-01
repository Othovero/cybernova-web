import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const CASE_STUDIES = [
  {
    tag: "Financial",
    tagClass: "bg-nova-100 text-nova-500",
    title: "Ransomware Containment at a Regional Bank",
    problem: "A mid-sized bank detected encrypted files spreading across 40 endpoints at 2 AM.",
    solution: "CyberNova's SOC isolated affected segments within 8 minutes and deployed forensic tools.",
    outcome: "Zero data exfiltration. Full operations restored within 6 hours. Zero ransom paid.",
    href: "/case-studies/ransomware-containment",
  },
  {
    tag: "Government",
    tagClass: "bg-navy-100 text-navy-700",
    title: "Securing a National e-Government Portal",
    problem: "A government ministry's citizen portal faced persistent SQL injection probing.",
    solution: "Deployed WAF rules, re-architected API layer, and conducted full security audit.",
    outcome: "Attacks dropped 99.7%. Portal achieved ISO 27001-aligned security posture.",
    href: "/case-studies/egovernment-portal",
  },
  {
    tag: "SME",
    tagClass: "bg-surface text-navy-700",
    title: "Phishing Campaign Neutralised for Logistics SME",
    problem: "Staff at a logistics company clicked a spoofed invoice link, compromising credentials.",
    solution: "Immediate credential reset, email gateway hardening, and staff phishing simulation.",
    outcome: "Zero repeat incidents over 12 months. Security awareness score up 84%.",
    href: "/case-studies/phishing-logistics",
  },
];

export function CaseStudiesTeaser() {
  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase text-nova-500 mb-3">
              Proven Results
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">
              Case Studies
            </h2>
          </div>
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-nova-500 hover:text-nova-400 transition-colors shrink-0"
          >
            View all case studies <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CASE_STUDIES.map((cs) => (
            <Card key={cs.title} className="border-border hover:shadow-md transition-shadow flex flex-col">
              <CardContent className="pt-6 flex flex-col flex-1">
                <Badge className={`text-xs mb-4 w-fit ${cs.tagClass}`}>{cs.tag}</Badge>
                <h3 className="font-bold text-navy-900 mb-4 leading-snug">{cs.title}</h3>
                <div className="space-y-3 flex-1 text-sm">
                  <div>
                    <span className="font-semibold text-threat text-xs tracking-wide uppercase">Problem</span>
                    <p className="text-text-muted mt-1">{cs.problem}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-navy-700 text-xs tracking-wide uppercase">Solution</span>
                    <p className="text-text-muted mt-1">{cs.solution}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-secure text-xs tracking-wide uppercase">Outcome</span>
                    <p className="text-text-muted mt-1">{cs.outcome}</p>
                  </div>
                </div>
                <Link
                  href={cs.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-nova-500 hover:text-nova-400 transition-colors mt-6"
                >
                  Read full study <ArrowRight size={14} />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
