// src/app/dashboard/projekte/page.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '../../../lib/supabaseClient'; // <-- CHANGED IMPORT
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import EmptyState from '@/components/EmptyState';
import RequestTestimonialModal from '@/components/RequestTestimonialModal';
import PlusIcon from '@/components/icons/PlusIcon';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';

// --- TYPE DEFINITIONS (FIXED) ---
type Project = {
  id: string;
  title: string | null;
  client?: string | null; 
  'project-date': string | null;
  after_image_url: string | null; // <-- Corrected name
  after_image_storage_path: string | null; // <-- Corrected name
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
  ai_description?: string | null;
  gallery_images: { url: string; path: string }[] | null; // <-- ADDED GALLERY TYPE
};


// --- ICON COMPONENTS ---
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const EyeSlashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /> </svg> );
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /> </svg> );
const ProjectsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" strokeLinecap="round" strokeLinejoin="round" /> </svg> );
const ChatBubbleOvalLeftEllipsisIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M18 10.5c0 .902-.32 1.75-.85 2.433m-3.72 4.781a3.75 3.75 0 01-5.105-2.094m0 0a3.73 3.73 0 01-3.296 2.094 3.75 3.75 0 01-3.433-5.133A3.75 3.75 0 016 6.643v-1.897a3.75 3.75 0 117.5 0v1.897a3.75 3.75 0 01-1.148 2.684 3.73 3.73 0 01-3.296-2.094zM18 10.5c-.218 0-.43.02-.639.058m-5.82 5.17A3.75 3.75 0 0115 13.5v-3c0-.902.32-1.75.85-2.433m4.303 8.366a3.75 3.75 0 01-.85 2.433m.02-6.681a3.73 3.73 0 013.296-2.094 3.75 3.75 0 013.433 5.133 3.75 3.75 0 01-6.43 2.684z" /> </svg> );
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> </svg> );

// --- PROJECT LIST ITEM COMPONENT ---
interface ProjectListItemProps { 
  project: Project; 
  onStatusToggle: (projectId: string, currentStatus: string | null) => void; 
  onDeleteRequest: (project: Project) => void;
  onRequestTestimonial: (project: Project) => void; 
  isToggling: boolean; 
  isDeleting: boolean; 
}

function ProjectListItem({ 
  project, 
  onStatusToggle, 
  onDeleteRequest, 
  onRequestTestimonial,
  isToggling, 
  isDeleting 
}: ProjectListItemProps) {
  const displayDate = project['project-date'] ? new Date(project['project-date']).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
  // --- (FIXED) ---
  const imageUrl = project.after_image_url || `https://placehold.co/48x48/334155/94a3b8?text=${encodeURIComponent(project.title?.charAt(0) || 'P')}`;
  const isPublished = project.status === 'Published';
  const editUrl = `/dashboard/projekte/${project.id}/edit`;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors">
      {/* Project Info */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={project.title || 'Project image'} className="w-12 h-12 rounded-md object-cover flex-shrink-0" onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/48x48/ef4444/ffffff?text=Err')} />
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{project.title || 'Untitled Project'}</p>
          <p className="text-sm text-slate-400">Erstellt: {new Date(project.created_at).toLocaleDateString('de-DE')}</p>
        </div>
      </div>
      {/* Actions & Status */}
      <div className="flex items-center space-x-3 text-sm flex-shrink-0 ml-4">
         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ isPublished ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400' }`}> {project.status || 'N/A'} </span>
         <span className="text-slate-400 hidden sm:inline">{displayDate}</span>
         {isPublished && (
           <button 
             onClick={() => onRequestTestimonial(project)} 
             disabled={isToggling || isDeleting} 
             title="Kundenstimme anfragen" 
             className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isToggling || isDeleting ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-500/30' }`}> 
             <span className="sr-only">Kundenstimme anfragen</span>
             <ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4" /> 
           </button>
         )}
         <button onClick={() => onStatusToggle(project.id, project.status)} disabled={isToggling || isDeleting} title={isPublished ? 'Projekt verbergen' : 'Projekt veröffentlichen'} className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isToggling ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : isPublished ? 'bg-yellow-600/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-green-600/20 text-green-300 hover:bg-green-500/30' }`}> <span className="sr-only">{isPublished ? 'Verbergen' : 'Veröffentlichen'}</span> {isToggling ? <ArrowPathIcon className="h-4 w-4" /> : isPublished ? <EyeSlashIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />} </button>
         <Link href={editUrl} title="Projekt bearbeiten" aria-disabled={isDeleting || isToggling} onClick={(e) => { if (isDeleting || isToggling) e.preventDefault(); }} className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isDeleting || isToggling ? 'bg-slate-700 text-slate-500 cursor-not-allowed pointer-events-none' : 'bg-blue-600/20 text-blue-300 hover:bg-blue-500/30' }`}> <span className="sr-only">Bearbeiten</span> <PencilIcon className="h-4 w-4" /> </Link>
         <button onClick={() => onDeleteRequest(project)} disabled={isDeleting || isToggling} title="Projekt löschen" className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isDeleting ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : isToggling ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600/20 text-red-300 hover:bg-red-500/30' }`}> <span className="sr-only">Löschen</span> {isDeleting ? <ArrowPathIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />} </button>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function ProjektePage() {
  // === State Variables ===
  const supabase = useMemo(() => createSupabaseClient(), []); // <-- CREATED CLIENT INSTANCE
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingProjectId, setTogglingProjectId] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  
  const [requestModalProject, setRequestModalProject] = useState<Project | null>(null);
  const [isRequestingTestimonial, setIsRequestingTestimonial] = useState(false);

  const router = useRouter();

  // === Fetch Data Function ===
  const fetchProjects = useCallback(async (user: User) => {
  setLoading(true);
  setError(null);

  console.log(`All Projects: Fetching projects for user ${user.id}...`);
    
    // --- (FIXED) UPDATED SELECT QUERY ---
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select(`id, title, "project-date", after_image_url, after_image_storage_path, status, created_at, gallery_images`) // <-- Corrected columns
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    console.log("All Projects - Supabase fetch response:", { data, fetchError });

    if (fetchError) {
      console.error('Error fetching projects:', fetchError);
      setError(`Projekte konnten nicht geladen werden: ${fetchError.message}`);
      setProjects([]);
  } else {
    setProjects(data || []);
  }
  setLoading(false);
}, [supabase]); // <-- The dependency array now correctly closes the useCallback hook

  // === Initial Data Fetch ===
  useEffect(() => {
    const getUserAndFetchData = async () => {
        setLoading(true); 
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
            console.error("Error fetching user:", userError);
            setError("Fehler beim Laden der Benutzerdaten.");
            setLoading(false); return;
        }
        if (!user) {
            router.push('/login');
            return; 
        }
        setCurrentUser(user);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('slug')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user slug:', profileError);
        } else {
          setUserSlug(profile?.slug ?? null);
        }
        await fetchProjects(user);
    };
    getUserAndFetchData();
  }, [router, supabase, fetchProjects]); // <-- ADDED supabase.auth dependency

  // === Handle Status Toggle Function ===
  const handleStatusToggle = async (projectId: string, currentStatus: string | null) => {
    if (!currentUser) {
      toast.error("Fehler: Benutzer nicht gefunden. Bitte laden Sie die Seite neu.");
      return;
    }
    setTogglingProjectId(projectId);
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';

    const togglePromise = async () => {
        const { data, error } = await supabase
          .from('projects')
          .update({ status: newStatus })
          .eq('id', projectId)
          .eq('user_id', currentUser.id) // This line is now safe
          .select()
          .single();

        if (error) {
            console.error('Error updating status:', error);
            throw error;
        }
        console.log("Status updated via toggle:", data);
        return { ...data, newStatus }; 
    };

    await toast.promise(togglePromise(), {
        loading: 'Status wird geändert...',
        success: (result) => {
            setProjects(currentProjects =>
                currentProjects.map(p =>
                    p.id === projectId ? { ...p, status: result.newStatus } : p
                )
            );
            return 'Status erfolgreich geändert!';
        },
        error: (err: any) => `Status konnte nicht geändert werden: ${err.message}`,
    });
    setTogglingProjectId(null);
  };


  // === Handle Delete Request (Opens Modal) ===
  const handleDeleteRequest = (project: Project) => { 
    setError(null); 
    setDeletingProject(project); 
    setShowDeleteConfirm(true); 
  };

  // === Handle Delete Confirmation (Actual Deletion) ===
  const handleConfirmDelete = async () => {
    if (!deletingProject || !currentUser) return;

    setIsConfirmingDelete(true);
    setTogglingProjectId(deletingProject.id); 

    // --- (FIXED) ---
    const imagePath = deletingProject.after_image_storage_path; // <-- Corrected name
    const galleryImagePaths = deletingProject.gallery_images?.map(img => img.path) || [];

    const deletePromise = async () => {
        // --- 1. Delete all images from Storage ---
        const pathsToDelete = [imagePath, ...galleryImagePaths].filter(Boolean) as string[];
        
        if (pathsToDelete.length > 0) {
            console.log("Deleting images from storage:", pathsToDelete);
            const { error: imageError } = await supabase.storage.from('project-images').remove(pathsToDelete);
            
            if (imageError) {
                console.error("Error deleting images:", imageError);
                toast.error(`Bilder konnten nicht gelöscht werden: ${imageError.message}. DB-Eintrag wird trotzdem gelöscht.`);
            } else {
                 console.log("Images deleted successfully.");
             }
        }

        // --- 2. Delete project from DB ---
        console.log("Deleting project from DB:", deletingProject.id);
        const { error: dbError } = await supabase
            .from('projects')
            .delete()
            .eq('id', deletingProject.id)
            .eq('user_id', currentUser.id); 

        if (dbError) {
            console.error("Error deleting project from DB:", dbError);
            throw new Error(`Projekt konnte nicht gelöscht werden: ${dbError.message}`);
        }
        
        console.log("Project deleted from DB successfully.");
        return deletingProject.id; 
    };

    await toast.promise(deletePromise(), { 
        loading: `Projekt "${deletingProject.title || ''}" wird gelöscht...`,
        success: (deletedId) => {
            setProjects(currentProjects => currentProjects.filter(p => p.id !== deletedId));
            setShowDeleteConfirm(false);
            setDeletingProject(null);
            return 'Projekt erfolgreich gelöscht!';
        },
        error: (err: any) => {
            console.error('Deletion failed:', err);
            return `Löschen fehlgeschlagen: ${err.message}`;
        }
    });

    setIsConfirmingDelete(false);
    setTogglingProjectId(null); 
  };

  // === Handle Cancel Delete ===
  const handleCancelDelete = () => { 
    setShowDeleteConfirm(false); 
    setDeletingProject(null); 
    setIsConfirmingDelete(false); 
    setError(null); 
  };
  
  
  // --- Handlers for the new modal ---
  const handleOpenRequestModal = (project: Project) => {
    setRequestModalProject(project);
  };
  const handleCloseRequestModal = () => {
    if (isRequestingTestimonial) return;
    setRequestModalProject(null);
  };
  const handleSendTestimonialRequest = async (clientEmail: string) => {
    if (!requestModalProject) return;
    
    setIsRequestingTestimonial(true);
    
    const sendPromise = async () => {
      const response = await fetch('/api/request-testimonial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: requestModalProject.id,
          clientEmail: clientEmail,
        }),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Senden der Anfrage.');
      }
      return result;
    };

    await toast.promise(
      sendPromise(),
      {
        loading: 'Anfrage wird gesendet...',
        success: (result) => {
          setIsRequestingTestimonial(false);
          setRequestModalProject(null);
          return 'Anfrage erfolgreich per E-Mail gesendet!';
        },
        error: (err: any) => {
          setIsRequestingTestimonial(false);
          return `Fehler: ${err.message}`;
        }
      }
    );
  };


  // === Render Logic ===
  const totalProjects = projects.length;
  const publishedProjects = projects.filter((project) => project.status === 'Published').length;
  const draftProjects = totalProjects - publishedProjects;
  const projectsWithGallery = projects.filter((project) => project.gallery_images && project.gallery_images.length > 0);
  const averageGalleryImages = projectsWithGallery.length
    ? Math.round(
        projectsWithGallery.reduce((sum, project) => sum + (project.gallery_images?.length ?? 0), 0) /
          projectsWithGallery.length,
      )
    : 0;
  const latestUpdate = projects[0]?.created_at
    ? new Date(projects[0].created_at).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;
  const homepageHref = userSlug ? `/${userSlug}` : '/';

  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      <DashboardHero
        eyebrow="Projekte"
        title="Alle Projekte verwalten"
        subtitle="Veröffentlichen Sie Ihre besten Arbeiten, steuern Sie Sichtbarkeit und sammeln Sie Testimonials – alles an einem Ort."
        actions={[
          {
            label: 'Neues Projekt',
            href: '/dashboard/projekte/neu',
            icon: PlusIcon,
          },
          {
            label: 'Live-Seite ansehen',
            href: homepageHref,
            variant: 'secondary',
            target: '_blank',
          },
        ]}
      >
        <div className="grid gap-4 md:grid-cols-4">
          <DashboardStatCard
            title="Gesamt"
            value={totalProjects}
            description="Angelegte Projekte"
            icon={ProjectsIcon}
            trend={latestUpdate ? `Zuletzt aktualisiert am ${latestUpdate}` : 'Jetzt erstes Projekt anlegen'}
          />
          <DashboardStatCard
            title="Veröffentlicht"
            value={publishedProjects}
            description="Live sichtbar"
            icon={CheckCircleIcon}
            accent="emerald"
            trend={publishedProjects > 0 ? 'Auf Ihrer Seite aktiv' : 'Noch nichts live'}
          />
          <DashboardStatCard
            title="Entwürfe"
            value={draftProjects}
            description="In Vorbereitung"
            icon={PencilIcon}
            accent="indigo"
            trend={draftProjects > 0 ? 'Bereit für den letzten Schliff' : 'Keine offenen Entwürfe'}
          />
          <DashboardStatCard
            title="Galerie-Bilder"
            value={averageGalleryImages}
            description="Ø Bilder pro Projekt"
            icon={PhotoIcon}
            trend={projectsWithGallery.length > 0 ? `${projectsWithGallery.length} Projekte mit Galerie` : 'Fügen Sie Bilder für mehr Vertrauen hinzu'}
          />
        </div>
      </DashboardHero>

      {loading && (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-10 text-center text-sm text-slate-300">
          Lade Projekte...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-500/40 bg-red-900/30 p-6 text-center text-sm text-red-100">{error}</div>
      )}

      {!loading && (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <ProjectListItem 
                    key={project.id}
                    project={project}
                    onStatusToggle={handleStatusToggle}
                    onDeleteRequest={handleDeleteRequest}
                    onRequestTestimonial={handleOpenRequestModal}
                    isToggling={togglingProjectId === project.id && !isConfirmingDelete}
                    isDeleting={deletingProject?.id === project.id && isConfirmingDelete}
                  />
                ))}
              </div>
            ) : (
              !error && (
                <EmptyState
                  icon={ProjectsIcon}
                  title="Sie haben noch keine Projekte erstellt"
                  message="Legen Sie los und erstellen Sie Ihr erstes Projekt. Laden Sie ein Foto hoch und lassen Sie unsere AI die Beschreibung erstellen."
                  buttonText="Erstes Projekt hinzufügen"
                  buttonHref="/dashboard/projekte/neu"
                />
              )
            )}
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/60">
              <div className="border-b border-slate-800/70 bg-gradient-to-r from-slate-900 via-slate-900/60 to-orange-900/30 px-5 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">Best-Practice Checkliste</h2>
              </div>
              <div className="space-y-3 px-5 py-4 text-sm text-slate-300">
                <p>Nutzen Sie aussagekräftige Vorher-/Nachher-Bilder, um die Qualität Ihrer Arbeit hervorzuheben.</p>
                <p>Aktivieren Sie veröffentlichte Projekte, sobald Texte und Bilder final sind, damit sie auf Ihrer Seite erscheinen.</p>
                <p>Fordern Sie nach Abschluss eines Projektes Kundenstimmen an, um soziale Beweise zu sammeln.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5 text-sm text-slate-300">
              <h3 className="text-base font-semibold text-white">Vorlagen für schnelle Veröffentlichungen</h3>
              <p className="mt-2 text-sm text-slate-400">
                Wiederverwenden Sie bestehende Projekte als Vorlage: duplizieren Sie ein Projekt, passen Sie Text und Bilder an und sparen Sie Zeit beim nächsten Upload.
              </p>
              <button
                onClick={() => router.push('/dashboard/projekte/neu')}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-400"
              >
                Projekt duplizieren & anpassen
              </button>
            </div>
          </div>
        </div>
      )}

       {/* Confirmation Modal */}
       <ConfirmationModal
         isOpen={showDeleteConfirm}
         title="Projekt löschen"
         message={`Möchten Sie das Projekt "${deletingProject?.title || 'Dieses Projekt'}" wirklich unwiderruflich löschen? Das Hauptbild und alle Galeriebilder werden ebenfalls entfernt.`}
         confirmText="Ja, löschen"
         cancelText="Abbrechen"
         onConfirm={handleConfirmDelete}
         onCancel={handleCancelDelete}
         isConfirming={isConfirmingDelete}
       />
       
       <RequestTestimonialModal
         isOpen={!!requestModalProject}
         projectTitle={requestModalProject?.title || ''}
         onClose={handleCloseRequestModal}
         onSend={handleSendTestimonialRequest}
         isSending={isRequestingTestimonial}
       />
    </main>
  );
}