// src/app/api/billing/create-checkout-session/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { isBetaActive } from '@/lib/subscription'; // Unser neuer Helper
import { Profile } from '@/contexts/ProfileContext'; // Unser Typ

// Stripe-Client initialisieren
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover', // Du kannst hier auch eine neuere Version verwenden
});

export async function POST() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Profil holen, um Stripe-ID und Beta-Status zu prüfen
  const { data: profile } = await supabase
    .from('profiles')
    .select('*') // Holen wir alles, um es an isBetaActive zu übergeben
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Wenn Nutzer noch aktive Beta hat, blockieren wir den Checkout (noch).
  // Später kannst du das in ein "Upgrade" ändern.
  if (isBetaActive(profile as Profile)) {
     return NextResponse.json({ error: 'Beta user cannot create session yet.' }, { status: 403 });
  }

  const customerId = profile.stripe_customer_id;
  const priceId = process.env.STRIPE_MEISTER_PRICE_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (!priceId || !siteUrl) {
      console.error("Stripe Price ID or Site URL is not configured.");
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      // Wenn wir schon eine customerId haben, nutzen wir sie.
      // Wenn nicht (erster Kauf), wird Stripe einen neuen Kunden anlegen.
      customer: customerId || undefined, 
      // WICHTIG: Sende die user.id mit, damit wir sie im Webhook wiederfinden!
      client_reference_id: user.id, 
      // Sende die E-Mail, wenn wir keinen Kunden erstellen
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Meta-Daten, um den User im Webhook zuzuordnen (falls client_reference_id fehlt)
      metadata: {
        userId: user.id,
      },
      // WICHTIG: Nutze die SITE_URL aus deinem .env
      success_url: `${siteUrl}/dashboard?billing=success`,
      cancel_url: `${siteUrl}/dashboard/einstellungen?billing=cancel`, // Zurück zu den Einstellungen
    });

    return NextResponse.json({ url: session.url });

  } catch (e: any) {
    console.error("Error creating Stripe session:", e.message);
    return NextResponse.json({ error: `Stripe error: ${e.message}` }, { status: 500 });
  }
}