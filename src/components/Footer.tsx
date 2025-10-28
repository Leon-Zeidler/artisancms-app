// src/components/Footer.tsx
"use client";

import Link from 'next/link';

// Define props including slug and primaryColor
interface FooterProps {
  businessName?: string | null;
  slug?: string | null;
  primaryColor?: string; // <-- Add primaryColor prop
}

// Default color if none is provided
const DEFAULT_PRIMARY = '#ea580c'; // orange-600

export default function Footer({
    businessName,
    slug,
    primaryColor = DEFAULT_PRIMARY // Destructure with default
}: FooterProps) {

  // --- Helper to generate base path ---
  const basePath = slug ? `/${slug}` : '/';

  // Generate slug-specific paths
  const leistungenPath = `${basePath}/#leistungen`;
  const portfolioPath = `${basePath}/portfolio`;
  const testimonialsPath = `${basePath}/testimonials`;
  const kontaktPath = `${basePath}/#kontakt`;
  const impressumPath = slug ? `${basePath}/impressum` : "/impressum"; // Keep existing logic
  const datenschutzPath = slug ? `${basePath}/datenschutz` : "/datenschutz"; // Keep existing logic

  // --- Style Helper for Hover Effects ---
  const handleMouseOver = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.color = primaryColor;
  };
  const handleMouseOut = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.color = ''; // Revert to CSS default (text-gray-600)
  };


  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          {/* Update links to include hover handlers */}
          <div className="pb-6">
            <Link href={leistungenPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900 transition-colors" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Leistungen</Link>
          </div>
          <div className="pb-6">
            <Link href={portfolioPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900 transition-colors" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Projekte</Link>
          </div>
          <div className="pb-6">
            <Link href={testimonialsPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900 transition-colors" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Kundenstimmen</Link>
          </div>
          <div className="pb-6">
            <Link href={kontaktPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900 transition-colors" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Kontakt</Link>
          </div>
          <div className="pb-6">
            <Link href={impressumPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900 transition-colors" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Impressum</Link>
          </div>
          <div className="pb-6">
            <Link href={datenschutzPath} className="text-sm leading-6 text-gray-600 hover:text-gray-900 transition-colors" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Datenschutz</Link>
          </div>
        </nav>
        <p className="mt-10 text-center text-xs leading-5 text-gray-500"> &copy; {new Date().getFullYear()} {businessName || 'Ihr Firmenname'}. Alle Rechte vorbehalten. </p>
        <p className="mt-2 text-center text-xs leading-5 text-gray-500"> Powered by ArtisanCMS </p>
      </div>
    </footer>
  );
}
