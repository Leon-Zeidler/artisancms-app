// src/app/api/stripe/webhook/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import type { PlanId } from "@/contexts/ProfileContext"; // Typ importieren

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const PRICE_ID_TO_PLAN: Record<string, PlanId> = {};
const pricePlanPairs: Array<[string | undefined, PlanId]> = [
  [process.env.STRIPE_GESELLE_PRICE_ID, "geselle"],
  [process.env.STRIPE_MEISTER_PRICE_ID, "meister"],
  [process.env.STRIPE_BETRIEB_PRICE_ID, "betrieb"],
];
for (const [priceId, plan] of pricePlanPairs) {
  if (priceId) {
    PRICE_ID_TO_PLAN[priceId] = plan;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.warn(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // --- NEU: PlanId aus Metadaten holen ---
        const planId = session.metadata?.planId as PlanId | undefined;

        if (!userId) {
          throw new Error(
            "Missing client_reference_id (userId) in checkout session.",
          );
        }
        if (!planId) {
          throw new Error("Missing planId in checkout session metadata.");
        }

        console.log(
          `Checkout complete for user ${userId}. Plan: ${planId}. Updating profile...`,
        );

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            subscription_status: "active",
            plan_id: planId, // <--- HIER IST DIE WICHTIGE ÄNDERUNG
          })
          .eq("id", userId);

        if (error) {
          throw new Error(`Supabase DB update failed: ${error.message}`);
        }

        console.log(
          `User ${userId} successfully updated to active '${planId}' subscription.`,
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(
          `Subscription ${subscription.id} deleted. Updating profile...`,
        );

        // Finde den Nutzer über die Subscription-ID
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({
            subscription_status: "canceled",
            plan_id: null, // Oder auf 'geselle' zurücksetzen
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          throw new Error(
            `Supabase DB update for deleted subscription failed: ${error.message}`,
          );
        }
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const priceId = subscription.items.data[0]?.price?.id;
        const planId = priceId ? (PRICE_ID_TO_PLAN[priceId] ?? null) : null;
        const updateData: {
          subscription_status: string;
          plan_id?: PlanId | null;
        } = {
          subscription_status: status,
        };
        if (planId) {
          updateData.plan_id = planId;
        }

        console.log(
          `Subscription ${subscription.id} updated. Status: ${status}${planId ? `, Plan: ${planId}` : ""}`,
        );

        const { error } = await supabaseAdmin
          .from("profiles")
          .update(updateData)
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          throw new Error(
            `Supabase DB update for subscription update failed: ${error.message}`,
          );
        }
        break;
      }
    }
  } catch (err: any) {
    console.error("Error processing webhook:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
// --- ENDE DATEI ---//
