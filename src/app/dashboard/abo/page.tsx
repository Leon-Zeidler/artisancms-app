// src/app/dashboard/abo/page.tsx
"use client";

import React from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { isBetaActive } from '@/lib/subscription';
import Link from 'next/link';

// Icons
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m3-3.75l-3 3m3 0l-3-3m-3.75 0h.008v.008H7.5v-.008zM4.5 12.75h15a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25h-15a2.25 2.25 0 00-2.25 2.25v3.75a2.25 2.25 0 002.25 2.25z" />
  </svg>
);

export default function AboPage() {
  const profile = useProfile();
  const betaActive = isBetaActive(profile);

  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      <DashboardHero
        eyebrow="Abonnement & Abrechnung"
        title="Ihr Plan"
        subtitle="Verwalten Sie hier Ihr Abonnement und sehen Sie Ihre Rechnungen ein."
      />

      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-lg shadow-orange-100/40">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Aktueller Status</h3>
            {betaActive ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Aktive Beta-Phase
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                Kein aktives Abo
              </span>
            )}
          </div>
          
          <div className="mt-6 space-y-4">
            {betaActive ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-500" />
                <h4 className="mt-2 text-xl font-semibold text-emerald-900">Beta-Zugang aktiv</h4>
                <p className="mt-1 text-sm text-emerald-700">
                  Sie nutzen derzeit alle Funktionen von ArtisanCMS kostenlos im Rahmen der Beta-Phase.
                  Es sind keine Zahlungsdaten hinterlegt.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <CreditCardIcon className="mx-auto h-12 w-12 text-slate-500" />
                <h4 className="mt-2 text-xl font-semibold text-slate-900">Kein aktives Abonnement</h4>
                <p className="mt-1 text-sm text-slate-700">
                  Um ArtisanCMS nach der Beta-Phase weiter zu nutzen, wählen Sie bitte einen Plan aus.
                </p>
                <button 
                  disabled 
                  className="mt-4 rounded-full bg-slate-300 px-5 py-2 text-sm font-semibold text-slate-500 cursor-not-allowed"
                >
                  Planauswahl (Demnächst verfügbar)
                </button>
              </div>
            )}

            <div className="mt-6 border-t border-orange-100 pt-6">
              <h4 className="font-semibold text-slate-900">Abrechnungsportal (Stripe)</h4>
              <p className="mt-1 text-sm text-slate-600">
                Hier können Sie (sobald verfügbar) Ihre Rechnungen einsehen und Zahlungsdaten ändern.
              </p>
              <button 
                disabled 
                className="mt-3 rounded-full bg-slate-300 px-4 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed"
              >
                Portal wird geladen...
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}