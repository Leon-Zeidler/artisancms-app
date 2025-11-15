// src/components/dashboard/DashboardProgress.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useProfile } from "@/contexts/ProfileContext";

export default function DashboardProgress() {
  const profile = useProfile();

  if (!profile) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-3 h-5 w-1/2 rounded bg-slate-100" />
        <div className="h-3 w-full rounded-full bg-slate-100" />
      </div>
    );
  }

  // Prüfungen für die einzelnen Schritte
  const hasFirmData = !!(profile.business_name && profile.address);
  const hasLegalTexts = !!(
    profile.impressum_text &&
    profile.datenschutz_text &&
    profile.impressum_text.length > 10
  );
  // Wir prüfen "is_published" als Indikator für den letzten Schritt,
  // da man dafür meist ein Projekt braucht. Alternativ könntest du auch projectCount prüfen,
  // aber das ist im ProfileContext oft nicht direkt enthalten.
  const isPublished = profile.is_published;

  const steps = [
    {
      label: "Firmendaten eintragen",
      done: hasFirmData,
      href: "/dashboard/einstellungen#firmendaten",
    },
    {
      label: "Rechtstexte hinterlegen",
      done: hasLegalTexts,
      href: "/dashboard/einstellungen#rechtliches",
    },
    {
      label: "Webseite veröffentlichen",
      done: isPublished,
      href: "/dashboard/einstellungen#sicherheit",
    },
  ];

  const completedSteps = steps.filter((s) => s.done).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  // Wenn alles erledigt ist, blenden wir die Box aus, um Platz zu sparen
  if (progress === 100) return null;

  // Finde den ersten Schritt, der noch nicht erledigt ist
  const nextStep = steps.find((s) => !s.done);

  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">
            Ihr Einrichtungs-Fortschritt
          </h3>
          <p className="text-sm text-slate-500">
            Nur noch wenige Schritte bis zur perfekten Seite.
          </p>
        </div>
        <span className="text-2xl font-bold text-orange-500">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-orange-500 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Next Step Action */}
      {nextStep && (
        <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3">
          <span className="text-sm font-medium text-orange-800">
            Nächster Schritt:{" "}
            <span className="font-bold">{nextStep.label}</span>
          </span>
          <Link
            href={nextStep.href}
            className="text-sm font-semibold text-orange-600 hover:text-orange-500 hover:underline"
          >
            Jetzt erledigen →
          </Link>
        </div>
      )}
    </div>
  );
}
// src/components/dashboard/DashboardProgress.tsx