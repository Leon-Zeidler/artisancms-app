// src/app/[slug]/datenschutz/page.tsx
"use client";

import React from "react";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { useProfile } from "@/contexts/ProfileContext"; // <-- IMPORT CONTEXT

export default function DatenschutzPage() {
  const profile = useProfile(); // <-- GET PROFILE FROM CONTEXT

  if (!profile) {
    return (
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Datenschutzerklärung
          </h1>

          <LegalDisclaimer />

          <p className="mt-10 text-gray-500">Profil wird geladen...</p>
        </div>
      </div>
    );
  }

  // Layout (Navbar, Footer, CSS vars) is handled by layout.tsx
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Datenschutzerklärung
        </h1>

        <LegalDisclaimer />

        <div className="prose prose-lg prose-slate mt-10 max-w-none">
          {profile.datenschutz_text ? (
            <div style={{ whiteSpace: "pre-line" }}>
              {profile.datenschutz_text}
            </div>
          ) : (
            <p className="italic text-gray-500">
              Kein Datenschutzerklärungstext hinterlegt.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
