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
    let imageMimeType: string | null = mimeType;

    if (imageData && imageMimeType) {
      // Pfad 1: Base64-Daten kommen direkt vom Client (z.B. bei Erst-Upload)
      console.log("Image data received directly from client.");
      imageUrlToSend = `data:${imageMimeType};base64,${imageData}`;
    
    } else if (imageUrl) {
      // Pfad 2: URL kommt vom Client (z.B. beim Klick auf "Generieren")
      // --- START DER KORREKTUR ---
      console.log("Image URL received. Fetching image on server to send as Base64...");
      
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image from Supabase: ${imageResponse.statusText}`);
      }

      if (!imageResponse.body) {
        throw new Error("Image response has no body.");
      }

      imageMimeType = imageResponse.headers.get('Content-Type');
      if (!imageMimeType) {
        throw new Error("Could not determine image MIME type from response.");
      }

      // Wandelt das Bild in einen Base64-String um
      const imageArrayBuffer = await imageResponse.arrayBuffer();
      const imageBuffer = Buffer.from(imageArrayBuffer);
      const base64String = imageBuffer.toString('base64');
      
      imageUrlToSend = `data:${imageMimeType};base64,${base64String}`;
      console.log(`Successfully converted URL to Base64. Mime: ${imageMimeType}`);
      // --- ENDE DER KORREKTUR ---

    } else {
      return NextResponse.json({ error: "imageUrl or imageData is required" }, { status: 400 });
    }

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o", // Bleibt gpt-4o
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                "url": imageUrlToSend, // Hier werden jetzt *immer* Base64-Daten gesendet
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
    
    // Diese Fehlermeldung wird jetzt seltener auftreten, ist aber als Fallback gut
    if (errorMessage.includes("invalid_image_url") || errorMessage.includes("fetch") || errorMessage.includes("resolve")) {
        errorMessage = "Bild-URL konnte nicht geladen werden. Bitte manuell generieren.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}