// src/app/dashboard/einstellungen/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal'; // <-- Import reusable modal

// --- Icons ---
const ArrowRightStartOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /> </svg> );
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> </svg> );
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> </svg> );
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /> </svg> );

// Type for profile data
type ProfileData = {
  business_name: string;
  address: string;
  phone: string;
  services_description: string;
  about_text: string;
  slug: string;
  impressum_text: string | null;
  datenschutz_text: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
};

type AIGenerationType = 'services' | 'about';
type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const DATENSCHUTZ_TEMPLATE = `Verantwortlicher im Sinne der Datenschutzgesetze...`; // (Shortened)

const DEFAULT_PRIMARY_COLOR = '#ea580c';
const DEFAULT_SECONDARY_COLOR = '#475569';

export default function EinstellungenPage() {
  // === State Variables ===
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
      business_name: '', address: '', phone: '', services_description: '', about_text: '', slug: '',
      impressum_text: '', datenschutz_text: '',
      logo_url: null,
      primary_color: DEFAULT_PRIMARY_COLOR,
      secondary_color: DEFAULT_SECONDARY_COLOR,
  });
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [slugCheckTimeout, setSlugCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  const [originalSlug, setOriginalSlug] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<AIGenerationType | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const router = useRouter();

  // === Get Current User & Profile Data on Load ===
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true); setGeneralError(null);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!isMounted || userError || !user) { if (isMounted) router.push('/login'); return; }
      if (isMounted) setCurrentUser(user);

      const selectColumns = 'business_name, address, phone, services_description, about_text, slug, impressum_text, datenschutz_text, logo_url, primary_color, secondary_color, email';
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(selectColumns)
        .eq('id', user.id)
        .single();

      if (isMounted) {
          if (profileError && profileError.code !== 'PGRST116') {
              setGeneralError(`Profildaten konnten nicht geladen werden: ${profileError.message}`);
          } else if (profile) {
            const datenschutzText = profile.datenschutz_text || DATENSCHUTZ_TEMPLATE;
            setProfileData({
                business_name: profile.business_name || '', address: profile.address || '', phone: profile.phone || '',
                services_description: profile.services_description || '', about_text: profile.about_text || '',
                slug: profile.slug || '',
                impressum_text: profile.impressum_text || '',
                datenschutz_text: datenschutzText,
                logo_url: profile.logo_url || null,
                primary_color: profile.primary_color || DEFAULT_PRIMARY_COLOR,
                secondary_color: profile.secondary_color || DEFAULT_SECONDARY_COLOR,
            });
            setOriginalSlug(profile.slug || '');
            setSlugStatus(profile.slug ? 'available' : 'invalid');
            setLogoPreviewUrl(profile.logo_url || null);
          } else {
              console.warn("Profile fetch returned no data, but user is past onboarding.");
              setGeneralError("Profil nicht gefunden. Bitte versuchen Sie, sich neu anzumelden.");
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
      if (name === 'slug') {
          const newSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
          setProfileData(prev => ({...prev, slug: newSlug}));
          handleSlugChangeInternal(newSlug);
      }
  };

  // --- Logo File Change Handler ---
   const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     if (event.target.files && event.target.files.length > 0) {
       const file = event.target.files[0];
       if (!file.type.startsWith('image/')) {
         toast.error("Bitte wählen Sie eine Bilddatei (PNG, JPG, SVG, etc.).");
         event.target.value = ''; return;
       }
       setLogoFile(file);
       setLogoPreviewUrl(URL.createObjectURL(file));
       setIsRemovingLogo(false);
     } else {
       setLogoFile(null);
       setLogoPreviewUrl(profileData.logo_url);
     }
   };

   // --- Handle Logo Removal Intent ---
   const handleLogoRemoveIntent = () => {
       setIsRemovingLogo(true);
       setLogoFile(null);
       setLogoPreviewUrl(null);
   };

  // --- Slug Check Logic ---
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

  const handleSlugChangeInternal = (newSlug: string) => {
    setSlugStatus('idle');
    if (slugCheckTimeout) clearTimeout(slugCheckTimeout);
    if (newSlug.trim()) {
        const timeout = setTimeout(() => { checkSlugUniqueness(newSlug); }, 500);
        setSlugCheckTimeout(timeout);
    } else { setSlugStatus('invalid'); }
  };

  // --- AI Text Generation ---
  const handleGenerateProfileText = async (type: AIGenerationType) => {
    const context = profileData.business_name || 'Handwerksbetrieb';
    if (!context) { toast.error("Bitte geben Sie zuerst den Namen des Betriebs ein."); return; }
    setAiLoading(type);
    await toast.promise(
       fetch('/api/generate-profile-text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ context: context, type: type }), })
       .then(async (response) => { if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Failed to generate ${type} text`); } return response.json(); }),
       { loading: `${type === 'services' ? 'Leistungsbeschreibung' : '"Über uns" Text'} wird generiert...`,
         success: (data) => { if (type === 'services') setProfileData(prev => ({ ...prev, services_description: data.text })); else if (type === 'about') setProfileData(prev => ({ ...prev, about_text: data.text })); return `${type === 'services' ? 'Leistungsbeschreibung' : '"Über uns" Text'} erfolgreich generiert!`; },
         error: (err) => `Fehler bei der Textgenerierung: ${err.message}` }
    );
    setAiLoading(null);
  };

  // === Handle Form Submission ===
  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) { toast.error("Benutzer nicht gefunden."); return; }
    if (slugStatus !== 'available') { toast.error("Bitte wählen Sie einen gültigen und verfügbaren URL-Pfad (Slug)."); if(slugStatus === 'idle' || slugStatus === 'checking') checkSlugUniqueness(profileData.slug); return; }
    setSaving(true);

    const savePromise = async () => {
        let finalLogoUrl = profileData.logo_url;
        let oldLogoPath: string | null = null;
        const userId = currentUser.id;

        if (isRemovingLogo && profileData.logo_url) {
            finalLogoUrl = null;
            try { 
              // --- FIX: Use slice(6) ---
              oldLogoPath = new URL(profileData.logo_url).pathname.split('/').slice(6).join('/'); 
            } catch {}
        }
        else if (logoFile) {
            const file = logoFile;
            const fileExtension = file.name.split('.').pop() || 'png';
            const fileName = `logo.${fileExtension}`;
            const filePath = `${userId}/${fileName}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('logos').upload(filePath, file, { upsert: true });
            if (uploadError) { throw new Error(`Logo konnte nicht hochgeladen werden: ${uploadError.message}`); }
            const { data: urlData } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
            if (!urlData?.publicUrl) { throw new Error("Konnte die URL des neuen Logos nicht abrufen."); }
            finalLogoUrl = urlData.publicUrl;
            if (profileData.logo_url && profileData.logo_url !== finalLogoUrl) {
                try { 
                  // --- FIX: Use slice(6) ---
                  oldLogoPath = new URL(profileData.logo_url).pathname.split('/').slice(6).join('/'); 
                } catch {}
            }
        }

        //
        // --- THIS IS THE FIX ---
        //
        const profileUpdates = {
          business_name: profileData.business_name, address: profileData.address, phone: profileData.phone,
          services_description: profileData.services_description, about_text: profileData.about_text,
          slug: profileData.slug,
          impressum_text: profileData.impressum_text || null, // <-- ADDED
          datenschutz_text: profileData.datenschutz_text || null, // <-- ADDED
          updated_at: new Date().toISOString(),
          logo_url: finalLogoUrl,
          primary_color: profileData.primary_color,
          secondary_color: profileData.secondary_color,
        };
        //
        // --- END OF FIX ---
        //

        const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles').update(profileUpdates).eq('id', currentUser.id).select().single();

        if (updateError) {
             if (updateError.message.includes('duplicate key value violates unique constraint "profiles_slug_key"')) {
                setSlugStatus('taken'); throw new Error("Dieser URL-Pfad (Slug) ist bereits vergeben.");
             }
             throw new Error(`Profil konnte nicht gespeichert werden: ${updateError.message}`);
        }

        if (oldLogoPath) {
             const { error: deleteError } = await supabase.storage.from('logos').remove([oldLogoPath]);
             if (deleteError) {
                 console.warn("Could not delete old logo from storage, proceeding anyway:", deleteError.message);
                 toast.error(`Altes Logo (${oldLogoPath}) konnte nicht gelöscht werden, DB wurde aber aktualisiert.`);
             }
        }
        return updatedProfile;
    };

    await toast.promise(savePromise(), {
        loading: 'Änderungen werden gespeichert...',
        success: (updatedData: any) => { // Use 'any' to avoid type conflict on partial return
            setProfileData(prev => ({ 
              ...prev, 
              logo_url: updatedData.logo_url, 
              primary_color: updatedData.primary_color, 
              secondary_color: updatedData.secondary_color 
            }));
            setLogoFile(null);
            setLogoPreviewUrl(updatedData.logo_url);
            setIsRemovingLogo(false);
            setOriginalSlug(profileData.slug);
            return 'Einstellungen erfolgreich gespeichert!';
        },
        error: (err: any) => {
             if (err.message.includes("bereits vergeben")) setSlugStatus('taken');
             return err.message || "Speichern fehlgeschlagen.";
        }
    });
    setSaving(false);
  };

  // === Handle Logout Function ===
  const handleLogout = async () => {
    setLogoutLoading(true);
    await toast.promise(
        supabase.auth.signOut(),
        { loading: 'Abmelden...',
          success: () => { console.log("Logout successful"); router.push('/'); router.refresh(); return 'Erfolgreich abgemeldet.'; },
          error: (err) => { console.error("Logout error:", err); setLogoutLoading(false); return `Abmeldung fehlgeschlagen: ${err.message}`; } }
    );
  };

  // --- Functions for Account Management ---
  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Passwort muss mindestens 6 Zeichen lang sein.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein.");
      return;
    }
    
    setIsSavingPassword(true);
    
    const passwordPromise = async () => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    };

    await toast.promise(passwordPromise(), {
      loading: 'Passwort wird geändert...',
      success: () => {
        setNewPassword('');
        setConfirmPassword('');
        setIsSavingPassword(false);
        return 'Passwort erfolgreich geändert!';
      },
      error: (err: any) => {
        setIsSavingPassword(false);
        return `Fehler: ${err.message}`;
      }
    });
  };
  
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);

    const deletePromise = async () => {
      const response = await fetch('/api/delete-user', {
        method: 'DELETE'
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Löschen des Kontos.');
      }
    };

    try {
      await toast.promise(
        deletePromise(),
        {
          loading: 'Konto wird unwiderruflich gelöscht...',
          success: 'Konto erfolgreich gelöscht. Sie werden weitergeleitet.',
          error: (err: any) => {
            return `Fehler: ${err.message}`; 
          }
        }
      );
      window.location.href = '/'; 
    } catch (error) {
      console.error("Delete account failed:", error);
      setIsDeletingAccount(false);
      setShowDeleteModal(false);
    }
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
        <div className="mt-8 max-w-2xl space-y-8 divide-y divide-slate-700">
          
           {/* --- Profile Information Form --- */}
           {/* We wrap all profile/design/legal sections in one form */}
           <form onSubmit={handleSaveProfile} className="space-y-8">
             
             {/* Profile Section */}
             <section className="pt-8 first:pt-0">
                <h2 className="text-xl font-semibold text-white mb-6">Unternehmensprofil</h2>
                <div className="space-y-6">
                  {/* Business Name */}
                  <div>
                    <label htmlFor="business_name" className="mb-2 block text-sm font-medium text-slate-300"> Name des Betriebs * </label>
                    <input type="text" id="business_name" name="business_name" value={profileData.business_name} onChange={handleInputChange} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"/>
                  </div>
                  {/* Slug */}
                  <div>
                    <label htmlFor="slug" className="mb-2 block text-sm font-medium text-slate-300"> Ihr Webseiten-Pfad (Slug) * </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 sm:text-sm"> IhreDomain.de/ </span>
                        <input type="text" id="slug" name="slug" value={profileData.slug} onChange={handleInputChange} required aria-describedby="slug-description slug-status-settings" style={{ paddingLeft: `${Math.max(60, 'IhreDomain.de/'.length * 7 + 12)}px` }} className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="z.b. tischlerei-mustermann"/>
                        <div id="slug-status-settings" className="absolute inset-y-0 right-0 flex items-center pr-3"> {slugStatus === 'checking' && <ArrowPathIcon className="h-5 w-5 text-gray-400" />} {slugStatus === 'available' && <CheckIcon className="h-5 w-5 text-green-500" />} {(slugStatus === 'taken' || slugStatus === 'invalid') && <span className="text-red-500 text-xl font-bold">!</span>} </div>
                    </div>
                    <p id="slug-description" className="mt-1 text-xs text-slate-500"> Dies wird Teil Ihrer Webseiten-URL (nur Kleinbuchstaben, Zahlen und Bindestriche). Muss eindeutig sein. </p>
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
                  {/* Services */}
                  <div>
                    <label htmlFor="services_description" className="mb-2 block text-sm font-medium text-slate-300"> Kurze Beschreibung Ihrer Leistungen * </label>
                    <div className="relative"> <textarea id="services_description" name="services_description" value={profileData.services_description} onChange={handleInputChange} rows={4} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28"/> <button type="button" onClick={() => handleGenerateProfileText('services')} disabled={aiLoading === 'services' || !profileData.business_name} className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${ aiLoading === 'services' || !profileData.business_name ? 'bg-slate-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} > <SparklesIcon className={`h-4 w-4 ${aiLoading === 'services' ? 'animate-spin' : ''}`} /> {aiLoading === 'services' ? 'Generiere...' : 'Generieren'} </button> </div>
                    <p className="mt-1 text-xs text-slate-500">Tipp: Jede Leistung in eine neue Zeile (z.B. "Service A: Beschreibung A").</p>
                  </div>
                  {/* About */}
                  <div>
                    <label htmlFor="about_text" className="mb-2 block text-sm font-medium text-slate-300"> Über Ihren Betrieb * </label>
                    <div className="relative"> <textarea id="about_text" name="about_text" value={profileData.about_text} onChange={handleInputChange} rows={5} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28"/> <button type="button" onClick={() => handleGenerateProfileText('about')} disabled={aiLoading === 'about' || !profileData.business_name} className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${ aiLoading === 'about' || !profileData.business_name ? 'bg-slate-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} > <SparklesIcon className={`h-4 w-4 ${aiLoading === 'about' ? 'animate-spin' : ''}`} /> {aiLoading === 'about' ? 'Generiere...' : 'Generieren'} </button> </div>
                  </div>
                </div>
             </section>

             {/* Website Appearance Section */}
             <section className="pt-8">
               <h2 className="text-xl font-semibold text-white mb-6">Webseiten-Design</h2>
               <div className="space-y-6">
                 {/* Logo */}
                 <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Logo</label>
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-16 w-32 flex items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-500 overflow-hidden"> {logoPreviewUrl ? ( <img src={logoPreviewUrl} alt="Logo Vorschau" className="h-full w-full object-contain" /> ) : ( <PhotoIcon className="h-8 w-8" /> )} </div>
                        <div className="flex-grow"> <input type="file" id="logoUpload" accept="image/png, image/jpeg, image/webp, image/svg+xml, image/gif" onChange={handleLogoChange} className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-slate-800"/> {profileData.logo_url && !isRemovingLogo && ( <button type="button" onClick={handleLogoRemoveIntent} className="mt-2 inline-flex items-center gap-x-1 text-xs text-red-400 hover:text-red-300"> <TrashIcon className="h-3 w-3" /> Aktuelles Logo entfernen </button> )} {isRemovingLogo && ( <p className="mt-2 text-xs text-yellow-400">Logo wird beim Speichern entfernt.</p> )} </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Empfohlen: Transparentes PNG oder SVG. Max. 2MB.</p>
                 </div>
                 {/* Primary Color */}
                 <div>
                    <label htmlFor="primary_color" className="mb-2 block text-sm font-medium text-slate-300">Primärfarbe</label>
                    <div className="flex items-center gap-3"> <input type="color" id="primary_color" name="primary_color" value={profileData.primary_color} onChange={handleInputChange} className="h-10 w-10 p-0 border-0 rounded-md cursor-pointer bg-slate-800 focus:ring-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800"/> <input type="text" value={profileData.primary_color} onChange={handleInputChange} name="primary_color" className="w-24 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="#ea580c"/> </div>
                    <p className="mt-1 text-xs text-slate-500">Wird für Buttons und Akzente verwendet.</p>
                 </div>
                 {/* Secondary Color */}
                 <div>
                    <label htmlFor="secondary_color" className="mb-2 block text-sm font-medium text-slate-300">Sekundärfarbe</label>
                    <div className="flex items-center gap-3"> <input type="color" id="secondary_color" name="secondary_color" value={profileData.secondary_color} onChange={handleInputChange} className="h-10 w-10 p-0 border-0 rounded-md cursor-pointer bg-slate-800 focus:ring-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800"/> <input type="text" value={profileData.secondary_color} onChange={handleInputChange} name="secondary_color" className="w-24 rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="#475569"/> </div>
                    <p className="mt-1 text-xs text-slate-500">Wird für Hintergründe oder weniger prominente Elemente verwendet.</p>
                 </div>
               </div>
             </section>

             {/* --- Legal Texts Section --- */}
             {/* This section is part of the SAME form */}
             <section className="pt-8">
                <h2 className="text-xl font-semibold text-white mb-6">Rechtstexte</h2>
                <div className="space-y-6">
                  {/* Impressum Text Area */}
                   <div>
                      <label htmlFor="impressum_text" className="mb-2 block text-sm font-medium text-slate-300"> Impressum Text </label>
                      <textarea id="impressum_text" name="impressum_text" value={profileData.impressum_text || ''} onChange={handleInputChange} rows={10} className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="Fügen Sie hier den vollständigen Text Ihres Impressums ein..."/>
                      <p className="mt-1 text-xs text-slate-500">Dieser Text wird auf Ihrer /impressum Seite angezeigt.</p>
                   </div>
                   {/* Datenschutz Text Area */}
                   <div>
                      <label htmlFor="datenschutz_text" className="mb-2 block text-sm font-medium text-slate-300"> Datenschutzerklärung Text </label>
                       <div className="rounded-md bg-yellow-900/50 border border-yellow-700 p-3 mb-2"> <p className="text-xs text-yellow-200"> <strong>Hinweis:</strong> Die folgende Vorlage deckt nur die von ArtisanCMS bereitgestellten Dienste (Hosting, E-Mail) ab. Sie sind **rechtlich verpflichtet**, diese Vorlage zu prüfen und alle zusätzlichen Dienste (z.B. Google Maps, YouTube, Calendly, Analyse-Tools) hinzuzufügen, die Sie selbst einbetten. </p> </div>
                      <textarea id="datenschutz_text" name="datenschutz_text" value={profileData.datenschutz_text || ''} onChange={handleInputChange} rows={10} className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="Fügen Sie hier den vollständigen Text Ihrer Datenschutzerklärung ein..."/>
                      <p className="mt-1 text-xs text-slate-500">Dieser Text wird auf Ihrer /datenschutz Seite angezeigt.</p>
                   </div>
                </div>
             </section>

             {/* Combined Save Button for All Settings */}
             <div className="pt-8 flex justify-end">
                 <button type="submit" disabled={saving || !!aiLoading || slugStatus !== 'available'} className={`inline-flex items-center gap-x-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${ saving || !!aiLoading || slugStatus !== 'available' ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' }`} >
                      {saving ? <ArrowPathIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
                      {saving ? 'Wird gespeichert...' : 'Alle Einstellungen speichern'}
                 </button>
             </div>
           </form>
           
           {/* --- Account Security Section --- */}
           {/* These are separate forms, so they are outside the main <form> */}
           <section className="pt-8">
              <h2 className="text-xl font-semibold text-white mb-6">Konto & Sicherheit</h2>
              {/* Change Password Form */}
              <form onSubmit={handleChangePassword} className="space-y-4 p-6 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-base font-medium text-white">Passwort ändern</h3>
                <div>
                  <label htmlFor="newPassword" className="mb-2 block text-sm font-medium text-slate-300">Neues Passwort</label>
                  <input 
                    type="password" id="newPassword" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)}
                    required minLength={6}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" 
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-300">Neues Passwort bestätigen</label>
                  <input 
                    type="password" id="confirmPassword" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required minLength={6}
                    className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" 
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={isSavingPassword || !newPassword || !confirmPassword} className="inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-50">
                    {isSavingPassword ? <ArrowPathIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
                    {isSavingPassword ? 'Wird gespeichert...' : 'Passwort speichern'}
                  </button>
                </div>
              </form>
              
              {/* Account Info & Logout */}
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 mt-8">
                <h3 className="text-base font-medium text-white">Konto-Info</h3>
                <dl className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-slate-400">Email</dt>
                    <dd className="text-sm text-white">{currentUser?.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-slate-400">Benutzer-ID</dt>
                    <dd className="text-xs text-slate-500">{currentUser?.id}</dd>
                  </div>
                </dl>
                <div className="border-t border-slate-700 mt-4 pt-4">
                  <button type="button" onClick={handleLogout} disabled={logoutLoading} className={`inline-flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${ logoutLoading ? 'bg-slate-600 cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600' }`} >
                    <ArrowRightStartOnRectangleIcon className={`h-5 w-5 ${logoutLoading ? 'animate-spin' : ''}`} />
                    {logoutLoading ? 'Abmelden...' : 'Abmelden'}
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 bg-red-900/20 rounded-lg border border-red-500/30 mt-8">
                <h3 className="text-base font-semibold text-red-300">Danger Zone</h3>
                <p className="text-sm text-red-300/80 mt-2">
                  Das Löschen Ihres Kontos ist endgültig. Alle Ihre Daten, einschließlich Ihres Profils, 
                  Ihrer Projekte, Kundenstimmen und Anfragen, werden unwiderruflich entfernt.
                </p>
                <div className="mt-4">
                  <button type="button" onClick={() => setShowDeleteModal(true)} disabled={isDeletingAccount} className="inline-flex items-center gap-x-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-50">
                    {isDeletingAccount ? <ArrowPathIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />}
                    {isDeletingAccount ? 'Wird gelöscht...' : 'Konto unwiderruflich löschen'}
                  </button>
                </div>
              </div>
           </section>

           {/* Subscription Section (Placeholder) */}
            <section className="pt-8">
              <h2 className="text-xl font-semibold text-white mb-4">Abonnement</h2>
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-sm text-slate-400">Aktueller Plan: <span className="text-white font-medium">Beta-Test</span></p>
                <p className="mt-4 text-xs text-slate-500">Die Abonnementverwaltung wird in Kürze verfügbar sein.</p>
              </div>
            </section>
        </div>
      )}
      
      {/* Confirmation Modal for Account Deletion */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Konto unwiderruflich löschen?"
        message="Sind Sie sicher? Alle Ihre Daten (Webseite, Projekte, etc.) werden sofort und endgültig gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
        confirmText="Ja, mein Konto löschen"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        isConfirming={isDeletingAccount}
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
      />
    </main>
  );
}