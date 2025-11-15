// src/app/api/admin/feedback/update/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// --- UPDATED ADMIN CHECK ---
async function checkAdmin(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return null; // No user
  }

  // Use the SERVICE_ROLE_KEY to securely check the user's role
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.warn(`Admin check failed for user ${user.id}: ${error?.message}`);
    return null; // Profile not found or error
  }

  if (profile.role === "admin") {
    return user; // User is an admin
  }

  return null; // Not an admin
}
// --- END OF UPDATE ---

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const adminUser = await checkAdmin(supabase);
  if (!adminUser) {
    return NextResponse.json({ error: "Access Denied" }, { status: 403 });
  }

  const { feedbackId, admin_notes, is_resolved } = await request.json();
  if (!feedbackId) {
    return NextResponse.json(
      { error: "Feedback ID is required" },
      { status: 400 },
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabaseAdmin
    .from("feedback")
    .update({
      admin_notes: admin_notes,
      is_resolved: is_resolved,
    })
    .eq("id", feedbackId)
    .select(
      `
      *,
      profiles ( email, business_name )
    `,
    )
    .single();

  if (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
