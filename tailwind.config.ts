import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // --- HIER IST DIE KORREKTUR ---
      // 'colors' muss INNERHALB von 'extend' sein.
      colors: {
        brand: {
          DEFAULT: "var(--color-brand-primary)", // Main brand color
          dark: "var(--color-brand-primary-dark)", // Darker shade for hover
        },
        brandsec: {
          DEFAULT: "var(--color-brand-secondary)", // Secondary brand color
        },
      },
      // --- ENDE DER KORREKTUR ---
    },
  },
  plugins: [],
};
export default config;
