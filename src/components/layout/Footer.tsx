import Link from "next/link";
import { Logo } from "./Logo";
import { Separator } from "@/components/ui/separator";
import { CircuitPattern } from "@/components/ui/CircuitPattern";

const FOOTER_LINKS = {
  Services: [
    { label: "Government",          href: "/services#government" },
    { label: "Financial Institutions", href: "/services#financial" },
    { label: "SME Solutions",       href: "/services#sme" },
  ],
  Company: [
    { label: "Case Studies",  href: "/case-studies" },
    { label: "Blog",          href: "/blog" },
    { label: "Gallery",       href: "/gallery" },
    { label: "Testimonials",  href: "/testimonials" },
  ],
  Support: [
    { label: "Contact Security Team", href: "/contact" },
    { label: "Track Your Ticket",     href: "/track" },
    { label: "Privacy Notice",        href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="relative bg-navy-900 text-white overflow-hidden">
      <CircuitPattern />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="space-y-4">
            <Logo variant="light" height={52} />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              AI-driven cybersecurity authority serving government, financial institutions,
              and SMEs across Southern Africa.
            </p>
            <p className="text-xs text-white/40">
              Gaborone, Botswana
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} CyberNova Analytics Ltd.</p>
          <p>Bakang Othovero Raditedu -BJ11DW</p>
        </div>
      </div>
    </footer>
  );
}
