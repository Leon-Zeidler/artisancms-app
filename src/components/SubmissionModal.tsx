// src/components/SubmissionModal.tsx
"use client";

import React from 'react';
// --- 1. Add missing import ---
import toast from 'react-hot-toast';
// We will export this type from the page.tsx file
import { type ContactSubmission } from '@/app/dashboard/contact/page';

// --- Icons ---
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg>);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> </svg>);
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /> </svg>);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );


// --- 2. Update props interface ---
interface SubmissionModalProps {
  item: ContactSubmission | null;
  onClose: () => void;
  onDraftReply: (message: string) => void;
  isDrafting: boolean;
  aiDraft: string | null;
}

export default function SubmissionModal({ 
  item, 
  onClose,
  onDraftReply,
  isDrafting,
  aiDraft
}: SubmissionModalProps) {
  if (!item) {
    return null;
  }
  
  const handleDraftClick = () => {
    if (isDrafting || !item) return;
    onDraftReply(item.message);
  };
  
  const handleCopyToClipboard = () => {
    if (!aiDraft) return;
    navigator.clipboard.writeText(aiDraft)
      .then(() => toast.success("Entwurf in Zwischenablage kopiert!"))
      .catch(err => toast.error("Kopieren fehlgeschlagen"));
  };

  return (
    <div 
      className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      aria-modal="true"
    >
      <div
        className="relative z-[60] w-full max-w-2xl rounded-lg bg-slate-800 shadow-xl border border-slate-700"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-start justify-between border-b border-slate-700 p-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Kontaktanfrage</h3>
            <p className="text-sm text-slate-400">
              Gesendet am: {new Date(item.created_at).toLocaleString('de-DE')}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDrafting}
            className="text-slate-400 hover:text-white disabled:opacity-50"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Sender Details */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg flex-1">
              <UserIcon className="h-5 w-5 text-slate-400" />
              <span className="text-sm text-white">{item.sender_name}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg flex-1">
              <EnvelopeIcon className="h-5 w-5 text-slate-400" />
              <a href={`mailto:${item.sender_email}`} className="text-sm text-orange-400 hover:underline">
                {item.sender_email}
              </a>
            </div>
          </div>
          
          {/* Message Body */}
          <div>
            <label className="text-xs font-medium text-slate-500">Nachricht</label>
            <div className="mt-1 p-4 bg-slate-900 rounded-md border border-slate-700">
              <p className="text-sm text-slate-200 whitespace-pre-wrap">{item.message}</p>
            </div>
          </div>
          
          {/* --- 3. Add AI Draft Section --- */}
          <div className="border-t border-slate-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="aiDraft" className="text-sm font-medium text-slate-300">
                AI-Antwortentwurf
              </label>
              <button 
                type="button" 
                onClick={handleDraftClick}
                disabled={isDrafting}
                className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:bg-indigo-800 disabled:cursor-not-allowed"
              >
                {isDrafting ? <ArrowPathIcon className="h-4 w-4" /> : <SparklesIcon className="h-4 w-4" />}
                {isDrafting ? 'Entwurf wird erstellt...' : 'Antwort entwerfen'}
              </button>
            </div>
            <textarea
              id="aiDraft"
              rows={6}
              value={aiDraft || ''}
              readOnly
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-slate-300 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder={isDrafting ? 'AI denkt nach...' : "Klicken Sie auf 'Antwort entwerfen', um einen Vorschlag zu generieren..."}
            />
            {aiDraft && (
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="mt-2 text-xs text-orange-400 hover:text-orange-300 font-medium"
              >
                In Zwischenablage kopieren
              </button>
            )}
          </div>
          {/* --- End of AI Section --- */}
          
        </div>
        
        <div className="flex justify-end gap-3 border-t border-slate-700 p-4 bg-slate-800/50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={isDrafting}
            className="rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-600 disabled:opacity-50"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}

