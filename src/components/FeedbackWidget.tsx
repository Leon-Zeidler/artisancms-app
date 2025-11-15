"use client";

import React, { useState, useEffect, useMemo } from "react"; // Import React
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

// --- Icons ---
// (Hier ist das korrigierte Sprechblasen-Icon)
const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.86 8.25-8.625 8.25a9.06 9.06 0 01-5.17-1.71.75.75 0 01-.317-1.042l.713-1.426a.75.75 0 00-.317-1.042A8.99 8.99 0 013 12c0-4.556 3.86-8.25 8.625-8.25S21 7.444 21 12z"
    />
  </svg>
);
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);
// --- End Icons ---

type FeedbackCategory =
  | "Fehlerbericht"
  | "Funktionswunsch"
  | "Allgemeiner Kommentar";

export default function FeedbackWidget() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>("Fehlerbericht");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Benutzer nicht gefunden. Bitte laden Sie die Seite neu.");
      return;
    }
    if (!message.trim()) {
      toast.error("Bitte geben Sie eine Nachricht ein.");
      return;
    }

    setIsLoading(true);

    const userAgent =
      typeof window !== "undefined" ? window.navigator.userAgent : "Unknown";
    const screenSize =
      typeof window !== "undefined"
        ? `${window.innerWidth}x${window.innerHeight}`
        : "Unknown";
    const technicalInfo = `\n\n--- Auto-Generated Tech Info ---\nBrowser: ${userAgent}\nScreen: ${screenSize}\nPath: ${pathname}`;
    const fullMessage = message + technicalInfo;

    const { error } = await supabase.from("feedback").insert({
      user_id: currentUser.id,
      category,
      message: fullMessage,
      page_url: pathname,
    });

    if (error) {
      console.error("Error submitting feedback:", error);
      toast.error(`Fehler: ${error.message}`);
    } else {
      toast.success("Vielen Dank für Ihr Feedback!");
      setMessage("");
      setCategory("Fehlerbericht");
      setIsOpen(false);
    }

    setIsLoading(false);
  };

  return (
    <>
      {/* --- The Modal --- */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-modal="true"
        >
          <div
            className="fixed bottom-24 right-8 z-[60] w-full max-w-sm rounded-3xl border border-orange-100 bg-white shadow-2xl shadow-orange-200/50"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Beta-Feedback abgeben
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-orange-50 p-1.5 text-orange-500 transition hover:bg-orange-100 hover:text-orange-600"
                aria-label="Feedback-Modal schließen"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
              <div>
                <label
                  htmlFor="feedback-category"
                  className="mb-1 block text-sm font-semibold text-slate-800"
                >
                  Kategorie
                </label>
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as FeedbackCategory)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                  <option>Fehlerbericht</option>
                  <option>Funktionswunsch</option>
                  <option>Allgemeiner Kommentar</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="feedback-message"
                  className="mb-1 block text-sm font-semibold text-slate-800"
                >
                  Ihre Nachricht
                </label>
                <textarea
                  id="feedback-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  placeholder="Teilen Sie uns Ihre Meinung mit..."
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Aktuelle Seite:{" "}
                  <code className="rounded bg-orange-50 px-2 py-0.5 text-orange-600">
                    {pathname}
                  </code>
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !currentUser}
                  className="inline-flex items-center gap-x-2 rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  {isLoading && <ArrowPathIcon className="size-4" />}
                  {isLoading ? "Wird gesendet..." : "Feedback senden"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- The Button --- */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 size-14 rounded-full bg-orange-500 p-3 text-white shadow-lg shadow-orange-200 transition-transform hover:scale-110 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-white"
        aria-label="Feedback-Modal öffnen"
      >
        <ChatBubbleLeftRightIcon className="size-full" />
      </button>
    </>
  );
}
