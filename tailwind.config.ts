import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // --- ADD THIS SECTION ---
      // Extend Tailwind's color palette to include 'brand' colors
      // These colors will read their values from the CSS variables
      // we inject in the [slug]/page.tsx file.
      colors: {
        brand: {
          DEFAULT: 'var(--color-brand-primary)', // Main brand color
          dark: 'var(--color-brand-primary-dark)', // Darker shade for hover
        },
        brandsec: {
           DEFAULT: 'var(--color-brand-secondary)', // Secondary brand color
        }
      },
      // --- END OF ADDED SECTION ---
    },
  },
  plugins: [],
};
export default config;

