"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useProfile } from '@/contexts/ProfileContext';

// --- (NEW) Import the slider component and its CSS ---
import BeforeAfterSlider from 'react-before-after-slider-component';
import 'react-before-after-slider-component/dist/build.css';

// --- TYPE DEFINITIONS ---
type Project = {
  id: string;
  title: string | null;
  'project-date': string | null;
  after_image_url: string | null;
  before_image_url: string | null;
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
  ai_description: string | null;
  gallery_images: { url: string; path: string }[] | null;
};

export default function ClientProjectDetailPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const profile = useProfile();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!projectId || !profile) return notFound();

    const fetchProjectDetails = async () => {
      setLoading(true); setError(null); setProject(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select(`*`) // <-- Updated to fetch all columns
          .eq('id', projectId)
          .eq('user_id', profile.id)
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
  }, [profile, projectId, supabase]);

 const formatDate = (dateString: string | null | undefined): string => {
     if (!dateString) return 'Unbekanntes Datum';
     try {
         const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
         if (isNaN(date.getTime())) return 'Ungültiges Datum';
         return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
     } catch (e) { console.error("Error formatting date:", e); return 'Fehler'; }
 };

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      (e.target as HTMLImageElement).src = 'https://placehold.co/1200x800/ef4444/ffffff?text=Bildfehler';
  };
  const placeholderImg = 'https://placehold.co/1200x800/A3A3A3/FFF?text=Kein+Bild';

  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Projektdetails...</div>; }
  if (error) { return <div className="min-h-screen flex items-center justify-center text-center text-red-600 p-8"><p>Fehler:</p><p className="mt-2 text-sm">{error}</p></div>; }
  if (!project) { return null; }

  const galleryImages = project.gallery_images?.filter(img => img.url) || [];
  const hasBeforeImage = !!project.before_image_url;
  const hasAfterImage = !!project.after_image_url;
  const hasGallery = galleryImages.length > 0;
  
  // --- (NEW) Define images for slider ---
  const beforeImage = {
    imageUrl: project.before_image_url || placeholderImg,
    alt: `${project.title || 'Projektbild'} (Vorher)`
  };
  const afterImage = {
    imageUrl: project.after_image_url || placeholderImg,
    alt: `${project.title || 'Projektbild'} (Nachher)`
  };

  return (
    <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
           <article>
                <div className="mb-8">
                    <Link href={`/${profile.slug}/portfolio`} className="text-sm font-semibold leading-6 text-brand hover:text-brand-dark transition-colors">
                        <span aria-hidden="true">←</span> Alle Projekte
                    </Link>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    {project.title || 'Unbenanntes Projekt'}
                </h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                   Abgeschlossen am: {formatDate(project['project-date'])}
                </p>

                {/* --- (NEW) IMAGE SLIDER LOGIC --- */}
                <div className="mt-8">
                  {/* === CASE 1: BOTH Images exist (Show Slider) === */}
                  {hasBeforeImage && hasAfterImage ? (
                    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 ring-1 ring-inset ring-gray-900/10">
                      <BeforeAfterSlider
                        firstImage={beforeImage}
                        secondImage={afterImage}
                        // --- UPDATED DELIMITER STYLES ---
                        delimiterIconStyles={{ 
                          width: '48px', // Slightly larger for better touch interaction
                          height: '48px',
                          background: 'white', // White background for visibility
                          borderRadius: '50%', // Round shape
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Subtle shadow for depth
                          display: 'flex', // Enable flexbox for centering
                          alignItems: 'center', // Center content vertically
                          justifyContent: 'center', // Center content horizontally
                          cursor: 'ew-resize', // Standard horizontal resize cursor
                          // (Optional: If you want to try adding pseudo-elements for arrows, it's CSS-only and outside this component's props)
                        }}
                        delimiterColor="white" // This sets the color of the vertical bar
/>
                    </div>
                  ) : /* === CASE 2: ONLY After Image exists (Show Single Image) === */
                  hasAfterImage ? (
                    <div className="relative w-full">
                      <img
                        src={project.after_image_url || placeholderImg}
                        alt={`${project.title || 'Projektbild'} Hauptbild`}
                        className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover border border-gray-200"
                        onError={onImageError}
                      />
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                  ) : /* === CASE 3: NO Images (Show Placeholder) === */
                  !hasGallery ? (
                    <div className="relative w-full">
                       <img src={placeholderImg} alt={project.title || 'Bild'} className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover border border-gray-200" />
                    </div>
                  ) : null}
                </div>

                {/* === GALLERY BLOCK (Unchanged) === */}
                {hasGallery && (
                  <div className="mt-10 pt-10 border-t border-gray-200">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Galerie</h2>
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {galleryImages.map((image, index) => (
                        <div key={index} className="relative w-full">
                          <img
                            src={image.url}
                            alt={`${project.title || 'Projektbild'} Galerie ${index + 1}`}
                            className="aspect-square w-full rounded-2xl bg-gray-100 object-cover border border-gray-200"
                            onError={onImageError}
                          />
                          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* --- END OF IMAGE LOGIC --- */}


                {project.ai_description && (
                     <div className="mt-10 prose prose-lg prose-slate max-w-none">
                         <h2>Projektbeschreibung</h2>
                         {project.ai_description.split('\n').filter(p => p.trim().length > 0).map((p, i) => (<p key={i}>{p}</p>))}
                    </div>
                )}
                 <div className="mt-16 border-t border-gray-200 pt-10 text-center">
                    <h3 className="text-xl font-semibold text-gray-900">Interessiert?</h3>
                    <p className="mt-4 text-base text-gray-600">Kontaktieren Sie uns für ein unverbindliches Angebot.</p>
                     <div className="mt-6">
                        <Link href={`/${profile.slug}/#kontakt`} className="rounded-md bg-brand px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                            Angebot anfordern
                        </Link>
                     </div>
                 </div>
            </article>
        </div>
    </div>
  );
}