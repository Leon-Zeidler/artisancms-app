// src/app/dashboard/projekte/[id]/edit/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
type Project = {
  id: string;
  title: string | null;
  'project-date': string | null;
  image_url: string | null;
  ai_description: string | null;
  notes: string | null; // <-- Added notes
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
  user_id: string;
};

// Helper function
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


export default function EditProjectPage() {
  // === State Variables ===
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null); 
  const [aiDescription, setAiDescription] = useState('');
  const [notes, setNotes] = useState(''); // <-- Added notes state
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft');
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null); 

  const [aiLoading, setAiLoading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false); // <-- Added
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  // === Fetch Existing Project Data ===
  useEffect(() => {
    const getUserAndProject = async () => {
      setLoading(true); setGeneralError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht eingeloggt."); router.push('/login'); return;
      }
      setCurrentUser(user);

      if (!projectId) {
         setGeneralError("Projekt-ID fehlt."); setLoading(false); return;
      }

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*') // Selects all fields, including new 'notes'
          .eq('id', projectId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Projekt nicht gefunden oder Zugriff verweigert.");

        setProject(data as Project);
        setTitle(data.title || '');
        setProjectDate(data['project-date'] ? new Date(data['project-date']).toISOString().split('T')[0] : '');
        setAiDescription(data.ai_description || '');
        setNotes(data.notes || ''); // <-- SET NOTES
        setStatus(data.status === 'Published' ? 'Published' : 'Draft');
        setCurrentImageUrl(data.image_url);

      } catch (err: any) {
        console.error("Error fetching project:", err);
        setGeneralError(`Fehler beim Laden des Projekts: ${err.message}`);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    getUserAndProject();
  }, [projectId, router]);


  // === Handle File Selection ===
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setImageFile(file);
      // Clear notes when a new image is selected, as it's no longer accurate
      setNotes("");
      setAiDescription("");
    } else {
      setImageFile(null);
    }
  };

  // --- NEW: Handler for Image Analysis ---
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
        // We must fetch the image, convert it to a blob, then to base64
        const response = await fetch(currentImageUrl);
        if (!response.ok) throw new Error("Konnte aktuelles Bild nicht laden.");
        const blob = await response.blob();
        mimeType = blob.type;
        // Convert blob to base64
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = (error) => reject(error);
        });
      } 
      // 3. If no image exists, throw error
      else {
        throw new Error("Kein Bild zum Analysieren gefunden.");
      }

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
          setNotes(description); // Set the notes field with the result
          setIsAnalyzingImage(false);
          return 'Bildanalyse erfolgreich!';
        },
        error: (err: any) => {
          setNotes(project?.notes || ""); // Restore original notes on error
          setIsAnalyzingImage(false);
          return `Fehler: ${err.message}`;
        }
      }
    );
  };

  // === Handle AI Description Generation (FIXED) ===
  const handleGenerateDescription = async () => { 
    if (!title.trim()) { 
      toast.error("Bitte geben Sie zuerst einen Projekttitel ein."); 
      return; 
    } 
    setAiLoading(true); 
    
    await toast.promise( 
      fetch('/api/generate-description', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title: title, notes: notes }), // <-- SEND NOTES
      }).then(async (response) => { 
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Generierung fehlgeschlagen');
        }
        return response.json(); 
      }), 
      { 
        loading: 'Beschreibung wird generiert...', 
        success: (data) => {
          setAiDescription(data.description); 
          return 'Beschreibung generiert!'; 
        }, 
        error: (err) => `Fehler: ${err.message}`, 
      } 
    ); 
    setAiLoading(false); 
  };


  // === Handle Form Submission ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || !project) {
        toast.error("Benutzer- oder Projektdaten fehlen."); return;
    }

    setSaving(true);

    const savePromise = async () => {
        let finalImageUrl = currentImageUrl; 
        let newImagePath: string | null = null;
        let oldImagePath: string | null = null;

        if (imageFile) {
            console.log("New image file selected, attempting upload...");
            const file = imageFile;
            const fileExtension = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExtension}`;
            const filePath = `${currentUser.id}/${fileName}`;
            newImagePath = filePath; 

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('project-images').upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading new image:', uploadError);
                throw new Error(`Neues Bild konnte nicht hochgeladen werden: ${uploadError.message}`);
            }
            console.log("New image uploaded successfully:", uploadData);

            const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(uploadData.path);
            if (!urlData?.publicUrl) {
                 await supabase.storage.from('project-images').remove([filePath]);
                 throw new Error("Konnte die URL des neuen Bildes nicht abrufen.");
            }
            finalImageUrl = urlData.publicUrl; 
            console.log("New Public Image URL:", finalImageUrl);

            if (currentImageUrl) {
                 try {
                    const url = new URL(currentImageUrl);
                    // --- FIX: Changed slice(4) to slice(6) ---
                    oldImagePath = url.pathname.split('/').slice(6).join('/'); 
                    if (oldImagePath) {
                         console.log("Attempting to delete old image:", oldImagePath);
                         const { error: deleteError } = await supabase.storage.from('project-images').remove([oldImagePath]);
                         if (deleteError) {
                             console.warn("Could not delete old image, proceeding anyway:", deleteError.message);
                         } else {
                             console.log("Old image deleted successfully.");
                         }
                    }
                 } catch (e) {
                     console.warn("Could not parse or delete old image URL:", currentImageUrl, e);
                 }
            }
        } 

        // --- Update Project Data in Database ---
        const projectUpdates = {
          title: title,
          'project-date': projectDate || null,
          image_url: finalImageUrl, 
          ai_description: aiDescription,
          notes: notes, // <-- ADD NOTES
          status: status,
        };

        console.log("Updating project data in DB:", projectUpdates);
        const { data: updateData, error: updateError } = await supabase
          .from('projects')
          .update(projectUpdates)
          .eq('id', projectId) 
          .eq('user_id', currentUser.id) 
          .select() 
          .single(); 

        if (updateError) {
             console.error('Error updating project in DB:', updateError);
             if (newImagePath) {
                  console.log("DB update failed, attempting to remove newly uploaded image:", newImagePath);
                  await supabase.storage.from('project-images').remove([newImagePath]);
             }
             throw new Error(`Projekt konnte nicht gespeichert werden: ${updateError.message}`);
        }

        console.log('Project updated successfully in DB:', updateData);
        return updateData; 
    }; 

    await toast.promise(savePromise(), {
        loading: 'Änderungen werden gespeichert...',
        success: (updatedProjectData) => {
            setCurrentImageUrl(updatedProjectData.image_url); 
            setImageFile(null); 
            setTimeout(() => router.push('/dashboard/projekte'), 1000); 
            return 'Projekt erfolgreich gespeichert!';
        },
        error: (err: any) => {
             return err.message || "Speichern fehlgeschlagen.";
        }
    });

    setSaving(false); 
  };


  // === Render Logic ===
  if (loading) { return <div className="p-8 text-center text-slate-400">Lade Projekt...</div>; }
  if (generalError) { return <div className="p-8 text-center text-red-500">{generalError}</div>; }
  if (!project) { return <div className="p-8 text-center text-slate-400">Projekt nicht gefunden.</div>; } 

  const previewUrl = imageFile ? URL.createObjectURL(imageFile) : currentImageUrl;

  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Projekt bearbeiten</h1>
        <p className="text-slate-400 mt-1">Aktualisieren Sie die Details Ihres Projekts.</p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-6">

        {/* Project Title */}
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-300">Projekttitel *</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" />
        </div>

        {/* Current Image Preview & Upload */}
        <div>
           <label htmlFor="imageUpload" className="mb-2 block text-sm font-medium text-slate-300">Projektbild ändern (Optional)</label>
           
           {previewUrl && ( 
             <div className="mt-2 mb-4 relative group">
                <img src={previewUrl} alt={imageFile ? "Neues Bild Vorschau" : "Aktuelles Projektbild"} className="rounded-lg w-full max-h-60 object-cover border border-slate-700"/>
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

           <input type="file" id="imageUpload" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-slate-800" />
           <p className="mt-1 text-xs text-slate-500">Laden Sie eine neue Datei hoch, um das aktuelle Bild zu ersetzen.</p>
        </div>
        
        {/* --- ADDED NOTES TEXT AREA --- */}
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
                  disabled={aiLoading || isAnalyzingImage || !title.trim()} // <-- UPDATED DISABLED STATE
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

        {/* Status Select */}
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


        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 border-t border-slate-700 pt-6 mt-8">
           <Link href="/dashboard/projekte" className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">
              Abbrechen
           </Link>
           <button
            type="submit"
            disabled={saving || aiLoading || isAnalyzingImage} // <-- UPDATED DISABLED STATE
            className={`inline-flex items-center gap-x-2 rounded-md px-5 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors ${
              saving || aiLoading || isAnalyzingImage
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 shadow-sm'
            }`}
          >
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckIcon className="h-4 w-4"/>}
            {saving ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </button>
        </div>
      </form>
    </main>
  );
}