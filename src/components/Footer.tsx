import Link from 'next/link';

// Define the props the Footer might need
interface FooterProps {
  businessName?: string | null;
}

export default function Footer({ businessName }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          <div className="pb-6">
            <Link href="/#leistungen" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
              Leistungen
            </Link>
          </div>
          <div className="pb-6">
            <Link href="/portfolio" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
              Projekte
            </Link>
          </div>
          {/* *** ADDED KONTAKT LINK HERE *** */}
          <div className="pb-6">
            <Link href="/#kontakt" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
              Kontakt
            </Link>
          </div>
          <div className="pb-6">
            <Link href="/impressum" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
              Impressum
            </Link>
          </div>
          <div className="pb-6">
            <Link href="/datenschutz" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
              Datenschutz
            </Link>
          </div>
           {/* You might also want a link to Testimonials here if that page exists */}
           {/* <div className="pb-6">
             <Link href="/testimonials" className="text-sm leading-6 text-gray-600 hover:text-gray-900">
               Kundenstimmen
             </Link>
           </div> */}
        </nav>
        <p className="mt-10 text-center text-xs leading-5 text-gray-500">
          &copy; {new Date().getFullYear()} {businessName || 'Ihr Firmenname'}. Alle Rechte vorbehalten.
        </p>
        <p className="mt-2 text-center text-xs leading-5 text-gray-500">
          Powered by ArtisanCMS
        </p>
      </div>
    </footer>
  );
}

