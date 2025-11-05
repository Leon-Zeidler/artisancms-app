// src/components/Navbar.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NavbarProps {
  businessName?: string | null;
  slug?: string | null;
  logoUrl?: string | null;
}

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Navbar({ businessName, slug, logoUrl }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoHasError, setLogoHasError] = useState(false);

  const basePath = slug ? `/${slug}` : '/';
  const homePath = basePath;
  const leistungenPath = `${basePath}#leistungen`;
  const projektePath = `${basePath}#projekte`;
  const testimonialsPath = `${basePath}#testimonials`;
  const kontaktPath = `${basePath}#kontakt`;

  const brandLabel = businessName?.trim() || 'ArtisanCMS';

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.removeProperty('overflow');
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0">
              <Link href={homePath} className="flex items-center text-xl font-bold text-gray-900">
                {logoUrl && !logoHasError ? (
                  <Image
                    src={logoUrl}
                    alt={brandLabel}
                    width={120}
                    height={32}
                    className="h-8 w-auto object-contain"
                    onError={() => setLogoHasError(true)}
                    unoptimized
                  />
                ) : (
                  <span className="rounded-lg bg-brand/10 px-2.5 py-1 text-base font-semibold text-brand">{brandLabel}</span>
                )}
              </Link>
            </div>

            <div className="hidden space-x-8 md:flex">
              <Link href={leistungenPath} className="font-medium text-gray-600 transition-colors hover:text-brand">
                Leistungen
              </Link>
              <Link href={projektePath} className="font-medium text-gray-600 transition-colors hover:text-brand">
                Projekte
              </Link>
              <Link href={testimonialsPath} className="font-medium text-gray-600 transition-colors hover:text-brand">
                Kundenstimmen
              </Link>
              <Link href={kontaktPath} className="font-medium text-gray-600 transition-colors hover:text-brand">
                Kontakt
              </Link>
            </div>

            <div className="hidden md:block">
              <Link
                href="/login"
                className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Kunden-Login
              </Link>
            </div>

            <div className="md:hidden">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-brand/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <CloseIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
            onClick={closeMobileMenu}
          />
          <aside
            id="mobile-menu"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-xs overflow-y-auto border-l border-slate-200 bg-white px-6 py-6 shadow-2xl sm:max-w-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between">
              <Link href={homePath} onClick={closeMobileMenu} className="text-lg font-semibold text-gray-900">
                {brandLabel}
              </Link>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="rounded-md p-2 text-gray-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand"
              >
                <span className="sr-only">Menü schließen</span>
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-2 text-base font-semibold text-gray-900">
              <Link href={leistungenPath} onClick={closeMobileMenu} className="rounded-lg px-4 py-3 hover:bg-brand/10">
                Leistungen
              </Link>
              <Link href={projektePath} onClick={closeMobileMenu} className="rounded-lg px-4 py-3 hover:bg-brand/10">
                Projekte
              </Link>
              <Link href={testimonialsPath} onClick={closeMobileMenu} className="rounded-lg px-4 py-3 hover:bg-brand/10">
                Kundenstimmen
              </Link>
              <Link href={kontaktPath} onClick={closeMobileMenu} className="rounded-lg px-4 py-3 hover:bg-brand/10">
                Kontakt
              </Link>
            </nav>
            <div className="mt-10">
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="flex w-full items-center justify-center rounded-xl bg-brand px-4 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Kunden-Login
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
