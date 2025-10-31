// We mark this as a "client component" because it uses interactive
// features like state and event handlers (form submission).
"use client"; 

// Import necessary tools from React and Next.js
import { useState } from 'react'; // To manage form inputs and messages
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Corrected import path using relative path from src/app/signup/page.tsx
import { supabase } from '../../lib/supabaseClient'; 

// This is the main function defining our React component for the signup page.
export default function SignupPage() {
  // === State Variables ===
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl border border-gray-200">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Konto erstellen
        </h1>

        <form onSubmit={handleSignup}>
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              E-Mail Adresse
            </label>
            <input
              type="email" id="email" name="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="you@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Passwort
            </label>
            <input
              type="password" id="password" name="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              minLength={6} 
            />
          </div>
          
           {/* Confirm Password Input */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Passwort bestätigen
            </label>
            <input
              type="password" id="confirmPassword" name="confirmPassword"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="••••••••"
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required
            />
          </div>
          
          {/* <-- 3. ADD CONSENT CHECKBOX --> */}
          <div className="mb-6">
            <div className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id="agreed"
                  name="agreed"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="agreed" className="text-gray-700">
                  Ich stimme den{' '}
                  <Link href="/agb" target="_blank" className="font-medium text-orange-600 hover:text-orange-500">
                    AGB
                  </Link>{' '}
                  und der{' '}
                  <Link href="/datenschutz" target="_blank" className="font-medium text-orange-600 hover:text-orange-500">
                    Datenschutzerklärung
                  </Link>{' '}
                  zu.
                </label>
              </div>
            </div>
          </div>


          {/* Error Message Display */}
          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}
          
           {/* Success Message Display */}
          {message && (
            <p className="mb-4 text-center text-sm text-green-600">{message}</p>
          )}

          {/* Submit Button */}
          {/* <-- 4. UPDATE DISABLED STATE --> */}
          <button
            type="submit"
            disabled={loading || !agreed} 
            className={`w-full rounded-md px-4 py-2 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors ${
              loading || !agreed
                ? 'bg-orange-300 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700' 
            }`}
          >
            {loading ? 'Konto wird erstellt...' : 'Registrieren'}
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Bereits ein Konto?{' '}
            <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Anmelden
            </Link>
          </p>
          
          {/* <-- 5. ADD LEGAL LINKS TO FOOTER --> */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <Link href="/impressum" className="hover:underline">Impressum</Link>
            {' · '}
            <Link href="/datenschutz" className="hover:underline">Datenschutz</Link>
          </div>
        </form>
      </div>
    </main>
  );
}
