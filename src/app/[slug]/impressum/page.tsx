// src/app/[slug]/impressum/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Define Profile type
type Profile = {
    id: string;
    business_name: string | null;
    slug: string | null;
    impressum_text: string | null; // Text for this page
};

export default function ImpressumPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  // Fetch profile data
  useEffect(() => {
    if (!slug) {
        setError("Seitenpfad (Slug) fehlt."); setLoading(false); return;
    }
    const fetchProfile = async () => {
      setLoading(true); setError(null);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, business_name, slug, impressum_text') // Select the impressum text
        .eq('slug', slug)
        .maybeSingle();

       if (fetchError) {
           console.error("Error fetching profile for Impressum:", fetchError);
           setError(fetchError.message);
       } else if (!data) {
           return notFound(); // Show 404 if slug is invalid
       }
       setProfile(data as Profile);
      setLoading(false);
    };
    fetchProfile();
  }, [slug]);

  // === Render States ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Impressum...</div>; }
  if (error) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
  if (!profile) { return null; /* Handled by notFound */ }

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar businessName={profile.business_name} slug={profile.slug} />

      {/* Main Content Area for Legal Text */}
      <main className="flex-grow py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Impressum
          </h1>

          {/* This 'prose' class adds nice default styling for text content */}
          <div className="mt-10 prose prose-lg prose-slate max-w-none">
            {/*
              Render the fetched text.
              Using dangerouslySetInnerHTML is okay if you trust the user not to enter malicious scripts,
              but rendering as plain text with line breaks is safer.
            */}
            {profile.impressum_text ? (
                // Split by newline and render as paragraphs for basic formatting
                 <div style={{ whiteSpace: 'pre-line' }}>
                    {profile.impressum_text}
                 </div>
            ) : (
                <p className="text-gray-500 italic">
                    Kein Impressumstext hinterlegt. Bitte fügen Sie diesen in Ihren Dashboard-Einstellungen hinzu.
                </p>
            )}

            {/*
              Placeholder if you want to show it:
              <h2>Angaben gemäß § 5 TMG</h2>
              <p>Max Mustermann <br /> ... </p>
            */}
          </div>
        </div>
      </main>

      <Footer businessName={profile.business_name} slug={profile.slug} />
    </div>
  );
}
