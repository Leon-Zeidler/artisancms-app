// src/app/impressum/page.tsx
"use client";

import Link from 'next/link';

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Simple Header */}
      <header className="py-4 bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold text-gray-900">
            ArtisanCMS
          </Link>
        </div>
      </header>
      
      {/* Main Content Area for Legal Text */}
      <main className="flex-grow py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Impressum
          </h1>

          {/* This 'prose' class adds nice default styling for text */}
          <div className="mt-10 prose prose-lg prose-slate max-w-none">
            {/* !!! WICHTIGER HINWEIS !!!
              Dies ist nur ein Platzhalter. Sie müssen diesen Text
              durch Ihr eigenes, rechtssicheres Impressum ersetzen.
              Bitte konsultieren Sie einen Anwalt.
            */}
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
              [Leon Zeidler]
              <br />
              [Alter Dorfrand 50]
              <br />
              [01454 Radeberg]
            </p>

            <h2>Vertreten durch:</h2>
            <p>[Leon Zeidler]</p>

            <h2>Kontakt:</h2>
            <p>
              Telefon: [+49 174 194 1609]
              <br />
              E-Mail: [leon@northcoded.com]
            </p>

            {/* Fügen Sie hier weitere erforderliche Angaben hinzu, 
                z.B. Umsatzsteuer-ID (falls vorhanden), 
                Registereintrag, etc. */}
          </div>

          <div className="mt-16">
            <Link href="/" className="text-sm font-semibold leading-6 text-orange-600 hover:text-orange-500">
              <span aria-hidden="true">←</span> Zurück zur Startseite
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
