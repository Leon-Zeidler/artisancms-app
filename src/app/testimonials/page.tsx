// src/app/testimonials/page.tsx
"use client"; // Mark as client component for fetching

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient'; // Import Supabase client

// --- TYPE DEFINITION for Testimonial ---
// Matches the structure of your Supabase table
type Testimonial = {
  id: string; // uuid
  created_at: string; // timestamptz
  user_id: string; // uuid (although we might not display it)
  author_name: string;
  author_handle: string | null;
  body: string;
  is_published: boolean;
};

// --- Footer Component (remains the same) ---
const Footer = () => (
    <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
             <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
                 <div className="pb-6"> <Link href="/#leistungen" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Leistungen</Link> </div>
                 <div className="pb-6"> <Link href="/portfolio" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Projekte</Link> </div>
                 <div className="pb-6"> <Link href="/testimonials" className="text-sm font-semibold leading-6 text-orange-600">Kundenstimmen</Link> </div>
                 <div className="pb-6"> <Link href="/impressum" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Impressum</Link> </div>
                 <div className="pb-6"> <Link href="/datenschutz" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Datenschutz</Link> </div>
             </nav>
            {/* TODO: Fetch business name dynamically */}
            <p className="mt-10 text-center text-xs leading-5 text-gray-500"> &copy; {new Date().getFullYear()} Ihr Firmenname. Alle Rechte vorbehalten. </p>
            <p className="mt-2 text-center text-xs leading-5 text-gray-500"> Powered by ArtisanCMS </p>
        </div>
       </footer>
);

// --- MAIN TESTIMONIALS PAGE COMPONENT ---
export default function TestimonialsPage() {
  // === State Variables ===
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]); // Use the defined type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Data Fetching ===
  useEffect(() => {
    const fetchTestimonials = async () => {
        setLoading(true);
        setError(null);
        console.log("Fetching published testimonials...");

        try {
            // Fetch testimonials where is_published is true
            // Order by creation date, newest first
            const { data, error: fetchError } = await supabase
              .from('testimonials')
              .select('*') // Select all columns for now
              .eq('is_published', true) // Filter for published ones
              .order('created_at', { ascending: false }); // Show newest first

            if (fetchError) {
                console.error("Error fetching testimonials:", fetchError);
                throw fetchError; // Throw error to be caught below
            }

            console.log("Fetched testimonials:", data);
            setTestimonials(data || []); // Set fetched data, default to empty array if null

        } catch (err) {
            const message = err instanceof Error ? err.message : "An unknown error occurred";
            setError(`Kundenstimmen konnten nicht geladen werden: ${message}`);
            setTestimonials([]); // Clear testimonials on error
        } finally {
            setLoading(false);
        }
    };
    fetchTestimonials();
  }, []); // Empty dependency array means run once on mount

  // === Render Logic ===
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
       <Navbar /> {/* Use the Navbar component */}

        {/* ========== TESTIMONIALS SECTION ========== */}
        <div className="py-24 sm:py-32 flex-grow">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Kundenstimmen</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Lesen Sie, was unsere zufriedenen Kunden über unsere Arbeit sagen.
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <p className="text-slate-600 mt-16 text-center">Lade Kundenstimmen...</p>
                )}

                {/* Error State */}
                {error && (
                    <p className="text-red-600 mt-16 text-center">{error}</p>
                )}

                {/* Testimonials List/Grid */}
                {!loading && !error && (
                    <div className="mx-auto mt-16 flow-root sm:mt-20 lg:mx-0 lg:max-w-none">
                        {testimonials.length > 0 ? (
                            <div className="-mt-8 sm:-mx-4 sm:columns-2 sm:text-[0] lg:columns-3">
                                {testimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="pt-8 sm:inline-block sm:w-full sm:px-4">
                                        <figure className="rounded-2xl bg-gray-50 p-8 text-sm leading-6 border border-gray-100">
                                            <blockquote className="text-gray-900">
                                                {/* Make sure body is treated as plain text */}
                                                <p>{`“${testimonial.body}”`}</p>
                                            </blockquote>
                                            <figcaption className="mt-6 flex items-center gap-x-4">
                                                 {/* Placeholder image/initials */}
                                                 <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center font-semibold text-gray-600">
                                                     {testimonial.author_name?.charAt(0)?.toUpperCase() || '?'}
                                                 </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900">{testimonial.author_name}</div>
                                                    {/* Display handle only if it exists */}
                                                    {testimonial.author_handle && (
                                                        <div className="text-gray-600">{testimonial.author_handle}</div>
                                                    )}
                                                </div>
                                            </figcaption>
                                        </figure>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <p className="text-slate-500 text-center mt-10">
                                Momentan sind keine Kundenstimmen vorhanden.
                             </p>
                        )}
                    </div>
                )}
            </div>
        </div>

       <Footer /> {/* Use the Footer component */}
    </div>
  );
}

