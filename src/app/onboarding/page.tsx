// Onboarding page - src/app/onboarding/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// --- Icons (SparklesIcon, CheckIcon, ArrowPathIcon) ---
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>);
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );


type AIGenerationType = 'services' | 'about';
type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

// --- Helper Function to Create Slug ---
const createSlug = (name: string): string => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae') 
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, '') 
    .replace(/[\s_]+/g, '-') 
    .replace(/^-+|-+$/g, '');
};

export default function OnboardingPage() {
  // === State Variables ===
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [keywords, setKeywords] = useState(''); // <-- 1. ADD NEW STATE
  const [servicesDescription, setServicesDescription] = useState('');
  const [aboutText, setAboutText] = useState('');
  const [slug, setSlug] = useState(''); 
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle'); 
  const [slugCheckTimeout, setSlugCheckTimeout] = useState<NodeJS.Timeout | null>(null); 

  const [loading, setLoading] = useState(false); 
  const [aiLoading, setAiLoading] = useState<AIGenerationType | null>(null);
  const [error, setError] = useState<string | null>(null); 
  const [initialLoading, setInitialLoading] = useState(true);

  const router = useRouter();

  // === Get Current User & Check Existing Profile ===
  useEffect(() => {
    const checkUserAndProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }
        setCurrentUser(user);
        console.log("Checking profile for user:", user.id);
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            // <-- 2. ADD 'keywords' TO THE SELECT STATEMENT -->
            .select('business_name, address, phone, services_description, about_text, onboarding_complete, slug, email, keywords')
            .eq('id', user.id).single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error fetching profile:", profileError); setError("Fehler beim Laden des Profils.");
        } else if (profile) {
            console.log("Existing profile found:", profile);
            setBusinessName(profile.business_name || ''); setAddress(profile.address || ''); setPhone(profile.phone || '');
            setKeywords(profile.keywords || ''); // <-- 3. SET THE STATE
            setServicesDescription(profile.services_description || ''); setAboutText(profile.about_text || '');
            setSlug(profile.slug || '');
            if (profile.slug) setSlugStatus('available');
            if (profile.onboarding_complete) {
                console.log("Onboarding already complete, redirecting..."); router.push('/dashboard'); return;
            }
        } else {
            console.log("No existing profile found for user:", user.id);
        }
        setInitialLoading(false);
    };
    checkUserAndProfile();
  // --- FIX: Added supabase.auth to dependency array ---
  }, [router, supabase]);

  // --- Auto-suggest slug based on business name ---
  useEffect(() => {
      if (!slug && businessName && slugStatus !== 'available') {
          const suggestedSlug = createSlug(businessName);
          setSlug(suggestedSlug);
          if (suggestedSlug) {
              handleSlugChange({ target: { value: suggestedSlug } } as React.ChangeEvent<HTMLInputElement>);
          }
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessName]);

  // --- Function to check slug uniqueness ---
  const checkSlugUniqueness = useCallback(async (currentSlug: string) => {
    if (!currentSlug.trim()) { setSlugStatus('invalid'); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(currentSlug)) { setSlugStatus('invalid'); return; }

    setSlugStatus('checking');
    try {
        const query = supabase.from('profiles').select('id').eq('slug', currentSlug);
        if (currentUser) query.neq('id', currentUser.id);
        const { data, error } = await query.limit(1);

        if (error) { console.error("Error checking slug uniqueness:", error); setSlugStatus('idle'); setError("Fehler bei der Slug-Prüfung."); }
        else if (data && data.length > 0) setSlugStatus('taken');
        else setSlugStatus('available');
    } catch (err) { console.error("Exception checking slug:", err); setSlugStatus('idle'); setError("Fehler bei der Slug-Prüfung."); }
  // --- FIX: Added supabase to dependency array ---
  }, [currentUser, supabase]);


  // --- Handle Slug Input Change with Debounce ---
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(newSlug);
    setSlugStatus('idle'); setError(null);
    if (slugCheckTimeout) clearTimeout(slugCheckTimeout);
    if (newSlug.trim()) {
        const timeout = setTimeout(() => { checkSlugUniqueness(newSlug); }, 500);
        setSlugCheckTimeout(timeout);
    } else {
        setSlugStatus('invalid');
    }
  };

  // Handle AI Text Generation
  const handleGenerateProfileText = async (type: AIGenerationType) => { 
    const context = businessName || 'Handwerksbetrieb'; 
    if (!context) { setError("Bitte geben Sie zuerst den Namen des Betriebs ein."); return; } 
    setAiLoading(type); setError(null); 
    try { 
      // <-- 4. ADD 'keywords' TO THE API CALL BODY -->
      const response = await fetch('/api/generate-profile-text', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ context: context, type: type, keywords: keywords }), 
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
    if (!currentUser) { setError("Benutzer nicht identifiziert."); return; }
    if (slugStatus !== 'available') {
        setError("Bitte wählen Sie einen gültigen und verfügbaren URL-Pfad (Slug).");
        if(slugStatus === 'idle' || slugStatus === 'checking') checkSlugUniqueness(slug);
        return;
    }

    setLoading(true); setError(null);
    console.log("Submitting onboarding data for user:", currentUser.id);

    const profileData = {
        'id': currentUser.id, 
        'business_name': businessName, 
        'address': address,
        'phone': phone, 
        'keywords': keywords, // <-- 5. ADD 'keywords' TO SAVE OBJECT
        'services_description': servicesDescription, 
        'about_text': aboutText,
        'slug': slug, 
        'onboarding_complete': true, 
        'updated_at': new Date().toISOString(),
        'email': currentUser.email
     };
    console.log("Data being sent to upsert:", profileData);

    const upsertProfile = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .upsert(profileData)
            .select()
            .single();

        if (error) {
            if (error.message.includes('duplicate key value violates unique constraint "profiles_slug_key"')) {
                setSlugStatus('taken');
                throw new Error("Dieser URL-Pfad (Slug) ist bereits vergeben. Bitte wählen Sie einen anderen.");
            }
            console.error('Error saving profile (inside promise):', error);
            throw error;
        }
        console.log('Profile saved successfully (inside promise):', data);
        return data;
    };

    await toast.promise(
        upsertProfile(), 
        {
            loading: 'Profil wird gespeichert...',
            success: (data) => {
                router.push('/dashboard');
                return 'Profil erfolgreich gespeichert!';
            },
            error: (err: any) => {
                console.error('Error saving profile (toast):', err);
                if (err.message.includes("bereits vergeben")) {
                   setSlugStatus('taken'); 
                }
                return `Fehler beim Speichern: ${err.message}`;
            }
        }
    );

    setLoading(false); 
  };

  // === Render Logic (JSX) ===
  if (initialLoading) { return ( <div className="flex min-h-screen items-center justify-center bg-gray-100"><p className="text-gray-600">Lade Benutzerdaten...</p></div> ); }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 py-12">
      <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-xl border border-gray-200">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-900"> Willkommen bei ArtisanCMS! </h1>
        <p className="mb-8 text-center text-gray-600"> Bitte richten Sie Ihr Unternehmensprofil ein. </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-gray-700"> Name des Betriebs * </label>
            <input type="text" id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="z.B. Tischlerei Mustermann"/>
          </div>

          {/* Slug Input */}
          <div>
            <label htmlFor="slug" className="mb-2 block text-sm font-medium text-gray-700"> Ihr Webseiten-Pfad (Slug) * </label>
            <div className="relative">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 sm:text-sm">
                   artisancms.app/
                 </span>
                <input
                    type="text" id="slug" name="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    required
                    aria-describedby="slug-description slug-status"
                    style={{ paddingLeft: `${Math.max(60, 'artisancms.app/'.length * 7 + 12)}px` }} 
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                    placeholder="z.b. tischlerei-mustermann"
                 />
                 <div id="slug-status" className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {slugStatus === 'checking' && <ArrowPathIcon className="h-5 w-5 text-gray-400" />}
                    {slugStatus === 'available' && <CheckIcon className="h-5 w-5 text-green-500" />}
                    {(slugStatus === 'taken' || slugStatus === 'invalid') && <span className="text-red-500 text-xl font-bold">!</span>}
                 </div>
            </div>
            <p id="slug-description" className="mt-1 text-xs text-gray-500">
                Dies wird Teil Ihrer Webseiten-URL (nur Kleinbuchstaben, Zahlen und Bindestriche).
            </p>
            {slugStatus === 'taken' && <p className="mt-1 text-xs text-red-600">Dieser Pfad ist leider schon vergeben.</p>}
            {slugStatus === 'invalid' && <p className="mt-1 text-xs text-red-600">Ungültige Zeichen. Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt. Darf nicht leer sein oder mit '-' beginnen/enden.</p>}
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

          {/* --- 6. ADD KEYWORDS INPUT FIELD --- */}
          <div>
            <label htmlFor="keywords" className="mb-2 block text-sm font-medium text-gray-700"> Wichtige Schlagworte (Optional) </label>
            <input 
              type="text" 
              id="keywords" 
              value={keywords} 
              onChange={(e) => setKeywords(e.target.value)} 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500" 
              placeholder="z.B. Badsanierung, Heizung, Solar, Möbelbau"
            />
            <p className="mt-1 text-xs text-gray-500">
               Helfen Sie der AI, bessere Texte zu generieren. Trennen Sie Begriffe mit Kommas.
             </p>
          </div>

           {/* Services Description with AI */}
           <div>
            <label htmlFor="servicesDescription" className="mb-2 block text-sm font-medium text-gray-700"> Leistungen * </label>
             <div className="relative">
                <textarea id="servicesDescription" value={servicesDescription} rows={4} onChange={(e) => setServicesDescription(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28" placeholder="z.B. Badsanierung: Kompletterneuerung Ihres Badezimmers."/>
                 <button type="button" onClick={() => handleGenerateProfileText('services')} disabled={aiLoading === 'services' || !businessName} className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${ aiLoading === 'services' || !businessName ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} >
                   <SparklesIcon className={`h-4 w-4 ${aiLoading === 'services' ? 'animate-spin' : ''}`} />
                   {aiLoading === 'services' ? 'Generiere...' : 'Generieren'}
                 </button>
             </div>
             <p className="mt-1 text-xs text-gray-500">
               Tipp: Formatieren Sie jede Leistung in einer neuen Zeile als: <strong>Titel: Beschreibung</strong>
               <br/>
               (z.B. Heizungstechnik: Installation und Wartung von Heizsystemen.)
             </p>
          </div>
           {/* About Text with AI */}
           <div>
            <label htmlFor="aboutText" className="mb-2 block text-sm font-medium text-gray-700"> Über Ihren Betrieb * </label>
             <div className="relative">
                <textarea id="aboutText" value={aboutText} rows={5} onChange={(e) => setAboutText(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28" placeholder="Erzählen Sie etwas über Ihre Erfahrung..."/>
                 <button type="button" onClick={() => handleGenerateProfileText('about')} disabled={aiLoading === 'about' || !businessName} className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${ aiLoading === 'about' || !businessName ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} >
                   <SparklesIcon className={`h-4 w-4 ${aiLoading === 'about' ? 'animate-spin' : ''}`} />
                   {aiLoading === 'about' ? 'Generiere...' : 'Generieren'}
                 </button>
             </div>
          </div>

          {/* General Error Message Display */}
          {error && ( <p className="text-center text-sm text-red-600">{error}</p> )}

          {/* Submit Button */}
          <div className="pt-4">
            <button type="submit" disabled={loading || initialLoading || !currentUser || !!aiLoading || slugStatus !== 'available'} className={`w-full rounded-md px-5 py-3 text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors ${ loading || initialLoading || !currentUser || !!aiLoading || slugStatus !== 'available' ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 shadow-sm' }`} >
              {loading ? 'Speichern...' : 'Speichern und Weiter zum Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}