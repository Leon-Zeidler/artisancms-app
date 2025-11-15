// src/components/RequestTestimonialModal.tsx
"use client";

import React, { useState } from "react";

// --- Icons ---
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M6 18L18 6M6 6l12 12"
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
const PaperAirplaneIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.875L5.999 12zm0 0h7.5"
    />{" "}
  </svg>
);

interface RequestTestimonialModalProps {
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSend: (clientEmail: string) => void;
  isSending: boolean;
}

export default function RequestTestimonialModal({
  projectTitle,
  isOpen,
  onClose,
  onSend,
  isSending,
}: RequestTestimonialModalProps) {
  const [clientEmail, setClientEmail] = useState("");
  const [localError, setLocalError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Basic email validation
    if (!clientEmail.includes("@") || !clientEmail.includes(".")) {
      setLocalError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }

    onSend(clientEmail);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl shadow-orange-200/50">
        <button
          onClick={onClose}
          disabled={isSending}
          className="absolute right-5 top-5 rounded-full bg-orange-50 p-1.5 text-orange-500 transition hover:bg-orange-100 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XMarkIcon className="size-6" />
        </button>
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          Kundenstimme anfragen
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          Senden Sie eine E-Mail-Anfrage für das Projekt:{" "}
          <strong className="text-orange-600">{projectTitle}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="clientEmail"
              className="mb-1 block text-sm font-semibold text-slate-800"
            >
              E-Mail des Kunden *
            </label>
            <input
              type="email"
              name="clientEmail"
              id="clientEmail"
              required
              value={clientEmail}
              onChange={(e) => {
                setClientEmail(e.target.value);
                setLocalError("");
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="kunde@beispiel.de"
            />
          </div>

          {localError && <p className="text-sm text-red-500">{localError}</p>}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSending}
              className={`inline-flex items-center gap-x-2 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition ${
                isSending
                  ? "cursor-not-allowed bg-orange-300"
                  : "bg-orange-500 hover:bg-orange-400"
              }`}
            >
              {isSending && <ArrowPathIcon className="size-4" />}
              <PaperAirplaneIcon className="-ml-0.5 size-4" />
              {isSending ? "Wird gesendet..." : "Anfrage senden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
