// src/app/[slug]/testimonials/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useProfile } from '@/contexts/ProfileContext'; // <-- IMPORT CONTEXT

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

// --- MAIN TESTIMONIALS PAGE COMPONENT ---
export default function ClientTestimonialsPage() {
  // === State Variables ===
  const supabase = useMemo(() => createSupabaseClient(), []);
  const profile = useProfile(); // <-- GET PROFILE FROM CONTEXT
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Data Fetching ===
  useEffect(() => {
    if (!profile) return notFound();

    const fetchTestimonialsData = async () => {
      setLoading(true); setError(null); setTestimonials([]);
      
      try {
        // --- Profile is already fetched, just get testimonials ---
        const { data, error: fetchError } = await supabase
          .from('testimonials')
          .select('*') 
          .eq('user_id', profile.id) // <-- Use ID from context
          .eq('is_published', true) 
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError(`Kundenstimmen konnten nicht geladen werden: ${fetchError.message}`);
        } else {
          setTestimonials(data || []);
        }

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.';
        setError(message);
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonialsData();
  }, [profile, supabase]);

  // === Render Logic ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Kundenstimmen...</div>; }
  
  // Layout is handled by layout.tsx
  return (
    <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Header */}
            <div className="mx-auto max-w-2xl lg:mx-0">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Kundenstimmen</h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                    Lesen Sie, was unsere Kunden über unsere Arbeit sagen.
                </p>
            </div>

            {error && <p className="text-red-600 mt-16 text-center">{error}</p>}

            {!error && (
                <div className="mx-auto mt-16 flow-root">
                    <div className="-my-12 divide-y divide-gray-200">
                        {testimonials.length > 0 ? (
                            testimonials.map((testimonial) => (
                                <div key={testimonial.id} className="py-12">
                                    <div className="flex items-center gap-x-4">
                                        <Image
                                          className="h-12 w-12 flex-none rounded-full bg-gray-50 object-cover ring-1 ring-gray-200"
                                          src={`https://placehold.co/48x48/E2E8F0/475569?text=${testimonial.author_name.charAt(0)}`}
                                          alt=""
                                          width={48}
                                          height={48}
                                          unoptimized
                                        />
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
                <Link 
                  href={`/${profile.slug}`} 
                  className="text-sm font-semibold leading-6 text-brand hover:text-brand-dark transition-colors"
                >
                    <span aria-hidden="true">←</span> Zurück zur Startseite
                </Link>
            </div>
        </div>
    </div>
  );
}