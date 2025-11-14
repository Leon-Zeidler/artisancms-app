// src/lib/subscription.ts

import type { Profile } from '@/contexts/ProfileContext';

/**
 * Prüft, ob ein Nutzer ein aktiver Beta-Tester ist (Flag gesetzt und Datum noch nicht abgelaufen).
 */
export function isBetaActive(profile: Profile | null | undefined): boolean {
  if (!profile?.is_beta_tester) return false;
  
  // Wenn kein Ablaufdatum gesetzt ist, ist Beta "unendlich" aktiv (Fail-Safe)
  if (!profile.beta_expires_at) return true; 

  try {
    const expires = new Date(profile.beta_expires_at).getTime();
    const now = Date.now();
    return now < expires;
  } catch (e) {
    console.error("Could not parse beta_expires_at date", e);
    return false; // Bei ungültigem Datum lieber auf "abgelaufen" setzen
  }
}

/**
 * Prüft, ob der Nutzer ein gültiges Abo (Beta ODER Stripe) hat.
 */
export function hasActiveSubscription(profile: Profile | null | undefined): boolean {
  if (!profile) return false;

  // Beta-Tester gelten immer als "aktiv"
  if (isBetaActive(profile)) return true; 

  // Spätere Erweiterung für Stripe:
  return profile.subscription_status === 'active' || profile.subscription_status === 'trialing';
}