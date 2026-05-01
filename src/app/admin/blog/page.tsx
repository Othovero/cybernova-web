import { adminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import AdminBlogActions from "@/components/admin/AdminBlogActions";

const STATUS_BADGE: Record<string, string> = {
  Published: "bg-secure/10 text-secure",
  Draft:     "bg-pending/10 text-pending",
};

export const revalidate = 0;

export default async function AdminBlogPage() {
  const { data: posts } = await adminClient
    .from("blog_posts")
    .select("id, title, status, published_at, created_at, author_name, tag")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Blog</h1>
          <p className="text-text-muted text-sm mt-1">Author, publish, and manage security articles.</p>
        </div>
        <a
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 text-sm bg-nova-500 hover:bg-nova-400 text-white rounded-lg px-4 h-9 font-semibold transition-colors"
        >
          <Plus size={14} /> New Post
        </a>
      </div>

      <Card className="border-border">
        <CardContent className="pt-0 px-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wide">
                {["Title", "Tag", "Status", "Date", "Author", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(posts ?? []).map((p) => (
                <tr key={p.id} className="hover:bg-surface transition-colors">
                  <td className="px-5 py-3.5 text-navy-900 font-medium max-w-xs truncate">{p.title}</td>
                  <td className="px-5 py-3.5 text-text-muted text-xs">{p.tag}</td>
                  <td className="px-5 py-3.5">
                    <Badge className={`text-xs ${STATUS_BADGE[p.status]}`}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-text-muted text-xs">
                    {p.published_at
                      ? new Date(p.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      : "— Draft"}
                  </td>
                  <td className="px-5 py-3.5 text-text-muted">{p.author_name}</td>
                  <td className="px-5 py-3.5">
                    <AdminBlogActions id={p.id} status={p.status} />
                  </td>
                </tr>
              ))}
              {(!posts || posts.length === 0) && (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-text-muted">No posts yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
