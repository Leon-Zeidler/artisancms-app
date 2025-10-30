// src/components/WelcomeModal.tsx
"use client";

import React from 'react';

// --- Icons (Copied from your other files) ---
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" /> </svg> );
const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 01-1.06 0l-3.72-3.72C9.847 17.001 9 16.036 9 14.9v-4.286c0-.97.616-1.813 1.5-2.097L12 6.75l3.75 1.761zm-6 3.486l-3.72 3.72a.75.75 0 000 1.06l3.72 3.72C11.153 20.89 12 19.925 12 18.887v-7.135c0-1.038-.847-2-1.98-2.093l-3.72-1.761a.75.75 0 00-.63.123 7.48 7.48 0 00-.738.738A7.47 7.47 0 003 11.25v4.286c0 .97.616 1.813 1.5 2.097L6 18.311v-.757c0-1.28.624-2.43 1.65-3.181l.71-.533zM18.75 9.75h.008v.008h-.008V9.75z" /> </svg> );
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );

interface WelcomeModalProps {
  onClose: () => void;
  isSaving: boolean;
}

export default function WelcomeModal({ onClose, isSaving }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 max-w-lg w-full border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-4">
          Willkommen zur ArtisanCMS Beta!
        </h2>
        
        <div className="space-y-4 text-slate-300">
          <p>
            Vielen Dank, dass Sie sich die Zeit nehmen, diese App zu testen.
          </p>
          
          <div className="flex items-start gap-4 p-3 bg-slate-700/50 rounded-lg">
            <SparklesIcon className="h-8 w-8 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-white">Ihr Haupt-Testziel</h3>
              <p className="text-sm text-slate-400">
                Der wichtigste Test ist der "magische Moment": Gehen Sie zu 
                <strong className="text-orange-400"> "Projekte" &gt; "Neues Projekt"</strong>, 
                geben Sie einen Titel ein und klicken Sie auf <strong className="text-orange-400">"Generieren"</strong>,
                um eine AI-Beschreibung zu erstellen.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 bg-slate-700/50 rounded-lg">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-white">Feedback geben</h3>
              <p className="text-sm text-slate-400">
                Wenn Sie einen Bug finden oder eine Idee haben, klicken Sie bitte auf das 
                <strong className="text-blue-400"> Feedback-Icon (Sprechblase)</strong> unten rechts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 disabled:bg-orange-800 disabled:cursor-not-allowed"
          >
            {isSaving && <ArrowPathIcon className="h-4 w-4" />}
            {isSaving ? 'Speichern...' : 'Los geht\'s!'}
          </button>
        </div>
      </div>
    </div>
  );
}