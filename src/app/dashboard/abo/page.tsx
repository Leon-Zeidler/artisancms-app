// src/app/dashboard/abo/page.tsx
"use client";

import React, { useState } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { isBetaActive, hasActiveSubscription } from '@/lib/subscription';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import toast from 'react-hot-toast';
import Link from 'next/link';

// Icons für die Seite
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z" />
  </svg>
);
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 animate-spin">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

export default function AboPage() {
  const profile = useProfile();
  const [loading, setLoading] = useState(false);

  // Nutzen unserer neuen Helper-Funktionen
  const isBeta = isBetaActive(profile);
  const isActiveSub = hasActiveSubscription(profile);

  // Diese Funktion ruft unsere API-Route auf
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ein Fehler ist aufgetreten.');
      }

      // Leite den Nutzer zur Stripe Checkout-Seite
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(`Fehler: ${err.message}`);
      setLoading(false);
    }
  };
  
  // Datumsformatierung für Beta-Ablauf
  const getBetaExpiryDate = () => {
    if (!profile?.beta_expires_at) return "unbegrenzt";
    try {
      return new Date(profile.beta_expires_at).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return "unbekannt";
    }
  };

  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      <DashboardHero
        eyebrow="Abonnement"
        title="Ihr ArtisanCMS-Status"
        subtitle="Verwalten Sie hier Ihr Abonnement und sehen Sie Ihren aktuellen Plan ein."
      />

      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-orange-100 bg-white/90 shadow-lg shadow-orange-100/40">
          
          {/* Fall 1: Nutzer ist aktiver Beta-Tester */}
          {isBeta && (
            <div className="p-8 text-center">
              <SparklesIcon className="mx-auto h-12 w-12 text-orange-500" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Sie sind Beta-Tester!
              </h3>
              <p className="mt-2 text-slate-600">
                Vielen Dank für Ihre Unterstützung. Sie haben vollen Zugriff auf alle Funktionen.
              </p>
              <p className="mt-4 rounded-lg bg-orange-50 p-3 text-sm font-medium text-orange-700">
                Ihr Beta-Zugang ist gültig bis:{" "}
                <span className="font-bold">{getBetaExpiryDate()}</span>
              </p>
            </div>
          )}

          {/* Fall 2: Nutzer hat ein aktives Stripe-Abo (aber ist kein Beta-Tester) */}
          {isActiveSub && !isBeta && (
            <div className="p-8 text-center">
              <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-500" />
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                Meister-Plan Aktiv
              </h3>
              <p className="mt-2 text-slate-600">
                Ihr Abonnement ist aktiv. Vielen Dank für Ihr Vertrauen!
              </p>
              {/* Hier könnte man später einen Link zum Stripe Customer Portal einfügen */}
            </div>
          )}

          {/* Fall 3: Nutzer hat kein Abo und ist kein Beta-Tester */}
          {!isActiveSub && !isBeta && (
            <div className="p-8">
              <h3 className="text-xl font-semibold text-slate-900">
                Abonnement starten
              </h3>
              <p className="mt-2 text-slate-600">
                Ihre Beta-Phase ist abgelaufen oder Sie haben noch keinen Plan ausgewählt. 
                Starten Sie jetzt Ihr Abo, um ArtisanCMS weiter nutzen zu können.
              </p>
              <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-orange-800">Meister-Plan</h4>
                    <p className="text-sm text-orange-700">Alle Funktionen, unbegrenzte Projekte.</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-800">
                    29€<span className="text-sm font-normal">/Monat</span>
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="mt-5 w-full inline-flex items-center justify-center gap-x-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  {loading && <ArrowPathIcon className="h-4 w-4" />}
                  {loading ? "Leite zu Stripe weiter..." : "Jetzt abonnieren"}
                </button>
              </div>
            </div>
          )}
          
          <div className="border-t border-orange-100 bg-orange-50/60 px-6 py-4 text-center text-xs text-slate-500">
            Fragen zur Abrechnung? <Link href="mailto:leon@artisancms.app" className="font-medium text-orange-600 underline">Kontaktieren Sie den Support</Link>.
          </div>
        </div>
      </div>
    </main>
  );
}