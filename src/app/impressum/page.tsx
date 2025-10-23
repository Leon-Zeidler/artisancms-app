import Link from 'next/link'; // Standard import for Next.js Link

// You might want to extract Navbar and Footer into reusable components later
// For now, we repeat them here for simplicity.

const Navbar = () => (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900">ArtisanCMS</Link>
          </div>
          <div className="hidden space-x-8 md:flex">
            <Link href="/#leistungen" className="font-medium text-gray-600 hover:text-orange-600">Leistungen</Link>
            <Link href="/portfolio" className="font-medium text-gray-600 hover:text-orange-600">Projekte</Link>
            <Link href="/#kontakt" className="font-medium text-gray-600 hover:text-orange-600">Kontakt</Link>
          </div>
          <div className="hidden md:block">
            <Link href="/login" className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">Kunden-Login</Link>
          </div>
          <div className="md:hidden"> <button type="button" className="inline-flex items-center justify-center rounded-md p-2 text-gray-400"> <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg> </button> </div>
        </div>
      </div>
    </nav>
);

const Footer = () => (
    <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
            <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
                <div className="pb-6"> <Link href="/#leistungen" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Leistungen</Link> </div>
                <div className="pb-6"> <Link href="/portfolio" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Projekte</Link> </div>
                {/* Highlight current page in footer */}
                <div className="pb-6"> <Link href="/impressum" className="text-sm font-semibold leading-6 text-orange-600">Impressum</Link> </div>
                <div className="pb-6"> <Link href="/datenschutz" className="text-sm leading-6 text-gray-600 hover:text-gray-900">Datenschutz</Link> </div>
            </nav>
            <p className="mt-10 text-center text-xs leading-5 text-gray-500"> &copy; {new Date().getFullYear()} Ihr Firmenname. Alle Rechte vorbehalten. </p>
            <p className="mt-2 text-center text-xs leading-5 text-gray-500"> Powered by ArtisanCMS </p>
        </div>
    </footer>
);


export default function ImpressumPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      <Navbar />

      {/* Main Content Area for Legal Text */}
      <main className="flex-grow py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Impressum
          </h1>

          {/* This 'prose' class adds nice default styling for text content */}
          <div className="mt-10 prose prose-lg prose-slate max-w-none">
            {/*
              !!! IMPORTANT !!!
              REPLACE THE CONTENT BELOW WITH YOUR OFFICIAL IMPRESSUM TEXT
              obtained from a legal generator or lawyer.
              The structure below is just a placeholder example.
            */}

            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
              Max Mustermann <br />
              Musterstraße 1 <br />
              01454 Radeberg
            </p>

            <h2>Kontakt</h2>
            <p>
              Telefon: +49 (0) 123 456789 <br />
              E-Mail: info@beispiel-handwerk.de
            </p>

            <h2>Umsatzsteuer-ID</h2>
            <p>
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz: <br />
              DE123456789
            </p>

            {/* Add other required sections like Berufsbezeichnung, Kammer, Haftungsausschluss etc. */}

            <p>
                <strong>Haftungsausschluss (Disclaimer)</strong> <br/>
                [... Paste your full disclaimer text here ...]
            </p>

             <p>
                <strong>Urheberrecht</strong> <br/>
                [... Paste your copyright notice here ...]
            </p>

            {/* Ensure all required information according to German law is present */}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

