import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { INDUSTRY_TEMPLATES, resolveIndustry, type Industry } from './industry-templates';

type ProfileContent = {
  business_name: string | null;
  address: string | null;
  services_description: string | null;
  about_text: string | null;
};

let cachedClient: SupabaseClient | null = null;

const getServiceClient = () => {
  if (cachedClient) return cachedClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service credentials are missing');
  }

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return cachedClient;
};

const extractCityFromAddress = (address: string | null): string | null => {
  if (!address) return null;
  const trimmed = address.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/\n|,/).map(part => part.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  return parts[parts.length - 1];
};

export async function applyIndustryDefaultsIfEmpty(profileId: string, rawIndustry?: Industry | string | null) {
  if (!profileId) {
    return { applied: false };
  }

  const supabase = getServiceClient();
  const industry = resolveIndustry(rawIndustry ?? undefined);
  const template = INDUSTRY_TEMPLATES[industry];

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('business_name, address, services_description, about_text')
    .eq('id', profileId)
    .single<ProfileContent>();

  if (profileError) {
    throw profileError;
  }

  const { count: projectsCount, error: projectsError } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', profileId);

  if (projectsError) {
    throw projectsError;
  }

  const hasServices = Boolean(profile?.services_description && profile.services_description.trim().length > 0);
  const hasAbout = Boolean(profile?.about_text && profile.about_text.trim().length > 0);
  const hasProjects = typeof projectsCount === 'number' && projectsCount > 0;

  if (hasServices || hasAbout || hasProjects) {
    return { applied: false };
  }

  const city = extractCityFromAddress(profile?.address) || 'Ihrer Region';
  const heroTitle = template.heroTitle.replace('[Ort]', city);
  const heroSubtitle = template.heroSubtitle.replace('[Ort]', city);

  const updates: Partial<ProfileContent & { services_description: string }> = {};

  if (!profile?.business_name) {
    updates.business_name = heroTitle;
  }
  if (!hasAbout) {
    updates.about_text = heroSubtitle;
  }
  if (!hasServices) {
    updates.services_description = template.defaultServices.join('\n');
  }

  if (Object.keys(updates).length === 0) {
    return { applied: false };
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId);

  if (updateError) {
    throw updateError;
  }

  return { applied: true };
}
