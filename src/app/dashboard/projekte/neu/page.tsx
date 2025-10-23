// Mark as client component for interactivity
"use client";

// Import necessary hooks and components
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use standard Next.js import
import Link from 'next/link'; // Use standard Next.js import
// Use relative path to ensure resolution
import { supabase } from '../../../../lib/supabaseClient'; 
import { User } from '@supabase/supabase-js'; // Import User type

// *** NEW *** Icon for the AI button
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" />
    </svg>
);


export default function NewProjectPage() {
  // === State Variables ===
  const [title, setTitle] = useState('');
  const [projectDate, setProjectDate] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [aiDescription, setAiDescription] = useState(''); // *** NEW *** State for AI description
  const [aiLoading, setAiLoading] = useState(false); // *** NEW *** Loading state for AI button
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // Main form loading state
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

  // *** NEW *** Function to Generate AI Description
  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      setError("Bitte geben Sie zuerst einen Projekttitel ein.");
      return;
    }
    setAiLoading(true);
    setError(null);

    try {
      // Call our own API route
      const response = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title }), // Send the title
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate description');
      }

      const data = await response.json();
      setAiDescription(data.description); // Update state with the result

    } catch (err) {
      console.error("Error calling generation API:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setError(`Fehler bei der Beschreibungserstellung: ${message}`);
      setAiDescription(''); // Clear description on error
    } finally {
      setAiLoading(false);
    }
  };


  // === Handle Form Submission (Updated) ===
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent default page reload if called from form submit

    if (!currentUser || !imageFile) {
        setError("User not loaded or image not selected.");
        return;
    }
    // Optional check: You might decide AI description is mandatory
    // if (!aiDescription.trim()) {
    //   setError("Please generate or enter a description before saving.");
    //   return;
    // }

    setLoading(true); // Use main loading state now
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

    if (uploadError) { /* ... error handling ... */
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
    if (!imageUrl) { /* ... error handling ... */
        setError("Could not get image URL after upload.");
        setLoading(false);
        await supabase.storage.from('project-images').remove([filePath]);
        return;
    }

    // Step 3: Insert Project Data (including AI description)
    console.log("Submitting project data to table:", { /* ... data ... */
        title: title,
        'project-date': projectDate || null,
        user_id: userId,
        image_url: imageUrl,
        ai_description: aiDescription, // *** NEW *** Include AI description
    });
    const { data: insertData, error: insertError } = await supabase
      .from('projects')
      .insert([ {
          title: title,
          'project-date': projectDate || null,
          user_id: userId,
          image_url: imageUrl,
          ai_description: aiDescription, // *** NEW *** Save AI description
      }])
      .select();

    console.log("Supabase insert response:", { insertData, insertError });
    setLoading(false); // Use main loading state

    if (insertError) { /* ... error handling ... */
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
      {/* We use a div instead of form tag to handle submission via button click */}
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

        {/* *** NEW *** AI Description Section */}
        <div>
            <label htmlFor="aiDescription" className="mb-2 block text-sm font-medium text-slate-300">
                Projektbeschreibung (AI)
            </label>
            <div className="relative">
                <textarea
                    id="aiDescription"
                    rows={4}
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)} // Allow manual edits
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500 pr-28" // Added padding-right
                    placeholder="Klicken Sie auf 'Generieren', um eine Beschreibung zu erstellen..."
                />
                <button
                    type="button" // Important: type="button" prevents form submission
                    onClick={handleGenerateDescription}
                    disabled={aiLoading || !title.trim()} // Disable if loading or no title
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

        {/* Error Message Display */}
        {error && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {/* Action Buttons */}
        {/* We use onClick on the button now instead of form onSubmit */}
        <div className="flex items-center justify-end gap-4 border-t border-slate-700 pt-6 mt-8">
           <Link href="/dashboard" className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700">
              Abbrechen
           </Link>
           <button
            type="button" // Change to type="button"
            onClick={(e) => handleSubmit(e as any)} // Trigger submit logic on click
            disabled={loading || !currentUser || !imageFile || aiLoading} // Disable if any process running
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

