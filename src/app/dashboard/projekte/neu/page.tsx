// src/app/dashboard/projekte/neu/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import ProjectForm from '@/components/ProjectForm'; // <-- 1. IMPORT THE NEW FORM

export default function NewProjectPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // === Get Current User & Slug on Load ===
  useEffect(() => {
    const getUserAndProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht eingeloggt.");
        router.push('/login');
        return;
      }
      setCurrentUser(user);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('slug')
        .eq('id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
         console.error("Error fetching profile slug:", error);
         toast.error("Profil-Daten konnten nicht geladen werden.");
      } else if (profile && profile.slug) {
        setUserSlug(profile.slug);
      } else {
        console.warn("User has no slug. 'View Live' link will not work.");
        toast.error("Profil unvollständig. Bitte gehen Sie zu den Einstellungen und legen Sie einen URL-Pfad (Slug) fest.", { duration: 6000 });
      }
      setLoading(false);
    };
    getUserAndProfile();
  }, [router]);

  // === JSX Structure ===
  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Neues Projekt erstellen</h1>
        <p className="text-slate-400 mt-1">Geben Sie die Details ein, laden Sie ein Bild hoch und generieren Sie die Beschreibung.</p>
      </div>

      {loading ? (
        <p className="text-slate-400 mt-8 text-center">Lade Benutzerdaten...</p>
      ) : (
        // <-- 2. RENDER THE FORM COMPONENT -->
        <ProjectForm currentUser={currentUser} userSlug={userSlug} />
      )}
    </main>
  );
}