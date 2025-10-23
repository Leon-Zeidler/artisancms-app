// We mark this as a "client component" because it uses interactive
// features like state and event handlers (form submission).
"use client"; 

// Import necessary tools from React and Next.js
import { useState } from 'react'; // To manage form inputs and messages
import { useRouter } from 'next/navigation'; // To redirect the user after signup
import Link from 'next/link'; // To create links to other pages (like login)

// Import our Supabase client helper
import { supabase } from '../../lib/supabaseClient'; 

// This is the main function defining our React component for the signup page.
export default function SignupPage() {
  // === State Variables ===
  // We use 'useState' to create pieces of "memory" for our component.
  // Each piece holds data that can change (like what the user types).
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
      setError("Passwords do not match.");
      return; // Stop the function here if passwords don't match
    }
    
    setLoading(true); // Show a loading indicator on the button
    setError(null); // Clear any previous errors
    setMessage(null); // Clear previous messages

    // === Supabase Signup ===
    // This is where we talk to Supabase. We call the 'signUp' function,
    // passing the email and password from our state variables.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      // You can add options here later, like redirect URLs
    });

    setLoading(false); // Hide the loading indicator

    // === Handle Supabase Response ===
    if (signUpError) {
      console.error('Signup error:', signUpError.message);
      // Show a user-friendly error message
      setError(`Signup failed: ${signUpError.message}`); 
    } else {
      console.log('Signup successful:', data);
      // Check if user object exists and email confirmation might be needed
      // Supabase returns user data but identities might be empty if confirmation is needed
      if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
         // This typically means email confirmation is required by Supabase settings
         setMessage("Signup successful! Please check your email to confirm your account.");
         // Optionally, redirect to a confirmation pending page or login page after a delay
         // setTimeout(() => router.push('/login'), 3000); // Redirect after 3s
      } else if (data.user) {
         // User might be immediately authenticated if email confirmation is disabled
         setMessage("Signup successful! Redirecting...");
         router.push('/dashboard'); // Redirect directly to the dashboard
      } else {
          // Fallback message if user data is unexpectedly null after signup attempt
          setMessage("Signup attempt processed. Please proceed to login.");
           // Optionally redirect after a delay
           // setTimeout(() => router.push('/login'), 3000); // Redirect after 3s
      }
    }
  };

  // === JSX Structure (The HTML-like part) ===
  // This defines what the page looks like. It's very similar to the login page structure.
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl border border-gray-200">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Create Account
        </h1>

        {/* The 'onSubmit' prop connects the form to our 'handleSignup' function */}
        <form onSubmit={handleSignup}>
          {/* Email Input */}
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
              value={email} // Connects input value to the 'email' state variable
              // Updates the 'email' state variable whenever the user types
              onChange={(e) => setEmail(e.target.value)} 
              required // HTML validation: field cannot be empty
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="••••••••"
              value={password} // Connects input value to the 'password' state
              onChange={(e) => setPassword(e.target.value)} // Updates 'password' state
              required
              minLength={6} // Basic password strength requirement (Supabase default)
            />
          </div>
          
           {/* Confirm Password Input */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-orange-500"
              placeholder="••••••••"
              value={confirmPassword} // Connects input value to the 'confirmPassword' state
              onChange={(e) => setConfirmPassword(e.target.value)} // Updates 'confirmPassword' state
              required
            />
          </div>

          {/* Error Message Display */}
          {/* This part only shows up if the 'error' state variable has text in it */}
          {error && (
            <p className="mb-4 text-center text-sm text-red-600">{error}</p>
          )}
          
           {/* Success Message Display */}
           {/* This part only shows up if the 'message' state variable has text in it */}
          {message && (
            <p className="mb-4 text-center text-sm text-green-600">{message}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading} // Button is disabled while 'loading' is true
            className={`w-full rounded-md px-4 py-2 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors ${
              loading 
                ? 'bg-orange-300 cursor-not-allowed' // Style for loading state
                : 'bg-orange-600 hover:bg-orange-700' // Style for normal state
            }`}
          >
            {/* Change button text based on loading state */}
            {loading ? 'Creating Account...' : 'Sign Up'} 
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            {/* Use the Next.js Link component for fast navigation to the login page */}
            <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

