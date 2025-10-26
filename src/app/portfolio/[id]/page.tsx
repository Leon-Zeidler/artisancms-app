// src/app/portfolio/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import Navbar from '@/components/Navbar';
// *** Corrected import casing ***
import Footer from '@/components/Footer'; // Import Footer with lowercase 'f'

// --- TYPE DEFINITIONS ---
type Project = { /* ... */ id: string; title: string | null; 'project-date': string | null; image_url: string | null; status: 'Published' | 'Draft' | string | null; created_at: string; ai_description: string | null; };
type Profile = { id: string; business_name: string | null; /* other fields if needed */ };

// --- MAIN PROJECT DETAIL PAGE COMPONENT ---
export default function ProjectDetailPage() {
  // === State Variables ===
  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Get Project ID ===
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  // === Data Fetching ===
  useEffect(() => {
    if (!projectId) {
      setError("Project ID not found in URL.");
      setLoading(false);
      return;
    }

    const fetchData = async () => { // Combined fetch function
      setLoading(true);
      setError(null);
      let profileError = null;
      let projectError = null;

      try {
         // Fetch Profile (only need business_name)
        const { data: profileData, error: pError } = await supabase
          .from('profiles')
          .select('id, business_name')
          .limit(1)
          .single();
        profileError = pError;
        if (profileData) setProfile(profileData);

        // Fetch Project Details
        console.log(`Fetching project details for ID: ${projectId}...`);
        const { data: projectData, error: projError } = await supabase
          .from('projects')
          .select(`id, title, "project-date", image_url, status, created_at, ai_description`)
          .eq('id', projectId)
          .eq('status', 'Published')
          .single();
        projectError = projError;
        if (projectData) setProject(projectData as Project);

        // Handle errors after trying both fetches
        if (profileError) throw new Error(`Profil konnte nicht geladen werden: ${profileError.message}`);
        // Ensure project data check correctly identifies missing project
        if (!projectData) {
            projectError = projectError || { message: "Project not found or not published." }; // Create a generic error if none exists
            throw new Error(`Projekt nicht gefunden oder Zugriff verweigert. (ID: ${projectId}) ${projectError?.message || ''}`.trim());
        }
        if (!profileData) throw new Error("Kein Unternehmensprofil gefunden.");


      } catch (err) {
        console.error('Error fetching project detail data:', err);
        const message = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.";
        setError(message);
        setProfile(null);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

 // === Helper function to format date (remains the same) ===
 const formatDate = (dateString: string | null | undefined): string => { /* ... */ if (!dateString) return 'Unbekanntes Datum'; try { const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`); if (isNaN(date.getTime())) { return 'Ungültiges Datum'; } return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { console.error("Error formatting date:", e); return 'Fehler beim Formatieren'; } };


  // === Render Logic ===
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar businessName={profile?.business_name} />
        <main className="flex-grow py-16 sm:py-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                {/* Loading State */}
                {loading && ( <p className="text-slate-600 text-center">Lade Projektdetails...</p> )}
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
                        <div className="mb-8"> <Link href="/portfolio" className="text-sm font-semibold leading-6 text-orange-600 hover:text-orange-500"> <span aria-hidden="true">←</span> Alle Projekte </Link> </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"> {project.title || 'Unbenanntes Projekt'} </h1>
                        <p className="mt-2 text-sm leading-6 text-gray-500"> Abgeschlossen am: {formatDate(project['project-date'])} </p>
                        <div className="mt-8 relative w-full"> <img src={project.image_url || 'https://placehold.co/1200x800/A3A3A3/FFF?text=Kein+Bild'} alt={project.title || 'Project image'} className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover border border-gray-200" onError={(e) => (e.currentTarget.src = 'https://placehold.co/1200x800/ef4444/ffffff?text=Image+Error')} /> <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" /> </div>
                        {project.ai_description && ( <div className="mt-10 prose prose-lg prose-slate max-w-none"> <h2>Projektbeschreibung</h2> {project.ai_description.split('\n').map((paragraph, index) => ( <p key={index}>{paragraph}</p> ))} </div> )}
                         <div className="mt-16 border-t border-gray-200 pt-10 text-center"> <h3 className="text-xl font-semibold text-gray-900">Interessiert?</h3> <p className="mt-4 text-base text-gray-600">Kontaktieren Sie uns für ein unverbindliches Angebot.</p> <div className="mt-6"> <Link href="/#kontakt" className="rounded-md bg-orange-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"> Angebot anfordern </Link> </div> </div>
                    </article>
                )}
            </div>
        </main>
       <Footer businessName={profile?.business_name} />
    </div>
  );
}

