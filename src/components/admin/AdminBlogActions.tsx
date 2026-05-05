"use client";

import { useRouter } from "next/navigation";
import { Eye, Trash2, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function AdminBlogActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();

  async function togglePublish() {
    const newStatus = status === "Published" ? "Draft" : "Published";
    const res = await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      toast.success(newStatus === "Published" ? "Post published" : "Post moved to draft");
    } else {
      toast.error("Failed to update post");
    }
    router.refresh();
  }

  async function deletePost() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const res = await fetch("/api/admin/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Post deleted");
    } else {
      toast.error("Failed to delete post");
    }
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={togglePublish}
        title={status === "Published" ? "Unpublish" : "Publish"}
        className="text-text-muted hover:text-nova-500 transition-colors"
      >
        <BookOpen size={14} />
      </button>
      <button className="text-text-muted hover:text-navy-900 transition-colors" title="Preview">
        <Eye size={14} />
      </button>
      <button onClick={deletePost} className="text-text-muted hover:text-threat transition-colors" title="Delete">
        <Trash2 size={14} />
      </button>
    </div>
  );
}
