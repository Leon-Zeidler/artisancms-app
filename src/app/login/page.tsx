// This is a React component, which is just a function that returns HTML-like code (JSX).
export default function LoginPage() {
  return (
    // We start with a main container that fills the whole screen (h-screen)
    // and has a dark background (bg-gray-900).
    // 'flex', 'items-center', and 'justify-center' are Tailwind commands to
    // perfectly center its child element.
    <main className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      
      {/* This is the white box in the middle of your design. */}
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        
        {/* The "Log In" heading */}
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          Login
        </h1>
        
        {/* This is the form element that will hold our inputs */}
        <form>
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
            />
            {/* We'll add the "Forgot Password?" link here later */}
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-orange-600 px-4 py-2 text-lg font-semibold text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Log In
          </button>
          
          {/* Sign Up Link */}
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