// src/app/dashboard/hilfe/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Hilfe & Support | Dashboard",
};

export default function DashboardHelpPage() {
  const sections = [
    { id: "start", title: "Erste Schritte" },
    { id: "ai", title: "AI‑Vorlagen & Services" },
    { id: "feedback", title: "Feedback & Support" },
    { id: "faq", title: "FAQ" },
    { id: "next", title: "Nächste Schritte" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Hilfe & Support</h1>
          <p className="mt-1 text-sm text-slate-600">Kurzanleitung, häufige Fragen und Kontaktmöglichkeiten für ArtisanCMS.</p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-md border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          ← Zurück zum Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem,1fr] gap-6">
        {/* Sidebar TOC */}
        <aside className="lg:sticky lg:top-6 h-max rounded-lg border bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Inhalt</h2>
          <nav className="mt-3 space-y-1 text-sm">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-md px-2 py-1 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                {s.title}
              </a>
            ))}
          </nav>
          <div className="mt-4 border-t pt-4 text-xs text-slate-500">
            Brauchst du persönliche Hilfe? <a className="underline hover:no-underline" href="mailto:support@artisancms.app">support@artisancms.app</a>
          </div>
        </aside>

        {/* Content */}
        <article className="rounded-lg border bg-white p-5 sm:p-6 lg:p-7">
          {/* Erste Schritte */}
          <section id="start" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-slate-900">1. Erste Schritte</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Öffne <strong>Dashboard → Projekte</strong> für den Überblick über Kunden‑Websites. Erstelle ein neues Projekt,
              gib einen Titel ein und nutze <strong>Generieren</strong>, um AI‑Texte und Struktur zu erhalten. Speichere und
              prüfe die <strong>Live‑Vorschau</strong> über den Button oben rechts im Projekt.
            </p>
            <div className="mt-3 rounded-md border bg-slate-50 p-3 text-xs text-slate-600">
              Tipp: Halte einen zweiten Tab mit der Live‑Vorschau geöffnet, um Änderungen sofort zu sehen.
            </div>
          </section>

          <hr className="my-6" />

          {/* AI Vorlagen */}
          <section id="ai" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-slate-900">2. AI‑Vorlagen & Services</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Innerhalb eines Projekts findest du die Bereiche <strong>Services</strong> und <strong>Templates</strong>.
              Dort kannst du Module hinzufügen, bearbeiten und in der Vorschau testen. Alle Inhalte landen nach dem
              Speichern automatisch auf der jeweiligen <strong>/{'{slug}'}‑Website</strong> des Projekts.
            </p>
          </section>

          <hr className="my-6" />

          {/* Feedback */}
          <section id="feedback" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-slate-900">3. Feedback & Support</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Für Bugs, Wünsche oder Ideen nutze bitte das <strong>Feedback‑Icon</strong> unten rechts im Interface
              oder schreibe uns an <a className="underline" href="mailto:support@artisancms.app">support@artisancms.app</a>.
              Wir melden uns schnellstmöglich.
            </p>
          </section>

          <hr className="my-6" />

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-slate-900">4. FAQ</h2>
            <ul className="mt-2 list-disc list-inside space-y-1 text-sm leading-6 text-slate-700">
              <li>Wie veröffentliche ich ein Projekt? → Über <strong>Zur Website</strong> in der Projektansicht.</li>
              <li>Wie ändere ich mein Passwort? → <strong>Einstellungen → Profil</strong>.</li>
              <li>Wo finde ich Impressum & Datenschutz? → Im jeweiligen <strong>/{'{slug}'}</strong>‑Auftritt unter Rechtliches.</li>
            </ul>
          </section>

          <hr className="my-6" />

          {/* Next Steps */}
          <section id="next" className="scroll-mt-24">
            <h2 className="text-xl font-semibold text-slate-900">5. Nächste Schritte</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              Experimentiere mit den Modulen, passe Texte/Bilder an und vergleiche Ergebnis & Vorschau.
              Nutze die Struktur‑Tabs (Übersicht, Services, Seiten) für einen klaren Workflow.
            </p>
            <div className="mt-4 flex items-center justify-end gap-3">
              <Link href="/dashboard/projekte" className="rounded-md border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Zu Projekte
              </Link>
              <Link href="/dashboard" className="rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                Zurück zum Dashboard
              </Link>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
