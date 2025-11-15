// src/app/api/analyze-image/route.ts
import { NextResponse, NextRequest } from "next/server";
import OpenAI from "openai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js"; // Admin-Client
import { resolveIndustry } from "@/lib/industry-templates";
import { getAnalyzeImagePrompt } from "@/lib/ai-prompts"; // <-- NEUER IMPORT

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 1. Nutzer authentifizieren
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    // --- 2. NEU: Profil des Nutzers holen, um Branche zu kennen ---
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("industry")
      .eq("id", user.id)
      .single();

    const industry = resolveIndustry(profile?.industry);
    // --- ENDE NEU ---

    // 3. Bilddaten verarbeiten (dein Code ist schon sehr gut)
    const body = await req.json();
    const { imageUrl, imageData, mimeType } = body;
    let imageUrlToSend: string;

    if (imageData && mimeType) {
      // Pfad 1: Base64-Daten
      imageUrlToSend = `data:${mimeType};base64,${imageData}`;
    } else if (imageUrl) {
      // Pfad 2: Von URL zu Base64 (wichtig für GPT-4o)
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok)
        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
      if (!imageResponse.body) throw new Error("Image response has no body.");

      const imageMimeType =
        imageResponse.headers.get("Content-Type") || "image/jpeg";
      const imageArrayBuffer = await imageResponse.arrayBuffer();
      const base64String = Buffer.from(imageArrayBuffer).toString("base64");
      imageUrlToSend = `data:${imageMimeType};base64,${base64String}`;
    } else {
      return NextResponse.json(
        { error: "imageUrl or imageData is required" },
        { status: 400 },
      );
    }

    // --- 4. NEU: Dynamischen Prompt holen ---
    const systemPrompt = getAnalyzeImagePrompt(industry);
    // ---

    // 5. OpenAI anrufen
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system", // <-- WICHTIG: Als System-Prompt
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analysiere dieses Bild gemäß deiner Anweisungen.",
            },
            {
              type: "image_url",
              image_url: { url: imageUrlToSend },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const description = aiResponse.choices[0].message?.content;
    return NextResponse.json({ description });
    // KORREKTUR: 'any' zu 'unknown' geändert und Typprüfung
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error in AI image analysis:", message);
    return NextResponse.json(
      { error: `Fehler bei der AI-Generierung: ${message}` },
      { status: 500 },
    );
  }
}