// Make this a client component to allow data fetching with useEffect
"use client";

import Link from 'next/link'; // Standard Next.js import
// Import hooks for data fetching
import React, { useState, useEffect } from 'react';
// Import Supabase client using the configured alias
import { supabase } from '@/lib/supabaseClient'; 

// --- TYPE DEFINITIONS (Ensure consistency) ---
type Project = {
  id: string;
  title: string | null;
  'project-date': string | null; // Note the hyphenated name
  image_url: string | null;
  status: 'Published' | 'Draft' | string | null;
  created_at: string; // Ensure this is always included
  ai_description?: string | null;
};

type Profile = {
    id: string;
    business_name: string | null;
    address: string | null;
    phone: string | null;
    services_description: string | null;
    about_text: string | null;
    updated_at: string | null;
    // Add onboarding_complete if you need it for logic here later
    onboarding_complete?: boolean | null; 
};

// Simple SVG Icon component (same as before)
const Icon = ({ path, className }: { path: string, className?: string }) => (
    <svg className={className || "h-6 w-6 text-white"} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);
// Placeholder service icons (same as before)
const serviceIcons = {
    Sanitärinstallation: 'M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 12.75h16.5m-16.5 3h16.5',
    Heizungstechnik: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6',
    Fliesenarbeiten: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.125c0 .621.504 1.125 1.125 1.125z',
    Default: 'M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15.75 0h.008v.008H4.25v-.008z' // Generic icon
};

// Placeholder for Testimonials (Remains unchanged)
const testimonials = [ { body: 'Hervorragende Arbeit! Pünktlich, sauber und sehr professionell. Absolut zu empfehlen.', author: { name: 'Maria S.', handle: 'Privatkundin' } }, { body: 'Schnelle Terminfindung und top Ausführung. Das neue Bad ist ein Traum geworden.', author: { name: 'Thomas L.', handle: 'Hausbesitzer' } }, { body: 'Sehr zuverlässiger Partner für unsere Bauprojekte. Immer wieder gerne.', author: { name: 'Firma Bau GmbH', handle: 'Geschäftskunde' } }, ];


export default function PublicHomepage() {
  // === State Variables for Dynamic Content ===
  const [profile, setProfile] = useState<Profile | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Data Fetching ===
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      let profileData: Profile | null = null;
      let projectsData: Project[] = [];
      let profileErrorDetails: any = null; // Variable to store specific profile error
      let projectsErrorDetails: any = null; // Variable to store specific project error


      try {
        // --- Fetch Profile ---
        console.log("Homepage: Fetching profile data...");
        const { data: profiles, error: profileFetchError } = await supabase
          .from('profiles')
          .select('*') // Select all columns for now
          .limit(1); 

        profileErrorDetails = profileFetchError; // Store error details
        console.log("Homepage: Profile fetch response:", { profiles, profileFetchError }); // Detailed log

        if (profileFetchError) {
            console.error("Homepage: Error during profile fetch:", profileFetchError);
            // Don't throw immediately, allow project fetch to attempt
        } else {
             profileData = profiles && profiles.length > 0 ? profiles[0] : null;
             console.log("Homepage: Profile data found:", profileData);
             setProfile(profileData); // Set profile state here
        }

        // --- Fetch Featured Projects ---
        console.log("Homepage: Fetching featured projects...");
        // *** UPDATED .select() to include all required fields ***
        const { data: projects, error: projectsFetchError } = await supabase
          .from('projects')
          .select(` 
             id, 
             title, 
             image_url, 
             status, 
             "project-date", 
             created_at 
          `) // Ensure all needed fields are here
          .eq('status', 'Published')
          .order('created_at', { ascending: false })
          .limit(3);

        projectsErrorDetails = projectsFetchError; // Store error details
        console.log("Homepage: Projects fetch response:", { projects, projectsFetchError }); // Detailed log

        if (projectsFetchError) {
           console.error("Homepage: Error during projects fetch:", projectsFetchError);
           // Don't throw immediately
        } else {
            projectsData = (projects || []).map(p => ({
                ...p, 
                client: null, 
                ai_description: null 
            })) as Project[]; 
            console.log("Homepage: Featured projects data:", projectsData);
            setFeaturedProjects(projectsData); // Set project state here
        }

        // --- Final Error Check ---
        // If profile fetch failed specifically, set that as the main error
        if (profileErrorDetails) {
            throw new Error(`Profile fetch failed: ${profileErrorDetails.message}`);
        }
        // If project fetch failed (and profile didn't), set that error
         if (projectsErrorDetails) {
            throw new Error(`Projects fetch failed: ${projectsErrorDetails.message}`);
        }
         // Check if profile is still null after attempts
         if (!profileData) {
            throw new Error("Unternehmensprofil konnte nicht geladen werden.");
         }


      } catch (err) {
        console.error("Homepage: Error in fetchData block:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        setError(`Fehler: ${message}`); // Set specific error message
        setProfile(null); // Clear profile on error
        setFeaturedProjects([]); // Clear projects on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Run once on mount

  // --- Helper to parse services ---
  // (Code remains the same)
  const parsedServices = profile?.services_description?.split('\n').map(line => { const parts = line.split(':'); const name = parts[0]?.trim(); const description = parts.slice(1).join(':').trim(); if (name && description) { const iconKey = Object.keys(serviceIcons).find(key => name.toLowerCase().includes(key.toLowerCase())) || 'Default'; return { name, description, icon: serviceIcons[iconKey as keyof typeof serviceIcons] }; } return null; }).filter(Boolean) as { name: string; description: string; icon: string }[] || []; 


  // === Render Loading / Error States ===
  if (loading) {
     return <div className="min-h-screen flex items-center justify-center">Lade Webseite...</div>;
  }
  // Show specific error message if fetching failed
  if (error) {
     return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8">
                <p>Fehler beim Laden der Seite:</p>
                <p className="mt-2 text-sm">{error}</p>
                <p className="mt-4 text-xs text-gray-500">(Bitte überprüfen Sie die Supabase RLS Policen für 'profiles' und 'projects' auf öffentlichen Lesezugriff)</p>
            </div>;
  }
   // This condition might not be strictly needed now due to error handling above, but good fallback
   if (!profile && !loading) {
       return <div className="min-h-screen flex items-center justify-center text-red-600">Fehler: Unternehmensprofil konnte nicht geladen werden (Keine Daten gefunden).</div>;
  }


  // === Main Render Logic (Using Fetched Data) ===
  // (The rest of the JSX structure remains the same as before)
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ========== NAVBAR ========== */}
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0"> <Link href="/" className="text-xl font-bold text-gray-900"> {profile?.business_name || 'ArtisanCMS'} </Link> </div>
            <div className="hidden space-x-8 md:flex"> <Link href="#leistungen" className="font-medium text-gray-600 hover:text-orange-600">Leistungen</Link> <Link href="/portfolio" className="font-medium text-gray-600 hover:text-orange-600">Projekte</Link> <Link href="#kontakt" className="font-medium text-gray-600 hover:text-orange-600">Kontakt</Link> </div>
            <div className="hidden md:block"> <Link href="/login" className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"> Kunden-Login </Link> </div>
            <div className="md:hidden"> <button type="button" className="inline-flex items-center justify-center rounded-md p-2 text-gray-400"> <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg> </button> </div>
          </div>
        </div>
      </nav>

      {/* ========== HERO SECTION ========== */}
      <main className="isolate">
        <div className="relative px-6 lg:px-8"> <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40"> <div className="text-center"> <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"> {profile?.business_name || 'Ihr Meisterbetrieb für exzellentes Handwerk'} </h1> <p className="mt-6 text-lg leading-8 text-gray-600"> {profile?.about_text?.substring(0, 150) + (profile?.about_text && profile.about_text.length > 150 ? '...' : '') || 'Präzision, Qualität und Zuverlässigkeit für Ihr nächstes Projekt.'} </p> <div className="mt-10 flex items-center justify-center gap-x-6"> <Link href="#kontakt" className="rounded-md bg-orange-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-700"> Angebot anfordern </Link> <Link href="/portfolio" className="text-base font-semibold leading-6 text-gray-900"> Unsere Projekte ansehen <span aria-hidden="true">→</span> </Link> </div> </div> </div> </div>

        {/* ========== SERVICES SECTION ========== */}
        {parsedServices.length > 0 && ( <div id="leistungen" className="py-24 sm:py-32 bg-gray-50"> <div className="mx-auto max-w-7xl px-6 lg:px-8"> <div className="mx-auto max-w-2xl lg:text-center"> <h2 className="text-base font-semibold leading-7 text-orange-600">Leistungen</h2> <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"> Unsere Kernkompetenzen </p> </div> <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none"> <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3"> {parsedServices.map((service) => ( <div key={service.name} className="flex flex-col"> <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900"> <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-600"> <Icon path={service.icon} /> </div> {service.name} </dt> <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600"> <p className="flex-auto">{service.description}</p> </dd> </div> ))} </dl> </div> </div> </div> )}

        {/* ========== FEATURED WORK SECTION ========== */}
        {featuredProjects.length > 0 && ( <div id="projekte" className="py-24 sm:py-32"> <div className="mx-auto max-w-7xl px-6 lg:px-8"> <div className="mx-auto max-w-2xl lg:text-center"> <h2 className="text-base font-semibold leading-7 text-orange-600">Referenzen</h2> <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"> Ein Einblick in unsere Arbeit </p> <p className="mt-6 text-lg leading-8 text-gray-600"> Sehen Sie sich einige unserer kürzlich abgeschlossenen Projekte an. </p> </div> <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"> {featuredProjects.map((project) => ( <article key={project.id} className="flex flex-col items-start justify-between group"> <Link href={`/portfolio/${project.id}`} className="block w-full"> <div className="relative w-full"> <img src={project.image_url || `https://placehold.co/600x400/A3A3A3/FFF?text=${encodeURIComponent(project.title || 'P')}`} alt={project.title || 'Projektbild'} className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover border border-gray-200 group-hover:opacity-90 transition-opacity" onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/ef4444/ffffff?text=Error')} /> <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" /> </div> <div className="max-w-xl"> <div className="relative"> <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-orange-600"> {project.title || 'Unbenanntes Projekt'} </h3> </div> </div> </Link> </article> ))} </div> <div className="mt-16 text-center"> <Link href="/portfolio" className="rounded-md bg-orange-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-700"> Alle Projekte ansehen </Link> </div> </div> </div> )}

        {/* ========== TESTIMONIALS SECTION (Still Placeholder) ========== */}
        <section id="testimonials" className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8"> <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" /> <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" /> <div className="mx-auto max-w-2xl lg:max-w-4xl"> <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12">Was unsere Kunden sagen</h2> <figure className="mt-10"> <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9"> <p>“{testimonials[0].body}”</p> </blockquote> <figcaption className="mt-10"> <img className="mx-auto h-10 w-10 rounded-full" src="https://placehold.co/40x40/E2E8F0/475569?text=MS" alt="" /> <div className="mt-4 flex items-center justify-center space-x-3 text-base"> <div className="font-semibold text-gray-900">{testimonials[0].author.name}</div> <svg viewBox="0 0 2 2" width={3} height={3} aria-hidden="true" className="fill-gray-900"><circle cx={1} cy={1} r={1} /></svg> <div className="text-gray-600">{testimonials[0].author.handle}</div> </div> </figcaption> </figure> </div> </section>

        {/* ========== CONTACT SECTION (Using Profile Data) ========== */}
        <div id="kontakt" className="bg-gray-50 py-24 sm:py-32"> <div className="mx-auto max-w-7xl px-6 lg:px-8"> <div className="mx-auto max-w-2xl space-y-16 divide-y divide-gray-100 lg:mx-0 lg:max-w-none"> <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3"> <div> <h2 className="text-3xl font-bold tracking-tight text-gray-900">Kontakt aufnehmen</h2> <p className="mt-4 leading-7 text-gray-600">Wir freuen uns auf Ihre Anfrage und beraten Sie gerne unverbindlich zu Ihrem Vorhaben.</p> </div> <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2 lg:gap-8"> {profile?.address && ( <div className="rounded-2xl bg-white p-10 border border-gray-200"> <h3 className="text-base font-semibold leading-7 text-gray-900">Adresse</h3> <address className="mt-3 space-y-1 text-sm not-italic leading-6 text-gray-600 whitespace-pre-line"> {profile.address} </address> </div> )} {(profile?.phone || profile?.id) && ( <div className="rounded-2xl bg-white p-10 border border-gray-200"> <h3 className="text-base font-semibold leading-7 text-gray-900">Telefon & Email</h3> <dl className="mt-3 space-y-1 text-sm leading-6 text-gray-600"> {profile.phone && ( <div><dt className="sr-only">Phone</dt><dd><a className="hover:text-gray-900" href={`tel:${profile.phone}`}>{profile.phone}</a></dd></div> )} <div><dt className="sr-only">Email</dt><dd><a className="hover:text-gray-900" href="mailto:info@beispiel-handwerk.de">info@beispiel-handwerk.de</a></dd></div> </dl> </div> )} </div> </div> </div> </div> </div>
      </main>

      {/* ========== FOOTER ========== */}
       <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8"> <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer"> <div className="pb-6"> <Link href="#leistungen" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Leistungen</Link> </div> <div className="pb-6"> <Link href="/portfolio" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Projekte</Link> </div> <div className="pb-6"> <Link href="/impressum" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Impressum</Link> </div> <div className="pb-6"> <Link href="/datenschutz" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Datenschutz</Link> </div> </nav> <p className="mt-10 text-center text-xs leading-5 text-gray-500"> &copy; {new Date().getFullYear()} {profile?.business_name || 'Ihr Firmenname'}. Alle Rechte vorbehalten. </p> <p className="mt-2 text-center text-xs leading-5 text-gray-500"> Powered by ArtisanCMS </p> </div>
    </footer>

    </div>
  );
}

