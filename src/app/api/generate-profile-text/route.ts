// src/app/api/generate-profile-text/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { INDUSTRY_TEMPLATES, resolveIndustry } from '@/lib/industry-templates';

export async function POST(request: Request) {
  
  // --- 1. ADD AUTHENTICATION CHECK ---
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'You must be authenticated to use this service.' }, { status: 401 });
  }
  // --- END OF AUTH CHECK ---

  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // <-- 1. EXTRACT 'keywords' FROM REQUEST BODY -->
  const { context, type, keywords } = requestData;

  if (!context || !type) {
    return NextResponse.json({ error: "Context (e.g., business name) and type ('services' or 'about') are required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OpenAI API key not found in environment variables.");
    return NextResponse.json({ error: "Server configuration error (API key missing)" }, { status: 500 });
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('business_name, industry, services_description, keywords, hero_title, hero_subtitle, address')
    .eq('id', user.id)
    .single();

  if (profileError) {
    console.error('Error fetching profile for AI prompt:', profileError.message);
    return NextResponse.json({ error: 'Profil konnte nicht geladen werden.' }, { status: 500 });
  }

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

  // --- 2. Construct the Prompt based on type AND keywords ---
  let prompt = '';
  let maxTokens = 150; // Default

  if (type === 'services') {
    prompt = `Schreibe eine kurze, professionelle Zusammenfassung der typischen Leistungen (maximal 4 Sätze oder Stichpunkte) für einen ${template.label} namens "${businessName}".`;
    prompt += `\nDer Betrieb bietet unter anderem folgende Leistungen an:\n${servicesList}`;
    if (keywordPool) {
      prompt += `\nBeziehe diese Schlagworte ein: ${keywordPool}.`;
    }
    maxTokens = 120;
  } else if (type === 'about') {
    prompt = `Schreibe einen freundlichen "Über uns"-Text (ca. 3-5 Sätze) für einen ${template.label} namens "${businessName}".`;
    prompt += `\nNutze eine Tonalität wie: "${template.heroSubtitle}" und erwähne, was den Betrieb besonders macht.`;
    prompt += `\nDiese Leistungen stehen im Fokus:\n${servicesList}`;
    if (keywordPool) {
      prompt += `\nBerücksichtige außerdem diese Spezialisierungen: ${keywordPool}.`;
    }
    maxTokens = 200;
  } else {
    return NextResponse.json({ error: "Invalid generation type specified" }, { status: 400 });
  }
  console.log("Constructed Prompt:", prompt);
  // --- END OF PROMPT UPDATE ---

  // --- Call OpenAI API ---
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  try {
    console.log("Calling OpenAI API at:", apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Du bist ein hilfreicher Assistent, der Marketingtexte für deutsche Handwerksbetriebe schreibt." },
          { role: "user", content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    console.log("OpenAI API response status:", response.status, response.statusText);

    const rawResponseText = await response.text();
    console.log("Raw OpenAI API response text:", rawResponseText);

    let data;
    try {
        data = JSON.parse(rawResponseText);
    } catch (parseError) {
        console.error("Failed to parse OpenAI response as JSON:", parseError);
        throw new Error(`OpenAI API returned non-JSON response: ${response.statusText}. Response body: ${rawResponseText.substring(0, 200)}...`);
    }

    if (!response.ok || data.error) {
      console.error("OpenAI API error response (parsed):", data);
      const errorMessage = data.error?.message || response.statusText;
      throw new Error(`OpenAI API request failed: ${errorMessage}`);
    }

    const generatedText = data.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      console.error("Could not extract 'content' from OpenAI choices:", data.choices);
      throw new Error("Failed to extract generated text from OpenAI response structure");
    }

    console.log(`Generated ${type} text:`, generatedText);
    return NextResponse.json({ text: generatedText });

  } catch (error) {
    console.error(`Error calling OpenAI for ${type}:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    let clientErrorMessage = `Failed to generate text: ${errorMessage}`;
     if (errorMessage.includes("returned non-JSON response")) {
         clientErrorMessage = "Fehler bei der Kommunikation mit dem AI-Dienst. Bitte versuchen Sie es später erneut."; 
     } else if (errorMessage.includes("API key missing")) {
         clientErrorMessage = "Server-Konfigurationsfehler. Bitte kontaktieren Sie den Support.";
     }
    return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
  }
}