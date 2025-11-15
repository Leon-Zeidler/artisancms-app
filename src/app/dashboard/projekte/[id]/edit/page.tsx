"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import toast from "react-hot-toast";
import ProjectForm from "@/components/ProjectForm";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import type { Project } from "@/lib/types";

export default function EditProjectPage() {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [project, setProject] = useState<Project | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userSlug, setUserSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    const getUserAndProject = async () => {
      setLoading(true);
      setGeneralError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Nicht eingeloggt.");
        router.push("/login");
        return;
      }
      setCurrentUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("slug")
        .eq("id", user.id)
        .single();
      setUserSlug(profile?.slug || null);

      if (!projectId) {
        setGeneralError("Projekt-ID fehlt.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*, gallery_images")
          .eq("id", projectId) // projectId ist string, Supabase wandelt es für 'bigint' um
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        if (!data)
          throw new Error("Projekt nicht gefunden oder Zugriff verweigert.");

        // Die Daten aus Supabase (data.id ist number)
        // passen jetzt direkt zu unserem Project-Typ (id: number)
        setProject(data as Project);
      } catch (err: any) {
        console.error("Error fetching project:", err);
        setGeneralError(`Fehler beim Laden des Projekts: ${err.message}`);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };
    getUserAndProject();
  }, [projectId, router, supabase]);

  if (loading) {
    return (
      <main className="space-y-10 px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-600 shadow-sm shadow-orange-100">
          Lade Projekt...
        </div>
      </main>
    );
  }

  if (generalError) {
    return (
      <main className="space-y-10 px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-red-200 bg-white p-8 text-center text-red-600 shadow-sm shadow-red-100">
          {generalError}
        </div>
      </main>
    );
  }

  if (!project || !currentUser) {
    return (
      <main className="space-y-10 px-6 py-10 lg:px-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm shadow-orange-100">
          Projekt oder Benutzer nicht gefunden.
        </div>
      </main>
    );
  }

  const liveProjectUrl =
    userSlug && project.status === "Published"
      ? `/${userSlug}/portfolio/${project.id}`
      : undefined;

  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      <DashboardHero
        eyebrow="Projekte"
        title="Projekt bearbeiten"
        subtitle="Aktualisieren Sie Inhalte, Bilder und Status dieses Projekts."
        actions={[
          {
            label: "Zur Projektliste",
            href: "/dashboard/projekte",
            variant: "secondary",
          },
          ...(liveProjectUrl
            ? [
                {
                  label: "Live-Seite ansehen",
                  href: liveProjectUrl,
                  variant: "primary" as const,
                  target: "_blank",
                },
              ]
            : []),
        ]}
      />

      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl shadow-orange-100/40">
        <ProjectForm
          currentUser={currentUser}
          userSlug={userSlug}
          initialData={project}
        />
      </div>
    </main>
  );
}
