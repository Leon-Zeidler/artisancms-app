// src/app/[slug]/datenschutz/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define Profile type (Updated)
type Profile = {
    id: string;
    business_name: string | null;
    slug: string | null;
    datenschutz_text: string | null;
    logo_url: string | null;        // <-- New
    primary_color: string | null;   // <-- New
    secondary_color: string | null; // <-- New
};

// --- Constants ---
const DEFAULT_PRIMARY = '#ea580c'; // orange-600
const DEFAULT_SECONDARY = '#475569'; // slate-600

// --- Helper Function to Darken Color (Simple Approximation) ---
const darkenColor = (hex: string, amount: number = 20): string => {
    try {
      let color = hex.startsWith('#') ? hex.slice(1) : hex;
      let r = parseInt(color.substring(0, 2), 16);
      let g = parseInt(color.substring(2, 4), 16);
      let b = parseInt(color.substring(4, 6), 16);
      r = Math.max(0, r - amount); g = Math.max(0, g - amount); b = Math.max(0, b - amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch (e) { console.error("Failed to darken color:", hex, e); return hex; }
};

export default function DatenschutzPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  // Fetch profile data (Updated)
  useEffect(() => {
     if (!slug) {
        setError("Seitenpfad (Slug) fehlt."); setLoading(false); return;
    }
    const fetchProfile = async () => {
      setLoading(true); setError(null);
      // <-- Fetch new fields -->
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, business_name, slug, datenschutz_text, logo_url, primary_color, secondary_color')
        .eq('slug', slug)
        .maybeSingle();

       if (fetchError) {
           console.error("Error fetching profile for Datenschutz:", fetchError);
           setError(fetchError.message);
       } else if (data) { // --- MODIFIED: Check if data exists first
           // Assign defaults
           data.primary_color = data.primary_color || DEFAULT_PRIMARY;
           data.secondary_color = data.secondary_color || DEFAULT_SECONDARY;
           setProfile(data as Profile);
       } else { // --- MODIFIED: Handle null data (no row found)
           return notFound();
       }
      setLoading(false);
    };
    fetchProfile();
  }, [slug]);

  // === Render States ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Datenschutzerklärung...</div>; }
  if (error) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
  if (!profile) { return null; /* Handled by notFound */ }

  // --- Define CSS Variables ---
  const primaryColor = profile.primary_color || DEFAULT_PRIMARY;
  const secondaryColor = profile.secondary_color || DEFAULT_SECONDARY;
  const primaryColorDark = darkenColor(primaryColor);
  const colorStyles = `
    :root {
      --color-brand-primary: ${primaryColor};
      --color-brand-secondary: ${secondaryColor};
      --color-brand-primary-dark: ${primaryColorDark};
    }
  `;

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <style>{colorStyles}</style> {/* Inject CSS variables */}
      {/* --- Pass logoUrl to Navbar --- */}
      <Navbar businessName={profile.business_name} slug={profile.slug} logoUrl={profile.logo_url} />

      {/* Main Content Area for Legal Text */}
      <main className="flex-grow py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Datenschutzerklärung
          </h1>

          <div className="mt-10 prose prose-lg prose-slate max-w-none">
            {profile.datenschutz_text ? (
                 <div style={{ whiteSpace: 'pre-line' }}>
                    {profile.datenschutz_text}
                 </div>
            ) : (
                <p className="text-gray-500 italic">
                    Kein Datenschutzerklärungstext hinterlegt.
                </p>
            )}
          </div>
        </div>
      </main>

      <Footer businessName={profile.business_name} slug={profile.slug} />
    </div>
  );
}

