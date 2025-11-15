type LegalDisclaimerVariant = "public" | "dashboard";

interface LegalDisclaimerProps {
  variant?: LegalDisclaimerVariant;
  className?: string;
}

const DISCLAIMER_TEXT: Record<LegalDisclaimerVariant, string> = {
  public:
    "Die folgenden Rechtstexte werden von den Inhabern der jeweiligen ArtisanCMS-Webseite selbst gepflegt. ArtisanCMS stellt nur die technische Plattform bereit und übernimmt keine Haftung für Vollständigkeit, Aktualität oder Richtigkeit der Inhalte.",
  dashboard:
    "Du bist für die Richtigkeit und Vollständigkeit deiner Rechtstexte (Impressum, Datenschutzerklärung, AGB) selbst verantwortlich. Lass sie im Zweifel von einer Anwaltskanzlei prüfen und passe sie auf deinen Betrieb an.",
};

export function LegalDisclaimer({
  variant = "public",
  className,
}: LegalDisclaimerProps) {
  return (
    <div
      className={`mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 shadow-sm ${className ?? ""}`}
    >
      <p className="font-semibold text-amber-900">Wichtiger Hinweis</p>
      <p className="mt-2">{DISCLAIMER_TEXT[variant]}</p>
    </div>
  );
}

export default LegalDisclaimer;
