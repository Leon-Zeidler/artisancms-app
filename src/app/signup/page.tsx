// We mark this as a "client component" because it uses interactive
// features like state and event handlers (form submission).
"use client"; 

// Import necessary tools from React and Next.js
import { useState } from 'react'; // To manage form inputs and messages
import { useRouter } from 'next/navigation'; // Standard Next.js import
import Link from 'next/link'; // Standard Next.js import

// Corrected import path using relative path from src/app/signup/page.tsx
import { supabase } from '../../lib/supabaseClient'; 

// This is the main function defining our React component for the signup page.
export default function SignupPage() {
  // === State Variables ===
  const [email, setEmail] = useState(''); // Holds the email input value
  const [password, setPassword] = useState(''); // Holds the password input value
  const [confirmPassword, setConfirmPassword] = useState(''); // Holds the confirm password value
  const [error, setError] = useState<string | null>(null); // Holds any error message to show the user
  const [message, setMessage] = useState<string | null>(null); // Holds success messages
  const [loading, setLoading] = useState(false); // Tracks if the form is currently submitting

  // Initialize the router hook to allow programmatic navigation
  const router = useRouter(); 

  // === Handle Signup Function ===
  // This function runs when the user submits the form.
  // It's 'async' because it needs to wait for Supabase to respond.
  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Stop the browser's default form submission (which reloads the page)
    
    // Basic validation: Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein."); // German: Passwords do not match.
      return; // Stop the function here if passwords don't match
    }
    
    setLoading(true); // Show a loading indicator on the button
    setError(null); // Clear any previous errors
    setMessage(null); // Clear previous messages

    // === Supabase Signup ===
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    setLoading(false); // Hide the loading indicator

    // === Handle Supabase Response ===
    if (signUpError) {
      console.error('Signup error:', signUpError.message);
      setError(`Registrierung fehlgeschlagen: ${signUpError.message}`); // German: Signup failed
    } else {
      console.log('Signup successful:', data);
      
      // *** MODIFIED REDIRECT LOGIC ***
      // Check if Supabase requires email confirmation
      if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
           setMessage("Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mails, um Ihr Konto zu bestätigen."); // German: Signup successful! Please check email...
           // Stay on page to show message
      } else if (data.user) {
           setMessage("Registrierung erfolgreich! Weiter zur Einrichtung..."); // German: Signup successful! Proceeding to setup...
           router.push('/onboarding'); // *** ALWAYS TRY TO GO TO ONBOARDING ***
      } else {
           // Fallback
           setMessage("Registrierung verarbeitet. Bitte versuchen Sie sich einzuloggen."); // German: Signup processed. Please try logging in.
      }
    }
  };

  // === JSX Structure (The HTML-like part) ===
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl border border-gray-200">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Konto erstellen {/* German: Create Account */}
        </h1>

        <form onSubmit={handleSignup}>
          {/* Email Input */}
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              E-Mail Adresse {/* German: Email Address */}
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
              Passwort {/* German: Password */}
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
              Passwort bestätigen {/* German: Confirm Password */}
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

          {/* Error Message Display */}
          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}
          
           {/* Success Message Display */}
          {message && (
            <p className="mb-4 text-center text-sm text-green-600">{message}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading} 
            className={`w-full rounded-md px-4 py-2 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors ${
              loading 
                ? 'bg-orange-300 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700' 
            }`}
          >
            {loading ? 'Konto wird erstellt...' : 'Registrieren'} {/* German: Creating Account... / Sign Up */}
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Bereits ein Konto?{' '} {/* German: Already have an account? */}
            <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Anmelden {/* German: Log In */}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

