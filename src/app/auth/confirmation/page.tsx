// src/app/auth/confirmation/page.tsx
"use client";

import Link from "next/link";
import React from "react";

// Icon für "Erfolg"
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function AuthConfirmationPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-xl">
        <CheckCircleIcon className="mx-auto size-12 text-green-500" />

        <h1 className="my-4 text-2xl font-bold text-gray-900">
          Bestätigung erfolgreich!
        </h1>

        <p className="mb-8 text-gray-600">
          Ihre E-Mail-Adresse wurde erfolgreich verifiziert. Sie können dieses
          Fenster jetzt schließen und sich in der App anmelden.
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full rounded-md bg-orange-600 px-4 py-3 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Zum Login
          </Link>
        </div>
      </div>
    </main>
  );
}
