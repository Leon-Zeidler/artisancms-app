// src/app/[slug]/portfolio/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { useProfile } from "@/contexts/ProfileContext"; // <-- IMPORT CONTEXT
// --- 1. FIX THE IMPORT ---
import type { Project } from "@/lib/types"; // <-- Use Project, not ProjectCard

// --- TYPE DEFINITIONS (Updated) ---
// --- 2. REMOVE THE OLD LOCAL TYPE ---
/*
type Project = {
  id: string;
  title: string | null;
  'project-date': string | null;
  after_image_url: string | null; // <-- Corrected name
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
  ai_description: string | null;
  gallery_images: { url: string; path: string }[] | null;
};
*/

// --- PORTFOLIO CARD COMPONENT ---
interface PortfolioCardProps {
  project: Project; // This now uses the correct, full Project type
  slug: string | null;
}
function PortfolioCard({ project, slug }: PortfolioCardProps) {
  // Use after_image_url
  const imageUrl =
    project.after_image_url ||
    `https://placehold.co/600x400/A3A3A3/FFF?text=${encodeURIComponent(project.title || "Project")}`;
  const projectUrl = slug
    ? `/${slug}/portfolio/${project.id}`
    : `/portfolio/${project.id}`;

  return (
    <article className="group flex flex-col items-start justify-between">
      <Link href={projectUrl} className="block w-full">
        <div className="relative w-full">
          {/* KORREKTUR: ESLint-Kommentar hinzugefügt */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={project.title || "Project image"}
            className="aspect-[16/9] w-full rounded-2xl border border-gray-200 bg-gray-100 object-cover transition-opacity group-hover:opacity-90 sm:aspect-[2/1] lg:aspect-[3/2]"
            onError={(e) =>
              ((e.target as HTMLImageElement).src =
                "https://placehold.co/600x400/ef4444/ffffff?text=Image+Error")
            }
          />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
        </div>
        <div className="mt-4 max-w-xl">
          <div className="relative">
            <h3 className="group-hover:text-brand text-lg font-semibold leading-6 text-gray-900 transition-colors">
              {project.title || "Untitled Project"}
            </h3>
          </div>
        </div>
      </Link>
    </article>
  );
}

// --- MAIN PORTFOLIO PAGE COMPONENT ---
export default function ClientPortfolioPage() {
  // === State Variables ===
  const supabase = useMemo(() => createSupabaseClient(), []);
  const profile = useProfile(); // <-- GET PROFILE FROM CONTEXT
  const [projects, setProjects] = useState<Project[]>([]); // This now uses the correct Project type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Data Fetching ===
  useEffect(() => {
    if (!profile) return;

    const fetchPortfolioData = async () => {
      setLoading(true);
      setError(null);
      setProjects([]);

      try {
        // --- 3. FIX THE SELECT STATEMENT ---
        const { data, error: fetchError } = await supabase
          .from("projects")
          .select(`*`) // <-- Fetch all columns to match the Project type
          .eq("user_id", profile.id)
          .eq("status", "Published")
          .order("project-date", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false });

        if (fetchError) {
          setError(
            `Projekte konnten nicht geladen werden: ${fetchError.message}`,
          );
        } else {
          setProjects(data || []);
        }
        // KORREKTUR: 'any' zu 'unknown' geändert
      } catch (err: unknown) {
        console.error("Error fetching portfolio data:", err);
        if (!error) {
          // KORREKTUR: Typprüfung hinzugefügt
          setError(
            err instanceof Error
              ? err.message
              : "Ein Fehler ist aufgetreten.",
          );
        }
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
    // KORREKTUR: 'error' zur Dependency-Liste hinzugefügt
  }, [profile, supabase, error]);

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Profil wird geladen...
      </div>
    );
  }

  // === Render Logic ===
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Lade Portfolio...
      </div>
    );
  }

  // Layout (Navbar, Footer, CSS vars) is handled by layout.tsx
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Alle Projekte
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Stöbern Sie durch unsere abgeschlossenen Arbeiten und lassen Sie
            sich inspirieren.
          </p>
        </div>

        {error && <p className="mt-16 text-center text-red-600">{error}</p>}

        {!error && (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {projects.length > 0 ? (
              projects.map((project) => (
                <PortfolioCard
                  key={project.id}
                  project={project}
                  slug={profile.slug}
                />
              ))
            ) : (
              <p className="mt-4 text-center text-slate-500 lg:col-span-3">
                Momentan sind keine veröffentlichten Projekte vorhanden.
              </p>
            )}
          </div>
        )}
        <div className="mt-16 text-center">
          <Link
            href={`/${profile.slug}`}
            className="text-brand hover:text-brand-dark text-sm font-semibold leading-6 transition-colors"
          >
            <span aria-hidden="true">←</span> Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
