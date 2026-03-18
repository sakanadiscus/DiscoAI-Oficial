import { stripe } from "@zoerai/integration";
import { supabaseAdmin } from "@/integrations/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: "User ID requerido" }, { status: 400 });
    }

    // Get user's Stripe customer ID
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return Response.json({ error: "No hay suscripción activa" }, { status: 400 });
    }

    // Create customer portal session
    const result = await stripe.createPortalSession({
      stripeKey: process.env.STRIPE_SECRET_KEY!,
      request: {
        customer: profile.stripe_customer_id,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/home/premium`,
      },
    });

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json({ url: result.data?.url });
  } catch (error) {
    console.error("Stripe portal error:", error);
    return Response.json({ error: "Error al crear portal" }, { status: 500 });
  }
}
