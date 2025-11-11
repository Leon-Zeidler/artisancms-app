"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import ProjectGalleryManager from './ProjectGalleryManager';
import type { Project, ProjectFormProps } from '@/lib/types';

const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
    />
  </svg>
);
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
    />
  </svg>
);

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

interface ImageUploadCardProps {
  title: string;
  description: string;
  imageUrl: string | null;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

function ImageUploadCard({ title, description, imageUrl, isUploading, onFileChange, onRemove }: ImageUploadCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-md shadow-orange-100/50">
      <div className="border-b border-slate-100 px-6 py-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <div className="px-6 py-6">
        <div className="relative flex aspect-[16/9] w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/70">
          {imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Project image" className="h-full w-full rounded-xl object-cover" />
              <button
                type="button"
                onClick={onRemove}
                className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-md shadow-red-100 transition hover:bg-red-50"
                title="Bild entfernen"
              >
                <XCircleIcon className="h-5 w-5" />
              </button>
            </>
          ) : (
            <div className="text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-slate-400" />
              <div className="mt-4 text-sm text-slate-600">
                <label
                  htmlFor={title}
                  className="relative cursor-pointer font-semibold text-orange-600 transition hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-300 focus-within:ring-offset-2"
                >
                  <span>Bild hochladen</span>
                  <input
                    id={title}
                    name={title}
                    type="file"
                    className="sr-only"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={onFileChange}
                  />
                </label>
                <p className="mt-2 text-xs text-slate-500">PNG, JPG oder WEBP bis zu 5MB</p>
              </div>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/80">
              <ArrowPathIcon className="h-7 w-7 animate-spin text-orange-500" />
              <span className="mt-2 text-sm font-medium text-orange-600">Wird hochgeladen...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const SpotlightHint = () => (
  <div className="rounded-2xl border border-orange-200 bg-orange-50/80 p-5 shadow-sm shadow-orange-100">
    <div className="flex items-start gap-3">
      <InformationCircleIcon className="h-5 w-5 text-orange-500" aria-hidden="true" />
      <p className="text-sm text-slate-700">
        <span className="font-semibold text-orange-600">Tipp für den Start:</span> Laden Sie zuerst ein „Nachher“-Bild hoch.
        Unsere KI erstellt daraus automatisch eine passende Projektbeschreibung.
      </p>
    </div>
  </div>
);

export default function ProjectForm({ currentUser, userSlug, initialData }: ProjectFormProps) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    'project-date': initialData?.['project-date'] || '',
    ai_description: initialData?.ai_description || '',
    notes: initialData?.notes || '',
    status: initialData?.status || 'Draft',
    after_image_url: initialData?.after_image_url || null,
    after_image_storage_path: initialData?.after_image_storage_path || null,
    before_image_url: initialData?.before_image_url || null,
    before_image_storage_path: initialData?.before_image_storage_path || null,
    gallery_images: initialData?.gallery_images || [],
  });

  const [isUploadingBefore, setIsUploadingBefore] = useState(false);
  const [isUploadingAfter, setIsUploadingAfter] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file: File, type: 'before' | 'after'): Promise<{ url: string; path: string }> => {
    const fileExt = file.name.split('.').pop();
    const newFileName = `${Date.now()}-${uuidv4()}.${fileExt}`;
    const storagePath = `${currentUser.id}/${newFileName}`;

    try {
      if (type === 'before' && formData.before_image_storage_path) {
        await supabase.storage.from('project-images').remove([formData.before_image_storage_path]);
      }
      if (type === 'after' && formData.after_image_storage_path) {
        await supabase.storage.from('project-images').remove([formData.after_image_storage_path]);
      }
    } catch (removeError) {
      console.error('Error removing old image, proceeding with upload anyway:', removeError);
    }

    const { error: uploadError } = await supabase.storage.from('project-images').upload(storagePath, file);
    if (uploadError) {
      console.error('Image upload error:', uploadError);
      throw new Error(`Fehler beim Hochladen des Bildes: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from('project-images').getPublicUrl(storagePath);
    if (!publicUrlData) {
      throw new Error('Konnte öffentliche URL nach Upload nicht abrufen.');
    }

    return { url: publicUrlData.publicUrl, path: storagePath };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bild ist zu groß. Max. 5MB.');
      return;
    }

    if (type === 'before') setIsUploadingBefore(true);
    else setIsUploadingAfter(true);

    try {
      const { url, path } = await handleImageUpload(file, type);

      if (type === 'before') {
        setFormData((prev) => ({
          ...prev,
          before_image_url: url,
          before_image_storage_path: path,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          after_image_url: url,
          after_image_storage_path: path,
        }));

        if (!formData.ai_description) {
          const base64Data = await fileToBase64(file);
          handleGenerateDescription({
            imageData: base64Data,
            mimeType: file.type,
          });
        }
      }

      toast.success(`"${type === 'before' ? 'Vorher' : 'Nachher'}" Bild erfolgreich hochgeladen.`);
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Upload.');
    } finally {
      if (type === 'before') setIsUploadingBefore(false);
      else setIsUploadingAfter(false);
    }
  };

  const handleGenerateDescription = async (
    imagePayload: { imageData: string; mimeType: string } | { imageUrl: string },
  ) => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imagePayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Antwort vom Server war nicht OK.');
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, ai_description: data.description }));
      toast.success('Beschreibung erfolgreich generiert!');
    } catch (err: any) {
      console.error('Error generating description:', err);
      toast.error(`Fehler bei AI-Generierung: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateDescriptionFromUrl = () => {
    if (!formData.after_image_url) {
      toast.error("Bitte zuerst ein 'Nachher' Bild hochladen.");
      return;
    }
    handleGenerateDescription({ imageUrl: formData.after_image_url });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    const dataToUpsert: Omit<Project, 'id' | 'created_at'> = {
      user_id: currentUser.id,
      title: formData.title,
      'project-date': formData['project-date'] || null,
      ai_description: formData.ai_description,
      notes: formData.notes,
      status: formData.status,
      after_image_url: formData.after_image_url,
      after_image_storage_path: formData.after_image_storage_path,
      before_image_url: formData.before_image_url,
      before_image_storage_path: formData.before_image_storage_path,
      gallery_images: formData.gallery_images,
    };

    let finalUpsertData: any = dataToUpsert;

    if (initialData?.id) {
      finalUpsertData = {
        ...dataToUpsert,
        id: initialData.id,
      };
    }

    const savePromise = async () => {
      const { data, error } = await supabase
        .from('projects')
        .upsert(finalUpsertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving project:', error);
        throw error;
      }
      return data;
    };

    await toast.promise(savePromise(), {
      loading: 'Projekt wird gespeichert...',
      success: (data) => {
        setIsSaving(false);
        if (!initialData) {
          router.push(`/dashboard/projekte/${data.id}/edit`);
          return 'Projekt erfolgreich erstellt!';
        }
        router.refresh();
        return 'Projekt erfolgreich gespeichert!';
      },
      error: (err: any) => {
        setIsSaving(false);
        return `Projekt konnte nicht gespeichert werden: ${err.message}`;
      },
    });
  };

  const handleRemoveImage = async (type: 'before' | 'after') => {
    const pathToRemove = type === 'before' ? formData.before_image_storage_path : formData.after_image_storage_path;
    if (!pathToRemove) {
      console.log('No image path to remove.');
      return;
    }

    const toastId = toast.loading('Bild wird gelöscht...');

    try {
      const { error } = await supabase.storage.from('project-images').remove([pathToRemove]);
      if (error) throw error;

      if (type === 'before') {
        setFormData((prev) => ({ ...prev, before_image_url: null, before_image_storage_path: null }));
      } else {
        setFormData((prev) => ({ ...prev, after_image_url: null, after_image_storage_path: null }));
      }

      if (initialData?.id) {
        const updateData =
          type === 'before'
            ? { before_image_url: null, before_image_storage_path: null }
            : { after_image_url: null, after_image_storage_path: null };

        const { error: dbError } = await supabase.from('projects').update(updateData).eq('id', initialData.id);
        if (dbError) throw dbError;
      }

      toast.success('Bild erfolgreich entfernt.', { id: toastId });
    } catch (err: any) {
      console.error('Error removing image:', err);
      toast.error(`Fehler beim Entfernen des Bilds: ${err.message}`, { id: toastId });
    }
  };

  const handleGalleryUpdate = (newGallery: { url: string; path: string }[]) => {
    setFormData((prev) => ({ ...prev, gallery_images: newGallery }));
  };

  const isFormDisabled = isUploadingBefore || isUploadingAfter || isGenerating || isSaving;
  const publicProjectUrl =
    userSlug && initialData?.id && initialData?.status === 'Published'
      ? `/${userSlug}/portfolio/${initialData.id}`
      : null;

  const fieldClasses =
    'block w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200';

  return (
    <div className="space-y-10">
      {initialData === null && <SpotlightHint />}

      <form onSubmit={handleSubmit} className="space-y-12">
        <section className="space-y-8 border-b border-slate-200 pb-12">
          <h2 className="text-xl font-semibold text-slate-900">Projektdetails</h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
            <div className="space-y-10">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-600">
                  Titel
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    disabled={isFormDisabled}
                    className={fieldClasses}
                    placeholder="z. B. Maßgefertigte Einbauküche"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="project-date" className="block text-sm font-medium text-slate-600">
                  Projektdatum
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    name="project-date"
                    id="project-date"
                    value={formData['project-date'] || ''}
                    onChange={handleDateChange}
                    disabled={isFormDisabled}
                    className={fieldClasses}
                  />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-600">
                Status
              </label>
              <div className="mt-2">
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'Draft'}
                  onChange={handleChange}
                  disabled={isFormDisabled}
                  className={fieldClasses}
                >
                  <option value="Draft">Entwurf (Nicht sichtbar)</option>
                  <option value="Published">Veröffentlicht (Öffentlich)</option>
                </select>
              </div>
              {publicProjectUrl && (
                <p className="mt-3 text-sm text-slate-600">
                  Öffentlicher Link:{' '}
                  <a
                    href={publicProjectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-orange-600 underline decoration-orange-200 underline-offset-4 hover:text-orange-500"
                  >
                    Projekt ansehen
                  </a>
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-8 border-b border-slate-200 pb-12">
          <h2 className="text-xl font-semibold text-slate-900">Projektbilder</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <ImageUploadCard
              title="Nachher Bild (Titelbild)"
              description="Das Hauptbild Ihres Projekts. Wird als Titelbild verwendet."
              imageUrl={formData.after_image_url}
              isUploading={isUploadingAfter}
              onFileChange={(e) => handleFileChange(e, 'after')}
              onRemove={() => handleRemoveImage('after')}
            />
            <ImageUploadCard
              title="Vorher Bild (Optional)"
              description="Zeigen Sie den Ausgangszustand, falls vorhanden."
              imageUrl={formData.before_image_url}
              isUploading={isUploadingBefore}
              onFileChange={(e) => handleFileChange(e, 'before')}
              onRemove={() => handleRemoveImage('before')}
            />
          </div>
        </section>

        <section className="space-y-6 border-b border-slate-200 pb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">KI Projektbeschreibung</h2>
              <p className="mt-1 text-sm text-slate-600">
                Lassen Sie eine Beschreibung automatisch generieren, basierend auf dem „Nachher“-Bild.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateDescriptionFromUrl}
              disabled={isFormDisabled || !formData.after_image_url}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200 disabled:cursor-not-allowed disabled:bg-orange-100 disabled:text-orange-300"
            >
              {isGenerating ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Beschreibung generieren'}
            </button>
          </div>
          <textarea
            id="ai_description"
            name="ai_description"
            rows={10}
            value={formData.ai_description || ''}
            onChange={handleChange}
            disabled={isFormDisabled}
            className={`${fieldClasses} min-h-[200px] leading-6`}
            placeholder="Die KI-Beschreibung wird hier erscheinen..."
          />
        </section>

        {initialData?.id && (
          <section className="space-y-8 border-b border-slate-200 pb-12">
            <h2 className="text-xl font-semibold text-slate-900">Projektgalerie</h2>
            <ProjectGalleryManager
              projectId={initialData.id}
              userId={currentUser.id}
              initialGalleryImages={formData.gallery_images || []}
              onGalleryUpdate={handleGalleryUpdate}
            />
          </section>
        )}

        <section className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Private Notizen</h2>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-600">
              Notizen (Nur für Sie sichtbar)
            </label>
            <div className="mt-2">
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes || ''}
                onChange={handleChange}
                disabled={isFormDisabled}
                className={`${fieldClasses} leading-6`}
                placeholder="Interne Notizen zum Kunden, Material, etc."
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/projekte')}
            disabled={isFormDisabled}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isFormDisabled}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-100 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200 disabled:cursor-not-allowed disabled:bg-orange-100 disabled:text-orange-300"
          >
            {isSaving ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Projekt speichern'}
          </button>
        </div>
      </form>
    </div>
  );
}
