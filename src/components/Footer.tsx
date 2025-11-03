// src/components/Footer.tsx
"use client";

import Link from 'next/link';

// Define props including slug and primaryColor
interface FooterProps {
  businessName?: string | null;
  slug?: string | null;
  // primaryColor?: string; // <-- No longer needed
  // secondaryColor?: string | null; // <-- No longer needed
}

// Helper function to check brightness (moved to page.tsx, but good to keep here if footer is used elsewhere)
const isColorDark = (hex: string): boolean => {
    if (!hex) return false; 
    try {
        let color = hex.startsWith('#') ? hex.slice(1) : hex;
        if (color.length === 3) {
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
    } catch {
        return false;
    }
};

export default function Footer({
    businessName,
    slug,
}: FooterProps) {

  const basePath = slug ? `/${slug}` : '/';
  const leistungenPath = `${basePath}/#leistungen`;
  const portfolioPath = `${basePath}/portfolio`;
  const testimonialsPath = `${basePath}/testimonials`;
  const kontaktPath = `${basePath}/#kontakt`;
  const impressumPath = slug ? `${basePath}/impressum` : "/impressum"; 
  const datenschutzPath = slug ? `${basePath}/datenschutz` : "/datenschutz"; 

  // ---
  // --- THIS IS THE FIX ---
  // ---
  // We can't *read* the CSS variable back into JS easily.
  // So, for the text color, we just provide two classes and let Tailwind's
  // CSS variable for --color-brand-secondary decide the background.
  // We assume secondaryColor is light by default (text-gray-600).
  // If you *know* it will be dark, you'd change these.
  //
  // A better fix is to define text colors in the variable injection too:
  //
  // In [slug]/page.tsx:
  // '--color-text-brand-secondary': isServicesDark ? '#e5e7eb' : '#4b5563', // gray-200 or gray-600
  //
  // In tailwind.config.ts:
  // 'brandsec-text': 'var(--color-text-brand-secondary)'
  //
  // Then here, you'd just use `className="text-brandsec-text"`
  //
  // For now, we'll keep the simple light-mode assumption:
  const linkColorClass = "text-gray-600 hover:text-brand";
  const mutedColorClass = "text-gray-500";
  //
  // --- END OF FIX DISCUSSION ---
  //

  return (
    // Use bg-brandsec to read the CSS variable
    <footer className="border-t border-gray-200 mt-auto bg-brandsec">
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          {/* Apply dynamic text colors */}
          <div className="pb-6">
            <Link href={leistungenPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`}>Leistungen</Link>
          </div>
          <div className="pb-6">
            <Link href={portfolioPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`}>Projekte</Link>
          </div>
          <div className="pb-6">
            <Link href={testimonialsPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`}>Kundenstimmen</Link>
          </div>
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
