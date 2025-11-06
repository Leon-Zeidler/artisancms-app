"use client";

import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';

// --- TYPE DEFINITIONS ---
type Profile = {
  id: string;
  business_name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  logo_storage_path: string | null;
  keywords: string | null;
  services_description: string | null;
  about_text: string | null;
  impressum_text: string | null;
  datenschutz_text: string | null;
  is_published: boolean;
  show_services_section: boolean;
  show_team_page: boolean;
  show_testimonials_page: boolean;
};

// --- ICONS ---
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> </svg> );
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"> <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> </svg> );
const LockClosedIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /> </svg> );
const AtSymbolIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" /> </svg> );

// --- REUSABLE COMPONENTS ---
const ColorInput = ({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: ChangeEvent<HTMLInputElement>) => void }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300">{label}</label>
    <div className="mt-2 flex items-center gap-3">
      <input type="color" name={name} id={name} value={value || '#000000'} onChange={onChange} className="h-10 w-10 p-0 m-0 border-none rounded cursor-pointer bg-slate-800" />
      <input type="text" value={value || ''} onChange={onChange} className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 sm:text-sm" placeholder="#F97316" />
    </div>
  </div>
);

const LogoUploader = ({ logoUrl, onFileChange, onRemoveLogo, isUploading }: { logoUrl: string | null, onFileChange: (e: ChangeEvent<HTMLInputElement>) => void, onRemoveLogo: () => void, isUploading: boolean }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300">Logo</label>
    <div className="mt-2 flex items-center gap-4">
      <div className="flex-shrink-0 h-16 w-32 flex items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-500 overflow-hidden">
        {logoUrl ? <img src={logoUrl} alt="Logo preview" className="h-full w-full object-contain" /> : <span className="text-xs">Vorschau</span>}
      </div>
      <div className="flex-grow space-y-2">
        <input type="file" id="logoUpload" accept="image/png, image/jpeg, image/webp" onChange={onFileChange} disabled={isUploading} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-slate-800" />
        {logoUrl && <button type="button" onClick={onRemoveLogo} disabled={isUploading} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">Logo entfernen</button>}
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
    <div className="px-6 py-5 border-b border-slate-700">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
    <div className="p-6 space-y-6">
      {children}
    </div>
  </div>
);

const SettingsInput = ({ label, name, value, onChange, placeholder, type = 'text', rows = 3 }: { label: string, name: string, value: string, onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, placeholder?: string, type?: string, rows?: number }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-300">{label}</label>
    {type === 'textarea' ? (
      <textarea name={name} id={name} rows={rows} value={value} onChange={onChange} className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder={placeholder} />
    ) : (
      <input type={type} name={name} id={name} value={value} onChange={onChange} className="mt-2 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder={placeholder} />
    )}
  </div>
);

const SettingsToggle = ({ label, description, name, isChecked, onChange, disabled = false }: { label: string, description: string, name: string, isChecked: boolean, onChange: (e: ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }) => (
  <div className={`flex items-center justify-between ${disabled ? 'opacity-60' : ''}`}>
    <span className="flex flex-grow flex-col">
      <span className={`text-sm font-medium ${disabled ? 'text-slate-500' : 'text-slate-300'}`}>{label}</span>
      <span className="text-xs text-slate-500">{description}</span>
    </span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className={`w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-orange-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 ${disabled ? 'cursor-not-allowed' : ''}`}></div>
    </label>
  </div>
);


// --- DangerZone Component (with Publish Guard) ---
function DangerZone({ profile, user, onUpdateProfile }: { profile: Profile | null, user: User | null, onUpdateProfile: (updatedProfile: Profile) => void }) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const router = useRouter();
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  if (!user || !profile) return null;

  const isPublished = profile.is_published;
  
  const hasImpressum = profile.impressum_text && profile.impressum_text.trim().length > 10;
  const hasDatenschutz = profile.datenschutz_text && profile.datenschutz_text.trim().length > 10;
  const canPublish = hasImpressum && hasDatenschutz;

  const handlePublishToggle = async () => {
    const newStatus = !isPublished;
    if (newStatus && !canPublish) {
      toast.error("Bitte füllen Sie Impressum und Datenschutz aus, um die Seite zu veröffentlichen.");
      return;
    }

    setIsPublishing(true);
    const toastId = toast.loading(newStatus ? 'Website wird veröffentlicht...' : 'Veröffentlichung wird zurückgezogen...');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_published: newStatus })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;

      onUpdateProfile(data as Profile);
      toast.success(newStatus ? 'Website ist jetzt live!' : 'Website ist jetzt offline.', { id: toastId });
    } catch (err: any) {
      toast.error(`Fehler: ${err.message}`, { id: toastId });
    }
    setIsPublishing(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const { error } = await supabase.rpc('delete_user_account');
    if (error) {
      toast.error(`Fehler beim Löschen: ${error.message}`);
      setIsDeleting(false);
    } else {
      toast.success("Konto wird gelöscht. Sie werden abgemeldet.");
      router.push('/login');
    }
  };

  return (
    <>
      <SectionCard
        title="Gefahrenzone"
        description="Wichtige Aktionen mit dauerhaften Konsequenzen."
      >
        {/* Publish UI */}
        <div className="space-y-4 rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-base font-semibold text-white">Website veröffentlichen</h4>
              <p className="mt-1 text-sm text-slate-400">
                Machen Sie Ihre Webseite unter Ihrem Link öffentlich sichtbar.
              </p>
              {!canPublish && (
                <p className="mt-2 text-xs text-yellow-400 flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                  <span>Zum Veröffentlichen müssen Impressum & Datenschutz ausgefüllt sein.</span>
                </p>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={handlePublishToggle}
                disabled={isPublishing || (!isPublished && !canPublish)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-orange-500 peer-focus:ring-offset-2 peer-focus:ring-offset-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
            </label>
          </div>
        </div>

        {/* Delete Account UI */}
        <div className="space-y-4 rounded-lg border border-red-900/50 bg-red-900/20 p-4">
          <div>
            <h4 className="text-base font-semibold text-red-300">Konto löschen</h4>
            <p className="mt-1 text-sm text-slate-400">
              Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden. Alle Ihre Daten, Projekte und Einstellungen werden dauerhaft gelöscht.
            </p>
          </div>
          <div className="text-right">
            <button
              type="button"
              onClick={() => setConfirmDeleteModal(true)}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
            >
              Konto löschen
            </button>
          </div>
        </div>
      </SectionCard>

      <ConfirmationModal
        isOpen={confirmDeleteModal}
        title="Konto unwiderruflich löschen?"
        message="Sind Sie absolut sicher? Alle Ihre Daten, Projekte, Bilder und Einstellungen werden dauerhaft entfernt. Diese Aktion kann nicht rückgängig gemacht werden."
        confirmText="Ja, mein Konto löschen"
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDeleteModal(false)}
        isConfirming={isDeleting}
      />
    </>
  );
}


// --- MAIN PAGE COMPONENT ---
export default function EinstellungenPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  
  // --- FIX 1: Update Omit type ---
  const [formData, setFormData] = useState<Omit<Profile, 'id' | 'logo_url' | 'logo_storage_path'>>({
    business_name: '',
    address: '',
    phone: '',
    email: '', // <-- Added email
    primary_color: '#F97316',
    secondary_color: '#F8FAFC',
    keywords: '',
    services_description: '',
    about_text: '',
    impressum_text: '',
    datenschutz_text: '',
    is_published: false,
    show_services_section: true,
    show_team_page: true,
    show_testimonials_page: true,
  });

  const router = useRouter();

  // --- Fetch data ---
  useEffect(() => {
    const getUserAndProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*') // Fetch all columns
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // 'PGRST116' = no rows found
        toast.error(`Profil-Fehler: ${error.message}`);
      } else if (profileData) {
        setProfile(profileData as Profile);
        // --- FIX 2: Set all fields in formData ---
        setFormData({
          business_name: profileData.business_name || '',
          address: profileData.address || '',
          phone: profileData.phone || '',
          email: profileData.email || '', // <-- Added email
          primary_color: profileData.primary_color || '#F97316',
          secondary_color: profileData.secondary_color || '#F8FAFC',
          keywords: profileData.keywords || '',
          services_description: profileData.services_description || '',
          about_text: profileData.about_text || '',
          impressum_text: profileData.impressum_text || '',
          datenschutz_text: profileData.datenschutz_text || '',
          is_published: profileData.is_published || false,
          show_services_section: profileData.show_services_section ?? true,
          show_team_page: profileData.show_team_page ?? true,
          show_testimonials_page: profileData.show_testimonials_page ?? true,
        });
      }
      setLoading(false);
    };
    getUserAndProfile();
  }, [router, supabase]);

  // --- Handle form input changes ---
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox (toggle)
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      // Handle text, color, textarea
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Handle Save Profile ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    
    // This now saves all fields in formData
    const { error, data: updatedProfile } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', currentUser.id)
      .select()
      .single();
    
    setSaving(false);
    if (error) {
      toast.error(`Fehler: ${error.message}`);
    } else {
      setProfile(updatedProfile as Profile); // Update local profile state
      toast.success("Einstellungen gespeichert!");
    }
  };

  // --- Handle Logo Upload ---
  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !currentUser || !profile) return;
    const file = e.target.files[0];
    setIsUploading(true);
    const toastId = toast.loading('Logo wird hochgeladen...');

    if (profile.logo_storage_path) {
      await supabase.storage.from('logos').remove([profile.logo_storage_path]);
    }

    const filePath = `${currentUser.id}/${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(filePath, file);

    if (uploadError) {
      toast.error(`Upload-Fehler: ${uploadError.message}`, { id: toastId });
      setIsUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(uploadData.path);
    const newLogoUrl = urlData.publicUrl;

    const { data: updatedProfile, error: dbError } = await supabase
      .from('profiles')
      .update({ logo_url: newLogoUrl, logo_storage_path: uploadData.path })
      .eq('id', currentUser.id)
      .select()
      .single();

    if (dbError) {
      toast.error(`DB-Fehler: ${dbError.message}`, { id: toastId });
    } else {
      setProfile(updatedProfile as Profile);
      toast.success('Logo erfolgreich hochgeladen!', { id: toastId });
    }
    setIsUploading(false);
  };

  // --- Handle Logo Removal ---
  const handleRemoveLogo = async () => {
    if (!currentUser || !profile || !profile.logo_storage_path) return;
    setIsUploading(true);
    const toastId = toast.loading('Logo wird entfernt...');

    const { error: storageError } = await supabase.storage.from('logos').remove([profile.logo_storage_path]);
    if (storageError) {
      toast.error(`Storage-Fehler: ${storageError.message}`, { id: toastId });
      setIsUploading(false); return;
    }

    const { data: updatedProfile, error: dbError } = await supabase
      .from('profiles')
      .update({ logo_url: null, logo_storage_path: null })
      .eq('id', currentUser.id)
      .select()
      .single();
    
    if (dbError) {
      toast.error(`DB-Fehler: ${dbError.message}`, { id: toastId });
    } else {
      setProfile(updatedProfile as Profile);
      toast.success('Logo entfernt.', { id: toastId });
    }
    setIsUploading(false);
  };
  
  // --- Handle Change Email ---
  const handleChangeEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!newEmail || !currentUser || newEmail === currentUser.email) {
      toast.error("Bitte geben Sie eine neue, andere E-Mail-Adresse ein.");
      return;
    }

    setIsChangingEmail(true);
    const toastId = toast.loading("E-Mail-Änderung wird eingeleitet...");

    const { data, error } = await supabase.auth.updateUser(
      { email: newEmail }
    );

    setIsChangingEmail(false);
    
    if (error) {
      toast.error(`Fehler: ${error.message}`, { id: toastId });
    } else {
      setNewEmail('');
      toast.success(
        "Bitte Posteingang prüfen! Wir haben eine Bestätigungs-E-Mail an Ihre ALTE und NEUE Adresse gesendet. Sie müssen beide bestätigen.",
        { id: toastId, duration: 10000 }
      );
    }
  };
  
  // --- Callback to update local profile state ---
  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    // Also update formData to match
    setFormData(prev => ({...prev, is_published: updatedProfile.is_published }));
  };

  if (loading) {
    return <div className="p-8 text-slate-400">Lade Einstellungen...</div>;
  }

  // === Render Page ===
  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Einstellungen</h1>
          <p className="text-slate-400 mt-1">Verwalten Sie hier Ihre globalen Webseiten-Einstellungen.</p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={saving || isUploading}
          className="inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50"
        >
          {saving ? <ArrowPathIcon /> : <CheckIcon className="h-5 w-5" />}
          {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <SectionCard
            title="Firmendaten"
            description="Diese Informationen werden auf Ihrer Webseite (z.B. im Impressum) angezeigt."
          >
            {/* --- FIX 3: Add ?? '' to all values --- */}
            <SettingsInput label="Firmenname" name="business_name" value={formData.business_name ?? ''} onChange={handleFormChange} placeholder="z.B. Max Mustermann GmbH" />
            <SettingsInput label="Adresse" name="address" value={formData.address ?? ''} onChange={handleFormChange} placeholder="z.B. Musterstraße 1, 12345 Musterstadt" type="textarea" rows={3} />
            <SettingsInput label="Telefon" name="phone" value={formData.phone ?? ''} onChange={handleFormChange} placeholder="z.B. 01234 567890" />
            <SettingsInput label="E-Mail (Öffentlich)" name="email" value={formData.email ?? ''} onChange={handleFormChange} placeholder="z.B. info@mustermann.de" />
          </SectionCard>

          <SectionCard
            title="Webseiten-Branding & Inhalte"
            description="Passen Sie das Aussehen Ihrer Webseite an."
          >
            {/* --- FIX 4: Add ?? 'default' to color values --- */}
            <ColorInput label="Primärfarbe (Brand)" name="primary_color" value={formData.primary_color ?? '#F97316'} onChange={handleFormChange} />
            <ColorInput label="Sekundärfarbe (Hintergrund)" name="secondary_color" value={formData.secondary_color ?? '#F8FAFC'} onChange={handleFormChange} />
            <LogoUploader 
              logoUrl={profile?.logo_url || null}
              onFileChange={handleLogoUpload}
              onRemoveLogo={handleRemoveLogo}
              isUploading={isUploading}
            />
            <hr className="border-slate-700" />
            <SettingsToggle
              label="Leistungen anzeigen"
              description="Zeigt den 'Leistungen' Abschnitt auf Ihrer Startseite."
              name="show_services_section"
              isChecked={formData.show_services_section}
              onChange={handleFormChange}
            />
            <SettingsToggle
              label="'Über Uns' Seite anzeigen"
              description="Zeigt den 'Über Uns' Link in der Navigation."
              name="show_team_page"
              isChecked={formData.show_team_page}
              onChange={handleFormChange}
            />
            <SettingsToggle
              label="'Kundenstimmen' Seite anzeigen"
              description="Zeigt den 'Kundenstimmen' Link in der Navigation."
              name="show_testimonials_page"
              isChecked={formData.show_testimonials_page}
              onChange={handleFormChange}
            />
          </SectionCard>
          
          <SectionCard
            title="Rechtliches"
            description="WICHTIG: Diese Texte sind für den Betrieb einer Webseite in Deutschland gesetzlich vorgeschrieben."
          >
            {/* --- FIX 5: Add ?? '' to legal values --- */}
            <SettingsInput label="Impressum" name="impressum_text" value={formData.impressum_text ?? ''} onChange={handleFormChange} placeholder="Fügen Sie hier Ihr Impressum ein..." type="textarea" rows={10} />
            <SettingsInput label="Datenschutzerklärung" name="datenschutz_text" value={formData.datenschutz_text ?? ''} onChange={handleFormChange} placeholder="Fügen Sie hier Ihre Datenschutzerklärung ein..." type="textarea" rows={10} />
          </SectionCard>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-8">
          <SectionCard
            title="SEO & AI-Inhalte"
            description="Helfen Sie der AI, bessere Texte für Sie zu generieren."
          >
            {/* --- FIX 6: Add ?? '' to SEO values --- */}
            <SettingsInput label="Wichtige Keywords" name="keywords" value={formData.keywords ?? ''} onChange={handleFormChange} placeholder="z.B. Badsanierung, Heizung, Fliesenleger, Dresden..." type="textarea" rows={3} />
            <SettingsInput label="Leistungsbeschreibung" name="services_description" value={formData.services_description ?? ''} onChange={handleFormChange} placeholder="Eine Zeile pro Leistung, z.B. Sanitär: Installation und Reparatur..." type="textarea" rows={6} />
            <SettingsInput label="Über Uns Text" name="about_text" value={formData.about_text ?? ''} onChange={handleFormChange} placeholder="Ein kurzer Text über Ihre Firma, Ihre Werte und Ihre Geschichte..." type="textarea" rows={6} />
          </SectionCard>
          
          <SectionCard
            title="Account-Sicherheit"
            description="Ändern Sie hier Ihre E-Mail-Adresse für den Login."
          >
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Aktuelle Login-E-Mail</label>
                <p className="mt-2 text-sm text-slate-400 font-medium">{currentUser?.email}</p>
              </div>
              <div>
                <label htmlFor="newEmail" className="block text-sm font-medium text-slate-300">Neue E-Mail-Adresse</label>
                <div className="relative mt-2">
                  <input type="email" name="newEmail" id="newEmail" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 pl-10 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" placeholder="neue-email@beispiel.de" />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><AtSymbolIcon className="h-5 w-5 text-slate-500" /></div>
                </div>
              </div>
              <div className="text-right">
                <button type="submit" disabled={isChangingEmail || !newEmail} className="inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-50">
                  {isChangingEmail ? <ArrowPathIcon /> : <CheckIcon className="h-5 w-5" />}
                  {isChangingEmail ? 'Wird gespeichert...' : 'E-Mail ändern'}
                </button>
              </div>
            </form>
          </SectionCard>

          <DangerZone 
            profile={profile} 
            user={currentUser}
            onUpdateProfile={handleProfileUpdate}
          />
        </div>

      </div>
    </main>
  );
}