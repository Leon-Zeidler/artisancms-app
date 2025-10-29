// src/app/api/feedback/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = cookies();
  // Note: This helper is for Next.js App Router (pages/api uses a different one)
  // Ensure you've installed @supabase/auth-helpers-nextjs
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 1. Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse the request body
    const { category, message, page_url } = await request.json();

    if (!message || !category) {
      return NextResponse.json({ error: 'Category and message are required' }, { status: 400 });
    }

    // 3. Insert into the database
    const { error: insertError } = await supabase
      .from('feedback') // Make sure you created this table in Supabase
      .insert({
        user_id: user.id,
        category,
        message,
        page_url
      });

    if (insertError) {
      console.error('Error saving feedback:', insertError);
      return NextResponse.json({ error: `Database error: ${insertError.message}` }, { status: 500 });
    }

    // 4. Send success response
    return NextResponse.json({ success: true, message: 'Feedback submitted successfully' });

  } catch (error) {
    console.error('Error in feedback route:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}