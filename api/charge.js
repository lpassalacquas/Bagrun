import Stripe from "stripe";
import twilio from "twilio";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendSMS(body) {
  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.MY_PHONE_NUMBER,
    });
  } catch (e) {
    console.error("SMS failed:", e.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, paymentMethodId, amount, jobId, customerName, apt, bags, date, total } = req.body;

  // New booking notification
  if (action === "new_booking") {
    await sendSMS(
      `🗑 New BagRun booking!\nName: ${customerName}\nApt: ${apt}\nBags: ${bags}\nDate: ${date}\nTotal: $${total}\nJob ID: ${jobId}`
    );
    return res.status(200).json({ success: true });
  }

  // Job complete notification
  if (action === "job_complete") {
    await sendSMS(
      `✅ Job complete!\nName: ${customerName}\nApt: ${apt}\nBags: ${bags}\nJob ID: ${jobId}\nPhotos uploaded. Charging card...`
    );
  }

  // Stripe charge
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      description: `BagRun pickup · ${jobId} · ${customerName}`,
    });

    // Payment success notification
    await sendSMS(
      `💳 Payment received!\nName: ${customerName}\nApt: ${apt}\nAmount: $${total}\nJob ID: ${jobId}`
    );

    res.status(200).json({ success: true, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
}
