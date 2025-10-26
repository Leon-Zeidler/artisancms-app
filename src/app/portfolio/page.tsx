// src/app/portfolio/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
// *** Corrected import casing ***
import Footer from '@/components/Footer'; // Import Footer with lowercase 'f'

// --- TYPE DEFINITIONS ---
type Project = { /* ... */ id: string; title: string | null; client?: string | null; 'project-date': string | null; image_url: string | null; status: 'Published' | 'Draft' | string | null; created_at: string; ai_description?: string | null; };
type Profile = { id: string; business_name: string | null; /* other fields if needed */ };


// --- PORTFOLIO CARD COMPONENT (remains the same) ---
function PortfolioCard({ project }: { project: Project }) { /* ... */ const imageUrl = project.image_url || `https://placehold.co/600x400/A3A3A3/FFF?text=${encodeURIComponent(project.title || 'Project')}`; const projectUrl = `/portfolio/${project.id}`; return ( <article className="flex flex-col items-start justify-between group"> <Link href={projectUrl} className="block w-full"> <div className="relative w-full"> <img src={imageUrl} alt={project.title || 'Project image'} className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2] border border-gray-200 group-hover:opacity-90 transition-opacity" onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/ef4444/ffffff?text=Image+Error')} /> <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" /> </div> <div className="max-w-xl mt-4"> <div className="relative"> <h3 className="text-lg font-semibold leading-6 text-gray-900 group-hover:text-orange-600"> {project.title || 'Untitled Project'} </h3> </div> </div> </Link> </article> ); }


// --- MAIN PORTFOLIO PAGE COMPONENT ---
export default function PortfolioPage() {
  // === State Variables ===
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null); // *** NEW: Profile state ***
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Data Fetching ===
  useEffect(() => {
    const fetchData = async () => { // Combined fetch function
      setLoading(true);
      setError(null);
      let profileError = null;
      let projectsError = null;

      try {
        // Fetch Profile (only need business_name)
        const { data: profileData, error: pError } = await supabase
          .from('profiles')
          .select('id, business_name')
          .limit(1)
          .single(); // Use single() if you expect only one profile
        profileError = pError;
        if (profileData) setProfile(profileData);

        // Fetch Published Projects
        const { data: projectsData, error: projError } = await supabase
          .from('projects')
          .select(`id, title, "project-date", image_url, status, created_at, ai_description`)
          .eq('status', 'Published')
          .order('project-date', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false });
        projectsError = projError;
        if (projectsData) setProjects(projectsData);

        // Handle errors after trying both fetches
        if (profileError) throw new Error(`Profil konnte nicht geladen werden: ${profileError.message}`);
        if (projectsError) throw new Error(`Projekte konnten nicht geladen werden: ${projectsError.message}`);
        if (!profileData) throw new Error("Kein Unternehmensprofil gefunden."); // Add this check

      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
        setError(message);
        setProfile(null); // Clear on error
        setProjects([]); // Clear on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // === Render Logic ===
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
       {/* Use Navbar, pass business name */}
       <Navbar businessName={profile?.business_name} />

        {/* ========== PORTFOLIO GRID SECTION ========== */}
        <div className="py-24 sm:py-32 flex-grow">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Alle Projekte</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Stöbern Sie durch unsere abgeschlossenen Arbeiten und lassen Sie sich inspirieren.
                    </p>
                </div>

                {/* Loading State */}
                {loading && ( <p className="text-slate-600 mt-16 text-center">Lade Projekte...</p> )}

                {/* Error State */}
                {error && ( <p className="text-red-600 mt-16 text-center">{error}</p> )}

                {/* Project Grid */}
                {!loading && !error && (
                    <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {projects.length > 0 ? (
                            projects.map((project) => (
                                <PortfolioCard key={project.id} project={project} />
                            ))
                        ) : (
                             <p className="text-slate-500 lg:col-span-3 text-center mt-4">
                                Momentan sind keine veröffentlichten Projekte vorhanden.
                             </p>
                        )}
                    </div>
                )}
            </div>
        </div>

      {/* Use Footer, pass business name */}
       <Footer businessName={profile?.business_name} />
    </div>
  );
}

