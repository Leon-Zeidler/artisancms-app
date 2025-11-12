// src/app/agb/page.tsx
"use client";

import Link from 'next/link';
import LegalDisclaimer from '@/components/LegalDisclaimer';

export default function AGBPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Simple Header */}
      <header className="py-4 bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold text-gray-900">
            ArtisanCMS
          </Link>
        </div>
      </header>
      
      {/* Main Content Area for Legal Text */}
      <main className="flex-grow py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>

          <LegalDisclaimer />

          <div className="mt-10 prose prose-lg prose-slate max-w-none">
            {/* !!! WICHTIGER RECHTLICHER HINWEIS !!!
              Dies ist eine Vorlage für Beta-Test-Bedingungen und KEINE Rechtsberatung. 
              Sie MÜSSEN diesen Text von einem Anwalt prüfen und anpassen lassen.
            */}
            
            <p className="text-sm text-gray-500">Stand: 3. November 2025</p>

            <h2>1. Geltungsbereich und Anbieter</h2>
            <p>
              Diese Allgemeinen Geschäftsbedingungen (AGB) regeln das Vertragsverhältnis zwischen
              Leon Zeidler, Alter Dorfrand 50, 01454 Radeberg (im Folgenden &quot;Anbieter&quot; oder &quot;ArtisanCMS&quot;) 
              und den registrierten Nutzern (im Folgenden &quot;Nutzer&quot;) der Software-Plattform ArtisanCMS 
              (im Folgenden &quot;Dienst&quot;) in ihrer Beta-Version.
            </p>
            <p>
              Diese Bedingungen gelten ausschließlich für die Dauer der geschlossenen Beta-Testphase.
            </p>

            <h2>2. Vertragsgegenstand (Beta-Test)</h2>
            <p>
              Gegenstand dieses Vertrages ist die unentgeltliche Bereitstellung des Dienstes 
              in einer &quot;Beta-Version&quot; zum Zwecke des Tests durch den Nutzer.
            </p>
            <p>
              Der Dienst ist eine Software-as-a-Service (SaaS) Plattform, die es Nutzern (Handwerksbetrieben) 
              ermöglicht, eine eigene Webseite zu erstellen und zu verwalten.
            </p>
            <p>
              Der Beta-Status bedeutet, dass der Dienst sich noch in der Entwicklung befindet, 
              möglicherweise nicht alle Funktionen fehlerfrei implementiert sind und es zu 
              Funktionsänderungen oder Ausfällen kommen kann.
            </p>

            <h2>3. Kosten</h2>
            <p>
              Die Nutzung des Dienstes im Rahmen dieser geschlossenen Beta-Phase ist für den 
              Nutzer kostenlos. Der Anbieter behält sich vor, nach Abschluss der Beta-Phase 
              kostenpflichtige Pläne für die Weiternutzung des Dienstes anzubieten.
            </p>

            <h2>4. Pflichten des Nutzers</h2>
            <p>
              Der Nutzer ist verpflichtet, bei der Registrierung und bei der Eingabe seiner 
              Profildaten (z.B. in `/onboarding` oder `/dashboard/einstellungen`) 
              korrekte und vollständige Angaben zu machen.
            </p>
            <p>
              Der Nutzer ist für die Geheimhaltung seiner Zugangsdaten (Passwort) selbst verantwortlich.
            </p>
            <p>
              Der Nutzer ist **allein und vollumfänglich verantwortlich** für sämtliche Inhalte 
              (Texte, Bilder, Projektbeschreibungen), die er auf der Plattform erstellt, 
              hochlädt oder veröffentlicht.
            </p>
            <p>
              Der Nutzer stellt sicher, dass seine Inhalte nicht gegen geltendes deutsches Recht 
              (z.B. Urheberrecht, Markenrecht) verstoßen.
            </p>
            <p>
              Der Nutzer ist **gesetzlich verpflichtet**, die von ihm über die Plattform 
              veröffentlichte Webseite mit einem **vollständigen, rechtssicheren Impressum 
              und einer eigenen Datenschutzerklärung** zu versehen. Der Anbieter stellt hierfür 
              lediglich Eingabefelder und eine technische Vorlage bereit, ist aber 
              nicht für die rechtliche Korrektheit der vom Nutzer eingestellten Inhalte verantwortlich.
            </p>
            <p>
              Der Nutzer verpflichtet sich, auftretende Fehler, Probleme oder Verbesserungsvorschläge 
              über die bereitgestellte Feedback-Funktion (`FeedbackWidget`) an den Anbieter zu melden.
            </p>

            <h2>5. Haftungsbeschränkung (Beta-Status)</h2>
            <p>
              Da der Dienst unentgeltlich als Beta-Version zur Verfügung gestellt wird, 
              ist die Haftung des Anbieters stark eingeschränkt.
            </p>
            <p>
              Der Anbieter übernimmt **keine Gewähr (Haftung)** für die ständige Verfügbarkeit 
              des Dienstes, das Ausbleiben von Fehlern oder die Sicherheit der gespeicherten Daten.
            </p>
            <p>
              **Der Anbieter haftet nicht für den Verlust von Daten (z.B. hochgeladene Bilder, 
              eingegebene Projekttexte).** Dem Nutzer ist bewusst, dass es im Rahmen der 
              Beta-Phase zu Datenverlusten kommen kann.
            </p>
            <p>
              Die Haftung für Vorsatz und grobe Fahrlässigkeit sowie für Schäden an Leben, 
              Körper oder Gesundheit bleibt von diesem Haftungsausschluss unberührt.
            </p>

            <h2>6. Laufzeit, Kündigung und Löschung</h2>
            <p>
              Diese Vereinbarung über den Beta-Test läuft auf unbestimmte Zeit.
            </p>
            <p>
              Beide Parteien (Anbieter und Nutzer) können das Vertragsverhältnis jederzeit 
              und ohne Angabe von Gründen kündigen. Der Anbieter kann den Beta-Test 
              jederzeit einstellen.
            </p>
            <p>
              Der Nutzer kann sein Konto jederzeit über die Funktion &quot;Konto unwiderruflich löschen&quot; 
              in den Einstellungen (`/dashboard/einstellungen`) löschen. 
              Hierbei werden alle vom Nutzer gespeicherten Daten (gemäß unserer 
              Datenschutzerklärung) dauerhaft und unwiderruflich von der Plattform entfernt.
            </p>

            <h2>7. Schlussbestimmungen</h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland.
            </p>
            <p>
              Gerichtsstand für alle Streitigkeiten aus diesem Vertragsverhältnis ist, 
              soweit gesetzlich zulässig, der Sitz des Anbieters (Radeberg / Dresden).
            </p>
            <p>
              Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, 
              bleibt die Wirksamkeit der übrigen Bestimmungen unberührt (Salvatorische Klausel).
            </p>

          </div>

          <div className="mt-16">
            <Link href="/" className="text-sm font-semibold leading-6 text-orange-600 hover:text-orange-500">
              <span aria-hidden="true">←</span> Zurück zur Startseite
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
