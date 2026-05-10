import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

const VALID_ROLES = ["analyst", "manager"] as const;

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { id, role } = await req.json();
  if (!id || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { error } = await adminClient
    .from("profiles")
    .update({ role })
    .eq("id", id)
    .neq("role", "admin"); // protect the admin account from being demoted via API

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });

  return NextResponse.json({ success: true });
}
