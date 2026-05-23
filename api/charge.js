import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { paymentMethodId, amount, jobId, customerName } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      description: `BagRun pickup · ${jobId} · ${customerName}`,
    });

    res.status(200).json({ success: true, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
}
