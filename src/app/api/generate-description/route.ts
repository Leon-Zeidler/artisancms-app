// src/app/api/generate-description/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import {
  INDUSTRY_TEMPLATES,
  resolveIndustry,
  type Industry,
} from "@/lib/industry-templates";
import { getGenerateDescriptionPrompt } from "@/lib/ai-prompts"; // <-- NEUER IMPORT

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

  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
  const { title, notes } = requestData;
  if (!title) {
    return NextResponse.json(
      { error: "Projekttitel ist erforderlich." },
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

  // 1. Profil holen (dein Code war schon korrekt)
  let userKeywords = "";
  let userIndustry: Industry = "sonstiges";
  let businessName = "";
  let servicesDescription = "";
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("keywords, industry, services_description, business_name")
      .eq("id", user.id)
      .single();

    if (profile) {
      userKeywords = profile.keywords || "";
      userIndustry = resolveIndustry(profile.industry);
      businessName = profile.business_name || "";
      servicesDescription = profile.services_description || "";
    }
  } catch (err) {
    console.warn(
      "Could not fetch user profile for AI prompt, proceeding with defaults.",
    );
  }

  // 2. Kontext und Prompts vorbereiten
  const template =
    INDUSTRY_TEMPLATES[userIndustry] ?? INDUSTRY_TEMPLATES.sonstiges;
  const servicesContext = servicesDescription?.trim()?.length
    ? servicesDescription
    : template.defaultServices.join("\n");

  // --- 3. NEU: Dynamische Prompts holen ---
  const systemPrompt = getGenerateDescriptionPrompt(userIndustry);

  let userPrompt = `Projekttitel: "${title}"`;
  userPrompt += `\nBetriebsname: "${businessName || "Handwerksbetrieb"}"`;
  userPrompt += `\nTypische Leistungen des Betriebs:\n${servicesContext}`;
  if (notes && notes.trim() !== "") {
    userPrompt += `\n\nZusätzliche Notizen: "${notes}"`;
  }
  if (userKeywords && userKeywords.trim() !== "") {
    userPrompt += `\n\nZu betonende Keywords: "${userKeywords}"`;
  }
  // --- ENDE NEU ---

  // 4. OpenAI anrufen
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // GPT-3.5-turbo ist hier schnell und ausreichend
        messages: [
          { role: "system", content: systemPrompt }, // <-- NEU
          { role: "user", content: userPrompt }, // <-- NEU
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim();
    if (!description)
      throw new Error("Failed to generate description from API response.");

    return NextResponse.json({ description });
  } catch (error: any) {
    console.error("Error calling OpenAI API:", error.message);
    return NextResponse.json(
      { error: `Failed to generate description: ${error.message}` },
      { status: 500 },
    );
  }
}
