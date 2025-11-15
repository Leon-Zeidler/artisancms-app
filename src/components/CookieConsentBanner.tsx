// src/components/CookieConsentBanner.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem("cookie_consent");
    if (consent !== "true") {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Set consent in local storage and hide banner
    localStorage.setItem("cookie_consent", "true");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 z-[100] w-full border-t border-orange-100 bg-white/95 py-4 shadow-2xl shadow-orange-200/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          Wir verwenden Cookies und ähnliche Technologien (z.B. Vercel
          Analytics), um die Nutzung unserer Website zu analysieren und Ihr
          Erlebnis zu verbessern. Durch die weitere Nutzung dieser Website
          stimmen Sie dem zu. Mehr Informationen finden Sie in unserer{" "}
          <Link
            href="/datenschutz"
            className="font-semibold text-orange-600 underline-offset-2 hover:text-orange-500 hover:underline"
          >
            Datenschutzerklärung
          </Link>
          .
        </p>
        <button
          onClick={handleAccept}
          className="shrink-0 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200"
        >
          Akzeptieren & Schließen
        </button>
      </div>
    </div>
  );
}
