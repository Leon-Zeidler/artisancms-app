// src/components/WelcomeModal.tsx
"use client";

import React from "react";

// --- Icons ---
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z"
    />
  </svg>
);

const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 01-1.06 0l-3.72-3.72C9.847 17.001 9 16.036 9 14.9v-4.286c0-.97.616-1.813 1.5-2.097L12 6.75l3.75 1.761zm-6 3.486l-3.72 3.72a.75.75 0 000 1.06l3.72 3.72C11.153 20.809 12 19.925 12 18.887v-7.135c0-1.038-.847-2-1.98-2.093l-3.72-1.761a.75.75 0 00-.63.123 7.48 7.48 0 00-.738.738A7.47 7.47 0 003 11.25v4.286c0 .97.616 1.813 1.5 2.097L6 18.311v-.757c0-1.28.624-2.43 1.65-3.181l.71-.533zM18.75 9.75h.008v.008h-.008V9.75z"
    />
  </svg>
);

const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-4 h-4 animate-spin"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 12.75V6.375c0-1.036.84-1.875 1.875-1.875h3.9c.498 0 .977.198 1.33.55l1.07 1.07c.352.353.832.55 1.33.55h6.12c1.035 0 1.875.84 1.875 1.875V12.75m-17.5 0v4.875c0 1.035.84 1.875 1.875 1.875h13.75c1.035 0 1.875-.84 1.875-1.875V12.75m-17.5 0h17.5"
    />
  </svg>
);

const GlobeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m-7.5 9h15"
    />
  </svg>
);

interface WelcomeModalProps {
  onClose: () => void;
  isSaving: boolean;
}

export default function WelcomeModal({ onClose, isSaving }: WelcomeModalProps) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="welcome-modal-title"
    >
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 sm:p-8 max-w-2xl w-full border border-slate-700">
        <div className="flex items-start gap-3">
          <SparklesIcon className="h-8 w-8 text-orange-400 flex-shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-orange-300/80">
              Willkommen zur ArtisanCMS Beta
            </p>
            <h2 id="welcome-modal-title" className="text-2xl font-bold text-white">
              Überblick &amp; nächste Schritte für deinen Testlauf
            </h2>
          </div>
        </div>

        <div className="mt-6 space-y-6 text-slate-300">
          <p>
            Damit du dich sofort zurechtfindest, haben wir die wichtigsten Bereiche mit kurzen
            Wegbeschreibungen zusammengefasst. Folge der Checkliste, um den Kern-Workflow einmal
            durchzuspielen, und nutze die Schnellverweise, wenn du später etwas nachschlagen
            möchtest.
          </p>

          <section aria-labelledby="welcome-modal-checklist">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-700/50 border border-slate-700/70">
              <SparklesIcon className="h-7 w-7 text-orange-300 mt-1 flex-shrink-0" aria-hidden="true" />
              <div>
                <h3 id="welcome-modal-checklist" className="text-lg font-semibold text-white">
                  Schnellstart-Checkliste (5 Minuten)
                </h3>
                <ol className="mt-3 space-y-2 text-sm text-slate-300 list-decimal list-inside">
                  <li>
                    Öffne <strong className="text-white">Dashboard &gt; Projekte</strong> für einen Überblick deiner Kunden-Websites.
                  </li>
                  <li>
                    Klicke auf <strong className="text-orange-300">Neues Projekt</strong>, gib einen Titel ein und wähle
                    anschließend <strong className="text-orange-300">Generieren</strong>, um den AI-Zaubermoment zu erleben.
                  </li>
                  <li>
                    Wechsle in den Reiter <strong className="text-white">Services</strong>, um Module hinzuzufügen und direkt im
                    Vorschau-Editor zu testen.
                  </li>
                  <li>
                    Schau dir nach dem Speichern die <strong className="text-white">Live-Vorschau</strong> an – sie erscheint rechts
                    oben in der Projektansicht.
                  </li>
                </ol>
              </div>
            </div>
          </section>

          <section aria-labelledby="welcome-modal-map" className="space-y-4">
            <h3 id="welcome-modal-map" className="text-lg font-semibold text-white">
              Wo findest du was?
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-4 rounded-lg border border-slate-700/70 bg-slate-700/40 p-4">
                <FolderIcon className="h-6 w-6 text-sky-300 mt-1" aria-hidden="true" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-white">Projekte &amp; Inhalte</h4>
                  <p className="text-sm text-slate-300">
                    Unter <strong>Dashboard &gt; Projekte</strong> findest du alle Kunden, Seitenstrukturen und die
                    AI-generierten Texte. Über die Tabs navigierst du zwischen Übersicht, Services und
                    Seiteninhalten.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border border-slate-700/70 bg-slate-700/40 p-4">
                <GlobeIcon className="h-6 w-6 text-emerald-300 mt-1" aria-hidden="true" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-white">Website &amp; Vorschau</h4>
                  <p className="text-sm text-slate-300">
                    Über den Button <strong>Zur Website</strong> (oben rechts) öffnest du den aktuellen Stand des
                    Kund:innen-Auftritts. Änderungen aus dem Editor landen nach dem Speichern direkt in der
                    Vorschau.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border border-slate-700/70 bg-slate-700/40 p-4">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-300 mt-1" aria-hidden="true" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-white">Feedback &amp; Support</h4>
                  <p className="text-sm text-slate-300">
                    Bugs, Wünsche oder Ideen? Nutze jederzeit das <strong>Feedback-Icon</strong> unten rechts oder
                    schreibe uns per <strong>support@artisancms.com</strong>. Wir melden uns schnellstmöglich.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border border-slate-700/70 bg-slate-700/40 p-4">
                <SparklesIcon className="h-6 w-6 text-orange-300 mt-1" aria-hidden="true" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-white">Fortgeschrittene Funktionen</h4>
                  <p className="text-sm text-slate-300">
                    Unter <strong>Einstellungen</strong> verwaltest du Team-Mitglieder, Farben, Domains und
                    Integrationen. Die AI-Vorlagen lassen sich im jeweiligen Projekt unter <strong>Templates</strong>
                    anpassen.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="welcome-modal-tip"
            className="flex items-start gap-4 rounded-lg bg-slate-700/50 p-4 border border-slate-700/70"
          >
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-300 mt-1" aria-hidden="true" />
            <div>
              <h3 id="welcome-modal-tip" className="text-lg font-semibold text-white">
                Noch ein Tipp
              </h3>
              <p className="mt-1 text-sm text-slate-300">
                Halte beim Testen gerne einen zweiten Tab offen, um direkt zwischen Editor und Live-Vorschau
                zu vergleichen. So erkennst du sofort, welche Wirkung deine Anpassungen haben.
              </p>
            </div>
          </section>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
          <p className="text-xs text-slate-400">
            Du kannst dieses Fenster jederzeit über <strong>Dashboard &gt; Hilfe</strong> erneut öffnen.
          </p>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 disabled:bg-orange-800 disabled:cursor-not-allowed"
          >
            {isSaving && <ArrowPathIcon className="h-4 w-4" />}
            {isSaving ? "Speichern..." : "Los geht's!"}
          </button>
        </div>
      </div>
    </div>
  );
}
