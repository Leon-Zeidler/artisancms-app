import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { applyIndustryDefaultsIfEmpty } from '@/lib/apply-industry-defaults';
import { resolveIndustry } from '@/lib/industry-templates';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  let payload: { industry?: string } = {};
  try {
    payload = await request.json();
  } catch {
    // ignore empty body
  }

  try {
    await applyIndustryDefaultsIfEmpty(user.id, resolveIndustry(payload.industry));
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[industry-defaults] Failed to apply defaults', error);
    return NextResponse.json({ error: 'Konnte Branchenvorlage nicht anwenden.' }, { status: 500 });
  }
}
