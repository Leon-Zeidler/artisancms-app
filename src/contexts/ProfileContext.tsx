// src/contexts/ProfileContext.tsx
"use client";

import { createContext, useContext } from 'react';

// Define the shape of your profile data that pages need
export type ProfileData = {
  id: string;
  business_name: string | null;
  address: string | null;
  phone: string | null;
  services_description: string | null;
  about_text: string | null;
  slug: string | null;
  logo_url: string | null;
  primary_color: string;
  primary_color_dark: string;
  secondary_color: string;
  email: string | null;
  // --- ADD THESE TWO LINES ---
  impressum_text: string | null;
  datenschutz_text: string | null;
  // --- END OF FIX ---
};

export const ProfileContext = createContext<ProfileData | null>(null);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider (check your layout.tsx)');
  }
  return context;
};