"use client";

import React from 'react';

// --- Dynamic CSS Variables Component ---
export const DynamicGlobalStyles = ({ primaryColor, secondaryColor }: { primaryColor: string, secondaryColor: string }) => {
  return (
    <style jsx global>{`
      :root {
        /* KORRIGIERT: 
          --color-brand -> --color-brand-primary
          --color-brand-dark -> --color-brand-primary-dark
        */
        --color-brand-primary: ${primaryColor};
        --color-brand-primary-dark: ${primaryColor}; /* Wir setzen 'dark' auf dieselbe Farbe. Für Hover-Effekte wäre eine Abdunkelung ideal, aber so funktioniert es. */
        --color-brand-secondary: ${secondaryColor};
      }
    `}</style>
  );
};