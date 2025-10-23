// Mark as client component for data fetching
"use client";

// Import necessary hooks and components
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // For linking back home or to project details
import { supabase } from '@/lib/supabaseClient'; // Use the configured path alias

// --- TYPE DEFINITIONS ---
// Re-use the Project type (ensure consistency with dashboard definition)
type Project = {
  id: string;
  title: string | null;
  client?: string | null; // Optional
  'project-date': string | null;
  image_url: string | null;
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
  ai_description?: string | null; // Add description if needed for snippet
};

// --- PORTFOLIO CARD COMPONENT ---
// Similar to ProjectCard on dashboard, but adapted for public view
function PortfolioCard({ project }: { project: Project }) {
  // Use a default placeholder if image_url is null or empty
  const imageUrl = project.image_url || `https://placehold.co/600x400/A3A3A3/FFF?text=${encodeURIComponent(project.title || 'Project')}`;
  // Placeholder link - eventually will link to /portfolio/[id]
  const projectUrl = `/portfolio/${project.id}`; // Dynamic route based on ID

  return (
    <article className="flex flex-col items-start justify-between group">
       {/* Make the card itself a link to the detail page */}
      <Link href={projectUrl} className="block w-full">
        <div className="relative w-full">
            <img
            src={imageUrl}
            alt={project.title || 'Project image'}
            className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2] border border-gray-200 group-hover:opacity-90 transition-opacity"
            onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/ef4444/ffffff?text=Image+Error')}
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
        </div>
        <div className="max-w-xl mt-4">
            <div className="relative">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 group-hover:text-orange-600">
                {project.title || 'Untitled Project'}
            </h3>
             {/* Optional: Add a short description snippet here if needed */}
             {/* <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">{project.ai_description || ''}</p> */}
            </div>
        </div>
      </Link>
    </article>
  );
}


// --- MAIN PORTFOLIO PAGE COMPONENT ---
export default function PortfolioPage() {
  // === State Variables ===
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Data Fetching with useEffect ===
  useEffect(() => {
    const fetchPublishedProjects = async () => {
      setLoading(true);
      setError(null);

      // === Supabase Query ===
      // Fetch only projects where status is 'Published'
      // No auth check needed here as this is a public page,
      // but RLS still applies on the backend (we need a policy for public reads!)
      console.log("Fetching published projects...");
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          "project-date",
          image_url,
          status,
          created_at,
          ai_description 
        `)
        .eq('status', 'Published') // Filter for Published projects
        .order('project-date', { ascending: false, nullsFirst: false }) // Order by date, newest first
        .order('created_at', { ascending: false }); // Secondary sort by creation

      console.log("Supabase fetch response:", { data, fetchError });

      if (fetchError) {
        console.error('Error fetching published projects:', fetchError);
        setError(`Projekte konnten nicht geladen werden: ${fetchError.message}`);
      } else {
         console.log("Fetched published projects data:", data);
        setProjects(data || []);
      }
      setLoading(false);
    };

    fetchPublishedProjects();
  }, []); // Empty array ensures this runs only once on mount

  // === Render Logic ===
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
       {/* You might want to extract the Navbar into a reusable component later */}
       <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex h-16 items-center justify-between">
             <div className="flex-shrink-0">
               <Link href="/" className="text-xl font-bold text-gray-900">ArtisanCMS</Link>
             </div>
             <div className="hidden space-x-8 md:flex">
                <Link href="/#leistungen" className="font-medium text-gray-600 hover:text-orange-600">Leistungen</Link>
                <Link href="/portfolio" className="font-bold text-orange-600">Projekte</Link> {/* Highlight current page */}
                <Link href="/#kontakt" className="font-medium text-gray-600 hover:text-orange-600">Kontakt</Link>
             </div>
             <div className="hidden md:block">
               <Link href="/login" className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
                 Kunden-Login
               </Link>
             </div>
              {/* Mobile menu button placeholder */}
             <div className="md:hidden"> <button type="button" className="inline-flex items-center justify-center rounded-md p-2 text-gray-400"> <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg> </button> </div>
           </div>
         </div>
       </nav>

        {/* ========== PORTFOLIO GRID SECTION ========== */}
        <div className="py-24 sm:py-32 flex-grow"> {/* Added flex-grow */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl lg:mx-0">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Alle Projekte</h2>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Stöbern Sie durch unsere abgeschlossenen Arbeiten und lassen Sie sich inspirieren.
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <p className="text-slate-600 mt-16 text-center">Lade Projekte...</p>
                )}

                {/* Error State */}
                {error && (
                    <p className="text-red-600 mt-16 text-center">{error}</p>
                )}

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

      {/* Re-use Footer component later */}
       <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
             <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
                 <div className="pb-6"> <Link href="/#leistungen" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Leistungen</Link> </div>
                 <div className="pb-6"> <Link href="/portfolio" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Projekte</Link> </div>
                 <div className="pb-6"> <Link href="/impressum" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Impressum</Link> </div>
                 <div className="pb-6"> <Link href="/datenschutz" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Datenschutz</Link> </div>
             </nav>
            <p className="mt-10 text-center text-xs leading-5 text-gray-500"> &copy; {new Date().getFullYear()} Ihr Firmenname. Alle Rechte vorbehalten. </p>
            <p className="mt-2 text-center text-xs leading-5 text-gray-500"> Powered by ArtisanCMS </p>
        </div>
       </footer>
    </div>
  );
}

