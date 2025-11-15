// src/app/datenschutz/page.tsx
"use client";

import Link from "next/link";
import LegalDisclaimer from "@/components/LegalDisclaimer";

export default function DatenschutzPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Simple Header */}
      <header className="border-b border-gray-200 bg-gray-50 py-4">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold text-gray-900">
            ArtisanCMS
          </Link>
        </div>
      </header>

      {/* Main Content Area for Legal Text */}
      <main className="grow py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Datenschutzerklärung
          </h1>

          <LegalDisclaimer />

          <div className="prose prose-lg prose-slate mt-10 max-w-none">
            {/* !!! WICHTIGER RECHTLICHER HINWEIS !!!
              Dies ist eine Vorlage und KEINE Rechtsberatung. 
              Sie MÜSSEN diesen Text von einem Anwalt prüfen 
              und anpassen lassen. Sie sind verpflichtet, 
              mit JEDEM der unten genannten Dienste einen 
              Auftragsverarbeitungsvertrag (AVV / DPA) abzuschließen.
            */}

            <h2>1. Verantwortliche Stelle</h2>
            <p>
              Verantwortlicher im Sinne der Datenschutzgesetze, insbesondere der
              EU-Datenschutzgrundverordnung (DSGVO), ist:
            </p>
            <p>
              <strong>Leon Zeidler</strong>
              <br />
              Alter Dorfrand 50
              <br />
              01454 Radeberg
              <br />
              Telefon: +49 174 194 1609
              <br />
              E-Mail: leon@northcoded.com
            </p>

            <h2>2. Datenerfassung auf dieser Website</h2>
            <p>
              Ihre Daten werden verarbeitet, um Ihnen diesen Dienst (ArtisanCMS)
              zur Verfügung zu stellen. Nachfolgend listen wir die von uns
              genutzten Dienste und den Zweck der Datenverarbeitung auf.
            </p>

            <hr className="my-12" />

            <h3>Hosting, Server-Log-Dateien & Analytics (Vercel)</h3>
            <p>
              Unsere Website wird bei Vercel Inc., 340 S Lemon Ave #4133,
              Walnut, CA 91789, USA, gehostet. Vercel erhebt automatisch
              Server-Log-Dateien (IP-Adresse, Browsertyp, Betriebssystem,
              Referrer URL, Uhrzeit) zur Sicherstellung des Betriebs.
            </p>
            <p>
              Wir nutzen zudem Vercel Analytics, um die Nutzung unserer Website
              zu analysieren. Dies hilft uns, die Website zu verbessern. Vercel
              Analytics erfasst anonymisierte Daten wie besuchte Seiten,
              Herkunftsland und Gerätetyp.
            </p>
            <p>
              Wir haben mit Vercel einen Auftragsverarbeitungsvertrag (AVV/DPA)
              abgeschlossen.
            </p>

            <hr className="my-12" />

            <h3>Cookies und Lokaler Speicher (LocalStorage)</h3>
            <p>
              Diese Website verwendet technisch notwendige Cookies und
              LocalStorage-Einträge. Das von uns genutzte Cookie-Banner
              speichert Ihre Einwilligung (oder Ablehnung) im LocalStorage Ihres
              Browsers (`cookie_consent`).
            </p>
            <p>
              Unser Authentifizierungsdienst (Supabase) verwendet ebenfalls
              Cookies (z.B. `sb-auth-token`), um Ihren Login-Status zu
              speichern. Diese sind für die Funktion der App unerlässlich.
            </p>

            <hr className="my-12" />

            <h3>Registrierung, Datenbank & Speicherung (Supabase)</h3>
            <p>
              Wir nutzen Supabase Inc., 970 Toa Payoh North #07-04, Singapur
              318992, als unser Backend. Wenn Sie sich registrieren, verarbeitet
              Supabase Ihre E-Mail-Adresse und ein sicher verschlüsseltes
              Passwort (Hashing).
            </p>
            <p>
              Alle von Ihnen in der App erstellten Inhalte werden in der
              Supabase-Datenbank gespeichert. Dies umfasst:
            </p>
            <ul>
              <li>
                <strong>Profildaten:</strong> Ihr Firmenname, Adresse,
                Telefonnummer, Profiltexte, Farbauswahl, etc.
              </li>
              <li>
                <strong>Projektdaten:</strong> Projekttitel, Notizen,
                Beschreibungen und die von Ihnen hochgeladenen Projektbilder
                (gespeichert in Supabase Storage).
              </li>
              <li>
                <strong>Kundenstimmen:</strong> Von Ihnen eingegebene
                Referenztexte.
              </li>
              <li>
                <strong>Feedback:</strong> Von Ihnen über das Feedback-Widget
                eingereichte Nachrichten.
              </li>
            </ul>
            <p>
              Wir haben mit Supabase einen Auftragsverarbeitungsvertrag
              (AVV/DPA) abgeschlossen.
            </p>

            <hr className="my-12" />

            <h3>E-Mail-Versand (Resend)</h3>
            <p>
              Wir nutzen Resend Inc., 548 Market St, PMB 98417, San Francisco,
              CA 94104-5401, USA, für den Versand von Transaktions-E-Mails.
            </p>
            <p>
              Dies umfasst die E-Mail zur Bestätigung Ihrer Registrierung sowie
              E-Mails zum Zurücksetzen Ihres Passworts. Ihre E-Mail-Adresse wird
              zu diesem Zweck an Resend übermittelt.
            </p>
            <p>
              Wir haben mit Resend einen Auftragsverarbeitungsvertrag (AVV/DPA)
              abgeschlossen.
            </p>

            <hr className="my-12" />

            <h3>E-Mail-Kommunikation und Office (Google Workspace)</h3>
            <p>
              Zur Abwicklung unserer internen und externen
              Geschäftskommunikation (z.B. den E-Mail-Verkehr über
              leon@northcoded.com) sowie zur Verwaltung von Dokumenten nutzen
              wir die Dienste von Google Workspace. Anbieter ist Google Ireland
              Limited, Gordon House, Barrow Street, Dublin 4, Irland.
            </p>
            <p>
              Bei einer Kontaktaufnahme per E-Mail mit uns werden die von Ihnen
              übermittelten Daten (z.B. E-Mail-Adresse, Name, Inhalt Ihrer
              Anfrage) auf den Servern von Google verarbeitet und gespeichert.
            </p>
            <p>
              Grundlage hierfür ist unser berechtigtes Interesse (Art. 6 Abs. 1
              lit. f DSGVO) an einer effizienten, zuverlässigen und sicheren
              Geschäftskommunikation. Wir haben mit Google einen
              Auftragsverarbeitungsvertrag (AVV / DPA) gemäß Art. 28 DSGVO
              abgeschlossen.
            </p>

            <hr className="my-12" />

            <h3>AI-Funktionen (OpenAI)</h3>
            <p>
              Wir nutzen die Dienste von OpenAI (OpenAI, L.L.C., 3180 18th
              Street, San Francisco, CA 94110, USA), um die KI-gestützten
              Funktionen (Projekterstellung) bereitzustellen.
            </p>
            <p>
              Wenn Sie die &quot;Bild analysieren&quot;-Funktion (Modell
              &quot;gpt-4o&quot;) oder die &quot;Beschreibung
              generieren&quot;-Funktion (Modell &quot;gpt-3.5-turbo&quot;)
              nutzen, werden die folgenden Daten zur Verarbeitung an OpenAI
              übermittelt:
            </p>
            <ul>
              <li>Das von Ihnen hochgeladene Projektbild.</li>
              <li>Der von Ihnen eingegebene Projekttitel.</li>
              <li>Ihre optionalen Notizen.</li>
            </ul>
            <p>
              OpenAI verarbeitet diese Daten, um die Analyse bzw. den
              Beschreibungstext zu generieren. Laut OpenAI werden über die API
              eingereichte Daten nicht zum Training der Modelle verwendet.
            </p>
            <p>
              Wir haben mit OpenAI einen Auftragsverarbeitungsvertrag (AVV/DPA)
              abgeschlossen.
            </p>

            <hr className="my-12" />

            <h3>Fehler-Tracking (Sentry)</h3>
            <p>
              Wir nutzen den Dienst Sentry (Functional Software, Inc., 45
              Fremont Street, 8th Floor, San Francisco, CA 94105, USA), um die
              technische Stabilität unseres Dienstes zu verbessern.
            </p>
            <p>
              Sentry dient ausschließlich der Fehleranalyse (Error-Tracking).
              Wenn ein Fehler in der App auftritt, werden technische Daten (z.B.
              IP-Adresse, Gerätetyp, Fehlerprotokoll) an Sentry übermittelt, um
              uns bei der Behebung des Problems zu helfen.
            </p>
            <p>
              Wir haben mit Sentry einen Auftragsverarbeitungsvertrag (AVV/DPA)
              abgeschlossen.
            </p>

            <hr className="my-12" />

            <h2>4. Löschung Ihrer Daten (Recht auf Vergessenwerden)</h2>
            <p>
              Sie haben das Recht, Ihr Konto jederzeit zu löschen. Wenn Sie in
              Ihren Einstellungen die Option &quot;Konto unwiderruflich
              löschen&quot; wählen, werden alle Ihre personenbezogenen Daten
              (Ihr Authentifizierungs-Eintrag, Ihr Profil, Ihre Projekte,
              Bilder, Kundenstimmen und Feedback-Einträge) dauerhaft und
              unwiderruflich von unseren Systemen (Supabase) entfernt.
            </p>
          </div>

          <div className="mt-16">
            <Link
              href="/"
              className="text-sm font-semibold leading-6 text-orange-600 hover:text-orange-500"
            >
              <span aria-hidden="true">←</span> Zurück zur Startseite
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
