// src/app/[slug]/portfolio/page.tsx
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
  ai_description?: string | null;
};
type Profile = {
    id: string;
    business_name: string | null;
    slug: string | null;
    logo_url: string | null;        // <-- New
    primary_color: string | null;   // <-- New
    secondary_color: string | null; // <-- Added secondary color
};

// --- Constants (Defaults if not set in DB) ---
const DEFAULT_PRIMARY = '#ea580c'; // orange-600
const DEFAULT_SECONDARY = '#ffffff'; // white

// --- Helper function to darken color ---
const darkenColor = (hex: string, amount: number = 20): string => {
    if (!hex) return DEFAULT_PRIMARY;
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
      return DEFAULT_PRIMARY; // Return default on error
    }
};

// --- PORTFOLIO CARD COMPONENT ---
interface PortfolioCardProps {
  project: Project;
  slug: string | null;
}
function PortfolioCard({ project, slug }: PortfolioCardProps) {
  const imageUrl = project.image_url || `https://placehold.co/600x400/A3A3A3/FFF?text=${encodeURIComponent(project.title || 'Project')}`;
  const projectUrl = slug ? `/${slug}/portfolio/${project.id}` : `/portfolio/${project.id}`;

  return (
    <article className="flex flex-col items-start justify-between group">
      <Link href={projectUrl} className="block w-full">
        <div className="relative w-full">
            <img
            src={imageUrl}
            alt={project.title || 'Project image'}
            className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2] border border-gray-200 group-hover:opacity-90 transition-opacity"
            onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/600x400/ef4444/ffffff?text=Image+Error')}
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
        </div>
        <div className="max-w-xl mt-4">
            <div className="relative">
            <h3 
              className="text-lg font-semibold leading-6 text-gray-900 group-hover:text-brand transition-colors"
            >
                {project.title || 'Untitled Project'}
            </h3>
            </div>
        </div>
      </Link>
    </article>
  );
}


// --- MAIN PORTFOLIO PAGE COMPONENT ---
export default function ClientPortfolioPage() {
  // === State Variables ===
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  // === Data Fetching ===
  useEffect(() => {
    if (!slug) {
        setError("Seitenpfad (Slug) fehlt in der URL."); setLoading(false); return;
    }

    const fetchPortfolioData = async () => {
      setLoading(true); setError(null); setProfile(null); setProjects([]);
      let profileData: Profile | null = null;

      try {
        // --- 1. Fetch Profile by Slug ---
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          // --- FIX: Added secondary_color ---
          .select('id, business_name, slug, logo_url, primary_color, secondary_color') 
          .eq('slug', slug)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileResult) return notFound(); 

        profileData = profileResult as Profile;
        profileData.primary_color = profileData.primary_color || DEFAULT_PRIMARY;
        profileData.secondary_color = profileData.secondary_color || DEFAULT_SECONDARY; // <-- Add default
        setProfile(profileData);

        // --- 2. Fetch Published Projects for THIS Profile ID ---
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`id, title, "project-date", image_url, status, created_at, ai_description`)
          .eq('user_id', profileData.id)
          .eq('status', 'Published')
          .order('project-date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError(`Projekte konnten nicht geladen werden: ${fetchError.message}`);
        } else {
          setProjects(data || []);
        }

      } catch (err: any) {
        console.error("Error fetching portfolio data:", err);
         if (!error) { 
           setError(err.message || "Ein Fehler ist aufgetreten.");
         }
         setProfile(null); setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [slug]); 

  // === Render Logic ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Portfolio...</div>; }
  if (error && !profile) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
  if (!profile) { return null; }

  const primaryColor = profile.primary_color || DEFAULT_PRIMARY;
  const primaryColorDark = darkenColor(primaryColor);
  const secondaryColor = profile.secondary_color || DEFAULT_SECONDARY;

  return (
    // --- FIX: Inject CSS Variables ---
    <div 
      className="min-h-screen bg-white text-gray-900 flex flex-col"
      style={{
        '--color-brand-primary': primaryColor,
        '--color-brand-primary-dark': primaryColorDark,
        '--color-brand-secondary': secondaryColor,
      } as React.CSSProperties}
    >
      {/* --- FIX: Remove color props --- */}
       <Navbar 
         businessName={profile?.business_name} 
         slug={profile?.slug}
         logoUrl={profile.logo_url}
       />

        <main className="py-24 sm:py-32 flex-grow">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Alle Projekte</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Stöbern Sie durch unsere abgeschlossenen Arbeiten und lassen Sie sich inspirieren.
                    </p>
                </div>

                {error && <p className="text-red-600 mt-16 text-center">{error}</p>}

                {!error && (
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <PortfolioCard 
                                  key={project.id} 
                                  project={project} 
                                  slug={profile?.slug}
                                />
                            ))
                        ) : (
                             <p className="text-slate-500 lg:col-span-3 text-center mt-4">
                                Momentan sind keine veröffentlichten Projekte vorhanden.
                             </p>
                        )}
                    </div>
                )}
                 <div className="mt-16 text-center">
                    <Link 
                      href={`/${profile.slug}`} 
                      className="text-sm font-semibold leading-6 text-brand hover:text-brand-dark transition-colors"
                    >
                        <span aria-hidden="true">←</span> Zurück zur Startseite
                    </Link>
                </div>
            </div>
        </main>

       {/* --- FIX: Remove color props --- */}
       <Footer 
         businessName={profile?.business_name} 
         slug={profile?.slug}
       />
    </div>
  );
}