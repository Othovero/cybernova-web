import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CTABanner } from "@/components/home/CTABanner";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import { Building2, Landmark, Store, CheckCircle2 } from "lucide-react";

const SEGMENTS = [
  {
    id: "government",
    icon: Landmark,
    label: "Government",
    headline: "Secure National Infrastructure",
    description:
      "State-level cyber threats demand state-level defence. CyberNova partners with government ministries, agencies, and parastatals to protect critical infrastructure, secure citizen data, and maintain continuity of essential public services.",
    packages: [
      {
        name: "Infrastructure Shield",
        price: "From BWP 45,000/yr",
        features: ["24/7 SOC monitoring", "Critical asset mapping", "Threat intelligence feeds", "Incident response retainer", "Quarterly security reviews"],
      },
      {
        name: "Compliance Assurance",
        price: "From BWP 28,000/yr",
        features: ["POPIA gap assessment", "Policy & procedure review", "Staff awareness training", "Audit-ready documentation", "Annual penetration test"],
      },
    ],
  },
  {
    id: "financial",
    icon: Building2,
    label: "Financial Institutions",
    headline: "Defend Financial Assets",
    description:
      "Banks, insurers, and payment processors face the highest-value targets. Our financial security practice combines regulatory expertise with advanced threat detection to keep transactions secure and auditors satisfied.",
    packages: [
      {
        name: "Financial Fortress",
        price: "From BWP 60,000/yr",
        features: ["Real-time fraud detection", "PCI-DSS compliance", "SWIFT security controls", "SOC-as-a-Service", "DDoS mitigation"],
      },
      {
        name: "Red Team Assessment",
        price: "From BWP 35,000/engagement",
        features: ["Full-scope penetration test", "Social engineering simulation", "Physical security review", "Detailed findings report", "Remediation workshop"],
      },
    ],
  },
  {
    id: "sme",
    icon: Store,
    label: "SME Solutions",
    headline: "Enterprise Security, SME Budget",
    description:
      "Small and medium businesses are increasingly targeted precisely because security is often under-resourced. Our SME packages deliver the essentials without enterprise overhead.",
    packages: [
      {
        name: "Essentials Pack",
        price: "From BWP 8,000/yr",
        features: ["Vulnerability scanning", "Endpoint protection setup", "Email gateway hardening", "Staff phishing simulation", "Monthly security report"],
      },
      {
        name: "Growth Pack",
        price: "From BWP 18,000/yr",
        features: ["Everything in Essentials", "Annual penetration test", "Incident response support", "Cloud security review", "Quarterly advisory call"],
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Page header */}
      <section className="relative bg-navy-900 text-white py-16 overflow-hidden">
        <CircuitPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-nova-400 text-sm font-semibold tracking-widest uppercase mb-3">Our Solutions</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Security Packages</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            Tailored cybersecurity services for government, financial institutions, and SMEs across Southern Africa.
          </p>
        </div>
      </section>

      {/* Segments */}
      {SEGMENTS.map((seg) => {
        const Icon = seg.icon;
        return (
          <section key={seg.id} id={seg.id} className="py-20 even:bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-navy-100 rounded-lg">
                  <Icon size={22} className="text-navy-900" />
                </div>
                <Badge className="bg-nova-100 text-nova-500 text-xs">{seg.label}</Badge>
              </div>
              <h2 className="text-3xl font-bold text-navy-900 mb-3">{seg.headline}</h2>
              <p className="text-text-muted max-w-2xl mb-10">{seg.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                {seg.packages.map((pkg) => (
                  <Card key={pkg.name} className="border-border">
                    <CardHeader className="pb-2">
                      <h3 className="font-bold text-navy-900 text-lg">{pkg.name}</h3>
                      <p className="text-nova-500 font-semibold text-sm">{pkg.price}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {pkg.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-navy-900">
                            <CheckCircle2 size={15} className="text-secure mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <CTABanner />
    </>
  );
}
