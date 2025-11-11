// src/app/dashboard/projekte/neu/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import ProjectForm from '@/components/ProjectForm';
import { DashboardHero } from '@/components/dashboard/DashboardHero';

export default function NewProjectPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUserAndProfile = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Nicht eingeloggt.');
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
        console.error('Error fetching profile slug:', error);
        toast.error('Profil-Daten konnten nicht geladen werden.');
      } else if (profile?.slug) {
        setUserSlug(profile.slug);
      } else {
        console.warn("User has no slug. 'View Live' link will not work.");
        toast.error(
          'Profil unvollständig. Bitte gehen Sie zu den Einstellungen und legen Sie einen URL-Pfad (Slug) fest.',
          { duration: 6000 },
        );
      }

      setLoading(false);
    };

    getUserAndProfile();
  }, [router, supabase]);

  const overviewHref = '/dashboard/projekte';

  let content: React.ReactNode = null;
  if (loading) {
    content = (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm shadow-orange-100">
        Lade Benutzerdaten...
      </div>
    );
  } else if (currentUser) {
    content = (
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-orange-100/40">
        <ProjectForm currentUser={currentUser} userSlug={userSlug} initialData={null} />
      </div>
    );
  } else {
    content = (
      <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center text-amber-600 shadow-sm shadow-amber-100">
        Benutzerdaten konnten nicht geladen werden.
      </div>
    );
  }

  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      <DashboardHero
        eyebrow="Projekte"
        title="Neues Projekt erstellen"
        subtitle="Geben Sie die Details ein, laden Sie Bilder hoch und lassen Sie unsere KI eine Beschreibung verfassen."
        actions={[
          {
            label: 'Zurück zur Übersicht',
            href: overviewHref,
            variant: 'secondary',
          },
        ]}
      />

      <div className="mx-auto max-w-5xl">{content}</div>
    </main>
  );
}