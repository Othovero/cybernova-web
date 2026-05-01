"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

const TAGS = [
  "Threat Intelligence",
  "Technical",
  "Compliance",
  "Architecture",
  "Awareness",
];

export default function NewBlogPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const [form, setForm] = useState({
    title:       "",
    excerpt:     "",
    body:        "",
    tag:         TAGS[0],
    author_name: "",
    read_time:   "",
    status:      "Draft",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create post.");
      setLoading(false);
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="text-text-muted hover:text-navy-900 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-navy-900">New Post</h1>
          <p className="text-text-muted text-sm mt-0.5">Draft or publish a security article.</p>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Ransomware Trends in Southern Africa 2025"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="author_name">Author *</Label>
                <Input
                  id="author_name"
                  value={form.author_name}
                  onChange={(e) => set("author_name", e.target.value)}
                  placeholder="e.g. Dr. A. Motsepe"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="read_time">Read Time</Label>
                <Input
                  id="read_time"
                  value={form.read_time}
                  onChange={(e) => set("read_time", e.target.value)}
                  placeholder="e.g. 5 min read"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="tag">Tag *</Label>
                <select
                  id="tag"
                  value={form.tag}
                  onChange={(e) => set("tag", e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {TAGS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={2}
                placeholder="One or two sentences summarising the article."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="body">Article Body</Label>
              <textarea
                id="body"
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                rows={12}
                placeholder="Write the full article here..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-threat bg-threat/10 rounded-lg px-3 py-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Button
                type="submit"
                disabled={loading}
                className="bg-nova-500 hover:bg-nova-400 text-white font-semibold"
              >
                {loading ? <Loader2 size={15} className="animate-spin mr-2" /> : null}
                {form.status === "Published" ? "Publish Post" : "Save Draft"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
