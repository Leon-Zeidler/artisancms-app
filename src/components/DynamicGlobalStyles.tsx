"use client";

import React from 'react';

// --- Dynamic CSS Variables Component ---
export const DynamicGlobalStyles = ({ primaryColor, secondaryColor }: { primaryColor: string, secondaryColor: string }) => {
  return (
    <style jsx global>{`
      :root {
        --color-brand: ${primaryColor};
        --color-brand-dark: ${primaryColor}; 
        --color-brand-secondary: ${secondaryColor};
      }
    `}</style>
  );
};