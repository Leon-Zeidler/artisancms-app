"use client";

import React, { useState, useEffect, useMemo, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import { INDUSTRY_OPTIONS, resolveIndustry, type Industry, INDUSTRY_TEMPLATES, formatDefaultServices } from '@/lib/industry-templates';
import { DATENSCHUTZERKLAERUNG_TEMPLATE, IMPRESSUM_TEMPLATE } from '@/lib/legalTemplates'; 
import { DynamicGlobalStyles } from '@/components/DynamicGlobalStyles'; // <--- WICHTIG: Sicherstellen, dass dies importiert ist

// --- TYPE DEFINITIONS ---
type Profile = {
  id: string;
  business_name: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  industry: Industry | null;
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
  slug: string | null; 
};

type AIGenerationType = 'services' | 'about';

// --- ICONS ---
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> </svg> );
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"> <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> </svg> );
const LockClosedIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /> </svg> );
const AtSymbolIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" /> </svg> );
const BuildingOfficeIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18m-1.5-18h-12a1.5 1.5 0 00-1.5 1.5v16.5a1.5 1.5 0 001.5 1.5h12a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5zM9 9h6v2H9V9z" /></svg>);
const PaintBrushIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.450a4.5 4.5 0 008.9-2.766 3 3 0 00-1.72-2.812zM9.53 16.122a3 3 0 00.315-5.942a3 3 0 012.836-2.836a3 3 0 005.942-.315c0-1.606 1.488-2.659 2.96-2.659a2.25 2.25 0 012.4 2.45a4.5 4.5 0 00-2.767 8.901 3 3 0 00-2.81 1.721 3 3 0 01-2.836 2.836a3 3 0 00-5.942.315c-1.606 0-2.659-1.488-2.659-2.96z" /></svg>);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" /></svg>);
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.24-.32 2.395-.88 3.428l-6.118 6.118-6.117-6.118C3.32 14.395 3 13.24 3 12c0-5.188 4.5-9.428 9-9.428s9 4.24 9 9.428z" /></svg>);
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );


// --- MODAL KOMPONENTE (Datenschutz) ---
const LegalWarningModal = ({ isOpen, onConfirm, onCancel }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void }) => {
  if (!isOpen) return null;

  const warningText = `Dies ist eine automatisch generierte Vorlage. Sie als Webseitenbetreiber sind rechtlich dafür verantwortlich, diese Angaben zu prüfen, zu vervollständigen (insbesondere Ihre eigenen Kontaktdaten unter "Verantwortlicher") und anwaltlich prüfen zu lassen. Sie müssen ebenfalls alle Dienste hinzufügen, die Sie selbst einbetten (z.B. Google Maps, YouTube, Calendly, etc.).`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 shadow-2xl shadow-red-200/40">
            <div className="flex items-start">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="ml-4">
                    <h3 className="text-xl font-bold leading-6 text-slate-900">Wichtiger Rechtlicher Hinweis</h3>
                    <div className="mt-4">
                        <p className="text-sm leading-6 text-red-700 whitespace-pre-line">{warningText}</p>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                    Abbrechen
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="inline-flex items-center rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-500"
                >
                    Ich habe verstanden & Vorlage einfügen
                </button>
            </div>
        </div>
    </div>
  );
};

// --- MODAL KOMPONENTE (Impressum & Datenschutz Autofill) ---
const LegalAutofillWarningModal = ({ isOpen, onConfirm, onCancel }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
        <div className="w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-8 shadow-2xl shadow-amber-200/40">
            <div className="flex items-start">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <ExclamationTriangleIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="ml-4">
                    <h3 className="text-xl font-bold leading-6 text-slate-900">Rechtstexte überschreiben?</h3>
                    <div className="mt-4">
                        <p className="text-sm leading-6 text-slate-700">
                          Sind Sie sicher? Diese Aktion **überschreibt** Ihre aktuellen Inhalte in den Feldern "Impressum" und "Datenschutz" mit den automatischen Vorlagen.
                        </p>
                        <p className="mt-2 text-sm font-semibold text-red-600">
                          Bestehende Texte gehen dabei verloren!
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                    Abbrechen
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                >
                    Ja, Texte überschreiben
                </button>
            </div>
        </div>
    </div>
  );
};


// --- REUSABLE COMPONENTS ---
const ColorInput = ({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 sm:pt-2">{label}</label>
    <div className="flex items-center gap-3">
      <input
        type="color"
        name={name}
        id={name}
        value={value || '#ffffff'}
        onChange={onChange}
        className="h-10 w-10 cursor-pointer rounded border border-slate-200 bg-white shadow-sm"
      />
      <input
        type="text"
        value={value || ''}
        onChange={onChange}
        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        placeholder="#F97316"
      />
    </div>
  </div>
);

const LogoUploader = ({ logoUrl, onFileChange, onRemoveLogo, isUploading }: { logoUrl: string | null, onFileChange: (e: ChangeEvent<HTMLInputElement>) => void, onRemoveLogo: () => void, isUploading: boolean }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <label className="block text-sm font-medium text-slate-600 sm:pt-2">Logo</label>
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white text-slate-400 shadow-sm">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="Logo preview"
            width={128}
            height={64}
            className="h-full w-full object-contain"
            unoptimized
          />
        ) : (
          <span className="text-xs">Vorschau</span>
        )}
      </div>
      <div className="flex-grow space-y-2">
        <input
          type="file"
          id="logoUpload"
          accept="image/png, image/jpeg, image/webp"
          onChange={onFileChange}
          disabled={isUploading}
          className="w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-700 hover:file:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
        {logoUrl && (
          <button
            type="button"
            onClick={onRemoveLogo}
            disabled={isUploading}
            className="text-xs font-semibold text-red-500 transition hover:text-red-400 disabled:opacity-50"
          >
            Logo entfernen
          </button>
        )}
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => (
  <div className="rounded-2xl border border-orange-100 bg-white/90 shadow-xl shadow-orange-100/40">
    <div className="border-b border-orange-100 px-6 py-5">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </div>
    <div className="space-y-6 p-6">
      {children}
    </div>
  </div>
);

const SettingsInput = ({ label, name, value, onChange, placeholder, type = 'text', rows = 3 }: { label: string, name: string, value: string, onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void, placeholder?: string, type?: string, rows?: number }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <label htmlFor={name} className="block text-sm font-medium text-slate-600">{label}</label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        id={name}
        rows={rows}
        value={value}
        onChange={onChange}
        className="mt-0 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="mt-0 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
        placeholder={placeholder}
      />
    )}
  </div>
);

const SettingsSelect = ({ label, name, value, onChange, options, helperText }: { label: string, name: string, value: string, onChange: (e: ChangeEvent<HTMLSelectElement>) => void, options: { label: string; value: string }[], helperText?: string }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <label htmlFor={name} className="block text-sm font-medium text-slate-600">{label}</label>
    <div>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-0 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  </div>
);

// --- KORRIGIERTE TOGGLE KOMPONENTE ---
const SettingsToggle = ({ label, description, name, isChecked, onChange, disabled = false }: { label: string, description: string, name: string, isChecked: boolean, onChange: (e: ChangeEvent<HTMLInputElement>) => void, disabled?: boolean }) => (
  <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 items-center ${disabled ? 'opacity-60' : ''}`}>
    <span className="flex flex-grow flex-col">
      <span className={`text-sm font-medium ${disabled ? 'text-slate-400' : 'text-slate-600'}`}>{label}</span>
      <span className="text-xs text-slate-500">{description}</span>
    </span>
    <label className="relative inline-flex items-center cursor-pointer justify-self-end">
      <input
        type="checkbox"
        name={name}
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`h-6 w-11 rounded-full bg-slate-200 transition peer peer-focus:ring-2 peer-focus:ring-orange-200 peer-focus:ring-offset-2 peer-focus:ring-offset-white peer-checked:bg-orange-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-slate-200 after:bg-white after:transition-all peer-disabled:cursor-not-allowed ${disabled ? 'cursor-not-allowed' : ''}`}
      ></div>
    </label>
  </div>
);
// --- ENDE KORRIGIERTE TOGGLE KOMPONENTE ---


// --- DangerZone Component (mit `router` Prop) ---
function DangerZone({ profile, user, onUpdateProfile, router }: { profile: Profile | null, user: User | null, onUpdateProfile: (updatedProfile: Profile) => void, router: any }) {
  const supabase = useMemo(() => createSupabaseClient(), []);
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
    
    try {
      const response = await fetch('/api/delete-user', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ein unbekannter Fehler ist aufgetreten.');
      }
      
      toast.success("Konto wird gelöscht. Sie werden abgemeldet.");
      router.push('/login'); 
      router.refresh(); 

    } catch (err: any) {
      toast.error(`Fehler beim Löschen: ${err.message}`);
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Publish UI */}
      <SectionCard
        title="Veröffentlichung & Gefahrenzone"
        description="Wichtige Aktionen mit dauerhaften Konsequenzen."
      >
        <div className="space-y-4 rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-inner shadow-orange-100/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4 items-start justify-between gap-4">
            <div>
              <h4 className="text-base font-semibold text-slate-900">Website veröffentlichen</h4>
              <p className="mt-1 text-sm text-slate-600">
                Machen Sie Ihre Webseite unter Ihrem Link öffentlich sichtbar.
              </p>
              {!canPublish && (
                <p className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                  <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
                  <span>Zum Veröffentlichen müssen Impressum & Datenschutz ausgefüllt sein.</span>
                </p>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer sm:justify-self-end">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={handlePublishToggle}
                disabled={isPublishing || (!isPublished && !canPublish)}
                className="sr-only peer"
              />
              <div
                className={`h-6 w-11 rounded-full bg-slate-200 transition peer peer-focus:ring-2 peer-focus:ring-orange-200 peer-focus:ring-offset-2 peer-focus:ring-offset-white peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-slate-200 after:bg-white after:transition-all ${
                  isPublishing || (!isPublished && !canPublish) ? 'cursor-not-allowed opacity-60' : ''
                }`}
              ></div>
            </label>
          </div>
        </div>

        {/* Delete Account UI */}
        <div className="space-y-4 rounded-2xl border border-red-100 bg-red-50/80 p-4 shadow-inner shadow-red-100/40">
          <div>
            <h4 className="text-base font-semibold text-red-600">Konto löschen</h4>
            <p className="mt-1 text-sm text-red-600/80">
              Diese Aktion ist endgültig und kann nicht rückgängig gemacht werden. Alle Ihre Daten, Projekte und Einstellungen werden dauerhaft gelöscht.
            </p>
          </div>
          <div className="text-right">
            <button
              type="button"
              onClick={() => setConfirmDeleteModal(true)}
              disabled={isDeleting}
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-200 transition hover:bg-red-400 disabled:opacity-50"
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
  const [aiLoading, setAiLoading] = useState<AIGenerationType | null>(null); 
  const [showDatenschutzWarning, setShowDatenschutzWarning] = useState(false);
  const [showAutofillWarning, setShowAutofillWarning] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Profile, 'id' | 'logo_url' | 'logo_storage_path'>>({
    business_name: '',
    hero_title: '',
    hero_subtitle: '',
    industry: 'sonstiges',
    address: '',
    phone: '',
    email: '', 
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
    slug: null, 
  });

  const router = useRouter();
  
  // --- NEU: Helper-Funktion zum Auflösen der URL (aus Onboarding kopiert) ---
  const resolveSiteUrl = (): string | null => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (envUrl && envUrl.trim().length > 0) { return envUrl; }
    if (typeof window !== 'undefined' && window.location?.origin) { return window.location.origin; }
    return null;
  };

  // --- HINZUGEFÜGTE FUNKTION: Öffnet das Datenschutz-Modal ---
  const handleInsertDatenschutzTemplateClick = () => {
      setShowDatenschutzWarning(true);
  };
  
  // --- HINZUGEFÜGTE FUNKTION: Fügt Datenschutz-Vorlage ein nach Bestätigung ---
  const handleInsertDatenschutzTemplateConfirm = () => {
      setFormData(prev => ({ ...prev, datenschutz_text: DATENSCHUTZERKLAERUNG_TEMPLATE }));
      setShowDatenschutzWarning(false);
      toast.success("Datenschutz-Vorlage eingefügt!");
  };

  // --- NEU: Handler für das Überschreiben-Modal ---
  const handleAutofillLegalClick = () => {
    setShowAutofillWarning(true);
  };
  
  const handleAutofillLegalCancel = () => {
    setShowAutofillWarning(false);
  };

  const handleAutofillLegalConfirm = () => {
    if (!currentUser || !profile || !profile.slug) {
        toast.error("Profil oder URL-Slug nicht geladen. Speichern Sie zuerst.");
        setShowAutofillWarning(false);
        return;
    }
    
    const baseUrl = resolveSiteUrl() || ''; // Holt die Basis-URL
    const impressumLink = `${baseUrl}/${profile.slug}/impressum`;
    const datenschutzLink = `${baseUrl}/${profile.slug}/datenschutz`;
    
    // Ersetzt Platzhalter
    const impressumText = IMPRESSUM_TEMPLATE
        .replace(/\[FIRMENNAME\]/g, formData.business_name || '')
        .replace(/\[ADRESSE_MEHRZEILIG\]/g, formData.address || '')
        .replace(/\[TELEFON\]/g, formData.phone || '')
        .replace(/\[EMAIL\]/g, formData.email || '') // Nimmt die öffentliche E-Mail
        .replace(/\[DATENSCHUTZ_LINK\]/g, datenschutzLink);

    const datenschutzText = DATENSCHUTZERKLAERUNG_TEMPLATE
        .replace(/\[FIRMENNAME\]/g, formData.business_name || '')
        .replace(/\[ADRESSE_MEHRZEILIG\]/g, formData.address || '')
        .replace(/\[TELEFON\]/g, formData.phone || '')
        .replace(/\[EMAIL\]/g, formData.email || '')
        .replace(/\[IMPRESSUM_LINK\]/g, impressumLink);

    setFormData(prev => ({ 
        ...prev, 
        impressum_text: impressumText,
        datenschutz_text: datenschutzText 
    }));
    
    setShowAutofillWarning(false);
    toast.success("Impressum & Datenschutz mit Vorlagen überschrieben!");
  };
  // --- ENDE NEUE FUNKTIONEN ---


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
        .select('*') 
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        toast.error(`Profil-Fehler: ${error.message}`);
      } else if (profileData) {
        setProfile(profileData as Profile);
        setFormData({
          business_name: profileData.business_name || '',
          hero_title: profileData.hero_title || '',
          hero_subtitle: profileData.hero_subtitle || '',
          industry: resolveIndustry(profileData.industry),
          address: profileData.address || '',
          phone: profileData.phone || '',
          email: profileData.email || '', 
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
          slug: profileData.slug || null, // Slug wird geladen
        });
      }
      setLoading(false);
    };
    getUserAndProfile();
  }, [router, supabase]);

  // --- *** NEUE handleFormChange FUNKTION *** ---
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      // Check if the industry field is the one being changed
      if (name === 'industry') {
        const newIndustry = resolveIndustry(value);
        const currentServices = formData.services_description;

        // Check if the services field is empty or just whitespace
        if (!currentServices || currentServices.trim() === '') {
          // It's empty, so let's autofill it
          const newServices = formatDefaultServices(newIndustry);
          setFormData(prev => ({
            ...prev,
            industry: newIndustry,
            services_description: newServices // <-- Autofill
          }));
          // Feedback an den Nutzer geben
          toast.success(`Leistungs-Vorschläge für '${INDUSTRY_TEMPLATES[newIndustry].label}' geladen!`);
        } else {
          // It's not empty, just update the industry
          setFormData(prev => ({ ...prev, industry: newIndustry }));
        }
      } else {
        // It's some other field, just update its value
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
  };
  // --- *** ENDE NEUE handleFormChange FUNKTION *** ---


  // --- Handle Save Profile ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    
    // Entferne 'slug', da es nicht Teil des Updates sein soll
    const { slug, ...dataToUpdate } = formData;
    
    const { error, data: updatedProfile } = await supabase
      .from('profiles')
      .update(dataToUpdate)
      .eq('id', currentUser.id)
      .select()
      .single();
    
    setSaving(false);
    if (error) {
      toast.error(`Fehler: ${error.message}`);
    } else {
      setProfile(updatedProfile as Profile);
      toast.success("Einstellungen gespeichert!");
      try {
        await fetch('/api/industry-defaults', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry: formData.industry }),
        });
      } catch (defaultsError) {
        console.error('Failed to apply industry defaults after saving settings', defaultsError);
      }
    }
  };
  
  const handleGenerateProfileText = async (type: AIGenerationType) => { 
    const context = formData.business_name || 'Handwerksbetrieb'; 
    if (!context) { 
      toast.error("Bitte geben Sie zuerst den Namen des Betriebs ein."); 
      return; 
    } 
    setAiLoading(type);
    
    try { 
      const response = await fetch('/api/generate-profile-text', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ context: context, type: type, keywords: formData.keywords }), 
      }); 
      
      if (!response.ok) { 
        const errorData = await response.json(); 
        throw new Error(errorData.error || `Failed to generate ${type} text`); 
      } 
      
      const data = await response.json(); 
      if (type === 'services') { 
        setFormData(prev => ({ ...prev, services_description: data.text }));
      } else if (type === 'about') { 
        setFormData(prev => ({ ...prev, about_text: data.text }));
      } 
      toast.success("Text erfolgreich generiert!");
    } catch (err: any) { 
        console.error(`Error calling ${type} generation API:`, err); 
        const message = err instanceof Error ? err.message : "An unknown error occurred"; 
        toast.error(`Fehler bei der Textgenerierung: ${message}`); 
    } finally { 
      setAiLoading(null); 
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

    // Step 1: Update the authentication email
    const { data: authData, error: authError } = await supabase.auth.updateUser(
      { email: newEmail }
    );

    if (authError) {
      setIsChangingEmail(false);
      toast.error(`Fehler: ${authError.message}`, { id: toastId });
      return; // Stop if auth update fails
    }

    // --- THIS IS THE FIX ---
    // Step 2: Update the public 'profiles' table to match
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ email: newEmail })
      .eq('id', currentUser.id);

    setIsChangingEmail(false);

    if (profileError) {
      // Auth email was updated, but profile failed!
      toast.error(`Auth-E-Mail aktualisiert, aber Profil-Update fehlgeschlagen: ${profileError.message}`, {
        id: toastId,
        duration: 8000
      });
    } else {
      // Both were successful
      setNewEmail('');
      // Also update the local form data to reflect the change
      setFormData(prev => ({ ...prev, email: newEmail }));
      toast.success(
        "Bitte Posteingang prüfen! Wir haben eine Bestätigungs-E-Mail an Ihre ALTE und NEUE Adresse gesendet. Sie müssen beide bestätigen.",
        { id: toastId, duration: 10000 }
      );
    }
  };
  
  // --- Callback to update local profile state (same) ---
  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    setFormData(prev => ({...prev, is_published: updatedProfile.is_published }));
  };

  // --- Navigation Items for new layout ---
  const navItems = [
    { id: 'firmendaten', label: 'Firmendaten', icon: BuildingOfficeIcon },
    { id: 'branding', label: 'Branding & Inhalt', icon: PaintBrushIcon },
    { id: 'seo', label: 'SEO & AI', icon: MagnifyingGlassIcon },
    { id: 'rechtliches', label: 'Rechtliches', icon: BookOpenIcon },
    { id: 'sicherheit', label: 'Sicherheit', icon: ShieldCheckIcon },
  ];

  if (loading) {
    return <div className="flex h-full items-center justify-center p-10 text-sm text-slate-500">Lade Einstellungen...</div>;
  }

  // === RENDER ===
  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      
      {/* MODAL FÜR DATENSCHUTZ-VORLAGE */}
      <LegalWarningModal
         isOpen={showDatenschutzWarning}
         onConfirm={handleInsertDatenschutzTemplateConfirm}
         onCancel={() => setShowDatenschutzWarning(false)}
      />
      
      {/* NEUES MODAL FÜR AUTOFILL */}
      <LegalAutofillWarningModal
        isOpen={showAutofillWarning}
        onConfirm={handleAutofillLegalConfirm}
        onCancel={handleAutofillLegalCancel}
      />
      
      {/* This is the main 2-column layout */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-4">
        
        {/* === LEFT COLUMN: STICKY NAV === */}
        <aside className="lg:col-span-1">
          <nav className="sticky top-16 space-y-1">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Einstellungen</h2>
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="group flex items-center gap-3 rounded-full px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* === RIGHT COLUMN: CONTENT === */}
        <div className="space-y-12 lg:col-span-3">
          
          {/* --- Main Form for Profile Data --- */}
          <form onSubmit={handleSaveProfile} className="space-y-12">
            
            {/* Sticky Save Header */}
            <div className="sticky top-0 z-10 -mx-1 -mt-1 flex items-center justify-between border-b border-orange-100 bg-white/90 px-6 py-4 shadow-sm shadow-orange-100/40 backdrop-blur">
              <h2 className="text-xl font-semibold text-slate-900">Allgemeine Einstellungen</h2>
              <button
                type="submit"
                disabled={saving || isUploading || !!aiLoading}
                className="inline-flex items-center gap-x-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 disabled:opacity-50"
              >
                {saving ? <ArrowPathIcon /> : <CheckIcon className="h-5 w-5" />}
                {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
              </button>
            </div>

            {/* --- Section 1: Firmendaten --- */}
            <section id="firmendaten" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-slate-900">Firmendaten</h3>
              <p className="mt-1 text-sm text-slate-600">Diese Informationen werden auf Ihrer Webseite (z.B. im Impressum) angezeigt.</p>
              <div className="mt-6 space-y-6 rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-sm shadow-orange-100">
                <SettingsInput label="Firmenname" name="business_name" value={formData.business_name ?? ''} onChange={handleFormChange} placeholder="z.B. Max Mustermann GmbH" />
                <SettingsSelect
                  label="Branche"
                  name="industry"
                  value={formData.industry || 'sonstiges'}
                  onChange={handleFormChange}
                  options={INDUSTRY_OPTIONS}
                  helperText="Damit AI-Texte und Ihre Webseite zur Branche passen."
                />
                <SettingsInput label="Adresse" name="address" value={formData.address ?? ''} onChange={handleFormChange} placeholder="z.B. Musterstraße 1, 12345 Musterstadt" type="textarea" rows={3} />
                <SettingsInput label="Telefon" name="phone" value={formData.phone ?? ''} onChange={handleFormChange} placeholder="z.B. 01234 567890" />
                <SettingsInput label="E-Mail (Öffentlich)" name="email" value={formData.email ?? ''} onChange={handleFormChange} placeholder="z.B. info@mustermann.de" />
              </div>
            </section>
            
            {/* --- Section 2: Branding --- */}
            <section id="branding" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-slate-900">Webseiten-Branding & Inhalte</h3>
              <p className="mt-1 text-sm text-slate-600">Passen Sie das Aussehen Ihrer Webseite an.</p>
              <div className="mt-6 space-y-6 rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-sm shadow-orange-100">
                <ColorInput label="Primärfarbe (Brand)" name="primary_color" value={formData.primary_color ?? '#F97316'} onChange={handleFormChange} />
                <ColorInput label="Sekundärfarbe (Hintergrund)" name="secondary_color" value={formData.secondary_color ?? '#F8FAFC'} onChange={handleFormChange} />
                <SettingsInput label="Hero Überschrift" name="hero_title" value={formData.hero_title ?? ''} onChange={handleFormChange} placeholder="z.B. Ihr Malerbetrieb in Musterstadt" />
                <SettingsInput label="Hero Untertitel" name="hero_subtitle" value={formData.hero_subtitle ?? ''} onChange={handleFormChange} placeholder="Kurzbeschreibung für den Seitenanfang" type="textarea" rows={3} />
                <LogoUploader
                  logoUrl={profile?.logo_url || null}
                  onFileChange={handleLogoUpload}
                  onRemoveLogo={handleRemoveLogo}
                  isUploading={isUploading}
                />
                <hr className="border-orange-100" />
                <SettingsToggle label="Leistungen anzeigen" description="Zeigt den 'Leistungen' Abschnitt auf Ihrer Startseite." name="show_services_section" isChecked={formData.show_services_section} onChange={handleFormChange} />
                <SettingsToggle label="'Über Uns' Seite anzeigen" description="Zeigt den 'Über Uns' Link in der Navigation." name="show_team_page" isChecked={formData.show_team_page} onChange={handleFormChange} />
                <SettingsToggle label="'Kundenstimmen' Seite anzeigen" description="Zeigt den 'Kundenstimmen' Link in der Navigation." name="show_testimonials_page" isChecked={formData.show_testimonials_page} onChange={handleFormChange} />
              </div>
            </section>
            
            {/* --- Section 3: SEO & AI (MIT BUTTONS) --- */}
            <section id="seo" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-slate-900">SEO & AI-Inhalte</h3>
              <p className="mt-1 text-sm text-slate-600">Helfen Sie der AI, bessere Texte für Sie zu generieren.</p>
              <div className="mt-6 space-y-6 rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-sm shadow-orange-100">
                
                {/* Keywords (Bleibt ein einfaches Input) */}
                <SettingsInput label="Wichtige Keywords" name="keywords" value={formData.keywords ?? ''} onChange={handleFormChange} placeholder="z.B. Badsanierung, Heizung, Fliesenleger, Dresden..." type="textarea" rows={3} />
                
                {/* Leistungsbeschreibung (MIT BUTTON) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label htmlFor="services_description" className="block text-sm font-medium text-slate-600">Leistungsbeschreibung</label>
                  <div className="relative">
                    <textarea name="services_description" id="services_description" rows={6} value={formData.services_description ?? ''} onChange={handleFormChange} className="mt-0 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="Eine Zeile pro Leistung, z.B. Sanitär: Installation und Reparatur..." />
                    <button type="button" onClick={() => handleGenerateProfileText('services')} disabled={aiLoading === 'services' || !formData.business_name} className={`absolute right-2 top-2 inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg transition-colors ${ aiLoading === 'services' || !formData.business_name ? 'bg-slate-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-400' }`} >
                      <SparklesIcon className={`h-4 w-4 ${aiLoading === 'services' ? 'animate-spin' : ''}`} />
                      {aiLoading === 'services' ? 'Generiere...' : 'Generieren'}
                    </button>
                  </div>
                </div>

                {/* Über Uns Text (MIT BUTTON) */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label htmlFor="about_text" className="block text-sm font-medium text-slate-600">Über Uns Text</label>
                  <div className="relative">
                    <textarea name="about_text" id="about_text" rows={6} value={formData.about_text ?? ''} onChange={handleFormChange} className="mt-0 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="Ein kurzer Text über Ihre Firma, Ihre Werte und Ihre Geschichte..." />
                    <button type="button" onClick={() => handleGenerateProfileText('about')} disabled={aiLoading === 'about' || !formData.business_name} className={`absolute right-2 top-2 inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg transition-colors ${ aiLoading === 'about' || !formData.business_name ? 'bg-slate-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-400' }`} >
                      <SparklesIcon className={`h-4 w-4 ${aiLoading === 'about' ? 'animate-spin' : ''}`} />
                      {aiLoading === 'about' ? 'Generiere...' : 'Generieren'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* --- Section 4: Rechtliches --- */}
            <section id="rechtliches" className="scroll-mt-32">
              <h3 className="text-xl font-semibold text-slate-900">Rechtliches</h3>
              <p className="mt-1 text-sm text-slate-600">WICHTIG: Diese Texte sind für den Betrieb einer Webseite in Deutschland gesetzlich vorgeschrieben.</p>
              
              {/* PERSISTENTER RECHTLICHER HINWEIS */}
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-700 shadow-sm shadow-red-100">
                <ExclamationTriangleIcon className="mt-0.5 h-6 w-6 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900">Keine Rechtsberatung!</p>
                  <p>
                    ArtisanCMS stellt lediglich die technischen Eingabefelder bereit. Sie sind **allein** für die Richtigkeit und Aktualität Ihrer Texte verantwortlich. Lassen Sie diese **zwingend von einem Anwalt** prüfen und individuell anpassen.
                  </p>
                </div>
              </div>
              
              {/* --- NEU: BUTTON FÜR AUTOFILL --- */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleAutofillLegalClick}
                  className="rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-orange-400 transition"
                  title="Überschreibt bestehende Texte mit den Vorlagen"
                >
                  Vorlagen für Impressum & Datenschutz (neu) befüllen
                </button>
              </div>
              {/* --- ENDE NEUER BUTTON --- */}


              <div className="mt-6 space-y-6 rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-sm shadow-orange-100">
                
                {/* Impressum Input (unverändert) */}
                <SettingsInput label="Impressum" name="impressum_text" value={formData.impressum_text ?? ''} onChange={handleFormChange} placeholder="Fügen Sie hier Ihr Impressum ein..." type="textarea" rows={10} />
                
                {/* Datenschutzerklärung Input MIT BUTTON */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label htmlFor="datenschutz_text" className="block text-sm font-medium text-slate-600">Datenschutzerklärung</label>
                    <div className="relative">
                       <textarea name="datenschutz_text" id="datenschutz_text" rows={10} value={formData.datenschutz_text ?? ''} onChange={handleFormChange} className="mt-0 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="Fügen Sie hier Ihre Datenschutzerklärung ein..." />
                       {/* BUTTON ZUM EINFÜGEN DER VORLAGE - Öffnet Modal */}
                       <button
                           type="button"
                           onClick={handleInsertDatenschutzTemplateClick}
                           className="absolute right-2 top-2 inline-flex items-center gap-x-1.5 rounded-full bg-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-orange-400 transition"
                           title="Fügt eine Vorlage ein (bestehender Text wird überschrieben)"
                       >
                           Nur Datenschutz-Vorlage einfügen
                       </button>
                    </div>
                 </div>
              </div>
            </section>
            
            {/* --- NEU: ZWEITER SPEICHERN-BUTTON --- */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving || isUploading || !!aiLoading}
                className="inline-flex items-center gap-x-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 disabled:opacity-50"
              >
                {saving ? <ArrowPathIcon /> : <CheckIcon className="h-5 w-5" />}
                {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
              </button>
            </div>
            {/* --- ENDE ZWEITER SPEICHERN-BUTTON --- */}
            
          </form> {/* End of main profile form */}

          {/* --- Section 5: Sicherheit (Separate components) --- */}
          <section id="sicherheit" className="scroll-mt-32 space-y-8">
            <SectionCard
              title="Account-Sicherheit"
              description="Ändern Sie hier Ihre E-Mail-Adresse für den Login."
            >
              <form onSubmit={handleChangeEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600">Aktuelle Login-E-Mail</label>
                  <p className="mt-2 text-sm font-medium text-slate-600">{currentUser?.email}</p>
                </div>
                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-slate-600">Neue E-Mail-Adresse</label>
                  <div className="relative mt-2">
                    <input type="email" name="newEmail" id="newEmail" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 pl-10 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="neue-email@beispiel.de" />
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><AtSymbolIcon className="h-5 w-5 text-slate-400" /></div>
                  </div>
                </div>
                <div className="text-right">
                  <button type="submit" disabled={isChangingEmail || !newEmail} className="inline-flex items-center gap-x-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 disabled:opacity-50">
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
              router={router} 
            />
          </section>
        </div>
      </div>
    </main>
  );
}