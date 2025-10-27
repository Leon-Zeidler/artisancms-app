// src/app/dashboard/contact/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast'; // Import toast

// --- Icons ---
const InboxIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.121-1.58H6.881a2.25 2.25 0 00-2.121 1.58L2.35 13.177a2.25 2.25 0 00-.1.661z" /> </svg>);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /> </svg> );
const EnvelopeOpenIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5-15.814A2.25 2.25 0 0019.5 5.25h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 20.25h15a2.25 2.25 0 002.25-2.25V7.5A2.25 2.25 0 0021.75 5.186m0 0l-2.25.9a2.25 2.25 0 01-2.359 0l-2.25-.9m0 0l-2.25.9a2.25 2.25 0 00-2.359 0l-2.25-.9m0 0l-2.25.9a2.25 2.25 0 00-2.359 0l-2.25-.9" /> </svg> );
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> </svg> );

// --- TYPE DEFINITIONS ---
type ContactSubmission = {
    id: string;
    created_at: string;
    profile_id: string; // Belongs to profile owner (user_id essentially)
    sender_name: string;
    sender_email: string;
    message: string;
    is_read: boolean;
};

// --- Confirmation Modal (Reused) ---
interface ConfirmationModalProps { /* ... */ isOpen: boolean; title: string; message: string; confirmText?: string; cancelText?: string; onConfirm: () => void; onCancel: () => void; isConfirming: boolean;}
function ConfirmationModal({ /* ... */ isOpen, title, message, confirmText = "Bestätigen", cancelText = "Abbrechen", onConfirm, onCancel, isConfirming }: ConfirmationModalProps) {
    if (!isOpen) return null;
    return ( /* ... modal jsx ... */ <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog"> <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full border border-slate-700"> <div className="flex items-start"> <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10"> <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" /> </div> <div className="ml-4 text-left"> <h3 className="text-base font-semibold leading-6 text-white" id="modal-title">{title}</h3> <div className="mt-2"> <p className="text-sm text-slate-400">{message}</p> </div> </div> </div> <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-x-3"> <button type="button" disabled={isConfirming} onClick={onConfirm} className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:w-auto transition-colors ${ isConfirming ? 'bg-red-800 text-red-300 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}> {isConfirming ? (<><ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 animate-spin" /> Wird ausgeführt...</>) : confirmText} </button> <button type="button" disabled={isConfirming} onClick={onCancel} className="mt-3 inline-flex w-full justify-center rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-slate-600 hover:bg-slate-600 sm:mt-0 sm:w-auto disabled:opacity-50"> {cancelText} </button> </div> </div> </div> );
}

// --- MAIN PAGE COMPONENT ---
export default function ContactSubmissionsPage() {
    // === State Variables ===
    const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<string, 'read' | 'delete' | null>>({}); // Track loading state per submission ID
    const [deleteConfirmState, setDeleteConfirmState] = useState<{ isOpen: boolean; submission: ContactSubmission | null }>({ isOpen: false, submission: null });
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const router = useRouter();

    // Fetch Submissions
    const fetchSubmissions = useCallback(async (user: User) => {
        setLoading(true); setError(null);
        console.log("Fetching contact submissions for user (profile):", user.id);
        const { data, error: fetchError } = await supabase
            .from('contact_submissions')
            .select('*')
            .eq('profile_id', user.id) // Filter by profile_id matching the user's ID
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('Error fetching submissions:', fetchError);
            setError(`Anfragen konnten nicht geladen werden: ${fetchError.message}`); setSubmissions([]);
        } else {
            console.log("Fetched submissions:", data); setSubmissions(data || []);
        }
        setLoading(false);
    }, []);

    // Initial Load useEffect
    useEffect(() => {
        const getUserAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) router.push('/login');
            else { setCurrentUser(user); await fetchSubmissions(user); }
        };
        getUserAndData();
    }, [router, fetchSubmissions]);

    const setLoadingState = (id: string, type: 'read' | 'delete' | null) => { setActionLoading(prev => ({ ...prev, [id]: type })); };

    // Toggle Read Status Handler
    const handleToggleRead = async (submission: ContactSubmission) => {
        if (!currentUser) return;
        const submissionId = submission.id;
        setLoadingState(submissionId, 'read');
        const newReadStatus = !submission.is_read;

        const togglePromise = async () => {
            const { error: updateError } = await supabase
                .from('contact_submissions')
                .update({ is_read: newReadStatus })
                .eq('id', submissionId)
                .eq('profile_id', currentUser.id); // Ensure ownership

            if (updateError) throw updateError;
            return { submissionId, newReadStatus };
        };

        await toast.promise(togglePromise(), {
            loading: 'Status wird geändert...',
            success: (result) => {
                setSubmissions(prev => prev.map(s => s.id === result.submissionId ? { ...s, is_read: result.newReadStatus } : s));
                return `Nachricht als ${newReadStatus ? 'gelesen' : 'ungelesen'} markiert.`;
            },
            error: (err: any) => `Fehler: ${err.message}`
        });

        setLoadingState(submissionId, null);
    };

    // Delete Handlers
    const handleDeleteRequest = (submission: ContactSubmission) => { setDeleteConfirmState({ isOpen: true, submission: submission }); };
    const handleConfirmDelete = async () => {
        const submissionToDelete = deleteConfirmState.submission; if (!submissionToDelete || !currentUser) return;
        setIsConfirmingDelete(true);

        const deletePromise = async () => {
            const { error: deleteError } = await supabase
                .from('contact_submissions')
                .delete()
                .eq('id', submissionToDelete.id)
                .eq('profile_id', currentUser.id); // Ensure ownership
             if (deleteError) throw deleteError;
             return submissionToDelete.id;
        };

        await toast.promise(deletePromise(), {
             loading: 'Nachricht wird gelöscht...',
             success: (deletedId) => {
                 setSubmissions(prev => prev.filter(s => s.id !== deletedId));
                 return "Nachricht gelöscht!";
             },
             error: (err: any) => `Löschen fehlgeschlagen: ${err.message}`
        });

        setIsConfirmingDelete(false);
        setDeleteConfirmState({ isOpen: false, submission: null });
    };
    const handleCancelDelete = () => { setDeleteConfirmState({ isOpen: false, submission: null }); };

    // === Render Logic ===
    return (
        <main className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div> <h1 className="text-3xl font-bold text-white">Kontaktanfragen</h1> <p className="text-slate-400 mt-1">Hier sehen Sie die über Ihre Webseite gesendeten Nachrichten.</p> </div>
                {/* No "Add New" button needed here */}
            </div>

            {/* Loading */}
            {loading && (<p className="text-slate-400 mt-6 text-center">Lade Anfragen...</p>)}
            {/* General Error */}
            {error && !loading && (<p className="text-red-500 mt-6 text-center">{error}</p>)}

            {/* List */}
            {!loading && !error && (
                <div className="space-y-4">
                    {submissions.length > 0 ? (
                        submissions.map((s) => {
                             const isLoading = actionLoading[s.id];
                             const isDisabled = !!isLoading || (deleteConfirmState.submission?.id === s.id && isConfirmingDelete);
                            return (
                                <div key={s.id} className={`p-4 bg-slate-800 rounded-lg border transition-opacity duration-300 ${s.is_read ? 'border-slate-700 opacity-70 hover:opacity-100' : 'border-orange-500/50'} ${isDisabled ? 'pointer-events-none' : ''}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-baseline gap-x-2">
                                                    <span className={`font-semibold text-sm ${s.is_read ? 'text-slate-400' : 'text-white'}`}>{s.sender_name}</span>
                                                    <a href={`mailto:${s.sender_email}`} className={`text-xs hover:underline ${s.is_read ? 'text-slate-500 hover:text-slate-300' : 'text-orange-400 hover:text-orange-300'}`}>({s.sender_email})</a>
                                                </div>
                                                <span className={`text-xs ${s.is_read ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {new Date(s.created_at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}
                                                </span>
                                            </div>
                                            <p className={`text-sm whitespace-pre-wrap ${s.is_read ? 'text-slate-400' : 'text-slate-200'}`}>{s.message}</p>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                                            <button onClick={() => handleToggleRead(s)} disabled={isDisabled || isLoading === 'read'} title={s.is_read ? 'Als ungelesen markieren' : 'Als gelesen markieren'} className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isLoading === 'read' ? 'bg-slate-600 text-slate-400 cursor-wait' : isDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600/20 text-blue-300 hover:bg-blue-500/30' }`}> <span className="sr-only">{s.is_read ? 'Ungelesen' : 'Gelesen'}</span> {isLoading === 'read' ? <ArrowPathIcon className="h-4 w-4" /> : s.is_read ? <EnvelopeIcon className="h-4 w-4" /> : <EnvelopeOpenIcon className="h-4 w-4" />} </button>
                                            <button onClick={() => handleDeleteRequest(s)} disabled={isDisabled || isLoading === 'delete'} title="Löschen" className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isLoading === 'delete' ? 'bg-slate-600 text-slate-400 cursor-wait' : isDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600/20 text-red-300 hover:bg-red-500/30' }`}> <span className="sr-only">Löschen</span> {isLoading === 'delete' ? <ArrowPathIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />} </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : ( <div className="text-center py-10"><p className="text-slate-500">Keine Kontaktanfragen vorhanden.</p></div> )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal isOpen={deleteConfirmState.isOpen} title="Anfrage löschen" message={`Möchten Sie die Nachricht von "${deleteConfirmState.submission?.sender_name || ''}" wirklich unwiderruflich löschen?`} confirmText="Ja, löschen" onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} isConfirming={isConfirmingDelete} />
        </main>
    );
}

