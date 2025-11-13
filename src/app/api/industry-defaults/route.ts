import { NextResponse } from 'next/server';
import { applyIndustryDefaultsIfEmpty } from '@/lib/apply-industry-defaults';
import { resolveIndustry } from '@/lib/industry-templates';

export async function POST(request: Request) {
  try {
    const { profileId, industry } = await request.json();

    if (!profileId) {
      return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
    }

    const result = await applyIndustryDefaultsIfEmpty(profileId, resolveIndustry(industry));

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Failed to apply industry defaults:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
