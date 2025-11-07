// src/app/api/analyze-image/route.ts
import { NextResponse, NextRequest } from 'next/server';
import OpenAI from 'openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const prompt = `
Du bist ein Experte für Handwerk und Marketing. Analysiere das BILD eines handwerklichen Projekts (z.B. Möbel, Bad, Wand).
Erstelle eine professionelle, ansprechende Projektbeschreibung für die "Nachher"-Ansicht.
Fasse dich kurz (ca. 3-5 Sätze). Beschreibe, was gemacht wurde und welches hochwertige Ergebnis erzielt wurde.
Sei spezifisch, aber vermeide leere Phrasen.
BEISPIEL: "Für diesen Altbau wurde ein maßgefertigter Einbauschrank realisiert. Die Fronten in mattem Weiß nutzen die Nischenhöhe voll aus und bieten maximalen Stauraum. Integrierte LED-Beleuchtung setzt die geölten Eichenfächer stilvoll in Szene."
`;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrl, imageData, mimeType } = body;

    let imageUrlToSend: string;

    if (imageData && mimeType) {
      console.log("Image data received directly from client.");
      imageUrlToSend = `data:${mimeType};base64,${imageData}`;
    } else if (imageUrl) {
      console.log("Image URL received:", imageUrl);
      imageUrlToSend = imageUrl;
    } else {
      return NextResponse.json({ error: "imageUrl or imageData is required" }, { status: 400 });
    }

    const aiResponse = await openai.chat.completions.create({
      // --- HIER IST DER FIX ---
      model: "gpt-4o", // Ersetzt das veraltete "gpt-4-vision-preview"
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                "url": imageUrlToSend,
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const description = aiResponse.choices[0].message?.content;

    return NextResponse.json({ description });

  } catch (error: any) {
    console.error("Error in AI generation:", error);
    let errorMessage = "Fehler bei der AI-Generierung.";
    
    if (error.response) {
      errorMessage = error.response.data?.error?.message || error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    if (errorMessage.includes("invalid_image_url") || errorMessage.includes("fetch") || errorMessage.includes("resolve")) {
        errorMessage = "Bild-URL konnte nicht geladen werden. Bitte manuell generieren.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}