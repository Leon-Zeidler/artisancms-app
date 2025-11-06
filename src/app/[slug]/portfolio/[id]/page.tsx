// src/app/[slug]/portfolio/[id]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useProfile } from '@/contexts/ProfileContext'; // <-- IMPORT CONTEXT

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

// --- MAIN PROJECT DETAIL PAGE COMPONENT ---
export default function ClientProjectDetailPage() {
  // === State Variables ===
  const supabase = useMemo(() => createSupabaseClient(), []);
  const profile = useProfile(); // <-- GET PROFILE FROM CONTEXT
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  // === Data Fetching ===
  useEffect(() => {
    if (!projectId || !profile) return notFound();

    const fetchProjectDetails = async () => {
      setLoading(true); setError(null); setProject(null);

      try {
        // --- Profile is already fetched, just get the specific project ---
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`id, title, "project-date", image_url, status, created_at, ai_description`)
          .eq('id', projectId)
          .eq('user_id', profile.id) // <-- Use ID from context
          .eq('status', 'Published')
          .maybeSingle(); 

        if (fetchError) throw fetchError;
        if (!data) return notFound(); // Project not found or not published

        setProject(data as Project);

      } catch (err: any) {
        console.error("Error fetching project detail:", err);
        if (!error) setError(err.message || "Fehler.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [profile, projectId]); // <-- Depend on profile and projectId

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
  if (!project) { return null; } // Handled by notFound or loading

  // Layout is handled by layout.tsx
  return (
    <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
           <article>
                {/* Back Link */}
                <div className="mb-8">
                    <Link 
                      href={`/${profile.slug}/portfolio`} 
                      className="text-sm font-semibold leading-6 text-brand hover:text-brand-dark transition-colors"
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
                            href={`/${profile.slug}/#kontakt`}
                            className="rounded-md bg-brand px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                        >
                            Angebot anfordern
                        </Link>
                     </div>
                 </div>
            </article>
        </div>
    </div>
  );
}