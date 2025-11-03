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
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  email: string | null; // <-- Added email field
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
const DEFAULT_SECONDARY = '#f9fafb'; // gray-50

// --- Helper function to darken color ---
const darkenColor = (hex: string, amount: number = 20): string => {
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
      console.error("Failed to darken color:", hex, e);
      return hex; // Return original on error
    }
};

// --- 1. NEW HELPER FUNCTION (Copied from Footer) ---
// Checks if a hex color is dark or light
const isColorDark = (hex: string | null | undefined): boolean => {
    if (!hex) return false; // Default to light background
    try {
        let color = hex.startsWith('#') ? hex.slice(1) : hex;
        if (color.length === 3) {
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        // Using the luminance formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5; // True if dark, false if light
    } catch {
        return false; // Default to light background on error
    }
};

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

  // === Data Fetching ===
  useEffect(() => {
    if (!slug) {
      setError("Slug missing."); setLoading(false); return;
    }

    const fetchData = async () => {
      setLoading(true); setError(null); setProfile(null); setFeaturedProjects([]); setTestimonials([]);
      let profileData: Profile | null = null;

      try {
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .select('*, logo_url, primary_color, secondary_color, email') // <-- Fetched email
          .eq('slug', slug)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileResult) return notFound(); 

        profileData = profileResult as Profile;
        profileData.primary_color = profileData.primary_color || DEFAULT_PRIMARY;
        profileData.secondary_color = profileData.secondary_color || DEFAULT_SECONDARY;

        setProfile(profileData);

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
      }
    };

    fetchData();
  }, [slug]);

  // --- Helper to parse services ---
  const parsedServices = profile?.services_description?.split('\n').map(line => { const parts = line.split(':'); const name = parts[0]?.trim(); const description = parts.slice(1).join(':').trim(); if (name && description) { const iconKey = Object.keys(serviceIcons).find(key => name.toLowerCase().includes(key.toLowerCase())) || 'Default'; return { name, description, icon: serviceIcons[iconKey as keyof typeof serviceIcons] }; } return null; }).filter(Boolean) as { name: string; description: string; icon: string }[] || [];

  // --- Handle Contact Form Submission ---
  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!profile) { setFormError("Kontaktinfo fehlt."); setFormStatus('error'); return; }
      setFormStatus('loading'); setFormError(null);
      try {
          const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: formName, email: formEmail, message: formMessage, profileId: profile.id }), });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Fehler.');
          setFormStatus('success'); setFormName(''); setFormEmail(''); setFormMessage('');
          setTimeout(() => setFormStatus('idle'), 5000);
      } catch (err) { console.error("Contact form error:", err); const message = err instanceof Error ? err.message : "Fehler."; setFormError(message); setFormStatus('error'); }
  };

  // === Render States ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Webseite...</div>; }
  if (error) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
  if (!profile) { return null; }

  // Extract colors for easier use in inline styles
  const primaryColor = profile.primary_color || DEFAULT_PRIMARY;
  const secondaryColor = profile.secondary_color || DEFAULT_SECONDARY;
  const primaryColorDark = darkenColor(primaryColor);

  // --- 2. CHECK IF BACKGROUND IS DARK ---
  const isServicesDark = isColorDark(secondaryColor);
  const servicesHeadingColor = isServicesDark ? "text-white" : "text-gray-900";
  const servicesTextColor = isServicesDark ? "text-gray-300" : "text-gray-600";

  return (
    //
    // --- THIS IS THE FIX (Part 1) ---
    // Inject CSS variables for Tailwind to use
    //
    <div 
      className="flex min-h-screen flex-col bg-white text-gray-900"
      style={{
        '--color-brand-primary': primaryColor,
        '--color-brand-primary-dark': primaryColorDark,
        '--color-brand-secondary': secondaryColor,
      } as React.CSSProperties}
    >
      <Navbar
        businessName={profile.business_name}
        slug={profile.slug}
        logoUrl={profile.logo_url}
        // We no longer need to pass colors to Navbar/Footer
        // primaryColor={primaryColor}
        // primaryColorDark={primaryColorDark}
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
                        {/* --- THIS IS THE FIX (Part 2) ---
                        Use Tailwind classes bg-brand and hover:bg-brand-dark
                        Remove inline styles and JS event handlers
                        */}
                        <Link
                          href="#kontakt"
                          className="rounded-md bg-brand px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            Angebot anfordern
                        </Link>
                         <Link
                          href={`/${profile.slug}/portfolio`}
                          className="text-base font-semibold leading-6 text-gray-900 transition-colors hover:text-brand"
                        >
                             Unsere Projekte ansehen <span aria-hidden="true">→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        {/* ========== SERVICES SECTION ========== */}
        {parsedServices.length > 0 && (
            // Use bg-brandsec (which reads the CSS variable)
            <div id="leistungen" className="py-24 sm:py-32 bg-brandsec">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-brand">Leistungen</h2>
                        {/* Apply dynamic text colors based on brightness */}
                        <p className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${servicesHeadingColor}`}> Unsere Kernkompetenzen </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {parsedServices.map((service) => (
                                <div key={service.name} className="flex flex-col">
                                    <dt className={`flex items-center gap-x-3 text-base font-semibold leading-7 ${servicesHeadingColor}`}>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand">
                                            <Icon path={service.icon} />
                                        </div>
                                        {service.name}
                                    </dt>
                                    <dd className={`mt-4 flex flex-auto flex-col text-base leading-7 ${servicesTextColor}`}>
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
                        <h2 className="text-base font-semibold leading-7 text-brand">Referenzen</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"> Ein Einblick in unsere Arbeit </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600"> Sehen Sie sich einige unserer kürzlich abgeschlossenen Projekte an. </p>
                    </div>
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {featuredProjects.map((project) => (
                             <article key={project.id} className="flex flex-col items-start justify-between group">
                                <Link href={`/${profile.slug}/portfolio/${project.id}`} className="block w-full">
                                    <div className="relative w-full">
                                        <img src={project.image_url || `https://placehold.co/600x400/A3A3A3/FFF?text=${encodeURIComponent(project.title || 'P')}`} alt={project.title || 'Projektbild'} className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover border border-gray-200 group-hover:opacity-90 transition-opacity" onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/600x400/ef4444/ffffff?text=Error')} />
                                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                                    </div>
                                    <div className="max-w-xl mt-4">
                                        <div className="relative">
                                             <h3
                                               className="mt-3 text-lg font-semibold leading-6 text-gray-900 transition-colors group-hover:text-brand"
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
                        <Link
                          href={`/${profile.slug}/portfolio`}
                          className="rounded-md bg-brand px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
                 <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
                 <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
                 <div className="mx-auto max-w-2xl lg:max-w-4xl">
                    <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12">Was unsere Kunden sagen</h2>
                    {testimonials.map((testimonial) => (
                        <figure key={testimonial.id} className="mt-10">
                            <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
                                <p>“{testimonial.body}”</p>
                            </blockquote>
                            <figcaption className="mt-10">
                                <img className="mx-auto h-10 w-10 rounded-full" src={`https://placehold.co/40x40/E2E8F0/475569?text=${testimonial.author_name.charAt(0)}`} alt="" />
                                <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                                    <div className="font-semibold text-gray-900">{testimonial.author_name}</div>
                                    {testimonial.author_handle && (
                                        <>
                                            <svg viewBox="0 0 2 2" width={3} height={3} aria-hidden="true" className="fill-gray-900"><circle cx={1} cy={1} r={1} /></svg>
                                            <div className="text-gray-600">{testimonial.author_handle}</div>
                                        </>
                                    )}
                                </div>
                            </figcaption>
                        </figure>
                    ))}
                  {profile.slug && (
                        <div className="mt-16 text-center">
                            <Link
                              href={`/${profile.slug}/testimonials`}
                              className="text-base font-semibold leading-6 text-gray-900 transition-colors hover:text-brand"
                            >
                                Mehr Kundenstimmen <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    )}
                 </div>
             </section>
        )}

        {/* ========== CONTACT SECTION ========== */}
        {/* This section remains bg-gray-50 for contrast, which is good design */}
        <div id="kontakt" className="bg-gray-50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-12">Kontakt aufnehmen</h2>
              <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-5">
                 <div className="lg:col-span-2">
                    <p className="mt-4 leading-7 text-gray-600">Nutzen Sie das Formular oder kontaktieren Sie uns direkt über die untenstehenden Angaben.</p>
                    <div className="mt-8 space-y-4">
                        {profile.address && (
                            <div className="flex gap-x-4">
                                <svg className="h-6 w-6 text-gray-500 flex-none" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                                <address className="text-base not-italic leading-7 text-gray-600 whitespace-pre-line">{profile.address}</address>
                            </div>
                        )}
                        {profile.phone && (
                            <div className="flex gap-x-4">
                                <svg className="h-6 w-6 text-gray-500 flex-none" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                <a className="hover:text-gray-900 text-base leading-7 text-gray-600" href={`tel:${profile.phone}`}>{profile.phone}</a>
                            </div>
                        )}
                        <div className="flex gap-x-4">
                            <svg className="h-6 w-6 text-gray-500 flex-none" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                            <a className="hover:text-gray-900 text-base leading-7 text-gray-600" href={`mailto:${profile.email || ''}`}>
                              {profile.email || 'E-Mail nicht hinterlegt'}
                            </a>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    {formStatus === 'success' ? ( <div className="rounded-md bg-green-50 p-4 border border-green-200"><div className="flex"> <div className="flex-shrink-0"> <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" /> </div> <div className="ml-3"> <h3 className="text-sm font-medium text-green-800">Nachricht gesendet!</h3> <div className="mt-2 text-sm text-green-700"> <p>Vielen Dank für Ihre Anfrage. Wir werden uns so schnell wie möglich bei Ihnen melden.</p> </div> </div> </div> </div> )
                    : ( <form onSubmit={handleContactSubmit} className="space-y-6">
                            {/* --- THIS IS THE FIX (Part 3) ---
                            Use Tailwind's focus:ring-brand class
                            */}
                            <style>{`:root { --dynamic-ring-color: ${primaryColor}; }`}</style>
                            <div> <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">Name</label> <div className="mt-2.5"> <input type="text" name="name" id="name" required value={formName} onChange={(e) => setFormName(e.target.value)} className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm"/> </div> </div>
                            <div> <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">Email</label> <div className="mt-2.5"> <input type="email" name="email" id="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm"/> </div> </div>
                            <div> <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">Nachricht</label> <div className="mt-2.5"> <textarea name="message" id="message" rows={4} required value={formMessage} onChange={(e) => setFormMessage(e.target.value)} className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-brand sm:text-sm"/> </div> </div>
                            {formStatus === 'error' && ( <div className="rounded-md bg-red-50 p-4 border border-red-200"><div className="flex"> <div className="flex-shrink-0"> <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" /> </div> <div className="ml-3"> <h3 className="text-sm font-medium text-red-800">Senden fehlgeschlagen</h3> <p className="mt-1 text-sm text-red-700">{formError || 'Bitte versuchen Sie es später erneut.'}</p> </div> </div> </div> )}
                            <div className="mt-8 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={formStatus === 'loading'}
                                    className={`rounded-md bg-brand px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-x-2`}
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

      <Footer 
        businessName={profile.business_name} 
        slug={profile.slug} 
        // No longer need to pass colors
        // primaryColor={primaryColor} 
        // secondaryColor={secondaryColor}
      />
    </div>
  );
}

