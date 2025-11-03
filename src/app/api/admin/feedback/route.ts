// src/app/api/admin/feedback/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== process.env.ADMIN_USER_ID) {
    return null;
  }
  return user;
}

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const adminUser = await checkAdmin(supabase);
  if (!adminUser) {
    return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Join with profiles table to get user email
  const { data, error } = await supabaseAdmin
    .from('feedback')
    .select(`
      *,
      profiles ( email, business_name )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching admin feedback:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
