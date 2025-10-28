// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import toast from 'react-hot-toast'; // Import react-hot-toast
// Removed Provider import as OAuth is removed

// --- Icons ---
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

// Removed GoogleIcon and GithubIcon
// --- End Icons ---


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <-- Feature 1: Show/Hide State
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showResendButton, setShowResendButton] = useState(false); // <-- Feature 2: Resend State
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false); // <-- Feature 2: Resend Loading
  // Removed oauthLoading state
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setShowResendButton(false); // Reset resend button visibility
    console.log("Attempting login...");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false);

    if (signInError) {
      console.error('Login error:', signInError.message);
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password.');
      } else if (signInError.message.includes('Email not confirmed')) {
         setError('Please confirm your email address first. Check your inbox (and spam folder) for the confirmation link.');
         setShowResendButton(true); // <-- Feature 2: Show resend button on this specific error
      } else {
        setError(`Login failed: ${signInError.message}`);
      }
    } else {
      console.log('Login successful:', data);
      router.push('/dashboard');
      router.refresh();
    }
  };

  // --- Handle Password Reset ---
  const handlePasswordReset = async () => {
    if (!email) {
      toast.error("Please enter your email address first to reset the password.");
      return;
    }
    setResetLoading(true);
    setError(null); // Clear login errors
    setMessage(null);
    setShowResendButton(false); // Hide resend button

    const resetPromise = supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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
          return `Error: ${err.message}`;
        },
      }
    );

    setResetLoading(false);
  };

  // --- Feature 2: Resend Confirmation Email ---
  const handleResendConfirmation = async () => {
     if (!email) {
       toast.error("Please enter the email address again to resend confirmation.");
       return;
     }
     setResendLoading(true);
     setError(null); // Clear previous errors
     setMessage(null);

     const resendPromise = supabase.auth.resend({
       type: 'signup',
       email: email,
     });

     await toast.promise(
       resendPromise,
       {
         loading: 'Resending confirmation email...',
         success: (data) => {
           if (data.error) {
             throw data.error; // Throw error to be caught by the error handler
           }
           setMessage("Confirmation email resent! Please check your inbox (and spam folder).");
           setShowResendButton(false); // Hide button after success
           return 'Confirmation email resent!';
         },
         error: (err) => {
           console.error('Resend confirmation error:', err.message);
           // Keep the error message and the button visible
           setError(`Error resending email: ${err.message}`);
           return `Error: ${err.message}`;
         },
       }
     );

     setResendLoading(false);
   };

   // Removed handleOAuthLogin function


  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl border border-gray-200">

        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Login
        </h1>

        <form onSubmit={handleLogin} className="space-y-4"> {/* Added space-y-4 for consistent spacing */}
          {/* Email Address Section */}
          <div> {/* Wrapped in div for spacing */}
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
              aria-describedby="email-description"
            />
             <p id="email-description" className="sr-only">Enter the email associated with your account. Use this field also for password reset and resending confirmation.</p>
          </div>

          {/* Password Section */}
          <div> {/* Wrapped in div for spacing */}
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700"> {/* Further reduced margin */}
              Password
            </label>
            {/* Feature 1: Added relative positioning container */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} // <-- Feature 1: Toggle type
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500" // Added pr-10 for icon space
                placeholder="••••••••"
                required
              />
              {/* Feature 1: Show/Hide Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
             {/* Forgot Password Button - Moved under the input div */}
             <div className="mt-1 text-right"> {/* Added margin-top */}
               <button
                  type="button"
                  onClick={handlePasswordReset}
                  disabled={resetLoading || loading || resendLoading } // Removed oauthLoading
                  className="text-sm font-medium text-orange-600 hover:text-orange-500 disabled:text-gray-400 disabled:cursor-not-allowed"
               >
                  {resetLoading ? 'Sending...' : 'Forgot Password?'}
               </button>
            </div>
          </div>


           {/* Error Message Display & Resend Button */}
          {error && (
             <div className={`rounded-md p-3 ${showResendButton ? 'bg-yellow-50 border border-yellow-300' : 'bg-red-50 border border-red-300'}`}>
                <div className="flex items-start">
                  <div className={`text-sm ${showResendButton ? 'text-yellow-700' : 'text-red-700'}`}>
                    <p>{error}</p>
                    {/* Feature 2: Conditionally render Resend Button */}
                    {showResendButton && (
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={resendLoading || loading || resetLoading } // Removed oauthLoading
                        className="mt-2 text-sm font-medium text-orange-600 hover:text-orange-500 disabled:text-gray-400 disabled:cursor-not-allowed underline"
                      >
                        {resendLoading ? 'Resending...' : 'Resend Confirmation Email'}
                      </button>
                    )}
                  </div>
                </div>
             </div>
          )}
          {/* Success/Info Message Display */}
          {message && (
             <p className="mb-4 text-center text-sm text-green-600">{message}</p>
           )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || resetLoading || resendLoading } // Removed oauthLoading
            className={`w-full rounded-md px-4 py-2 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors ${
              loading || resetLoading || resendLoading // Removed oauthLoading
                ? 'bg-orange-300 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>

           {/* Removed Social Login Buttons and Divider */}

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-orange-600 hover:text-orange-500">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
      {/* Reminder: Ensure <Toaster /> is included somewhere */}
    </main>
  );
}

