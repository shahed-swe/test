import { db } from "db";
import { stripePaymentDetails, users } from "db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRETKEY!, {
  apiVersion: "2023-10-16",
  typescript: true,
})

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("Stripe-Signature") as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRETKEY!,
    );
  } catch (error: any) {
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Retrieve the subscription details from Stripe.
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    // Update the user stripe into in our database.
    // Since this is the initial subscription, we need to update
    // the subscription id and customer id.
    await db.insert(stripePaymentDetails).values({
      userId: subscription?.metadata?.userId,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: subscription.items.data[0].price.id,
      stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    await db
      .update(users)
      .set({ subscriptionActive: true })
      .where(eq(users.userId, subscription?.metadata?.userId))

    return new Response(null, { status: 200 });
  }

  if (event.type === "customer.subscription.deleted") {
    const session = event.data.object as Stripe.Subscription;
    // TODO: Handle deletion if canceled or deleted
    return new Response(null, { status: 200 });
  }

  if (event.type === "invoice.payment_succeeded") {
    const session = event.data.object as Stripe.Invoice;

    // If the billing reason is not subscription_create, it means the customer has updated their subscription.
    // If it is subscription_create, we don't need to update the subscription id and it will handle by the checkout.session.completed event.
    if (session.billing_reason != "subscription_create") {
      // Retrieve the subscription details from Stripe.
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );

      // Update the price id and set the new period end.
      await db
        .update(stripePaymentDetails)
        .set({
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        })
        .where(eq(stripePaymentDetails.stripeSubscriptionId, subscription.id));

      return new Response(null, { status: 200 });
    }
  }

  return new Response(null, { status: 200 });
}
