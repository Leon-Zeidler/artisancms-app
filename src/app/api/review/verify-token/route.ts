// src/app/api/review/verify-token/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We can use the anon key for this read-only, RLS-protected query
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // --- NEW STRATEGY ---
    // 1. Fetch the request itself
    const { data: requestData, error: requestError } = await supabase
      .from('testimonial_requests')
      .select('status, project_id, profile_id')
      .eq('id', token)
      .single();

    if (requestError || !requestData) {
      console.error("Verify token error:", requestError);
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    if (requestData.status !== 'pending') {
      return NextResponse.json({ error: 'This review link has expired or already been used.' }, { status: 410 });
    }

    // 2. Fetch the project details
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('title')
      .eq('id', requestData.project_id)
      .single();

    if (projectError) {
      console.error("Project fetch error:", projectError);
      return NextResponse.json({ error: 'Could not find project details' }, { status: 500 });
    }

    // 3. Fetch the profile details
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('business_name')
      .eq('id', requestData.profile_id)
      .single();
    
    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return NextResponse.json({ error: 'Could not find business details' }, { status: 500 });
    }
    // --- END NEW STRATEGY ---

    // Success! Return the non-sensitive project info
    return NextResponse.json({
      projectTitle: projectData?.title || 'ein Projekt',
      businessName: profileData?.business_name || 'dem Betrieb',
    });

  } catch (error) {
    console.error("Error in /api/review/verify-token:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

