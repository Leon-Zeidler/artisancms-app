// src/app/dashboard/contact/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
// Reuse ConfirmationModal from testimonials page (assuming it's reusable or move it to components)
// For simplicity, let's redefine it here if not moved
// Or import it: import { ConfirmationModal } from '../testimonials/page'; // Adjust path if moved

// --- TYPE DEFINITION ---
type ContactSubmission = {
    id: string; // uuid
    created_at: string; // timestamptz
    profile_id: string; // uuid
    sender_name: string; // text
    sender_email: string; // text
    message: string; // text
    is_read: boolean; // bool
};

// --- ICONS ---
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /> </svg> );
const EnvelopeOpenIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9V18a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 18V9m19.5 0a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 9m19.5 0V6.75a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6.75v2.25m16.64-4.942L12 11.25 4.11 4.308M15.75 9.75L12 12.563 8.25 9.75M21.75 9l-9.435 6.095a.75.75 0 01-.83 0L2.25 9" /> </svg> );
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> </svg> );

// --- Confirmation Modal (Redefined or Imported) ---
// If you moved ConfirmationModal to /components, import it. Otherwise, paste its code here:
interface ConfirmationModalProps { /* ... props ... */ isOpen: boolean; title: string; message: string; confirmText?: string; cancelText?: string; onConfirm: () => void; onCancel: () => void; isConfirming: boolean; }
function ConfirmationModal({ isOpen, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel, isConfirming }: ConfirmationModalProps) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
          <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full border border-slate-700">
            <div className="flex items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-base font-semibold leading-6 text-white" id="modal-title">{title}</h3>
                <div className="mt-2">
                  <p className="text-sm text-slate-400">{message}</p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-x-3">
              <button type="button" disabled={isConfirming} onClick={onConfirm} className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:w-auto transition-colors ${isConfirming ? 'bg-red-800 text-red-300 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                {isConfirming ? <><ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 animate-spin" /> Processing...</> : confirmText}
              </button>
              <button type="button" disabled={isConfirming} onClick={onCancel} className="mt-3 inline-flex w-full justify-center rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-slate-600 hover:bg-slate-600 sm:mt-0 sm:w-auto disabled:opacity-50">
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      );
}


export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingReadId, setTogglingReadId] = useState<string | null>(null); // Track read/unread toggle
  const [deletingSubmissionId, setDeletingSubmissionId] = useState<string | null>(null); // Track delete action
  const [submissionToDelete, setSubmissionToDelete] = useState<ContactSubmission | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const router = useRouter();

  // --- Fetch Submissions ---
  const fetchSubmissions = async (userId: string) => {
    setLoading(true);
    setError(null);
    console.log("Fetching contact submissions for user:", userId);

    const { data, error: fetchError } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('profile_id', userId) // RLS ensures this only gets own submissions anyway, but good practice
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching submissions:', fetchError);
      setError(`Kontaktanfragen konnten nicht geladen werden: ${fetchError.message}`);
      setSubmissions([]);
    } else {
      setSubmissions(data || []);
      console.log("Fetched submissions:", data);
    }
    setLoading(false);
  };

  // --- Initial Load ---
  useEffect(() => {
    const getUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setCurrentUser(user);
      fetchSubmissions(user.id);
    };
    getUserAndData();
  }, [router]);

  // --- Toggle Read Status ---
  const handleToggleRead = async (submission: ContactSubmission) => {
    setTogglingReadId(submission.id);
    setError(null);
    const newReadStatus = !submission.is_read;

    const { error: updateError } = await supabase
      .from('contact_submissions')
      .update({ is_read: newReadStatus })
      .eq('id', submission.id);

    if (updateError) {
      console.error('Error updating read status:', updateError);
      setError(`Status konnte nicht geändert werden: ${updateError.message}`);
    } else {
      setSubmissions(current =>
        current.map(s => s.id === submission.id ? { ...s, is_read: newReadStatus } : s)
      );
    }
    setTogglingReadId(null);
  };

  // --- Delete Handlers ---
  const handleDeleteRequest = (submission: ContactSubmission) => {
    setError(null);
    setSubmissionToDelete(submission);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!submissionToDelete) return;
    setDeletingSubmissionId(submissionToDelete.id); // Show loading on the specific item
    setError(null);

    const { error: deleteError } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', submissionToDelete.id);

    if (deleteError) {
      console.error("Error deleting submission:", deleteError);
      setError(`Anfrage konnte nicht gelöscht werden: ${deleteError.message}`);
    } else {
      setSubmissions(current => current.filter(s => s.id !== submissionToDelete.id));
    }
    setShowDeleteConfirm(false);
    setSubmissionToDelete(null);
    setDeletingSubmissionId(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setSubmissionToDelete(null);
    setDeletingSubmissionId(null); // Reset loading state
  };

  // --- Helper to format date ---
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('de-DE', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Ungültiges Datum';
    }
  };

  return (
    <main className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Kontaktanfragen</h1>
          <p className="text-slate-400 mt-1">Hier sehen Sie die Nachrichten, die über Ihr Kontaktformular gesendet wurden.</p>
        </div>
        {/* Maybe add a Refresh button later */}
      </div>

      {/* Loading State */}
      {loading && <p className="text-slate-400 mt-6 text-center">Lade Anfragen...</p>}

      {/* Error State */}
      {error && !loading && <p className="text-red-500 mt-6 text-center">{error}</p>}

      {/* Submissions List */}
      {!loading && !error && (
        <div className="space-y-4">
          {submissions.length > 0 ? (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className={`p-4 rounded-lg border transition-colors duration-200 ${
                  sub.is_read ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-700 border-slate-600 shadow-md'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-x-3">
                    <span className={`font-semibold ${sub.is_read ? 'text-slate-300' : 'text-white'}`}>{sub.sender_name}</span>
                    <a href={`mailto:${sub.sender_email}`} className={`text-sm hover:underline ${sub.is_read ? 'text-slate-400' : 'text-slate-300'}`}>
                      ({sub.sender_email})
                    </a>
                  </div>
                  <span className={`text-xs ${sub.is_read ? 'text-slate-500' : 'text-slate-400'}`}>{formatDate(sub.created_at)}</span>
                </div>
                <p className={`text-sm mb-4 whitespace-pre-wrap ${sub.is_read ? 'text-slate-400' : 'text-slate-200'}`}>{sub.message}</p>
                <div className="flex items-center justify-end gap-x-2">
                   {/* Toggle Read Button */}
                   <button
                     onClick={() => handleToggleRead(sub)}
                     disabled={togglingReadId === sub.id || deletingSubmissionId === sub.id}
                     title={sub.is_read ? 'Als ungelesen markieren' : 'Als gelesen markieren'}
                     className={`inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed ${
                       sub.is_read
                         ? 'bg-blue-600/20 text-blue-300 hover:bg-blue-500/30'
                         : 'bg-green-600/20 text-green-300 hover:bg-green-500/30'
                     }`}
                   >
                     <span className="sr-only">{sub.is_read ? 'Als ungelesen markieren' : 'Als gelesen markieren'}</span>
                     {togglingReadId === sub.id ? <ArrowPathIcon className="h-4 w-4"/> : sub.is_read ? <EnvelopeOpenIcon className="h-4 w-4"/> : <EnvelopeIcon className="h-4 w-4"/>}
                   </button>
                   {/* Delete Button */}
                   <button
                     onClick={() => handleDeleteRequest(sub)}
                     disabled={togglingReadId === sub.id || deletingSubmissionId === sub.id}
                     title="Anfrage löschen"
                     className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-red-600/20 text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <span className="sr-only">Löschen</span>
                     {deletingSubmissionId === sub.id ? <ArrowPathIcon className="h-4 w-4"/> : <TrashIcon className="h-4 w-4"/>}
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-500">Keine Kontaktanfragen vorhanden.</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Anfrage löschen"
        message={`Möchten Sie die Nachricht von "${submissionToDelete?.sender_name || 'Unbekannt'}" wirklich löschen?`}
        confirmText="Ja, löschen"
        cancelText="Abbrechen"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirming={!!deletingSubmissionId} // Show loading state when deletingSubmissionId is set
      />
    </main>
  );
}
