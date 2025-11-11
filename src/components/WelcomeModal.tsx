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
// NEUE ICONS
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />
  </svg>
);
const PaintBrushIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L19.5 6.216a2.625 2.625 0 00-3.713-3.712L6.1 12.19a6 6 0 00-1.757 3.799l-.17 1.538a1.125 1.125 0 001.24 1.24l1.538-.17a6 6 0 003.801-1.793z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 16.5c0 1.657-1.79 3-4 3 .667-.667 1.25-2 1-3 .25 1 1.333 1.333 3 0z" />
  </svg>
);
const MegaphoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l.621-1.864a.75.75 0 011.411.472L20.25 12l1.282 5.142a.75.75 0 01-1.411.472L19.5 15.75M19.5 8.25l-6.124 1.749M19.5 8.25v7.5M13.376 9.999L12 20.25m1.376-10.251L12 5.25 5.5 7.125v9.75L12 18.75l1.376-8.751zM8.25 9.75h.008v.008H8.25V9.75zm0 2.25h.008v.008H8.25V12z"
    />
  </svg>
);
const LifebuoyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.5 4.478A9.04 9.04 0 0012 3c-1.595 0-3.087.416-4.5 1.152m9 0A8.959 8.959 0 0120.848 9.5m-4.348-5.022L12 9m-4.5-4.522A8.959 8.959 0 003.152 9.5m4.348-5.022L12 9m-8.848.5A8.959 8.959 0 003.152 14.5M3.152 9.5H9m-5.848 5a8.959 8.959 0 004.348 5.022M3.152 14.5L9 12m6 8.022A9.04 9.04 0 0012 21c-1.595 0-3.087-.416-4.5-1.152m9 0A8.959 8.959 0 0020.848 14.5m-4.348 5.022L12 15m8.848-.5A8.959 8.959 0 0020.848 9.5M20.848 14.5H15m5.848-5l-5.848 2.5M9 21a8.959 8.959 0 01-4.5-1.152M9 21l3-6m0-6A3 3 0 119 9a3 3 0 013 0z"
    />
  </svg>
);


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
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="welcome-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-[min(92vw,56rem)] sm:w-[min(92vw,64rem)] max-w-3xl rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-200/50 max-h-[85vh] flex flex-col px-6 py-8 sm:px-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isSaving}
          className="absolute right-4 top-4 rounded-full bg-orange-50 p-2 text-orange-500 transition hover:bg-orange-100 hover:text-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Modal schließen"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="flex items-start gap-3">
          <SparklesIcon className="h-8 w-8 flex-shrink-0 text-orange-500" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
              Willkommen zur ArtisanCMS Beta
            </p>
            <h2 id="welcome-modal-title" className="text-2xl font-bold text-slate-900">
              So funktioniert&apos;s: Von Null zur Live-Webseite
            </h2>
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-2 text-slate-600">
          <p>
            Vielen Dank, dass Sie die Beta-Version testen! Hier ist der empfohlene Weg, um Ihre Webseite
            schnellstmöglich online zu bringen und die wichtigsten Funktionen zu verstehen.
          </p>

          {/* --- NEU: Rechtlicher Hinweis --- */}
          <section aria-labelledby="welcome-modal-legal" className="flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
            <ExclamationTriangleIcon className="mt-0.5 h-6 w-6 flex-shrink-0 text-amber-500" aria-hidden="true" />
            <div>
              <h3 id="welcome-modal-legal" className="text-lg font-semibold text-slate-900">
                Wichtiger Hinweis zur Veröffentlichung
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Ihre Webseite kann erst live geschaltet werden, wenn Sie ein **Impressum** und eine **Datenschutzerklärung**
                hinterlegt haben. Dies ist eine gesetzliche Anforderung in Deutschland.
              </p>
            </div>
          </section>

          <section aria-labelledby="welcome-modal-steps" className="space-y-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
            <h3 id="welcome-modal-steps" className="text-lg font-semibold text-slate-900">
              Ihr 4-Schritte-Plan zur Live-Seite
            </h3>
            <ol className="mt-3 space-y-4 list-decimal list-inside text-sm text-slate-600">
              <li>
                <strong className="text-orange-600">Stammdaten & Rechtliches eintragen:</strong>
                <br />
                Gehen Sie zu <Link href="/dashboard/einstellungen" onClick={onClose} className="text-orange-600 underline hover:text-orange-500">Einstellungen</Link>.
                {/* --- FIX: Replaced \` with &apos; --- */}
                Füllen Sie unter &apos;Firmendaten&apos; Ihren Namen und Ihre Adresse aus und hinterlegen Sie Ihre Texte für &apos;Impressum&apos; sowie &apos;Datenschutz&apos;.
              </li>
              <li>
                <strong className="text-orange-600">Branding & Farben festlegen:</strong>
                <br />
                Personalisieren Sie unter <Link href="/dashboard/einstellungen#branding" onClick={onClose} className="text-orange-600 underline hover:text-orange-500">Branding</Link>
                Ihr Logo, Farbschema und den Call-to-Action. So fühlt sich Ihre Seite sofort wie Ihr Unternehmen an.
              </li>
              <li>
                <strong className="text-orange-600">Erstes Projekt mit AI erstellen:</strong>
                <br />
                Gehen Sie zu <Link href="/dashboard/projekte" onClick={onClose} className="text-orange-600 underline hover:text-orange-500">Projekte</Link> und klicken Sie auf &apos;Neues Projekt&apos;.
                Laden Sie ein &quot;Nachher-Bild&quot; hoch – unsere KI schreibt automatisch eine passende Beschreibung. Setzen Sie den Status auf &quot;Veröffentlicht&quot; und speichern Sie.
              </li>
              <li>
                <strong className="text-orange-600">Webseite veröffentlichen:</strong>
                <br />
                Aktivieren Sie unter <Link href="/dashboard/einstellungen#sicherheit" onClick={onClose} className="text-orange-600 underline hover:text-orange-500">Gefahrenzone</Link>
                {/* --- FIX: Replaced \` with &apos; --- */}
                den Schalter &apos;Website veröffentlichen&apos;. Fertig – Ihre Seite ist live!
              </li>
            </ol>
          </section>

          <section aria-labelledby="welcome-modal-highlights" className="rounded-2xl border border-orange-100 bg-white/90 p-5 shadow-sm shadow-orange-100/50">
            <h3 id="welcome-modal-highlights" className="text-lg font-semibold text-slate-900">
              Drei Highlights, die Sie ausprobieren sollten
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-orange-100 bg-orange-50/80 p-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <PaintBrushIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-semibold">Design verfeinern</span>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  Individualisieren Sie Schriftarten, Farben und Buttons, damit jede Unterseite Ihren Markenauftritt widerspiegelt.
                </p>
              </div>
              <div className="rounded-xl border border-orange-100 bg-orange-50/80 p-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <MegaphoneIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-semibold">Kundenstimmen sammeln</span>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  Aktivieren Sie unter <Link href="/dashboard/testimonials" onClick={onClose} className="text-orange-600 underline hover:text-orange-500">Kundenstimmen</Link>
                  Ihr Bewertungsformular und veröffentlichen Sie Referenzen direkt mit einem Klick.
                </p>
              </div>
              <div className="rounded-xl border border-orange-100 bg-orange-50/80 p-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <LifebuoyIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="text-sm font-semibold">Support erreichen</span>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  In <Link href="/dashboard/hilfe" onClick={onClose} className="text-orange-600 underline hover:text-orange-500">Dashboard &gt; Hilfe</Link>
                  finden Sie Anleitungen, Video-Shortcuts und direkte Kontaktmöglichkeiten zum Produktteam.
                </p>
              </div>
            </div>
          </section>

          <section aria-labelledby="welcome-modal-feedback" className="rounded-2xl border border-orange-100 bg-white/90 p-5 shadow-sm shadow-orange-100/50">
            <h3 id="welcome-modal-feedback" className="text-lg font-semibold text-slate-900">
              Feedback & Austausch
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Nutzen Sie jederzeit den **Feedback-Button (unten rechts)**, wenn etwas nicht funktioniert, Sie eine Idee haben oder etwas unklar ist.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
                Teilen Sie uns Bugs und Funktionswünsche direkt über das Formular mit – wir reagieren innerhalb von 24 Stunden.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
                Besuchen Sie <Link href="/dashboard/admin" onClick={onClose} className="text-orange-600 underline hover:text-orange-500">Dashboard &gt; Feedback</Link>,
                um den aktuellen Status Ihrer Meldungen einzusehen.
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-orange-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Sie können diese Anleitung jederzeit über <Link href="/dashboard/hilfe" onClick={onClose} className="font-semibold text-orange-600 underline-offset-2 hover:text-orange-500 hover:underline">Dashboard &gt; Hilfe</Link> erneut öffnen.
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex items-center gap-x-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {isSaving && <ArrowPathIcon className="h-4 w-4" />}
            {/* --- FIX: Replaced ' with &apos; --- */}
            {isSaving ? "Speichern..." : "Verstanden, los geht&apos;s!"}
          </button>
        </div>
      </div>
    </div>
  );
}