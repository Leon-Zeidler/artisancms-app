// src/app/[slug]/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useProfile } from '@/contexts/ProfileContext'; // <-- IMPORT CONTEXT

// --- TYPE DEFINITIONS (Updated) ---
type Project = { id: string; title: string | null; 'project-date': string | null; image_url: string | null; status: 'Published' | 'Draft' | string | null; created_at: string; ai_description?: string | null; };
type Testimonial = {
  id: string;
  author_name: string;
  author_handle: string | null;
  body: string;
};

// --- Icons ---
const Icon = ({ path, className, color }: { path: string, className?: string, color?: string }) => (
    <svg className={className || "h-6 w-6 text-white"} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color || "currentColor"} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);
const serviceIcons = {
    Sanitärinstallation: 'M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 12.75h16.5m-16.5 3h16.5',
    Heizungstechnik: 'M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6',
    Fliesenarbeiten: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.125c0 .621.504 1.125 1.125 1.125z',
    Default: 'M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m18 0h-1.5m-15.75 0h.008v.008H4.25v-.008z'
};
const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 animate-spin"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /> </svg> );
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg> );
const ExclamationCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg {...props} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /> </svg> );
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h1.125a2.25 2.25 0 002.25-2.25V17.4a1.125 1.125 0 00-.933-1.11l-3.768-.754a1.125 1.125 0 00-1.173.57l-.83 1.554a1.125 1.125 0 01-1.21.588 12.04 12.04 0 01-7.09-7.09 1.125 1.125 0 01.588-1.21l1.553-.83a1.125 1.125 0 00.571-1.173l-.754-3.768A1.125 1.125 0 006.6 4.875H4.5A2.25 2.25 0 002.25 7.125v-.375z" />
  </svg>
);
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);
type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const projectBlurDataUrl =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEwIDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJhZGlhbEdyYWRpZW50IGlkPSJhIiBjeD0iNSIgY3k9IjQiIHI9IjUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2YyZWYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmOGY5ZmYiLz48L3JhZGlhbEdyYWRpZW50PjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSI4IiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+';

const formatProjectDate = (value: string | null): string | null => {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return null;
  }
};

type RGB = { r: number; g: number; b: number };

const clampChannel = (value: number) => Math.max(0, Math.min(255, value));

const hexToRgb = (value: string): RGB | null => {
  let hex = value.replace('#', '').trim();
  if (![3, 4, 6, 8].includes(hex.length)) return null;
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if ([r, g, b].some((channel) => Number.isNaN(channel))) return null;
  return { r, g, b };
};

const rgbStringToRgb = (value: string): RGB | null => {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const components = match[1]
    .split(',')
    .slice(0, 3)
    .map((component) => component.trim());

  if (components.length < 3) return null;

  const parseComponent = (component: string) => {
    if (component.endsWith('%')) {
      const percentValue = parseFloat(component.replace('%', ''));
      return clampChannel((percentValue / 100) * 255);
    }
    const numericValue = parseFloat(component);
    if (Number.isNaN(numericValue)) return NaN;
    if (numericValue <= 1) {
      return clampChannel(numericValue * 255);
    }
    return clampChannel(numericValue);
  };

  const [r, g, b] = components.map(parseComponent);
  if ([r, g, b].some((channel) => Number.isNaN(channel))) return null;
  return { r, g, b };
};

const hslToRgb = (value: string): RGB | null => {
  const match = value.match(/hsla?\(([^)]+)\)/i);
  if (!match) return null;
  const [hRaw, sRaw, lRaw] = match[1]
    .split(',')
    .slice(0, 3)
    .map((component) => component.trim());

  const h = parseFloat(hRaw);
  const s = parseFloat(sRaw.replace('%', '')) / 100;
  const l = parseFloat(lRaw.replace('%', '')) / 100;

  if ([h, s, l].some((component) => Number.isNaN(component))) return null;

  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const huePrime = (h / 60) % 6;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (huePrime >= 0 && huePrime < 1) {
    [r1, g1, b1] = [chroma, x, 0];
  } else if (huePrime >= 1 && huePrime < 2) {
    [r1, g1, b1] = [x, chroma, 0];
  } else if (huePrime >= 2 && huePrime < 3) {
    [r1, g1, b1] = [0, chroma, x];
  } else if (huePrime >= 3 && huePrime < 4) {
    [r1, g1, b1] = [0, x, chroma];
  } else if (huePrime >= 4 && huePrime < 5) {
    [r1, g1, b1] = [x, 0, chroma];
  } else if (huePrime >= 5 && huePrime < 6) {
    [r1, g1, b1] = [chroma, 0, x];
  }

  const m = l - chroma / 2;
  const r = clampChannel(Math.round((r1 + m) * 255));
  const g = clampChannel(Math.round((g1 + m) * 255));
  const b = clampChannel(Math.round((b1 + m) * 255));

  return { r, g, b };
};

const extractColorToken = (value: string): string | null => {
  const hexMatch = value.match(/#[0-9a-fA-F]{3,8}/);
  if (hexMatch) return hexMatch[0];
  const rgbMatch = value.match(/rgba?\([^)]*\)/i);
  if (rgbMatch) return rgbMatch[0];
  const hslMatch = value.match(/hsla?\([^)]*\)/i);
  if (hslMatch) return hslMatch[0];
  return null;
};

const parseColor = (value: string): RGB | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('#')) return hexToRgb(trimmed);
  if (trimmed.startsWith('rgb')) return rgbStringToRgb(trimmed);
  if (trimmed.startsWith('hsl')) return hslToRgb(trimmed);

  const token = extractColorToken(trimmed);
  if (!token) return null;
  return parseColor(token);
};

// Helper function to check if a color is dark
const isColorDark = (color: string | null | undefined): boolean => {
  if (!color) return false;
  try {
    const rgb = parseColor(color);
    if (!rgb) return false;
    const { r, g, b } = rgb;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  } catch {
    return false;
  }
};

// --- MAIN PAGE ---
export default function ClientHomepage() {
  // === State Variables ===
  const profile = useProfile(); // <-- GET PROFILE FROM CONTEXT
  
  // These states are specific to this page
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  // Contact Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState<FormStatus>('idle');
  const [formError, setFormError] = useState<string | null>(null);

  // === Data Fetching (Only for page-specific content) ===
  useEffect(() => {
    // profile is guaranteed to be loaded here by the layout
    const fetchPageContent = async () => {
      setLoadingContent(true);
      try {
        const { data: projects, error: projectsError } = await supabase
          .from('projects').select(`id, title, image_url, status, "project-date", created_at`).eq('user_id', profile.id).eq('status', 'Published').order('created_at', { ascending: false }).limit(3);
        if (projectsError) throw projectsError;
        setFeaturedProjects((projects || []) as Project[]);

        const { data: testimonialsData, error: testimonialsError } = await supabase
          .from('testimonials').select('id, author_name, author_handle, body').eq('user_id', profile.id).eq('is_published', true).order('created_at', { ascending: false }).limit(1);
        if (testimonialsError) throw testimonialsError;
        setTestimonials((testimonialsData || []) as Testimonial[]);

      } catch (err: any) {
        console.error(`[${profile.slug}] Error fetching homepage content:`, err);
        // We can set an error state here if needed
      } finally {
        setLoadingContent(false);
      }
    };

    fetchPageContent();
  }, [profile]); // Depend on the profile from context

  // --- Helper to parse services ---
  const parsedServices = profile.services_description?.split('\n').map(line => { const parts = line.split(':'); const name = parts[0]?.trim(); const description = parts.slice(1).join(':').trim(); if (name && description) { const iconKey = Object.keys(serviceIcons).find(key => name.toLowerCase().includes(key.toLowerCase())) || 'Default'; return { name, description, icon: serviceIcons[iconKey as keyof typeof serviceIcons] }; } return null; }).filter(Boolean) as { name: string; description: string; icon: string }[] || [];
  const heroHighlights = parsedServices.slice(0, 3);

  // --- Handle Contact Form Submission ---
  const handleContactSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFormStatus('loading'); setFormError(null);
      try {
          const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: formName, email: formEmail, message: formMessage, profileId: profile.id }), });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Fehler.');
          setFormStatus('success'); setFormName(''); setFormEmail(''); setFormMessage('');
          setTimeout(() => setFormStatus('idle'), 5000);
      } catch (err) { console.error("Contact form error:", err); const message = err instanceof Error ? err.message : "Fehler."; setFormError(message); setFormStatus('error'); }
  };

  // Check if secondary color is dark
  const isServicesDark = isColorDark(profile.secondary_color);
  const servicesSectionTextColor = isServicesDark ? "text-white" : "text-gray-900";
  const servicesHeadingColor = isServicesDark ? "text-white" : "text-gray-900";
  const servicesTextColor = isServicesDark ? "text-gray-200" : "text-gray-600";

  // Layout is handled by layout.tsx, we just return the <main> content
  return (
    <>
      {/* ========== HERO SECTION ========== */}
      <section className="relative isolate overflow-hidden px-6 pb-20 pt-20 sm:pb-24 sm:pt-28 lg:px-8">
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-brand/20 via-white/70 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <div className="mx-auto flex max-w-7xl flex-col gap-16 lg:flex-row lg:items-center lg:gap-24">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center rounded-full bg-brand/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-brand">
              {profile.services_description ? 'Ihr regionaler Partner' : 'Handwerk mit Handschlagqualität'}
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {profile.business_name || 'Ihr Meisterbetrieb für exzellentes Handwerk'}
            </h1>
            <p className="mt-6 text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              {profile.about_text?.substring(0, 220) + (profile.about_text && profile.about_text.length > 220 ? '…' : '') || 'Präzision, Qualität und Zuverlässigkeit für Ihr nächstes Projekt.'}
            </p>
            {heroHighlights.length > 0 && (
              <ul className="mt-8 flex flex-col gap-3 text-sm text-gray-700 sm:flex-row sm:flex-wrap">
                {heroHighlights.map((service) => (
                  <li key={service.name} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm shadow-brand/10">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <Icon path={service.icon} className="h-4 w-4" />
                    </span>
                    <span className="font-medium">{service.name}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
              <Link
                href="#kontakt"
                className="flex w-full items-center justify-center rounded-xl bg-brand px-6 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:w-auto"
              >
                Angebot anfordern
              </Link>
              {profile.slug && (
                <Link
                  href={`/${profile.slug}/portfolio`}
                  className="flex items-center justify-center text-base font-semibold text-gray-900 transition hover:text-brand"
                >
                  Unsere Projekte ansehen <span aria-hidden="true" className="ml-2">→</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="card-surface mx-auto w-full max-w-md space-y-6 p-6 sm:max-w-lg sm:p-8">
              <h2 className="text-lg font-semibold text-gray-900">Direkter Kontakt</h2>
              <p className="text-sm text-gray-600">
                Haben Sie Fragen zu einem laufenden Projekt oder möchten Sie ein unverbindliches Angebot? Wir sind nur einen Klick entfernt.
              </p>
              <div className="space-y-4 text-sm text-gray-700">
                {profile.address && (
                  <div className="rounded-2xl bg-white/60 p-4 shadow-sm">
                    <p className="font-semibold text-gray-900">Standort</p>
                    <address className="mt-1 whitespace-pre-line not-italic text-gray-600">{profile.address}</address>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  {profile.phone && (
                    <a
                      href={`tel:${profile.phone}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:flex-none"
                    >
                      <PhoneIcon className="h-5 w-5" aria-hidden="true" />
                      Anrufen
                    </a>
                  )}
                  {profile.email && (
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:flex-none"
                    >
                      <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />
                      E-Mail schreiben
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES SECTION ========== */}
      {parsedServices.length > 0 && (
        <section
          id="leistungen"
          className={`bg-brandsec py-24 sm:py-28 ${servicesSectionTextColor}`}
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center lg:max-w-3xl">
              <h2 className="text-base font-semibold uppercase tracking-wider text-brand">Leistungen</h2>
              <p className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${servicesHeadingColor}`}>
                Unsere Kernkompetenzen
              </p>
              <p className={`mt-3 text-sm lg:text-base ${servicesTextColor}`}>
                Passgenaue Lösungen für private und gewerbliche Projekte – sorgfältig geplant und zuverlässig umgesetzt.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {parsedServices.map((service) => (
                  <div key={service.name} className="card-surface flex h-full flex-col p-6">
                    <dt className={`flex items-center gap-x-3 text-base font-semibold leading-7 ${servicesHeadingColor}`}>
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Icon path={service.icon} />
                      </span>
                      {service.name}
                    </dt>
                    <dd className={`mt-4 text-sm leading-6 sm:text-base sm:leading-7 ${servicesTextColor}`}>
                      {service.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      {/* ========== FEATURED WORK SECTION ========== */}
      {featuredProjects.length > 0 && profile.slug && (
        <section id="projekte" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold uppercase tracking-wider text-brand">Referenzen</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Ein Einblick in unsere Arbeit
              </p>
              <p className="mt-6 text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
                Entdecken Sie Projekte, die wir für zufriedene Kundinnen und Kunden realisiert haben.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-10 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {featuredProjects.map((project) => {
                const projectDate = project['project-date'] || project.created_at;
                const formattedDate = formatProjectDate(projectDate);
                const status = (project.status || '').toLowerCase();
                const statusClasses =
                  status === 'published'
                    ? 'bg-emerald-100 text-emerald-700'
                    : status === 'draft'
                    ? 'bg-slate-200 text-slate-700'
                    : 'bg-amber-100 text-amber-700';
                const statusLabel =
                  status === 'published' ? 'Live' : status === 'draft' ? 'Entwurf' : 'In Vorbereitung';
                const projectImage =
                  project.image_url || `https://placehold.co/960x720/A3A3A3/FFF?text=${encodeURIComponent(project.title || 'Projekt')}`;
                const summary = project.ai_description
                  ? `${project.ai_description.substring(0, 120)}${project.ai_description.length > 120 ? '…' : ''}`
                  : 'Erfahren Sie mehr über dieses Projekt und die verwendeten Materialien im Portfolio.';

                return (
                  <article key={project.id} className="flex h-full flex-col">
                    <Link href={`/${profile.slug}/portfolio/${project.id}`} className="group flex h-full flex-col">
                      <div className="card-surface flex h-full flex-col overflow-hidden transition duration-200 group-hover:-translate-y-1">
                        <div className="relative aspect-[4/3] w-full bg-slate-100 sm:aspect-[3/2] lg:aspect-[16/9]">
                          <Image
                            src={projectImage}
                            alt={project.title || 'Projektbild'}
                            fill
                            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
                            className="h-full w-full object-cover"
                            placeholder="blur"
                            blurDataURL={projectBlurDataUrl}
                            unoptimized
                          />
                        </div>
                        <div className="flex flex-1 flex-col space-y-4 p-6">
                          <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                            {formattedDate && (
                              <time dateTime={projectDate || undefined}>{formattedDate}</time>
                            )}
                            <span className={`inline-flex items-center rounded-full px-3 py-1 font-semibold ${statusClasses}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-brand">
                            {project.title || 'Unbenanntes Projekt'}
                          </h3>
                          <p className="text-sm leading-6 text-gray-600">{summary}</p>
                          <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-brand">
                            Projekt ansehen
                            <span aria-hidden="true">→</span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
            <div className="mt-16 text-center">
              <Link
                href={`/${profile.slug}/portfolio`}
                className="rounded-xl bg-brand px-5 py-3 text-base font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Alle Projekte ansehen
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========== TESTIMONIALS SECTION ========== */}
      {testimonials.length > 0 && (
           <section id="testimonials" className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:px-8">
               <div className="hidden sm:block absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-30" aria-hidden="true" />
               <div className="hidden sm:block absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" aria-hidden="true" />
               <div className="mx-auto max-w-2xl lg:max-w-4xl">
                  <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-12">Was unsere Kunden sagen</h2>
                  {testimonials.map((testimonial) => (
                      <figure key={testimonial.id} className="mt-10">
                          <blockquote className="text-center text-xl font-semibold leading-8 text-gray-900 sm:text-2xl sm:leading-9">
                              <p>“{testimonial.body}”</p>
                          </blockquote>
                          <figcaption className="mt-10">
                              <img className="mx-auto h-10 w-10 rounded-full" src={`https://placehold.co/40x40/E2E8F0/475569?text=${testimonial.author_name.charAt(0)}`} alt="" />
                              <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                                  <div className="font-semibold text-gray-900">{testimonial.author_name}</div>
                                  {testimonial.author_handle && (
                                      <>
                                          <svg viewBox="0 0 2 2" width={3} height={3} aria-hidden="true" className="fill-gray-900"><circle cx={1} cy={1} r={1} /></svg>
                                          <div className="text-gray-600">{testimonial.author_handle}</div>
                                      </>
                                  )}
                              </div>
                          </figcaption>
                      </figure>
                  ))}
                {profile.slug && (
                      <div className="mt-16 text-center">
                          <Link
                            href={`/${profile.slug}/testimonials`}
                            className="text-base font-semibold leading-6 text-gray-900 transition-colors hover:text-brand"
                          >
                              Mehr Kundenstimmen <span aria-hidden="true">→</span>
                          </Link>
                      </div>
                  )}
               </div>
           </section>
      )}

      {/* ========== CONTACT SECTION ========== */}
      <section id="kontakt" className="bg-gray-50 py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-12 gap-y-16 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-2">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Kontakt aufnehmen</h2>
              <p className="text-sm leading-6 text-gray-600 sm:text-base">
                Nutzen Sie das Formular oder greifen Sie direkt zum Hörer – wir melden uns schnellstmöglich bei Ihnen.
              </p>
              <div className="space-y-5 text-sm leading-6 text-gray-600 sm:text-base">
                {profile.address && (
                  <div className="flex gap-x-4">
                    <svg className="h-6 w-6 text-gray-500 flex-none" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    <address className="whitespace-pre-line not-italic text-gray-600">{profile.address}</address>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex gap-x-4">
                    <PhoneIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                    <a className="hover:text-gray-900" href={`tel:${profile.phone}`}>
                      {profile.phone}
                    </a>
                  </div>
                )}
                <div className="flex gap-x-4">
                  <EnvelopeIcon className="h-6 w-6 text-gray-500" aria-hidden="true" />
                  <a className="hover:text-gray-900" href={`mailto:${profile.email || ''}`}>
                    {profile.email || 'E-Mail nicht hinterlegt'}
                  </a>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {profile.phone && (
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:flex-none"
                  >
                    <PhoneIcon className="h-5 w-5" aria-hidden="true" />
                    Jetzt anrufen
                  </a>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-brand hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:flex-none"
                  >
                    <EnvelopeIcon className="h-5 w-5" aria-hidden="true" />
                    Nachricht senden
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card-surface p-6 sm:p-8">
                <div aria-live="polite" className="space-y-3">
                  {formStatus === 'success' && (
                    <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50/90 p-3 text-sm text-green-700" role="status">
                      <CheckCircleIcon className="h-5 w-5 flex-none" aria-hidden="true" />
                      <div>
                        <p className="font-semibold">Nachricht gesendet!</p>
                        <p>Vielen Dank für Ihre Anfrage. Wir melden uns zeitnah bei Ihnen.</p>
                      </div>
                    </div>
                  )}
                  {formStatus === 'error' && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/80 p-3 text-sm text-red-700" role="alert">
                      <ExclamationCircleIcon className="h-5 w-5 flex-none" aria-hidden="true" />
                      <div>
                        <p className="font-semibold">Senden fehlgeschlagen</p>
                        <p>{formError || 'Bitte versuchen Sie es später erneut.'}</p>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleContactSubmit} className="mt-6 space-y-6" noValidate>
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-900">
                      Name
                    </label>
                    <div className="mt-2.5">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        autoComplete="name"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        disabled={formStatus === 'loading'}
                        className="block w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand sm:text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900">
                      E-Mail
                    </label>
                    <div className="mt-2.5">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        autoComplete="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        disabled={formStatus === 'loading'}
                        className="block w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand sm:text-base"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900">
                      Nachricht
                    </label>
                    <div className="mt-2.5">
                      <textarea
                        name="message"
                        id="message"
                        rows={4}
                        required
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        disabled={formStatus === 'loading'}
                        className="block w-full rounded-xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-gray-900 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={formStatus === 'loading'}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 transition hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                    >
                      {formStatus === 'loading' && <ArrowPathIcon className="h-5 w-5" aria-hidden="true" />}
                      {formStatus === 'loading' ? 'Senden…' : 'Nachricht senden'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
