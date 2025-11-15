// src/app/api/request-testimonial/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js"; // Import des Admin-Clients
import { Resend } from "resend";
import { v4 as uuidv4 } from "uuid";
import { resolveIndustry, type Industry } from "@/lib/industry-templates"; // Import von resolveIndustry und Industry

// Resend-Client initialisieren
const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev"; // Fallback

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  // 1. Benutzer authentifizieren
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  // 2. Request-Daten extrahieren
  let requestData;
  try {
    requestData = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const { customerName, customerEmail, projectName } = requestData;
  if (!customerName || !customerEmail || !projectName) {
    return NextResponse.json(
      {
        error:
          "Fehlende Felder: customerName, customerEmail und projectName sind erforderlich",
      },
      { status: 400 },
    );
  }

  // --- 3. NEU: Profil des Nutzers holen (mit Admin-Client) ---
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let businessName = "unserem Betrieb"; // Standard-Fallback
  let industry: Industry = "sonstiges"; // Standard-Fallback

  try {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("business_name, industry")
      .eq("id", user.id)
      .single();

    if (profile) {
      businessName = profile.business_name || businessName;
      industry = resolveIndustry(profile.industry);
    }
  } catch (profileError) {
    console.warn(
      `Konnte Profil für User ${user.id} nicht laden:`,
      profileError,
    );
    // Wir fahren mit den Standardwerten fort
  }
  // --- ENDE NEU ---

  // 4. Eindeutigen Token erstellen und in DB speichern
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Tage gültig

  const { error: insertError } = await supabase
    .from("testimonial_requests")
    .insert({
      id: token,
      profile_id: user.id,
      customer_name: customerName,
      customer_email: customerEmail,
      project_name: projectName,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    });

  if (insertError) {
    console.error(
      "Fehler beim Speichern der Testimonial-Anfrage:",
      insertError,
    );
    return NextResponse.json(
      { error: `Datenbankfehler: ${insertError.message}` },
      { status: 500 },
    );
  }

  // 5. URL für die Bewertungsseite erstellen
  const reviewUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/review/${token}`;

  // --- 6. NEU: Branchenspezifische E-Mail-Inhalte ---
  const emailSubject = `Wie zufrieden waren Sie mit ${businessName}?`;
  let emailHtmlBody = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h1 style="color: #333;">Bewerten Sie unsere Arbeit</h1>
      <p>Hallo ${customerName},</p>
      <p>wir würden uns sehr freuen, wenn Sie sich einen Moment Zeit nehmen, um unsere Arbeit für das Projekt <strong>${projectName}</strong> zu bewerten.</p>
  `;

  // Branchen-spezifische Anpassung
  if (industry === "elektriker") {
    emailHtmlBody += `
      <p>Wir möchten uns stetig verbessern und Ihr Feedback ist uns besonders wichtig.</p>
      <p>Vielleicht können Sie kurz erwähnen, wie zufrieden Sie mit der <strong>Sicherheit, Sauberkeit</strong> und der <strong>technischen Beratung</strong> waren?</p>
    `;
  } else if (industry === "maler") {
    emailHtmlBody += `
      <p>Wir möchten uns stetig verbessern und Ihr Feedback ist uns besonders wichtig.</p>
      <p>Wie zufrieden waren Sie mit der <strong>Sauberkeit</strong>, der <strong>Pünktlichkeit</strong> und der <strong>Farbberatung</strong>?</p>
    `;
  } else if (industry === "tischler") {
    emailHtmlBody += `
      <p>Wir möchten uns stetig verbessern und Ihr Feedback ist uns besonders wichtig.</p>
      <p>Hat Ihnen die <strong>Maßanfertigung</strong> gefallen und wie bewerten Sie die <strong>Passgenauigkeit</strong> und die <strong>Materialqualität</strong>?</p>
    `;
  } else {
    // Standard-Aufforderung
    emailHtmlBody += `
      <p>Ihr Feedback hilft uns und anderen Kunden, unsere Arbeit besser einzuschätzen.</p>
    `;
  }

  emailHtmlBody += `
      <p style="margin-top: 25px;">Klicken Sie einfach auf den folgenden Link, um Ihre Bewertung abzugeben:</p>
      <a href="${reviewUrl}" style="display: inline-block; padding: 12px 20px; background-color: #F97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Jetzt Bewertung abgeben
      </a>
      <p style="margin-top: 25px;">Vielen Dank für Ihr Vertrauen!</p>
      <p>Ihr Team von ${businessName}</p>
    </div>
  `;
  // --- ENDE NEU ---

  // 7. E-Mail mit Resend senden
  try {
    await resend.emails.send({
      from: fromEmail,
      to: customerEmail,
      subject: emailSubject, // <-- Dynamisch
      html: emailHtmlBody, // <-- Dynamisch
    });

    return NextResponse.json({
      success: true,
      message: "Anfrage erfolgreich gesendet",
    });
  } catch (emailError: any) {
    console.error("Fehler beim Senden der E-Mail:", emailError);

    // Rollback: Wenn E-Mail fehlschlägt, Token-Eintrag löschen
    await supabase.from("testimonial_requests").delete().eq("id", token);

    return NextResponse.json(
      { error: `E-Mail konnte nicht gesendet werden: ${emailError.message}` },
      { status: 500 },
    );
  }
}
