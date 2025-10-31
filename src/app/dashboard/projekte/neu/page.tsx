// src/app/dashboard/projekte/neu/page.tsx
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


const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Result is 'data:image/jpeg;base64,L2[...]'. We need to split off the prefix.
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};


export default function NewProjectPage() {
  // === State Variables ===
  const [title, setTitle] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [aiDescription, setAiDescription] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(false);
  
  const [aiLoading, setAiLoading] = useState(false); // For text generation
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [loading, setLoading] = useState(false); // For saving
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);

  const router = useRouter();

  // === Get Current User & Slug on Load ===
  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (!user) {
        toast.error("Nicht eingeloggt.");
        router.push('/login');
        return;
      }
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('slug')
        .eq('id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
         console.error("Error fetching profile slug:", error);
         toast.error("Profil-Daten konnten nicht geladen werden.");
      } else if (profile && profile.slug) {
        setUserSlug(profile.slug);
      } else {
        console.warn("User has no slug. 'View Live' link will not work.");
        toast.error("Profil unvollständig. Bitte gehen Sie zu den Einstellungen und legen Sie einen URL-Pfad (Slug) fest.", { duration: 6000 });
      }
    };
    getUserAndProfile();
  }, [router]);

  // === Handle File Selection ===
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setImageFile(file);
      // Create a URL for image preview
      setImagePreview(URL.createObjectURL(file));
      // Clear old notes when a new image is selected
      setNotes("");
      setAiDescription("");
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // --- NEW: Handler for Image Analysis ---
  const handleImageAnalysis = async () => {
    if (!imageFile) {
      toast.error("Bitte wählen Sie zuerst ein Bild aus.");
      return;
    }

    setIsAnalyzingImage(true);
    setNotes("Analysiere Bild..."); // Placeholder

    const analysisPromise = async () => {
      // Convert file to base64
      const imageData = await fileToBase64(imageFile);
      const mimeType = imageFile.type;

      // Call our new API route
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData, mimeType }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze image');
      }
      
      return result.description; // This is the text from the AI
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
          setNotes(""); // Clear notes on error
          setIsAnalyzingImage(false);
          return `Fehler: ${err.message}`;
        }
      }
    );
  };

  // Function to Generate AI Description
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
            success: (data) => {
                setAiDescription(data.description);
                return 'Beschreibung erfolgreich generiert!';
            },
            error: (err: any) => `Fehler: ${err.message}`,
        }
    );
    setAiLoading(false);
  };


  // === Handle Form Submission (Updated with toast.promise) ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 

    if (!currentUser) {
        toast.error("Benutzer nicht gefunden. Bitte neu einloggen.");
        return;
    }
    if (!imageFile) {
         toast.error("Bitte wählen Sie ein Projektbild aus.");
         return;
    }
    if (!userSlug) { 
         toast.error("Profil-Slug nicht gefunden. Bitte speichern Sie Ihren URL-Pfad in den Einstellungen, bevor Sie ein Projekt erstellen.", { duration: 6000 });
         return;
    }

    setLoading(true);

    const saveProjectPromise = async () => {
        const userId = currentUser.id;
        const file = imageFile;
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExtension}`;
        const filePath = `${userId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-images').upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw new Error(`Bild-Upload fehlgeschlagen: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(uploadData.path);
        const imageUrl = urlData?.publicUrl;
        if (!imageUrl) {
            await supabase.storage.from('project-images').remove([filePath]);
            throw new Error("Konnte die Bild-URL nach dem Upload nicht abrufen.");
        }

        const projectStatus = publishImmediately ? 'Published' : 'Draft';

        const { data: insertData, error: insertError } = await supabase
          .from('projects')
          .insert([ {
              title: title,
              'project-date': projectDate || null,
              user_id: userId,
              image_url: imageUrl,
              ai_description: aiDescription,
              status: projectStatus,
          }])
          .select()
          .single(); 

        if (insertError) {
            console.error('Error creating project:', insertError);
            await supabase.storage.from('project-images').remove([filePath]);
            throw new Error(`Projekt konnte nicht erstellt werden: ${insertError.message}`);
        }

        return { newProject: insertData, status: projectStatus };
    };

    await toast.promise(
        saveProjectPromise(),
        {
            loading: 'Projekt wird erstellt...',
            success: (data) => {
                const { newProject, status } = data;
                console.log('Project created successfully!', newProject);
                
                if (status === 'Published' && userSlug && newProject?.id) {
                    const liveUrl = `/${userSlug}/portfolio/${newProject.id}`;
                    
                    toast.custom((t) => (
                        <div
                            className={`${
                                t.visible ? 'animate-enter' : 'animate-leave'
                            } max-w-md w-full bg-slate-700 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-slate-600`}
                        >
                            <div className="flex-1 w-0 p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 pt-0.5">
                                        <CheckIcon className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm font-medium text-white">
                                            Projekt veröffentlicht!
                                        </p>
                                        <a
                                            href={liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 text-sm text-orange-400 font-bold underline hover:text-orange-300"
                                        >
                                            Jetzt live ansehen →
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-l border-slate-600">
                                <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-white focus:outline-none"
                                >
                                    Schließen
                                </button>
                            </div>
                        </div>
                    ), { duration: 10000 }); 

                    router.push('/dashboard/projekte');
                    return ""; 
                } else {
                    router.push('/dashboard/projekte'); 
                    return 'Projekt erfolgreich als Entwurf gespeichert!';
                }
            },
            error: (err: any) => {
                console.error("Fehler beim Erstellen des Projekts:", err);
                return `${err.message}`;
            }
        }
    );

    setLoading(false);
  };

  // === JSX Structure ===
  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Neues Projekt erstellen</h1>
        <p className="text-slate-400 mt-1">Geben Sie die Details ein, laden Sie ein Bild hoch und generieren Sie die Beschreibung.</p>
      </div>

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
            placeholder="z.B. Badsanierung Familie Meier"
            required
          />
        </div>

        {/* Image Upload Input */}
        <div>
           <label htmlFor="imageUpload" className="mb-2 block text-sm font-medium text-slate-300">
            Projektbild *
          </label>
           <input
            type="file" id="imageUpload" accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 focus:ring-offset-slate-800"
            required
          />
          {/* --- NEW: Image Preview & Analyze Button --- */}
          {imagePreview && (
            <div className="mt-4 relative group">
              <img src={imagePreview} alt="Projekt-Vorschau" className="rounded-lg w-full max-h-60 object-cover border border-slate-700" />
              <button
                type="button"
                onClick={handleImageAnalysis}
                disabled={!imageFile || isAnalyzingImage || aiLoading || loading}
                className="absolute top-3 right-3 inline-flex items-center gap-x-1.5 rounded-md bg-slate-900/70 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-900/90 backdrop-blur-sm border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PhotoIcon className={`h-4 w-4 ${isAnalyzingImage ? 'animate-spin' : ''}`} />
                {isAnalyzingImage ? 'Analysiere...' : 'Bild analysieren'}
              </button>
            </div>
          )}
        </div>

        {/* Notes Field */}
        <div>
          <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-300">
            Materialien / Notizen (AI-generiert)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
            placeholder="Klicken Sie auf 'Bild analysieren', um dieses Feld automatisch auszufüllen..."
          />
          <p className="mt-1 text-xs text-slate-500">Diese Notizen helfen der AI, die Projektbeschreibung zu verbessern.</p>
        </div>

        {/* AI Description Section */}
        <div>
            <label htmlFor="aiDescription" className="mb-2 block text-sm font-medium text-slate-300">
                Projektbeschreibung (AI-generiert)
            </label>
            <div className="relative">
                <textarea
                    id="aiDescription"
                    rows={6}
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28"
                    placeholder="Klicken Sie auf 'Generieren', um eine Beschreibung zu erstellen..."
                />
                <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={aiLoading || isAnalyzingImage || !title.trim()}
                    className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${
                        aiLoading || isAnalyzingImage || !title.trim()
                         ? 'bg-slate-600 cursor-not-allowed'
                         : 'bg-orange-600 hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500'
                    }`}
                >
                   <SparklesIcon className={`h-4 w-4 ${aiLoading ? 'animate-spin' : ''}`} />
                   {aiLoading ? 'Generiere...' : 'Generieren'}
                </button>
            </div>
             <p className="mt-1 text-xs text-slate-500">Sie können die generierte Beschreibung bearbeiten.</p>
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

        {/* Publish Immediately Checkbox */}
        <div className="relative flex items-start">
            <div className="flex h-6 items-center">
                <input
                id="publishImmediately"
                aria-describedby="publish-description"
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
                <p id="publish-description" className="text-slate-500 text-xs">
                 Wenn aktiviert, wird dieses Projekt direkt auf Ihrer öffentlichen Webseite sichtbar sein.
                </p>
            </div>
        </div>


        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 border-t border-slate-700 pt-6 mt-8">
           <Link href="/dashboard" className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">
              Abbrechen
           </Link>
           <button
            type="submit"
            disabled={loading || !currentUser || aiLoading || isAnalyzingImage}
            className={`inline-flex items-center gap-x-2 rounded-md px-5 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors ${
              loading || !currentUser || aiLoading || isAnalyzingImage
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 shadow-sm'
            }`}
          >
            {loading ? <ArrowPathIcon className="h-4 w-4" /> : null}
            {loading ? 'Speichern...' : 'Projekt erstellen & Speichern'}
          </button>
        </div>
      </form>
    </main>
  );
}
