// src/components/EmptyState.tsx
"use client";

import Link from 'next/link';
import React from 'react';

// Icon for the button
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => ( 
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"> 
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> 
  </svg> 
);

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  buttonText: string;
  buttonHref?: string; // Use href for links
  onButtonClick?: () => void; // Use onClick for modal actions
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  message, 
  buttonText, 
  buttonHref, 
  onButtonClick 
}: EmptyStateProps) {
  
  // The content of the button (icon + text)
  const ButtonContent = () => (
    <>
      <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
      {buttonText}
    </>
  );
  
  const buttonClassName = "inline-flex items-center gap-x-2 rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

  return (
    <div className="text-center py-16 px-6 bg-slate-800 border-2 border-dashed border-slate-700 rounded-lg">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-700/50">
        <Icon className="h-6 w-6 text-slate-400" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">{message}</p>
      <div className="mt-6">
        {buttonHref ? (
          // If we pass a link, render a Link
          <Link href={buttonHref} className={buttonClassName}>
            <ButtonContent />
          </Link>
        ) : (
          // Otherwise, render a button with an onClick handler
          <button type="button" onClick={onButtonClick} className={buttonClassName}>
            <ButtonContent />
          </button>
        )}
      </div>
    </div>
  );
}
