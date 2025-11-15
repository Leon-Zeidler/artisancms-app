// src/app/api/billing/create-checkout-session/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { isBetaActive } from "@/lib/subscription";
import type { Profile, PlanId } from "@/contexts/ProfileContext";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Map unserer internen Namen zu den Stripe Preis-IDs
const PLAN_ID_TO_PRICE_ID: Record<PlanId, string | undefined> = {
  geselle: process.env.STRIPE_GESELLE_PRICE_ID,
  meister: process.env.STRIPE_MEISTER_PRICE_ID,
  betrieb: process.env.STRIPE_BETRIEB_PRICE_ID,
};

export async function POST(request: Request) {
  // Request-Objekt hinzufügen
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  if (!stripeSecretKey) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured" },
      { status: 500 },
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2025-10-29.clover", // Sicherstellen, dass diese Version aktuell ist
  });

  // --- NEU: planId aus dem Request-Body lesen ---
  let planId: PlanId;
  try {
    const { planId: requestedPlan } = await request.json();
    if (!requestedPlan || !PLAN_ID_TO_PRICE_ID[requestedPlan as PlanId]) {
      throw new Error("Invalid planId provided.");
    }
    planId = requestedPlan as PlanId;
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid request body or planId." },
      { status: 400 },
    );
  }
  // --- ENDE NEU ---

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (isBetaActive(profile as Profile)) {
    return NextResponse.json(
      { error: "Beta user cannot create session yet." },
      { status: 403 },
    );
  }

  const customerId = profile.stripe_customer_id;
  const priceId = PLAN_ID_TO_PRICE_ID[planId]; // Den korrekten Preis holen
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!priceId || !siteUrl) {
    console.error("Stripe Price ID or Site URL is not configured.");
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId || undefined,
      client_reference_id: user.id,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId, // <-- Dynamische Preis-ID
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        planId: planId, // <--- NEU: Dem Webhook den Plan-Namen mitteilen
      },
      success_url: `${siteUrl}/dashboard/abo?billing=success`, // Zur Abo-Seite leiten
      cancel_url: `${siteUrl}/dashboard/abo?billing=cancel`, // Zur Abo-Seite leiten
    });

    return NextResponse.json({ url: session.url });
    // KORREKTUR: 'any' zu 'unknown' geändert und Typprüfung
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("Error creating Stripe session:", message);
    return NextResponse.json(
      { error: `Stripe error: ${message}` },
      { status: 500 },
    );
  }
}
// --- ENDE DATEI ---//