// src/app/dashboard/einstellungen/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast'; // Import toast

// --- Icons ---
const ArrowRightStartOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /> </svg> );
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> </svg> );
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );


type ProfileData = { business_name: string; address: string; phone: string; services_description: string; about_text: string;};
type AIGenerationType = 'services' | 'about';

export default function EinstellungenPage() {
  // === State Variables ===
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({ business_name: '', address: '', phone: '', services_description: '', about_text: '', });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<AIGenerationType | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const router = useRouter();

  // === Get Current User & Profile Data on Load ===
  useEffect(() => {
    let isMounted = true; const fetchData = async () => { setLoading(true); setGeneralError(null); const { data: { user }, error: userError } = await supabase.auth.getUser(); if (!isMounted || userError || !user) { if (isMounted) router.push('/login'); return; } if (isMounted) setCurrentUser(user); console.log("Fetching profile data for settings..."); const { data: profile, error: profileError } = await supabase .from('profiles').select('business_name, address, phone, services_description, about_text').eq('id', user.id).single(); console.log("Profile fetch result:", { profile, profileError }); if (isMounted) { if (profileError && profileError.code !== 'PGRST116') { setGeneralError("Profildaten konnten nicht geladen werden."); } else if (profile) { setProfileData({ business_name: profile.business_name || '', address: profile.address || '', phone: profile.phone || '', services_description: profile.services_description || '', about_text: profile.about_text || '', }); } setLoading(false); } }; fetchData(); return () => { isMounted = false };
  }, [router]);

  // === Handle Input Changes ===
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProfileData(prev => ({ ...prev, [name]: value }));
  };

  // Handle AI Text Generation
  const handleGenerateProfileText = async (type: AIGenerationType) => {
      const context = profileData.business_name || 'Handwerksbetrieb';
      if (!context) {
          toast.error("Bitte geben Sie zuerst den Namen des Betriebs ein.");
          return;
      }
      setAiLoading(type);

      await toast.promise(
         fetch('/api/generate-profile-text', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ context: context, type: type }),
          }).then(async (response) => {
              if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(errorData.error || `Failed to generate ${type} text`);
              }
              return response.json();
          }),
          {
              loading: `${type === 'services' ? 'Leistungsbeschreibung' : '"Über uns" Text'} wird generiert...`,
              success: (data) => {
                  if (type === 'services') {
                      setProfileData(prev => ({ ...prev, services_description: data.text }));
                  } else if (type === 'about') {
                      setProfileData(prev => ({ ...prev, about_text: data.text }));
                  }
                  return `${type === 'services' ? 'Leistungsbeschreibung' : '"Über uns" Text'} erfolgreich generiert!`;
              },
              error: (err) => {
                  console.error(`Error calling ${type} generation API:`, err);
                  return `Fehler bei der Textgenerierung: ${err.message}`;
              }
          }
      );
      setAiLoading(null);
  };


  // === Handle Form Submission (Save Profile) ===
  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) {
      toast.error("Benutzer nicht gefunden.");
      return;
    }
    setSaving(true);

    const profileUpdates = {
          business_name: profileData.business_name, address: profileData.address, phone: profileData.phone,
          services_description: profileData.services_description, about_text: profileData.about_text,
          updated_at: new Date().toISOString(),
    };

    // *** REVISED toast.promise structure ***
    await toast.promise(
        // Pass an async function directly
        async () => {
            const { data, error } = await supabase
              .from('profiles')
              .update(profileUpdates)
              .eq('id', currentUser.id)
              .select()
              .single(); // Using single() ensures it throws if 0 or >1 rows match

            // Check for Supabase-specific errors after await
            if (error) {
                console.error("Supabase Error saving profile:", error);
                throw error; // Let toast.promise handle the error display
            }
            console.log("Supabase Success saving profile:", data);
            return data; // Return data on success
        },
        // Options object remains the same
        {
          loading: 'Profil wird gespeichert...',
          success: 'Profil erfolgreich gespeichert!',
          error: (err: any) => `Fehler beim Speichern: ${err?.message || 'Unbekannter Fehler'}`,
        }
    );

     setSaving(false);
  };


  // === Handle Logout Function ===
  const handleLogout = async () => {
    setLogoutLoading(true);
    await toast.promise(
        supabase.auth.signOut(),
        {
            loading: 'Abmelden...',
            success: () => {
                console.log("Logout successful");
                router.push('/');
                router.refresh();
                return 'Erfolgreich abgemeldet.';
            },
            error: (err) => {
                console.error("Logout error:", err);
                setLogoutLoading(false);
                return `Abmeldung fehlgeschlagen: ${err.message}`;
            },
        }
    );
     // Optional: setLogoutLoading(false);
  };


  // === Render Logic ===
  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Einstellungen</h1>
        <p className="text-slate-400 mt-1">Verwalten Sie hier Ihr Unternehmensprofil und Konto.</p>
      </div>

      {/* Loading State */}
      {loading && ( <p className="text-slate-400 mt-8 text-center">Lade Profildaten...</p> )}

      {/* General Error State */}
      {generalError && !loading && (
         <p className="text-red-500 mt-8 text-center">{generalError}</p>
      )}

      {/* Settings Content */}
      {!loading && currentUser && (
        <form onSubmit={handleSaveProfile} className="mt-8 max-w-2xl space-y-8 divide-y divide-slate-700">

           {/* Profile Information Section */}
           <section className="pt-8 first:pt-0">
              <h2 className="text-xl font-semibold text-white mb-6">Unternehmensprofil</h2>
              <div className="space-y-6">
                {/* Inputs */}
                <div>
                    <label htmlFor="business_name" className="mb-2 block text-sm font-medium text-slate-300"> Name des Betriebs * </label>
                    <input type="text" id="business_name" name="business_name" value={profileData.business_name} onChange={handleInputChange} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"/>
                </div>
                <div>
                    <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-300"> Adresse * </label>
                    <textarea id="address" name="address" value={profileData.address} onChange={handleInputChange} rows={3} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"/>
                </div>
                <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-300"> Telefonnummer * </label>
                    <input type="tel" id="phone" name="phone" value={profileData.phone} onChange={handleInputChange} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"/>
                </div>
                <div>
                    <label htmlFor="services_description" className="mb-2 block text-sm font-medium text-slate-300"> Kurze Beschreibung Ihrer Leistungen * </label>
                    <div className="relative">
                        <textarea id="services_description" name="services_description" value={profileData.services_description} onChange={handleInputChange} rows={4} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28"/>
                         <button type="button" onClick={() => handleGenerateProfileText('services')} disabled={aiLoading === 'services' || !profileData.business_name} className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${ aiLoading === 'services' || !profileData.business_name ? 'bg-slate-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} >
                           <SparklesIcon className={`h-4 w-4 ${aiLoading === 'services' ? 'animate-spin' : ''}`} />
                           {aiLoading === 'services' ? 'Generiere...' : 'Generieren'}
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Tipp: Jede Leistung in eine neue Zeile (z.B. "Service A: Beschreibung A").</p>
                </div>
                <div>
                    <label htmlFor="about_text" className="mb-2 block text-sm font-medium text-slate-300"> Über Ihren Betrieb * </label>
                     <div className="relative">
                        <textarea id="about_text" name="about_text" value={profileData.about_text} onChange={handleInputChange} rows={5} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28"/>
                         <button type="button" onClick={() => handleGenerateProfileText('about')} disabled={aiLoading === 'about' || !profileData.business_name} className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${ aiLoading === 'about' || !profileData.business_name ? 'bg-slate-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} >
                           <SparklesIcon className={`h-4 w-4 ${aiLoading === 'about' ? 'animate-spin' : ''}`} />
                           {aiLoading === 'about' ? 'Generiere...' : 'Generieren'}
                        </button>
                    </div>
                </div>

                 {/* Save Button */}
                <div className="flex items-center justify-end gap-4 pt-2">
                    <button type="submit" disabled={saving || !!aiLoading} className={`inline-flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${ saving || !!aiLoading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} >
                        {saving ? 'Wird gespeichert...' : 'Profil speichern'}
                         {!saving && <CheckIcon className="h-4 w-4" />}
                    </button>
                </div>
              </div>
           </section>

           {/* Account Section */}
           <section className="pt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Konto</h2>
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700"> <dl className="space-y-2"> <div className="flex justify-between"> <dt className="text-sm font-medium text-slate-400">Email</dt> <dd className="text-sm text-white">{currentUser.email}</dd> </div> <div className="flex justify-between"> <dt className="text-sm font-medium text-slate-400">Benutzer-ID</dt> <dd className="text-xs text-slate-500">{currentUser.id}</dd> </div> </dl> </div>
           </section>

           {/* Subscription Section */}
            <section className="pt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Abonnement</h2>
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700"> <p className="text-sm text-slate-400">Aktueller Plan: <span className="text-white font-medium">Free / Pro (Platzhalter)</span></p> <p className="mt-4 text-xs text-slate-500">Die Abonnementverwaltung wird in Kürze verfügbar sein.</p> </div>
            </section>

           {/* Logout Button */}
           <section className="border-t border-slate-700 pt-8 mt-8">
               <button type="button" onClick={handleLogout} disabled={logoutLoading} className={`inline-flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${ logoutLoading ? 'bg-red-800 cursor-not-allowed' : 'bg-red-700 hover:bg-red-600' }`} >
                 <ArrowRightStartOnRectangleIcon className={`h-5 w-5 ${logoutLoading ? 'animate-spin' : ''}`} />
                 {logoutLoading ? 'Abmelden...' : 'Abmelden'}
               </button>
           </section>
        </form>
      )}
    </main>
  );
}
