// We mark this as a "client component" because it uses interactive
// features like state and event handlers (form submission).
"use client"; 

// Import necessary tools from React and Next.js
import { useState, useMemo } from 'react'; // <-- 1. Import useMemo
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Corrected import path using relative path from src/app/signup/page.tsx
import { createSupabaseClient } from '../../lib/supabaseClient';

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExclamationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// This is the main function defining our React component for the signup page.
export default function SignupPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  // === State Variables ===
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false); // <-- 1. ADD STATE FOR CHECKBOX
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter(); 

  // === Handle Signup Function ===
  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); 
    
    // Basic validation
    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    
    // <-- 2. ADD CHECK FOR CONSENT -->
    if (!agreed) {
      setError("Sie müssen den AGB und der Datenschutzerklärung zustimmen.");
      return;
    }
    
    setLoading(true); 
    setError(null);
    setMessage(null); 

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    setLoading(false); 

    if (signUpError) {
      console.error('Signup error:', signUpError.message);
      setError(`Registrierung fehlgeschlagen: ${signUpError.message}`);
    } else {
      console.log('Signup successful:', data);
      
      if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
           setMessage("Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails, um Ihr Konto zu bestätigen.");
      } else if (data.user) {
           setMessage("Registrierung erfolgreich! Weiter zur Einrichtung..."); 
           router.push('/onboarding');
      } else {
           setMessage("Registrierung verarbeitet. Bitte versuchen Sie sich einzuloggen."); 
      }
    }
  };

  // === JSX Structure (The HTML-like part) ===
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="w-full max-w-2xl space-y-10">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Konto erstellen
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Legen Sie Ihr ArtisanCMS-Konto an und starten Sie mit der Erstellung Ihrer individuellen Kundenwebseite.
          </p>
        </header>

        <section className="card-surface p-6 sm:p-8">
          <form onSubmit={handleSignup} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-900">
                E-Mail-Adresse
              </label>
              <input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-900">
                  Passwort
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-semibold text-brand transition hover:text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {showPassword ? 'Verbergen' : 'Anzeigen'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 pr-12 text-base text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Mindestens 6 Zeichen"
                  required
                  minLength={6}
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">
                  Passwort bestätigen
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-xs font-semibold text-brand transition hover:text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {showConfirmPassword ? 'Verbergen' : 'Anzeigen'}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 pr-12 text-base text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="Passwort wiederholen"
                  required
                />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                  {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4">
              <label className="flex items-start gap-x-3">
                <input
                  id="agreed"
                  name="agreed"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-brand focus:ring-brand"
                  required
                />
                <span className="text-sm leading-6 text-gray-700">
                  Ich stimme den{' '}
                  <Link href="/agb" target="_blank" className="font-semibold text-brand hover:text-brand-dark">
                    AGB
                  </Link>{' '}
                  und der{' '}
                  <Link href="/datenschutz" target="_blank" className="font-semibold text-brand hover:text-brand-dark">
                    Datenschutzerklärung
                  </Link>{' '}
                  zu.
                </span>
              </label>
            </div>

            <div aria-live="polite" className="space-y-3">
              {error && (
                <div className="flex items-start gap-x-3 rounded-xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-700" role="alert">
                  <ExclamationCircleIcon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
                  <p>{error}</p>
                </div>
              )}
              {message && (
                <div className="flex items-start gap-x-3 rounded-xl border border-green-200 bg-green-50/90 p-3 text-sm text-green-700" role="status">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
                  <p>{message}</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full rounded-xl bg-brand px-4 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Konto wird erstellt…' : 'Registrieren'}
            </button>
          </form>
        </section>

        <div className="space-y-4 text-center text-sm text-gray-600">
          <p>
            Bereits ein Konto?{' '}
            <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
              Anmelden
            </Link>
          </p>
          <div className="flex flex-col items-center gap-3 text-xs text-gray-500 sm:flex-row sm:justify-center sm:text-sm">
            <Link href="/impressum" className="hover:text-gray-700">
              Impressum
            </Link>
            <span className="hidden sm:inline">·</span>
            <Link href="/datenschutz" className="hover:text-gray-700">
              Datenschutz
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
