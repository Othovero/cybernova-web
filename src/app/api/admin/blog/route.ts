import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await req.json();
  const { title, excerpt, body: postBody, tag, author_name, status, read_time } = body;

  if (!title?.trim() || !tag || !author_name?.trim()) {
    return NextResponse.json({ error: "title, tag, and author_name are required" }, { status: 400 });
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 80);

  const { data, error } = await adminClient
    .from("blog_posts")
    .insert({
      slug,
      title:       title.trim(),
      excerpt:     excerpt?.trim() || null,
      body:        postBody?.trim() || null,
      tag,
      author_name: author_name.trim(),
      status:      status === "Published" ? "Published" : "Draft",
      read_time:   read_time?.trim() || null,
      published_at: status === "Published" ? new Date().toISOString() : null,
      created_by:  user.id,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (updates.status === "Published") updates.published_at = new Date().toISOString();

  const { error } = await adminClient.from("blog_posts").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await adminClient.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}
