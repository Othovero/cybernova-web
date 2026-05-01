import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await req.json();
  const { status, assigned_to, note } = body;

  const validStatuses = ["Pending", "Assigned", "In Progress", "Resolved", "Archived"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updatePayload: Record<string, unknown> = {};
  if (status) updatePayload.status = status;
  if (assigned_to !== undefined) updatePayload.assigned_to = assigned_to || null;

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await adminClient
      .from("tickets")
      .update(updatePayload)
      .eq("id", params.id);
    if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  if (status || note) {
    await adminClient.from("ticket_history").insert({
      ticket_id:  params.id,
      status:     status || "In Progress",
      note:       note?.trim().slice(0, 1000) || null,
      changed_by: user.id,
    });
  }

  return NextResponse.json({ success: true });
}
