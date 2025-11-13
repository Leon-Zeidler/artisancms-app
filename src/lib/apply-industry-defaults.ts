import { createClient } from '@supabase/supabase-js';
import { INDUSTRY_TEMPLATES, resolveIndustry, type Industry } from './industry-templates';

const getAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error('Supabase Service Role credentials are missing');
  }
  return createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

export async function applyIndustryDefaultsIfEmpty(profileId: string, rawIndustry?: string | null) {
  const supabaseAdmin = getAdminClient();
  const industry: Industry = resolveIndustry(rawIndustry);
  const template = INDUSTRY_TEMPLATES[industry] ?? INDUSTRY_TEMPLATES.sonstiges;

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id, hero_title, hero_subtitle, services_description, industry')
    .eq('id', profileId)
    .single();

  if (error) {
    console.error('[industry-defaults] Failed to load profile', error.message);
    throw error;
  }

  const normalizedIndustry = resolveIndustry(profile?.industry ?? industry);
  const { count: projectCount } = await supabaseAdmin
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profileId);

  const hasProjects = (projectCount ?? 0) > 0;
  const hasContent = Boolean(
    (profile?.hero_title && profile.hero_title.trim().length > 0) ||
      (profile?.hero_subtitle && profile.hero_subtitle.trim().length > 0) ||
      (profile?.services_description && profile.services_description.trim().length > 0)
  );

  if (hasProjects || hasContent) {
    return;
  }

  const updates = {
    id: profileId,
    hero_title: template.heroTitle,
    hero_subtitle: template.heroSubtitle,
    services_description: template.defaultServices.join('\n'),
    industry: normalizedIndustry,
  };

  const { error: updateError } = await supabaseAdmin.from('profiles').upsert(updates);
  if (updateError) {
    console.error('[industry-defaults] Failed to apply defaults', updateError.message);
    throw updateError;
  }
}
