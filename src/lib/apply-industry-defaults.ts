// src/lib/apply-industry-defaults.ts
import { SupabaseClient, User } from "@supabase/supabase-js";
import {
  INDUSTRY_TEMPLATES,
  Industry,
  formatDefaultServices,
} from "./industry-templates";

// Wir importieren die Funktionen
import { IMPRESSUM_TEMPLATE, DATENSCHUTZ_TEMPLATE } from "./legalTemplates";

type ApplyDefaultsOptions = {
  user: User;
  supabase: SupabaseClient;
  businessName: string;
  industry: Industry;
  // Step 1
  logoUrl?: string | null;
  // Step 2
  servicesDescription?: string | null;
  keywords?: string | null;
  // Step 3
  address?: string | null;
  phone?: string | null;
  // Step 4
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  aboutText?: string | null;
  // Step 5
  impressumText?: string | null;
  datenschutzText?: string | null;
};

/**
 * Wendet Branchen-Standardwerte auf ein Benutzerprofil an.
 * Wird am Ende des Onboardings aufgerufen.
 */
export async function applyIndustryDefaults({
  user,
  supabase,
  businessName,
  industry,
  logoUrl,
  servicesDescription,
  keywords,
  address,
  phone,
  heroTitle,
  heroSubtitle,
  aboutText,
  impressumText,
  datenschutzText,
}: ApplyDefaultsOptions) {
  const template = INDUSTRY_TEMPLATES[industry] ?? INDUSTRY_TEMPLATES.sonstiges;

  // 1. Fallback für Services (falls leer)
  const finalServicesDescription = servicesDescription?.trim()?.length
    ? servicesDescription
    : formatDefaultServices(industry);

  // 2. Fallbacks für AI-Texte (falls leer)
  const finalHeroTitle =
    heroTitle || template.heroTitle.replace("[Ort]", "");
  const finalHeroSubtitle = heroSubtitle || template.heroSubtitle;

  // 3. Fallbacks für Rechtstexte (falls leer)
  const finalImpressum =
    impressumText ||
    IMPRESSUM_TEMPLATE(
      businessName,
      address || null,
      phone || null,
      user.email || null,
    );
  const finalDatenschutz =
    datenschutzText ||
    DATENSCHUTZ_TEMPLATE(
      businessName,
      address || null,
      phone || null,
      user.email || null,
    );
    
  // 4. Slug generieren
  const slug = businessName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // 5. Profil-Objekt für DB erstellen
  const profileUpdates = {
    id: user.id,
    email: user.email,
    business_name: businessName,
    slug: slug,
    industry: industry,
    
    // Step 1
    logo_url: logoUrl || null,
    
    // Step 2
    services_description: finalServicesDescription,
    keywords: keywords || null,
    
    // Step 3
    address: address || null,
    phone: phone || null,
    
    // Step 4
    hero_title: finalHeroTitle,
    hero_subtitle: finalHeroSubtitle,
    about_text: aboutText || null, 
    
    // Step 5
    impressum_text: finalImpressum,
    datenschutz_text: finalDatenschutz,

    // Standardwerte
    primary_color: "#F97316", 
    secondary_color: "#1E293B",

    // --- NEUER EINTRAG ---
    // Setzt alle Seiten-Sektionen standardmäßig auf sichtbar
    show_services_section: true,
    show_team_page: true,
    show_testimonials_page: true,
    show_zertifikate_page: true, // <-- HIER HINZUGEFÜGT
    // --- ENDE ---
    
    // Onboarding abschließen
    onboarding_complete: true,
    has_seen_welcome_modal: false, // Damit die Willkommens-Modal angezeigt wird
  };

  // 6. Update in 'profiles'-Tabelle
  const { error } = await supabase.from("profiles").upsert(profileUpdates);

  if (error) {
    console.error("Error applying industry defaults:", error.message);
    throw new Error(`Konnte Profil nicht aktualisieren: ${error.message}`);
  }

  return { success: true, data: profileUpdates };
}