// Mark as client component for data fetching and potential future interactions
"use client"; 

// Import necessary hooks and components
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Use standard Next.js import
import { useParams } from 'next/navigation'; // Use standard Next.js import
// Corrected import path using relative path
import { supabase } from '../../../lib/supabaseClient'; 

// --- TYPE DEFINITIONS ---
// Re-use the Project type (ensure consistency)
type Project = {
  id: string;
  title: string | null;
  'project-date': string | null;
  image_url: string | null;
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
  ai_description: string | null; // Make sure this is included
};

// --- MAIN PROJECT DETAIL PAGE COMPONENT ---
export default function ProjectDetailPage() {
  // === State Variables ===
  const [project, setProject] = useState<Project | null>(null); // Holds the single project data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Get Project ID from URL ===
  // The useParams hook gives us access to dynamic route parameters like '[id]'
  const params = useParams();
  // Ensure 'id' is treated as a string, even if it could be string[]
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id; 

  // === Data Fetching with useEffect ===
  useEffect(() => {
    // Only fetch if projectId is available
    if (!projectId) {
      setError("Project ID not found in URL.");
      setLoading(false);
      return;
    }

    const fetchProjectDetails = async () => {
      setLoading(true);
      setError(null);
      console.log(`Fetching project details for ID: ${projectId}...`);

      // === Supabase Query ===
      // Fetch a *single* project matching the ID and status 'Published'
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
        .eq('id', projectId) // Filter by the ID from the URL
        .eq('status', 'Published') // Ensure only published projects are shown
        .single(); // Fetch only one row

      console.log("Supabase fetch response:", { data, fetchError });

      if (fetchError || !data) {
        console.error('Error fetching project details:', fetchError);
        setError(`Projekt nicht gefunden oder Zugriff verweigert. (ID: ${projectId})`);
        setProject(null); // Clear project data on error
      } else {
        console.log("Fetched project data:", data);
        setProject(data as Project); // Set the fetched project data
      }
      setLoading(false);
    };

    fetchProjectDetails();
  }, [projectId]); // Re-run effect if the projectId changes

 // === Helper function to format date ===
 const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Unbekanntes Datum';
    try {
        // Ensure the date string is handled correctly, potentially adding time if needed for Date constructor
        const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
        if (isNaN(date.getTime())) { // Check if date is valid
            return 'Ungültiges Datum';
        }
        return date.toLocaleDateString('de-DE', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    } catch (e) {
        console.error("Error formatting date:", e);
        return 'Fehler beim Formatieren';
    }
 };


  // === Render Logic ===
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Navbar (Consider extracting to a reusable component) */}
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
           <div className="flex h-16 items-center justify-between">
             <div className="flex-shrink-0">
               <Link href="/" className="text-xl font-bold text-gray-900">ArtisanCMS</Link>
             </div>
             <div className="hidden space-x-8 md:flex">
                <Link href="/#leistungen" className="font-medium text-gray-600 hover:text-orange-600">Leistungen</Link>
                {/* Highlight Projects link */}
                <Link href="/portfolio" className="font-bold text-orange-600">Projekte</Link> 
                <Link href="/#kontakt" className="font-medium text-gray-600 hover:text-orange-600">Kontakt</Link>
             </div>
             <div className="hidden md:block">
               <Link href="/login" className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
                 Kunden-Login
               </Link>
             </div>
              <div className="md:hidden"> <button type="button" className="inline-flex items-center justify-center rounded-md p-2 text-gray-400"> <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg> </button> </div>
           </div>
         </div>
       </nav>

        {/* ========== PROJECT DETAIL SECTION ========== */}
        <div className="flex-grow py-16 sm:py-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                {/* Loading State */}
                {loading && (
                    <p className="text-slate-600 text-center">Lade Projektdetails...</p>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center">
                        <p className="text-red-600">{error}</p>
                        <Link href="/portfolio" className="mt-4 inline-block text-orange-600 hover:text-orange-500 font-semibold">
                           ← Zurück zum Portfolio
                        </Link>
                    </div>
                )}

                {/* Project Content */}
                {project && !loading && !error && (
                    <article>
                        {/* Back Link */}
                        <div className="mb-8">
                            <Link href="/portfolio" className="text-sm font-semibold leading-6 text-orange-600 hover:text-orange-500">
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

                        {/* Main Image */}
                        <div className="mt-8 relative w-full">
                            <img
                                src={project.image_url || 'https://placehold.co/1200x800/A3A3A3/FFF?text=Kein+Bild'}
                                alt={project.title || 'Project image'}
                                className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover border border-gray-200"
                                onError={(e) => (e.currentTarget.src = 'https://placehold.co/1200x800/ef4444/ffffff?text=Image+Error')}
                            />
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                        </div>

                        {/* AI Description */}
                        {/* Use dangerouslySetInnerHTML if description might contain basic HTML, otherwise just render directly */}
                        {project.ai_description && (
                            <div className="mt-10 prose prose-lg prose-slate max-w-none">
                                <h2>Projektbeschreibung</h2>
                                {/* Split description into paragraphs for better readability */}
                                {project.ai_description.split('\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        )}

                         {/* Contact CTA */}
                         <div className="mt-16 border-t border-gray-200 pt-10 text-center">
                            <h3 className="text-xl font-semibold text-gray-900">Interessiert?</h3>
                            <p className="mt-4 text-base text-gray-600">Kontaktieren Sie uns für ein unverbindliches Angebot.</p>
                             <div className="mt-6">
                                <Link href="/#kontakt" className="rounded-md bg-orange-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                                    Angebot anfordern
                                </Link>
                            </div>
                         </div>

                    </article>
                )}
            </div>
        </div>

      {/* Footer (Consider extracting to a reusable component) */}
       <footer className="bg-white border-t border-gray-200 mt-auto">
         {/* ... (footer code remains the same) ... */}
         <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8"> <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer"> <div className="pb-6"> <Link href="/#leistungen" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Leistungen</Link> </div> <div className="pb-6"> <Link href="/portfolio" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Projekte</Link> </div> <div className="pb-6"> <Link href="/impressum" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Impressum</Link> </div> <div className="pb-6"> <Link href="/datenschutz" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Datenschutz</Link> </div> </nav> <p className="mt-10 text-center text-xs leading-5 text-gray-500"> &copy; {new Date().getFullYear()} Ihr Firmenname. Alle Rechte vorbehalten. </p> <p className="mt-2 text-center text-xs leading-5 text-gray-500"> Powered by ArtisanCMS </p> </div>
       </footer>
    </div>
  );
}

