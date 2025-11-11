// src/components/SubmissionModal.tsx
"use client";

import React from 'react';
import toast from 'react-hot-toast';
import { type ContactSubmission } from '@/app/dashboard/contact/page';

// --- Icons ---
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg>);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> </svg>);
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /> </svg>);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
// --- 1. ADD NEW ICON ---
const ArrowTopRightOnSquareIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /> </svg> );


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

  // --- 2. PREPARE MAILTO LINK ---
  const mailtoSubject = encodeURIComponent(`AW: Kontaktanfrage von ${item.sender_name}`);
  const mailtoBody = encodeURIComponent(aiDraft || '');
  const mailtoHref = `mailto:${item.sender_email}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div
      className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      aria-modal="true"
    >
      <div
        className="relative z-[60] w-full max-w-2xl rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-200/40"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-orange-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Kontaktanfrage</h3>
            <p className="text-sm text-slate-500">
              Gesendet am: {new Date(item.created_at).toLocaleString('de-DE')}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDrafting}
            className="rounded-full bg-orange-50 p-1.5 text-orange-500 transition hover:bg-orange-100 hover:text-orange-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-6">
          {/* Sender Details */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3">
              <UserIcon className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-slate-800">{item.sender_name}</span>
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/60 px-4 py-3">
              <EnvelopeIcon className="h-5 w-5 text-orange-500" />
              <a href={`mailto:${item.sender_email}`} className="text-sm font-medium text-orange-600 transition hover:text-orange-500 hover:underline">
                {item.sender_email}
              </a>
            </div>
          </div>

          {/* Message Body */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-orange-500">Nachricht</label>
            <div className="mt-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-orange-100/40">
              <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">{item.message}</p>
            </div>
          </div>

          {/* --- AI Draft Section --- */}
          <div className="border-t border-orange-100 pt-4">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <label htmlFor="aiDraft" className="text-sm font-semibold text-slate-800">
                AI-Antwortentwurf
              </label>
              <button
                type="button"
                onClick={handleDraftClick}
                disabled={isDrafting}
                className="inline-flex items-center gap-x-1.5 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-orange-300"
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder={isDrafting ? 'AI denkt nach...' : "Klicken Sie auf 'Antwort entwerfen', um einen Vorschlag zu generieren..."}
            />
            {/* --- 3. MODIFIED BUTTONS --- */}
            {aiDraft && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium">
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className="text-orange-600 underline-offset-2 transition hover:text-orange-500 hover:underline"
                >
                  In Zwischenablage kopieren
                </button>
                <a
                  href={mailtoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-600 transition hover:text-emerald-500"
                >
                  In E-Mail-Programm öffnen
                  <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                </a>
              </div>
            )}
            {/* --- END OF MODIFICATION --- */}
          </div>

        </div>

        <div className="flex justify-end gap-3 rounded-b-3xl border-t border-orange-100 bg-orange-50/60 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isDrafting}
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}