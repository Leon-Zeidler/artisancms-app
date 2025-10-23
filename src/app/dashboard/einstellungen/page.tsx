// Mark as client component for interactivity (logout button)
"use client";

// Import necessary hooks and components
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Use standard Next.js import
// Corrected import path using relative path
import { supabase } from '../../../lib/supabaseClient'; 
import { User } from '@supabase/supabase-js'; // User type

// --- Icon for Logout Button ---
const ArrowRightStartOnRectangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
);


export default function EinstellungenPage() {
  // === State Variables ===
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false); // Loading state for logout

  const router = useRouter();

  // === Get Current User on Load ===
  useEffect(() => {
    const getUser = async () => {
      setLoading(true);
      setError(null);
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        setError("Benutzerinformationen konnten nicht geladen werden.");
        setCurrentUser(null);
      } else {
        setCurrentUser(user);
        if (!user) {
          // If no user found (session expired?), redirect to login
          router.push('/login');
        }
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  // === Handle Logout Function ===
  const handleLogout = async () => {
    setLogoutLoading(true);
    setError(null);
    console.log("Attempting logout...");

    const { error: signOutError } = await supabase.auth.signOut();

    setLogoutLoading(false);

    if (signOutError) {
      console.error('Error logging out:', signOutError);
      setError(`Abmeldung fehlgeschlagen: ${signOutError.message}`);
    } else {
      console.log("Logout successful");
      // Redirect to the public homepage after successful logout
      router.push('/');
      router.refresh(); // Ensure layout re-renders if needed
    }
  };


  // === Render Logic ===
  return (
    <main className="p-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Einstellungen</h1>
        <p className="text-slate-400 mt-1">Verwalten Sie hier Ihr Konto.</p>
      </div>

      {/* Loading State */}
      {loading && (
        <p className="text-slate-400 mt-8 text-center">Lade Benutzerdaten...</p>
      )}

      {/* Error State */}
      {error && !loading && (
         <p className="text-red-500 mt-8 text-center">{error}</p>
      )}

      {/* Settings Content */}
      {!loading && currentUser && !error && (
        <div className="mt-8 max-w-xl space-y-8">
           {/* Account Information Section */}
           <section>
              <h2 className="text-xl font-semibold text-white mb-4">Konto</h2>
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <dl className="space-y-2">
                    <div className="flex justify-between">
                        <dt className="text-sm font-medium text-slate-400">Email</dt>
                        <dd className="text-sm text-white">{currentUser.email}</dd>
                    </div>
                     <div className="flex justify-between">
                        <dt className="text-sm font-medium text-slate-400">Benutzer-ID</dt>
                        <dd className="text-xs text-slate-500">{currentUser.id}</dd>
                    </div>
                    {/* Placeholder for Password Change */}
                    {/* <div className="pt-2">
                         <button className="text-sm text-orange-500 hover:text-orange-400">Passwort ändern</button>
                    </div> */}
                </dl>
              </div>
           </section>

           {/* Subscription Section (Placeholder) */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Abonnement</h2>
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                  <p className="text-sm text-slate-400">Aktueller Plan: <span className="text-white font-medium">Free / Pro (Placeholder)</span></p>
                  {/* <button className="mt-4 rounded-md bg-orange-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700">
                    Abo verwalten
                  </button> */}
                  <p className="mt-4 text-xs text-slate-500">Die Abonnementverwaltung wird in Kürze verfügbar sein.</p>
              </div>
            </section>

           {/* Logout Button */}
           <section className="border-t border-slate-700 pt-8">
               <button
                 onClick={handleLogout}
                 disabled={logoutLoading}
                 className={`inline-flex items-center gap-x-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors ${
                    logoutLoading
                     ? 'bg-red-800 cursor-not-allowed'
                     : 'bg-red-700 hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700'
                 }`}
               >
                 <ArrowRightStartOnRectangleIcon className={`h-5 w-5 ${logoutLoading ? 'animate-spin' : ''}`} />
                 {logoutLoading ? 'Abmelden...' : 'Abmelden'}
               </button>
                {/* Display logout error if any */}
               {error && error.startsWith("Abmeldung fehlgeschlagen:") && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                )}
           </section>
        </div>
      )}
    </main>
  );
}

