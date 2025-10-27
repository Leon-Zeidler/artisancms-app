// src/components/Navbar.tsx
"use client";

import Link from 'next/link';
import { useState } from 'react';

// Define the props including slug
interface NavbarProps {
  businessName?: string | null;
  slug?: string | null; // Add slug prop
}

// Icons
const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => ( /* ... icon svg ... */ <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /> </svg> );
const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => ( /* ... icon svg ... */ <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg> );


export default function Navbar({ businessName, slug }: NavbarProps) { // Destructure slug
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // --- Helper to generate base path ---
  // If slug exists, use /slug, otherwise fallback to / (e.g., for root landing page if used there)
  const basePath = slug ? `/${slug}` : '/';
  const homePath = basePath; // Logo links to client's homepage
  const leistungenPath = `${basePath}/#leistungen`; // Anchor on client homepage
  const portfolioPath = `${basePath}/portfolio`; // Portfolio page for this client
  const kontaktPath = `${basePath}/#kontakt`; // Anchor on client homepage
  const testimonialsPath = `${basePath}/testimonials`; // Testimonials page for this client

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand Name - Link to client's home */}
          <div className="flex-shrink-0">
            <Link href={homePath} className="text-xl font-bold text-gray-900">
              {businessName || 'ArtisanCMS'}
            </Link>
          </div>

          {/* Desktop Menu Links - Updated hrefs */}
          <div className="hidden space-x-8 md:flex">
            <Link href={leistungenPath} className="font-medium text-gray-600 hover:text-orange-600">Leistungen</Link>
            <Link href={portfolioPath} className="font-medium text-gray-600 hover:text-orange-600">Projekte</Link>
            <Link href={testimonialsPath} className="font-medium text-gray-600 hover:text-orange-600">Kundenstimmen</Link>
            <Link href={kontaktPath} className="font-medium text-gray-600 hover:text-orange-600">Kontakt</Link>
          </div>

          {/* Desktop Login Button - Remains global */}
          <div className="hidden md:block">
            <Link href="/login" className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
              Kunden-Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? ( <CloseIcon className="block h-6 w-6" /> ) : ( <MenuIcon className="block h-6 w-6" /> )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel - Updated hrefs */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-t border-b border-gray-200 shadow-md" id="mobile-menu">
          <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
            <Link href={leistungenPath} onClick={toggleMobileMenu} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-600">Leistungen</Link>
            <Link href={portfolioPath} onClick={toggleMobileMenu} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-600">Projekte</Link>
            <Link href={testimonialsPath} onClick={toggleMobileMenu} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-600">Kundenstimmen</Link>
            <Link href={kontaktPath} onClick={toggleMobileMenu} className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-600">Kontakt</Link>
          </div>
          {/* Mobile Login Button - Remains global */}
          <div className="border-t border-gray-200 pt-4 pb-3 px-4">
            <Link href="/login" onClick={toggleMobileMenu} className="block w-full text-center rounded-md bg-orange-600 px-4 py-2 text-base font-semibold text-white hover:bg-orange-700">
              Kunden-Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

