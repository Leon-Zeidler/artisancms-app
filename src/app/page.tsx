// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 text-center shadow-xl">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Willkommen bei ArtisanCMS
        </h1>

        <p className="mb-8 text-gray-600">
          Verwalten Sie Ihre Handwerker-Webseite.
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full rounded-md bg-orange-600 px-4 py-3 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Zum Kunden-Login
          </Link>

          <Link
            href="/signup"
            className="block w-full rounded-md bg-gray-200 px-4 py-3 text-lg font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Neues Konto erstellen
          </Link>
        </div>

        {/* <-- ADD LEGAL LINKS TO FOOTER --> */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <Link href="/impressum" className="hover:underline">
            Impressum
          </Link>
          {" · "}
          <Link href="/datenschutz" className="hover:underline">
            Datenschutz
          </Link>
        </div>
      </div>
    </main>
  );
}
