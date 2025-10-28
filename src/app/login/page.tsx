// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast'; // Import react-hot-toast

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null); // To show success/info messages
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false); // Loading state for password reset
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null); // Clear previous messages
    console.log("Attempting login...");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (signInError) {
      console.error('Login error:', signInError.message);
      setError(`Login failed: ${signInError.message}`);
    } else {
      console.log('Login successful:', data);
      router.push('/dashboard');
      router.refresh();
    }
  };

  // --- NEW: Handle Password Reset ---
  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email address first to reset the password.");
      return;
    }
    setResetLoading(true);
    setError(null);
    setMessage(null);

    const resetPromise = supabase.auth.resetPasswordForEmail(email, {
      // Optional: Redirect URL after the user clicks the link in the email
      // redirectTo: `${window.location.origin}/reset-password`, // Example redirect URL
    });

    await toast.promise(
      resetPromise,
      {
        loading: 'Sending password reset instructions...',
        success: () => {
          setMessage("Password reset instructions sent! Please check your email (including spam folder).");
          return 'Reset email sent!';
        },
        error: (err) => {
          console.error('Password reset error:', err.message);
          setError(`Error sending reset email: ${err.message}`);
          return `Error: ${err.message}`; // Message for the toast itself
        },
      }
    );

    setResetLoading(false);
  };


  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl border border-gray-200">

        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Login
        </h1>

        <form onSubmit={handleLogin}>
          {/* Email Address Section */}
          <div className="mb-4">
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password Section */}
          <div className="mb-1"> {/* Reduced bottom margin */}
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="••••••••"
              required
            />
          </div>

          {/* --- NEW: Forgot Password Button --- */}
          <div className="mb-4 text-right">
             <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetLoading || loading}
                className="text-sm font-medium text-orange-600 hover:text-orange-500 disabled:text-gray-400 disabled:cursor-not-allowed"
             >
                {resetLoading ? 'Sending...' : 'Forgot Password?'}
             </button>
          </div>


           {/* Error Message Display */}
          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}
          {/* Success/Info Message Display */}
          {message && (
             <p className="mb-4 text-center text-sm text-green-600">{message}</p>
           )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || resetLoading}
            className={`w-full rounded-md px-4 py-2 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors ${
              loading || resetLoading
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-orange-600 hover:text-orange-500">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
      {/* Ensure Toaster is rendered somewhere in your layout (e.g., RootLayout) */}
      {/* <Toaster position="bottom-center" /> */}
    </main>
  );
}