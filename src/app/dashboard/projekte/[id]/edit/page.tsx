// src/app/dashboard/projekte/[id]/edit/page.tsx
"use client";

// Import necessary hooks and components
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Import useParams
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient'; // Adjusted path alias
import { User } from '@supabase/supabase-js';

// --- TYPE DEFINITIONS --- (Ensure consistency)
type Project = {
  id: string;
  title: string | null;
  'project-date': string | null;
  image_url: string | null;
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
  ai_description: string | null;
  user_id?: string; // Add user_id if needed for checks
};

// --- ICONS ---
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );


export default function EditProjectPage() {
  // === State Variables ===
  const [project, setProject] = useState<Project | null>(null); // Holds the fetched project data
  const [title, setTitle] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null); // For replacing the image
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null); // Display current image
  const [aiDescription, setAiDescription] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Published'>('Draft');
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Initial data loading state
  const [saving, setSaving] = useState(false); // Form saving state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const router = useRouter();
  const params = useParams();
  // Ensure 'id' is treated as a string
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  // === Fetch Project Data on Load ===
  const fetchProjectData = useCallback(async (id: string, user: User) => {
    setLoading(true);
    setError(null);
    console.log(`Fetching project data for edit: ${id}`);

    const { data, error: fetchError } = await supabase
      .from('projects')
      .select(`*`) // Select all columns for editing
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this project
      .single();

    if (fetchError || !data) {
      console.error('Error fetching project or not found/authorized:', fetchError);
      setError('Projekt nicht gefunden oder Zugriff verweigert.');
      setProject(null);
    } else {
      console.log('Fetched project data:', data);
      setProject(data);
      // Pre-fill form state
      setTitle(data.title || '');
      // Format date correctly for input type="date" (YYYY-MM-DD)
      const dateStr = data['project-date'];
      setProjectDate(dateStr ? new Date(dateStr).toISOString().split('T')[0] : '');
      setAiDescription(data.ai_description || '');
      setStatus(data.status === 'Published' ? 'Published' : 'Draft');
      setCurrentImageUrl(data.image_url); // Store current image URL
    }
    setLoading(false);
  }, []); // useCallback dependencies are empty as it relies on passed args

  // === Get User and Fetch Data ===
  useEffect(() => {
    const getUserAndData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);

      if (projectId) {
        fetchProjectData(projectId, user);
      } else {
        setError("Projekt-ID fehlt.");
        setLoading(false);
      }
    };
    getUserAndData();
  }, [projectId, router, fetchProjectData]);


  // === Handle File Selection ===
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear errors on new file selection
    if (event.target.files && event.target.files.length > 0) {
      setNewImageFile(event.target.files[0]);
    } else {
      setNewImageFile(null);
    }
  };

  // === Handle AI Description Generation ===
  const handleGenerateDescription = async () => {
    // ... (logic remains the same as in NewProjectPage) ...
    if (!title.trim()) {
      setError("Bitte geben Sie zuerst einen Projekttitel ein.");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate description');
      }
      const data = await response.json();
      setAiDescription(data.description);
    } catch (err) {
      console.error("Error calling generation API:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Fehler bei der Beschreibungserstellung: ${message}`);
      setAiDescription(aiDescription || ''); // Revert or keep old on error
    } finally {
      setAiLoading(false);
    }
  };

  // === Extract Image Path from URL ===
  const getImagePathFromUrl = (imageUrl: string | null): string | null => {
      if (!imageUrl) return null;
      try {
          const url = new URL(imageUrl);
          // Assuming structure: /object/public/bucket-name/user-id/file-name.ext
          const pathParts = url.pathname.split('/');
          if (pathParts.length >= 5 && pathParts[3] === 'project-images') {
              return pathParts.slice(4).join('/'); // Returns 'user-id/file-name.ext'
          }
          console.warn("Could not determine image path structure from URL:", imageUrl);
          return null; // Fallback if structure is unexpected
      } catch (e) {
          console.error("Could not parse image URL to get path:", e);
          return null;
      }
  };


  // === Handle Form Submission (Update Project) ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentUser || !project) {
      setError("Benutzer- oder Projektdaten fehlen.");
      return;
    }

    setSaving(true);
    setError(null);

    let newImageUrl = project.image_url; // Start with the existing image URL
    let oldImagePath: string | null = null; // To delete the old image if a new one is uploaded

    // Step 1: Upload NEW Image (if provided)
    if (newImageFile) {
      console.log("New image file selected, attempting upload...");
      const file = newImageFile;
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExtension}`;
      const newFilePath = `${currentUser.id}/${fileName}`; // Path in storage

      // Upload the new image
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images').upload(newFilePath, file);

      if (uploadError) {
        console.error('Error uploading new image:', uploadError);
        setError(`Fehler beim Hochladen des neuen Bildes: ${uploadError.message}`);
        setSaving(false);
        return;
      }
      console.log("New image uploaded successfully:", uploadData);

      // Get Public URL for the new image
      const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(uploadData.path);
      newImageUrl = urlData?.publicUrl; // Update image URL to the new one
      console.log("New Public Image URL:", newImageUrl);
      if (!newImageUrl) {
        setError("Konnte die neue Bild-URL nach dem Upload nicht erhalten.");
        setSaving(false);
        // Attempt to clean up the newly uploaded file if URL retrieval fails
        await supabase.storage.from('project-images').remove([newFilePath]);
        return;
      }

      // Mark the old image path for deletion (if it exists)
      oldImagePath = getImagePathFromUrl(project.image_url);
      console.log("Old image path marked for deletion:", oldImagePath);
    }

    // Step 2: Update Project Data in Database
    const updateData = {
      title: title,
      'project-date': projectDate || null,
      ai_description: aiDescription,
      status: status,
      image_url: newImageUrl, // Use the potentially updated URL
      updated_at: new Date().toISOString(),
    };

    console.log("Updating project data in DB:", updateData);
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', project.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project:', updateError);
      setError(`Fehler beim Speichern des Projekts: ${updateError.message}`);
      // If DB update fails BUT we uploaded a new image, try to delete the newly uploaded image
      if (newImageFile && newImageUrl) {
         const newlyUploadedPath = getImagePathFromUrl(newImageUrl);
         if (newlyUploadedPath) {
             console.log("Attempting to clean up newly uploaded image due to DB error:", newlyUploadedPath);
             await supabase.storage.from('project-images').remove([newlyUploadedPath]);
         }
      }
      setSaving(false);
      return;
    }

    console.log('Project updated successfully!', updatedProject);

    // Step 3: Delete Old Image from Storage (if a new one was uploaded successfully)
    if (oldImagePath) {
        console.log("Attempting to delete old image:", oldImagePath);
        const { error: removeError } = await supabase.storage.from('project-images').remove([oldImagePath]);
        if (removeError) {
            console.error("Error deleting old image:", removeError);
            // Non-critical error, maybe log it but don't block the user
            // setError("Projekt gespeichert, aber altes Bild konnte nicht gelöscht werden.");
        } else {
            console.log("Old image deleted successfully.");
        }
    }

    setSaving(false);
    router.push('/dashboard/projekte'); // Redirect back to the list
    router.refresh(); // Optional: force refresh if needed
  };

  // === Render Logic ===
  if (loading) {
    return <div className="p-8 text-slate-400">Lade Projektdaten...</div>;
  }

  if (error && !project) { // Show error prominently if project couldn't be loaded
    return <div className="p-8 text-red-500">{error}</div>;
  }

  if (!project) { // Should be covered by error, but as a fallback
      return <div className="p-8 text-slate-400">Projekt nicht verfügbar.</div>;
  }

  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Projekt bearbeiten</h1>
        <p className="text-slate-400 mt-1">Aktualisieren Sie die Details für "{project.title || 'Unbenanntes Projekt'}".</p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-6">

        {/* Project Title Input */}
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-300">
            Projekttitel *
          </label>
          <input
            type="text" id="title" value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            required
          />
        </div>

        {/* Current Image Display & Upload */}
        <div>
          <label htmlFor="imageUpload" className="mb-2 block text-sm font-medium text-slate-300">
            Projektbild (Optional: Neues Bild hochladen zum Ersetzen)
          </label>
          {currentImageUrl && (
            <div className='mb-4'>
                <img
                    src={currentImageUrl}
                    alt="Aktuelles Projektbild"
                    className="w-48 h-auto rounded-md border border-slate-700 object-cover"
                    onError={(e) => e.currentTarget.style.display='none'} // Hide if error loading
                />
                 <p className="mt-1 text-xs text-slate-500">Aktuelles Bild</p>
            </div>
          )}
          <input
            type="file" id="imageUpload" accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-slate-800"
          />
          {newImageFile && <p className="mt-2 text-xs text-slate-500">Neue Auswahl: {newImageFile.name}</p>}
        </div>

        {/* AI Description Section */}
        <div>
            <label htmlFor="aiDescription" className="mb-2 block text-sm font-medium text-slate-300">
                Projektbeschreibung
            </label>
            <div className="relative">
                <textarea
                    id="aiDescription"
                    rows={6}
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28"
                    placeholder="Beschreiben Sie das Projekt..."
                />
                <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={aiLoading || !title.trim()}
                    className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${
                        aiLoading || !title.trim()
                         ? 'bg-slate-600 cursor-not-allowed'
                         : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                >
                   <SparklesIcon className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                   {aiLoading ? 'Generiere...' : 'Generieren'}
                </button>
            </div>
             <p className="mt-1 text-xs text-slate-500">Sie können die Beschreibung bearbeiten oder neu generieren.</p>
        </div>

        {/* Project Date Input */}
        <div>
          <label htmlFor="projectDate" className="mb-2 block text-sm font-medium text-slate-300">
            Datum der Fertigstellung (Optional)
          </label>
          <input
            type="date" id="projectDate" value={projectDate}
            onChange={(e) => setProjectDate(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
          />
        </div>

        {/* Status Selection */}
        <div className="relative flex items-start">
            <div className="flex h-6 items-center">
                <input
                id="status"
                aria-describedby="status-description"
                name="status"
                type="checkbox"
                checked={status === 'Published'}
                onChange={(e) => setStatus(e.target.checked ? 'Published' : 'Draft')}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-orange-600 focus:ring-orange-600 focus:ring-offset-slate-800"
                />
            </div>
            <div className="ml-3 text-sm leading-6">
                <label htmlFor="status" className="font-medium text-slate-300">
                 Veröffentlicht
                </label>
                <p id="status-description" className="text-slate-500 text-xs">
                 Soll dieses Projekt auf Ihrer öffentlichen Webseite sichtbar sein?
                </p>
            </div>
        </div>


        {/* Error Message Display */}
        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 border-t border-slate-700 pt-6 mt-8">
           <Link href="/dashboard/projekte" className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">
              Abbrechen
           </Link>
           <button
            type="submit"
            disabled={saving || loading || aiLoading} // Disable if initially loading, saving, or AI running
            className={`rounded-md px-5 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors ${
              saving || loading || aiLoading
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 shadow-sm'
            }`}
          >
            {saving ? 'Speichern...' : 'Änderungen speichern'}
          </button>
        </div>
      </form>
    </main>
  );
}
