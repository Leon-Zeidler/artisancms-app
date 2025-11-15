// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createSupabaseClient } from "../../lib/supabaseClient";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import PlusIcon from "@/components/icons/PlusIcon";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import DashboardProgress from "@/components/dashboard/DashboardProgress";
// --- 1. IMPORT THE CORRECT TYPE ---
import type { Project } from "@/lib/types";

// --- TYPE DEFINITIONS ---
// --- 2. REMOVE THE OLD LOCAL TYPE ---
/*
type Project = {
  id: string;
  title: string | null;
  'project-date': string | null;
  after_image_url: string | null;
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
};
*/
type ProjectCardProps = { project: Project };

// --- ICON COMPONENTS ---
// (Icons remain the same)
const DocumentDuplicateIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
    />
  </svg>
);
const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />
  </svg>
);
const CheckBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
    />
  </svg>
);

function ProjectCard({ project }: ProjectCardProps) {
  const displayDate = project["project-date"]
    ? new Date(project["project-date"]).toLocaleDateString("de-DE", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Kein Datum";
  const imageUrl =
    project.after_image_url ||
    `https://placehold.co/600x400/ffedd5/f97316?text=${encodeURIComponent(project.title || "Projekt")}`;
  const detailUrl = `/dashboard/projekte/${project.id}/edit`;

  return (
    <Link
      href={detailUrl}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-transform hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={project.title || "Projektbild"}
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) =>
            ((e.target as HTMLImageElement).src =
              "https://placehold.co/600x400/fef3c7/ea580c?text=Bild+fehlt")
          }
        />
        <div
          className={`absolute left-4 top-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm shadow-orange-100 ${
            project.status === "Published"
              ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
              : "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
          }`}
        >
          <span className="size-2 rounded-full bg-current" aria-hidden="true" />
          {project.status === "Published" ? "Veröffentlicht" : "Entwurf"}
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-orange-600">
            {project.title || "Unbenanntes Projekt"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{displayDate}</p>
        </div>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
          Projekt öffnen
          <ArrowRightIcon className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function NewProjectCard() {
  return (
    <Link
      href="/dashboard/projekte/neu"
      className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 text-center text-orange-700 transition duration-300 hover:border-orange-300 hover:bg-orange-100 hover:text-orange-600"
    >
      <div className="mb-4 rounded-full bg-white p-4 shadow-sm shadow-orange-100">
        <PlusIcon className="size-8" />
      </div>
      <h3 className="text-lg font-semibold">Neues Projekt</h3>
      <p className="mt-1 text-sm text-orange-600">
        Starten Sie mit wenigen Klicks Ihr nächstes Highlight.
      </p>
    </Link>
  );
}

function EmptyProjectsState() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/70 bg-white/80 p-8 shadow-sm">
      <div className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
          Los geht&apos;s
        </span>
        <h2 className="text-xl font-semibold text-slate-900">
          Ihr Dashboard ist startklar
        </h2>
        <p className="text-sm text-slate-600">
          Sie haben noch keine Projekte veröffentlicht. Legen Sie direkt los und
          zeigen Sie, was Ihr Unternehmen auszeichnet.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-slate-600">
          <li className="flex items-start gap-3">
            <CheckBadgeIcon
              className="mt-0.5 size-5 text-orange-500"
              aria-hidden="true"
            />
            <span>
              KI-gestützte Texte und Layouts sparen Ihnen wertvolle Zeit.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckBadgeIcon
              className="mt-0.5 size-5 text-orange-500"
              aria-hidden="true"
            />
            <span>
              Veröffentlichen Sie Projekte mit nur einem Klick auf Ihrer
              Live-Seite.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckBadgeIcon
              className="mt-0.5 size-5 text-orange-500"
              aria-hidden="true"
            />
            <span>
              Nutzen Sie das Hilfe-Center für Tipps zur perfekten Präsentation.
            </span>
          </li>
        </ul>
      </div>
      <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard/projekte/neu"
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200"
        >
          Jetzt erstes Projekt erstellen
        </Link>
        <Link
          href="/dashboard/hilfe"
          className="inline-flex items-center justify-center rounded-full border border-orange-200 px-6 py-2.5 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:text-orange-500"
        >
          Schritt-für-Schritt-Anleitung ansehen
        </Link>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function DashboardPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [projects, setProjects] = useState<Project[]>([]); // This now uses ProjectCard
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Error fetching user:", userError);
        setError("Fehler beim Laden der Benutzerdaten.");
        setLoading(false);
        setProjects([]);
        return;
      }

      if (!user) {
        setError("Bitte einloggen.");
        setLoading(false);
        setProjects([]);
        return;
      }

      setCurrentUser(user);

      // --- 3. UPDATE THE SELECT STATEMENT ---
      const { data, error: fetchError } = await supabase
        .from("projects")
        .select(`*`) // <-- FIX: Fetch all columns
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching projects:", fetchError);
        setError(
          `Projekte konnten nicht geladen werden: ${fetchError.message}`,
        );
        setProjects([]);
      } else {
        setProjects(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]); // <-- supabase was the missing dependency

  const totalProjects = projects.length;
  const publishedProjects = projects.filter(
    (p) => p.status === "Published",
  ).length;
  const draftProjects = totalProjects - publishedProjects;
  const hasProjects = totalProjects > 0;

  const greeting = currentUser?.email
    ? currentUser.email.split("@")[0]
    : "Artisan";

  const summaryStats = [
    {
      title: "Alle Projekte",
      value: totalProjects,
      description: hasProjects
        ? `${totalProjects} Projekte aktiv`
        : "Noch keine Projekte",
      icon: DocumentDuplicateIcon,
    },
    {
      title: "Entwürfe",
      value: draftProjects,
      description:
        draftProjects > 0 ? "Feinschliff empfohlen" : "Alles live geschaltet",
      icon: PencilSquareIcon,
    },
    {
      title: "Veröffentlicht",
      value: publishedProjects,
      description:
        publishedProjects > 0
          ? "Sichtbar auf Ihrer Website"
          : "Noch nichts live",
      icon: CheckBadgeIcon,
    },
  ];

  return (
    <main className="space-y-8 bg-slate-50 px-4 py-8 sm:px-8">
      <DashboardHero
        eyebrow="Dashboard"
        title={`Willkommen zurück, ${greeting}!`}
        subtitle="Ein kompakter Überblick über Ihren aktuellen Fortschritt."
        actions={[
          {
            label: "Neues Projekt",
            href: "/dashboard/projekte/neu",
            icon: PlusIcon,
          },
          {
            label: "Hilfe-Center",
            href: "/dashboard/hilfe",
            variant: "secondary",
          },
        ]}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {currentUser && (
            <p className="text-xs text-slate-500">
              Angemeldet als {currentUser.email}
            </p>
          )}
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {hasProjects
                ? "Ihre Projekte laufen"
                : "Noch keine Projekte angelegt"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {publishedProjects} veröffentlicht
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {draftProjects} in Arbeit
            </span>
          </div>
        </div>
      </DashboardHero>
      <DashboardProgress />

      <section className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Status im Blick
              </h2>
              <p className="text-sm text-slate-500">
                Ihre wichtigsten Kennzahlen in einer ruhigen Übersicht.
              </p>
            </div>
            <Link
              href="/dashboard/projekte"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-orange-200 hover:text-orange-500"
            >
              Alle Projekte
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {summaryStats.map(({ title, value, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200/60 bg-white/90 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {title}
                  </p>
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Schnelle Aktionen
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Springen Sie direkt zu den häufigsten Aufgaben.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              <Link
                className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition hover:border-orange-200 hover:bg-orange-50"
                href="/dashboard/projekte/neu"
              >
                Neues Projekt starten
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition hover:border-orange-200 hover:bg-orange-50"
                href="/dashboard/einstellungen#branding"
              >
                Branding aktualisieren
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </li>
            <li>
              <Link
                className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition hover:border-orange-200 hover:bg-orange-50"
                href="/dashboard/hilfe"
              >
                Hilfe-Center ansehen
                <ArrowRightIcon className="size-4" aria-hidden="true" />
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {loading && (
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-10 text-center text-sm text-slate-600 shadow-sm">
          Lade Projekte...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/80 p-6 text-center text-sm text-rose-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="space-y-6">
          {hasProjects ? (
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Aktuelle Projekte
                  </h2>
                  <p className="text-sm text-slate-600">
                    Eine Kurzübersicht Ihrer letzten Aktivitäten.
                  </p>
                </div>
                <Link
                  href="/dashboard/projekte"
                  className="inline-flex items-center gap-2 rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:text-orange-500"
                >
                  Alle Projekte anzeigen
                  <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                <NewProjectCard />
                {projects.slice(0, 5).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>

              {projects.length > 5 && (
                <p className="mt-6 text-center text-xs text-slate-500">
                  {projects.length - 5} weitere Projekte warten auf Ihre
                  Aufmerksamkeit.
                </p>
              )}
            </div>
          ) : (
            <EmptyProjectsState />
          )}
        </section>
      )}
    </main>
  );
}
