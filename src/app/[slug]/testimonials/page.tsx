// src/app/[slug]/testimonials/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer'; // Use uppercase F

// --- TYPE DEFINITIONS ---
type Testimonial = {
  id: string;
  created_at: string;
  user_id: string;
  author_name: string;
  author_handle: string | null;
  body: string;
  is_published: boolean;
};
type Profile = {
    id: string;
    business_name: string | null;
    slug: string | null;
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

// --- MAIN TESTIMONIALS PAGE COMPONENT ---
export default function ClientTestimonialsPage() {
  // === State Variables ===
  const [profile, setProfile] = useState<Profile | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  // === Data Fetching (Updated) ===
  useEffect(() => {
    if (!slug) {
        setError("Seitenpfad (Slug) fehlt in der URL."); setLoading(false); return;
    }

    const fetchTestimonialsData = async () => {
      setLoading(true); setError(null); setProfile(null); setTestimonials([]);
      let profileData: Profile | null = null;

      try {
        // --- 1. Fetch Profile by Slug (including new fields) ---
        console.log(`Testimonials List: Fetching profile for slug: ${slug}...`);
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .select('id, business_name, slug, logo_url, primary_color, secondary_color') // <-- Fetch new fields
          .eq('slug', slug)
          .maybeSingle();

        if (profileError) {
             console.error("Testimonials List: Error fetching profile:", profileError);
             throw new Error(`Profil konnte nicht geladen werden: ${profileError.message}`);
         }
        if (!profileResult) {
            console.log(`Testimonials List: No profile found for slug ${slug}.`);
            return notFound();
        }

        profileData = profileResult as Profile;
        // Assign defaults
        profileData.primary_color = profileData.primary_color || DEFAULT_PRIMARY;
        profileData.secondary_color = profileData.secondary_color || DEFAULT_SECONDARY;
        setProfile(profileData);
        console.log(`Testimonials List: Found profile ID: ${profileData.id}`);

        // --- 2. Fetch Published Testimonials for THIS Profile ID ---
        console.log(`Testimonials List: Fetching published testimonials for profile ID: ${profileData.id}...`);
        const { data, error: fetchError } = await supabase
          .from('testimonials')
          .select('*')
          .eq('user_id', profileData.id)
          .eq('is_published', true)
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching published testimonials:', fetchError);
          setError(`Kundenstimmen konnten nicht geladen werden: ${fetchError.message}`);
        } else {
           console.log("Fetched published testimonials data:", data);
          setTestimonials(data || []);
        }

      } catch (err: any) {
        console.error("Error fetching testimonials data:", err);
         if (!error) { setError(err.message || "Ein Fehler ist aufgetreten."); }
         setProfile(null); setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonialsData();
  }, [slug]);

  // === Render Logic ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Kundenstimmen...</div>; }
  if (error && !profile) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
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
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
       <style>{colorStyles}</style> {/* Inject CSS variables */}
       {/* --- Pass logoUrl to Navbar --- */}
       <Navbar businessName={profile?.business_name} slug={profile?.slug} logoUrl={profile?.logo_url}/>

        <main className="flex-grow py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Kundenstimmen</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Lesen Sie, was unsere Kunden über unsere Arbeit sagen.
                    </p>
                </div>

                {error && <p className="text-red-600 mt-16 text-center">{error}</p>}

                {/* Testimonials Grid/List */}
                {!error && (
                    <div className="mx-auto mt-16 flow-root">
                        <div className="-my-12 divide-y divide-gray-200">
                            {testimonials.length > 0 ? (
                                testimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="py-12">
                                        <div className="flex items-center gap-x-4">
                                            <img className="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover ring-1 ring-gray-200" src={`https://placehold.co/48x48/E2E8F0/475569?text=${testimonial.author_name.charAt(0)}`} alt="" />
                                            <div>
                                                <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">{testimonial.author_name}</h3>
                                                {testimonial.author_handle && <p className="text-sm leading-6 text-gray-600">{testimonial.author_handle}</p>}
                                            </div>
                                        </div>
                                        <blockquote className="mt-6 text-lg leading-8 text-gray-800 before:content-['“'] after:content-['”'] sm:text-xl sm:leading-9 italic">
                                           <p>{testimonial.body}</p>
                                        </blockquote>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-center pt-12">
                                    Momentan sind keine Kundenstimmen verfügbar.
                                </p>
                            )}
                        </div>
                    </div>
                )}
                 {/* Link back to homepage - Apply brand hover color */}
                 <div className="mt-16 text-center">
                    <Link href={`/${profile.slug}`} className="text-sm font-semibold leading-6 text-brand hover:text-brand-dark transition-colors">
                        <span aria-hidden="true">←</span> Zurück zur Startseite
                    </Link>
                </div>
            </div>
        </main>

       <Footer businessName={profile?.business_name} slug={profile?.slug}/>
    </div>
  );
}
