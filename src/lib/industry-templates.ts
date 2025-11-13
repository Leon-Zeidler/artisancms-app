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
};

export const INDUSTRY_TEMPLATES: Record<Industry, IndustryTemplate> = {
  maler: {
    label: 'Malerbetrieb',
    heroTitle: 'Ihr Malerbetrieb in [Ort]',
    heroSubtitle: 'Wir bringen Farbe in Innenräume und Fassaden – sauber, termintreu und mit Liebe zum Detail.',
    defaultServices: [
      'Innenanstriche: Moderne Farbkonzepte für Wohn- und Geschäftsräume',
      'Fassadengestaltung: Wetterbeständige Anstriche inklusive Putzarbeiten',
      'Lackierarbeiten: Türen, Fenster und Holzoberflächen mit perfektem Finish',
      'Schimmel- und Wasserschadensanierung: Nachhaltige Beseitigung und Schutz',
    ],
  },
  fliesenleger: {
    label: 'Fliesenlegerbetrieb',
    heroTitle: 'Ihr Fliesenleger für Bad, Küche und Boden',
    heroSubtitle: 'Wir planen und verlegen Fliesen mit Präzision – für langlebige Bäder, Küchen und Wohnräume.',
    defaultServices: [
      'Badsanierung: Fugenlose Duschen und moderne Badgestaltung',
      'Küchenfliesen: Spritzschutz und Arbeitsflächen im Wunschdesign',
      'Bodenfliesen: Robuste Beläge für Wohn- und Gewerbeflächen',
      'Naturstein & Mosaik: Individuelle Akzente für besondere Räume',
    ],
  },
  tischler: {
    label: 'Tischlerei',
    heroTitle: 'Individuelle Tischlerarbeiten aus Ihrer Region',
    heroSubtitle: 'Maßanfertigungen aus Holz – von der Planung bis zur Montage mit persönlicher Beratung.',
    defaultServices: [
      'Maßmöbel: Einbauschränke, Regale und Wohnlösungen nach Maß',
      'Küchen & Fronten: Individuelle Küchen mit hochwertigen Materialien',
      'Innentüren & Trennwände: Passgenau für Alt- und Neubauten',
      'Innenausbau: Decken, Wandverkleidungen und Bodenaufbauten',
    ],
  },
  dachdecker: {
    label: 'Dachdeckerbetrieb',
    heroTitle: 'Starke Dächer vom Fachbetrieb',
    heroSubtitle: 'Ob Neueindeckung oder Reparatur – wir sichern Ihr Dach dauerhaft gegen Wind und Wetter.',
    defaultServices: [
      'Dachneueindeckung: Ziegel, Schiefer und Metallprofile',
      'Dachsanierung: Energetische Sanierung inklusive Dämmung',
      'Flachdachabdichtung: Moderne Abdichtungssysteme',
      'Reparaturen & Wartung: Sturm- und Hagelschäden schnell behoben',
    ],
  },
  galabau: {
    label: 'Garten- & Landschaftsbau',
    heroTitle: 'Garten- und Landschaftsbau aus einer Hand',
    heroSubtitle: 'Wir gestalten Außenanlagen, Terrassen und Grünflächen, die zum Verweilen einladen.',
    defaultServices: [
      'Gartenplanung: Individuelle Konzepte für Neu- und Umgestaltung',
      'Terrassenbau: Holz-, Stein- oder WPC-Beläge inklusive Unterbau',
      'Pflasterarbeiten: Hofeinfahrten, Wege und Flächen nach Maß',
      'Pflege & Bepflanzung: Saisonale Pflegepakete für Privat und Gewerbe',
    ],
  },
  sonstiges: {
    label: 'Handwerksbetrieb',
    heroTitle: 'Ihr regionaler Handwerksbetrieb',
    heroSubtitle: 'Wir stehen für zuverlässige Beratung, faire Angebote und sorgfältig ausgeführte Arbeiten.',
    defaultServices: [
      'Beratung & Planung: Persönliche Vor-Ort-Termine und transparente Angebote',
      'Projektumsetzung: Präzise Handwerksarbeit mit hochwertigen Materialien',
      'Service & Wartung: Langfristige Betreuung auch nach Projektende',
    ],
  },
};

export const INDUSTRY_OPTIONS = (Object.keys(INDUSTRY_TEMPLATES) as Industry[]).map((key) => ({
  value: key,
  label: INDUSTRY_TEMPLATES[key].label,
}));

export const resolveIndustry = (value: string | null | undefined): Industry => {
  if (value && value in INDUSTRY_TEMPLATES) {
    return value as Industry;
  }
  return 'sonstiges';
};
