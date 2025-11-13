export type Industry =
  | 'maler'
  | 'fliesenleger'
  | 'tischler'
  | 'dachdecker'
  | 'galabau'
  | 'sonstiges';

export type IndustryTemplate = {
  label: string;
  heroTitle: string;
  heroSubtitle: string;
  defaultServices: string[];
  servicesSectionTitle: string;
  heroImageUrl: string; // <--- NEU
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
    heroImageUrl: 'https://images.unsplash.com/photo-1613844044163-1ad2f2d0b152?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example: Painter
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
    heroImageUrl: 'https://images.unsplash.com/photo-1547414857-c9f61632b250?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example: Tiling
  },
  tischler: {
    label: 'Tischlerei',
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
    heroImageUrl: 'https://images.unsplash.com/photo-1619759247378-6a73e3ad45f1?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example: Carpenter
  },
  dachdecker: {
    label: 'Dachdeckerbetrieb',
    heroTitle: 'Starke Dächer für jedes Wetter',
    heroSubtitle:
      'Dachneueindeckung, Sanierung und Reparaturen – sicher, langlebig und energieeffizient für Ihr Gebäude.',
    defaultServices: [
      'Dachneueindeckung: Ziegel, Schiefer oder Metall',
      'Dachsanierung: Energetische Modernisierung vom Fachbetrieb',
      'Flachdach & Abdichtung: Nachhaltig dicht mit Garantie',
      'Dachreparaturen & Wartung: Schnelle Hilfe bei Sturmschäden',
    ],
    servicesSectionTitle: 'Unsere Expertise als Dachdeckerbetrieb',
    heroImageUrl: 'https://images.unsplash.com/photo-1643225523483-e2c434191bba?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example: Roofer
  },
  galabau: {
    label: 'GaLaBau-Betrieb',
    heroTitle: 'Garten- & Landschaftsbau mit Herz',
    heroSubtitle:
      'Wir planen, gestalten und pflegen Außenanlagen, Gärten und Terrassen – für ein grünes Zuhause zum Wohlfühlen.',
    defaultServices: [
      'Gartenplanung & -gestaltung: Individuelle Konzepte für jedes Grundstück',
      'Terrassen & Sitzplätze: Holz, Stein oder Naturmaterialien',
      'Pflaster- & Wegebau: Präzise Ausführung für Zufahrten und Flächen',
      'Pflege & Pflanzarbeiten: Nachhaltige Betreuung Ihrer Anlage',
    ],
    servicesSectionTitle: 'Unsere Leistungen im Garten- und Landschaftsbau',
    heroImageUrl: 'https://images.unsplash.com/photo-1734079692160-fcbe4be6ab96?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example: Landscaper
  },
  sonstiges: {
    label: 'Handwerksbetrieb',
    heroTitle: 'Handwerk mit Handschlagqualität',
    heroSubtitle:
      'Verlässlicher Service, transparente Beratung und hochwertige Ausführung – damit Ihr Projekt schnell gelingt.',
    defaultServices: [
      'Beratung & Planung: Persönliche Betreuung von Anfang an',
      'Projektumsetzung: Termintreu und sauber ausgeführt',
      'Reparaturen & Service: Schnelle Hilfe bei Problemen',
      'Koordination & Partnernetzwerk: Alles aus einer Hand',
    ],
    servicesSectionTitle: 'Unsere Kernkompetenzen',
    heroImageUrl: 'https://plus.unsplash.com/premium_photo-1682370891536-ff08a5479f35?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example: Generic Workshop
  },
};

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