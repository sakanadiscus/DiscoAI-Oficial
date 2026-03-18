import { stripe } from "@zoerai/integration";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan, userId, email } = body;

    // Plan prices in cents
    const plans = {
      monthly: {
        priceId: "price_monthly", // You'll replace with real Stripe price ID
        amount: 499, // $4.99
        name: "DiscoAI Premium Mensual",
      },
      annual: {
        priceId: "price_annual", // You'll replace with real Stripe price ID
        amount: 3999, // $39.99
        name: "DiscoAI Premium Anual",
      },
    };

    const selectedPlan = plans[plan as keyof typeof plans];
    if (!selectedPlan) {
      return Response.json({ error: "Plan inválido" }, { status: 400 });
    }

    // Create Stripe Checkout Session for subscription
    const result = await stripe.createCheckoutSession({
      stripeKey: process.env.STRIPE_SECRET_KEY!,
      request: {
        mode: "subscription",
        lineItems: [
          {
            priceData: {
              currency: "usd",
              unitAmount: selectedPlan.amount,
              productData: {
                name: selectedPlan.name,
                description: "DiscoAI Premium - Análisis ilimitados + Módulo reproducción",
              },
              recurring: {
                interval: plan === "monthly" ? "month" : "year",
              },
            },
            quantity: 1,
          },
        ],
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/home/premium?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/home/premium?canceled=true`,
        customerEmail: email,
        metadata: {
          userId: userId,
          plan: plan,
        },
      },
    });

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    return Response.json({ url: result.data?.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json({ error: "Error al crear checkout" }, { status: 500 });
  }
}
