// src/app/impressum/page.tsx
"use client";

import Link from "next/link";
import LegalDisclaimer from "@/components/LegalDisclaimer";

export default function ImpressumPage() {
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
            Impressum
          </h1>

          <LegalDisclaimer />

          {/* This 'prose' class adds nice default styling for text */}
          <div className="prose prose-lg prose-slate mt-10 max-w-none">
            <h2>Angaben gemäß § 5 TMG</h2>
            <p>
              Leon Zeidler
              <br />
              Alter Dorfrand 50
              <br />
              01454 Radeberg
            </p>

            <h2>Vertreten durch:</h2>
            <p>Leon Zeidler</p>

            <h2>Kontakt:</h2>
            <p>
              Telefon: +49 174 194 1609
              <br />
              E-Mail: leon@northcoded.com
            </p>

            <h3>Haftungsausschluss (Disclaimer)</h3>

            <h4>Haftung für Inhalte</h4>
            <p>
              Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene
              Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
              verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter
              jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die
              auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
              Informationen nach den allgemeinen Gesetzen bleiben hiervon
              unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem
              Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich.
              Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir
              diese Inhalte umgehend entfernen.
            </p>

            <h4>Haftung für Links</h4>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf
              deren Inhalte wir keinen Einfluss haben. Deshalb können wir für
              diese fremden Inhalte auch keine Gewähr übernehmen. Für die
              Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter
              oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten
              wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße
              überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
              Verlinkung nicht erkennbar.
            </p>
            <p>
              Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist
              jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
              zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir
              derartige Links umgehend entfernen.
            </p>

            <h4>Urheberrecht</h4>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
              diesen Seiten unterliegen dem deutschen Urheberrecht. Die
              Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
              Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der
              schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              Downloads und Kopien dieser Seite sind nur für den privaten, nicht
              kommerziellen Gebrauch gestattet.
            </p>
            <p>
              Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
              wurden, werden die Urheberrechte Dritter beachtet. Insbesondere
              werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie
              trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
              bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von
              Rechtsverletzungen werden wir derartige Inhalte umgehend
              entfernen.
            </p>
            <p>
              <i>
                Quelle:{" "}
                <a
                  href="https://www.e-recht24.de"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  e-recht24.de
                </a>{" "}
                (Angepasst)
              </i>
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
