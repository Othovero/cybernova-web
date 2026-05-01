import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Banknote, Briefcase, ArrowRight, Check, Star } from "lucide-react";

const SERVICES = [
  {
    icon: Shield,
    iconBg: "bg-navy-100",
    iconColor: "text-navy-900",
    segment: "Government",
    badge: "Public Sector",
    badgeClass: "bg-navy-100 text-navy-700",
    headline: "Secure National Infrastructure",
    description:
      "Protecting critical government systems, citizen data repositories, and inter-agency networks against state-level and advanced persistent threats.",
    items: ["Critical infrastructure protection", "Secure inter-agency connectivity", "Incident response & forensics", "Security awareness training"],
    href: "/services#government",
  },
  {
    icon: Banknote,
    iconBg: "bg-nova-100",
    iconColor: "text-nova-500",
    segment: "Financial Institutions",
    badge: "Banking & Finance",
    badgeClass: "bg-nova-100 text-nova-500",
    headline: "Defend Financial Assets",
    description:
      "Comprehensive security programmes for banks, insurers, and payment processors — built to meet FATF, FICA, and regional regulatory requirements.",
    items: ["Fraud detection & prevention", "PCI-DSS compliance assessments", "Penetration testing", "SOC-as-a-Service"],
    href: "/services#financial",
    featured: true,
  },
  {
    icon: Briefcase,
    iconBg: "bg-surface",
    iconColor: "text-navy-700",
    segment: "SMEs",
    badge: "Small & Medium Business",
    badgeClass: "bg-surface text-navy-700",
    headline: "Enterprise Security, SME Budget",
    description:
      "Right-sized cybersecurity packages that give growing businesses the same threat intelligence and response capability as large enterprises.",
    items: ["Vulnerability assessments", "Endpoint protection", "Email security & anti-phishing", "Staff security training"],
    href: "/services#sme",
  },
];

export function ServicesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-semibold tracking-widest uppercase text-nova-500 mb-3">
            Our Solutions
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
            Security Packages by Sector
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Tailored cybersecurity solutions for every client type — from national government
            ministries to growing SMEs across Southern Africa.
          </p>
        </div>

        {/* Extra top padding gives room for the "Most Requested" badge to overflow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <div key={svc.segment} className="relative">
                {svc.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="inline-flex items-center gap-1.5 bg-nova-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide shadow-md">
                      <Star size={11} className="fill-white" /> Most Requested
                    </span>
                  </div>
                )}
                <Card
                  className={`flex flex-col h-full border transition-shadow hover:shadow-lg ${
                    svc.featured
                      ? "border-nova-500 shadow-md ring-1 ring-nova-500/20"
                      : "border-border"
                  }`}
                >
                  <CardHeader className="pb-4 pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-lg ${svc.iconBg}`}>
                        <Icon size={22} className={svc.iconColor} />
                      </div>
                      <Badge className={`text-xs font-medium border-0 ${svc.badgeClass}`}>
                        {svc.badge}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-navy-900">{svc.headline}</h3>
                    <p className="text-sm text-text-muted leading-relaxed mt-2">{svc.description}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {svc.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-navy-900">
                          <Check size={14} className="text-nova-500 mt-0.5 shrink-0" strokeWidth={2.5} />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={svc.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-nova-500 hover:text-nova-400 transition-colors"
                    >
                      Learn more <ArrowRight size={14} />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
