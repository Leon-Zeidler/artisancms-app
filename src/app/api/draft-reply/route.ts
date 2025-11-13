// src/app/api/draft-reply/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { INDUSTRY_TEMPLATES, resolveIndustry } from '@/lib/industry-templates';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 1. Get the authenticated user (already in place)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse the incoming request (already in place)
    const { customerMessage } = await request.json();
    if (!customerMessage) {
      return NextResponse.json({ error: 'customerMessage is required' }, { status: 400 });
    }

    // 3. Get API Key and create Admin Client (already in place)
    const openApiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!openApiKey || !supabaseUrl || !serviceKey) {
      console.error("Server configuration error: Missing API keys or URL.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // 4. Get the user's service description from their profile
    // --- 1. ADD 'keywords' TO THE SELECT ---
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('services_description, business_name, keywords, industry')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error("Could not fetch user profile for AI draft:", profileError);
      return NextResponse.json({ error: "Could not find user profile" }, { status: 500 });
    }

    const { services_description, business_name, keywords } = profile;
    const industry = resolveIndustry(profile.industry);
    const template = INDUSTRY_TEMPLATES[industry];
    const templateServices = template.defaultServices.join('\n');

    // 5. Construct the prompt for OpenAI
    // --- 2. ADD 'keywords' TO THE PROMPT ---
    const prompt = `
      Du bist ein professioneller und freundlicher Assistent für einen ${template.label} namens "${business_name || 'mein Betrieb'}".
      Ein Kunde hat die folgende Anfrage gesendet:
      ---
      ${customerMessage}
      ---

      Dies sind die Leistungen, die mein Betrieb anbietet:
      ---
      ${services_description || templateServices}
      ---

      Die Haupt-Schlagworte des Betriebs sind: "${keywords || 'keine Angabe'}".
      Typische Leistungen dieser Branche sind außerdem: ${template.defaultServices.join(', ')}.

      Bitte verfasse einen kurzen, höflichen Antwortentwurf.
      - Sprich den Kunden mit "Sehr geehrte/r Anfragesteller/in" an (wir kennen den Namen nicht).
      - Bedanke dich für die Anfrage.
      - Gehe kurz auf die Anfrage ein (vielleicht im Bezug auf die Schlagworte/Leistungen).
      - Schlage vor, dass sich der Betrieb in Kürze melden wird, um Details zu besprechen.
      - Antworte auf Deutsch.
    `;

    // 6. Call OpenAI API (no changes needed below)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error response:", errorData);
      throw new Error(`OpenAI API request failed: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const draft = data.choices?.[0]?.message?.content?.trim();

    if (!draft) {
      throw new Error("Could not extract draft from OpenAI response.");
    }

    // 7. Send the draft back to the client
    return NextResponse.json({ draft });

  } catch (error) {
    console.error("Error in /api/draft-reply:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    if (errorMessage.includes("Unauthorized")) {
        return NextResponse.json({ error: "OpenAI API key is invalid or missing. Please check server configuration." }, { status: 500 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}