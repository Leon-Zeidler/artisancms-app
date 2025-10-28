// src/app/dashboard/einstellungen/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// --- Icons ---
const ArrowRightStartOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /> </svg> );
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> </svg> );
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );

// Type for profile data including slug and legal texts
type ProfileData = {
  business_name: string;
  address: string;
  phone: string;
  services_description: string;
  about_text: string;
  slug: string;
  impressum_text: string | null; // Add impressum
  datenschutz_text: string | null; // Add datenschutz
};

type AIGenerationType = 'services' | 'about';
type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

// A basic legal text template for the privacy policy
const DATENSCHUTZ_TEMPLATE = `Verantwortlicher im Sinne der Datenschutzgesetze, insbesondere der EU-Datenschutzgrundverordnung (DSGVO), ist:

[IHREN NAMEN UND ADRESSE HIER EINFÜGEN]

Ihre Betroffenenrechte
Unter den angegebenen Kontaktdaten unseres Datenschutzbeauftragten können Sie jederzeit folgende Rechte ausüben:
- Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung,
- Berichtigung unrichtiger personenbezogener Daten,
- Löschung Ihrer bei uns gespeicherten Daten,
- Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund gesetzlicher Pflichten noch nicht löschen dürfen,
- Widerspruch gegen die Verarbeitung Ihrer Daten bei uns und
- Datenübertragbarkeit, sofern Sie in die Datenverarbeitung eingewilligt haben oder einen Vertrag mit uns abgeschlossen haben.

Sofern Sie uns eine Einwilligung erteilt haben, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen.

Erfassung allgemeiner Informationen beim Besuch unserer Website
Art und Zweck der Verarbeitung:
Wenn Sie auf unsere Website zugreifen, d.h., wenn Sie sich nicht registrieren oder anderweitig Informationen übermitteln, werden automatisch Informationen allgemeiner Natur erfasst. Diese Informationen (Server-Logfiles) beinhalten etwa die Art des Webbrowsers, das verwendete Betriebssystem, den Domainnamen Ihres Internet-Service-Providers, Ihre IP-Adresse und ähnliches.

[... WEITERE ABSCHNITTE FÜR HOSTING (VERCEL), KONTAKTFORMULAR (SUPABASE), ETC. HINZUFÜGEN ...]

Änderung unserer Datenschutzbestimmungen
Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen, z.B. bei der Einführung neuer Services. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.

Fragen an den Datenschutzbeauftragten
Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine E-Mail oder wenden Sie sich direkt an die für den Datenschutz verantwortliche Person in unserer Organisation.

*** HINWEIS: Dies ist eine VORLAGE. Sie MÜSSEN diese anpassen und Dienste wie Google Maps, YouTube, Analyse-Tools etc. hinzufügen, die Sie ggf. nutzen. Holen Sie sich im Zweifel rechtlichen Rat. ***
`;


export default function EinstellungenPage() {
  // === State Variables ===
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
      business_name: '', address: '', phone: '', services_description: '', about_text: '', slug: '',
      impressum_text: '', 
      datenschutz_text: '' // Initialize
  });
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [slugCheckTimeout, setSlugCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [originalSlug, setOriginalSlug] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<AIGenerationType | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const router = useRouter();

  // === Get Current User & Profile Data on Load ===
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true); setGeneralError(null);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!isMounted || userError || !user) { if (isMounted) router.push('/login'); return; }
      if (isMounted) setCurrentUser(user);

      console.log("Fetching profile data for settings...");
      // Select new legal text columns
      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('business_name, address, phone, services_description, about_text, slug, impressum_text, datenschutz_text')
        .eq('id', user.id).single();
      console.log("Profile fetch result:", { profile, profileError });

      if (isMounted) {
          if (profileError && profileError.code !== 'PGRST116') {
              setGeneralError("Profildaten konnten nicht geladen werden.");
          } else if (profile) {
            // Pre-fill datenschutz text with template IF it's empty
            const datenschutzText = profile.datenschutz_text || DATENSCHUTZ_TEMPLATE;

            setProfileData({
                business_name: profile.business_name || '', address: profile.address || '', phone: profile.phone || '',
                services_description: profile.services_description || '', about_text: profile.about_text || '',
                slug: profile.slug || '',
                impressum_text: profile.impressum_text || '', // Load impressum
                datenschutz_text: datenschutzText // Load datenschutz or template
            });
            setOriginalSlug(profile.slug || '');
            setSlugStatus(profile.slug ? 'available' : 'invalid');
          } else {
              setGeneralError("Kein Profil gefunden.");
          }
           setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false };
  }, [router]);

  // === Handle Input Changes (including slug) ===
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProfileData(prev => ({ ...prev, [name]: value }));
      if (name === 'slug') {
          const newSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
          setProfileData(prev => ({...prev, slug: newSlug}));
          handleSlugChangeInternal(newSlug);
      }
  };

  // --- Function to check slug uniqueness ---
  const checkSlugUniqueness = useCallback(async (currentSlug: string) => {
    if (!currentSlug.trim()) { setSlugStatus('invalid'); return; }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(currentSlug)) { setSlugStatus('invalid'); return; }
    if (currentSlug === originalSlug) { setSlugStatus('available'); return; }
    setSlugStatus('checking');
    try {
        const query = supabase.from('profiles').select('id').eq('slug', currentSlug);
        const { data, error } = await query.limit(1);
        if (error) { console.error("Error checking slug uniqueness:", error); setSlugStatus('idle'); toast.error("Fehler bei der Slug-Prüfung."); }
        else if (data && data.length > 0) setSlugStatus('taken');
        else setSlugStatus('available');
    } catch (err) { console.error("Exception checking slug:", err); setSlugStatus('idle'); toast.error("Fehler bei der Slug-Prüfung."); }
  }, [originalSlug]);

  // --- Internal handler for slug change with debounce ---
  const handleSlugChangeInternal = (newSlug: string) => {
    setSlugStatus('idle');
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
    const context = profileData.business_name || 'Handwerksbetrieb';
    if (!context) { toast.error("Bitte geben Sie zuerst den Namen des Betriebs ein."); return; }
    setAiLoading(type);
    await toast.promise(
       fetch('/api/generate-profile-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ context: context, type: type }),
        }).then(async (response) => {
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Failed to generate ${type} text`); }
            return response.json();
        }),
        {
            loading: `${type === 'services' ? 'Leistungsbeschreibung' : '"Über uns" Text'} wird generiert...`,
            success: (data) => {
                if (type === 'services') { setProfileData(prev => ({ ...prev, services_description: data.text })); }
                else if (type === 'about') { setProfileData(prev => ({ ...prev, about_text: data.text })); }
                return `${type === 'services' ? 'Leistungsbeschreibung' : '"Über uns" Text'} erfolgreich generiert!`;
            },
            error: (err) => `Fehler bei der Textgenerierung: ${err.message}`
        }
    );
    setAiLoading(null);
  };


  // === Handle Form Submission (Save Profile including Slug & Legal Texts) ===
  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) { toast.error("Benutzer nicht gefunden."); return; }
    if (slugStatus !== 'available') { toast.error("Bitte wählen Sie einen gültigen und verfügbaren URL-Pfad (Slug)."); if(slugStatus === 'idle' || slugStatus === 'checking') checkSlugUniqueness(profileData.slug); return; }

    setSaving(true);

    // Include new legal text fields in updates
    const profileUpdates = {
          business_name: profileData.business_name, address: profileData.address, phone: profileData.phone,
          services_description: profileData.services_description, about_text: profileData.about_text,
          slug: profileData.slug,
          impressum_text: profileData.impressum_text || null, // Send null if empty
          datenschutz_text: profileData.datenschutz_text || null, // Send null if empty
          updated_at: new Date().toISOString(),
    };

    // Define the promise function separately
    const savePromise = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', currentUser.id)
            .select()
            .single();

        if (error) {
            if (error.message.includes('duplicate key value violates unique constraint "profiles_slug_key"')) {
                setSlugStatus('taken');
                throw new Error("Dieser URL-Pfad (Slug) ist bereits vergeben.");
            }
            console.error("Supabase Error saving profile:", error);
            throw error;
        }
        console.log("Supabase Success saving profile:", data);
        setOriginalSlug(profileData.slug); // Update original slug on success
        return data;
    };

    // Pass the *invocation* of the promise function
    await toast.promise(
        savePromise(), // Invoke the async function
        { // Options object
          loading: 'Profil wird gespeichert...',
          success: 'Profil erfolgreich gespeichert!',
          error: (err: any) => {
              if (err.message.includes("bereits vergeben")) {
                 setSlugStatus('taken');
              }
              return `Fehler beim Speichern: ${err?.message || 'Unbekannter Fehler'}`;
          },
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
      {generalError && !loading && ( <p className="text-red-500 mt-8 text-center">{generalError}</p> )}

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

                 {/* Slug Input */}
                <div>
                    <label htmlFor="slug" className="mb-2 block text-sm font-medium text-slate-300"> Ihr Webseiten-Pfad (Slug) * </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 sm:text-sm"> IhreDomain.de/ </span>
                        <input
                            type="text" id="slug" name="slug"
                            value={profileData.slug}
                            onChange={handleInputChange}
                            required
                            aria-describedby="slug-description slug-status-settings"
                            style={{ paddingLeft: `${Math.max(60, 'IhreDomain.de/'.length * 7 + 12)}px` }}
                            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                            placeholder="z.b. tischlerei-mustermann"
                        />
                        <div id="slug-status-settings" className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {slugStatus === 'checking' && <ArrowPathIcon className="h-5 w-5 text-gray-400" />}
                            {slugStatus === 'available' && <CheckIcon className="h-5 w-5 text-green-500" />}
                            {(slugStatus === 'taken' || slugStatus === 'invalid') && <span className="text-red-500 text-xl font-bold">!</span>}
                        </div>
                    </div>
                    <p id="slug-description" className="mt-1 text-xs text-slate-500">
                        Dies wird Teil Ihrer Webseiten-URL (nur Kleinbuchstaben, Zahlen und Bindestriche). Muss eindeutig sein.
                    </p>
                    {slugStatus === 'taken' && <p className="mt-1 text-xs text-red-600">Dieser Pfad ist leider schon vergeben.</p>}
                    {slugStatus === 'invalid' && <p className="mt-1 text-xs text-red-600">Ungültige Zeichen oder leer. Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt. Darf nicht mit '-' beginnen/enden.</p>}
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

                {/* Services Description with AI */}
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

                {/* About Text with AI */}
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

                 {/* *** NEW: Impressum Text Area *** */}
                 <div>
                    <label htmlFor="impressum_text" className="mb-2 block text-sm font-medium text-slate-300"> Impressum Text </label>
                    <textarea
                        id="impressum_text" name="impressum_text"
                        value={profileData.impressum_text || ''}
                        onChange={handleInputChange}
                        rows={10} // Make it reasonably large
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                        placeholder="Fügen Sie hier den vollständigen Text Ihres Impressums ein..."
                    />
                     <p className="mt-1 text-xs text-slate-500">Dieser Text wird auf Ihrer /impressum Seite angezeigt. Er ist gesetzlich vorgeschrieben.</p>
                </div>

                 {/* *** NEW: Datenschutz Text Area *** */}
                 <div>
                    <label htmlFor="datenschutz_text" className="mb-2 block text-sm font-medium text-slate-300"> Datenschutzerklärung Text </label>
                     <div className="rounded-md bg-yellow-900/50 border border-yellow-700 p-3 mb-2">
                         <p className="text-xs text-yellow-200">
                             <strong>Hinweis:</strong> Die folgende Vorlage deckt nur die von ArtisanCMS bereitgestellten Dienste (Hosting, E-Mail) ab. Sie sind **rechtlich verpflichtet**, diese Vorlage zu prüfen und alle zusätzlichen Dienste (z.B. Google Maps, YouTube, Calendly, Analyse-Tools) hinzuzufügen, die Sie selbst einbetten.
                         </p>
                     </div>
                    <textarea
                        id="datenschutz_text" name="datenschutz_text"
                        value={profileData.datenschutz_text || ''}
                        onChange={handleInputChange}
                        rows={10} // Make it reasonably large
                        className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                        placeholder="Fügen Sie hier den vollständigen Text Ihrer Datenschutzerklärung ein..."
                    />
                     <p className="mt-1 text-xs text-slate-500">Dieser Text wird auf Ihrer /datenschutz Seite angezeigt.</p>
                </div>


                 {/* Save Button for Profile */}
                <div className="flex items-center justify-end gap-4 pt-2">
                    <button type="submit" disabled={saving || !!aiLoading || slugStatus !== 'available'} className={`inline-flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${ saving || !!aiLoading || slugStatus !== 'available' ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} >
                        {saving ? 'Wird gespeichert...' : 'Profil speichern'}
                         {!saving && <CheckIcon className="h-4 w-4" />}
                    </button>
                </div>
              </div>
           </section>

           {/* Account Section (remains same) */}
           <section className="pt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Konto</h2>
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700"> <dl className="space-y-2"> <div className="flex justify-between"> <dt className="text-sm font-medium text-slate-400">Email</dt> <dd className="text-sm text-white">{currentUser?.email}</dd> </div> <div className="flex justify-between"> <dt className="text-sm font-medium text-slate-400">Benutzer-ID</dt> <dd className="text-xs text-slate-500">{currentUser?.id}</dd> </div> </dl> </div>
           </section>

           {/* Subscription Section (remains same) */}
            <section className="pt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Abonnement</h2>
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700"> <p className="text-sm text-slate-400">Aktueller Plan: <span className="text-white font-medium">Free / Pro (Platzhalter)</span></p> <p className="mt-4 text-xs text-slate-500">Die Abonnementverwaltung wird in Kürze verfügbar sein.</p> </div>
            </section>

           {/* Logout Button (remains same) */}
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

