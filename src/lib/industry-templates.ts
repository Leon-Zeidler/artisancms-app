// src/lib/industry-templates.ts

export type Industry =
  | 'maler'
  | 'fliesenleger'
  | 'tischler'
  | 'dachdecker'
  | 'galabau'
  | 'sonstiges'
  | 'elektriker';

// Das ist deine "Vorlage", an die sich alle Einträge halten müssen.
export type IndustryTemplate = {
  label: string;
  heroTitle: string;
  heroSubtitle: string;
  defaultServices: string[]; // Muss ein Array von Strings sein
  servicesSectionTitle: string;
  heroImageUrl: string;
};

export const INDUSTRY_TEMPLATES: Record<Industry, IndustryTemplate> = {
  maler: {
    label: 'Malerbetrieb',
    heroTitle: 'Ihr Malerbetrieb in [Ort]',
    heroSubtitle:
      'Saubere Innenanstriche, hochwertige Fassadenarbeiten und kreative Farbkonzepte – zuverlässig vom Meisterbetrieb umgesetzt.',
    defaultServices: [
      'Innenanstriche: Moderne Farbgestaltung für Wohn- und Arbeitsräume',
      'Fassadensanierung: Schutz und Aufwertung Ihrer Immobilie',
      'Lackierarbeiten: Türen, Fenster und Holzoberflächen in neuem Glanz',
      'Tapezierarbeiten: Von Vliestapeten bis hin zu Spezialtechniken',
    ],
    servicesSectionTitle: 'Unsere Kompetenzen im Bereich Malerarbeiten',
    heroImageUrl: 'https://images.unsplash.com/photo-1613844044163-1ad2f2d0b152?q=80&w=1740&auto=format&fit=crop', // Painter
  },
  fliesenleger: {
    label: 'Fliesenlegerbetrieb',
    heroTitle: 'Fliesen & Badsanierung aus Meisterhand',
    heroSubtitle:
      'Perfekt verlegte Fliesen in Bad, Küche und Wohnräumen – inklusive Planung, Beratung und termingerechter Ausführung.',
    defaultServices: [
      'Badsanierung: Planung und Umsetzung aus einer Hand',
      'Küchen- & Bodenfliesen: Präzise Verlegung und Fugenarbeit',
      'Großformat- & Naturstein: Exklusive Materialien perfekt verarbeitet',
      'Barrierefreie Umbauten: Bodengleiche Duschen und sichere Lösungen',
    ],
    servicesSectionTitle: 'Unsere Fachgebiete als Fliesenleger',
    heroImageUrl: 'https://images.unsplash.com/photo-1547414857-c9f61632b250?q=80&w=1740&auto=format&fit=crop', // Tiling
  },
  tischler: {
    label: 'Tischlerei / Schreinerei', // Leicht verbessert
    heroTitle: 'Maßmöbel & Innenausbau nach Wunsch',
    heroSubtitle:
      'Wir fertigen Möbel, Einbauten und Innenausbau-Lösungen, die perfekt zu Ihrem Zuhause und Ihrem Stil passen.',
    defaultServices: [
      'Einbauschränke & Garderoben: Maßgeschneiderte Stauraumlösungen',
      'Küchen & Möbel: Individuelle Fertigung aus hochwertigen Materialien',
      'Innenausbau: Türen, Decken- und Wandverkleidungen',
      'Reparaturen & Aufarbeitung: Liebevolle Pflege von Lieblingsstücken',
    ],
    servicesSectionTitle: 'Unsere Leistungen im modernen Holzhandwerk',
    heroImageUrl: 'https://images.unsplash.com/photo-1619759247378-6a73e3ad45f1?q=80&w=1742&auto=format&fit=crop', // Carpenter
  },
  dachdecker: {
    label: 'Dachdeckerbetrieb',
    heroTitle: 'Starke Dächer für jedes Wetter',
    heroSubtitle:
      'Dachneueindeckung, Sanierung und Reparaturen – sicher, langlebig und energieeffizient für Ihr Gebäude.',
    defaultServices: [
      'Dachneueindeckung (Ziegel, Schiefer oder Metall)',
      'Energetische Dachsanierung und Modernisierung',
      'Flachdachabdichtung und -begrünung',
      'Dachreparaturen, Wartung und Sturmschaden-Notdienst',
      'Einbau von Dachfenstern und Lichtkuppeln',
    ],
    servicesSectionTitle: 'Unsere Expertise als Dachdeckerbetrieb',
    heroImageUrl: 'https://images.unsplash.com/photo-1643225523483-e2c434191bba?q=80&w=1740&auto=format&fit=crop', // Roofer
  },
  galabau: {
    label: 'Garten- & Landschaftsbau',
    heroTitle: 'Garten- & Landschaftsbau mit Herz',
    heroSubtitle:
      'Wir planen, gestalten und pflegen Außenanlagen, Gärten und Terrassen – für ein grünes Zuhause zum Wohlfühlen.',
    defaultServices: [
      'Gartenplanung & -neugestaltung: Individuelle Konzepte für jedes Grundstück',
      'Terrassen & Sitzplätze (Holz, Stein, WPC)',
      'Pflasterarbeiten & Wegebau für Zufahrten und Flächen',
      'Gartenpflege, Baum- und Heckenschnitt',
      'Zaunbau und Sichtschutzlösungen',
    ],
    servicesSectionTitle: 'Unsere Leistungen im Garten- und Landschaftsbau',
    heroImageUrl: 'https://images.unsplash.com/photo-1734079692160-fcbe4be6ab96?q=80&w=1740&auto=format&fit=crop', // Landscaper
  },

  // --- HIER IST DER KORRIGIERTE EINTRAG ---
  elektriker: {
    label: 'Elektriker',
    heroTitle: 'Ihr Meisterbetrieb für moderne Elektrotechnik',
    heroSubtitle: 'Von Smart Home bis zur Wallbox – sicher, zuverlässig, innovativ.',
    // 1. Umbenannt zu `defaultServices` und in ein Array umgewandelt
    defaultServices: [
      'Smart Home & Intelligente Gebäudesteuerung (KNX)',
      'Installation von E-Ladestationen (Wallboxen)',
      'Photovoltaik-Anlagen und Energiespeicher',
      'Klassische Elektroinstallation (Neu- & Altbau)',
      'E-Check und Prüfung nach VDE-Norm',
      'Netzwerk- & Datentechnik',
      'Lichtkonzepte und Installation',
      'Sicherheitstechnik (Alarmanlagen, Videoüberwachung)',
    ],
    // 2. Fehlendes Feld `servicesSectionTitle` hinzugefügt
    servicesSectionTitle: 'Unsere Leistungen im Bereich Elektrotechnik',
    // 3. Fehlendes Feld `heroImageUrl` hinzugefügt
    heroImageUrl: 'https://images.unsplash.com/photo-1646640381839-02748ae8ddf0?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Electrician
    // 4. Die "Extra-Felder" (keywords, about_text etc.) wurden entfernt,
    //    da sie nicht in deinem `IndustryTemplate`-Typ definiert sind.
  },
  // --- ENDE DER KORREKTUR ---

  sonstiges: {
    label: 'Handwerksbetrieb (Sonstiges)',
    heroTitle: 'Ihr Meisterbetrieb für [Ihre Leistung]',
    heroSubtitle:
      'Wir sind Ihr verlässlicher Partner für [Spezialgebiet 1] und [Spezialgebiet 2] in [Ort]. Qualität und Service stehen bei uns an erster Stelle.',
    defaultServices: [
      'Beratung & Planung',
      'Fachgerechte Ausführung',
      'Reparatur & Wartung',
      'Individuelle Anfertigungen',
    ],
    servicesSectionTitle: 'Unsere Kernkompetenzen',
    heroImageUrl: 'https://plus.unsplash.com/premium_photo-1682370891536-ff08a5479f35?q=80&w=1740&auto=format&fit=crop', // Generic Workshop
  },
};

// --- Der Rest der Datei bleibt unverändert ---

export const INDUSTRY_OPTIONS = Object.entries(INDUSTRY_TEMPLATES).map(([value, template]) => ({
  value: value as Industry,
  label: template.label,
}));

export const resolveIndustry = (value: string | null | undefined): Industry => {
  if (!value) {
    return 'sonstiges';
  }
  const normalized = value.toLowerCase();
  return (Object.keys(INDUSTRY_TEMPLATES) as Industry[]).includes(normalized as Industry)
    ? (normalized as Industry)
    : 'sonstiges';
};

export const formatDefaultServices = (industry: Industry): string =>
  INDUSTRY_TEMPLATES[industry].defaultServices.join('\n');