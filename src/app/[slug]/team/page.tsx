// src/app/[slug]/team/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useProfile } from '@/contexts/ProfileContext';

// --- TYPE DEFINITIONS ---
type TeamMember = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  avatar_url: string | null;
};
const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 00-3.741-.97m-3.741 0a9.094 9.094 0 00-3.741.97m7.482 0a9.094 9.094 0 01-3.741-.97m3.741 0c-.393.16-1.183.3-2.12.39m-3.741 0c-.937-.09-1.727-.23-2.12-.39m3.741 0a9.094 9.094 0 00-3.741-.97m0 0c-2.062 0-3.8-1.34-4.24-3.235a9.094 9.094 0 010-3.135 4.238 4.238 0 014.24-3.235m0 0c2.063 0 3.8 1.34 4.24 3.235m0 0a9.094 9.094 0 010 3.135m-4.24 0c-.44 1.895-2.177 3.235-4.24 3.235m12.731 0a9.094 9.094 0 00-3.741-.97m3.741 0c.393.16 1.183.3 2.12.39m3.741 0c.937-.09 1.727-.23 2.12-.39m-3.741 0a9.094 9.094 0 013.741-.97m0 0c2.063 0 3.8-1.34 4.24-3.235a9.094 9.094 0 000-3.135 4.238 4.238 0 00-4.24-3.235m0 0c-2.062 0-3.8 1.34-4.24 3.235m0 0a9.094 9.094 0 000 3.135m4.24 0c.44 1.895 2.177 3.235 4.24 3.235z" /> </svg> );


// --- MAIN TEAM PAGE COMPONENT ---
export default function ClientTeamPage() {
  // === State Variables ===
  const supabase = useMemo(() => createSupabaseClient(), []);
  const profile = useProfile(); // <-- GET PROFILE FROM CONTEXT
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Data Fetching ===
  useEffect(() => {
    if (!profile) return notFound();

    const fetchTeamData = async () => {
      setLoading(true); setError(null); setTeamMembers([]);
      
      try {
        const { data, error: fetchError } = await supabase
          .from('team_members')
          .select('id, name, role, bio, avatar_url') 
          .eq('profile_id', profile.id) // <-- Use profile.id from context
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: true });

        if (fetchError) {
          setError(`Team-Mitglieder konnten nicht geladen werden: ${fetchError.message}`);
        } else {
          setTeamMembers(data || []);
        }

      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.';
        setError(message);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [profile, supabase]); 

  // === Render Logic ===
  if (loading) { return <div className="min-h-screen flex items-center justify-center">Lade Team...</div>; }
  
  // Layout (Navbar, Footer, CSS vars) is handled by layout.tsx
  return (
    <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Header */}
            <div className="mx-auto max-w-2xl lg:mx-0">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Unser Team</h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                    Lernen Sie die Menschen kennen, die hinter unserer Arbeit stehen.
                </p>
            </div>

            {error && <p className="text-red-600 mt-16 text-center">{error}</p>}

            {!error && (
                <ul
                    role="list"
                    className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
                >
                    {teamMembers.length > 0 ? (
                        teamMembers.map((person) => (
                            <li key={person.id} className="flex flex-col gap-6">
                                {person.avatar_url ? (
                                    <Image
                                      className="aspect-[3/2] w-full rounded-2xl object-cover"
                                      src={person.avatar_url}
                                      alt={`Portrait von ${person.name}`}
                                      width={480}
                                      height={320}
                                      unoptimized
                                    />
                                ) : (
                                    <div className="aspect-[3/2] w-full rounded-2xl bg-slate-100 flex items-center justify-center">
                                        <UserGroupIcon className="h-24 w-24 text-slate-400" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-lg font-semibold leading-8 tracking-tight text-gray-900">{person.name}</h3>
                                    {person.role && <p className="text-base leading-7 text-gray-600">{person.role}</p>}
                                    {person.bio && <p className="text-sm leading-6 text-gray-500 mt-2">{person.bio}</p>}
                                </div>
                            </li>
                        ))
                    ) : (
                         <p className="text-slate-500 lg:col-span-3 text-center mt-4">
                            Dieses Unternehmen hat noch keine Team-Mitglieder hinzugefügt.
                         </p>
                    )}
                </ul>
            )}
             {/* Link back to homepage */}
             <div className="mt-24 text-center">
                <Link 
                  href={`/${profile.slug}`} 
                  className="text-sm font-semibold leading-6 text-brand hover:text-brand-dark transition-colors"
                >
                    <span aria-hidden="true">←</span> Zurück zur Startseite
                </Link>
            </div>
        </div>
    </div>
  );
}