// src/app/datenschutz/page.tsx
"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
// *** Corrected import casing ***
import Footer from '@/components/Footer'; // Import Footer with lowercase 'f'

// Define Profile type
type Profile = { id: string; business_name: string | null; /* other fields */ };


export default function DatenschutzPage() {
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
        console.error("Error fetching profile for Datenschutz:", error);
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
            Datenschutzerklärung
          </h1>
          <div className="mt-10 prose prose-lg prose-slate max-w-none">
            {/* --- PASTE YOUR DATENSCHUTZ CONTENT HERE --- */}
            <h2>1. Datenschutz auf einen Blick</h2>
            <h3>Allgemeine Hinweise</h3> <p>[...]</p>
            <h3>Datenerfassung auf dieser Website</h3> <p>[...]</p>
            <h2>2. Hosting</h2> <p>[...]</p>
            <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
            <h3>Datenschutz</h3> <p>[...]</p>
            <h3>Verantwortliche Stelle</h3>
            <p> Max Mustermann <br/> Musterstraße 1 <br/> 01454 Radeberg <br/> Telefon: +49 (0) 123 456789 <br/> E-Mail: info@beispiel-handwerk.de </p>
            <h3>Speicherdauer</h3> <p>[...]</p>
            <h3>Ihre Rechte</h3> <p>[...]</p>
            <h2>4. Datenerfassung auf dieser Website</h2>
            <h3>Cookies</h3> <p>[...]</p>
            <h3>Kontaktformular</h3> <p>[...]</p>
            <h3>Server-Log-Dateien</h3> <p>[...]</p>
            <p> Quelle: Teilweise erstellt mit ... </p>
            {/* --- END OF DATENSCHUTZ CONTENT --- */}
          </div>
        </div>
      </main>
       {/* Pass profile name, Footer handles fallback */}
       <Footer businessName={profile?.business_name} />
    </div>
  );
}

// test deploy