// src/components/CookieConsentBanner.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookie_consent');
    if (consent !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    // Set consent in local storage and hide banner
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 w-full bg-slate-800 text-white p-4 z-[100] border-t border-slate-700 shadow-lg">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-slate-300">
          Wir verwenden Cookies und ähnliche Technologien (z.B. Vercel Analytics), 
          um die Nutzung unserer Website zu analysieren und Ihr Erlebnis zu verbessern. 
          Durch die weitere Nutzung dieser Website stimmen Sie dem zu. 
          Mehr Informationen finden Sie in unserer{' '}
          <Link href="/datenschutz" className="font-medium underline hover:text-white">
            Datenschutzerklärung
          </Link>.
        </p>
        <button
          onClick={handleAccept}
          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 flex-shrink-0"
        >
          Akzeptieren & Schließen
        </button>
      </div>
    </div>
  );
}
