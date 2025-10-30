// src/app/[slug]/portfolio/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// --- TYPE DEFINITIONS ---
type Project = {
  id: string;
  title: string | null;
  'project-date': string | null;
  image_url: string | null;
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
  ai_description: string | null;
};
type Profile = {
    id: string;
    business_name: string | null;
    slug: string | null;
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

// --- MAIN PROJECT DETAIL PAGE COMPONENT ---
export default function ClientProjectDetailPage() {
  // === State Variables ===
  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  // === Data Fetching ===
  useEffect(() => {
    if (!slug || !projectId) {
      setError("Slug oder Projekt-ID fehlt."); setLoading(false); return;
    }

    const fetchProjectDetails = async () => {
      setLoading(true); setError(null); setProfile(null); setProject(null);
      let profileData: Profile | null = null;

      try {
        // --- 1. Fetch Profile by Slug ---
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .select('id, business_name, slug, logo_url, primary_color') // <-- FETCH COLORS/LOGO
          .eq('slug', slug)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileResult) return notFound();

        profileData = profileResult as Profile;
        profileData.primary_color = profileData.primary_color || DEFAULT_PRIMARY;
        setProfile(profileData);

        // --- 2. Fetch Project Details by ID AND Profile ID ---
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`id, title, "project-date", image_url, status, created_at, ai_description`)
          .eq('id', projectId)
          .eq('user_id', profileData.id)
          .eq('status', 'Published')
          .maybeSingle(); 

        if (fetchError) throw fetchError;
        if (!data) return notFound(); 

        setProject(data as Project);

      } catch (err: any) {
        console.error("Error fetching project detail:", err);
        if (!error) setError(err.message || "Fehler.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [slug, projectId]);

 // --- Helper function to format date ---
 const formatDate = (dateString: string | null | undefined): string => {
     if (!dateString) return 'Unbekanntes Datum';
     try {
         const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
         if (isNaN(date.getTime())) return 'Ungültiges Datum';
         return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
     } catch (e) { console.error("Error formatting date:", e); return 'Fehler'; }
 };

  // === Render Logic ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Projektdetails...</div>; }
  if (error) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
  if (!profile || !project) { return null; }

  const primaryColor = profile.primary_color || DEFAULT_PRIMARY;
  const primaryColorDark = darkenColor(primaryColor);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar 
        businessName={profile?.business_name} 
        slug={profile?.slug}
        logoUrl={profile.logo_url}
        primaryColor={primaryColor}
        primaryColorDark={primaryColorDark}
      />

        <main className="flex-grow py-16 sm:py-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
               <article>
                        {/* Back Link */}
                        <div className="mb-8">
                            <Link 
                              href={`/${profile?.slug}/portfolio`} 
                              className="text-sm font-semibold leading-6 text-orange-600 hover:text-orange-500"
                              style={{ color: primaryColor }}
                              onMouseOver={(e) => e.currentTarget.style.color = primaryColorDark}
                              onMouseOut={(e) => e.currentTarget.style.color = primaryColor}
                            >
                                <span aria-hidden="true">←</span> Alle Projekte
                            </Link>
                        </div>
                        {/* Title */}
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            {project.title || 'Unbenanntes Projekt'}
                        </h1>
                        {/* Date */}
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                           Abgeschlossen am: {formatDate(project['project-date'])}
                        </p>
                        {/* Image */}
                        <div className="mt-8 relative w-full">
                            <img
                                src={project.image_url || 'https://placehold.co/1200x800/A3A3A3/FFF?text=Kein+Bild'}
                                alt={project.title || 'Bild'}
                                className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover border border-gray-200"
                                onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/1200x800/ef4444/ffffff?text=Image+Error')}
                            />
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                        </div>
                        {/* Description */}
                        {project.ai_description && (
                             <div className="mt-10 prose prose-lg prose-slate max-w-none">
                                 <h2>Projektbeschreibung</h2>
                                 {project.ai_description.split('\n').map((p, i) => (<p key={i}>{p}</p>))}
                            </div>
                        )}
                         {/* Contact CTA */}
                         <div className="mt-16 border-t border-gray-200 pt-10 text-center">
                            <h3 className="text-xl font-semibold text-gray-900">Interessiert?</h3>
                            <p className="mt-4 text-base text-gray-600">Kontaktieren Sie uns für ein unverbindliches Angebot.</p>
                             <div className="mt-6">
                                <Link
                                    href={`/${profile?.slug}/#kontakt`}
                                    className="rounded-md px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                    style={{ backgroundColor: primaryColor, outlineColor: primaryColor }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = primaryColorDark}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                                >
                                    Angebot anfordern
                                </Link>
                             </div>
                         </div>
                    </article>
            </div>
        </main>

       <Footer 
         businessName={profile?.business_name} 
         slug={profile?.slug}
         primaryColor={primaryColor}
       />
    </div>
  );
}