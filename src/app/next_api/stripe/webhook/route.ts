import { stripe } from "@zoerai/integration";
import { supabaseAdmin } from "@/integrations/supabase/server";

export async function POST(req: Request) {
  try {
    const signature = req.headers.get("stripe-signature");
    const payload = await req.text();

    if (!signature) {
      return new Response("No signature", { status: 400 });
    }

    const verifyResult = await stripe.verifyWebhook({
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      request: {
        payload,
        signature,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      },
    });

    if (!verifyResult.success) {
      console.error("Webhook verification failed:", verifyResult.error);
      return new Response("Webhook verification failed", { status: 400 });
    }

    const event = verifyResult.data;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const customerId = session.customer as string;

        if (userId) {
          // Update user to premium
          await supabaseAdmin
            .from("profiles")
            .update({
              plan: "premium",
              creditos_salud: 999,
              stripe_customer_id: customerId,
            })
            .eq("id", userId);

          // Create subscription record
          await supabaseAdmin.from("subscriptions").insert({
            user_id: userId,
            tipo: plan === "annual" ? "anual" : "mensual",
            estado: "active",
            fecha_inicio: new Date().toISOString(),
            fecha_fin: plan === "annual"
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            stripe_subscription_id: session.subscription as string,
          });

          console.log(`✅ User ${userId} upgraded to premium (${plan})`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Find user by customer ID and update
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          if (subscription.status === "active") {
            await supabaseAdmin
              .from("profiles")
              .update({ plan: "premium" })
              .eq("id", profile.id);
          } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
            await supabaseAdmin
              .from("profiles")
              .update({ plan: "free", creditos_salud: 0 })
              .eq("id", profile.id);

            await supabaseAdmin
              .from("subscriptions")
              .update({ estado: "canceled" })
              .eq("stripe_subscription_id", subscription.id);
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        // Downgrade user to free
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          await supabaseAdmin
            .from("profiles")
            .update({ plan: "free", creditos_salud: 0 })
            .eq("id", profile.id);

          await supabaseAdmin
            .from("subscriptions")
            .update({ estado: "canceled" })
            .eq("stripe_subscription_id", subscription.id);

          console.log(`✅ User ${profile.id} downgraded to free (subscription cancelled)`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        // Notify user of failed payment
        console.log(`⚠️ Payment failed for customer ${customerId}`);
        break;
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook handler failed", { status: 500 });
  }
}
