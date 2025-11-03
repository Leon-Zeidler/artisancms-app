// src/components/RequestTestimonialModal.tsx
"use client";

import React, { useState } from 'react';

// --- Icons ---
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg>);
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const PaperAirplaneIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.875L5.999 12zm0 0h7.5" /> </svg> );

interface RequestTestimonialModalProps {
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSend: (clientEmail: string) => void;
  isSending: boolean;
}

export default function RequestTestimonialModal({
  projectTitle,
  isOpen,
  onClose,
  onSend,
  isSending,
}: RequestTestimonialModalProps) {
  const [clientEmail, setClientEmail] = useState('');
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    
    // Basic email validation
    if (!clientEmail.includes('@') || !clientEmail.includes('.')) {
      setLocalError('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
      return;
    }
    
    onSend(clientEmail);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-slate-700 relative">
        <button onClick={onClose} disabled={isSending} className="absolute top-4 right-4 text-slate-400 hover:text-white disabled:opacity-50">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-semibold text-white mb-2">Kundenstimme anfragen</h2>
        <p className="text-sm text-slate-400 mb-6">
          Senden Sie eine E-Mail-Anfrage für das Projekt: <strong className="text-white">{projectTitle}</strong>
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clientEmail" className="block text-sm font-medium text-slate-300 mb-1">
              E-Mail des Kunden *
            </label>
            <input
              type="email"
              name="clientEmail"
              id="clientEmail"
              required
              value={clientEmail}
              onChange={(e) => {
                setClientEmail(e.target.value);
                setLocalError('');
              }}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="kunde@beispiel.de"
            />
          </div>
          
          {localError && <p className="text-sm text-red-500">{localError}</p>}
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="rounded-md px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSending}
              className={`inline-flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
                isSending ? 'bg-orange-800 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {isSending && <ArrowPathIcon className="h-4 w-4" />}
              <PaperAirplaneIcon className="-ml-0.5 h-4 w-4" />
              {isSending ? 'Wird gesendet...' : 'Anfrage senden'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
