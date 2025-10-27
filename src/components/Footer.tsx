// src/components/Footer.tsx
import Link from 'next/link';

// Define props including slug
interface FooterProps {
  businessName?: string | null;
  slug?: string | null; // Add slug prop
}

export default function Footer({ businessName, slug }: FooterProps) { // Destructure slug

  // --- Helper to generate base path ---
  // If slug exists, use /slug, otherwise fallback to /
  const basePath = slug ? `/${slug}` : '/';
  const leistungenPath = `${basePath}/#leistungen`;
  const portfolioPath = `${basePath}/portfolio`;
  const testimonialsPath = `${basePath}/testimonials`;
  const kontaktPath = `${basePath}/#kontakt`;
  // Legal links remain global/absolute
  const impressumPath = "/impressum";
  const datenschutzPath = "/datenschutz";

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          {/* Update hrefs */}
          <div className="pb-6"> <Link href={leistungenPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900">Leistungen</Link> </div>
          <div className="pb-6"> <Link href={portfolioPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900">Projekte</Link> </div>
          <div className="pb-6"> <Link href={testimonialsPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900">Kundenstimmen</Link> </div>
          <div className="pb-6"> <Link href={kontaktPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900">Kontakt</Link> </div>
          {/* Keep legal links global */}
          <div className="pb-6"> <Link href={impressumPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900">Impressum</Link> </div>
          <div className="pb-6"> <Link href={datenschutzPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900">Datenschutz</Link> </div>
        </nav>
        <p className="mt-10 text-center text-xs leading-5 text-gray-500"> &copy; {new Date().getFullYear()} {businessName || 'Ihr Firmenname'}. Alle Rechte vorbehalten. </p>
        <p className="mt-2 text-center text-xs leading-5 text-gray-500"> Powered by ArtisanCMS </p>
      </div>
    </footer>
  );
}

