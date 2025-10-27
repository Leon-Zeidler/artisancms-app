// src/app/page.tsx
import Link from 'next/link';

// This component now handles the root path "/"
export default function RootPage() {
  // You can customize this page later to be a proper landing page for ArtisanCMS
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">ArtisanCMS</h1>
      <p className="text-gray-600 mb-8">Dies ist der Haupteinstiegspunkt. Kunden-Webseiten sind über ihren eindeutigen Pfad erreichbar (z.B. /ihr-firmen-slug).</p>
      {/* Link to login */}
      <Link href="/login" className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
        Kunden-Login
      </Link>
      {/* You could add more marketing info or links here */}
    </div>
  );
}

