// src/app/dashboard/contact/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import SubmissionModal from '@/components/SubmissionModal';

// --- Icons ---
const InboxIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.121-1.58H6.881a2.25 2.25 0 00-2.121 1.58L2.35 13.177a2.25 2.25 0 00-.1.661z" /> </svg>);
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /> </svg>);
// --- No longer used, but fine to keep ---
const EnvelopeOpenIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.47 3.791a2.25 2.25 0 01-2.18 0l-6.47-3.791A2.25 2.25 0 012.25 9.906V9m19.5 0a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 9m19.5 0v.906a2.25 2.25 0 01-1.183 1.981l-6.47 3.791a2.25 2.25 0 01-2.18 0l-6.47-3.791A2.25 2.25 0 012.25 9.906V9m0 0a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 9V6.75a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6.75v2.25z" /> </svg>);


// --- TYPE DEFINITIONS ---
export type ContactSubmission = {
  id: string;
  created_at: string;
  profile_id: string; // This is the user's ID
  sender_name: string; // Renamed from 'name'
  sender_email: string; // Renamed from 'email'
  message: string;
};

export default function ContactInboxPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  
  // --- 1. Add new state for AI drafting ---
  const [isDrafting, setIsDrafting] = useState(false);
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  
  const router = useRouter();

  // --- Initial Data Fetch ---
  useEffect(() => {
    const getUserAndData = async () => {
      setLoading(true); 
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht eingeloggt.");
        router.push('/login');
        return;
      }
      setCurrentUser(user);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('slug')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error("Error fetching user slug:", profileError.message);
        toast.error("Fehler beim Laden der Profildaten.");
      } else if (profile) {
        setUserSlug(profile.slug);
      }

      console.log(`Fetching submissions for profile ${user.id}`);
      const { data, error: fetchError } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('profile_id', user.id) 
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error("Error fetching submissions:", fetchError);
        setError(`Anfragen konnten nicht geladen werden: ${fetchError.message}`);
        setSubmissions([]);
      } else {
        console.log("Fetched submissions:", data);
        // --- FIX: Map the DB columns to the component's expected type ---
        const mappedData = (data || []).map(item => ({
          ...item,
          name: item.sender_name, // Map sender_name to name
          email: item.sender_email // Map sender_email to email
        }));
        setSubmissions(mappedData);
      }
      setLoading(false);
    };
    getUserAndData();
  }, [router]);
  
  const handleOpenModal = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setAiDraft(null); // Clear old draft when opening
    setIsDrafting(false);
  };

  const handleCloseModal = () => {
    if (isDrafting) return; // Don't close while loading
    setSelectedSubmission(null);
    setAiDraft(null);
  };
  
  // --- 2. Add handler to call the new API route ---
  const handleDraftReply = async (message: string) => {
    if (!currentUser) {
      toast.error("User not found");
      return;
    }
    
    setIsDrafting(true);
    setAiDraft(null); // Clear previous draft
    
    const draftPromise = async () => {
      const response = await fetch('/api/draft-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerMessage: message,
          profileId: currentUser.id, // Send the user's ID
        }),
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate draft');
      }
      return result.draft;
    };

    await toast.promise(
      draftPromise(),
      {
        loading: 'AI entwirft eine Antwort...',
        success: (draft) => {
          setAiDraft(draft);
          setIsDrafting(false);
          return 'Entwurf erstellt!';
        },
        error: (err: any) => {
          setIsDrafting(false);
          return `Fehler: ${err.message}`;
        }
      }
    );
  };
  
  const homepageHref = userSlug ? `/${userSlug}` : '/';

  // --- Render Logic ---
  return (
    <main className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Kontaktanfragen</h1>
          <p className="text-slate-400 mt-1">Hier sehen Sie alle Anfragen von Ihrer Webseite.</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (<p className="text-slate-400 mt-6 text-center">Lade Anfragen...</p>)}
      
      {/* General Error Display */}
      {error && !loading && (<p className="text-red-500 mt-6 text-center">{error}</p>)}

      {/* List */}
      {!loading && !error && (
        <div className="space-y-4">
          {submissions.length > 0 ? (
            submissions.map((item) => (
              <button
                key={item.id}
                onClick={() => handleOpenModal(item)}
                className="w-full p-4 bg-slate-800 rounded-lg border border-slate-700 text-left transition-all hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                    {item.sender_name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2 truncate">{item.message}</p>
                <p className="text-xs text-orange-400 hover:underline">{item.sender_email}</p>
              </button>
            ))
          ) : (
            <EmptyState
              icon={InboxIcon}
              title="Keine Kontaktanfragen"
              message="Sobald ein Besucher Ihrer Webseite das Kontaktformular ausfüllt, erscheint die Nachricht hier."
              buttonText="Zur Webseite"
              buttonHref={homepageHref} 
            />
          )}
        </div>
      )}
      
      {/* --- 3. Pass new props to the Modal --- */}
      <SubmissionModal
        item={selectedSubmission}
        onClose={handleCloseModal}
        onDraftReply={handleDraftReply}
        isDrafting={isDrafting}
        aiDraft={aiDraft}
      />
    </main>
  );
}
