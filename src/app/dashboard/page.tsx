// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { createSupabaseClient } from '../../lib/supabaseClient';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import PlusIcon from '@/components/icons/PlusIcon';

// --- TYPE DEFINITIONS ---
type Project = {
  id: string;
  title: string | null;
  'project-date': string | null;
  after_image_url: string | null;
  status: 'Published' | 'Draft' | string | null;
  created_at: string;
};

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: string;
};

type ProjectCardProps = { project: Project };
type QuickAction = { name: string; description: string; href: string; icon: React.ElementType; badge?: string };
type ResourceLink = { name: string; description: string; href: string };

// --- ICON COMPONENTS ---
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

const RocketLaunchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 19c-1.657 0-3 .672-3 1.5S7.343 22 9 22s3-.672 3-1.5S10.657 19 9 19zm6 0c1.657 0 3 .672 3 1.5S16.657 22 15 22s-3-.672-3-1.5S13.343 19 15 19zm-3-4.5L9 9l6-6 3 3-6 6zm1.5-1.5L21 18M6 21l3-9"
    />
  </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 20a4 4 0 00-8 0m8 0v-.5a6.5 6.5 0 00-13 0v.5m8-9a3 3 0 100-6 3 3 0 000 6zm-5 0a3 3 0 100-6 3 3 0 000 6z" />
  </svg>
);

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12l2.846.813a4.5 4.5 0 010 3.09l-2.846.813a4.5 4.5 0 01-3.09 3.09L15 21.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L8.25 15l2.846-.813a4.5 4.5 0 013.09-3.09L15 8.25l.813 2.846a4.5 4.5 0 013.09 3.09L21.75 15l-2.846.813a4.5 4.5 0 01-3.09 3.09z"
    />
  </svg>
);

const quickActions: QuickAction[] = [
  {
    name: 'Projekt starten',
    description: 'Lassen Sie unsere KI eine überzeugende Projektseite erstellen.',
    href: '/dashboard/projekte/neu',
    icon: RocketLaunchIcon,
    badge: 'Empfohlen',
  },
  {
    name: 'Team präsentieren',
    description: 'Stellen Sie Ihre Expertinnen und Experten auf Ihrer Seite vor.',
    href: '/dashboard/team',
    icon: UsersIcon,
  },
  {
    name: 'Branding anpassen',
    description: 'Logo, Farben und Call-to-Actions für Ihren Auftritt festlegen.',
    href: '/dashboard/einstellungen#branding',
    icon: SparklesIcon,
  },
];

const resourceLinks: ResourceLink[] = [
  {
    name: 'Hilfe-Center',
    description: 'Antworten auf häufige Fragen und Schritt-für-Schritt-Anleitungen.',
    href: '/dashboard/hilfe',
  },
  {
    name: 'Kontaktanfragen',
    description: 'Reagieren Sie schnell auf neue Leads und Kundenfragen.',
    href: '/dashboard/contact',
  },
  {
    name: 'Feedback geben',
    description: 'Teilen Sie Ihr Feedback direkt mit dem ArtisanCMS-Team.',
    href: '/dashboard/admin',
  },
];

// --- UI COMPONENTS ---
function StatCard({ title, value, description, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-800/80 p-6 shadow-lg shadow-slate-900/30">
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent blur-2xl"
        aria-hidden="true"
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400/80">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
          {trend && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300">
              {trend}
            </p>
          )}
        </div>
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/80 ring-1 ring-slate-700">
          <Icon className="h-6 w-6 text-orange-400" />
        </span>
      </div>
    </div>
  );
}

function ProjectCard({ project }: ProjectCardProps) {
  const displayDate = project['project-date']
    ? new Date(project['project-date']).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Kein Datum';
  const imageUrl =
    project.after_image_url || `https://placehold.co/600x400/334155/94a3b8?text=${encodeURIComponent(project.title || 'Projekt')}`;
  const detailUrl = `/dashboard/projekte/${project.id}/edit`;

  return (
    <Link
      href={detailUrl}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/80 transition-transform hover:-translate-y-1 hover:border-orange-500/60 hover:shadow-2xl hover:shadow-orange-900/30"
    >
      <div className="relative">
        <img
          src={imageUrl}
          alt={project.title || 'Projektbild'}
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/600x400/ef4444/ffffff?text=Image+Error')}
        />
        <div
          className={`absolute top-3 left-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            project.status === 'Published'
              ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/40'
              : 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
          {project.status === 'Published' ? 'Veröffentlicht' : 'Entwurf'}
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="text-lg font-semibold text-white transition group-hover:text-orange-200">
            {project.title || 'Unbenanntes Projekt'}
          </h3>
          <p className="mt-1 text-sm text-slate-400">{displayDate}</p>
        </div>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-400">
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
      className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/70 bg-slate-900/50 text-center transition duration-300 hover:border-orange-500 hover:bg-slate-800/80 hover:text-orange-300"
    >
      <div className="mb-4 rounded-full bg-orange-500/10 p-4 text-orange-300">
        <PlusIcon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-white">Neues Projekt</h3>
      <p className="mt-1 text-sm text-slate-400">Starten Sie mit wenigen Klicks Ihr nächstes Highlight.</p>
    </Link>
  );
}

const WelcomeGuide = () => {
  const actions = [
    { name: 'Projekt erstellen', description: 'Beginnen Sie mit Ihrem ersten Referenzprojekt.', href: '/dashboard/projekte/neu' },
    { name: 'Team einrichten', description: 'Zeigen Sie Kundinnen und Kunden, wer hinter Ihrer Arbeit steckt.', href: '/dashboard/team' },
    {
      name: 'Einstellungen prüfen',
      description: 'Impressum, Datenschutz & Branding eintragen, damit alles bereit für den Launch ist.',
      href: '/dashboard/einstellungen',
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/60 shadow-lg shadow-slate-900/30">
      <div className="border-b border-slate-700/60 bg-gradient-to-r from-slate-900 via-slate-900/50 to-orange-900/30 px-6 py-5">
        <h2 className="text-lg font-semibold text-white">Willkommen bei ArtisanCMS!</h2>
        <p className="mt-1 text-sm text-slate-400">
          Folgen Sie diesen Schritten, um Ihre Präsenz zu vervollständigen und die ersten Besucher zu begeistern.
        </p>
      </div>
      <div className="space-y-4 px-6 py-5">
        {actions.map((action, actionIdx) => (
          <div
            key={actionIdx}
            className="flex items-start gap-4 rounded-xl border border-slate-800/80 bg-slate-800/40 p-4 transition hover:border-orange-500/50 hover:bg-slate-800/80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10 text-sm font-semibold text-orange-300">
              {actionIdx + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white">{action.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{action.description}</p>
            </div>
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-orange-200 ring-1 ring-inset ring-slate-700 hover:bg-orange-500/20"
            >
              Starten
              <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

function QuickActionCard({ name, description, href, icon: Icon, badge }: QuickAction) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/40 p-5 transition hover:-translate-y-1 hover:border-orange-500/50 hover:bg-slate-900/70"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        {badge && (
          <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-200">
            {badge}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-base font-semibold text-white transition group-hover:text-orange-200">{name}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-orange-300">
        Jetzt öffnen
        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
      </span>
    </Link>
  );
}

function ResourceList({ resources }: { resources: ResourceLink[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900/50">
      <div className="border-b border-slate-700/60 px-6 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Ressourcen & Support</h3>
      </div>
      <ul className="divide-y divide-slate-800/80">
        {resources.map((resource) => (
          <li key={resource.name} className="group">
            <Link
              href={resource.href}
              className="flex items-start justify-between gap-4 px-6 py-4 transition hover:bg-slate-800/60"
            >
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-orange-200">{resource.name}</p>
                <p className="mt-1 text-sm text-slate-400">{resource.description}</p>
              </div>
              <ArrowRightIcon className="mt-1 h-4 w-4 text-slate-500 group-hover:text-orange-300" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyProjectsState() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-700/70 bg-slate-900/50 p-8">
      <div className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-orange-200">
          Los geht's
        </span>
        <h2 className="text-2xl font-bold text-white">Ihr Dashboard ist startklar</h2>
        <p className="text-sm text-slate-400">
          Sie haben noch keine Projekte veröffentlicht. Legen Sie direkt los und zeigen Sie, was Ihr Unternehmen auszeichnet.
        </p>
        <ul className="mt-6 space-y-3 text-sm text-slate-300">
          <li className="flex items-start gap-3">
            <CheckBadgeIcon className="mt-0.5 h-5 w-5 text-orange-300" aria-hidden="true" />
            <span>KI-gestützte Texte und Layouts sparen Ihnen wertvolle Zeit.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckBadgeIcon className="mt-0.5 h-5 w-5 text-orange-300" aria-hidden="true" />
            <span>Veröffentlichen Sie Projekte mit nur einem Klick auf Ihrer Live-Seite.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckBadgeIcon className="mt-0.5 h-5 w-5 text-orange-300" aria-hidden="true" />
            <span>Nutzen Sie das Hilfe-Center für Tipps zur perfekten Präsentation.</span>
          </li>
        </ul>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard/projekte/neu"
          className="inline-flex items-center justify-center rounded-full bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
        >
          Jetzt erstes Projekt erstellen
        </Link>
        <Link
          href="/dashboard/hilfe"
          className="inline-flex items-center justify-center rounded-full border border-slate-600 px-6 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-orange-400 hover:text-orange-200"
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
  const [projects, setProjects] = useState<Project[]>([]);
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

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`id, title, "project-date", after_image_url, status, created_at`)
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
  }, [supabase]);

  const totalProjects = projects.length;
  const publishedProjects = projects.filter((p) => p.status === 'Published').length;
  const draftProjects = totalProjects - publishedProjects;
  const hasProjects = totalProjects > 0;

  const greeting = currentUser?.email ? currentUser.email.split('@')[0] : 'Artisan';

  return (
    <main className="space-y-10 px-6 py-10 lg:px-10">
      <section className="relative overflow-hidden rounded-3xl border border-slate-700/70 bg-slate-900/70 p-8 shadow-2xl shadow-slate-900/40">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.35),transparent_60%)]" aria-hidden="true" />
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-200">
                Dashboard
              </span>
              <h1 className="text-3xl font-bold text-white lg:text-4xl">Willkommen zurück, {greeting}!</h1>
              <p className="text-base text-slate-300 lg:max-w-2xl">
                Behalten Sie Ihre wichtigsten Kennzahlen im Blick und führen Sie Besucher in wenigen Minuten zu einer eindrucksvollen Referenzseite.
              </p>
              {currentUser && <p className="text-xs text-slate-400">Angemeldet als: {currentUser.email}</p>}
            </div>
            <Link
              href="/dashboard/projekte/neu"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/40 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-200"
            >
              Neues Projekt erstellen
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Alle Projekte"
              value={totalProjects}
              description="Gesamt erstellt"
              icon={DocumentDuplicateIcon}
              trend={hasProjects ? `${totalProjects} Projekte aktiv` : 'Noch keine Projekte angelegt'}
            />
            <StatCard
              title="Entwürfe"
              value={draftProjects}
              description="Noch in Bearbeitung"
              icon={PencilSquareIcon}
              trend={draftProjects > 0 ? 'Feinschliff empfohlen' : 'Alle Projekte sind veröffentlicht'}
            />
            <StatCard
              title="Veröffentlicht"
              value={publishedProjects}
              description="Öffentlich sichtbar"
              icon={CheckBadgeIcon}
              trend={publishedProjects > 0 ? 'Sichtbar auf Ihrer Webseite' : 'Noch nichts live geschaltet'}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Schnelle Aktionen</h2>
            <p className="text-sm text-slate-400">Springen Sie direkt zu den beliebtesten Bereichen Ihres Dashboards.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => (
            <QuickActionCard key={action.name} {...action} />
          ))}
        </div>
      </section>

      {loading && (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-10 text-center text-sm text-slate-300">
          Lade Projekte...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-500/40 bg-red-900/30 p-6 text-center text-sm text-red-100">
          {error}
        </div>
      )}

      {!loading && !error && (
        <section className="space-y-6">
          {hasProjects ? (
            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Aktuelle Projekte</h2>
                    <p className="text-sm text-slate-400">Eine Kurzübersicht Ihrer letzten Aktivitäten.</p>
                  </div>
                  <Link
                    href="/dashboard/projekte"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-orange-300 hover:text-orange-200"
                  >
                    Alle Projekte anzeigen
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  <NewProjectCard />
                  {projects.slice(0, 5).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>

                {projects.length > 5 && (
                  <p className="text-center text-xs text-slate-500">
                    {projects.length - 5} weitere Projekte warten auf Ihre Aufmerksamkeit.
                  </p>
                )}
              </div>

              <div className="space-y-6">
                <WelcomeGuide />
                <ResourceList resources={resourceLinks} />
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
              <EmptyProjectsState />
              <div className="space-y-6">
                <WelcomeGuide />
                <ResourceList resources={resourceLinks} />
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
