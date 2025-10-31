// src/components/SubmissionModal.tsx
"use client";

import React from 'react';
// We will export this type from the page.tsx file
import { type ContactSubmission } from '@/app/dashboard/contact/page';

// --- Icons ---
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg>);
const UserIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> </svg>);
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /> </svg>);


interface SubmissionModalProps {
  item: ContactSubmission | null;
  onClose: () => void;
}

export default function SubmissionModal({ item, onClose }: SubmissionModalProps) {
  if (!item) {
    return null;
  }

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
            className="text-slate-400 hover:text-white"
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
              <span className="text-sm text-white">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg flex-1">
              <EnvelopeIcon className="h-5 w-5 text-slate-400" />
              <a href={`mailto:${item.email}`} className="text-sm text-orange-400 hover:underline">
                {item.email}
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
        </div>
        
        <div className="flex justify-end gap-3 border-t border-slate-700 p-4 bg-slate-800/50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}