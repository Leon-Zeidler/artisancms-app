"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseClient } from '../../lib/supabaseClient';
import toast from 'react-hot-toast';

// --- Icons ---
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> </svg> );
const EyeSlashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /> </svg> );
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const ExclamationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  const resolveSiteUrl = (): string | null => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (envUrl && envUrl.trim().length > 0) { return envUrl; }
    if (typeof window !== 'undefined' && window.location?.origin) { return window.location.origin; }
    return null;
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); setError(null); setMessage(null); setShowResendButton(false);
    console.log("Attempting login...");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    setLoading(false);

    if (signInError) {
      console.error('Login error:', signInError.message);
      const msg = (signInError.message || '').toLowerCase();
      if (msg.includes('invalid login credentials')) { setError('Invalid email or password.'); }
      else if (msg.includes('email not confirmed') || msg.includes('confirm your email') || msg.includes('email_not_confirmed')) {
        setError('Please confirm your email address first. Check your inbox (and spam folder) for the confirmation link.');
        setShowResendButton(true);
      } else { setError(`Login failed: ${signInError.message}`); }
    } else {
      console.log('Login successful:', data);
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handlePasswordReset = async () => {
    if (!email) { toast.error("Please enter your email address first to reset the password."); return; }
    setResetLoading(true); setError(null); setMessage(null); setShowResendButton(false);

    const baseUrl = resolveSiteUrl();
    if (!baseUrl) {
      setResetLoading(false);
      toast.error("Unable to determine the site URL for password reset. Please try again later.");
      return;
    }
    const redirectUrl = `${baseUrl.replace(/\/$/, '')}/reset-password`;
    console.log("Sending password reset, redirecting to:", redirectUrl);

    const resetPromise = supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl });
    await toast.promise( resetPromise, {
      loading: 'Sending password reset instructions...',
      success: () => { setMessage("Password reset instructions sent! Please check your email (including spam folder)."); return 'Reset email sent!'; },
      error: (err: any) => { console.error('Password reset error:', err.message); setError(`Error sending reset email: ${err.message}`); return `Error: ${err.message}`; },
    });
    setResetLoading(false);
  };

  const handleResendConfirmation = async () => {
    if (!email) { toast.error("Please enter the email address again to resend confirmation."); return; }
    setResendLoading(true); setError(null); setMessage(null);

    const baseUrl = resolveSiteUrl();
    if (!baseUrl) {
      setResendLoading(false);
      toast.error("Unable to determine the site URL to build the confirmation link.");
      return;
    }
    const redirectUrl = `${baseUrl.replace(/\/$/, '')}/auth/callback`;

    const resendPromise = supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectUrl }, });
    await toast.promise( resendPromise, {
      loading: 'Resending confirmation email...',
      success: (data: any) => {
        if (data?.error) { throw data.error; }
        setMessage("Confirmation email resent! Please check your inbox (and spam folder).");
        setShowResendButton(false);
        return 'Confirmation email resent!';
      },
      error: (err: any) => {
        console.error('Resend confirmation error:', err?.message || err);
        setError(`Error resending email: ${err?.message || err}`);
        return `Error: ${err?.message || err}`;
      },
    });
    setResendLoading(false);
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"> Willkommen zurück </h1>
          <p className="mt-2 text-sm text-gray-600"> Melden Sie sich an, um Ihr Dashboard und Ihre Kundenwebseite zu verwalten. </p>
        </header>
        <section className="card-surface p-6 sm:p-8">
          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-900"> E-Mail-Adresse </label>
              <input type="email" id="email" name="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 text-base text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand" placeholder="you@example.com" required aria-describedby="email-description" />
              <p id="email-description" className="text-xs text-gray-500"> Wir verwenden diese Adresse für Anmeldebestätigungen und Passwort-Resets. </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-900"> Passwort </label>
                <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-xs font-semibold text-brand transition hover:text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"> {showPassword ? 'Verbergen' : 'Anzeigen'} </button>
              </div>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} id="password" name="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 pr-12 text-base text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand" placeholder="Passwort eingeben" required minLength={6} />
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400"> {showPassword ? <EyeSlashIcon className="h-5 w-5" aria-hidden="true" /> : <EyeIcon className="h-5 w-5" aria-hidden="true" />} </span>
              </div>
            </div>
            <div aria-live="polite" className="space-y-3">
              {error && ( <div className="flex items-start gap-x-3 rounded-xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-700" role="alert"> <ExclamationCircleIcon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" /> <p>{error}</p> </div> )}
              {message && ( <div className="flex items-start gap-x-3 rounded-xl border border-green-200 bg-green-50/90 p-3 text-sm text-green-700" role="status"> <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" /> <p>{message}</p> </div> )}
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand px-4 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Anmeldung läuft…' : 'Anmelden'}
            </button>
          </form>
          <div className="mt-6 space-y-3 text-sm text-gray-600">
            <button type="button" onClick={handlePasswordReset} disabled={resetLoading} className="flex w-full items-center justify-center gap-x-2 rounded-xl border border-transparent bg-brand/10 px-4 py-3 font-medium text-brand transition hover:bg-brand/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60">
              {resetLoading ? 'Passwort-Link wird gesendet…' : 'Passwort vergessen?'}
            </button>
            {showResendButton && (
              <button type="button" onClick={handleResendConfirmation} disabled={resendLoading} className="flex w-full items-center justify-center gap-x-2 rounded-xl border border-dashed border-brand px-4 py-3 font-medium text-brand transition hover:bg-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60">
                {resendLoading ? 'Bestätigung wird erneut gesendet…' : 'Bestätigungsmail erneut senden'}
              </button>
            )}
          </div>
        </section>
        <p className="text-center text-sm text-gray-600">
          Noch kein Konto?{' '}
          <Link href="/signup" className="font-semibold text-brand hover:text-brand-dark"> Jetzt registrieren </Link>
        </p>
      </div>
    </main>
  );
}