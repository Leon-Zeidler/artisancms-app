// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl border border-gray-200 text-center">
        
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Willkommen bei ArtisanCMS
        </h1>
        
        <p className="mb-8 text-gray-600">
          Verwalten Sie Ihre Handwerker-Webseite.
        </p>

        <div className="space-y-4">
          <Link 
            href="/login" 
            className="block w-full rounded-md bg-orange-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Zum Kunden-Login
          </Link>
          
          <Link 
            href="/signup" 
            className="block w-full rounded-md bg-gray-200 px-4 py-3 text-lg font-semibold text-gray-800 shadow-sm hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Neues Konto erstellen
          </Link>
        </div>

      </div>
    </main>
  );
}