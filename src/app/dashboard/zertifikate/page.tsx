// src/app/dashboard/zertifikate/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useProfile } from "@/contexts/ProfileContext";
import { createSupabaseClient } from "@/lib/supabaseClient";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import toast from "react-hot-toast";

// Platzhalter-Typ
type Certificate = {
  id: string;
  title: string;
  image_url: string | null;
};

// Platzhalter-Icon
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
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

export default function ZertifikatePage() {
  const profile = useProfile();
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  // --- HIER KÄME DEINE LOGIK ZUM HOCHLADEN/ERSTELLEN/LÖSCHEN ---
  // (Für den Moment überspringen wir das)

  useEffect(() => {
    const fetchCerts = async () => {
      if (!profile) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("profile_id", profile.id);

      if (error) toast.error("Zertifikate konnten nicht geladen werden.");
      else setCerts(data || []);
      setLoading(false);
    };
    fetchCerts();
  }, [profile, supabase]);

  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      <DashboardHero
        eyebrow="Vertrauen & Qualität"
        title="Ihre Zertifikate"
        subtitle="Zeigen Sie Ihren Kunden Ihre Qualifikationen. Laden Sie hier Logos von 'Meisterbetrieb', 'E-Check', 'KNX' etc. hoch."
      />

      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-orange-100 bg-white/90 p-6 shadow-lg shadow-orange-100/40">
          <h3 className="text-lg font-semibold">Hochgeladene Zertifikate</h3>
          {/* Hier käme der Upload-Button hin */}

          <div className="mt-4 space-y-3">
            {loading && <p>Lade...</p>}
            {!loading && certs.length === 0 && (
              <p className="text-sm text-slate-500">
                Sie haben noch keine Zertifikate hochgeladen.
              </p>
            )}
            {certs.map((cert) => (
              <div
                key={cert.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="size-6 text-emerald-500" />
                  <span className="font-medium">{cert.title}</span>
                </div>
                {/* Hier käme der Löschen-Button hin */}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
