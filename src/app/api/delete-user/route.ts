// src/app/api/delete-user/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function DELETE(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 1. Get the current user to verify them
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = user.id;

    // 2. We MUST use the service role key for this
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      console.error("Missing Service Role Key or URL for admin client");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // 3. Create a temporary Admin Client
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 4. First, delete the user's public profile row
    // This will trigger cascade deletes for projects, testimonials, etc.
    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error(
        `Admin: Error deleting user profile row: ${profileDeleteError.message}`,
      );
      throw new Error(
        `Failed to delete profile data: ${profileDeleteError.message}`,
      );
    }

    // 5. Finally, delete the user from auth.users
    // This revokes their login permanently
    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error(
        `Admin: Error deleting user from auth: ${authDeleteError.message}`,
      );
      throw new Error(
        `Failed to delete user account: ${authDeleteError.message}`,
      );
    }

    // 6. Sign the user out on the client side by clearing the cookie
    // We do this by setting an empty, expired cookie
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.warn(
        "Error clearing user session after account deletion:",
        signOutError.message,
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
    const expiredDate = new Date(0);
    response.cookies.set("sb-access-token", "", {
      expires: expiredDate,
      path: "/",
    });
    response.cookies.set("sb-refresh-token", "", {
      expires: expiredDate,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("Error in delete-user route:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
