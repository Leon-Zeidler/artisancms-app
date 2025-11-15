// src/lib/apply-industry-defaults.ts
import { SupabaseClient, User } from "@supabase/supabase-js";
import {
  INDUSTRY_TEMPLATES,
  Industry,
  formatDefaultServices,
} from "./industry-templates";

// Wir importieren die Funktionen, die als Konstanten exportiert werden
import { IMPRESSUM_TEMPLATE, DATENSCHUTZ_TEMPLATE } from "./legalTemplates";

type ApplyDefaultsOptions = {
  user: User;
  supabase: SupabaseClient;
  businessName: string;
  industry: Industry;
  servicesDescription?: string | null;
  keywords?: string | null;
  heroTitle?: string | null; // <-- NEU
  heroSubtitle?: string | null; // <-- NEU
  aboutText?: string | null; // <-- NEU
};

/**
 * Wendet Branchen-Standardwerte auf ein Benutzerprofil an.
 * Wird beim Onboarding aufgerufen.
 */
export async function applyIndustryDefaults({
  user,
  supabase,
  businessName,
  industry,
  servicesDescription,
  keywords,
  heroTitle, // <-- NEU
  heroSubtitle, // <-- NEU
  aboutText, // <-- NEU
}: ApplyDefaultsOptions) {
  const template = INDUSTRY_TEMPLATES[industry] ?? INDUSTRY_TEMPLATES.sonstiges;

  // Benutzt die übergebene Beschreibung ODER die Standard-Vorlage
  const finalServicesDescription = servicesDescription?.trim()?.length
    ? servicesDescription
    : formatDefaultServices(industry);

  // Wir rufen die importierten Funktionen auf
  const impressum = IMPRESSUM_TEMPLATE(businessName);
  const datenschutz = DATENSCHUTZ_TEMPLATE(businessName);

  const profileUpdates = {
    id: user.id,
    email: user.email,
    business_name: businessName,
    industry: industry,
    // Erstellt einen sauberen "Slug" für die URL
    slug: businessName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),

    // --- AKTUALISIERT: Nimmt die bearbeiteten Texte oder die Vorlage ---
    hero_title:
      heroTitle || template.heroTitle.replace("[Ort]", ""),
    hero_subtitle: heroSubtitle || template.heroSubtitle,
    about_text: aboutText || null, // <-- NEU
    // ---

    services_description: finalServicesDescription,
    keywords: keywords || null,

    // Setzt Standard-Farben & Rechtliches
    primary_color: "#F97316", // Standard-Orange
    secondary_color: "#1E293B", // Standard-Dunkelgrau
    impressum_text: impressum,
    datenschutz_text: datenschutz,

    // Schließt das Onboarding ab
    onboarding_complete: true,
  };

  // Führt das Update in der 'profiles'-Tabelle aus
  const { error } = await supabase.from("profiles").upsert(profileUpdates);

  if (error) {
    console.error("Error applying industry defaults:", error.message);
    throw new Error(`Konnte Profil nicht aktualisieren: ${error.message}`);
  }

  return { success: true, data: profileUpdates };
}