// src/app/api/draft-reply/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    // 1. Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse the incoming request
    const { customerMessage } = await request.json();
    if (!customerMessage) {
      return NextResponse.json({ error: 'customerMessage is required' }, { status: 400 });
    }

    // 3. Get API Key and create Admin Client
    const openApiKey = process.env.OPENAI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    // --- ADD THESE DEBUG LINES ---
    console.log("--- /api/draft-reply DEBUG ---");
    if (openApiKey) {
      console.log("SUCCESS: OPENAI_API_KEY is loaded.");
      console.log("Key starts with:", openApiKey.substring(0, 5) + "...");
    } else {
      console.error("!!! FAILURE: OPENAI_API_KEY is missing or undefined on the server. !!!");
    }
    console.log("---------------------------------");
    // --- END DEBUG LINES ---

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!openApiKey || !supabaseUrl || !serviceKey) {
      console.error("Server configuration error: Missing API keys or URL.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // 4. Get the user's service description from their profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('services_description, business_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error("Could not fetch user profile for AI draft:", profileError);
      return NextResponse.json({ error: "Could not find user profile" }, { status: 500 });
    }

    const { services_description, business_name } = profile;

    // 5. Construct the prompt for OpenAI
    const prompt = `
      Du bist ein professioneller und freundlicher Assistent für einen deutschen Handwerksbetrieb namens "${business_name || 'mein Betrieb'}".
      Ein Kunde hat die folgende Anfrage gesendet:
      ---
      ${customerMessage}
      ---
      
      Dies sind die Leistungen, die mein Betrieb anbietet:
      ---
      ${services_description || 'Allgemeine Handwerksleistungen'}
      ---

      Bitte verfasse einen kurzen, höflichen Antwortentwurf.
      - Sprich den Kunden mit "Sehr geehrte/r Anfragesteller/in" an (wir kennen den Namen nicht).
      - Bedanke dich für die Anfrage.
      - Gehe kurz auf die Anfrage ein.
      - Schlage vor, dass sich der Betrieb in Kürze melden wird, um Details zu besprechen.
      - Antworte auf Deutsch.
    `;

    // 6. Call OpenAI API
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
    // Check for the specific error you mentioned
    if (errorMessage.includes("Unauthorized")) {
        return NextResponse.json({ error: "OpenAI API key is invalid or missing. Please check server configuration." }, { status: 500 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

