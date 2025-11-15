// src/lib/ai-prompts.ts
import type { Industry } from "./industry-templates";

/**
 * =================================================================
 * 1. PROMPTS FÜR: BILDANALYSE (analyze-image)
 * =================================================================
 */
const analyzeImageBasePrompt = `
Du bist ein Marketing-Experte für deutsches Handwerk. Deine Aufgabe ist es, aus einem Bild eine Projektbeschreibung für die "Nachher"-Ansicht zu erstellen (ca. 2-4 Sätze).
Der Text soll professionell, vertrauenerweckend und ansprechend für potenzielle Kunden sein. Beginne direkt mit der Beschreibung, ohne "Auf diesem Bild...".
`;

// Spezifische Anweisungen pro Branche
const industryImagePrompts: Partial<Record<Industry, string>> = {
  elektriker: `
    **Fokus:** Betone 'Sicherheit', 'Normgerechte Installation (VDE)', 'Zukunftssicher', 'Modernste Technik'.
    **Beispiele:**
    - (Sicherungskasten): "Eine normgerechte Elektroverteilung ist das Herzstück eines sicheren Zuhauses. Wir haben die Anlage auf den neuesten Stand gebracht – für maximale Sicherheit."
    - (Wallbox): "Volle Ladeleistung für Ihr E-Auto. Mit dieser fachmännisch installierten Wallbox laden Sie sicher und komfortabel direkt zu Hause."
    - (Smart Home): "Intelligenter Komfort: Mit dieser KNX-Steuerung werden Licht und Jalousien zentral und energieeffizient verwaltet."
  `,
  maler: `
    **Fokus:** Betone 'Sauberkeit', 'Präzision', 'Hochwertige Materialien', 'Wirkung des Raumes'.
    **Beispiele:**
    - (Fassade): "Neuer Schutz und frische Optik für die Fassade. Mit einem hochwertigen Anstrichsystem ist das Gebäude nun wieder optimal vor Wind und Wetter geschützt."
    - (Wohnzimmer): "Präzise Malerarbeiten mit perfektem Kantenschluss. Die seidenmatten Oberflächen verleihen dem Raum eine edle und ruhige Atmosphäre."
  `,
  fliesenleger: `
    **Fokus:** Betone 'Präzision', 'Hochwertige Materialien' (z.B. Großformat, Naturstein), 'Fugenbild', 'Pflegeleicht'.
    **Beispiele:**
    - (Bad): "Ein modernes Bad mit großformatigen Fliesen. Die präzise Verlegung und das schmale Fugenbild schaffen eine ruhige, pflegeleichte Oberfläche."
    - (Terrasse): "Rutschfest und witterungsbeständig: Dieser neue Terrassenbelag aus Feinsteinzeug lädt zum Entspannen ein und bleibt jahrelang schön."
  `,
  tischler: `
    **Fokus:** Betone 'Maßarbeit', 'Materialien' (z.B. Massivholz, Eiche), 'Handwerkliche Präzision', 'Stauraum', 'Passgenauigkeit'.
    **Beispiele:**
    - (Einbauschrank): "Perfekte Raumnutzung bis in den letzten Winkel. Dieser maßgefertigte Einbauschrank bietet maximalen Stauraum und fügt sich nahtlos in die Architektur ein."
    - (Küche): "Eine Traumküche aus massivem Eichenholz, kombiniert mit modernen Fronten. Jedes Detail wurde handwerklich präzise auf Kundenwunsch gefertigt."
  `,
  // Füge hier weitere Branchen hinzu (dachdecker, galabau...)
};

// Diese Funktion exportieren wir
export function getAnalyzeImagePrompt(industry: Industry): string {
  return `${analyzeImageBasePrompt}\n${industryImagePrompts[industry] || ""}`;
}

/**
 * =================================================================
 * 2. PROMPTS FÜR: PROJEKT-TEXT (generate-description)
 * =================================================================
 */
const generateDescriptionBasePrompt = `
Du bist ein Marketing-Assistent für einen deutschen Handwerksbetrieb. Schreibe eine professionelle Projektbeschreibung (2-3 Sätze) für dessen Portfolio-Webseite.
`;

const industryDescriptionPrompts: Partial<Record<Industry, string>> = {
  elektriker:
    "Fokus auf Sicherheit (VDE), moderne Technik (Smart Home, PV, Wallbox) und Zuverlässigkeit. Verwende Fachbegriffe korrekt.",
  maler:
    "Fokus auf Atmosphäre, saubere Ausführung, hochwertige Farben und die optische Verwandlung.",
  fliesenleger:
    "Fokus auf präzise Verlegung, moderne Materialien (Großformat, Mosaik) und die Gestaltung von Bädern/Wohnräumen.",
  tischler:
    "Fokus auf Maßarbeit, edle Hölzer, handwerkliche Qualität und clevere Detaillösungen.",
  //...
};

export function getGenerateDescriptionPrompt(industry: Industry): string {
  return `${generateDescriptionBasePrompt}\n**Branchen-Fokus:** ${industryDescriptionPrompts[industry] || "Fokus auf Qualität, Zuverlässigkeit und saubere Arbeit."}`;
}

/**
 * =================================================================
 * 3. PROMPTS FÜR: PROFIL-TEXTE (generate-profile-text)
 * =================================================================
 */
export function getProfileTextPrompt(
  industry: Industry,
  type: "services" | "about",
  businessName: string,
  heroSubtitle: string,
  servicesList: string,
  keywordPool: string,
): string {
  const label = industry === "sonstiges" ? "Handwerksbetrieb" : industry;

  if (type === "services") {
    let prompt = `Schreibe eine kurze, professionelle Zusammenfassung der Leistungen (max. 4 Sätze ODER Stichpunkte) für einen ${label} namens "${businessName}".`;
    prompt += `\nFolgende Leistungen sind bekannt:\n${servicesList}`;
    if (keywordPool)
      prompt += `\nBeziehe diese Schlagworte ein: ${keywordPool}.`;
    return prompt;
  }

  if (type === "about") {
    let prompt = `Schreibe einen freundlichen "Über uns"-Text (ca. 3-5 Sätze) für einen ${label} namens "${businessName}".`;
    prompt += `\nDie Tonalität soll so sein: "${heroSubtitle}"`;
    prompt += `\nDer Betrieb legt Wert auf (Beispiele): ${servicesList}`;
    if (keywordPool)
      prompt += `\nBerücksichtige diese Spezialisierungen: ${keywordPool}.`;

    // Branchenspezifische "Über uns"-Anweisungen
    if (industry === "elektriker") {
      prompt +=
        "\n**Extra-Fokus:** Betone 'Meisterbetrieb', 'Sicherheit', 'Innovation (Smart Home, PV)' und 'Zuverlässigkeit'.";
    } else if (industry === "maler") {
      prompt +=
        "\n**Extra-Fokus:** Betone 'Meisterbetrieb', 'Sauberkeit', 'Pünktlichkeit' und 'Kreative Beratung'.";
    }
    // ...
    return prompt;
  }

  return "Fehler: Ungültiger Typ.";
}
