// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createSupabaseClient } from '../../lib/supabaseClient';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import PlusIcon from '@/components/icons/PlusIcon';

// --- TYPE DEFINITIONS (FIXED) ---
type Project = {
  id: string;
  title: string | null;
  'project-date': string | null;
  after_image_url: string | null; // <-- Corrected name
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
};
type StatCardProps = { title: string; value: string | number; description: string; icon: React.ElementType; };
type ProjectCardProps = { project: Project; };

// --- ICON COMPONENTS ---
const DocumentDuplicateIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" > <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /> </svg> );
const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /> </svg> );
const CheckBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /> </svg> );

// --- UI COMPONENTS ---
function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  return ( <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex justify-between items-center"> <div> <p className="text-sm text-slate-400">{title}</p> <p className="text-3xl font-bold text-white">{value}</p> <p className="text-xs text-slate-500">{description}</p> </div> <div className="bg-slate-900 p-3 rounded-lg"> <Icon className="h-6 w-6 text-slate-400" /> </div> </div> );
}

function ProjectCard({ project }: ProjectCardProps) {
  const displayDate = project['project-date'] ? new Date(project['project-date']).toLocaleDateString('de-DE', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No date';
  // --- (FIXED) ---
  const imageUrl = project.after_image_url || `https://placehold.co/600x400/334155/94a3b8?text=${encodeURIComponent(project.title || 'Project')}`;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden group">
      <div className="relative">
        <img src={imageUrl} alt={project.title || 'Project image'} className="w-full h-48 object-cover" onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/600x400/ef4444/ffffff?text=Image+Error')} />
        <div className={`absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full ${ project.status === 'Published' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400' }`}>
            {project.status === 'Published' ? 'Veröffentlicht' : 'Entwurf'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-white truncate">{project.title || 'Untitled Project'}</h3>
        <p className="text-sm text-slate-400 mt-1">{displayDate}</p>
      </div>
    </div>
  );
}

function NewProjectCard() {
  return (
    <Link href="/dashboard/projekte/neu" className="h-full">
      <button className="bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 hover:border-orange-600 transition-colors duration-300 w-full h-full min-h-[280px] flex flex-col items-center justify-center text-slate-400 hover:text-orange-500">
        <div className="bg-slate-700/50 rounded-full p-4 mb-4"> <PlusIcon className="h-8 w-8"/> </div>
        <h3 className="text-lg font-bold">Neues Projekt</h3>
        <p className="text-sm">Klicken Sie hier zum Hinzufügen</p>
      </button>
    </Link>
  );
}

// --- NEW "First 5 Minutes" Component (Fix #2) ---
const WelcomeGuide = () => {
  const actions = [
    { name: '1. Projekt erstellen', description: 'Beginnen Sie mit Ihrem ersten Projekt.', href: '/dashboard/projekte/neu' },
    { name: '2. Team einrichten', description: 'Stellen Sie Ihr Team vor.', href: '/dashboard/team' },
    { name: '3. Einstellungen prüfen', description: 'Impressum, Datenschutz & Logo eintragen.', href: '/dashboard/einstellungen' },
  ];
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 divide-y divide-slate-700">
      <div className="px-6 py-5">
        <h2 className="text-lg font-semibold text-white">Willkommen bei ArtisanCMS!</h2>
        <p className="text-sm text-slate-400 mt-1">Hier sind ein paar empfohlene nächste Schritte, um Ihre Webseite startklar zu machen.</p>
      </div>
      <div className="flow-root">
        <ul role="list" className="divide-y divide-slate-700">
          {actions.map((action, actionIdx) => (
            <li key={actionIdx} className="relative flex items-center space-x-4 px-6 py-4 transition-colors hover:bg-slate-700/50">
              <div className="min-w-0 flex-auto">
                <div className="flex items-center gap-x-3">
                  <h3 className="text-sm font-semibold text-white">{action.name}</h3>
                </div>
                <p className="text-sm text-slate-400">{action.description}</p>
              </div>
              <Link href={action.href} className="flex-none rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-700 hover:bg-slate-600">
                Starten <span aria-hidden="true">&rarr;</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};


// --- MAIN PAGE COMPONENT ---
export default function DashboardPage() {
  const supabase = useMemo(() => createSupabaseClient(), []); // <-- SUPABASE FIX
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
          console.error("Error fetching user:", userError);
          setError("Fehler beim Laden der Benutzerdaten.");
          setLoading(false);
          setProjects([]);
          return;
      }
      if (!user) {
        setError("Bitte einloggen.");
        setLoading(false);
        setProjects([]);
        return;
      }
      setCurrentUser(user);

      // --- (FIXED) ---
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`id, title, "project-date", after_image_url, status, created_at`) // <-- Corrected column
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching projects:', fetchError);
        setError(`Projekte konnten nicht geladen werden: ${fetchError.message}`);
        setProjects([]);
      } else {
        setProjects(data || []);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase]); // <-- SUPABASE FIX

  const totalProjects = projects.length;
  const publishedProjects = projects.filter(p => p.status === 'Published').length;
  const draftProjects = totalProjects - publishedProjects;

  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Übersicht</h1>
        <p className="text-slate-400 mt-1">Willkommen zurück. Hier ist Ihre aktuelle Projektübersicht.</p>
        {currentUser && <p className="text-xs text-slate-500 mt-1">Angemeldet als: {currentUser.email}</p>}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard title="Alle Projekte" value={totalProjects} description="Gesamt erstellt" icon={DocumentDuplicateIcon} />
        <StatCard title="Entwürfe" value={draftProjects} description="Nicht veröffentlicht" icon={PencilSquareIcon} />
        <StatCard title="Veröffentlicht" value={publishedProjects} description="Öffentlich sichtbar" icon={CheckBadgeIcon} />
      </div>

      {/* Projects Grid OR Welcome Guide */}
      <div className="mt-12">
        {loading && ( <p className="text-slate-400 mt-6 text-center">Lade Projekte...</p> )}
        {error && ( <p className="text-red-500 mt-6 text-center">{error}</p> )}

        {!loading && !error && (
          <>
            {/* --- RENDER "Fix #2" WELCOME GUIDE --- */}
            {projects.length === 0 ? (
              <WelcomeGuide />
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white">Aktuelle Projekte</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                  <NewProjectCard />
                  {projects.slice(0, 3).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                  {projects.length > 3 && (
                    <div className="flex items-center justify-center md:col-span-2 lg:col-span-3 xl:col-span-4 mt-4">
                        <Link href="/dashboard/projekte" className="text-orange-500 hover:text-orange-400 font-semibold text-sm">
                            Alle Projekte anzeigen →
                        </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}