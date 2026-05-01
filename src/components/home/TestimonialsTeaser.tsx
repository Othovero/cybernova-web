import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ArrowRight } from "lucide-react";

const TESTIMONIALS = [
  {
    rating: 5,
    quote:
      "CyberNova's team responded to our incident faster than any vendor we've worked with. Their SOC team is genuinely world-class.",
    author: "IT Director",
    org: "Ministry of Finance, Botswana",
  },
  {
    rating: 5,
    quote:
      "The security audit they conducted was thorough and the remediation roadmap was practical. We've seen zero breaches since implementation.",
    author: "CISO",
    org: "First National Bank Namibia",
  },
  {
    rating: 4,
    quote:
      "Finally a cybersecurity firm that understands the Southern African context — regulations, infrastructure constraints, and budget realities.",
    author: "Managing Director",
    org: "Savanna Logistics, Zimbabwe",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? "fill-nova-500 text-nova-500" : "text-border fill-border"}
        />
      ))}
    </div>
  );
}

export function TestimonialsTeaser() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase text-nova-500 mb-3">
              Client Voices
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900">
              What Our Clients Say
            </h2>
          </div>
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-nova-500 hover:text-nova-400 transition-colors shrink-0"
          >
            All testimonials <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Card key={i} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <StarRating rating={t.rating} />
                <p className="text-navy-900 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold text-navy-900">{t.author}</p>
                  <p className="text-xs text-text-muted mt-0.5">{t.org}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
