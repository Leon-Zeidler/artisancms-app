// src/app/api/analyze-image/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  
  // --- 1. ADD AUTHENTICATION CHECK ---
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'You must be authenticated to use this service.' }, { status: 401 });
  }
  // --- END OF AUTH CHECK ---


  // --- 2. Get Image Data and API Key ---
  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { imageData, mimeType } = requestData;
  if (!imageData || !mimeType) {
    return NextResponse.json({ error: "imageData and mimeType are required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OpenAI API key not found in environment variables.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // --- 3. Construct the Image URL for the API ---
  const imageUrl = `data:${mimeType};base64,${imageData}`;

  // --- 4. Construct the Prompt ---
  const prompt = `You are an expert Handwerker (German tradesperson). This is a photo from a completed project. 
  Briefly describe the key materials, items, and work visible in the image.
  Focus on facts, not marketing. Be concise. Respond in German.
  Example: "Modernes Badezimmer mit weißen, großformatigen Fliesen, einer ebenerdigen Glasdusche und Chrom-Armaturen."`;

  // --- 5. Call OpenAI API (gpt-4o) ---
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Use the gpt-4o model for image analysis
        messages: [
          {
            role: "user",
            content: [
              { "type": "text", "text": prompt },
              { 
                "type": "image_url", 
                "image_url": { "url": imageUrl } 
              }
            ]
          }
        ],
        max_tokens: 100, // Keep the description concise
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error response:", errorData);
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // --- 6. Extract and Return Description ---
    const description = data.choices?.[0]?.message?.content?.trim();

    if (!description) {
      console.error("Could not extract description from OpenAI response:", data);
      throw new Error("Failed to generate description");
    }

    console.log("Generated Image Analysis:", description);
    return NextResponse.json({ description });

  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: `Failed to generate description: ${errorMessage}` }, { status: 500 });
  }
}

