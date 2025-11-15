// src/app/api/generate-onboarding-texts/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  INDUSTRY_TEMPLATES,
  resolveIndustry,
  type Industry,
} from "@/lib/industry-templates";
import { getProfileTextPrompt } from "@/lib/ai-prompts";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const {
    businessName,
    industry: industryName,
    keywords,
    servicesDescription,
    address, // <-- NEU
    phone, // <-- NEU
  } = await request.json();
  if (!businessName || !industryName) {
    return NextResponse.json(
      { error: "Name und Branche sind erforderlich." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server-Konfigurationsfehler" },
      { status: 500 },
    );
  }

  const industry = resolveIndustry(industryName);
  const template = INDUSTRY_TEMPLATES[industry];

  // 1. Standard-Titel und Untertitel holen
  // Wir extrahieren die Stadt aus der Adresse, falls vorhanden
  const city = address?.split(",")?.[1]?.trim() || address?.split(" ")?.[1] || "";
  const heroTitle = template.heroTitle.replace("[Ort]", city).trim();
  const heroSubtitle = template.heroSubtitle;

  // 2. AI anrufen, um den "Über Uns" Text zu generieren
  let aboutText = "";
  try {
    const systemPrompt = getProfileTextPrompt(
      industry,
      "about",
      businessName,
      template.heroSubtitle,
      servicesDescription || template.defaultServices.join("\n"),
      keywords || "",
      address || "", // <-- NEU: Kontext an AI übergeben
      phone || "" // <-- NEU: Kontext an AI übergeben
    );

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Erstelle den "Über uns"-Text für ${businessName}. Der Betrieb ist in ${city || 'der Region'} tätig.`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    aboutText = data.choices?.[0]?.message?.content?.trim() || "";
  } catch (error: any) {
    console.error("Error calling OpenAI for about text:", error.message);
    aboutText = `Willkommen bei ${businessName}. Wir sind Ihr ${template.label}-Fachbetrieb in ${city || 'Ihrer Region'} und spezialisiert auf...`;
  }

  // 3. Alle drei Texte zurückgeben
  return NextResponse.json({
    heroTitle,
    heroSubtitle,
    aboutText,
  });
}