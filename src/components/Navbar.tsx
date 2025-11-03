// src/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { useState } from 'react';

// Define the props including slug and logoUrl
interface NavbarProps {
  businessName?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
  // primaryColor?: string; // <-- No longer needed
  // primaryColorDark?: string; // <-- No longer needed
}

// Icons
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /> </svg> );
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg> );


export default function Navbar({
    businessName,
    slug,
    logoUrl,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoHasError, setLogoHasError] = useState(false); // State to track logo loading error

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const basePath = slug ? `/${slug}` : '/';
  const homePath = basePath;
  const leistungenPath = `${basePath}/#leistungen`;
  const portfolioPath = `${basePath}/portfolio`;
  const kontaktPath = `${basePath}/#kontakt`;
  const testimonialsPath = `${basePath}/testimonials`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand Name */}
          <div className="flex-shrink-0">
            <Link href={homePath} className="text-xl font-bold text-gray-900 flex items-center">
              {/* Show logo if it exists AND hasn't failed to load */}
              {logoUrl && !logoHasError ? (
                <img
                  src={logoUrl}
                  alt={businessName || 'Logo'}
                  className="h-8 w-auto" // Adjust height
                  // ADDED console log on error and state update
                  onError={(e) => {
                    console.error("Error loading logo image:", logoUrl, e);
                    setLogoHasError(true); // Hide broken image and show name
                  }}
                />
              ) : (
                // Fallback to business name
                businessName || 'ArtisanCMS'
              )}
            </Link>
          </div>

          {/* Desktop Menu Links - Use hover:text-brand */}
          <div className="hidden space-x-8 md:flex">
            <Link href={leistungenPath} className="font-medium text-gray-600 transition-colors hover:text-brand">Leistungen</Link>
            <Link href={portfolioPath} className="font-medium text-gray-600 transition-colors hover:text-brand">Projekte</Link>
            <Link href={testimonialsPath} className="font-medium text-gray-600 transition-colors hover:text-brand">Kundenstimmen</Link>
            <Link href={kontaktPath} className="font-medium text-gray-600 transition-colors hover:text-brand">Kontakt</Link>
          </div>

          {/* Desktop Login Button - Use bg-brand and hover:bg-brand-dark */}
          <div className="hidden md:block">
            <Link
                href="/login"
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Kunden-Login
            </Link>
          </div>

          {/* Mobile Menu Button - Use focus:ring-brand */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? ( <CloseIcon className="block h-6 w-6" /> ) : ( <MenuIcon className="block h-6 w-6" /> )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel - Use hover:text-brand */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-t border-b border-gray-200 shadow-md" id="mobile-menu">
          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            <Link href={leistungenPath} onClick={toggleMobileMenu} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-brand">Leistungen</Link>
            <Link href={portfolioPath} onClick={toggleMobileMenu} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-brand">Projekte</Link>
            <Link href={testimonialsPath} onClick={toggleMobileMenu} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-brand">Kundenstimmen</Link>
            <Link href={kontaktPath} onClick={toggleMobileMenu} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-brand">Kontakt</Link>
          </div>
          <div className="border-t border-gray-200 pt-4 pb-3 px-4">
             <Link
                href="/login"
                onClick={toggleMobileMenu}
                className="block w-full text-center rounded-md bg-brand px-4 py-2 text-base font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
             >
              Kunden-Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
