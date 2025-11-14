// src/app/api/stripe/webhook/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// WICHTIG: Wir nutzen den Service Role Key, da dieser Request von Stripe kommt (kein User-Cookie)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover', // Muss mit deiner Version übereinstimmen
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  // 1. Signatur verifizieren (Sicherheit)
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.warn(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 2. Event verarbeiten
  try {
    switch (event.type) {
      // Dieser Event kommt, wenn der Nutzer den Checkout erfolgreich abschließt
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Die User-ID, die wir in create-checkout-session gesetzt haben
        const userId = session.client_reference_id; 
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) {
          throw new Error('Missing client_reference_id (userId) in checkout session.');
        }

        console.log(`Checkout complete for user ${userId}. Updating profile...`);

        // 3. Supabase DB aktualisieren
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active', // <--- WICHTIG!
          })
          .eq('id', userId);

        if (error) {
          throw new Error(`Supabase DB update failed: ${error.message}`);
        }
        
        console.log(`User ${userId} successfully updated to active subscription.`);
        break;
      }

      // TODO: Handle andere Events (Kündigungen, Fehlschläge)
      case 'customer.subscription.deleted': {
        // ... (Logik, um `subscription_status` auf 'canceled' zu setzen) ...
        break;
      }
      case 'customer.subscription.updated': {
         // ... (Logik, um Status-Änderungen zu verarbeiten) ...
        break;
      }

      default:
        // console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error("Error processing webhook:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  // 4. Stripe bestätigen, dass wir es erhalten haben
  return NextResponse.json({ received: true });
}