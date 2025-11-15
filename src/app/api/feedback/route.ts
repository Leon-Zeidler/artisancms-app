// src/app/api/feedback/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

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

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Get the currently authenticated user from their cookie
  // --- UPDATED to use new checkAdmin function ---
  const adminUser = await checkAdmin(supabase);

  // 2. Perform the security check ON THE SERVER
  if (!adminUser) {
    return NextResponse.json({ error: "Access Denied" }, { status: 403 });
  }

  // 3. If the check passes, create the all-powerful SERVICE ROLE client
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 4. Fetch the data using the admin client
  const { data, error } = await supabaseAdmin
    .from("feedback")
    .select(
      `
      *,
      profiles ( email, business_name )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
