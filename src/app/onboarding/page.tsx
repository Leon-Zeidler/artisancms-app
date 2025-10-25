// Onboarding page - src/app/onboarding/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Standard Next.js import
// *** CORRECTED: Using path alias again, assuming tsconfig.json is correct ***
import { supabase } from '@/lib/supabaseClient'; 
import Link from 'next/link'; // Standard Next.js import for Link
import { User } from '@supabase/supabase-js';

// --- Icon for AI Button --- 
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" />
    </svg>
);

// Define types for AI generation context
type AIGenerationType = 'services' | 'about';

export default function OnboardingPage() {
  // === State Variables ===
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [servicesDescription, setServicesDescription] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [loading, setLoading] = useState(false); // Main form saving state
  const [aiLoading, setAiLoading] = useState<AIGenerationType | null>(null); // Track which AI is loading
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true); // Track initial user load

  const router = useRouter();

  // === Get Current User & Check Existing Profile ===
  useEffect(() => {
    // ... (logic remains the same as before) ...
    const checkUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setCurrentUser(user);
      console.log("Checking profile for user:", user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('business_name, address, phone, services_description, about_text, onboarding_complete').eq('id', user.id).single();
      if (profileError && profileError.code !== 'PGRST116') { console.error("Error fetching profile:", profileError); setError("Fehler beim Laden des Profils."); }
      else if (profile) {
          console.log("Existing profile found:", profile);
          setBusinessName(profile.business_name || ''); setAddress(profile['address'] || ''); setPhone(profile.phone || '');
          setServicesDescription(profile.services_description || ''); setAboutText(profile.about_text || '');
          if (profile.onboarding_complete) { console.log("Onboarding already complete, redirecting..."); router.push('/dashboard'); return; }
      } else { console.log("No existing profile found for user:", user.id); }
      setInitialLoading(false);
    };
    checkUserAndProfile();
  }, [router]);

  // Handle AI Text Generation (Similar to Settings Page)
  const handleGenerateProfileText = async (type: AIGenerationType) => {
      const context = businessName || 'Handwerksbetrieb'; // Use business name or default
      if (!context) { setError("Bitte geben Sie zuerst den Namen des Betriebs ein."); return; }
      setAiLoading(type); setError(null);

      try {
          const response = await fetch('/api/generate-profile-text', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ context: context, type: type }),
          });
          if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Failed to generate ${type} text`); }
          const data = await response.json();
          if (type === 'services') { setServicesDescription(data.text); }
          else if (type === 'about') { setAboutText(data.text); }
      } catch (err) {
          console.error(`Error calling ${type} generation API:`, err);
          const message = err instanceof Error ? err.message : "An unknown error occurred";
          setError(`Fehler bei der Textgenerierung: ${message}`);
      } finally {
          setAiLoading(null);
      }
  };


  // === Handle Form Submission ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) { setError("User not identified."); return; }
    setLoading(true); setError(null);
    console.log("Submitting onboarding data for user:", currentUser.id);

    const profileData = {
        'id': currentUser.id, 'business_name': businessName, 'address': address, 'phone': phone,
        'services_description': servicesDescription, 'about_text': aboutText,
        'onboarding_complete': true, 'updated_at': new Date().toISOString(),
     };
    console.log("Data being sent to upsert:", profileData);

    const { data, error: upsertError } = await supabase.from('profiles').upsert(profileData).select().single();
    setLoading(false);

    if (upsertError) { console.error('Error saving profile:', upsertError); setError(`Fehler beim Speichern des Profils: ${upsertError.message}`); }
    else { console.log('Profile saved successfully:', data); router.push('/dashboard'); }
  };

  // === Render Logic (JSX) ===
  if (initialLoading) {
    return ( <div className="flex min-h-screen items-center justify-center bg-gray-100"><p className="text-gray-600">Lade Benutzerdaten...</p></div> );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 py-12">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-xl border border-gray-200">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900"> Willkommen bei ArtisanCMS! </h1>
        <p className="mb-8 text-center text-gray-600"> Bitte erzählen Sie uns kurz etwas über Ihr Unternehmen, um Ihre Webseite einzurichten. </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-gray-700"> Name des Betriebs * </label>
            <input type="text" id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="z.B. Tischlerei Mustermann"/>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-medium text-gray-700"> Adresse * </label>
            <textarea id="address" value={address} rows={3} onChange={(e) => setAddress(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="Musterstraße 1&#10;01454 Radeberg"/>
          </div>

           {/* Phone */}
           <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700"> Telefonnummer * </label>
            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="+49 123 456789"/>
          </div>

           {/* Services Description with AI Button */} 
           <div>
            <label htmlFor="servicesDescription" className="mb-2 block text-sm font-medium text-gray-700"> Kurze Beschreibung Ihrer Leistungen * </label>
             <div className="relative">
                <textarea id="servicesDescription" value={servicesDescription} rows={4} onChange={(e) => setServicesDescription(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28" placeholder="z.B. Badsanierung, Heizungsinstallation..."/>
                 <button type="button" onClick={() => handleGenerateProfileText('services')} disabled={aiLoading === 'services' || !businessName} className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${ aiLoading === 'services' || !businessName ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} >
                   <SparklesIcon className={`h-4 w-4 ${aiLoading === 'services' ? 'animate-spin' : ''}`} />
                   {aiLoading === 'services' ? 'Generiere...' : 'Generieren'}
                 </button>
             </div>
             <p className="mt-1 text-xs text-gray-500">Tipp: Schreiben Sie jede Leistung in eine neue Zeile, z.B. "Service A: Beschreibung A"</p>
          </div>

           {/* About Text with AI Button */} 
           <div>
            <label htmlFor="aboutText" className="mb-2 block text-sm font-medium text-gray-700"> Über Ihren Betrieb (für die Webseite) * </label>
             <div className="relative">
                <textarea id="aboutText" value={aboutText} rows={5} onChange={(e) => setAboutText(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28" placeholder="Erzählen Sie etwas über Ihre Erfahrung..."/>
                 <button type="button" onClick={() => handleGenerateProfileText('about')} disabled={aiLoading === 'about' || !businessName} className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${ aiLoading === 'about' || !businessName ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} >
                   <SparklesIcon className={`h-4 w-4 ${aiLoading === 'about' ? 'animate-spin' : ''}`} />
                   {aiLoading === 'about' ? 'Generiere...' : 'Generieren'}
                 </button>
             </div>
          </div>


          {/* Error Message Display */}
          {error && ( <p className="text-center text-sm text-red-600">{error}</p> )}

          {/* Submit Button */}
          <div className="pt-4">
            <button type="submit" disabled={loading || initialLoading || !currentUser || !!aiLoading} className={`w-full rounded-md px-5 py-3 text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors ${ loading || initialLoading || !currentUser || !!aiLoading ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 shadow-sm' }`} >
              {loading ? 'Speichern...' : 'Speichern und Weiter zum Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

