// src/components/Footer.tsx
"use client";

import Link from 'next/link';

// --- 1. UPDATE THE PROPS INTERFACE ---
interface FooterProps {
  businessName?: string | null;
  slug?: string | null;
  showServicesSection?: boolean | null; // <-- ADD THIS
  showTeamPage?: boolean | null; // <-- ADD THIS
  showTestimonialsPage?: boolean | null; // <-- ADD THIS
}

// ... (helper functions if any) ...

// --- 2. UPDATE THE COMPONENT TO ACCEPT NEW PROPS ---
export default function Footer({
    businessName,
    slug,
    showServicesSection,
    showTeamPage,
    showTestimonialsPage
}: FooterProps) {

  const basePath = slug ? `/${slug}` : '/';
  const leistungenPath = `${basePath}#leistungen`;
  const portfolioPath = `${basePath}/portfolio`;
  const teamPath = `${basePath}/team`;
  const testimonialsPath = `${basePath}/testimonials`;
  const kontaktPath = `${basePath}/#kontakt`;
  const impressumPath = slug ? `${basePath}/impressum` : "/impressum"; 
  const datenschutzPath = slug ? `${basePath}/datenschutz` : "/datenschutz"; 

  const linkColorClass = "text-gray-600 hover:text-brand";
  const mutedColorClass = "text-gray-500";

  return (
    // Use bg-brandsec to read the CSS variable
    <footer className="border-t border-gray-200 mt-auto bg-brandsec">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          
          {/* --- 3. MAKE LINKS CONDITIONAL --- */}
          {showServicesSection && (
            <div className="pb-6">
              <Link href={leistungenPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`}>Leistungen</Link>
            </div>
          )}
          <div className="pb-6">
            <Link href={portfolioPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`}>Projekte</Link>
          </div>
          {showTeamPage && (
            <div className="pb-6">
              <Link href={teamPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`}>Über Uns</Link>
            </div>
          )}
          {showTestimonialsPage && (
            <div className="pb-6">
              <Link href={testimonialsPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`}>Kundenstimmen</Link>
            </div>
          )}
          <div className="pb-6">
            <Link href={kontaktPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`}>Kontakt</Link>
          </div>
          <div className="pb-6">
            <Link href={impressumPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`}>Impressum</Link>
          </div>
          <div className="pb-6">
            <Link href={datenschutzPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`}>Datenschutz</Link>
          </div>
        </nav>
        <p className={`mt-10 text-center text-xs leading-5 ${mutedColorClass}`}> &copy; {new Date().getFullYear()} {businessName || 'Ihr Firmenname'}. Alle Rechte vorbehalten. </p>
        <p className={`mt-2 text-center text-xs leading-5 ${mutedColorClass}`}> Powered by ArtisanCMS </p>
      </div>
    </footer>
  );
}