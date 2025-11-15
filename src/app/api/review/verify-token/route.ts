// src/app/api/review/verify-token/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error(
        "Missing Supabase Service Key configuration for review token verification.",
      );
      return NextResponse.json(
        { error: "Server configuration error (database)." },
        { status: 500 },
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // 1. Fetch the request itself
    // --- START KORREKTUR 1 ---
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from("testimonial_requests")
      .select("status, project_id, user_id") // <-- 'profile_id' zu 'user_id' geändert
      .eq("id", token)
      .single();
    // --- ENDE KORREKTUR 1 ---

    if (requestError || !requestData) {
      console.error("Verify token error (Admin Client):", requestError);
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    if (requestData.status !== "pending") {
      return NextResponse.json(
        { error: "This review link has expired or already been used." },
        { status: 410 },
      );
    }

    // 2. Fetch the project details
    const { data: projectData, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("title")
      .eq("id", requestData.project_id)
      .single();

    if (projectError) {
      console.error("Project fetch error (Admin Client):", projectError);
      return NextResponse.json(
        { error: "Could not find project details" },
        { status: 500 },
      );
    }

    // 3. Fetch the profile details
    // --- START KORREKTUR 2 ---
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("business_name")
      .eq("id", requestData.user_id) // <-- 'requestData.profile_id' zu 'requestData.user_id' geändert
      .single();
    // --- ENDE KORREKTUR 2 ---

    if (profileError) {
      console.error("Profile fetch error (Admin Client):", profileError);
      return NextResponse.json(
        { error: "Could not find business details" },
        { status: 500 },
      );
    }

    // Success! Return the non-sensitive project info
    return NextResponse.json({
      projectTitle: projectData?.title || "ein Projekt",
      businessName: profileData?.business_name || "dem Betrieb",
    });
  } catch (error) {
    console.error("Error in /api/review/verify-token:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
