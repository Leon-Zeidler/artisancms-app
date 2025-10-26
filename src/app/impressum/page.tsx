// src/app/impressum/page.tsx
"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
// *** Corrected import casing ***
import Footer from '@/components/Footer'; // Import Footer with lowercase 'f'

// Define Profile type
type Profile = { id: string; business_name: string | null; /* other fields */ };

export default function ImpressumPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, business_name')
        .limit(1)
        .single();
      if (data) setProfile(data);
      // Log error but don't block rendering if profile fetch fails (PGRST116 means not found, which is ok)
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching profile for Impressum:", error);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);


  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Pass profile name, Navbar handles fallback */}
      <Navbar businessName={profile?.business_name} />
      <main className="flex-grow py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Impressum
          </h1>
          <div className="mt-10 prose prose-lg prose-slate max-w-none">
            {/* --- PASTE YOUR IMPRESSUM CONTENT HERE --- */}
            <h2>Angaben gemäß § 5 TMG</h2>
            <p> Max Mustermann <br /> Musterstraße 1 <br /> 01454 Radeberg </p>
            <h2>Kontakt</h2>
            <p> Telefon: +49 (0) 123 456789 <br /> E-Mail: info@beispiel-handwerk.de </p>
            <h2>Umsatzsteuer-ID</h2>
            <p> Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: <br /> DE123456789 </p>
            <p> <strong>Haftungsausschluss (Disclaimer)</strong> <br/> [...] </p>
            <p> <strong>Urheberrecht</strong> <br/> [...] </p>
            {/* --- END OF IMPRESSUM CONTENT --- */}
          </div>
        </div>
      </main>
      {/* Pass profile name, Footer handles fallback */}
      <Footer businessName={profile?.business_name} />
    </div>
  );
}

