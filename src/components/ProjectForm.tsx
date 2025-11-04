// src/components/ProjectForm.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// --- Icons ---
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> </svg> );
const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /> </svg> );

// --- Project Type ---
export type Project = {
  id: string;
  title: string | null;
  'project-date': string | null;
  image_url: string | null;
  ai_description: string | null;
  notes: string | null;
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
  user_id: string;
  image_storage_path: string | null; // <-- Use the path you added
};

// --- Helper function ---
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

// --- Component Props ---
interface ProjectFormProps {
  currentUser: User | null;
  userSlug: string | null;
  initialData?: Project; // This makes it an "edit" form
}

export default function ProjectForm({ currentUser, userSlug, initialData }: ProjectFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  // === State Variables ===
  const [title, setTitle] = useState(initialData?.title || '');
  const [projectDate, setProjectDate] = useState(
    initialData?.['project-date'] ? new Date(initialData['project-date']).toISOString().split('T')[0] : ''
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiDescription, setAiDescription] = useState(initialData?.ai_description || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [status, setStatus] = useState<'Draft' | 'Published'>(
    initialData?.status === 'Published' ? 'Published' : 'Draft'
  );
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(initialData?.image_url || null);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(initialData?.image_storage_path || null);
  
  // New state for "Publish" checkbox, only for "new" mode
  const [publishImmediately, setPublishImmediately] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // === Handle File Selection ===
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setImageFile(file);
      setCurrentImageUrl(URL.createObjectURL(file)); // Set preview
      // Clear notes when a new image is selected
      setNotes("");
      setAiDescription("");
    } else {
      setImageFile(null);
      setCurrentImageUrl(initialData?.image_url || null); // Revert to original if deselected
    }
  };

  // --- Handler for Image Analysis ---
  const handleImageAnalysis = async () => {
    let mimeType: string | undefined;
    let base64Data: string | null = null;

    setIsAnalyzingImage(true);
    setNotes("Analysiere Bild...");

    const analysisPromise = async () => {
      // 1. Check if a NEW file has been staged
      if (imageFile) {
        base64Data = await fileToBase64(imageFile);
        mimeType = imageFile.type;
      } 
      // 2. If not, use the CURRENT project image URL
      else if (currentImageUrl) {
        const response = await fetch(currentImageUrl);
        if (!response.ok) throw new Error("Konnte aktuelles Bild nicht laden.");
        const blob = await response.blob();
        mimeType = blob.type;
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = (error) => reject(error);
        });
      } 
      else { throw new Error("Kein Bild zum Analysieren gefunden."); }

      // Call our API route
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: base64Data, mimeType: mimeType }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze image');
      }
      return result.description;
    };

    await toast.promise(
      analysisPromise(),
      {
        loading: 'Analysiere Bild mit AI...',
        success: (description) => {
          setNotes(description);
          setIsAnalyzingImage(false);
          return 'Bildanalyse erfolgreich!';
        },
        error: (err: any) => {
          setNotes(initialData?.notes || ""); // Restore original notes on error
          setIsAnalyzingImage(false);
          return `Fehler: ${err.message}`;
        }
      }
    );
  };

  // === Handle AI Description Generation ===
  const handleGenerateDescription = async () => { 
    if (!title.trim()) { toast.error("Bitte geben Sie zuerst einen Projekttitel ein."); return; } 
    setAiLoading(true); 
    
    await toast.promise( 
      fetch('/api/generate-description', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title: title, notes: notes }),
      }).then(async (response) => { 
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Generierung fehlgeschlagen');
        }
        return response.json(); 
      }), 
      { 
        loading: 'Beschreibung wird generiert...', 
        success: (data) => { setAiDescription(data.description); return 'Beschreibung generiert!'; }, 
        error: (err) => `Fehler: ${err.message}`, 
      } 
    ); 
    setAiLoading(false); 
  };

  // === Handle Form Submission ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser) { toast.error("Benutzer- oder Projektdaten fehlen."); return; }
    if (!imageFile && !isEditMode) { toast.error("Bitte wählen Sie ein Projektbild aus."); return; }

    setSaving(true);

    const savePromise = async () => {
        let finalImageUrl = currentImageUrl;
        let finalImagePath = currentImagePath;
        let oldImagePath: string | null = null; // Path to delete *after* successful update

        // 1. Handle Image Upload (if a new file was selected)
        if (imageFile) {
            console.log("New image file selected, attempting upload...");
            const file = imageFile;
            const fileExtension = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExtension}`;
            const filePath = `${currentUser.id}/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('project-images').upload(filePath, file);

            if (uploadError) throw new Error(`Bild-Upload fehlgeschlagen: ${uploadError.message}`);
            
            const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(uploadData.path);
            if (!urlData?.publicUrl) {
                 await supabase.storage.from('project-images').remove([filePath]); // Clean up orphaned file
                 throw new Error("Konnte die URL des neuen Bildes nicht abrufen.");
            }
            
            finalImageUrl = urlData.publicUrl; 
            finalImagePath = uploadData.path; // This is the new storage path
            
            if (currentImagePath) {
              oldImagePath = currentImagePath; // Set old path to be deleted
            }
        }

        // 2. Prepare Project Data
        const projectUpdates = {
          title: title,
          'project-date': projectDate || null,
          image_url: finalImageUrl, 
          image_storage_path: finalImagePath, // Save the storage path!
          ai_description: aiDescription,
          notes: notes,
          status: isEditMode ? status : (publishImmediately ? 'Published' : 'Draft'),
          user_id: currentUser.id,
        };
        
        // 3. Upsert (Insert or Update) Project in DB
        let updatedProject: Project;

        if (isEditMode) {
          // --- UPDATE path ---
          const { data, error } = await supabase
            .from('projects')
            .update(projectUpdates)
            .eq('id', initialData.id)
            .select()
            .single();
          if (error) throw new Error(`Projekt konnte nicht gespeichert werden: ${error.message}`);
          updatedProject = data as Project;
        } else {
          // --- CREATE path ---
          const { data, error } = await supabase
            .from('projects')
            .insert(projectUpdates)
            .select()
            .single();
          if (error) throw new Error(`Projekt konnte nicht erstellt werden: ${error.message}`);
          updatedProject = data as Project;
        }

        // 4. Clean up old image (if a new one was uploaded and old one existed)
        if (oldImagePath && oldImagePath !== finalImagePath) {
            console.log("Attempting to delete old image:", oldImagePath);
            const { error: deleteError } = await supabase.storage.from('project-images').remove([oldImagePath]);
            if (deleteError) {
                console.warn("Could not delete old image, but DB was updated:", deleteError.message);
                toast.error("Altes Bild konnte nicht gelöscht werden, aber das Projekt wurde gespeichert.");
            }
        }
        
        return updatedProject; 
    }; 

    await toast.promise(savePromise(), {
        loading: isEditMode ? 'Änderungen werden gespeichert...' : 'Projekt wird erstellt...',
        success: (updatedProjectData) => {
            if (!isEditMode && updatedProjectData.status === 'Published' && userSlug) {
                // Special toast for "Create & Publish"
                const liveUrl = `/${userSlug}/portfolio/${updatedProjectData.id}`;
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-700 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-slate-600`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5"><CheckIcon className="h-6 w-6 text-green-500" /></div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-white">Projekt veröffentlicht!</p>
                                    <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-orange-400 font-bold underline hover:text-orange-300">
                                        Jetzt live ansehen →
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-slate-600"><button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none">Schließen</button></div>
                    </div>
                ), { duration: 10000 });
            }
            
            setTimeout(() => router.push('/dashboard/projekte'), 500); 
            return isEditMode ? 'Projekt erfolgreich gespeichert!' : 'Projekt erfolgreich erstellt!';
        },
        error: (err: any) => {
             return err.message || "Speichern fehlgeschlagen.";
        }
    });

    setSaving(false); 
  };


  // === Render Logic ===
  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : currentImageUrl;
  const isSaveDisabled = saving || aiLoading || isAnalyzingImage || !currentUser || (!isEditMode && !imageFile);

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-6">
      {/* Project Title */}
      <div>
        <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-300">Projekttitel *</label>
        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" />
      </div>

      {/* Current Image Preview & Upload */}
      <div>
         <label htmlFor="imageUpload" className="mb-2 block text-sm font-medium text-slate-300">
           {isEditMode ? "Projektbild ändern (Optional)" : "Projektbild *"}
         </label>
         
         {previewUrl && ( 
           <div className="mt-2 mb-4 relative group">
              <img src={previewUrl} alt="Projektbild-Vorschau" className="rounded-lg w-full max-h-60 object-cover border border-slate-700"/>
              <button
                type="button"
                onClick={handleImageAnalysis}
                disabled={isAnalyzingImage || aiLoading || saving}
                className="absolute top-3 right-3 inline-flex items-center gap-x-1.5 rounded-md bg-slate-900/70 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-900/90 backdrop-blur-sm border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PhotoIcon className={`h-4 w-4 ${isAnalyzingImage ? 'animate-spin' : ''}`} />
                {isAnalyzingImage ? 'Analysiere...' : 'Bild analysieren'}
              </button>
           </div>
         )}

         <input 
            type="file" 
            id="imageUpload" 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleFileChange} 
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-slate-800" 
            required={!isEditMode} // Only required if creating a new project
          />
         <p className="mt-1 text-xs text-slate-500">
           {isEditMode ? "Laden Sie eine neue Datei hoch, um das aktuelle Bild zu ersetzen." : "Ein Bild ist für jedes Projekt erforderlich."}
         </p>
      </div>
      
      {/* Notes Text Area */}
      <div>
        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-300">
          Materialien / Notizen
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
          placeholder="z.B. Verwendete Materialien: Eiche, Edelstahl..."
        />
        <p className="mt-1 text-xs text-slate-500">Diese Notizen helfen der AI, die Projektbeschreibung zu verbessern.</p>
      </div>

      {/* AI Description */}
      <div>
          <label htmlFor="aiDescription" className="mb-2 block text-sm font-medium text-slate-300">Projektbeschreibung</label>
          <div className="relative">
              <textarea id="aiDescription" rows={6} value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28" placeholder="Klicken Sie auf 'Generieren'..." />
              <button type="button" 
                onClick={handleGenerateDescription} 
                disabled={aiLoading || isAnalyzingImage || !title.trim()}
                className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${ 
                  aiLoading || isAnalyzingImage || !title.trim() ? 'bg-slate-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700' 
                }`} >
                 <SparklesIcon className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                 {aiLoading ? 'Generiere...' : 'Generieren'}
              </button>
          </div>
           <p className="mt-1 text-xs text-slate-500">Sie können die Beschreibung bearbeiten.</p>
      </div>

      {/* Project Date */}
      <div>
        <label htmlFor="projectDate" className="mb-2 block text-sm font-medium text-slate-300">Datum der Fertigstellung (Optional)</label>
        <input type="date" id="projectDate" value={projectDate} onChange={(e) => setProjectDate(e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" />
      </div>

      {/* Status Select (Show in Edit Mode) or Publish Checkbox (Show in New Mode) */}
      {isEditMode ? (
        <div>
            <label htmlFor="status" className="mb-2 block text-sm font-medium text-slate-300">Status</label>
            <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Draft' | 'Published')}
                className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            >
                <option value="Draft">Entwurf</option>
                <option value="Published">Veröffentlicht</option>
            </select>
        </div>
      ) : (
        <div className="relative flex items-start">
            <div className="flex h-6 items-center">
                <input
                id="publishImmediately"
                name="publishImmediately"
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-orange-600 focus:ring-orange-600 focus:ring-offset-slate-800"
                />
            </div>
            <div className="ml-3 text-sm leading-6">
                <label htmlFor="publishImmediately" className="font-medium text-slate-300">
                Sofort veröffentlichen
                </label>
                <p className="text-slate-500 text-xs">
                 Wenn aktiviert, ist dieses Projekt sofort auf Ihrer Webseite sichtbar.
                </p>
            </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 border-t border-slate-700 pt-6 mt-8">
         <Link href="/dashboard/projekte" className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">
            Abbrechen
         </Link>
         <button
          type="submit"
          disabled={isSaveDisabled}
          className={`inline-flex items-center gap-x-2 rounded-md px-5 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors ${
            isSaveDisabled
              ? 'bg-orange-300 cursor-not-allowed'
              : 'bg-orange-600 hover:bg-orange-700 shadow-sm'
          }`}
        >
          {saving ? <ArrowPathIcon className="h-4 w-4" /> : <CheckIcon className="h-4 w-4"/>}
          {saving ? 'Wird gespeichert...' : (isEditMode ? 'Änderungen speichern' : 'Projekt erstellen')}
        </button>
      </div>
    </form>
  );
}