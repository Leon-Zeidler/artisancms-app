// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      // Bei Fehler zum Login mit Fehlermeldung
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=auth_failed`,
      );
    }
  }
  return NextResponse.redirect(`${requestUrl.origin}/auth/confirmation`);
}
