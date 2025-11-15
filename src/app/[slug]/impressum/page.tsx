// src/app/[slug]/impressum/page.tsx
"use client";

import { useProfile } from "@/contexts/ProfileContext";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";

export default function ImpressumPage() {
  const profile = useProfile();

  // --- FIX: "Null-Check" ---
  // Wenn das Profil noch nicht geladen ist, zeige einen Ladezustand
  if (!profile) {
    return (
      <div className="prose prose-lg mx-auto max-w-3xl px-6 py-24 sm:py-32">
        <h1>Impressum</h1>
        <p>Lade Impressum...</p>
      </div>
    );
  }
  // --- ENDE FIX ---

  // Ab hier ist 'profile' garantiert nicht 'null'
  return (
    <div className="prose prose-lg mx-auto max-w-3xl px-6 py-24 sm:py-32">
      <h1>Impressum</h1>
      
      {/* Das 'prose' Styling wird den HTML-String korrekt formatieren */}
      <div
        dangerouslySetInnerHTML={{
          __html: profile.impressum_text || "<p>Kein Impressumstext vorhanden.</p>",
        }}
      />

      <LegalDisclaimer />
    </div>
  );
}