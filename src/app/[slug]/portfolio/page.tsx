// src/app/[slug]/portfolio/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation'; // Import useParams and notFound
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar'; // Use uppercase N
import Footer from '@/components/Footer'; // Use uppercase F

// --- TYPE DEFINITIONS ---
type Project = {
  id: string;
  title: string | null;
  client?: string | null;
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

// --- PORTFOLIO CARD COMPONENT ---
interface PortfolioCardProps {
  project: Project;
  slug: string | null; // Pass slug for link generation
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
            {/* --- Apply brand hover color --- */}
            <h3 className="text-lg font-semibold leading-6 text-gray-900 group-hover:text-brand transition-colors">
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

  // === Data Fetching (Updated) ===
  useEffect(() => {
    if (!slug) {
        setError("Seitenpfad (Slug) fehlt in der URL."); setLoading(false); return;
    }

    const fetchPortfolioData = async () => {
      setLoading(true); setError(null); setProfile(null); setProjects([]);
      let profileData: Profile | null = null;

      try {
        // --- 1. Fetch Profile by Slug (including new fields) ---
        console.log(`Portfolio List: Fetching profile for slug: ${slug}...`);
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .select('id, business_name, slug, logo_url, primary_color, secondary_color') // <-- Fetch new fields
          .eq('slug', slug)
          .maybeSingle();

        if (profileError) {
             console.error("Portfolio List: Error fetching profile:", profileError);
             throw new Error(`Profil konnte nicht geladen werden: ${profileError.message}`);
         }
        if (!profileResult) {
            console.log(`Portfolio List: No profile found for slug ${slug}.`);
            return notFound();
        }

        profileData = profileResult as Profile;
        // Assign defaults
        profileData.primary_color = profileData.primary_color || DEFAULT_PRIMARY;
        profileData.secondary_color = profileData.secondary_color || DEFAULT_SECONDARY;
        setProfile(profileData);
        console.log(`Portfolio List: Found profile ID: ${profileData.id}`);

        // --- 2. Fetch Published Projects for THIS Profile ID ---
        console.log(`Portfolio List: Fetching published projects for profile ID: ${profileData.id}...`);
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`id, title, "project-date", image_url, status, created_at, ai_description`)
          .eq('user_id', profileData.id)
          .eq('status', 'Published')
          .order('project-date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });

        if (fetchError) {
          console.error('Error fetching published projects:', fetchError);
          setError(`Projekte konnten nicht geladen werden: ${fetchError.message}`);
        } else {
           console.log("Fetched published projects data:", data);
          setProjects(data || []);
        }

      } catch (err: any) {
        console.error("Error fetching portfolio data:", err);
         if (!error) { setError(err.message || "Ein Fehler ist aufgetreten."); }
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
       <Navbar businessName={profile?.business_name} slug={profile?.slug} logoUrl={profile?.logo_url} />

        <main className="py-24 sm:py-32 flex-grow">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Alle Projekte</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Stöbern Sie durch unsere abgeschlossenen Arbeiten und lassen Sie sich inspirieren.
                    </p>
                </div>

                {error && <p className="text-red-600 mt-16 text-center">{error}</p>}

                {/* Project Grid */}
                {!error && (
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <PortfolioCard key={project.id} project={project} slug={profile?.slug}/>
                            ))
                        ) : (
                             <p className="text-slate-500 lg:col-span-3 text-center mt-4">
                                Momentan sind keine veröffentlichten Projekte vorhanden.
                             </p>
                        )}
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
