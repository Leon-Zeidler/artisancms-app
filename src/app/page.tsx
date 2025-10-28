// src/app/[slug]/page.tsx
"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// --- TYPE DEFINITIONS (Updated) ---
type Project = { id: string; title: string | null; 'project-date': string | null; image_url: string | null; status: 'Published' | 'Draft' | string | null; created_at: string; ai_description?: string | null; };
type Profile = {
  id: string;
  business_name: string | null;
  address: string | null;
  phone: string | null;
  services_description: string | null;
  about_text: string | null;
  updated_at: string | null;
  onboarding_complete?: boolean | null;
  slug: string | null;
  logo_url: string | null;        // <-- New
  primary_color: string | null;   // <-- New
  secondary_color: string | null; // <-- New
};
type Testimonial = {
  id: string;
  author_name: string;
  author_handle: string | null;
  body: string;
};

// --- Icons ---
const Icon = ({ path, className, color }: { path: string, className?: string, color?: string }) => (
    <svg className={className || "h-6 w-6 text-white"} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color || "currentColor"} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);
// ... (rest of the icons: serviceIcons, ArrowPathIcon, CheckCircleIcon, ExclamationCircleIcon remain the same) ...
const serviceIcons = {
    Sanitärinstallation: 'M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 12.75h16.5m-16.5 3h16.5',
    Heizungstechnik: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6',
    Fliesenarbeiten: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.125c0 .621.504 1.125 1.125 1.125z',
    Default: 'M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15.75 0h.008v.008H4.25v-.008z'
};
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const ExclamationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /> </svg> );
type FormStatus = 'idle' | 'loading' | 'success' | 'error';

// --- Constants (Defaults if not set in DB) ---
const DEFAULT_PRIMARY = '#ea580c'; // orange-600
const DEFAULT_SECONDARY = '#475569'; // slate-600


// --- MAIN PAGE ---
export default function ClientHomepage() {
  // === State Variables ===
  const [profile, setProfile] = useState<Profile | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contact Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  // === Data Fetching (Updated with console logs) ===
  useEffect(() => {
    if (!slug) {
      setError("Slug missing."); setLoading(false); return;
    }
    console.log(`[${slug}] Fetching data...`); // <-- LOG: Start fetch

    const fetchData = async () => {
      setLoading(true); setError(null); setProfile(null); setFeaturedProjects([]); setTestimonials([]);
      let profileData: Profile | null = null;

      try {
        // --- 1. Fetch Profile by Slug (including new fields) ---
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .select('*, logo_url, primary_color, secondary_color') // Fetch all + new fields
          .eq('slug', slug)
          .maybeSingle();

        // <-- LOG: Raw profile result -->
        console.log(`[${slug}] Raw profile fetch result:`, { profileResult, profileError });

        if (profileError) throw profileError;
        if (!profileResult) return notFound(); // Show 404

        profileData = profileResult as Profile;
        // Assign defaults if colors are null/undefined
        profileData.primary_color = profileData.primary_color || DEFAULT_PRIMARY;
        profileData.secondary_color = profileData.secondary_color || DEFAULT_SECONDARY;

        // <-- LOG: Final profile data before setting state -->
        console.log(`[${slug}] Final profile data (with defaults):`, profileData);
        setProfile(profileData);

        // --- Fetch Projects and Testimonials (no changes needed here for logging) ---
        if (profileData?.id) {
            const { data: projects, error: projectsError } = await supabase
              .from('projects').select(`id, title, image_url, status, "project-date", created_at`).eq('user_id', profileData.id).eq('status', 'Published').order('created_at', { ascending: false }).limit(3);
            if (projectsError) console.error("Homepage: Error during projects fetch:", projectsError);
            else setFeaturedProjects((projects || []) as Project[]);

            const { data: testimonialsData, error: testimonialsError } = await supabase
              .from('testimonials').select('id, author_name, author_handle, body').eq('user_id', profileData.id).eq('is_published', true).order('created_at', { ascending: false }).limit(1);
            if (testimonialsError) console.error("Homepage: Error during testimonials fetch:", testimonialsError);
            else setTestimonials((testimonialsData || []) as Testimonial[]);
        } else { console.warn("Profile loaded but ID missing..."); }

      } catch (err: any) {
        console.error(`[${slug}] Error fetching homepage data:`, err);
        setError(err.message || "Fehler beim Laden der Daten.");
      } finally {
        setLoading(false);
        console.log(`[${slug}] Fetch finished.`); // <-- LOG: End fetch
      }
    };

    fetchData();
  }, [slug]);

  // --- Helper to parse services ---
  const parsedServices = profile?.services_description?.split('\n').map(line => { const parts = line.split(':'); const name = parts[0]?.trim(); const description = parts.slice(1).join(':').trim(); if (name && description) { const iconKey = Object.keys(serviceIcons).find(key => name.toLowerCase().includes(key.toLowerCase())) || 'Default'; return { name, description, icon: serviceIcons[iconKey as keyof typeof serviceIcons] }; } return null; }).filter(Boolean) as { name: string; description: string; icon: string }[] || [];

  // --- Handle Contact Form Submission ---
  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      // ... (no changes needed) ...
  };

  // === Render States ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Webseite...</div>; }
  if (error) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
  if (!profile) { return null; /* Should be handled by notFound */ }

  // Extract colors for easier use in inline styles
  const primaryColor = profile.primary_color || DEFAULT_PRIMARY;
  const secondaryColor = profile.secondary_color || DEFAULT_SECONDARY;

  // Basic function to slightly darken a hex color for hover states
  // Note: This is a simple approximation and might not work well for all colors (e.g., black)
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
      console.error("Failed to darken color:", hex, e);
      return hex; // Return original on error
    }
  };
  const primaryColorDark = darkenColor(primaryColor);


  return (
    // Removed <style> tag
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Pass logo_url and primaryColor to Navbar */}
      <Navbar
        businessName={profile.business_name}
        slug={profile.slug}
        logoUrl={profile.logo_url}
        primaryColor={primaryColor} // Pass color prop
        primaryColorDark={primaryColorDark} // Pass darker color for hover
      />

      <main className="isolate flex-grow">

        {/* ========== HERO SECTION ========== */}
        <div className="relative px-6 lg:px-8">
            <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                        {profile.business_name || 'Ihr Meisterbetrieb für exzellentes Handwerk'}
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        {profile.about_text?.substring(0, 150) + (profile.about_text && profile.about_text.length > 150 ? '...' : '') || 'Präzision, Qualität und Zuverlässigkeit für Ihr nächstes Projekt.'}
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        {/* Apply inline style */}
                        <Link
                          href="#kontakt"
                          className="rounded-md px-5 py-3 text-base font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                          style={{ backgroundColor: primaryColor, outlineColor: primaryColor }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = primaryColorDark}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                        >
                            Angebot anfordern
                        </Link>
                        {/* Apply inline style on hover (less ideal, better via CSS/JS state if complex) */}
                         <Link
                          href={`/${profile.slug}/portfolio`}
                          className="text-base font-semibold leading-6 text-gray-900"
                          style={{ '--hover-color': primaryColor } as React.CSSProperties} // Set CSS variable for pseudo-class
                          onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
                          onMouseOut={(e) => e.currentTarget.style.color = ''} // Revert to default
                        >
                             Unsere Projekte ansehen <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        {/* ========== SERVICES SECTION ========== */}
        {parsedServices.length > 0 && (
            <div id="leistungen" className="py-24 sm:py-32 bg-gray-50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        {/* Apply inline style */}
                        <h2 className="text-base font-semibold leading-7" style={{ color: primaryColor }}>Leistungen</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"> Unsere Kernkompetenzen </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {parsedServices.map((service) => (
                                <div key={service.name} className="flex flex-col">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                                        {/* Apply inline style */}
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: primaryColor }}>
                                            <Icon path={service.icon} />
                                        </div>
                                        {service.name}
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">{service.description}</p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        )}

        {/* ========== FEATURED WORK SECTION ========== */}
        {featuredProjects.length > 0 && profile.slug && (
            <div id="projekte" className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        {/* Apply inline style */}
                        <h2 className="text-base font-semibold leading-7" style={{ color: primaryColor }}>Referenzen</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"> Ein Einblick in unsere Arbeit </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600"> Sehen Sie sich einige unserer kürzlich abgeschlossenen Projekte an. </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {featuredProjects.map((project) => (
                             <article key={project.id} className="flex flex-col items-start justify-between group">
                                <Link href={`/${profile.slug}/portfolio/${project.id}`} className="block w-full">
                                    {/* ... image ... */}
                                    <div className="max-w-xl mt-4">
                                        <div className="relative">
                                            {/* Apply inline hover style */}
                                             <h3
                                               className="mt-3 text-lg font-semibold leading-6 text-gray-900 transition-colors"
                                               onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
                                               onMouseOut={(e) => e.currentTarget.style.color = ''}
                                            >
                                                {project.title || 'Unbenanntes Projekt'}
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                    <div className="mt-16 text-center">
                         {/* Apply inline style */}
                        <Link
                          href={`/${profile.slug}/portfolio`}
                          className="rounded-md px-5 py-3 text-base font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                          style={{ backgroundColor: primaryColor, outlineColor: primaryColor }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = primaryColorDark}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                         >
                             Alle Projekte ansehen
                        </Link>
                    </div>
                </div>
            </div>
        )}

        {/* ========== TESTIMONIALS SECTION ========== */}
        {testimonials.length > 0 && (
             <section id="testimonials" className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8">
                 {/* ... (rest remains the same, apply inline hover to link) ... */}
                  {profile.slug && (
                        <div className="mt-16 text-center">
                            <Link
                              href={`/${profile.slug}/testimonials`}
                              className="text-base font-semibold leading-6 text-gray-900 transition-colors"
                              onMouseOver={(e) => e.currentTarget.style.color = primaryColor}
                              onMouseOut={(e) => e.currentTarget.style.color = ''}
                            >
                                Mehr Kundenstimmen <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    )}
             </section>
        )}

        {/* ========== CONTACT SECTION ========== */}
        <div id="kontakt" className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-12">Kontakt aufnehmen</h2>
              <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-5">
                 {/* Contact Info Column */}
                <div className="lg:col-span-2">{/* ... */}</div>

                {/* Contact Form Column */}
                <div className="lg-col-span-3">
                    {formStatus === 'success' ? ( <div className="rounded-md bg-green-50 p-4 border border-green-200"> {/* ... */} </div> )
                    : ( <form onSubmit={handleContactSubmit} className="space-y-6">
                            {/* Inputs need focus style update */}
                            {/* Note: Applying focus ring color dynamically is tricky with pure inline styles.
                                 Keeping Tailwind focus classes but they might show default blue/indigo ring.
                                 A better solution might involve JS or styled-components if exact focus color is critical.
                             */}
                             <div> <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">Name</label> <div className="mt-2.5"> <input type="text" name="name" id="name" required value={formName} onChange={(e) => setFormName(e.target.value)} className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"/> </div> </div>
                             <div> <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">Email</label> <div className="mt-2.5"> <input type="email" name="email" id="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"/> </div> </div>
                             <div> <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">Nachricht</label> <div className="mt-2.5"> <textarea name="message" id="message" rows={4} required value={formMessage} onChange={(e) => setFormMessage(e.target.value)} className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm"/> </div> </div>
                            {formStatus === 'error' && ( <div className="rounded-md bg-red-50 p-4 border border-red-200">{/* ... */}</div> )}
                            <div className="mt-8 flex justify-end">
                                {/* Apply inline style for button */}
                                <button
                                    type="submit"
                                    disabled={formStatus === 'loading'}
                                    className={`rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-x-2 transition-colors`}
                                    style={{ backgroundColor: formStatus === 'loading' ? darkenColor(primaryColor, 40) : primaryColor, outlineColor: primaryColor }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = formStatus === 'loading' ? darkenColor(primaryColor, 40) : primaryColorDark}
                          			onMouseOut={(e) => e.currentTarget.style.backgroundColor = formStatus === 'loading' ? darkenColor(primaryColor, 40) : primaryColor}
                                >
                                    {formStatus === 'loading' && <ArrowPathIcon />}
                                    {formStatus === 'loading' ? 'Senden...' : 'Nachricht senden'}
                                </button>
                            </div>
                        </form>
                     )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer businessName={profile.business_name} slug={profile.slug} primaryColor={primaryColor} />
    </div>
  );
}

