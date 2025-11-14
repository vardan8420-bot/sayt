import Stripe from 'stripe'

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      // Используем версию по умолчанию Stripe для максимальной совместимости
      typescript: true,
    })
  : null

export async function createPaymentIntent(amount: number, currency: string = 'usd') {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}

