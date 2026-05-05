import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import { ArrowLeft, Clock, User } from "lucide-react";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em;color:#1A3560">$1</code>');
}

function renderMarkdown(raw: string): string {
  const lines = raw.trim().split("\n");
  let html = "";
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { html += "</ul>"; inUl = false; }
    if (inOl) { html += "</ol>"; inOl = false; }
  };

  for (const line of lines) {
    const ulMatch  = line.match(/^[-*•]\s+(.+)/);
    const olMatch  = line.match(/^\d+\.\s+(.+)/);
    const h1Match  = line.match(/^#\s+(.+)/);
    const h2Match  = line.match(/^##\s+(.+)/);
    const h3Match  = line.match(/^###\s+(.+)/);

    if (ulMatch) {
      if (inOl) { html += "</ol>"; inOl = false; }
      if (!inUl) { html += '<ul style="padding-left:20px;margin:12px 0;list-style:disc">'; inUl = true; }
      html += `<li style="margin-bottom:4px;color:#1A3560">${formatInline(ulMatch[1])}</li>`;
    } else if (olMatch) {
      if (inUl) { html += "</ul>"; inUl = false; }
      if (!inOl) { html += '<ol style="padding-left:20px;margin:12px 0;list-style:decimal">'; inOl = true; }
      html += `<li style="margin-bottom:4px;color:#1A3560">${formatInline(olMatch[1])}</li>`;
    } else {
      closeList();
      if (h1Match) {
        html += `<h2 style="font-size:1.5rem;font-weight:700;color:#0B1F3A;margin:28px 0 10px">${formatInline(h1Match[1])}</h2>`;
      } else if (h2Match) {
        html += `<h3 style="font-size:1.2rem;font-weight:700;color:#0B1F3A;margin:24px 0 8px">${formatInline(h2Match[1])}</h3>`;
      } else if (h3Match) {
        html += `<h4 style="font-size:1rem;font-weight:600;color:#1A3560;margin:20px 0 6px">${formatInline(h3Match[1])}</h4>`;
      } else if (line.trim() === "") {
        html += '<div style="height:12px"></div>';
      } else {
        html += `<p style="margin:0 0 8px;color:#0B1F3A;line-height:1.75">${formatInline(line)}</p>`;
      }
    }
  }
  closeList();
  return html;
}

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
            <div
              className="max-w-none text-base"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }}
            />
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
