import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { CircuitPattern } from "@/components/ui/CircuitPattern";

export function Hero() {
  return (
    <section className="relative text-white overflow-hidden">
      {/* Hero background image */}
      <Image
        src="/herobg.png"
        alt=""
        fill
        className="object-cover"
        priority
        aria-hidden="true"
      />

      {/* Dark overlay so text remains readable */}
      <div className="absolute inset-0 bg-navy-900/70" />

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-30">
        <CircuitPattern />
      </div>

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#005CE6 1px, transparent 1px), linear-gradient(90deg, #005CE6 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="max-w-3xl">
          <Badge className="mb-6 bg-nova-500/15 text-nova-400 border-nova-500/30 text-xs tracking-widest uppercase font-semibold">
            <ShieldCheck size={12} className="mr-1.5" />
            AI-Driven Cybersecurity &middot; Southern Africa
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white mb-6 text-balance">
            Security Authority.<br />
            <span className="text-nova-400">Built for the Region.</span>
          </h1>

          <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-2xl">
            CyberNova Analytics protects government agencies, financial institutions,
            and SMEs across Southern Africa with AI-powered threat detection,
            rapid incident response, and continuous security intelligence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-nova-500 hover:bg-nova-400 text-white font-semibold tracking-wide px-6 h-11 text-sm transition-colors"
            >
              Contact Security Team <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 h-11 text-sm font-medium transition-colors"
            >
              View Our Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
