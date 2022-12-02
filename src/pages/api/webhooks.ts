import { NextApiRequest, NextApiResponse } from "next"
import { stripe } from "src/services/stripe"
import { Readable } from "stream"
import Stripe from "stripe"
import { saveSubscription } from "./_lib/manageSubscription"


async function buffer(readable: Readable) {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }

  return Buffer.concat(chunks)

}

// by default Next see all the request coming as json,
// So is necessary export config setting bodyParser as false to work with stream
export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted',

])

export default async function webhooks(req: NextApiRequest, res: NextApiResponse){

  if(req.method === 'POST') {
    const buf = await buffer(req)
    const secret = req.headers['stripe-signature'] as string

    let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err}`);
  }

  const { type } = event

  if (relevantEvents.has(type)) {
    try {
      switch (type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object as Stripe.Subscription

          await saveSubscription(
            subscription.id,
            subscription.customer?.toString()!,
            false,
          )

          break

        case 'checkout.session.completed':
          const checkoutSession = event.data.object as Stripe.Checkout.Session

          await saveSubscription(
            checkoutSession.subscription?.toString()!,
            checkoutSession.customer?.toString()!,
            true
          )

          break
        // ... handle other event types
        default:
          throw new Error(`Unhandled event type ${type}`);
      }
    } catch (error) {
      return res.json({ erro: 'Webhook handler failed' })
    }
  }

    res.json({ok: true})
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }

}
