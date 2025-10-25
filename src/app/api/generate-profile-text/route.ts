import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", error); // Log parsing error
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { context, type } = requestData; // Expect 'context' (e.g., business name) and 'type' ('services' or 'about')

  if (!context || !type) {
    return NextResponse.json({ error: "Context (e.g., business name) and type ('services' or 'about') are required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OpenAI API key not found in environment variables."); // Log missing key
    return NextResponse.json({ error: "Server configuration error (API key missing)" }, { status: 500 });
  }
  // console.log("Using OpenAI API Key:", apiKey.substring(0, 5) + "..."); // Optional: Log partial key for verification

  // --- Construct the Prompt based on type ---
  let prompt = '';
  let maxTokens = 150; // Default

  if (type === 'services') {
    prompt = `Schreibe eine kurze, professionelle Zusammenfassung der typischen Leistungen (max 3-4 Sätze oder Stichpunkte) für einen deutschen Handwerksbetrieb mit dem Namen "${context}". Nutze relevante Keywords.`;
    maxTokens = 100;
  } else if (type === 'about') {
    prompt = `Schreibe einen kurzen, ansprechenden "Über uns"-Text (ca. 3-5 Sätze) für die Webseite eines deutschen Handwerksbetriebs namens "${context}". Betone Erfahrung, Qualität oder regionale Verbundenheit.`;
    maxTokens = 150;
  } else {
    return NextResponse.json({ error: "Invalid generation type specified" }, { status: 400 });
  }
  console.log("Constructed Prompt:", prompt); // Log the prompt

  // --- Call OpenAI API ---
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  try {
    console.log("Calling OpenAI API at:", apiUrl); // Log API call start
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

    console.log("OpenAI API response status:", response.status, response.statusText); // Log status

    // *** NEU: Log raw response text before parsing JSON ***
    const rawResponseText = await response.text();
    console.log("Raw OpenAI API response text:", rawResponseText);

    // Now try to parse the raw text as JSON
    let data;
    try {
        data = JSON.parse(rawResponseText);
    } catch (parseError) {
        console.error("Failed to parse OpenAI response as JSON:", parseError);
        // Throw a specific error indicating JSON parse failure based on the raw text
        throw new Error(`OpenAI API returned non-JSON response: ${response.statusText}. Response body: ${rawResponseText.substring(0, 200)}...`);
    }

    // Check if the parsed JSON indicates an error (OpenAI usually returns errors in JSON format)
    if (!response.ok || data.error) {
      console.error("OpenAI API error response (parsed):", data);
      const errorMessage = data.error?.message || response.statusText;
      throw new Error(`OpenAI API request failed: ${errorMessage}`);
    }

    const generatedText = data.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      console.error("Could not extract 'content' from OpenAI choices:", data.choices); // Log choices structure
      throw new Error("Failed to extract generated text from OpenAI response structure");
    }

    console.log(`Generated ${type} text:`, generatedText);
    return NextResponse.json({ text: generatedText }); // Return as 'text'

  } catch (error) {
    console.error(`Error calling OpenAI for ${type}:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Ensure the error message passed to the frontend is useful but not overly technical
    let clientErrorMessage = `Failed to generate text: ${errorMessage}`;
     if (errorMessage.includes("returned non-JSON response")) {
         clientErrorMessage = "Fehler bei der Kommunikation mit dem AI-Dienst. Bitte versuchen Sie es später erneut."; // More user-friendly
     } else if (errorMessage.includes("API key missing")) {
         clientErrorMessage = "Server-Konfigurationsfehler. Bitte kontaktieren Sie den Support.";
     }
    return NextResponse.json({ error: clientErrorMessage }, { status: 500 });
  }
}

