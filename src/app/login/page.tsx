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
      // More specific error handling could be added here (e.g., check for invalid credentials vs. email not confirmed)
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password.');
      } else if (signInError.message.includes('Email not confirmed')) {
         setError('Please confirm your email address first. Check your inbox (and spam folder) for the confirmation link.');
         // Optionally add a button here to resend confirmation email
      }
       else {
        setError(`Login failed: ${signInError.message}`);
      }
    } else {
      console.log('Login successful:', data);
      // Successful login will trigger session update,
      // DashboardLayout's useEffect will handle redirect based on onboarding status
      router.push('/dashboard'); // Redirect to dashboard area
      router.refresh(); // Force refresh to ensure layout re-evaluates auth state
    }
  };

  // --- Handle Password Reset ---
  const handlePasswordReset = async () => {
    if (!email) {
      // Use toast for immediate feedback instead of setting error state which might conflict with login errors
      toast.error("Please enter your email address first to reset the password.");
      // setError("Please enter your email address first to reset the password.");
      return;
    }
    setResetLoading(true);
    setError(null); // Clear login errors
    setMessage(null); // Clear previous messages

    const resetPromise = supabase.auth.resetPasswordForEmail(email, {
      // Ensure this matches the page you created to handle the reset token
      redirectTo: `${window.location.origin}/reset-password`,
    });

    await toast.promise(
      resetPromise,
      {
        loading: 'Sending password reset instructions...',
        success: () => {
          // Set a message on the page as well for persistence if toast disappears
          setMessage("Password reset instructions sent! Please check your email (including spam folder).");
          return 'Reset email sent!'; // Message for the toast itself
        },
        error: (err) => {
          console.error('Password reset error:', err.message);
           // Set error state on the page
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
              aria-describedby="email-description" // Good for accessibility, especially with reset
            />
             <p id="email-description" className="sr-only">Enter the email associated with your account. Use this field also for password reset.</p>
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

          {/* --- Forgot Password Button --- */}
          <div className="mb-4 text-right"> {/* Keep margin-bottom here to space before messages/button */}
             <button
                type="button" // Important: Prevents form submission
                onClick={handlePasswordReset}
                disabled={resetLoading || loading} // Disable if login or reset is in progress
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
            disabled={loading || resetLoading} // Disable if login or reset is in progress
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
      {/* Reminder: Ensure <Toaster /> is included in your main layout (e.g., src/app/layout.tsx or src/app/dashboard/layout.tsx) */}
    </main>
  );
}
