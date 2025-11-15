// src/app/api/upload-logo/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Nutzer authentifizieren
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // 2. Datei aus FormData holen
  let file: File;
  let formData: FormData;
  try {
    formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!fileEntry || typeof fileEntry === "string") {
      throw new Error("Keine Datei gefunden.");
    }
    file = fileEntry as File;
  } catch (error: any) {
    return NextResponse.json({ error: `Ungültige Anfrage: ${error.message}` }, { status: 400 });
  }
  
  // 3. Dateiendung und Pfad generieren
  const fileExtension = file.name.split(".").pop();
  const safeFileName = `${uuidv4()}.${fileExtension}`;
  const storagePath = `${user.id}/${safeFileName}`;

  // 4. Datei in Supabase Storage hochladen (im 'logos' Bucket)
  const { error: uploadError } = await supabase.storage
    .from("logos") // WICHTIG: Dieser Bucket muss in Supabase existieren!
    .upload(storagePath, file, {
      cacheControl: "3600",
      upsert: true, // Ersetzt ggf. alte Logos im Pfad (obwohl wir UUID nutzen)
    });

  if (uploadError) {
    console.error("Supabase Storage Fehler:", uploadError);
    return NextResponse.json({ error: `Storage-Fehler: ${uploadError.message}` }, { status: 500 });
  }

  // 5. Öffentliche URL der hochgeladenen Datei holen
  const { data: publicUrlData } = supabase.storage
    .from("logos")
    .getPublicUrl(storagePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
     return NextResponse.json({ error: "Konnte öffentliche URL nicht abrufen." }, { status: 500 });
  }

  // 6. URL an Client zurückgeben
  return NextResponse.json({ publicUrl: publicUrlData.publicUrl });
}