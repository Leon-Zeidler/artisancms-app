// src/components/Footer.tsx
"use client";

import Link from 'next/link';

// Define props including slug and primaryColor
interface FooterProps {
  businessName?: string | null;
  slug?: string | null;
  primaryColor?: string;
  secondaryColor?: string | null; // <-- 1. Add secondaryColor prop
}

// Default colors if none are provided
const DEFAULT_PRIMARY = '#ea580c'; // orange-600
const DEFAULT_SECONDARY = '#ffffff'; // <-- 2. Set default to white (or your preference)

export default function Footer({
    businessName,
    slug,
    primaryColor = DEFAULT_PRIMARY,
    secondaryColor = DEFAULT_SECONDARY // <-- 3. Destructure with default
}: FooterProps) {

  const basePath = slug ? `/${slug}` : '/';
  const leistungenPath = `${basePath}/#leistungen`;
  const portfolioPath = `${basePath}/portfolio`;
  const testimonialsPath = `${basePath}/testimonials`;
  const kontaktPath = `${basePath}/#kontakt`;
  const impressumPath = slug ? `${basePath}/impressum` : "/impressum"; 
  const datenschutzPath = slug ? `${basePath}/datenschutz` : "/datenschutz"; 

  // --- Style Helper for Hover Effects ---
  const handleMouseOver = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.color = primaryColor;
  };
  
  // Determine text color based on background
  // This is a simple brightness check
  const isSecondaryDark = () => {
    try {
      let color = secondaryColor?.startsWith('#') ? secondaryColor.slice(1) : secondaryColor ?? 'ffffff';
      if (color.length === 3) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
      }
      const r = parseInt(color.substring(0, 2), 16);
      const g = parseInt(color.substring(2, 4), 16);
      const b = parseInt(color.substring(4, 6), 16);
      // Using the luminance formula
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5; // True if dark, false if light
    } catch {
      return false; // Default to light background
    }
  };

  const isDark = isSecondaryDark();
  const linkColorClass = isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900";
  const mutedColorClass = isDark ? "text-gray-400" : "text-gray-500";
  
  const handleMouseOut = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.color = ''; // Revert to CSS default (which will be linkColorClass)
  };

  return (
    // <-- 4. Apply background color and remove bg-white -->
    <footer className="border-t border-gray-200 mt-auto" style={{ backgroundColor: secondaryColor ?? DEFAULT_SECONDARY }}>
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
        <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          {/* <-- 5. Apply dynamic text colors --> */}
          <div className="pb-6">
            <Link href={leistungenPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Leistungen</Link>
          </div>
          <div className="pb-6">
            <Link href={portfolioPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Projekte</Link>
          </div>
          <div className="pb-6">
            <Link href={testimonialsPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Kundenstimmen</Link>
          </div>
          <div className="pb-6">
            <Link href={kontaktPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Kontakt</Link>
          </div>
          <div className="pb-6">
            <Link href={impressumPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Impressum</Link>
          </div>
          <div className="pb-6">
            <Link href={datenschutzPath} className={`text-sm leading-6 ${linkColorClass} transition-colors`} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>Datenschutz</Link>
          </div>
        </nav>
        <p className={`mt-10 text-center text-xs leading-5 ${mutedColorClass}`}> &copy; {new Date().getFullYear()} {businessName || 'Ihr Firmenname'}. Alle Rechte vorbehalten. </p>
        <p className={`mt-2 text-center text-xs leading-5 ${mutedColorClass}`}> Powered by ArtisanCMS </p>
      </div>
    </footer>
  );
}