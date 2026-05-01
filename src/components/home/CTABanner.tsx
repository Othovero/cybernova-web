import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { CircuitPattern } from "@/components/ui/CircuitPattern";

export function CTABanner() {
  return (
    <section className="relative bg-navy-900 py-16 overflow-hidden">
      <CircuitPattern />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
              <ShieldAlert size={20} className="text-nova-400" />
              <span className="text-nova-400 text-sm font-semibold tracking-widest uppercase">
                Incident? Act Now.
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Ready to Secure Your Organisation?
            </h2>
            <p className="text-white/60 max-w-xl">
              Submit a service request and receive an AI-generated threat assessment within minutes.
              Our security team operates 24/7 across Southern Africa.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-nova-500 hover:bg-nova-400 text-white font-semibold px-6 h-11 text-sm transition-colors"
            >
              Contact Security Team <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-transparent hover:bg-white/10 text-white px-6 h-11 text-sm font-medium transition-colors"
            >
              Track Existing Ticket
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
