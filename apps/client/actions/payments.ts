'use server'

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRETKEY!, {
  apiVersion: "2023-10-16",
  typescript: true
});

export const createSubscription = async (priceId: string, userId?: string) => {
  if (!userId) return

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId: userId,
        },
      },
      success_url: `${process.env.NEXTAUTH_URL}/`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?status=400`,
    });

    return { url: session.url }
  } catch (error) {
    console.error(error);
  }
}