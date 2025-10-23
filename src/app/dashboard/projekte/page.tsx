// Mark as client component for interactivity and data fetching
"use client";

// Import necessary hooks and components
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // For the "New Project" button
// Use relative path to ensure resolution
import { supabase } from '../../../lib/supabaseClient'; 

// --- TYPE DEFINITIONS ---
// Define the shape of a Project object (same as dashboard page)
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

// --- ICON COMPONENTS ---
// Add PlusIcon for the button
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> );
// *** NEW *** Icons for Publish/Unpublish
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const EyeSlashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );


// --- PROJECT LIST ITEM COMPONENT ---
// *** UPDATED *** Added props for handling status toggle
interface ProjectListItemProps {
  project: Project;
  onStatusToggle: (projectId: string, currentStatus: string | null) => void; // Function to call when button clicked
  isToggling: boolean; // Is this specific item currently being updated?
}

function ProjectListItem({ project, onStatusToggle, isToggling }: ProjectListItemProps) {
  const displayDate = project['project-date']
    ? new Date(project['project-date']).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : 'N/A';
  const imageUrl = project.image_url || `https://placehold.co/48x48/334155/94a3b8?text=${encodeURIComponent(project.title?.charAt(0) || 'P')}`;
  const isPublished = project.status === 'Published';

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center space-x-4 flex-1 min-w-0"> {/* Allow shrinking */}
        <img
          src={imageUrl}
          alt={project.title || 'Project image'}
          className="w-12 h-12 rounded-md object-cover flex-shrink-0"
          onError={(e) => (e.currentTarget.src = 'https://placehold.co/48x48/ef4444/ffffff?text=Err')}
        />
        <div className="min-w-0"> {/* Prevent text overflow */}
          <p className="font-semibold text-white truncate">{project.title || 'Untitled Project'}</p>
          <p className="text-sm text-slate-400">Erstellt: {new Date(project.created_at).toLocaleDateString('de-DE')}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-sm flex-shrink-0 ml-4"> {/* Prevent shrinking, add margin */}
         {/* Status Tag */}
         <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            isPublished ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
         }`}>
           {project.status || 'N/A'}
         </span>
         {/* Date */}
         <span className="text-slate-400 hidden sm:inline">{displayDate}</span>
         {/* Publish/Unpublish Button */}
         <button
            onClick={() => onStatusToggle(project.id, project.status)}
            disabled={isToggling} // Disable while this specific item is updating
            className={`inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              isToggling
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : isPublished
                ? 'bg-yellow-600/50 text-yellow-300 hover:bg-yellow-500/50'
                : 'bg-green-600/50 text-green-300 hover:bg-green-500/50'
            }`}
          >
            {isToggling ? (
              <ArrowPathIcon />
            ) : isPublished ? (
              <EyeSlashIcon className="h-4 w-4" />
            ) : (
              <CheckCircleIcon className="h-4 w-4" />
            )}
            {isToggling ? 'Wird geändert...' : isPublished ? 'Verbergen' : 'Veröffentlichen'}
         </button>
         {/* Placeholder for Edit/Delete buttons */}
         {/* <button className="text-slate-500 hover:text-white">...</button> */}
      </div>
    </div>
  );
}


// --- MAIN PAGE COMPONENT ---
export default function ProjektePage() {
  // === State Variables ===
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingProjectId, setTogglingProjectId] = useState<string | null>(null); // Track which project is currently updating

  // === Fetch Data Function ===
  // Extracted fetch logic into its own function for re-use
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Bitte einloggen, um Projekte zu sehen.");
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('projects')
      .select(`id, title, "project-date", image_url, status, created_at`)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching projects:', fetchError);
      setError(`Projekte konnten nicht geladen werden: ${fetchError.message}`);
      setProjects([]); // Clear projects on error
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  // === Initial Data Fetch ===
  useEffect(() => {
    fetchProjects();
  }, []); // Run only once on mount

  // === Handle Status Toggle Function ===
  // This function is passed down to each ProjectListItem
  const handleStatusToggle = async (projectId: string, currentStatus: string | null) => {
    setTogglingProjectId(projectId); // Set loading state for the specific item
    setError(null);

    const newStatus = currentStatus === 'Published' ? 'Draft' : 'Published';
    console.log(`Toggling project ${projectId} to ${newStatus}`);

    const { data, error: updateError } = await supabase
      .from('projects')
      .update({ status: newStatus }) // The data to update
      .eq('id', projectId) // Which row to update
      .select() // Optionally return the updated row
      .single(); // Expecting only one row back

     if (updateError) {
        console.error('Error updating status:', updateError);
        setError(`Status konnte nicht geändert werden: ${updateError.message}`);
     } else {
        console.log("Status updated:", data);
        // Refresh the list to show the change
        // Option 1: Refetch all projects
        // await fetchProjects(); 
        // Option 2: Update the state directly (more efficient)
        setProjects(currentProjects => 
            currentProjects.map(p => 
                p.id === projectId ? { ...p, status: newStatus } : p
            )
        );
     }
     setTogglingProjectId(null); // Clear loading state for the specific item
  };


  // === Render Logic ===
  return (
    <main className="p-8">
      {/* Header with New Project Button */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Alle Projekte</h1>
          <p className="text-slate-400 mt-1">Verwalten Sie hier alle Ihre erstellten Projekte.</p>
        </div>
        <Link
          href="/dashboard/projekte/neu"
          className="inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          <PlusIcon className="h-5 w-5" />
          Neues Projekt
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <p className="text-slate-400 mt-6 text-center">Lade Projekte...</p>
      )}

      {/* Error State */}
      {error && !loading && ( // Show general errors only when not loading
         <p className="text-red-500 mt-6 text-center">{error}</p>
      )}

      {/* Project List */}
      {!loading && ( // Render list container even if error occurred, error shown above
        <div className="space-y-4">
          {projects.length > 0 ? (
            projects.map((project) => (
              <ProjectListItem 
                key={project.id} 
                project={project}
                onStatusToggle={handleStatusToggle} // Pass the handler function
                isToggling={togglingProjectId === project.id} // Pass loading state for this item
              />
            ))
          ) : (
            // Show only if no error and no projects
            !error && <div className="text-center py-10">
              <p className="text-slate-500">Sie haben noch keine Projekte erstellt.</p>
              <Link href="/dashboard/projekte/neu" className="mt-4 inline-block text-orange-500 hover:text-orange-400 font-semibold">
                + Erstes Projekt hinzufügen
              </Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

