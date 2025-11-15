// src/app/api/industry-defaults/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { resolveIndustry } from "@/lib/industry-templates";
import { applyIndustryDefaults } from "@/lib/apply-industry-defaults";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Nutzer authentifizieren
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const { businessName, industry } = requestData;

  // --- Akzeptiert die optionalen Felder ---
  const { servicesDescription, keywords } = requestData; // <-- NEU: keywords hier lesen

  if (!businessName || !industry) {
    return NextResponse.json(
      { error: "Betriebsname und Branche sind erforderlich" },
      { status: 400 },
    );
  }

  // Stellt sicher, dass die Branche ein gültiger Typ ist
  const resolvedIndustry = resolveIndustry(industry);

  try {
    // 2. Ruft die Logik-Funktion auf und übergibt alle Daten
    const { data } = await applyIndustryDefaults({
      user,
      supabase,
      businessName,
      industry: resolvedIndustry,
      servicesDescription, // <-- Übergibt die (ggf. angepasste) Beschreibung
      keywords, // <-- NEU: keywords übergeben
    });

    return NextResponse.json({ success: true, profile: data });
  } catch (error: any) {
    console.error("Fehler in /api/industry-defaults:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}