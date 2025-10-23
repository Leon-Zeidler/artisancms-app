"use client"; // Still a client component because it fetches data and uses state

// Import necessary React hooks and Supabase client
import React, { useState, useEffect } from 'react';
// Corrected import path using relative path from src/app/dashboard/page.tsx
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link'; // Keep standard import for Next.js modules

// --- TYPE DEFINITIONS ---
// Define the shape of a Project object coming from the database
type Project = {
  id: string; // Supabase uses UUIDs
  title: string | null; // Database fields can be null
  client?: string | null; // *** MADE OPTIONAL TO FIX ERROR *** We'll add this column later if needed
  'project-date': string | null; // *** MATCHES DATABASE *** Dates are strings initially
  image_url: string | null;
  status: 'Published' | 'Draft' | string | null; // Status can be null too
  created_at: string;
};

// Define props for our existing components
type ProjectCardProps = {
  project: Project; // Pass the whole project object
};

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
};

// --- ICON COMPONENTS ---
// (These are the same as before, so they are omitted for brevity)
const DocumentDuplicateIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /> </svg> );
const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /> </svg> );
const CheckBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> );

// --- UI COMPONENTS ---

function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  // (Same as before)
  return ( <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center"> <div> <p className="text-sm text-slate-400">{title}</p> <p className="text-3xl font-bold text-white">{value}</p> <p className="text-xs text-slate-500">{description}</p> </div> <div className="bg-slate-900 p-3 rounded-lg"> <Icon className="h-6 w-6 text-slate-400" /> </div> </div> );
}

// Updated ProjectCard to use the Project type
function ProjectCard({ project }: ProjectCardProps) {
  // *** MATCHES DATABASE *** Access the date using bracket notation because of the hyphen
  const displayDate = project['project-date']
    ? new Date(project['project-date']).toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'No date';

  // Use a default placeholder if image_url is null or empty
  const imageUrl = project.image_url || `https://placehold.co/600x400/334155/94a3b8?text=${encodeURIComponent(project.title || 'Project')}`;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden group">
      <div className="relative">
        {/* Use the imageUrl variable */}
        <img
          src={imageUrl}
          alt={project.title || 'Project image'}
          className="w-full h-48 object-cover"
          // Add basic error handling for images
          onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/ef4444/ffffff?text=Image+Error')}
         />
        <div className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full ${
            project.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
            {project.status === 'Published' ? 'Veröffentlicht' : 'Entwurf'}
        </div>
      </div>
      <div className="p-4">
        {/* Use project data, providing fallbacks for null values */}
        <h3 className="text-lg font-bold text-white truncate">{project.title || 'Untitled Project'}</h3>
        {/* Display client if available */}
        {project.client && <p className="text-sm text-slate-400 mt-1">{project.client}</p>}
        <p className="text-sm text-slate-400 mt-1">{displayDate}</p>
      </div>
    </div>
  );
}

// *** MODIFIED NewProjectCard ***
function NewProjectCard() {
  return (
    // Wrap the button in a Link component pointing to the new project page
    <Link href="/dashboard/projekte/neu" className="h-full">
      <button className="bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 hover:border-orange-600 transition-colors duration-300 w-full h-full min-h-[280px] flex flex-col items-center justify-center text-slate-400 hover:text-orange-500">
        <div className="bg-slate-700/50 rounded-full p-4 mb-4">
          <PlusIcon className="h-8 w-8"/>
        </div>
        <h3 className="text-lg font-bold">Neues Projekt</h3>
        <p className="text-sm">Klicken Sie hier zum Hinzufügen</p>
      </button>
    </Link>
  );
}
// *** END MODIFICATION ***

// --- MAIN PAGE COMPONENT ---

export default function DashboardPage() {
  // === State Variables ===
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null); // Added state for user

  // === Data Fetching with useEffect ===
  useEffect(() => {
    // Define an async function to fetch projects AND check user status
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // --- ADDED: Check if user is logged in ---
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current User:", user); // Log user status
      setCurrentUser(user); // Store user data in state

      if (!user) {
        setError("Please log in to view projects.");
        setLoading(false);
        setProjects([]); // Clear projects if not logged in
        return; // Stop fetching if no user
      }
      // --- End User Check ---


      // === Supabase Query ===
      console.log("Fetching projects from Supabase..."); // Log before query
      // *** MATCHES DATABASE *** Select the column using quotes because of the hyphen
      // Explicitly list all columns defined in the Project type
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          "project-date",
          image_url,
          status,
          created_at
        `) // Omit 'client' for now as it's not in the DB table yet
        .order('created_at', { ascending: false });

      // --- ADDED: Log the results ---
      console.log("Supabase fetch response:", { data, fetchError });

      if (fetchError) {
        console.error('Error fetching projects:', fetchError);
        setError(`Failed to load projects: ${fetchError.message}`); // Show specific error
      } else {
        console.log("Fetched projects data:", data); // Log the actual data
        // TypeScript should now be happy as 'client' is optional in the type
        setProjects(data || []);
      }
      setLoading(false);
    };

    fetchData(); // Call the function
  }, []); // The empty array ensures this runs only once on mount

  // === Calculate Stats ===
  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.status === 'Published').length;
  const draftProjects = totalProjects - publishedProjects;

  // === Render Logic ===
  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Übersicht</h1>
        <p className="text-slate-400 mt-1">Willkommen zurück. Hier ist Ihre aktuelle Projektübersicht.</p>
        {/* ADDED: Display user email if logged in for debugging */}
        {currentUser && <p className="text-xs text-slate-500 mt-1">Logged in as: {currentUser.email}</p>}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard title="Alle Projekte" value={totalProjects} description="Gesamt registriert" icon={DocumentDuplicateIcon} />
        <StatCard title="Entwürfe" value={draftProjects} description="Nicht veröffentlicht" icon={PencilSquareIcon} />
        <StatCard title="Veröffentlicht" value={publishedProjects} description="Öffentlich sichtbar" icon={CheckBadgeIcon} />
      </div>

      {/* Projects Grid */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white">Aktuelle Projekte</h2>

        {/* Loading State */}
        {loading && (
          <p className="text-slate-400 mt-6 text-center">Lade Projekte...</p>
        )}

        {/* Error State */}
        {error && (
           <p className="text-red-500 mt-6 text-center">{error}</p>
        )}

        {/* Success State (Data Loaded) */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            <NewProjectCard />
            {/* We now map over the 'projects' state variable */}
            {projects.length > 0 ? (
              projects.map((project) => (
                // Use project.id as the unique key for React
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
                // Show a message if there are no projects yet
               !loading && <p className="text-slate-500 md:col-span-3 lg:col-span-4 text-center mt-4">Noch keine Projekte hinzugefügt.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

