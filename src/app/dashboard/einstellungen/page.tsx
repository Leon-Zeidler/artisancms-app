// Mark as client component for interactivity
"use client";

// Import necessary hooks and components
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Standard Next.js import
import Link from 'next/link'; // Standard Next.js import
// Corrected import path using relative path from src/app/dashboard/einstellungen/page.tsx
import { supabase } from '../../../lib/supabaseClient'; 
import { User } from '@supabase/supabase-js'; // User type

// --- Icon for Logout Button ---
const ArrowRightStartOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
);
// --- Icon for Save Button ---
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);
// --- Icon for AI Button --- 
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" />
    </svg>
);


// Define the structure of the profile data
type ProfileData = {
  business_name: string;
  address: string;
  phone: string;
  services_description: string;
  about_text: string;
};

// Define types for AI generation context
type AIGenerationType = 'services' | 'about';

export default function EinstellungenPage() {
  // === State Variables ===
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
      business_name: '', address: '', phone: '', services_description: '', about_text: '',
  });
  const [loading, setLoading] = useState(true); // Initial page load
  const [saving, setSaving] = useState(false); // Saving state for the form
  const [aiLoading, setAiLoading] = useState<AIGenerationType | null>(null); // Track which AI is loading
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const router = useRouter();

  // === Get Current User & Profile Data on Load ===
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true); setError(null);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!isMounted || userError || !user) { if (isMounted) router.push('/login'); return; }
      if (isMounted) setCurrentUser(user);

      console.log("Fetching profile data for settings...");
      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('business_name, address, phone, services_description, about_text').eq('id', user.id).single();
      console.log("Profile fetch result:", { profile, profileError });

      if (isMounted) {
          if (profileError && profileError.code !== 'PGRST116') { setError("Profildaten konnten nicht geladen werden."); }
          else if (profile) {
            setProfileData({
                business_name: profile.business_name || '', address: profile.address || '', phone: profile.phone || '',
                services_description: profile.services_description || '', about_text: profile.about_text || '',
            });
          }
           setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false };
  }, [router]);

  // === Handle Input Changes ===
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProfileData(prev => ({ ...prev, [name]: value }));
      setSuccessMessage(null); setError(null);
  };

  // Handle AI Text Generation
  const handleGenerateProfileText = async (type: AIGenerationType) => {
      const context = profileData.business_name || 'Handwerksbetrieb'; 
      if (!context) {
          setError("Bitte geben Sie zuerst den Namen des Betriebs ein.");
          return;
      }
      setAiLoading(type); 
      setError(null);
      setSuccessMessage(null);

      try {
          const response = await fetch('/api/generate-profile-text', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ context: context, type: type }), 
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Failed to generate ${type} text`);
          }

          const data = await response.json();
          if (type === 'services') {
              setProfileData(prev => ({ ...prev, services_description: data.text }));
          } else if (type === 'about') {
              setProfileData(prev => ({ ...prev, about_text: data.text }));
          }
          setSuccessMessage(`${type === 'services' ? 'Leistungsbeschreibung' : '"Über uns" Text'} erfolgreich generiert!`);

      } catch (err) {
          console.error(`Error calling ${type} generation API:`, err);
          const message = err instanceof Error ? err.message : "An unknown error occurred";
          setError(`Fehler bei der Textgenerierung: ${message}`);
      } finally {
          setAiLoading(null); // Clear loading state
      }
  };


  // === Handle Form Submission (Save Profile) ===
  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) { setError("Benutzer nicht gefunden."); return; }
    setSaving(true); setError(null); setSuccessMessage(null);
    console.log("Saving profile data:", profileData);

    const { data, error: updateError } = await supabase
      .from('profiles').update({
          business_name: profileData.business_name, address: profileData.address, phone: profileData.phone,
          services_description: profileData.services_description, about_text: profileData.about_text,
          updated_at: new Date().toISOString(),
      }).eq('id', currentUser.id).select().single();

     setSaving(false);
     if (updateError) { setError(`Fehler beim Speichern: ${updateError.message}`); }
     else { setSuccessMessage("Profil erfolgreich gespeichert!"); }
  };


  // === Handle Logout Function ===
  const handleLogout = async () => {
    setLogoutLoading(true); setError(null); console.log("Attempting logout...");
    const { error: signOutError } = await supabase.auth.signOut();
    setLogoutLoading(false);
    if (signOutError) { setError(`Abmeldung fehlgeschlagen: ${signOutError.message}`); }
    else { console.log("Logout successful"); router.push('/'); router.refresh(); }
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

      {/* General Error State (excluding save/logout errors handled inline) */}
      {error && !loading && !error.startsWith("Fehler beim Speichern") && !error.startsWith("Abmeldung fehlgeschlagen") && (
         <p className="text-red-500 mt-8 text-center">{error}</p>
      )}

      {/* Settings Content */}
      {!loading && currentUser && (
        <form onSubmit={handleSaveProfile} className="mt-8 max-w-2xl space-y-8 divide-y divide-slate-700">

           {/* Profile Information Section */}
           <section className="pt-8 first:pt-0">
              <h2 className="text-xl font-semibold text-white mb-6">Unternehmensprofil</h2>
              <div className="space-y-6">
                {/* Business Name */}
                <div>
                    <label htmlFor="business_name" className="mb-2 block text-sm font-medium text-slate-300"> Name des Betriebs * </label>
                    <input type="text" id="business_name" name="business_name" value={profileData.business_name} onChange={handleInputChange} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"/>
                </div>
                {/* Address */}
                <div>
                    <label htmlFor="address" className="mb-2 block text-sm font-medium text-slate-300"> Adresse * </label>
                    <textarea id="address" name="address" value={profileData.address} onChange={handleInputChange} rows={3} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"/>
                </div>
                {/* Phone */}
                <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-300"> Telefonnummer * </label>
                    <input type="tel" id="phone" name="phone" value={profileData.phone} onChange={handleInputChange} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"/>
                </div>

                {/* Services Description with AI Button */} 
                <div>
                    <label htmlFor="services_description" className="mb-2 block text-sm font-medium text-slate-300"> Kurze Beschreibung Ihrer Leistungen * </label>
                    <div className="relative">
                        <textarea id="services_description" name="services_description" value={profileData.services_description} onChange={handleInputChange} rows={4} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28"/>
                         <button
                            type="button"
                            onClick={() => handleGenerateProfileText('services')}
                            disabled={aiLoading === 'services' || !profileData.business_name}
                            className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${
                                aiLoading === 'services' || !profileData.business_name
                                ? 'bg-slate-600 cursor-not-allowed'
                                : 'bg-orange-600 hover:bg-orange-700'
                            }`}
                        >
                           <SparklesIcon className={`h-4 w-4 ${aiLoading === 'services' ? 'animate-spin' : ''}`} />
                           {aiLoading === 'services' ? 'Generiere...' : 'Generieren'}
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Tipp: Jede Leistung in eine neue Zeile (z.B. "Service A: Beschreibung A").</p>
                </div>

                {/* About Text with AI Button */} 
                <div>
                    <label htmlFor="about_text" className="mb-2 block text-sm font-medium text-slate-300"> Über Ihren Betrieb * </label>
                     <div className="relative">
                        <textarea id="about_text" name="about_text" value={profileData.about_text} onChange={handleInputChange} rows={5} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28"/>
                         <button
                            type="button"
                            onClick={() => handleGenerateProfileText('about')}
                            disabled={aiLoading === 'about' || !profileData.business_name}
                             className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${
                                aiLoading === 'about' || !profileData.business_name
                                ? 'bg-slate-600 cursor-not-allowed'
                                : 'bg-orange-600 hover:bg-orange-700'
                            }`}
                        >
                           <SparklesIcon className={`h-4 w-4 ${aiLoading === 'about' ? 'animate-spin' : ''}`} />
                           {aiLoading === 'about' ? 'Generiere...' : 'Generieren'}
                        </button>
                    </div>
                </div>

                 {/* Save Button for Profile */}
                <div className="flex items-center justify-end gap-4 pt-2">
                     {error && error.startsWith("Fehler beim Speichern") && ( <p className="text-sm text-red-500">{error}</p> )}
                     {successMessage && ( <p className="text-sm text-green-500">{successMessage}</p> )}
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
               <button onClick={handleLogout} disabled={logoutLoading} className={`inline-flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${ logoutLoading ? 'bg-red-800 cursor-not-allowed' : 'bg-red-700 hover:bg-red-600' }`} >
                 <ArrowRightStartOnRectangleIcon className={`h-5 w-5 ${logoutLoading ? 'animate-spin' : ''}`} />
                 {logoutLoading ? 'Abmelden...' : 'Abmelden'}
               </button>
               {error && error.startsWith("Abmeldung fehlgeschlagen:") && ( <p className="mt-2 text-sm text-red-500">{error}</p> )}
           </section>
        </form>
      )}
    </main>
  );
}

