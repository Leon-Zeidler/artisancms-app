"use client"; // Required for useState and form handling

import { useState } from 'react';
// Import the Supabase client we created using a relative path
import { supabase } from '../../lib/supabaseClient'; 
import { useRouter } from 'next/navigation'; // Import useRouter

export default function LoginPage() {
  // State variables to hold the user's input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // State for error messages
  const [loading, setLoading] = useState(false); // State for loading indicator
  const router = useRouter(); // Initialize the router

  // Function to handle form submission
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission (page reload)
    setLoading(true); // Show loading state
    setError(null); // Clear previous errors

    // Call Supabase's built-in signInWithPassword function
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setLoading(false); // Hide loading state

    if (error) {
      console.error('Login error:', error.message);
      setError('Login failed. Please check your email and password.'); // Set user-friendly error
    } else {
      console.log('Login successful:', data);
      // Redirect to the dashboard on successful login
      router.push('/dashboard'); 
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      {/* Changed background to light gray for contrast */}
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl border border-gray-200">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Login
        </h1>

        {/* Bind the form submission to our handleLogin function */}
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="you@example.com"
              value={email} // Bind input value to state
              onChange={(e) => setEmail(e.target.value)} // Update state on change
              required // Make field required
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="••••••••"
              value={password} // Bind input value to state
              onChange={(e) => setPassword(e.target.value)} // Update state on change
              required // Make field required
            />
          </div>

          {/* Error Message Display */}
          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading} // Disable button while loading
            className={`w-full rounded-md px-4 py-2 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
              loading 
                ? 'bg-orange-300 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {loading ? 'Logging in...' : 'Log In'} {/* Show loading text */}
          </button>

          {/* Sign Up Link (We'll implement this later) */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-orange-600 hover:text-orange-500">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </main>
  );
}

