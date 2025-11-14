// src/contexts/ProfileContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import type { Industry } from '@/lib/industry-templates';

// Define the shape of the profile data
export type Profile = {
  id: string;
  slug: string | null;
  business_name: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  industry: Industry | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  keywords: string | null;
  services_description: string | null;
  about_text: string | null;
  impressum_text: string | null;
  datenschutz_text: string | null;
  is_published: boolean;
  show_services_section: boolean;
  show_team_page: boolean;
  show_testimonials_page: boolean;
  
  onboarding_complete?: boolean | null;
  has_seen_welcome_modal?: boolean | null;
  role?: string | null;
  
  // --- NEUE ABO-FELDER ---
  is_beta_tester?: boolean | null;
  beta_expires_at?: string | null; // Als string für einfaches JSON-Parsing
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: string | null;
  // --- ENDE NEUE FELDER ---
};

// 1. Create the context
const ProfileContext = createContext<Profile>(null!);

// 2. Create the Provider Component
interface ProfileProviderProps {
  children: ReactNode;
  profile: Profile;
}

export function ProfileProvider({ children, profile }: ProfileProviderProps) {
  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  );
}

// 3. Create the custom hook
export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === null) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}