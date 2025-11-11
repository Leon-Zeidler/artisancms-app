// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createSupabaseClient } from '../../lib/supabaseClient';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import PlusIcon from '@/components/icons/PlusIcon';
import { DashboardHero } from '@/components/dashboard/DashboardHero';
import { DashboardStatCard } from '@/components/dashboard/DashboardStatCard';
// --- 1. IMPORT THE CORRECT TYPE ---
import type { Project } from '@/lib/types';

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
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
    />
  </svg>
);
const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />
  </svg>
);
const CheckBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);


function ProjectCard({ project }: ProjectCardProps) {
  const displayDate = project['project-date']
    ? new Date(project['project-date']).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Kein Datum';
  const imageUrl =
    project.after_image_url || `https://placehold.co/600x400/ffedd5/f97316?text=${encodeURIComponent(project.title || 'Projekt')}`;
  const detailUrl = `/dashboard/projekte/${project.id}/edit`;

  return (
    <Link
      href={detailUrl}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-orange-100/60 bg-white/90 shadow-[0_20px_45px_-28px_rgba(249,115,22,0.75)] transition duration-300 hover:-translate-y-1.5 hover:border-orange-200 hover:shadow-[0_25px_60px_-30px_rgba(234,88,12,0.7)]"
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_60%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden="true"
      />
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={project.title || 'Projektbild'}
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/600x400/fef3c7/ea580c?text=Bild+fehlt')}
        />
        <div
          className={`absolute top-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm shadow-orange-100 ${
            project.status === 'Published'
              ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
              : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
          {project.status === 'Published' ? 'Veröffentlicht' : 'Entwurf'}
        </div>
      </div>
      <div className="relative flex flex-1 flex-col justify-between p-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-500">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400" aria-hidden="true" />
            Projektkarte
          </div>
          <h3 className="text-lg font-semibold text-slate-900 transition group-hover:text-orange-600">
            {project.title || 'Unbenanntes Projekt'}
          </h3>
          <p className="text-sm text-slate-500">{displayDate}</p>
        </div>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
          Projekt öffnen
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function NewProjectCard() {
  return (
    <Link
      href="/dashboard/projekte/neu"
      className="group relative flex h-full min-h-[260px] flex-col items-center justify-center overflow-hidden rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-50 via-white to-orange-100 text-center text-orange-700 shadow-[0_25px_50px_-30px_rgba(249,115,22,0.6)] transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:text-orange-600"
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.25),_transparent_65%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden="true" />
      <div className="relative mb-4 rounded-full bg-white p-4 shadow-sm shadow-orange-100">
        <PlusIcon className="h-8 w-8" />
      </div>
      <div className="relative space-y-2 px-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-500">
          Launch Pad
        </span>
        <h3 className="text-lg font-semibold text-slate-900">Neues Projekt</h3>
        <p className="text-sm text-orange-600">Starten Sie mit wenigen Klicks Ihr nächstes Highlight.</p>
      </div>
    </Link>
  );
}

function EmptyProjectsState() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-orange-100/80 bg-gradient-to-br from-white via-orange-50 to-white p-8 shadow-[0_35px_70px_-40px_rgba(249,115,22,0.65)]">
      <span className="pointer-events-none absolute -left-20 top-1/3 h-52 w-52 rounded-full bg-orange-200/40 blur-3xl" aria-hidden="true" />
      <span className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-200/40 blur-2xl" aria-hidden="true" />
      <div className="relative space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-orange-600">
          Los geht&apos;s
        </span>
        <h2 className="text-3xl font-bold text-slate-900">Ihr Dashboard ist startklar</h2>
        <p className="text-sm text-slate-600">
          Sie haben noch keine Projekte veröffentlicht. Legen Sie direkt los und zeigen Sie, was Ihr Unternehmen auszeichnet.
        </p>
        <ul className="mt-6 space-y-4 text-sm text-slate-600">
          <li className="flex items-start gap-3 rounded-2xl bg-white/70 p-3 shadow-sm shadow-orange-100">
            <CheckBadgeIcon className="mt-0.5 h-5 w-5 text-orange-500" aria-hidden="true" />
            <span>KI-gestützte Texte und Layouts sparen Ihnen wertvolle Zeit.</span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-white/70 p-3 shadow-sm shadow-orange-100">
            <CheckBadgeIcon className="mt-0.5 h-5 w-5 text-orange-500" aria-hidden="true" />
            <span>Veröffentlichen Sie Projekte mit nur einem Klick auf Ihrer Live-Seite.</span>
          </li>
          <li className="flex items-start gap-3 rounded-2xl bg-white/70 p-3 shadow-sm shadow-orange-100">
            <CheckBadgeIcon className="mt-0.5 h-5 w-5 text-orange-500" aria-hidden="true" />
            <span>Nutzen Sie das Hilfe-Center für Tipps zur perfekten Präsentation.</span>
          </li>
        </ul>
      </div>
      <div className="relative mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard/projekte/neu"
          className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200"
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
        console.error('Error fetching user:', userError);
        setError('Fehler beim Laden der Benutzerdaten.');
        setLoading(false);
        setProjects([]);
        return;
      }

      if (!user) {
        setError('Bitte einloggen.');
        setLoading(false);
        setProjects([]);
        return;
      }

      setCurrentUser(user);
      
      // --- 3. UPDATE THE SELECT STATEMENT ---
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`*`) // <-- FIX: Fetch all columns
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching projects:', fetchError);
        setError(`Projekte konnten nicht geladen werden: ${fetchError.message}`);
        setProjects([]);
      } else {
        setProjects(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]); // <-- supabase was the missing dependency

  const totalProjects = projects.length;
  const publishedProjects = projects.filter((p) => p.status === 'Published').length;
  const draftProjects = totalProjects - publishedProjects;
  const hasProjects = totalProjects > 0;

  const greeting = currentUser?.email ? currentUser.email.split('@')[0] : 'Artisan';

  const todaysFocus = [
    {
      label: 'Hero aktualisieren',
      description: 'Startseite mit aktuellen Erfolgen füllen, um Besucher direkt zu beeindrucken.',
    },
    {
      label: 'Team vorstellen',
      description: 'Nutzen Sie Portraits und Kurztexte, um Vertrauen aufzubauen.',
    },
    {
      label: 'Referenzen sammeln',
      description: 'Bitten Sie Kund:innen über das Feedback-Widget um neue Testimonials.',
    },
  ];

  const quickWins = [
    {
      title: 'Visitenkarte',
      description: 'Aktualisieren Sie Logo, Farben und Schriften für einen konsistenten Auftritt.',
      href: '/dashboard/einstellungen#branding',
    },
    {
      title: 'Schnellformular',
      description: 'Erstellen Sie ein neues Projekt anhand bewährter Vorlagen.',
      href: '/dashboard/projekte/neu',
    },
    {
      title: 'Hilfe erhalten',
      description: 'Lernen Sie Best Practices im Hilfe-Center Schritt für Schritt kennen.',
      href: '/dashboard/hilfe',
    },
  ];

  const recentActivity = projects.slice(0, 4);
  const statusBreakdown = [
    {
      label: 'Live',
      value: publishedProjects,
      helper: 'Auf Ihrer Seite sichtbar',
      accent: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'In Bearbeitung',
      value: draftProjects,
      helper: 'Warten auf Feinschliff',
      accent: 'bg-indigo-100 text-indigo-700',
    },
    {
      label: 'Portfolio gesamt',
      value: totalProjects,
      helper: 'Alle Projekte im Studio',
      accent: 'bg-orange-100 text-orange-700',
    },
  ];

  return (
    <main className="space-y-10 bg-[radial-gradient(circle_at_top,_#fff7ed,_#fff)] px-6 py-10 lg:px-10">
      <section className="grid gap-6 xl:grid-cols-[2.1fr,1fr]">
        <DashboardHero
          eyebrow="Workspace"
          title={`Willkommen zurück, ${greeting}!`}
          subtitle="Planen, gestalten und veröffentlichen Sie Ihr Portfolio wie in einem kreativen Studio – übersichtlich und mit einem Blick auf alle wichtigen Kennzahlen."
          actions={[
            {
              label: 'Neues Projekt erstellen',
              href: '/dashboard/projekte/neu',
              icon: PlusIcon,
            },
            {
              label: 'Hilfe-Center öffnen',
              href: '/dashboard/hilfe',
              variant: 'secondary',
            },
          ]}
        >
          {currentUser && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-orange-100 px-2 py-1 font-semibold text-orange-600">Studio-Profil</span>
              <span className="font-medium">{currentUser.email}</span>
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <div className="grid gap-4 sm:grid-cols-3">
              <DashboardStatCard
                title="Alle Projekte"
                value={totalProjects}
                description="Gesamt erstellt"
                icon={DocumentDuplicateIcon}
                trend={hasProjects ? `${totalProjects} Projekte aktiv` : 'Noch keine Projekte angelegt'}
              />
              <DashboardStatCard
                title="Entwürfe"
                value={draftProjects}
                description="Noch in Bearbeitung"
                icon={PencilSquareIcon}
                accent="indigo"
                trend={draftProjects > 0 ? 'Feinschliff empfohlen' : 'Alle Projekte sind veröffentlicht'}
              />
              <DashboardStatCard
                title="Veröffentlicht"
                value={publishedProjects}
                description="Öffentlich sichtbar"
                icon={CheckBadgeIcon}
                accent="emerald"
                trend={publishedProjects > 0 ? 'Sichtbar auf Ihrer Webseite' : 'Noch nichts live geschaltet'}
              />
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-100 via-white to-orange-50 p-6 shadow-inner">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-200/60 blur-2xl" aria-hidden="true" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-600">Studio Agenda</h3>
              <p className="mt-2 text-sm text-slate-600">Wählen Sie drei Highlights, die Ihr Auftritt heute verdient.</p>
              <ul className="mt-4 space-y-3">
                {todaysFocus.map((item) => (
                  <li key={item.label} className="rounded-xl bg-white/70 p-3 shadow-sm shadow-orange-100">
                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DashboardHero>

        <aside className="relative overflow-hidden rounded-3xl border border-orange-200/80 bg-white/90 p-6 shadow-xl shadow-orange-100/40">
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(circle,_rgba(249,115,22,0.2),_transparent_70%)]" aria-hidden="true" />
          <div className="relative z-10 space-y-6">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
                Kreativ-Studio
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Individuelle Empfehlungen</h2>
              <p className="text-sm text-slate-600">
                Entdecken Sie, wie Sie Ihre Projekte in Szene setzen und neue Leads begeistern können.
              </p>
            </div>
            <div className="space-y-4">
              {quickWins.map((action) => (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group block rounded-2xl border border-orange-200 bg-white/80 p-4 shadow-sm shadow-orange-100 transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                      <p className="mt-1 text-xs text-slate-600">{action.description}</p>
                    </div>
                    <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
                      <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-600 shadow-sm">
          Lade Projekte...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="space-y-6">
          {hasProjects ? (
            <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
              <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-orange-100/80 bg-white/90 p-6 shadow-[0_35px_80px_-50px_rgba(249,115,22,0.7)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
                        Projektgalerie
                      </span>
                      <h2 className="mt-3 text-2xl font-bold text-slate-900">Aktuelle Projekte</h2>
                      <p className="text-sm text-slate-600">Eine kuratierte Auswahl Ihrer neuesten Referenzen.</p>
                    </div>
                    <Link
                      href="/dashboard/projekte"
                      className="inline-flex items-center gap-2 rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:border-orange-300 hover:text-orange-500"
                    >
                      Alle Projekte anzeigen
                      <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <NewProjectCard />
                    {projects.slice(0, 3).map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>

                  {projects.length > 3 && (
                    <p className="mt-6 text-center text-xs font-medium text-orange-600">
                      {projects.length - 3} weitere Projekte warten auf Ihre Aufmerksamkeit.
                    </p>
                  )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="overflow-hidden rounded-3xl border border-orange-100/70 bg-white/90 p-6 shadow-inner">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-600">Aktivitätsjournal</h3>
                    <p className="mt-2 text-sm text-slate-600">Ihre letzten Veröffentlichungen und Entwürfe auf einen Blick.</p>
                    <ul className="mt-4 space-y-4">
                      {recentActivity.map((project) => {
                        const statusLabel = project.status === 'Published' ? 'Live' : 'Entwurf';
                        const statusAccent =
                          project.status === 'Published'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-indigo-100 text-indigo-700';
                        return (
                          <li key={project.id} className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-orange-100">
                            <span className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusAccent}`}>
                              {statusLabel}
                            </span>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-900">{project.title || 'Unbenanntes Projekt'}</p>
                              <p className="text-xs text-slate-500">{new Date(project.created_at).toLocaleDateString('de-DE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-orange-100/70 bg-gradient-to-br from-orange-50 via-white to-white p-6 shadow-inner">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-600">Nächste Meilensteine</h3>
                    <p className="mt-2 text-sm text-slate-600">Nutzen Sie die folgenden Schritte, um Ihr Portfolio weiter auszubauen.</p>
                    <ul className="mt-4 space-y-4">
                      <li className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-orange-100">
                        <p className="text-sm font-semibold text-slate-900">Media Kit erweitern</p>
                        <p className="text-xs text-slate-600">Laden Sie neue Bilder in Ihrer Galerie hoch, um Ihre Projektstory zu stärken.</p>
                      </li>
                      <li className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-orange-100">
                        <p className="text-sm font-semibold text-slate-900">Testimonials aktivieren</p>
                        <p className="text-xs text-slate-600">Nutzen Sie die Anfragefunktion, um frisch veröffentlichte Projekte zu bewerben.</p>
                      </li>
                      <li className="rounded-2xl bg-white/80 p-4 shadow-sm shadow-orange-100">
                        <p className="text-sm font-semibold text-slate-900">Team-Spotlight planen</p>
                        <p className="text-xs text-slate-600">Veröffentlichen Sie eine Story über Ihr Team, um neue Kund:innen zu gewinnen.</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <aside className="space-y-6">
                <div className="overflow-hidden rounded-3xl border border-orange-100/60 bg-white/90 p-6 shadow-[0_30px_80px_-60px_rgba(249,115,22,0.8)]">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-600">Statusübersicht</h3>
                  <p className="mt-2 text-sm text-slate-600">Ein schneller Blick auf Ihr Portfolio.</p>
                  <div className="mt-4 space-y-3">
                    {statusBreakdown.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm shadow-orange-100"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-500">{item.helper}</p>
                        </div>
                        <span className={`inline-flex min-w-[3rem] justify-center rounded-full px-3 py-1 text-xs font-semibold ${item.accent}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-orange-100/60 bg-gradient-to-br from-white via-orange-50 to-white p-6 shadow-inner">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-orange-600">Studio Pulse</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Bleiben Sie präsent, indem Sie jede Woche ein Highlight aktualisieren.
                  </p>
                  <div className="mt-4 space-y-3 text-xs text-slate-600">
                    <p>
                      • Veröffentlichen Sie regelmäßig neue Projekte, um im Kopf Ihrer Kund:innen zu bleiben.
                    </p>
                    <p>• Aktualisieren Sie vorhandene Referenzen mit aktuellen Zahlen und Bildern.</p>
                    <p>• Teilen Sie den Live-Link Ihres Portfolios mit neuen Leads.</p>
                  </div>
                </div>
              </aside>
            </div>
          ) : (
            <EmptyProjectsState />
          )}
        </section>
      )}
    </main>
  );
}