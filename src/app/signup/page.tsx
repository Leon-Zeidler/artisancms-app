"use client"; 

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false); // <-- NEUES STATE
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter(); 
  
  const resolveSiteUrl = (): string | null => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (envUrl && envUrl.trim().length > 0) { return envUrl; }
    if (typeof window !== 'undefined' && window.location?.origin) { return window.location.origin; }
    return null;
  };

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null); setMessage(null);
    
    // --- NEUE PRÜFUNG ---
    if (password !== confirmPassword) { setError("Passwörter stimmen nicht überein."); return; }
    if (password.length < 6) { setError("Passwort muss mindestens 6 Zeichen lang sein."); return; }
    if (!agreedToTerms) {
      setError("Bitte stimmen Sie den AGB und der Datenschutzerklärung zu, um fortzufahren.");
      return;
    }
    // --- ENDE NEUE PRÜFUNG ---
    
    setLoading(true); 

    const baseUrl = resolveSiteUrl();
    if (!baseUrl) {
      setLoading(false);
      toast.error("Site URL konnte nicht ermittelt werden. Registrierung fehlgeschlagen.");
      return;
    }
    
    const redirectUrl = `${baseUrl.replace(/\/$/, '')}/auth/callback`;
    console.log("Using redirect URL for signup:", redirectUrl);

    const signupPromise = supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    await toast.promise(
      signupPromise,
      {
        loading: 'Konto wird erstellt...',
        success: (data) => {
          if (data.error) { throw data.error; }
          if (!data.data.user) { throw new Error("Benutzer konnte nicht erstellt werden."); }
          if (data.data.user.identities && data.data.user.identities.length === 0) {
            throw new Error("E-Mail bereits registriert, aber nicht bestätigt.");
          }
          setMessage("Konto erstellt! Bitte prüfen Sie Ihr Postfach (und Spam-Ordner) für den Bestätigungslink.");
          return 'Konto erstellt!';
        },
        error: (err: any) => {
          console.error('Signup error:', err.message);
          return `Fehler: ${err.message}`;
        },
      }
    );
    setLoading(false);
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"> Konto erstellen </h1>
          <p className="mt-2 text-sm text-gray-600"> Starten Sie mit ArtisanCMS und erstellen Sie Ihre professionelle Webseite. </p>
        </header>
        <section className="card-surface p-6 sm:p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900"> E-Mail-Adresse </label>
              <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900"> Passwort </label>
              <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Mindestens 6 Zeichen" />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900"> Passwort bestätigen </label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="mt-2 w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Passwort erneut eingeben" />
            </div>
            
            {/* --- NEUE CHECKBOX --- */}
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="agb"
                  name="agb"
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="agb" className="text-gray-700">
                  Ich habe die <Link href="/agb" target="_blank" className="font-semibold text-brand hover:text-brand-dark underline">AGB</Link> und die <Link href="/datenschutz" target="_blank" className="font-semibold text-brand hover:text-brand-dark underline">Datenschutzerklärung</Link> gelesen und stimme ihnen zu.
                </label>
              </div>
            </div>
            {/* --- ENDE NEUE CHECKBOX --- */}

            {error && <p className="text-center text-sm text-red-600">{error}</p>}
            {message && <p className="text-center text-sm text-green-600">{message}</p>}
            
            <button 
              type="submit" 
              disabled={loading || !agreedToTerms} 
              className="w-full rounded-xl bg-brand px-4 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Konto wird erstellt…' : 'Kostenlos registrieren'}
            </button>
          </form>
        </section>
        <p className="text-center text-sm text-gray-600">
          Bereits ein Konto?{' '}
          <Link href="/login" className="font-semibold text-brand hover:text-brand-dark"> Jetzt anmelden </Link>
        </p>
      </div>
    </main>
  );
}