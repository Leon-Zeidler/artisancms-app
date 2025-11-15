// src/lib/subscription.ts

import type { Profile, PlanId } from '@/contexts/ProfileContext';

// --- HIER DEFINIEREN WIR DEINE PLÄNE ---
// WICHTIG: 'export' hier
export const PLAN_LIMITS: Record<PlanId, { projects: number; team: number; testimonials: number }> = {
  geselle: {
    projects: 5,
    team: 1,
    testimonials: 3,
  },
  meister: {
    projects: 50,
    team: 10,
    testimonials: Infinity,
  },
  betrieb: {
    projects: Infinity,
    team: Infinity,
    testimonials: Infinity,
  },
};
// ---

/**
 * Prüft, ob ein Nutzer ein aktiver Beta-Tester ist.
 */
// WICHTIG: 'export' hier
export function isBetaActive(profile: Profile | null | undefined): boolean {
  if (!profile?.is_beta_tester) return false;
  if (!profile.beta_expires_at) return true; // Unbegrenzte Beta

  try {
    const expires = new Date(profile.beta_expires_at).getTime();
    const now = Date.now();
    return now < expires;
  } catch (e) {
    return false;
  }
}

/**
 * PRÜFT, OB DER NUTZER EIN GÜLTIGES ABO HAT.
 * FÜR DIE BETA-PHASE (OHNE STRIPE) SETZEN WIR DAS TEMPORÄR FÜR ALLE AUF 'true'.
 */
// WICHTIG: 'export' hier
export function hasActiveSubscription(profile: Profile | null | undefined): boolean {
  // if (!profile) return false;
  
  // TEMPORÄRE REGEL: Solange Stripe nicht live ist, hat JEDER ein aktives Abo.
  return true; 
  
  /* // --- SPÄTERE LOGIK (NACH DER BETA) ---
  // if (isBetaActive(profile)) return true;
  // return profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
  */
}

/**
 * Gibt den Plan des Nutzers zurück.
 * TEMPORÄR: Alle Nutzer (besonders Beta-Tester) bekommen den höchsten Plan.
 */
// WICHTIG: 'export' hier
export function getUserPlan(profile: Profile | null | undefined): PlanId {
  // TEMPORÄRE REGEL: Jeder ist "Betrieb"-Nutzer.
  return 'betrieb';

  /*
  // --- SPÄTERE LOGIK (NACH DER BETA) ---
  // if (!profile) return 'geselle'; // Fallback
  // if (isBetaActive(profile)) return 'betrieb'; // Beta = Höchster Plan
  // if (profile.subscription_status === 'active' && profile.plan_id) {
  //   return profile.plan_id;
  // }
  // return 'geselle'; // Fallback für gekündigte Abos etc.
  */
}

/**
 * Gibt die Feature-Limits für den aktuellen Plan des Nutzers zurück.
 */
// WICHTIG: 'export' hier
export function getPlanLimits(profile: Profile | null | undefined) {
  const plan = getUserPlan(profile);
  return PLAN_LIMITS[plan];
}

// --- FEATURE-FLAG HELPER ---

// WICHTIG: 'export' hier
export function canUseAIText(profile: Profile | null | undefined): boolean {
  const plan = getUserPlan(profile);
  return plan === 'meister' || plan === 'betrieb';
}

// WICHTIG: 'export' hier
export function canUseImageAI(profile: Profile | null | undefined): boolean {
  const plan = getUserPlan(profile);
  return plan === 'meister' || plan === 'betrieb';
}

// WICHTIG: 'export' hier
export function canUseAIReply(profile: Profile | null | undefined): boolean {
  const plan = getUserPlan(profile);
  return plan === 'betrieb';
}

// WICHTIG: 'export' hier
export function canRequestTestimonials(profile: Profile | null | undefined): boolean {
  const plan = getUserPlan(profile);
  return plan === 'meister' || plan === 'betrieb';
}