// src/app/dashboard/testimonials/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
// import Footer from '@/components/Footer'; // Usually not needed in dashboard

// --- Icons ---
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> );
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const EyeSlashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /> </svg> );
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /> </svg> );
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg>);
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> </svg> );


// --- TYPE DEFINITIONS ---
type Testimonial = {
    id: string;
    created_at: string;
    user_id: string;
    author_name: string;
    author_handle: string | null;
    body: string;
    is_published: boolean;
};

type TestimonialFormData = Omit<Testimonial, 'id' | 'created_at' | 'user_id'>;
type ModalState = {
    isOpen: boolean;
    mode: 'add' | 'edit';
    data: Testimonial | null;
};

// --- Confirmation Modal ---
interface ConfirmationModalProps { isOpen: boolean; title: string; message: string; confirmText?: string; cancelText?: string; onConfirm: () => void; onCancel: () => void; isConfirming: boolean;}
function ConfirmationModal({ isOpen, title, message, confirmText = "Bestätigen", cancelText = "Abbrechen", onConfirm, onCancel, isConfirming }: ConfirmationModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full border border-slate-700">
        <div className="flex items-start">
          <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-base font-semibold leading-6 text-white" id="modal-title">{title}</h3>
            <div className="mt-2"> <p className="text-sm text-slate-400">{message}</p> </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-x-3">
          <button type="button" disabled={isConfirming} onClick={onConfirm} className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm sm:w-auto transition-colors ${ isConfirming ? 'bg-red-800 text-red-300 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}>
            {isConfirming ? (<><ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 animate-spin" /> Wird ausgeführt...</>) : confirmText}
          </button>
          <button type="button" disabled={isConfirming} onClick={onCancel} className="mt-3 inline-flex w-full justify-center rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-slate-600 hover:bg-slate-600 sm:mt-0 sm:w-auto disabled:opacity-50">
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ADD/EDIT MODAL ---
interface TestimonialModalProps {
    modalState: ModalState;
    onClose: () => void;
    onSave: (data: TestimonialFormData, id?: string) => Promise<void>;
    isSaving: boolean;
}

function TestimonialModal({ modalState, onClose, onSave, isSaving }: TestimonialModalProps) {
    if (!modalState.isOpen) return null;

    const [formData, setFormData] = useState<TestimonialFormData>(
        modalState.mode === 'edit' && modalState.data
        ? { author_name: modalState.data.author_name, author_handle: modalState.data.author_handle ?? '', body: modalState.data.body, is_published: modalState.data.is_published }
        : { author_name: '', author_handle: '', body: '', is_published: false }
    );
    const [localError, setLocalError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
        setLocalError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);
        if (!formData.author_name.trim() || !formData.body.trim()) {
            setLocalError("Name des Autors und Text dürfen nicht leer sein."); return;
        }
        await onSave(formData, modalState.data?.id);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-slate-700 relative">
                 <button onClick={onClose} disabled={isSaving} className="absolute top-4 right-4 text-slate-400 hover:text-white disabled:opacity-50"> <XMarkIcon className="h-6 w-6" /> </button>
                <h2 className="text-xl font-semibold text-white mb-6"> {modalState.mode === 'add' ? 'Neue Kundenstimme hinzufügen' : 'Kundenstimme bearbeiten'} </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="author_name" className="block text-sm font-medium text-slate-300 mb-1">Name des Autors *</label>
                        <input type="text" name="author_name" id="author_name" required value={formData.author_name} onChange={handleChange} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" />
                    </div>
                    <div>
                        <label htmlFor="author_handle" className="block text-sm font-medium text-slate-300 mb-1">Zusatz (z.B. Firma, Ort)</label>
                        <input type="text" name="author_handle" id="author_handle" value={formData.author_handle ?? ''} onChange={handleChange} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" />
                    </div>
                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-slate-300 mb-1">Text der Kundenstimme *</label>
                        <textarea name="body" id="body" rows={5} required value={formData.body} onChange={handleChange} className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500" />
                    </div>
                     <div className="relative flex items-start">
                        <div className="flex h-6 items-center">
                            <input id="is_published" name="is_published" type="checkbox" checked={formData.is_published} onChange={handleChange} className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-orange-600 focus:ring-orange-600 focus:ring-offset-slate-800" />
                        </div>
                        <div className="ml-3 text-sm leading-6">
                            <label htmlFor="is_published" className="font-medium text-slate-300">Veröffentlicht</label>
                            <p className="text-slate-500 text-xs">Soll diese Kundenstimme auf der Webseite angezeigt werden?</p>
                        </div>
                    </div>
                    {localError && <p className="text-sm text-red-500">{localError}</p>}
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSaving} className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"> Abbrechen </button>
                        <button type="submit" disabled={isSaving} className={`inline-flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${ isSaving ? 'bg-orange-800 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}>
                             {isSaving && <ArrowPathIcon className="h-4 w-4 animate-spin" />} {isSaving ? 'Wird gespeichert...' : 'Speichern'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function TestimonialsManagementPage() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<Record<string, 'publish' | 'delete' | 'save' | null>>({});
    const [modalState, setModalState] = useState<ModalState>({ isOpen: false, mode: 'add', data: null });
    const [deleteConfirmState, setDeleteConfirmState] = useState<{ isOpen: boolean; testimonial: Testimonial | null }>({ isOpen: false, testimonial: null });
    const router = useRouter();

    const fetchTestimonials = useCallback(async (user: User) => {
        setLoading(true); setError(null);
        console.log("Fetching testimonials for user:", user.id);
        const { data, error: fetchError } = await supabase
            .from('testimonials').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (fetchError) {
            console.error('Error fetching testimonials:', fetchError);
            setError(`Kundenstimmen konnten nicht geladen werden: ${fetchError.message}`); setTestimonials([]);
        } else {
            console.log("Fetched testimonials:", data); setTestimonials(data || []);
        } setLoading(false);
    }, []);

    useEffect(() => {
        const getUserAndData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) router.push('/login');
            else { setCurrentUser(user); await fetchTestimonials(user); }
        };
        getUserAndData();
    }, [router, fetchTestimonials]);

    const openAddModal = () => setModalState({ isOpen: true, mode: 'add', data: null });
    const openEditModal = (testimonial: Testimonial) => setModalState({ isOpen: true, mode: 'edit', data: testimonial });
    const closeModal = () => { if (actionLoading.modal === 'save') return; setModalState({ isOpen: false, mode: 'add', data: null }); setError(null); }
    const setLoadingState = (id: string | 'modal', type: 'publish' | 'delete' | 'save' | null) => { setActionLoading(prev => ({ ...prev, [id]: type })); };

    const handleSaveTestimonial = async (formData: TestimonialFormData, id?: string) => {
        if (!currentUser) return;
        setLoadingState('modal', 'save'); setError(null);
        const dataToUpsert = { ...formData, user_id: currentUser.id, id: id };
        console.log("Upserting testimonial:", dataToUpsert);
        const { error: upsertError } = await supabase.from('testimonials').upsert(dataToUpsert, { onConflict: 'id' });
        setLoadingState('modal', null);
        if (upsertError) {
            console.error("Error saving testimonial:", upsertError); setError(`Fehler beim Speichern: ${upsertError.message}`);
        } else {
            console.log("Save successful"); closeModal(); await fetchTestimonials(currentUser);
        }
    };

    const handlePublishToggle = async (testimonial: Testimonial) => {
        if (!currentUser) return;
        setLoadingState(testimonial.id, 'publish'); setError(null);
        const newStatus = !testimonial.is_published;
        console.log(`Toggling publish status for ${testimonial.id} to ${newStatus}`);
        const { error: updateError } = await supabase.from('testimonials').update({ is_published: newStatus }).eq('id', testimonial.id).eq('user_id', currentUser.id);
        setLoadingState(testimonial.id, null);
        if (updateError) {
            console.error("Error toggling publish status:", updateError); setError(`Status konnte nicht geändert werden: ${updateError.message}`);
        } else {
            console.log("Publish status updated"); setTestimonials(prev => prev.map(t => t.id === testimonial.id ? { ...t, is_published: newStatus } : t));
        }
    };

    const handleDeleteRequest = (testimonial: Testimonial) => { setError(null); setDeleteConfirmState({ isOpen: true, testimonial: testimonial }); };
    const handleConfirmDelete = async () => {
        const testimonialToDelete = deleteConfirmState.testimonial; if (!testimonialToDelete || !currentUser) return;
        setLoadingState(testimonialToDelete.id, 'delete'); setDeleteConfirmState(prev => ({ ...prev, isOpen: false })); setError(null);
        console.log(`Deleting testimonial ${testimonialToDelete.id}`);
        const { error: deleteError } = await supabase.from('testimonials').delete().eq('id', testimonialToDelete.id).eq('user_id', currentUser.id);
        setLoadingState(testimonialToDelete.id, null);
        if (deleteError) {
            console.error("Error deleting testimonial:", deleteError); setError(`Löschen fehlgeschlagen: ${deleteError.message}`);
        } else {
            console.log("Delete successful"); setTestimonials(prev => prev.filter(t => t.id !== testimonialToDelete.id));
        } setDeleteConfirmState({ isOpen: false, testimonial: null });
    };
    const handleCancelDelete = () => { setDeleteConfirmState({ isOpen: false, testimonial: null }); setError(null); };

    return (
        <main className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div> <h1 className="text-3xl font-bold text-white">Kundenstimmen</h1> <p className="text-slate-400 mt-1">Verwalten Sie hier Ihre Kundenreferenzen.</p> </div>
                <button onClick={openAddModal} className="inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"> <PlusIcon className="h-5 w-5" /> Neue Kundenstimme </button>
            </div>

            {/* Loading */}
            {loading && (<p className="text-slate-400 mt-6 text-center">Lade Kundenstimmen...</p>)}
            {/* Error */}
            {error && !loading && (<p className="text-red-500 mt-6 text-center">{error}</p>)}

            {/* List */}
            {!loading && (
                <div className="space-y-4">
                    {testimonials.length > 0 ? (
                        testimonials.map((t) => {
                             const isLoading = actionLoading[t.id]; const isDisabled = !!isLoading || actionLoading.modal === 'save';
                            return (
                                <div key={t.id} className={`p-4 bg-slate-800 rounded-lg border border-slate-700 transition-opacity ${isDisabled ? 'opacity-70' : ''}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <blockquote className="text-slate-300 italic mb-2 text-sm">"{t.body}"</blockquote>
                                            <p className="text-xs text-white font-semibold">{t.author_name} {t.author_handle && <span className="text-slate-400 font-normal ml-2">({t.author_handle})</span>} </p>
                                            <p className="text-xs text-slate-500 mt-1">Erstellt: {new Date(t.created_at).toLocaleDateString('de-DE')}</p>
                                        </div>
                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <button onClick={() => handlePublishToggle(t)} disabled={isDisabled || isLoading === 'publish'} title={t.is_published ? 'Verbergen' : 'Veröffentlichen'} className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isLoading === 'publish' ? 'bg-slate-600 text-slate-400 cursor-wait' : isDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : t.is_published ? 'bg-yellow-600/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-green-600/20 text-green-300 hover:bg-green-500/30' }`}> <span className="sr-only">{t.is_published ? 'Verbergen' : 'Veröffentlichen'}</span> {isLoading === 'publish' ? <ArrowPathIcon className="h-4 w-4" /> : t.is_published ? <EyeSlashIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />} </button>
                                            <button onClick={() => openEditModal(t)} disabled={isDisabled} title="Bearbeiten" className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-blue-600/20 text-blue-300 hover:bg-blue-500/30' }`}> <span className="sr-only">Bearbeiten</span> <PencilIcon className="h-4 w-4" /> </button>
                                            <button onClick={() => handleDeleteRequest(t)} disabled={isDisabled || isLoading === 'delete'} title="Löschen" className={`inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors ${ isLoading === 'delete' ? 'bg-slate-600 text-slate-400 cursor-wait' : isDisabled ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600/20 text-red-300 hover:bg-red-500/30' }`}> <span className="sr-only">Löschen</span> {isLoading === 'delete' ? <ArrowPathIcon className="h-4 w-4" /> : <TrashIcon className="h-4 w-4" />} </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    ) : ( !error && <div className="text-center py-10"><p className="text-slate-500">Sie haben noch keine Kundenstimmen hinzugefügt.</p></div> )}
                </div>
            )}

            {/* Modals */}
            <TestimonialModal modalState={modalState} onClose={closeModal} onSave={handleSaveTestimonial} isSaving={actionLoading.modal === 'save'} />
            <ConfirmationModal isOpen={deleteConfirmState.isOpen} title="Kundenstimme löschen" message={`Möchten Sie die Kundenstimme von "${deleteConfirmState.testimonial?.author_name || ''}" wirklich unwiderruflich löschen?`} confirmText="Ja, löschen" onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} isConfirming={!!deleteConfirmState.testimonial && actionLoading[deleteConfirmState.testimonial.id] === 'delete'} />
        </main>
    );
}

