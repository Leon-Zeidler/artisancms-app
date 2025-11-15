// src/app/dashboard/testimonials/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import EmptyState from "@/components/EmptyState";

// --- TYPE DEFINITIONS (KORRIGIERT) ---
type ProjectTitle = {
  title: string | null;
} | null;

type Testimonial = {
  id: string;
  created_at: string;
  author_name: string | null;
  // rating: number | null; // ENTFERNT, da Spalte fehlt
  body: string | null; // Umbenannt von 'content'
  is_published: boolean | null; // Umbenannt von 'status'
  projects: ProjectTitle[] | null; // Diese Verknüpfung funktioniert jetzt
};

// --- ICONS ---
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
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    />{" "}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />{" "}
  </svg>
);
const EyeSlashIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
    />{" "}
  </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />{" "}
  </svg>
);
const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 01-1.06 0l-3.72-3.72C9.847 17.001 9 16.036 9 14.9v-4.286c0-.97.616-1.813 1.5-2.097m6.75 0a.75.75 0 00-1.5 0v.091c-1.13.418-2.317.822-3.5 1.209V8.511a.75.75 0 00-1.5 0v1.819c-1.183.387-2.37.79-3.5 1.209V8.511a.75.75 0 00-1.5 0v2.606c.091.024.18.05.27.081.09.032.18.066.27.101.09.034.18.07.27.106.09.035.18.072.27.11.09.037.18.075.27.114.09.038.18.077.27.117.09.039.18.08.27.122.09.04.18.082.27.124.09.042.18.085.27.128.09.043.18.087.27.132.09.044.18.09.27.135.09.045.18.092.27.138.09.046.18.094.27.142a.75.75 0 00.704 0c.09-.048.18-.096.27-.142.09-.046.18-.093.27-.138.09-.045.18-.09.27-.135.09-.045.18-.088.27-.132.09-.043.18-.086.27-.128.09-.042.18-.082.27-.124.09-.04.18-.082.27-.122.09-.04.18-.078.27-.117.09-.04.18-.077.27-.114.09-.038.18-.07.27-.11.09-.036.18-.07.27-.106.09-.035.18-.07.27-.101.09-.03.18-.057.27-.081V8.511zM3 15.004v-4.286c0-1.136.847-2.1 1.98-2.193l3.72-3.72a.75.75 0 011.06 0l3.72 3.72C14.153 8.801 15 9.766 15 10.9v4.286c0 .97-.616 1.813-1.5 2.097m-6.75 0a.75.75 0 001.5 0v-.091c1.13-.418 2.317-.822 3.5-1.209V15.004a.75.75 0 001.5 0v-1.819c1.183-.387 2.37-.79 3.5-1.209V15.004a.75.75 0 001.5 0v-2.606a1.012 1.012 0 00-.27-.69c-.09-.034-.18-.066-.27-.101-.09-.035-.18-.07-.27-.106-.09-.035-.18-.072-.27-.11-.09-.037-.18-.075-.27-.114-.09-.038-.18-.077-.27-.117-.09-.04-.18-.08-.27-.122-.09-.04-.18-.082-.27-.124-.09-.042-.18-.085-.27-.128-.09-.043-.18-.087-.27-.132-.09-.044-.18-.09-.27-.135-.09-.045-.18-.092-.27-.138-.09-.046-.18-.094-.27-.142a.75.75 0 00-.704 0c-.09.048-.18.096-.27.142-.09.046-.18.093-.27.138-.09.045-.18.09-.27.135-.09.045-.18.088-.27-.132-.09.043-.18.086-.27-.128-.09.042-.18.082-.27-.124-.09.04-.18.082-.27-.122-.09.04-.18.078-.27-.117-.09.04-.18.077-.27-.114-.09.038-.18.07-.27-.11-.09.036-.18.07-.27-.106-.09.035-.18.07-.27-.101-.09.03-.18.057-.27-.081V15.004z"
    />{" "}
  </svg>
);

// --- TESTIMONIAL CARD COMPONENT (KORRIGIERT) ---
interface TestimonialCardProps {
  testimonial: Testimonial;
  onStatusToggle: (testimonial: Testimonial) => void;
  onDeleteRequest: (testimonial: Testimonial) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

function TestimonialCard({
  testimonial,
  onStatusToggle,
  onDeleteRequest,
  isToggling,
  isDeleting,
}: TestimonialCardProps) {
  // Felder umbenannt: rating entfernt, content -> body, status -> is_published
  const { id, author_name, body, is_published, created_at, projects } =
    testimonial;
  const projectName = projects?.[0]?.title || "Unbekanntes Projekt";
  const receivedDate = new Date(created_at).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const isDisabled = isToggling || isDeleting;

  return (
    <div className="divide-y divide-orange-100 rounded-2xl border border-orange-100 bg-white/90 shadow-lg shadow-orange-100/40">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {author_name || "Anonym"}
            </h3>
            <p className="text-sm text-slate-500">
              Für Projekt:{" "}
              <span className="font-medium text-slate-700">{projectName}</span>
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              is_published // Logik angepasst
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {is_published ? "Veröffentlicht" : "Eingegangen"}
          </span>
        </div>

        {/* RatingDisplay entfernt */}

        <p className="mt-4 text-sm italic text-slate-600">
          &quot;{body || "Kein Inhalt"}&quot;
        </p>
        <p className="mt-3 text-xs text-slate-500">
          Eingegangen am: {receivedDate}
        </p>
      </div>
      <div className="flex justify-end gap-3 rounded-b-2xl bg-orange-50/60 p-4">
        <button
          onClick={() => onStatusToggle(testimonial)}
          disabled={isDisabled}
          title={is_published ? "Verbergen" : "Veröffentlichen"}
          className={`inline-flex items-center gap-x-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
            isDisabled
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : is_published // Logik angepasst
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
          }`}
        >
          {isToggling ? (
            <ArrowPathIcon className="size-4" />
          ) : is_published ? (
            <EyeSlashIcon className="size-5" />
          ) : (
            <EyeIcon className="size-5" />
          )}
          <span>
            {isToggling
              ? "Wird geändert..."
              : is_published
                ? "Verbergen"
                : "Veröffentlichen"}
          </span>
        </button>
        <button
          onClick={() => onDeleteRequest(testimonial)}
          disabled={isDisabled}
          title="Löschen"
          className={`inline-flex items-center gap-x-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
            isDisabled
              ? "cursor-not-allowed bg-slate-100 text-slate-400"
              : "bg-red-100 text-red-600 hover:bg-red-200"
          }`}
        >
          {isDeleting ? (
            <ArrowPathIcon className="size-4" />
          ) : (
            <TrashIcon className="size-5" />
          )}
          <span>{isDeleting ? "Wird gelöscht..." : "Löschen"}</span>
        </button>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT (KORRIGIERT) ---
export default function TestimonialsPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] =
    useState<Testimonial | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const router = useRouter();

  // --- Initial Data Fetch (KORRIGIERT) ---
  useEffect(() => {
    const getUserAndFetchData = async () => {
      setLoading(true);
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        setError("Fehler beim Laden der Benutzerdaten.");
        setLoading(false);
        return;
      }
      if (!user) {
        router.push("/login");
        return;
      }
      setCurrentUser(user);

      // Fetch testimonials WITH project title
      try {
        // --- SELECT-Statement KORRIGIERT ---
        const { data, error: fetchError } = await supabase
          .from("testimonials")
          .select(
            `
            id,
            created_at,
            author_name,
            body, 
            is_published,
            projects ( title )
          `,
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (fetchError) throw fetchError;

        setTestimonials(data as Testimonial[]);
      } catch (err: any) {
        console.error("Error fetching testimonials:", err);
        setError(`Kundenstimmen konnten nicht geladen werden: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    getUserAndFetchData();
  }, [router, supabase]);

  // --- Handle Status Toggle (KORRIGIERT) ---
  const handleStatusToggle = async (testimonial: Testimonial) => {
    if (!currentUser) {
      toast.error("Fehler: Benutzer nicht gefunden.");
      return;
    }

    setTogglingId(testimonial.id);
    // Logik von Status-String auf Boolean angepasst
    const newStatus = !testimonial.is_published;

    const togglePromise = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .update({ is_published: newStatus }) // Spaltenname korrigiert
        .eq("id", testimonial.id)
        .eq("user_id", currentUser.id) // Security check
        .select()
        .single();

      if (error) throw error;
      return data as Testimonial;
    };

    await toast.promise(togglePromise(), {
      loading: "Status wird geändert...",
      success: (updatedTestimonial) => {
        setTestimonials((current) =>
          current.map((t) =>
            t.id === updatedTestimonial.id
              ? { ...t, is_published: updatedTestimonial.is_published } // Spaltenname korrigiert
              : t,
          ),
        );
        return `Kundenstimme ${newStatus ? "veröffentlicht" : "verborgen"}.`;
      },
      error: (err: any) => `Fehler: ${err.message}`,
    });

    setTogglingId(null);
  };

  // --- Handle Delete (Unverändert) ---
  const handleDeleteRequest = (testimonial: Testimonial) => {
    setDeletingTestimonial(testimonial);
    setIsConfirmingDelete(false);
  };

  const handleCancelDelete = () => {
    setDeletingTestimonial(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTestimonial || !currentUser) return;

    setIsConfirmingDelete(true);

    const deletePromise = async () => {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", deletingTestimonial.id)
        .eq("user_id", currentUser.id); // Security check

      if (error) throw error;
      return deletingTestimonial.id;
    };

    await toast.promise(deletePromise(), {
      loading: "Kundenstimme wird gelöscht...",
      success: (deletedId) => {
        setTestimonials((current) => current.filter((t) => t.id !== deletedId));
        setDeletingTestimonial(null);
        setIsConfirmingDelete(false);
        return "Erfolgreich gelöscht!";
      },
      error: (err: any) => {
        setIsConfirmingDelete(false);
        return `Fehler: ${err.message}`;
      },
    });
  };

  // --- Render Logic (Unverändert) ---
  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Kundenstimmen</h1>
          <p className="mt-1 text-slate-600">
            Verwalten Sie hier alle erhaltenen Kundenbewertungen.
          </p>
        </div>
      </div>

      {loading && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Lade Kundenstimmen...
        </p>
      )}

      {error && !loading && (
        <p className="mt-6 text-center text-sm text-red-600">{error}</p>
      )}

      {!loading && !error && testimonials.length === 0 && (
        <EmptyState
          icon={ChatBubbleLeftRightIcon}
          title="Noch keine Kundenstimmen"
          message="Sie haben noch keine Kundenstimmen erhalten. Fordern Sie welche an, indem Sie bei einem veröffentlichten Projekt auf das Sprechblasen-Icon klicken."
        />
      )}

      {!loading && !error && testimonials.length > 0 && (
        <div className="space-y-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
              onStatusToggle={handleStatusToggle}
              onDeleteRequest={handleDeleteRequest}
              isToggling={togglingId === testimonial.id}
              isDeleting={
                deletingTestimonial?.id === testimonial.id && isConfirmingDelete
              }
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingTestimonial}
        title="Kundenstimme löschen"
        message={`Möchten Sie die Kundenstimme von "${deletingTestimonial?.author_name || "Anonym"}" wirklich unwiderruflich löschen?`}
        confirmText="Ja, löschen"
        cancelText="Abbrechen"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isConfirming={isConfirmingDelete}
      />
    </main>
  );
}
