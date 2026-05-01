import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { author_name, job_title, organisation, tag, rating, quote } = body;

  if (!author_name?.trim() || !organisation?.trim() || !tag || !rating || !quote?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validTags = ["Government", "Financial", "SME"];
  if (!validTags.includes(tag)) {
    return NextResponse.json({ error: "Invalid tag" }, { status: 400 });
  }

  const r = Number(rating);
  if (!Number.isInteger(r) || r < 1 || r > 5) {
    return NextResponse.json({ error: "Rating must be 1–5" }, { status: 400 });
  }

  const { error } = await supabase.from("testimonials").insert({
    author_name: author_name.trim().slice(0, 100),
    job_title:   job_title?.trim().slice(0, 100) || null,
    organisation: organisation.trim().slice(0, 200),
    tag,
    rating: r,
    quote: quote.trim().slice(0, 1000),
  });

  if (error) {
    console.error("Testimonial insert error:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
