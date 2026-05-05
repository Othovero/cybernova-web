import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import { ArrowLeft, Clock, User } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TAG_COLORS: Record<string, string> = {
  "Threat Intelligence": "bg-threat/10 text-threat",
  "Technical":           "bg-navy-100 text-navy-700",
  "Compliance":          "bg-nova-100 text-nova-500",
  "Architecture":        "bg-surface text-navy-700",
  "Awareness":           "bg-secure/10 text-secure",
};

export const revalidate = 60;

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, excerpt, body, tag, author_name, read_time, published_at")
    .eq("slug", params.slug)
    .eq("status", "Published")
    .single();

  if (!post) notFound();

  return (
    <>
      <section className="relative bg-navy-900 text-white py-16 overflow-hidden">
        <CircuitPattern />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft size={14} /> All articles
          </Link>
          <Badge className={`text-xs mb-4 ${TAG_COLORS[post.tag] ?? "bg-surface text-navy-700"}`}>
            {post.tag}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/50">
            {post.author_name && (
              <span className="flex items-center gap-1.5">
                <User size={13} /> {post.author_name}
              </span>
            )}
            {post.read_time && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} /> {post.read_time}
              </span>
            )}
            {post.published_at && (
              <span>
                {new Date(post.published_at).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {post.excerpt && (
            <p className="text-lg text-text-muted leading-relaxed mb-10 pb-10 border-b border-border">
              {post.excerpt}
            </p>
          )}
          {post.body ? (
            <div className="prose prose-navy max-w-none text-navy-900 leading-relaxed whitespace-pre-wrap text-base">
              {post.body}
            </div>
          ) : (
            <p className="text-text-muted">No content available.</p>
          )}
          <div className="mt-16 pt-8 border-t border-border">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-nova-500 hover:text-nova-400 transition-colors"
            >
              <ArrowLeft size={14} /> Back to all articles
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
