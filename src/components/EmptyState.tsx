"use client";

import Link from "next/link";
import React from "react";

// Icon for the button
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  message: string;
  buttonText?: string; // <-- FIX 1: Optional gemacht
  buttonHref?: string; // Use href for links
  onButtonClick?: () => void; // Use onClick for modal actions
}

export default function EmptyState({
  icon: Icon,
  title,
  message,
  buttonText, // <-- buttonText ist jetzt optional
  buttonHref,
  onButtonClick,
}: EmptyStateProps) {
  // The content of the button (icon + text)
  const ButtonContent = () => (
    <>
      <PlusIcon className="-ml-0.5 size-5" aria-hidden="true" />
      {buttonText}
    </>
  );

  const buttonClassName =
    "inline-flex items-center gap-x-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200";

  return (
    <div className="rounded-2xl border border-dashed border-orange-200 bg-white/90 px-6 py-16 text-center shadow-sm shadow-orange-100/60">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-orange-50">
        <Icon className="size-6 text-orange-500" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-600">{message}</p>

      {/* --- FIX 2: Button nur rendern, wenn buttonText übergeben wird --- */}
      {buttonText && (
        <div className="mt-6">
          {buttonHref ? (
            // If we pass a link, render a Link
            <Link href={buttonHref} className={buttonClassName}>
              <ButtonContent />
            </Link>
          ) : (
            // Otherwise, render a button with an onClick handler
            <button
              type="button"
              onClick={onButtonClick}
              className={buttonClassName}
            >
              <ButtonContent />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
