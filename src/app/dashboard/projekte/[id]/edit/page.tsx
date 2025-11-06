"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import ProjectForm, { type Project } from '@/components/ProjectForm';

export default function EditProjectPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const getUserAndProject = async () => {
      setLoading(true); setGeneralError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht eingeloggt."); router.push('/login'); return;
      }
      setCurrentUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('slug')
        .eq('id', user.id)
        .single();
      setUserSlug(profile?.slug || null);

      if (!projectId) {
         setGeneralError("Projekt-ID fehlt."); setLoading(false); return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*, gallery_images')
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Projekt nicht gefunden oder Zugriff verweigert.");

        setProject(data as Project);

      } catch (err: any) {
        console.error("Error fetching project:", err);
        setGeneralError(`Fehler beim Laden des Projekts: ${err.message}`);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    getUserAndProject();
  }, [projectId, router, supabase]);

  if (loading) { return <div className="p-8 text-center text-slate-400">Lade Projekt...</div>; }
  if (generalError) { return <div className="p-8 text-center text-red-500">{generalError}</div>; }
  if (!project || !currentUser) { 
     return <div className="p-8 text-center text-slate-400">Projekt oder Benutzer nicht gefunden.</div>; 
  } 

  return (
    <main className="p-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Projekt bearbeiten</h1>
        <p className="text-slate-400 mt-1">Aktualisieren Sie die Details Ihres Projekts.</p>
      </div>
      <ProjectForm 
        currentUser={currentUser} 
        userSlug={userSlug} 
        initialData={project} 
      />
    </main>
  );
}