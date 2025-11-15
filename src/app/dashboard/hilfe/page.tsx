// src/app/dashboard/hilfe/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Hilfe & Support | Dashboard",
};

// --- NEUES ICON ---
const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
    />{" "}
  </svg>
);

export default function DashboardHelpPage() {
  const sections = [
    { id: "start", title: "Erste Schritte: Ihre Live-Webseite" },
    { id: "legal", title: "Wichtig: Rechtliche Anforderungen" },
    { id: "features", title: "Kernfunktionen im Detail" },
    { id: "feedback", title: "Feedback & Support" },
    { id: "faq", title: "FAQ" },
  ];

  return (
    // --- STIL-UPDATE: Angepasst an das dunkle Dashboard-Theme ---
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-orange-500">Dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Hilfe & Support
          </h1>
          <p className="mt-1 text-base text-slate-600">
            Eine detaillierte Anleitung zur Nutzung von ArtisanCMS.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-orange-200 px-3 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-100"
        >
          ← Zurück zum Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[16rem,1fr]">
        {/* Sidebar TOC */}
        <aside className="h-max rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm shadow-orange-100 lg:sticky lg:top-6">
          <h2 className="text-sm font-semibold text-slate-900">Inhalt</h2>
          <nav className="mt-3 space-y-1 text-sm">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block rounded-md px-2 py-1 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600"
              >
                {s.title}
              </a>
            ))}
          </nav>
          <div className="mt-4 border-t border-orange-100 pt-4 text-xs text-slate-500">
            Persönliche Hilfe?{" "}
            <a
              className="font-semibold text-orange-600 underline hover:text-orange-500"
              href="mailto:leon@artisancms.app"
            >
              leon@argtisancms.app
            </a>
          </div>
        </aside>

        {/* Content */}
        <article className="rounded-2xl border border-orange-100 bg-white/90 p-6 text-slate-600 shadow-lg shadow-orange-100/40 sm:p-8 lg:p-10">
          {/* Erste Schritte */}
          <section id="start" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              1. Erste Schritte: Ihre Live-Webseite
            </h2>
            <p className="text-lg leading-7 text-slate-600">
              Willkommen bei ArtisanCMS! Um Ihre Webseite online zu stellen,
              empfehlen wir diese drei Schritte:
            </p>
            <ol className="mt-6 list-inside list-decimal space-y-3 pl-2">
              <li>
                <strong className="text-orange-600">
                  Stammdaten & Rechtliches eintragen:
                </strong>
                <br />
                Gehen Sie zu{" "}
                <Link
                  href="/dashboard/einstellungen"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Einstellungen
                </Link>
                . Füllen Sie unter `Firmendaten` Ihren Namen und Ihre Adresse
                aus. Kopieren Sie anschließend Ihre Texte für `Impressum` und
                `Datenschutz` in die entsprechenden Felder. Vergessen Sie nicht
                zu speichern!
              </li>
              <li>
                <strong className="text-orange-600">
                  Erstes Projekt mit AI erstellen:
                </strong>
                <br />
                Gehen Sie zu{" "}
                <Link
                  href="/dashboard/projekte"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Projekte
                </Link>{" "}
                und erstellen Sie ein `Neues Projekt`. Laden Sie ein Bild hoch
                und testen Sie die AI-Funktion, um eine Beschreibung generieren
                zu lassen. Setzen Sie das Projekt auf
                &quot;Veröffentlicht&quot;.
              </li>
              <li>
                <strong className="text-orange-600">
                  Webseite veröffentlichen:
                </strong>
                <br />
                (Siehe nächster Punkt)
              </li>
            </ol>
          </section>

          <hr className="my-10 border-orange-100" />

          {/* Rechtliches */}
          <section id="legal" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-orange-500">
              2. Wichtig: Rechtliche Anforderungen
            </h2>
            <p className="text-lg leading-7 text-slate-600">
              Bevor Ihre Webseite öffentlich sichtbar sein kann, müssen Sie die
              gesetzlichen Anforderungen erfüllen.
            </p>
            <div className="mt-6 flex gap-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <ExclamationTriangleIcon className="mt-0.5 size-6 shrink-0 text-amber-500" />
              <div>
                <p className="font-semibold text-slate-900">
                  Seite nicht veröffentlichbar?
                </p>
                <p>
                  Um den Schalter &quot;Website veröffentlichen&quot; (in{" "}
                  <Link
                    href="/dashboard/einstellungen#sicherheit"
                    className="font-medium underline hover:text-yellow-100"
                  >
                    Einstellungen &gt; Gefahrenzone
                  </Link>
                  ) aktivieren zu können, müssen Sie zwingend Ihre Texte für
                  **Impressum** und **Datenschutz** in den entsprechenden
                  Feldern unter `Einstellungen &gt; Rechtliches` eintragen.
                </p>
              </div>
            </div>
          </section>

          <hr className="my-10 border-orange-100" />

          {/* Kernfunktionen */}
          <section id="features" className="scroll-mt-24 space-y-6">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              3. Kernfunktionen im Detail
            </h2>

            <div>
              <h4 className="text-lg font-semibold text-slate-900">
                Projekte & die AI-Bildanalyse
              </h4>
              <p className="mt-2 text-slate-600">
                Das Herzstück Ihrer Seite. Wenn Sie ein Projekt erstellen, laden
                Sie idealerweise zuerst ein &quot;Nachher-Bild&quot; hoch.
                Sobald das Bild hochgeladen ist, analysiert unsere KI (OpenAI
                `gpt-4o`) das Bild und schlägt Ihnen automatisch eine
                professionelle Projektbeschreibung vor. Sie können diesen Text
                jederzeit anpassen.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-slate-900">
                Team / Über Uns
              </h4>
              <p className="mt-2 text-slate-600">
                Unter{" "}
                <Link
                  href="/dashboard/team"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Team / Über Uns
                </Link>{" "}
                können Sie sich und Ihre Mitarbeiter vorstellen. Die hier
                eingetragenen Mitglieder erscheinen auf der öffentlichen
                `/team`-Seite Ihrer Webseite, sofern Sie dies in den{" "}
                <Link
                  href="/dashboard/einstellungen#branding"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Einstellungen
                </Link>{" "}
                aktiviert haben.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-slate-900">
                Kundenstimmen anfragen
              </h4>
              <p className="mt-2 text-slate-600">
                Wenn ein Projekt auf &quot;Veröffentlicht&quot; steht, können
                Sie im{" "}
                <Link
                  href="/dashboard/projekte"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Projekte
                </Link>
                -Tab den &quot;Kundenstimme anfragen&quot;-Button (Stern-Icon)
                nutzen. Geben Sie die E-Mail des Kunden ein, und das System
                sendet eine E-Mail mit einem einzigartigen Link.
              </p>
              <p className="mt-2 text-slate-600">
                Wenn der Kunde den Link anklickt, kann er ein Formular
                ausfüllen/page.tsx`]. Die eingereichte Bewertung landet bei
                Ihnen im{" "}
                <Link
                  href="/dashboard/testimonials"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Kundenstimmen
                </Link>
                -Tab und muss von Ihnen manuell auf &quot;Veröffentlicht&quot;
                gesetzt werden, bevor sie auf der Webseite erscheint.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-slate-900">
                Kontaktanfragen & AI-Antworten
              </h4>
              <p className="mt-2 text-slate-600">
                Anfragen über Ihr öffentliches Kontaktformular landen im{" "}
                <Link
                  href="/dashboard/contact"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Kontaktanfragen
                </Link>
                -Tab. Klicken Sie auf eine Nachricht, um sie zu öffnen. Dort
                können Sie den &quot;Antwort entwerfen&quot;-Button nutzen. Die
                KI liest die Kundenanfrage sowie Ihre eigenen
                Leistungsbeschreibungen (aus den Einstellungen) und formuliert
                einen höflichen Antwortentwurf.
              </p>
            </div>
          </section>

          <hr className="my-10 border-orange-100" />

          {/* Feedback */}
          <section id="feedback" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">
              4. Feedback & Support (Beta)
            </h2>
            <p className="text-slate-600">
              Diese App ist in der Beta-Phase. Wenn Sie einen Fehler finden,
              etwas unklar ist oder Sie eine Idee für eine neue Funktion haben,
              nutzen Sie bitte den{" "}
              <strong className="text-orange-600">
                orangenen Feedback-Button
              </strong>
              , der immer unten rechts im Dashboard schwebt.
            </p>
          </section>

          <hr className="my-10 border-orange-100" />

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24">
            <h2 className="mb-4 text-2xl font-bold text-slate-900">5. FAQ</h2>
            <ul className="list-inside list-disc space-y-4 text-slate-600">
              <li>
                <strong className="text-orange-600">
                  Wie veröffentliche ich meine Webseite?
                </strong>
                <br />
                Füllen Sie Impressum & Datenschutz in{" "}
                <Link
                  href="/dashboard/einstellungen#rechtliches"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Einstellungen
                </Link>{" "}
                aus. Gehen Sie dann im selben Menü zu `Veröffentlichung &
                Gefahrenzone` (ganz unten) und legen Sie den Schalter `Website
                veröffentlichen` um.
              </li>
              <li>
                <strong className="text-orange-600">
                  Wie ändere ich mein Passwort oder meine Login-E-Mail?
                </strong>
                <br />
                Gehen Sie zu{" "}
                <Link
                  href="/dashboard/einstellungen#sicherheit"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Einstellungen
                </Link>{" "}
                &gt; `Account-Sicherheit`. Dort können Sie Ihre E-Mail-Adresse
                ändern. Ein Link zum Zurücksetzen des Passworts wird an Ihre
                Login-E-Mail gesendet (siehe Login-Seite).
              </li>
              <li>
                <strong className="text-orange-600">
                  Wie lösche ich mein Konto?
                </strong>
                <br />
                Gehen Sie zu{" "}
                <Link
                  href="/dashboard/einstellungen#sicherheit"
                  className="text-orange-400 underline hover:text-orange-300"
                >
                  Einstellungen
                </Link>{" "}
                &gt; `Gefahrenzone`. Dort finden Sie den Button &quot;Konto
                löschen&quot;. Achtung: Diese Aktion ist endgültig und löscht
                alle Ihre Daten.
              </li>
            </ul>
          </section>
        </article>
      </div>
    </main>
  );
}
