// src/app/[slug]/datenschutz/page.tsx
"use client";

import React from 'react';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import { useProfile } from '@/contexts/ProfileContext'; // <-- IMPORT CONTEXT

export default function DatenschutzPage() {
  const profile = useProfile(); // <-- GET PROFILE FROM CONTEXT

  // Layout (Navbar, Footer, CSS vars) is handled by layout.tsx
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Datenschutzerklärung
        </h1>

        <LegalDisclaimer />

        <div className="mt-10 prose prose-lg prose-slate max-w-none">
          {profile.datenschutz_text ? (
               <div style={{ whiteSpace: 'pre-line' }}>
                  {profile.datenschutz_text}
               </div>
          ) : (
              <p className="text-gray-500 italic">
                  Kein Datenschutzerklärungstext hinterlegt.
              </p>
          )}
        </div>
      </div>
    </div>
  );
}
