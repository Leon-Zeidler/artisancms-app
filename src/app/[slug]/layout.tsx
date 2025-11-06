// src/app/[slug]/layout.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { ProfileContext, ProfileData } from '@/contexts/ProfileContext'; // Import the new context
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// --- Default colors and helper function (Moved from pages) ---
const DEFAULT_PRIMARY = '#ea580c'; // orange-600
const DEFAULT_SECONDARY = '#ffffff'; // white

const darkenColor = (hex: string, amount: number = 20): string => {
    if (!hex) return DEFAULT_PRIMARY;
    try {
      let color = hex.startsWith('#') ? hex.slice(1) : hex;
      if (color.length === 3) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
      }
      let r = parseInt(color.substring(0, 2), 16);
      let g = parseInt(color.substring(2, 4), 16);
      let b = parseInt(color.substring(4, 6), 16);
      r = Math.max(0, r - amount);
      g = Math.max(0, g - amount);
      b = Math.max(0, b - amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch (e) {
      return DEFAULT_PRIMARY; // Return default on error
    }
};

export default function SlugLayout({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return notFound();
    }

    const fetchProfile = async () => {
      setLoading(true);

      // --- UPDATE THIS .select() QUERY ---
      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .select('id, business_name, address, phone, services_description, about_text, slug, logo_url, primary_color, secondary_color, email, impressum_text, datenschutz_text')
        .eq('slug', slug)
        .maybeSingle();
      // --- END OF FIX ---

      if (profileError) {
        console.error("Layout fetch error:", profileError);
        setLoading(false);
        return notFound();
      }
      if (!profileResult) {
        return notFound();
      }

      // Set defaults and computed values
      const pColor = profileResult.primary_color || DEFAULT_PRIMARY;
      const sColor = profileResult.secondary_color || DEFAULT_SECONDARY;

      setProfile({
        ...profileResult, // This will now include impressum_text and datenschutz_text
        primary_color: pColor,
        secondary_color: sColor,
        primary_color_dark: darkenColor(pColor),
      });
      setLoading(false);
    };

    fetchProfile();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Lade Webseite...</div>;
  }

  if (!profile) {
    // This case is handled by notFound() but good for safety
    return <div className="min-h-screen flex items-center justify-center">Profil nicht gefunden.</div>;
  }

  return (
    <ProfileContext.Provider value={profile}>
      <div
        className="flex min-h-screen flex-col bg-white text-gray-900"
        style={{
          '--color-brand-primary': profile.primary_color,
          '--color-brand-primary-dark': profile.primary_color_dark,
          '--color-brand-secondary': profile.secondary_color,
        } as React.CSSProperties}
      >
        <Navbar
          businessName={profile.business_name}
          slug={profile.slug}
          logoUrl={profile.logo_url}
        />
        <main className="flex-grow isolate">
          {children}
        </main>
        <Footer
          businessName={profile.business_name}
          slug={profile.slug}
        />
      </div>
    </ProfileContext.Provider>
  );
}