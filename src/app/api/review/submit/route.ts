// src/app/api/review/submit/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- IMPORTANT: Use the Service Role Key for secure operations ---
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(request: Request) {
  try {
    const { token, author_name, author_handle, body } = await request.json();

    if (!token || !author_name || !body) {
      return NextResponse.json(
        { error: "Missing required fields: token, author_name, body" },
        { status: 400 },
      );
    }

    // 1. Verify the token again, this time with the admin client
    //    We also get the user_id and project_id to link the new testimonial
    const { data: requestData, error: tokenError } = await supabaseAdmin
      .from("testimonial_requests")
      .select("id, user_id, project_id, status")
      .eq("id", token)
      .single();

    if (tokenError || !requestData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    }

    if (requestData.status !== "pending") {
      return NextResponse.json(
        { error: "Review link has expired or already been used." },
        { status: 410 },
      );
    }

    // 2. Insert the new testimonial (as a draft)
    const { error: testimonialError } = await supabaseAdmin
      .from("testimonials")
      .insert({
        user_id: requestData.user_id,
        project_id: requestData.project_id,
        author_name: author_name,
        author_handle: author_handle || null,
        body: body,
        is_published: false, // Always default to draft
      });

    if (testimonialError) {
      console.error("Error saving testimonial:", testimonialError);
      return NextResponse.json(
        { error: "Could not save your review." },
        { status: 500 },
      );
    }

    // 3. Mark the request as 'completed'
    const { error: updateError } = await supabaseAdmin
      .from("testimonial_requests")
      .update({ status: "completed" })
      .eq("id", token);

    if (updateError) {
      // This isn't critical, so we just log it but still return success
      console.error(
        "Warning: Could not mark request as completed:",
        updateError.message,
      );
    }

    // 4. Success
    return NextResponse.json({
      success: true,
      message: "Testimonial submitted successfully!",
    });
  } catch (error) {
    console.error("Error in /api/review/submit:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
