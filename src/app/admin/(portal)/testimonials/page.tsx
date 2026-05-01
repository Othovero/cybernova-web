import { adminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import TestimonialActions from "@/components/admin/TestimonialActions";

const STATUS_BADGE: Record<string, string> = {
  Pending:  "bg-pending/10 text-pending",
  Approved: "bg-secure/10 text-secure",
  Rejected: "bg-threat/10 text-threat",
};

export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  const { data: testimonials } = await adminClient
    .from("testimonials")
    .select("id, author_name, organisation, tag, rating, quote, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Testimonials</h1>
        <p className="text-text-muted text-sm mt-1">Review and approve client submissions.</p>
      </div>

      <Card className="border-border">
        <CardContent className="pt-0 px-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wide">
                {["Author", "Organisation", "Quote", "Rating", "Status", "Date", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(testimonials ?? []).map((t) => (
                <tr key={t.id} className="hover:bg-surface transition-colors">
                  <td className="px-5 py-3 text-navy-900 font-medium">{t.author_name}</td>
                  <td className="px-5 py-3 text-text-muted">{t.organisation}</td>
                  <td className="px-5 py-3 text-text-muted max-w-xs">
                    <p className="truncate text-xs italic">&ldquo;{t.quote}&rdquo;</p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} className={i < t.rating ? "fill-nova-500 text-nova-500" : "text-border fill-border"} />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={`text-xs ${STATUS_BADGE[t.status]}`}>{t.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-text-muted text-xs">
                    {new Date(t.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-5 py-3">
                    <TestimonialActions id={t.id} status={t.status} />
                  </td>
                </tr>
              ))}
              {(!testimonials || testimonials.length === 0) && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-text-muted">No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
