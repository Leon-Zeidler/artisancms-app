// src/app/dashboard/contact/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import EmptyState from "@/components/EmptyState";
import SubmissionModal from "@/components/SubmissionModal";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";

// --- Icons ---
const InboxIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    {" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.121-1.58H6.881a2.25 2.25 0 00-2.121 1.58L2.35 13.177a2.25 2.25 0 00-.1.661z"
    />{" "}
  </svg>
);
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
    />{" "}
  </svg>
);
// --- No longer used, but fine to keep ---
const EnvelopeOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.47 3.791a2.25 2.25 0 01-2.18 0l-6.47-3.791A2.25 2.25 0 012.25 9.906V9m19.5 0a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 9m19.5 0v.906a2.25 2.25 0 01-1.183 1.981l-6.47 3.791a2.25 2.25 0 01-2.18 0l-6.47-3.791A2.25 2.25 0 012.25 9.906V9m0 0a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 9V6.75a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 6.75v2.25z"
    />{" "}
  </svg>
);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M18 20a4 4 0 00-8 0m8 0v-.5a6.5 6.5 0 00-13 0v.5m8-9a3 3 0 100-6 3 3 0 000 6zm-5 0a3 3 0 100-6 3 3 0 000 6z"
    />
  </svg>
);

// --- TYPE DEFINITIONS ---
export type ContactSubmission = {
  id: string;
  created_at: string;
  profile_id: string; // This is the user's ID
  sender_name: string; // Renamed from 'name'
  sender_email: string; // Renamed from 'email'
  message: string;
};

export default function ContactInboxPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);

  // --- 1. Add new state for AI drafting ---
  const [isDrafting, setIsDrafting] = useState(false);
  const [aiDraft, setAiDraft] = useState<string | null>(null);

  const router = useRouter();

  // --- Initial Data Fetch ---
  useEffect(() => {
    const getUserAndData = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht eingeloggt.");
        router.push("/login");
        return;
      }
      setCurrentUser(user);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("slug")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user slug:", profileError.message);
        toast.error("Fehler beim Laden der Profildaten.");
      } else if (profile) {
        setUserSlug(profile.slug);
      }

      console.log(`Fetching submissions for profile ${user.id}`);
      const { data, error: fetchError } = await supabase
        .from("contact_submissions")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching submissions:", fetchError);
        setError(
          `Anfragen konnten nicht geladen werden: ${fetchError.message}`,
        );
        setSubmissions([]);
      } else {
        console.log("Fetched submissions:", data);
        // --- FIX: Map the DB columns to the component's expected type ---
        const mappedData = (data || []).map((item) => ({
          ...item,
          name: item.sender_name, // Map sender_name to name
          email: item.sender_email, // Map sender_email to email
        }));
        setSubmissions(mappedData);
      }
      setLoading(false);
    };
    getUserAndData();
  }, [router, supabase]);

  const handleOpenModal = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setAiDraft(null); // Clear old draft when opening
    setIsDrafting(false);
  };

  const handleCloseModal = () => {
    if (isDrafting) return; // Don't close while loading
    setSelectedSubmission(null);
    setAiDraft(null);
  };

  // --- 2. Add handler to call the new API route ---
  const handleDraftReply = async (message: string) => {
    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    setIsDrafting(true);
    setAiDraft(null); // Clear previous draft

    const draftPromise = async () => {
      const response = await fetch("/api/draft-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerMessage: message,
          profileId: currentUser.id, // Send the user's ID
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to generate draft");
      }
      return result.draft;
    };

    await toast.promise(draftPromise(), {
      loading: "AI entwirft eine Antwort...",
      success: (draft) => {
        setAiDraft(draft);
        setIsDrafting(false);
        return "Entwurf erstellt!";
      },
      error: (err: any) => {
        setIsDrafting(false);
        return `Fehler: ${err.message}`;
      },
    });
  };

  const homepageHref = userSlug ? `/${userSlug}` : "/";

  // --- Render Logic ---
  const totalSubmissions = submissions.length;
  const submissionsThisWeek = submissions.filter((submission) => {
    const created = new Date(submission.created_at);
    const now = new Date();
    const diffInDays =
      (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  }).length;
  const uniqueSenders = new Set(
    submissions.map((submission) => submission.sender_email),
  ).size;

  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      <DashboardHero
        eyebrow="Kontakt"
        title="Kontaktanfragen"
        subtitle="Bleiben Sie nah an Ihren Interessenten – sehen Sie auf einen Blick, wer sich gemeldet hat und antworten Sie schneller."
        actions={[
          {
            label: "Zur Live-Webseite",
            href: homepageHref,
            variant: "secondary",
            target: "_blank",
          },
        ]}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard
            title="Gesamtanfragen"
            value={totalSubmissions}
            description="Alle Nachrichten"
            icon={InboxIcon}
            trend={
              totalSubmissions > 0
                ? `${totalSubmissions} Kontakte bisher`
                : "Noch keine Einträge"
            }
          />
          <DashboardStatCard
            title="Diese Woche"
            value={submissionsThisWeek}
            description="Neue Nachrichten"
            icon={EnvelopeIcon}
            accent="indigo"
            trend={
              submissionsThisWeek > 0
                ? "Aktive Nachfrage"
                : "Noch ruhig – teilen Sie Ihre Seite!"
            }
          />
          <DashboardStatCard
            title="Einzigartige Absender"
            value={uniqueSenders}
            description="Unterschiedliche E-Mail-Adressen"
            icon={UsersIcon}
            accent="emerald"
            trend={
              uniqueSenders > 0
                ? "Neue Kontakte gesammelt"
                : "Keine Kontakte vorhanden"
            }
          />
        </div>
      </DashboardHero>

      {loading && (
        <div className="rounded-2xl border border-orange-100 bg-white p-10 text-center text-sm text-slate-600 shadow-lg shadow-orange-100/40">
          Lade Anfragen...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {submissions.length > 0 ? (
              submissions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleOpenModal(item)}
                  className="group flex w-full flex-col gap-3 rounded-2xl border border-orange-100 bg-white/90 p-5 text-left shadow-sm shadow-orange-100 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <EnvelopeIcon className="size-4 text-orange-500" />
                      {item.sender_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-600">
                    {item.message}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-orange-500">
                    {item.sender_email}
                  </span>
                </button>
              ))
            ) : (
              <EmptyState
                icon={InboxIcon}
                title="Keine Kontaktanfragen"
                message="Sobald ein Besucher Ihrer Webseite das Kontaktformular ausfüllt, erscheint die Nachricht hier."
                buttonText="Zur Webseite"
                buttonHref={homepageHref}
              />
            )}
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white/90 shadow-lg shadow-orange-100/40">
              <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-orange-100 px-5 py-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                  Antwort-Tipps
                </h2>
              </div>
              <div className="space-y-3 px-5 py-4 text-sm text-slate-600">
                <p>
                  Nutzen Sie den KI-Entwurf im Nachrichtendialog, um schnell
                  eine freundliche Antwort zu formulieren.
                </p>
                <p>
                  Verlinken Sie in Ihrer Antwort direkt auf relevante Projekte
                  oder Testimonials, um Vertrauen zu stärken.
                </p>
                <p>
                  Aktualisieren Sie Ihre Kontaktzeiten im Impressum, damit
                  Anfragende wissen, wann sie mit Ihnen rechnen können.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-white/90 p-5 text-sm text-slate-600 shadow-lg shadow-orange-100/40">
              <h3 className="text-base font-semibold text-slate-900">
                Mehr Leads gewünscht?
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Teilen Sie Ihre ArtisanCMS-Seite in sozialen Netzwerken oder
                binden Sie den Link in Ihrer E-Mail-Signatur ein, um mehr
                Kontakte zu gewinnen.
              </p>
              <button
                onClick={() => router.push("/dashboard/projekte/neu")}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400"
              >
                Jetzt neues Projekt hervorheben
              </button>
            </div>
          </div>
        </div>
      )}

      <SubmissionModal
        item={selectedSubmission}
        onClose={handleCloseModal}
        onDraftReply={handleDraftReply}
        isDrafting={isDrafting}
        aiDraft={aiDraft}
      />
    </main>
  );
}
