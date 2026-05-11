import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import { ArrowRight, Clock } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TAG_COLORS: Record<string, string> = {
  "Threat Intelligence": "bg-threat/10 text-threat",
  "Technical":          "bg-navy-100 text-navy-700",
  "Compliance":         "bg-nova-100 text-nova-500",
  "Architecture":       "bg-surface text-navy-700",
  "Awareness":          "bg-secure/10 text-secure",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, tag, author_name, read_time, published_at")
    .eq("status", "Published")
    .order("published_at", { ascending: false });

  return (
    <>
      <section className="relative bg-navy-900 text-white py-16 overflow-hidden">
        <CircuitPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-nova-400 text-sm font-semibold tracking-widest uppercase mb-3">Security Intelligence</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Blog</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            Technical articles, threat briefings, and compliance guidance from the CyberNova team.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {(!posts || posts.length === 0) ? (
            <p className="text-center text-text-muted py-20">No articles published yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card key={post.slug} className="border-border hover:shadow-md transition-shadow flex flex-col">
                  <CardContent className="pt-6 flex flex-col flex-1">
                    <Badge className={`text-xs mb-4 w-fit ${TAG_COLORS[post.tag] ?? "bg-surface text-navy-700"}`}>
                      {post.tag}
                    </Badge>
                    <h2 className="font-bold text-navy-900 leading-snug mb-3 flex-1">{post.title}</h2>
                    {post.excerpt && (
                      <p className="text-sm text-text-muted leading-relaxed mb-4">{post.excerpt}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-text-muted border-t border-border pt-4 mt-auto">
                      {post.read_time && (
                        <span className="flex items-center gap-1"><Clock size={12} /> {post.read_time}</span>
                      )}
                      {post.published_at && (
                        <span>{new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                      )}
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-nova-500 hover:text-nova-400 transition-colors mt-4"
                    >
                      Read article <ArrowRight size={14} />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
