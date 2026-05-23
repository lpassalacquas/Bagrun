import Stripe from "stripe";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendSMS(body) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "3058770025@txt.att.net",
      subject: "",
      text: body,
    });
  } catch (e) {
    console.error("SMS failed:", e.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, paymentMethodId, amount, jobId, customerName, apt, bags, date, total } = req.body;

  if (action === "new_booking") {
    await sendSMS(`New BagRun booking!\nName: ${customerName}\nApt: ${apt}\nBags: ${bags}\nDate: ${date}\nTotal: $${total}\nJob ID: ${jobId}`);
    return res.status(200).json({ success: true });
  }

  if (action === "job_complete") {
    await sendSMS(`Job complete!\nName: ${customerName}\nApt: ${apt}\nBags: ${bags}\nJob ID: ${jobId}\nCharging card now...`);
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      description: `BagRun pickup · ${jobId} · ${customerName}`,
    });

    await sendSMS(`Payment received!\nName: ${customerName}\nApt: ${apt}\nAmount: $${total}\nJob ID: ${jobId}`);

    res.status(200).json({ success: true, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(200).json({ success: false, error: err.message });
  }
}
