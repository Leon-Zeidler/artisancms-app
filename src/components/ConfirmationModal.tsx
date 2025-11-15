// src/components/ConfirmationModal.tsx
"use client";

import React from "react";

// --- Icons ---
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />{" "}
  </svg>
);
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="size-4 animate-spin"
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />{" "}
  </svg>
);
// ---

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming: boolean;
  confirmButtonClass?: string;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Bestätigen",
  cancelText = "Abbrechen",
  onConfirm,
  onCancel,
  isConfirming,
  confirmButtonClass = "bg-red-500 text-white hover:bg-red-400", // Default to danger
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="w-full max-w-sm rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-orange-200/40">
        <div className="flex items-start">
          <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500 sm:mx-0 sm:size-10">
            <ExclamationTriangleIcon className="size-6" aria-hidden="true" />
          </div>
          <div className="ml-4 text-left">
            <h3
              className="text-base font-semibold leading-6 text-slate-900"
              id="modal-title"
            >
              {title}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-slate-600">{message}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse sm:gap-x-3">
          <button
            type="button"
            disabled={isConfirming}
            onClick={onConfirm}
            className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm transition-colors sm:w-auto ${
              isConfirming
                ? "cursor-not-allowed bg-rose-200 text-rose-500"
                : confirmButtonClass
            }`}
          >
            {isConfirming ? (
              <>
                <ArrowPathIcon className="-ml-1 mr-2 size-5 animate-spin" />{" "}
                Wird ausgeführt...
              </>
            ) : (
              confirmText
            )}
          </button>
          <button
            type="button"
            disabled={isConfirming}
            onClick={onCancel}
            className="mt-3 inline-flex w-full justify-center rounded-md border border-orange-100 bg-white px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0 sm:w-auto"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
