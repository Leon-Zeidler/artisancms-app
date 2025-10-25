// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Standard Next.js import
import Link from 'next/link'; // Standard Next.js import
// Use relative path from src/app/login/page.tsx
import { supabase } from '../../lib/supabaseClient'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
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
      // Successful login will trigger session update,
      // DashboardLayout's useEffect will handle redirect based on onboarding status
      router.push('/dashboard'); // Redirect to dashboard area
      router.refresh(); // Force refresh to ensure layout re-evaluates auth state
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4"> {/* Changed background */}
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl border border-gray-200"> {/* Added border */}
        
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
          <div className="mb-6">
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
            {/* Add "Forgot Password?" link here later if needed */}
          </div>

           {/* Error Message Display */}
          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
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
    </main>
  );
}

