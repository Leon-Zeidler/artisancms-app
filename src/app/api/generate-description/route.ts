// src/app/api/generate-description/route.ts
import { NextResponse } from 'next/server';

// This function handles POST requests made to /api/generate-description
export async function POST(request: Request) {
  // --- 1. Extract Project Title & Notes ---
  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    console.error("Error parsing request body:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { title, notes } = requestData; // <-- 1. GET NOTES

  if (!title) {
    return NextResponse.json({ error: "Project title is required" }, { status: 400 });
  }

  // --- 2. Get OpenAI API Key (Securely) ---
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OpenAI API key not found in environment variables.");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  // --- 3. Construct the Prompt ---
  // <-- 2. UPDATE PROMPT TO USE NOTES -->
  let prompt = `Write a short, professional project description (max 2-3 sentences) in German for a portfolio, based on the following project title: "${title}". Focus on the work performed and the quality. Use keywords relevant for a German trade business.`;

  // Add the notes to the prompt if they exist and are not empty
  if (notes && notes.trim() !== '') {
    prompt += `\n\nIncorporate these additional notes from the tradesperson to add specific detail (e.g., materials, special techniques): "${notes}"`;
  }

  // --- 4. Call OpenAI API ---
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
        max_tokens: 150, // Increased slightly to allow for notes
        temperature: 0.7, 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error response:", errorData);
      throw new Error(`OpenAI API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // --- 5. Extract and Return Description ---
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