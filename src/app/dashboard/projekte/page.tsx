// src/app/dashboard/projekte/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added useRouter for potential redirects
import { supabase } from '../../../lib/supabaseClient';
import { User } from '@supabase/supabase-js'; // Added User type
import toast from 'react-hot-toast'; // Import toast

// --- TYPE DEFINITIONS ---
type Project = {
  id: string;
  title: string | null;
  client?: string | null; // Keep optional
  'project-date': string | null;
  image_url: string | null;
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
  ai_description?: string | null;
};

// --- ICON COMPONENTS ---
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> );
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const EyeSlashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /> </svg> );
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /> </svg> );
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> </svg> );

// --- PROJECT LIST ITEM COMPONENT ---
interface ProjectListItemProps { project: Project; onStatusToggle: (projectId: string, currentStatus: string | null) => void; onDeleteRequest: (project: Project) => void; isToggling: boolean; isDeleting: boolean; }
function ProjectListItem({ project, onStatusToggle, onDeleteRequest, isToggling, isDeleting }: ProjectListItemProps) {
  const displayDate = project['project-date'] ? new Date(project['project-date']).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
  const imageUrl = project.image_url || `https://placehold.co/48x48/334155/94a3b8?text=${encodeURIComponent(project.title?.charAt(0) || 'P')}`;
  const isPublished = project.status === 'Published';
  const editUrl = `/dashboard/projekte/${project.id}/edit`;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors">
      {/* Project Info */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
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
         <button onClick={() => onStatusToggle(project.id, project.status)} disabled={isToggling || isDeleting} title={isPublished ? 'Projekt verbergen' : 'Projekt veröffentlichen'} className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isToggling ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : isPublished ? 'bg-yellow-600/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-green-600/20 text-green-300 hover:bg-green-500/30' }`}> <span className="sr-only">{isPublished ? 'Verbergen' : 'Veröffentlichen'}</span> {isToggling ? <ArrowPathIcon className="h-4 w-4" /> : isPublished ? <EyeSlashIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />} </button>
         <Link href={editUrl} title="Projekt bearbeiten" aria-disabled={isDeleting || isToggling} onClick={(e) => { if (isDeleting || isToggling) e.preventDefault(); }} className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isDeleting || isToggling ? 'bg-slate-700 text-slate-500 cursor-not-allowed pointer-events-none' : 'bg-blue-600/20 text-blue-300 hover:bg-blue-500/30' }`}> <span className="sr-only">Bearbeiten</span> <PencilIcon className="h-4 w-4" /> </Link>
         <button onClick={() => onDeleteRequest(project)} disabled={isDeleting || isToggling} title="Projekt löschen" className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isDeleting ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : isToggling ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600/20 text-red-300 hover:bg-red-500/30' }`}> <span className="sr-only">Löschen</span> {isDeleting ? <ArrowPathIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />} </button>
      </div>
    </div>
  );
}

// --- CONFIRMATION MODAL COMPONENT ---
interface ConfirmationModalProps { isOpen: boolean; title: string; message: string; confirmText?: string; cancelText?: string; onConfirm: () => void; onCancel: () => void; isConfirming: boolean; }
function ConfirmationModal({ isOpen, title, message, confirmText = "Löschen", cancelText = "Abbrechen", onConfirm, onCancel, isConfirming }: ConfirmationModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full border border-slate-700">
        <div className="flex items-start">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-base font-semibold leading-6 text-white" id="modal-title">{title}</h3>
            <div className="mt-2"> <p className="text-sm text-slate-400">{message}</p> </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-x-3">
          <button type="button" disabled={isConfirming} className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:w-auto transition-colors ${ isConfirming ? 'bg-red-800 text-red-300 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700' }`} onClick={onConfirm} >
            {isConfirming ? ( <> <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 animate-spin" /> Wird gelöscht... </> ) : confirmText}
          </button>
          <button type="button" disabled={isConfirming} className="mt-3 inline-flex w-full justify-center rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-slate-600 hover:bg-slate-600 sm:mt-0 sm:w-auto disabled:opacity-50" onClick={onCancel} >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function ProjektePage() {
  // === State Variables ===
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // For general load errors
  const [togglingProjectId, setTogglingProjectId] = useState<string | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const router = useRouter();

  // === Fetch Data Function ===
  const fetchProjects = async (user: User) => { // Accept user as argument
    setLoading(true);
    setError(null); // Clear general error on fetch start

    console.log(`All Projects: Fetching projects for user ${user.id}...`);
    const { data, error: fetchError } = await supabase
      .from('projects')
      .select(`id, title, "project-date", image_url, status, created_at`)
      .eq('user_id', user.id) // *** FILTER BY USER ID ***
      .order('created_at', { ascending: false });

    console.log("All Projects - Supabase fetch response:", { data, fetchError });

    if (fetchError) {
      console.error('Error fetching projects:', fetchError);
      setError(`Projekte konnten nicht geladen werden: ${fetchError.message}`); // Set general error
      setProjects([]);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  // === Initial Data Fetch ===
  useEffect(() => {
    const getUserAndFetchData = async () => {
        setLoading(true); // Ensure loading is true initially
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
            console.error("Error fetching user:", userError);
            setError("Fehler beim Laden der Benutzerdaten.");
            setLoading(false); return;
        }
        if (!user) {
            router.push('/login'); // Redirect if not logged in
            return; // Stop execution
        }
        setCurrentUser(user); // Set user state
        await fetchProjects(user); // Pass user to fetch function
        // setLoading(false); // fetchProjects now sets loading to false
    };
    getUserAndFetchData();
  }, [router]); // Only depends on router

  // === Handle Status Toggle Function ===
  const handleStatusToggle = async (projectId: string, currentStatus: string | null) => {
    setTogglingProjectId(projectId);
    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';

    // Define the promise function
    const togglePromise = async () => {
        const { data, error } = await supabase
          .from('projects')
          .update({ status: newStatus })
          .eq('id', projectId)
          // Add user_id check for security if RLS isn't fully relied upon server-side
          // .eq('user_id', currentUser?.id)
          .select()
          .single();

        if (error) {
            console.error('Error updating status:', error);
            throw error; // Throw error for toast.promise
        }
        console.log("Status updated via toggle:", data);
        return { ...data, newStatus }; // Pass newStatus for UI update
    };

    await toast.promise(togglePromise(), { // Invoke the function here
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
  const handleDeleteRequest = (project: Project) => { setError(null); setDeletingProject(project); setShowDeleteConfirm(true); };

// === Handle Delete Confirmation (Actual Deletion) ===
  const handleConfirmDelete = async () => {
    if (!deletingProject || !currentUser) return;

    setIsConfirmingDelete(true);
    setTogglingProjectId(deletingProject.id); // Use toggling state for visual cue

    let imagePath: string | null = null;
    if (deletingProject.image_url) { 
        try { 
            const url = new URL(deletingProject.image_url); 
            // *** FIX 1: Changed slice(4) to slice(6) ***
            // The public URL path is /storage/v1/object/public/project-images/[user_id]/[file.png]
            // We need to extract the part *after* "project-images", which is at index 6.
            imagePath = url.pathname.split('/').slice(6).join('/'); 
            if (!imagePath) {
                console.warn("Could not parse a valid image path from URL:", deletingProject.image_url);
                // Don't throw, but log. Maybe the DB entry should still be deleted.
            }
        } catch (e) { 
            console.error("Could not parse image URL:", e); 
        } 
    }

    // Define the promise function for deletion
    const deletePromise = async () => {
        // 1. Delete Image
        if (imagePath) {
            console.log("Deleting image from storage:", imagePath);
            const { error: imageError } = await supabase.storage.from('project-images').remove([imagePath]);
            
            // *** FIX 2: Throw an error if image deletion fails ***
            // This stops the promise and prevents the UI from updating incorrectly.
            if (imageError) {
                console.error("Error deleting image:", imageError);
                toast.error(`Bild konnte nicht gelöscht werden: ${imageError.message}. Löschen abgebrochen.`);
                throw new Error(`Bild konnte nicht gelöscht werden: ${imageError.message}.`);
            } else {
                 console.log("Image deleted successfully.");
             }
        }

        // 2. Delete Project from DB (only runs if image delete succeeded)
        console.log("Deleting project from DB:", deletingProject.id);
        const { error: dbError } = await supabase
            .from('projects')
            .delete()
            .eq('id', deletingProject.id)
            .eq('user_id', currentUser.id); // Security check

        if (dbError) {
            console.error("Error deleting project from DB:", dbError);
            // This will be caught by toast.promise
            throw new Error(`Projekt konnte nicht gelöscht werden: ${dbError.message}`);
        }
        
        console.log("Project deleted from DB successfully.");
        return deletingProject.id; // Return ID for success handling
    };

    await toast.promise(deletePromise(), { 
        loading: `Projekt "${deletingProject.title || ''}" wird gelöscht...`,
        success: (deletedId) => {
            // This success block now only runs if BOTH image and DB delete were successful
            setProjects(currentProjects => currentProjects.filter(p => p.id !== deletedId));
            setShowDeleteConfirm(false);
            setDeletingProject(null);
            return 'Projekt erfolgreich gelöscht!';
        },
        error: (err: any) => {
            console.error('Deletion failed:', err);
            // The modal stays open and shows the error
            return `Löschen fehlgeschlagen: ${err.message}`;
        }
    });

    setIsConfirmingDelete(false);
    setTogglingProjectId(null); 
  };

  // === Handle Cancel Delete ===
  const handleCancelDelete = () => { setShowDeleteConfirm(false); setDeletingProject(null); setIsConfirmingDelete(false); setError(null); };


  // === Render Logic ===
  return (
    <main className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div> <h1 className="text-3xl font-bold text-white">Alle Projekte</h1> <p className="text-slate-400 mt-1">Verwalten Sie hier alle Ihre erstellten Projekte.</p> </div>
        <Link href="/dashboard/projekte/neu" className="inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"> <PlusIcon className="h-5 w-5" /> Neues Projekt </Link>
      </div>

      {/* Loading State */}
      {loading && ( <p className="text-slate-400 mt-6 text-center">Lade Projekte...</p> )}

      {/* General Error Display - Action errors handled by toast */}
      {error && !loading && ( <p className="text-red-500 mt-6 text-center">{error}</p> )}

      {/* Project List */}
      {!loading && (
        <div className="space-y-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                onStatusToggle={handleStatusToggle}
                onDeleteRequest={handleDeleteRequest}
                isToggling={togglingProjectId === project.id && !isConfirmingDelete}
                isDeleting={deletingProject?.id === project.id && isConfirmingDelete}
              />
            ))
          ) : (
            !error && <div className="text-center py-10"> <p className="text-slate-500">Sie haben noch keine Projekte erstellt.</p> <Link href="/dashboard/projekte/neu" className="mt-4 inline-block text-orange-500 hover:text-orange-400 font-semibold"> + Erstes Projekt hinzufügen </Link> </div>
          )}
        </div>
      )}

       {/* Confirmation Modal */}
       <ConfirmationModal
         isOpen={showDeleteConfirm}
         title="Projekt löschen"
         message={`Möchten Sie das Projekt "${deletingProject?.title || 'Dieses Projekt'}" wirklich unwiderruflich löschen? Das dazugehörige Bild wird ebenfalls entfernt.`}
         confirmText="Ja, löschen"
         cancelText="Abbrechen"
         onConfirm={handleConfirmDelete}
         onCancel={handleCancelDelete}
         isConfirming={isConfirmingDelete}
       />
    </main>
  );
}

