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
  user_id: string; // Belongs to profile owner
  author_name: string;
  author_handle: string | null;
  body: string;
  is_published: boolean;
};
type Profile = {
    id: string;
    business_name: string | null;
    slug: string | null;
    // Add other fields if needed by Navbar/Footer later
};

// --- MAIN TESTIMONIALS PAGE COMPONENT ---
export default function ClientTestimonialsPage() {
  // === State Variables ===
  const [profile, setProfile] = useState<Profile | null>(null); // State for profile
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Get Slug from URL ===
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  // === Data Fetching ===
  useEffect(() => {
    if (!slug) {
        setError("Seitenpfad (Slug) fehlt in der URL."); setLoading(false); return;
    }

    const fetchTestimonialsData = async () => {
      setLoading(true);
      setError(null);
      setProfile(null);
      setTestimonials([]);

      let profileData: Profile | null = null;

      try {
        // --- 1. Fetch Profile by Slug ---
        console.log(`Testimonials List: Fetching profile for slug: ${slug}...`);
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .select('id, business_name, slug') // Fetch fields needed
          .eq('slug', slug)
          .maybeSingle();

        if (profileError) {
             console.error("Testimonials List: Error fetching profile:", profileError);
             throw new Error(`Profil konnte nicht geladen werden: ${profileError.message}`);
         }
        if (!profileResult) {
            console.log(`Testimonials List: No profile found for slug ${slug}.`);
            return notFound(); // Show 404
        }

        profileData = profileResult as Profile;
        setProfile(profileData);
        console.log(`Testimonials List: Found profile ID: ${profileData.id}`);

        // --- 2. Fetch Published Testimonials for THIS Profile ID ---
        console.log(`Testimonials List: Fetching published testimonials for profile ID: ${profileData.id}...`);
        const { data, error: fetchError } = await supabase
          .from('testimonials')
          .select('*') // Select all testimonial fields
          .eq('user_id', profileData.id) // *** CRITICAL: Filter by profile ID ***
          .eq('is_published', true) // Only show published
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
         if (!error) { // Don't overwrite notFound state
           setError(err.message || "Ein Fehler ist aufgetreten.");
         }
         setProfile(null);
         setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonialsData();
  }, [slug]); // Depend on slug

  // === Render Logic ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Kundenstimmen...</div>; }
  if (error && !profile) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
  if (!profile) { return null; /* Handled by notFound */ }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
       <Navbar businessName={profile?.business_name} slug={profile?.slug}/>

        <main className="flex-grow py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Kundenstimmen</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Lesen Sie, was unsere Kunden über unsere Arbeit sagen.
                    </p>
                </div>

                {/* Show testimonial specific error if profile loaded fine */}
                {error && <p className="text-red-600 mt-16 text-center">{error}</p>}

                {/* Testimonials Grid/List - Render only if no error */}
                {!error && (
                    <div className="mx-auto mt-16 flow-root">
                        <div className="-my-12 divide-y divide-gray-200">
                            {testimonials.length > 0 ? (
                                testimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="py-12">
                                        <div className="flex items-center gap-x-4">
                                            {/* Placeholder Avatar */}
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
                 {/* Link back to homepage */}
                 <div className="mt-16 text-center">
                    <Link href={`/${profile.slug}`} className="text-sm font-semibold leading-6 text-orange-600 hover:text-orange-500">
                        <span aria-hidden="true">←</span> Zurück zur Startseite
                    </Link>
                </div>
            </div>
        </main>

       <Footer businessName={profile?.business_name} slug={profile?.slug}/>
    </div>
  );
}