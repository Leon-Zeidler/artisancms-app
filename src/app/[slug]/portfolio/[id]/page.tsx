// src/app/[slug]/portfolio/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation'; // Import notFound
// *** CORRECTED Import path using alias ***
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar'; // Use uppercase N
import Footer from '@/components/Footer'; // Use uppercase F

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
// *** NEW: Profile type needed for Navbar/Footer props ***
type Profile = {
    id: string;
    business_name: string | null;
    slug: string | null;
    // Add other fields if needed by Navbar/Footer later
};

// --- MAIN PROJECT DETAIL PAGE COMPONENT ---
export default function ClientProjectDetailPage() {
  // === State Variables ===
  const [project, setProject] = useState<Project | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // State for profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Get Slug and Project ID from URL ===
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  // === Data Fetching ===
  useEffect(() => {
    if (!slug || !projectId) {
      setError("Slug oder Projekt-ID fehlt in der URL.");
      setLoading(false);
      return;
    }

    const fetchProjectDetails = async () => {
      setLoading(true);
      setError(null);
      setProfile(null); // Reset profile
      setProject(null); // Reset project

      let profileData: Profile | null = null;

      try {
        // --- 1. Fetch Profile by Slug ---
        console.log(`Project Detail: Fetching profile for slug: ${slug}`);
        const { data: profileResult, error: profileError } = await supabase
          .from('profiles')
          .select('id, business_name, slug') // Fetch fields needed for Navbar/Footer
          .eq('slug', slug)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profileResult) return notFound(); // Show 404 if profile doesn't exist

        profileData = profileResult as Profile;
        setProfile(profileData);
        console.log(`Project Detail: Found profile ID: ${profileData.id}`);

        // --- 2. Fetch Project Details by ID and Profile ID ---
        console.log(`Project Detail: Fetching project ID: ${projectId} for profile ID: ${profileData.id}`);
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`id, title, "project-date", image_url, status, created_at, ai_description`)
          .eq('id', projectId) // Filter by the ID from the URL
          .eq('user_id', profileData.id) // *** Ensure project belongs to the profile owner ***
          .eq('status', 'Published') // Ensure only published projects are shown publicly
          .maybeSingle(); // Use maybeSingle

        if (fetchError) {
          console.error('Error fetching project details:', fetchError);
          throw new Error(`Projekt konnte nicht geladen werden: ${fetchError.message}`);
        }

        if (!data) {
          console.log(`Project Detail: Project ${projectId} not found or not published/owned by profile ${profileData.id}`);
          // Project doesn't exist, isn't published, or doesn't belong to this slug's owner
          return notFound(); // Show 404
        }

        console.log("Fetched project data:", data);
        setProject(data as Project);

      } catch (err: any) {
        console.error("Error in fetchProjectDetails:", err);
         // Don't call notFound() if it's already been called
         // Check if the error object indicates a Supabase PostgrestError causing a 404 or similar
         if (err?.code !== 'PGRST116' && !error) { // PGRST116 = 0 rows returned
           setError(err.message || "Ein Fehler ist aufgetreten.");
         }
         // If profile wasn't found, notFound() should have handled it.
         // If project wasn't found, notFound() should have handled it.
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [slug, projectId]); // Re-run effect if slug or projectId changes

 // === Helper function to format date ===
 const formatDate = (dateString: string | null | undefined): string => { /* ... */ if (!dateString) return 'Unbekanntes Datum'; try { const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`); if (isNaN(date.getTime())) { return 'Ungültiges Datum'; } return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { console.error("Error formatting date:", e); return 'Fehler beim Formatieren'; } };


  // === Render Logic ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Projektdetails...</div>; }
  if (error) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
  // Should be handled by notFound(), but as a fallback:
  if (!profile || !project) { return <div className="min-h-screen flex items-center justify-center text-red-600">Projekt oder Profil nicht gefunden.</div>; }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Pass profile name and slug */}
      <Navbar businessName={profile?.business_name} slug={profile?.slug}/>

        {/* ========== PROJECT DETAIL SECTION ========== */}
        <div className="flex-grow py-16 sm:py-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
               {/* Content */}
                    <article>
                        {/* Back Link - Update to include slug */}
                        <div className="mb-8">
                            <Link href={`/${profile?.slug}/portfolio`} className="text-sm font-semibold leading-6 text-orange-600 hover:text-orange-500">
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
                        {project.ai_description && (
                            <div className="mt-10 prose prose-lg prose-slate max-w-none">
                                <h2>Projektbeschreibung</h2>
                                {project.ai_description.split('\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        )}

                         {/* Contact CTA - Link should ideally work without slug, but can add if needed */}
                         <div className="mt-16 border-t border-gray-200 pt-10 text-center">
                            <h3 className="text-xl font-semibold text-gray-900">Interessiert?</h3>
                            <p className="mt-4 text-base text-gray-600">Kontaktieren Sie uns für ein unverbindliches Angebot.</p>
                             <div className="mt-6">
                                {/* Link to homepage contact section (using slug) */}
                                <Link href={`/${profile?.slug}/#kontakt`} className="rounded-md bg-orange-600 px-5 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600">
                                    Angebot anfordern
                                </Link>
                            </div>
                         </div>

                    </article>
            </div>
        </div>

      {/* Pass profile name and slug */}
       <Footer businessName={profile?.business_name} slug={profile?.slug}/>
    </div>
  );
}
