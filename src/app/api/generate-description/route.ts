// src/app/api/generate-description/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js'; // Import createClient

import { INDUSTRY_TEMPLATES, resolveIndustry } from '@/lib/industry-templates';

export async function POST(request: Request) {
  
  // --- 1. AUTHENTICATION (already in place) ---
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'You must be authenticated to use this service.' }, { status: 401 });
  }

  // --- 2. Extract Project Title & Notes (already in place) ---
  let requestData;
  try { requestData = await request.json(); } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { title, notes } = requestData;
  if (!title) {
    return NextResponse.json({ error: "Project title is required" }, { status: 400 });
  }

  // --- 3. Get OpenAI API Key (already in place) ---
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  
  // --- 4. NEW: Fetch User's Profile Keywords ---
  let userKeywords = '';
  let userIndustry = 'sonstiges';
  let businessName = '';
  let servicesDescription = '';
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('keywords, industry, services_description, business_name')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;
    userKeywords = profile?.keywords || '';
    userIndustry = resolveIndustry(profile?.industry);
    businessName = profile?.business_name || '';
    servicesDescription = profile?.services_description || '';
  } catch (err) {
    console.warn("Could not fetch user keywords for AI prompt, proceeding without them.");
  }
  // --- END OF NEW SECTION ---


  // --- 5. Construct the Prompt (Now with keywords) ---
  const template = INDUSTRY_TEMPLATES[userIndustry] ?? INDUSTRY_TEMPLATES.sonstiges;
  const servicesContext = servicesDescription?.trim()?.length ? servicesDescription : template.defaultServices.join('\n');

  let prompt = `Schreibe eine kurze, professionelle Projektbeschreibung (2-3 Sätze) auf Deutsch für das Portfolio eines ${template.label} namens "${businessName || 'Handwerksbetrieb'}".`;
  prompt += `\nDer Projekttitel lautet: "${title}".`;
  prompt += `\nDieser Betrieb bietet typischerweise folgende Leistungen an:\n${servicesContext}`;

  if (notes && notes.trim() !== '') {
    prompt += `\n\nBerücksichtige außerdem folgende Notizen: "${notes}"`;
  }

  // --- ADDED KEYWORDS TO PROMPT ---
  if (userKeywords && userKeywords.trim() !== '') {
     prompt += `\n\nBeziehe diese Schlagworte mit ein: "${userKeywords}".`;
  }

  // --- 6. Call OpenAI API (no changes needed below) ---
  const apiUrl = 'https://api.openai.com/v1/chat/completions'; 

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant writing portfolio descriptions for German trade businesses." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150, 
        temperature: 0.7, 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error response:", errorData);
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      console.error("Could not extract description from OpenAI response:", data);
      throw new Error("Failed to generate description");
    }

    console.log("Generated Description:", description);
    return NextResponse.json({ description });

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: `Failed to generate description: ${errorMessage}` }, { status: 500 });
  }
}