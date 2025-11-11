"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import ProjectGalleryManager from './ProjectGalleryManager'; // <-- ADD THIS LINE
import type { Project, ProjectFormProps } from '@/lib/types';

// --- ICONS ---
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm1.5-3V8.25" /> </svg> );
const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const InformationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /> </svg> );

// --- (FIX: FEHLENDE FUNKTION) ---
// Konvertiert ein File-Objekt in einen Base64-String
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Das Ergebnis ist "data:image/png;base64,..."
      // Wir wollen nur den Teil nach dem Komma
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};
// --- ENDE FIX ---

// --- IMAGE UPLOAD CARD COMPONENT ---
interface ImageUploadCardProps {
  title: string;
  description: string;
  imageUrl: string | null;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}
function ImageUploadCard({ title, description, imageUrl, isUploading, onFileChange, onRemove }: ImageUploadCardProps) {
  // (Code für ImageUploadCard ist identisch)
  return (
    <div className="border border-slate-700 rounded-xl bg-slate-800 shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      <div className="px-6 pb-6">
        <div className="w-full aspect-[16/9] rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center relative bg-slate-800/50">
          {imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Project image" className="object-cover w-full h-full rounded-lg" />
              <button
                type="button"
                onClick={onRemove}
                className="absolute -top-2 -right-2 p-0.5 bg-slate-900 rounded-full text-red-400 hover:text-red-300"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </>
          ) : (
            <div className="text-center p-4">
              <PhotoIcon className="mx-auto h-12 w-12 text-slate-500" />
              <div className="mt-4 flex text-sm leading-6 text-slate-400">
                <label
                  htmlFor={title}
                  className="relative cursor-pointer rounded-md font-semibold text-orange-500 hover:text-orange-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2 focus-within:ring-offset-slate-900"
                >
                  <span>Bild hochladen</span>
                  <input id={title} name={title} type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" onChange={onFileChange} />
                </label>
              </div>
              <p className="text-xs leading-5 text-slate-500">PNG, JPG, WEBP bis zu 5MB</p>
            </div>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/80 rounded-lg flex flex-col items-center justify-center">
              <ArrowPathIcon className="h-8 w-8 text-white animate-spin" />
              <span className="mt-2 text-sm text-white">Wird hochgeladen...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Spotlight-Hinweis ---
const SpotlightHint = () => (
  <div className="mb-8 rounded-md bg-blue-600/10 p-4 border border-blue-500/30">
    <div className="flex">
      <div className="flex-shrink-0">
        <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
      </div>
      <div className="ml-3 flex-1 md:flex md:justify-between">
        {/* --- THIS IS THE FIX --- */}
        <p className="text-sm text-blue-300">
          <span className="font-semibold text-white">Tipp für den Start:</span> Laden Sie als Erstes ein &lsquo;Nachher-Bild&rsquo; hoch. Unsere KI generiert dann automatisch eine passende Projektbeschreibung für Sie!
        </p>
      </div>
    </div>
  </div>
);


// --- MAIN PROJECT FORM COMPONENT ---
export default function ProjectForm({ currentUser, userSlug, initialData }: ProjectFormProps) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const router = useRouter();

  // === State ===
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

  // === Handlers ===
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file: File, type: 'before' | 'after'): Promise<{ url: string; path: string }> => {
    // (Code ist identisch)
    const fileExt = file.name.split('.').pop();
    const newFileName = `${Date.now()}.${fileExt}`;
    const storagePath = `${currentUser.id}/${newFileName}`;

    try {
      if (type === 'before') {
        if (formData.before_image_storage_path) {
          await supabase.storage.from('project-images').remove([formData.before_image_storage_path]);
        }
      } else { 
        if (formData.after_image_storage_path) { 
          await supabase.storage.from('project-images').remove([formData.after_image_storage_path]); 
        }
      }
    } catch (removeError) {
      console.error("Error removing old image, proceeding with upload anyway:", removeError);
    }

    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(storagePath, file);

    if (uploadError) {
      console.error("Image upload error:", uploadError);
      throw new Error(`Fehler beim Hochladen des Bildes: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(storagePath);
      
    if (!publicUrlData) {
        throw new Error("Konnte öffentliche URL nach Upload nicht abrufen.");
    }

    return { url: publicUrlData.publicUrl, path: storagePath };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Bild ist zu groß. Max. 5MB."); return;
    }

    if (type === 'before') setIsUploadingBefore(true);
    else setIsUploadingAfter(true);

    try {
      const { url, path } = await handleImageUpload(file, type);
      
      if (type === 'before') {
        setFormData(prev => ({ 
            ...prev, 
            before_image_url: url, 
            before_image_storage_path: path 
        }));
      } else { 
        setFormData(prev => ({ 
            ...prev, 
            after_image_url: url, 
            after_image_storage_path: path 
        }));
        
        if (!formData.ai_description) {
            // Hier wird die neue Funktion aufgerufen
            const base64Data = await fileToBase64(file);
            handleGenerateDescription({
                imageData: base64Data,
                mimeType: file.type
            });
        }
      }
      
      // --- THIS IS THE FIX ---
      // eslint-disable-next-line react/no-unescaped-entities
      toast.success(`'${type === 'before' ? 'Vorher' : 'Nachher'}' Bild erfolgreich hochgeladen.`);

    } catch (error: any) {
      toast.error(error.message || "Fehler beim Upload.");
    } finally {
      if (type === 'before') setIsUploadingBefore(false);
      else setIsUploadingAfter(false);
    }
  };
  
  const handleGenerateDescription = async (
    imagePayload: { imageData: string; mimeType: string } | { imageUrl: string }
  ) => {
      
      setIsGenerating(true);
      
      try {
          const response = await fetch('/api/analyze-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(imagePayload)
          });
          
          if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Antwort vom Server war nicht OK.");
          }
          
          const data = await response.json();
          setFormData(prev => ({ ...prev, ai_description: data.description }));
          toast.success("Beschreibung erfolgreich generiert!");
          
      } catch (err: any) {
          console.error("Error generating description:", err);
          toast.error(`Fehler bei AI-Generierung: ${err.message}`);
      } finally {
          setIsGenerating(false);
      }
  };
  
  const handleGenerateDescriptionFromUrl = () => {
    if (!formData.after_image_url) {
        toast.error("Bitte zuerst ein 'Nachher' Bild hochladen."); return;
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
            id: initialData.id 
        };
    }
    
    const savePromise = async () => {
        const { data, error } = await supabase
            .from('projects')
            .upsert(finalUpsertData) 
            .select()
            .single();
            
        if (error) {
            console.error("Error saving project:", error);
            throw error;
        }
        return data;
    };
    
    await toast.promise(
        savePromise(),
        {
            loading: "Projekt wird gespeichert...",
            success: (data) => {
                setIsSaving(false);
                if (!initialData) {
                    router.push(`/dashboard/projekte/${data.id}/edit`);
                    return "Projekt erfolgreich erstellt!";
                }
                router.refresh(); 
                return "Projekt erfolgreich gespeichert!";
            },
            error: (err: any) => {
                setIsSaving(false);
                return `Projekt konnte nicht gespeichert werden: ${err.message}`;
            }
        }
    );
  };
  
  const handleRemoveImage = async (type: 'before' | 'after') => {
    // (Code ist identisch)
    const pathToRemove = type === 'before' ? formData.before_image_storage_path : formData.after_image_storage_path; 
      
      if (!pathToRemove) {
          console.log("No image path to remove."); return;
      }

      const toastId = toast.loading("Bild wird gelöscht...");
      
      try {
          const { error } = await supabase.storage.from('project-images').remove([pathToRemove]);
          if (error) throw error;

          if (type === 'before') {
              setFormData(prev => ({ ...prev, before_image_url: null, before_image_storage_path: null }));
          } else {
              setFormData(prev => ({ ...prev, after_image_url: null, after_image_storage_path: null })); 
          }
          
          if (initialData?.id) {
              const updateData = type === 'before' 
                  ? { before_image_url: null, before_image_storage_path: null }
                  : { after_image_url: null, after_image_storage_path: null }; 
                  
              const { error: dbError } = await supabase.from('projects').update(updateData).eq('id', initialData.id);
              if (dbError) throw dbError;
          }

          toast.success("Bild erfolgreich entfernt.", { id: toastId });
          
      } catch (err: any) {
          console.error("Error removing image:", err);
          toast.error(`Fehler beim Entfernen des Bilds: ${err.message}`, { id: toastId });
      }
  };
  
const handleGalleryUpdate = (newGallery: { url: string; path: string; }[]) => {
    setFormData(prev => ({ ...prev, gallery_images: newGallery }));
  };

  const isFormDisabled = isUploadingBefore || isUploadingAfter || isGenerating || isSaving;
  const publicProjectUrl = userSlug && initialData?.status === 'Published' 
      ? `/${userSlug}/portfolio/${initialData.id}` 
      : null;

  // --- (Render-Funktion) ---
  return (
    <>
      {initialData === null && <SpotlightHint />} 
    
      <form onSubmit={handleSubmit} className="mt-8 space-y-12">
        {/* --- Main Project Details --- */}
        <div className="space-y-8 border-b border-slate-700 pb-12">
          {/* (Code ist identisch) */}
          <h2 className="text-xl font-semibold leading-7 text-white">Projekt Details</h2>
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
              {/* Left Col */}
              <div className="space-y-10">
                  <div>
                      <label htmlFor="title" className="block text-sm font-medium leading-6 text-slate-300">Titel</label>
                      <div className="mt-2">
                          <input
                              type="text"
                              name="title"
                              id="title"
                              value={formData.title}
                              onChange={handleChange}
                              required
                              disabled={isFormDisabled}
                              className="block w-full rounded-md border-0 py-2.5 px-3.5 bg-white/5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 transition"
                              placeholder="z.B. Maßgefertigte Einbauküche"
                          />
                      </div>
                  </div>
                  <div>
                      <label htmlFor="project-date" className="block text-sm font-medium leading-6 text-slate-300">Projektdatum</label>
                      <div className="mt-2">
                           <input
                              type="date"
                              name="project-date"
                              id="project-date"
                              value={formData['project-date'] || ''}
                              onChange={handleDateChange}
                              disabled={isFormDisabled}
                              className="block w-full rounded-md border-0 py-2.5 px-3.5 bg-white/5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 transition"
                          />
                      </div>
                  </div>
              </div>
              
              {/* Right Col */}
              <div>
                  <label htmlFor="status" className="block text-sm font-medium leading-6 text-slate-300">Status</label>
                  <div className="mt-2">
                      <select
                          id="status"
                          name="status"
                          value={formData.status || 'Draft'}
                          onChange={handleChange}
                          disabled={isFormDisabled}
                          className="block w-full rounded-md border-0 py-2.5 px-3.5 bg-white/5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 transition"
                      >
                          <option value="Draft">Entwurf (Nicht sichtbar)</option>
                          <option value="Published">Veröffentlicht (Öffentlich)</option>
                      </select>
                  </div>
                  {publicProjectUrl && (
                      <p className="mt-3 text-sm text-slate-400">
                          Öffentlicher Link: {' '}
                          <a href={publicProjectUrl} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 underline">
                             Projekt ansehen
                          </a>
                      </p>
                  )}
              </div>
          </div>
        </div>
        
        {/* --- Image Uploads --- */}
        <div className="space-y-8 border-b border-slate-700 pb-12">
          {/* (Code ist identisch) */}
          <h2 className="text-xl font-semibold leading-7 text-white">Projektbilder</h2>
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
        </div>
        
         {/* --- AI Description --- */}
         <div className="space-y-8 border-b border-slate-700 pb-12">
             <div className="flex items-center justify-between">
                  <div>
                     <h2 className="text-xl font-semibold leading-7 text-white">KI Projektbeschreibung</h2>
                     <p className="mt-1 text-sm text-slate-400">
                         Lassen Sie eine Beschreibung automatisch generieren, basierend auf dem &apos;Nachher&apos;-Bild.
                     </p>
                  </div>
                   <button
                      type="button"
                      onClick={handleGenerateDescriptionFromUrl} 
                      disabled={isFormDisabled || !formData.after_image_url} 
                      className="rounded-md bg-orange-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition"
                  >
                      {isGenerating ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : "Beschreibung generieren"}
                  </button>
             </div>
             
              <div>
                  <textarea
                      id="ai_description"
                      name="ai_description"
                      rows={10}
                      value={formData.ai_description || ''}
                      onChange={handleChange}
                      disabled={isFormDisabled}
                      className="block w-full rounded-md border-0 py-2.5 px-3.5 bg-white/5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 transition"
                      placeholder="Die KI-beschreibung wird hier erscheinen..."
                  />
              </div>
        </div>
        
        {/* --- Gallery Manager --- */}
        {initialData?.id && (
            <div className="space-y-8 border-b border-slate-700 pb-12">
                  <h2 className="text-xl font-semibold leading-7 text-white">Projekt Galerie</h2>
                   <ProjectGalleryManager
    projectId={initialData.id} // <-- This is the fix
    userId={currentUser.id}
    initialGalleryImages={formData.gallery_images || []}
    onGalleryUpdate={(newGallery: { url: string; path: string; }[]) => setFormData(prev => ({ ...prev, gallery_images: newGallery }))}
  />
            </div>
        )}
        
        {/* --- END OF ADDED SECTION --- */}

         {/* --- Private Notes --- */}
         <div className="space-y-8">
             {/* (Code ist identisch) */}
             <h2 className="text-xl font-semibold leading-7 text-white">Private Notizen</h2>
              <div>
                   <label htmlFor="notes" className="block text-sm font-medium leading-6 text-slate-300">
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
                          className="block w-full rounded-md border-0 py-2.5 px-3.5 bg-white/5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-orange-500 sm:text-sm sm:leading-6 transition"
                          placeholder="Interne Notizen zum Kunden, Material, etc."
                      />
                  </div>
              </div>
        </div>
  
        {/* --- Form Actions --- */}
        <div className="mt-6 flex items-center justify-end gap-x-6">
          {/* (Code ist identisch) */}
          <button 
              type="button" 
              onClick={() => router.push('/dashboard/projekte')}
              disabled={isFormDisabled}
              className="text-sm font-semibold leading-6 text-slate-300 hover:text-white disabled:text-slate-500"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isFormDisabled}
            className="flex justify-center rounded-md bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition"
          >
            {isSaving ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : "Projekt speichern"}
          </button>
        </div>
      </form>
    </>
  );
}