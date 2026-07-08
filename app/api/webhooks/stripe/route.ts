import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Effect } from "effect";
import { runtime } from "@/app/server/runtime";
import { CheckoutService } from "@/app/server/features/checkout/checkout.service";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!secret || !stripeKey) {
    return NextResponse.json(
      { error: "Stripe webhooks are not configured" },
      { status: 501 },
    );
  }

  const stripe = new Stripe(stripeKey);
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Invalid webhook signature",
      },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await runtime.runPromise(
      Effect.gen(function* () {
        const checkout = yield* CheckoutService;
        return yield* checkout.fulfillStripeSession(session.id);
      }).pipe(Effect.catchAll(() => Effect.void)),
    );
  }

  return NextResponse.json({ received: true });
}
