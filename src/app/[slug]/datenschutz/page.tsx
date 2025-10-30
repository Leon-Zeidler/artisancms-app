// src/app/[slug]/datenschutz/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define Profile type
type Profile = {
    id: string;
    business_name: string | null;
    slug: string | null;
    datenschutz_text: string | null; 
    logo_url: string | null;
    primary_color: string | null;
};

// --- Constants (Defaults if not set in DB) ---
const DEFAULT_PRIMARY = '#ea580c'; // orange-600

// --- Helper function to darken color ---
const darkenColor = (hex: string, amount: number = 20): string => {
    try {
      let color = hex.startsWith('#') ? hex.slice(1) : hex;
      let r = parseInt(color.substring(0, 2), 16);
      let g = parseInt(color.substring(2, 4), 16);
      let b = parseInt(color.substring(4, 6), 16);
      r = Math.max(0, r - amount);
      g = Math.max(0, g - amount);
      b = Math.max(0, b - amount);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    } catch (e) {
      return hex;
    }
};

export default function DatenschutzPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  // Fetch profile data
  useEffect(() => {
     if (!slug) {
        setError("Seitenpfad (Slug) fehlt."); 
        setLoading(false); 
        return;
    }
    const fetchProfile = async () => {
      setLoading(true); 
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, business_name, slug, datenschutz_text, logo_url, primary_color') // Select the datenschutz text
          .eq('slug', slug)
          .maybeSingle();

         if (fetchError) {
             console.error("Error fetching profile for Datenschutz:", fetchError);
             setError(fetchError.message);
         } else if (!data) {
             return notFound(); // Show 404 if slug is invalid
         } else {
            // *** FIX IS HERE ***
            // This code now only runs if 'data' is not null
            data.primary_color = data.primary_color || DEFAULT_PRIMARY;
            setProfile(data as Profile);
         }
      } catch (err: any) {
        console.error("Unexpected error fetching profile:", err);
        setError(err.message || "An unknown error occurred.");
      } finally {
        // This will run regardless of success or error
        setLoading(false);
      }
    };
    fetchProfile();
  }, [slug]);

  // === Render States ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Datenschutzerklärung...</div>; }
  if (error) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
  if (!profile) { return null; } // Handled by notFound() or loading

  const primaryColor = profile.primary_color || DEFAULT_PRIMARY;
  const primaryColorDark = darkenColor(primaryColor);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar 
        businessName={profile.business_name} 
        slug={profile.slug}
        logoUrl={profile.logo_url}
        primaryColor={primaryColor}
        primaryColorDark={primaryColorDark}
      />

      {/* Main Content Area for Legal Text */}
      <main className="flex-grow py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Datenschutzerklärung
          </h1>

          <div className="mt-10 prose prose-lg prose-slate max-w-none">
            {/* Render the fetched text */}
            {profile.datenschutz_text ? (
                 <div style={{ whiteSpace: 'pre-line' }}>
                    {profile.datenschutz_text}
                 </div>
            ) : (
                <p className="text-gray-500 italic">
                    Kein Datenschutzerklärungstext hinterlegt. Bitte fügen Sie diesen in Ihren Dashboard-Einstellungen hinzu.
                </p>
            )}
          </div>
        </div>
      </main>

      <Footer 
        businessName={profile.business_name} 
        slug={profile.slug}
        primaryColor={primaryColor}
      />
    </div>
  );
}