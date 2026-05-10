import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { CTABanner } from "@/components/home/CTABanner";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 0;

function Stars({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} className={i < n ? "fill-nova-500 text-nova-500" : "text-border fill-border"} />
      ))}
    </div>
  );
}

const TAG_COLORS: Record<string, string> = {
  Government: "bg-navy-100 text-navy-700",
  Financial:  "bg-nova-100 text-nova-500",
  SME:        "bg-surface text-navy-700",
};

export default async function TestimonialsPage() {
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("author_name, job_title, organisation, tag, rating, quote")
    .eq("status", "Approved")
    .order("created_at", { ascending: false });

  return (
    <>
      <section className="relative bg-navy-900 text-white py-16 overflow-hidden">
        <CircuitPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-nova-400 text-sm font-semibold tracking-widest uppercase mb-3">Client Voices</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Testimonials</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            Verified feedback from government, financial, and business clients across Southern Africa.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {testimonials && testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {testimonials.map((t, i) => (
                <Card key={i} className="border-border hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <Stars n={t.rating} />
                      <Badge className={`text-xs ${TAG_COLORS[t.tag] ?? "bg-surface text-navy-700"}`}>{t.tag}</Badge>
                    </div>
                    <p className="text-navy-900 text-sm leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-semibold text-navy-900">{t.author_name}</p>
                      {t.job_title && <p className="text-xs text-text-muted mt-0.5">{t.job_title} · {t.organisation}</p>}
                      {!t.job_title && <p className="text-xs text-text-muted mt-0.5">{t.organisation}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-muted py-16">No testimonials yet.</p>
          )}

          <div className="bg-surface border border-border rounded-xl p-8 text-center max-w-xl mx-auto">
            <h3 className="font-bold text-navy-900 text-lg mb-2">Share Your Experience</h3>
            <p className="text-text-muted text-sm mb-6">
              Are you a CyberNova client? Submit a review — all submissions are reviewed before publishing.
            </p>
            <Link
              href="/testimonials/submit"
              className="inline-flex items-center justify-center rounded-lg bg-nova-500 hover:bg-nova-400 text-white px-6 h-9 text-sm font-semibold transition-colors"
            >
              Submit a Review
            </Link>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
