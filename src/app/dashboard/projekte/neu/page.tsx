// Mark as client component for interactivity
"use client";

// Import necessary hooks and components
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Standard Next.js import
import Link from 'next/link'; // Standard Next.js import
// Reverting to path alias - ensure tsconfig.json is correct
import { supabase } from '@/lib/supabaseClient'; 
import { User } from '@supabase/supabase-js'; // Import User type

// Icon for the AI button
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );


export default function NewProjectPage() {
  // === State Variables ===
  const [title, setTitle] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiDescription, setAiDescription] = useState(''); 
  const [publishImmediately, setPublishImmediately] = useState(false); // *** NEW STATE for publish toggle ***
  const [aiLoading, setAiLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); 
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const router = useRouter();

  // === Get Current User on Load ===
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (!user) {
        router.push('/login');
      }
    };
    getUser();
  }, [router]);

  // === Handle File Selection ===
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setImageFile(event.target.files[0]);
    } else {
      setImageFile(null);
    }
  };

  // Function to Generate AI Description
  const handleGenerateDescription = async () => {
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
      setAiDescription(''); 
    } finally {
      setAiLoading(false);
    }
  };


  // === Handle Form Submission (Updated) ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); 

    if (!currentUser || !imageFile) {
        setError("User not loaded or image not selected.");
        return;
    }
   
    setLoading(true); 
    setError(null);

    const userId = currentUser.id;
    const file = imageFile;
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    console.log("Form submitted!");
    console.log("Attempting to upload file:", filePath);

    // Step 1: Upload Image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project-images').upload(filePath, file);

    if (uploadError) { 
        console.error('Error uploading image:', uploadError);
        setError(`Failed to upload image: ${uploadError.message}`);
        setLoading(false);
        return;
    }
    console.log("Image uploaded successfully:", uploadData);

    // Step 2: Get Public URL
    const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(uploadData.path);
    const imageUrl = urlData?.publicUrl;
    console.log("Public Image URL:", imageUrl);
    if (!imageUrl) { 
        setError("Could not get image URL after upload.");
        setLoading(false);
        await supabase.storage.from('project-images').remove([filePath]);
        return;
    }

    const projectStatus = publishImmediately ? 'Published' : 'Draft';

    // Step 3: Insert Project Data
    console.log("Submitting project data to table:", { 
        title: title,
        'project-date': projectDate || null,
        user_id: userId,
        image_url: imageUrl,
        ai_description: aiDescription, 
        status: projectStatus, 
    });
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
      .select();

    console.log("Supabase insert response:", { insertData, insertError });
    setLoading(false); 

    if (insertError) { 
        console.error('Error creating project:', insertError);
        setError(`Failed to create project: ${insertError.message}`);
        await supabase.storage.from('project-images').remove([filePath]);
    } else {
      console.log('Project created successfully!');
      router.push('/dashboard'); 
      router.refresh();
    }
  };

  // === JSX Structure (Updated) ===
  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Neues Projekt erstellen</h1>
        <p className="text-slate-400 mt-1">Geben Sie die Details ein, laden Sie ein Bild hoch und generieren Sie die Beschreibung.</p>
      </div>

      {/* Form Section */}
      <div className="mt-8 max-w-xl space-y-6">

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
          {imageFile && <p className="mt-2 text-xs text-slate-500">Selected: {imageFile.name}</p>}
        </div>

        {/* AI Description Section */}
        <div>
            <label htmlFor="aiDescription" className="mb-2 block text-sm font-medium text-slate-300">
                Projektbeschreibung (AI generiert)
            </label>
            <div className="relative">
                <textarea
                    id="aiDescription"
                    rows={6} // Increased rows
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)} 
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28" 
                    placeholder="Klicken Sie auf 'Generieren', um eine Beschreibung zu erstellen..."
                />
                <button
                    type="button" 
                    onClick={handleGenerateDescription}
                    disabled={aiLoading || !title.trim()} 
                    className={`absolute top-2 right-2 inline-flex items-center gap-x-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors ${
                        aiLoading || !title.trim()
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


        {/* Error Message Display */}
        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 border-t border-slate-700 pt-6 mt-8">
           <Link href="/dashboard" className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">
              Abbrechen
           </Link>
           <button
            type="button" 
            onClick={(e) => handleSubmit(e as any)} 
            disabled={loading || !currentUser || !imageFile || aiLoading} 
            className={`rounded-md px-5 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 transition-colors ${
              loading || !currentUser || !imageFile || aiLoading
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 shadow-sm'
            }`}
          >
            {loading ? 'Speichern...' : 'Projekt erstellen & Speichern'}
          </button>
        </div>
      </div>
    </main>
  );
}

