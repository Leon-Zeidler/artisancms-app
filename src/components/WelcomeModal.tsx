// src/components/WelcomeModal.tsx
"use client";

import React, { useEffect } from "react";
import Link from "next/link"; // Link hinzugefügt

// --- Icons ---
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" />
  </svg>
);
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
// NEUES ICON (aus einstellungen/page.tsx)
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> </svg> );


interface WelcomeModalProps {
  onClose: () => void;
  isSaving: boolean;
}

export default function WelcomeModal({ onClose, isSaving }: WelcomeModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="welcome-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-[min(92vw,56rem)] sm:w-[min(92vw,64rem)] max-w-3xl bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 border border-slate-700 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="absolute right-3 top-3 rounded-md p-2 text-slate-300 hover:bg-slate-700/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
          aria-label="Modal schließen"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="flex items-start gap-3">
          <SparklesIcon className="h-8 w-8 text-orange-400 flex-shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-300/80">
              Willkommen zur ArtisanCMS Beta
            </p>
            <h2 id="welcome-modal-title" className="text-2xl font-bold text-white">
              So funktioniert's: Von Null zur Live-Webseite
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-6 text-slate-300 flex-1 overflow-y-auto pr-2">
          <p>
            Vielen Dank, dass Sie die Beta-Version testen! Hier ist der empfohlene Weg, um Ihre Webseite
            schnellstmöglich online zu bringen und die wichtigsten Funktionen zu verstehen.
          </p>

          {/* --- NEU: Rechtlicher Hinweis --- */}
          <section aria-labelledby="welcome-modal-legal" className="flex items-start gap-4 p-4 rounded-lg bg-yellow-900/30 border border-yellow-700/70">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <h3 id="welcome-modal-legal" className="text-lg font-semibold text-white">
                Wichtiger Hinweis zur Veröffentlichung
              </h3>
              <p className="mt-1 text-sm text-yellow-200">
                Ihre Webseite kann erst live geschaltet werden, wenn Sie ein **Impressum** und eine **Datenschutzerklärung**
                hinterlegt haben. Dies ist eine gesetzliche Anforderung in Deutschland.
              </p>
            </div>
          </section>

          <section aria-labelledby="welcome-modal-steps">
            <h3 id="welcome-modal-steps" className="text-lg font-semibold text-white">
              Ihr 3-Schritte-Plan zur Live-Seite
            </h3>
            <ol className="mt-3 space-y-4 text-sm text-slate-300 list-decimal list-inside">
              <li>
                <strong className="text-white">Stammdaten & Rechtliches eintragen:</strong>
                <br />
                Gehen Sie zu <Link href="/dashboard/einstellungen" onClick={onClose} className="text-orange-400 underline hover:text-orange-300">Einstellungen</Link>. Füllen Sie unter `Firmendaten` Ihren Namen und Ihre Adresse aus.
                Kopieren Sie anschließend Ihre Texte für `Impressum` und `Datenschutz` in die entsprechenden Felder.
                Vergessen Sie nicht zu speichern!
              </li>
              <li>
                <strong className="text-white">Erstes Projekt mit AI erstellen:</strong>
                <br />
                Gehen Sie zu <Link href="/dashboard/projekte" onClick={onClose} className="text-orange-400 underline hover:text-orange-300">Projekte</Link> und klicken Sie auf `Neues Projekt`. Laden Sie ein "Nachher-Bild" hoch – unsere KI analysiert es und schreibt eine professionelle Projektbeschreibung für Sie. Setzen Sie den Status auf "Veröffentlicht" und speichern Sie.
              </li>
              <li>
                <strong className="text-white">Webseite veröffentlichen:</strong>
                <br />
                Gehen Sie zurück zu <Link href="/dashboard/einstellungen" onClick={onClose} className="text-orange-400 underline hover:text-orange-300">Einstellungen</Link> und scrollen Sie ganz nach unten zur `Gefahrenzone`. Legen Sie den Schalter bei `Website veröffentlichen` um. Ihre Seite ist jetzt live!
              </li>
            </ol>
          </section>

          <section aria-labelledby="welcome-modal-feedback" className="flex items-start gap-4 rounded-lg bg-slate-700/50 p-4 border border-slate-700/70">
            <div className="space-y-1">
              <h3 id="welcome-modal-feedback" className="text-lg font-semibold text-white">
                Feedback ist entscheidend
              </h3>
              <p className="text-sm text-slate-300">
                Nutzen Sie jederzeit den **Feedback-Button (unten rechts)**, wenn etwas nicht funktioniert, Sie eine Idee haben oder etwas unklar ist. Viel Erfolg beim Testen!
              </p>
            </div>
          </section>
        </div>

        <div className="mt-6 border-t border-slate-700 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-slate-400">
            Sie können diese Anleitung jederzeit über <Link href="/dashboard/hilfe" onClick={onClose} className="underline hover:text-white">Dashboard &gt; Hilfe</Link> erneut öffnen.
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 disabled:bg-orange-800 disabled:cursor-not-allowed"
          >
            {isSaving && <ArrowPathIcon className="h-4 w-4" />}
            {isSaving ? "Speichern..." : "Verstanden, los geht's!"}
          </button>
        </div>
      </div>
    </div>
  );
}