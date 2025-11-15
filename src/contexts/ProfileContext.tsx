// src/contexts/ProfileContext.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { Industry } from "@/lib/industry-templates";

// Die Profile-Definition, die alle Felder (auch die neuen) enthält
export type Profile = {
  id: string;
  business_name: string | null;
  slug: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  industry: Industry | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  about_text: string | null;
  services_description: string | null;
  keywords: string | null;
  impressum_text: string | null;
  datenschutz_text: string | null;
  is_published: boolean;
  has_seen_welcome_modal: boolean;
  beta_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  plan_id: string | null;
  role: "admin" | "user" | null;
  
  // Die Felder für die Sichtbarkeit der Seiten
  show_services_section: boolean;
  show_team_page: boolean;
  show_testimonials_page: boolean;
  show_zertifikate_page: boolean; // <-- Dein neues Feld
};
// ---

type ProfileContextType = {
  profile: Profile | null;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({
  profile,
  children,
}: {
  profile: Profile | null;
  children: ReactNode;
}) => {
  return (
    <ProfileContext.Provider value={{ profile }}>
      {children}
    </ProfileContext.Provider>
  );
};

// --- FIX 1: HIER WIRD DER useProfile HOOK KORRIGIERT ---
// Er gibt jetzt wieder direkt 'profile' zurück, was alle Fehler auf deinen [slug] Seiten behebt.
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context.profile; 
};
// --- ENDE FIX 1 ---

// --- FIX 2: Fehlender 'PlanId' Typ hinzugefügt ---
// Dies behebt den Fehler in 'api/billing/create-checkout-session/route.ts'
export type PlanId = 'free' | 'pro' | 'unlimited' | string;
// --- ENDE FIX 2 ---