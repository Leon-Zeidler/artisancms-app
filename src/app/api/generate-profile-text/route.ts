// src/app/api/generate-profile-text/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { INDUSTRY_TEMPLATES, resolveIndustry } from '@/lib/industry-templates';
import { getProfileTextPrompt } from '@/lib/ai-prompts'; // <-- NEUER IMPORT

export async function POST(request: Request) {
  
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 401 });
  }

  let requestData;
  try { requestData = await request.json(); } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // 1. Daten extrahieren (dein Code war schon korrekt)
  const { context, type, keywords } = requestData;
  if (!context || !type || (type !== 'services' && type !== 'about')) {
    return NextResponse.json({ error: "Context, und type ('services' or 'about') sind erforderlich." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server-Konfigurationsfehler" }, { status: 500 });
  }

  // 2. Profil holen (dein Code war schon korrekt)
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('business_name, industry, services_description, keywords, hero_subtitle')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: 'Profil konnte nicht geladen werden.' }, { status: 500 });
  }

  // 3. Kontext und Prompts vorbereiten
  const businessName = profileData?.business_name || context;
  const industry = resolveIndustry(profileData?.industry);
  const template = INDUSTRY_TEMPLATES[industry] ?? INDUSTRY_TEMPLATES.sonstiges;
  const servicesList = profileData?.services_description?.trim()?.length
    ? profileData.services_description
    : template.defaultServices.join('\n');
  const keywordPool = [keywords, profileData?.keywords]
    .filter(Boolean)
    .map((entry) => (entry as string).trim())
    .filter(Boolean)
    .join(', ');

  // --- 4. NEU: Dynamischen Prompt holen ---
  const systemPrompt = getProfileTextPrompt(
    industry,
    type,
    businessName,
    template.heroSubtitle,
    servicesList,
    keywordPool
  );
  const maxTokens = type === 'services' ? 120 : 200;
  // --- ENDE NEU ---

  // 5. OpenAI anrufen
  const apiUrl = 'https://api.openai.com/v1/chat/completions';
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt }, // <-- NEU
          { role: "user", content: `Erstelle den ${type}-Text.` } // <-- Einfacher User-Prompt
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content?.trim();
    if (!generatedText) throw new Error("Failed to extract generated text from API response.");

    return NextResponse.json({ text: generatedText });

  } catch (error: any) {
    console.error(`Error calling OpenAI for ${type}:`, error.message);
    return NextResponse.json({ error: `Failed to generate text: ${error.message}` }, { status: 500 });
  }
}