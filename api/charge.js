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

async function sheetsRequest(data) {
  const res = await fetch(process.env.GOOGLE_SHEETS_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

async function sheetsGet() {
  const res = await fetch(process.env.GOOGLE_SHEETS_URL);
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const body = req.body;
  const { action } = body;

  if (action === "sheets_get") {
    const data = await sheetsGet();
    return res.status(200).json(data);
  }

  if (action === "sheets_create") {
    const { action: _, ...jobData } = body;
    const data = await sheetsRequest({ action: "create", ...jobData });
    return res.status(200).json(data);
  }

  if (action === "sheets_update") {
    const { action: _, ...updateData } = body;
    const data = await sheetsRequest({ action: "update", ...updateData });
    return res.status(200).json(data);
  }

  if (action === "sheets_delete") {
    const { action: _, ...deleteData } = body;
    const data = await sheetsRequest({ action: "delete", ...deleteData });
    return res.status(200).json(data);
  }

  if (action === "new_booking") {
    const { customerName, apt, bags, date, total, jobId } = body;
    await sendSMS(`New BagRun booking!\nName: ${customerName}\nApt: ${apt}\nBags: ${bags}\nDate: ${date}\nTotal: $${total}\nJob ID: ${jobId}`);
    return res.status(200).json({ success: true });
  }

  if (action === "job_complete") {
    const { customerName, apt, bags, jobId, paymentMethodId, amount, total } = body;
    await sendSMS(`Job complete!\nName: ${customerName}\nApt: ${apt}\nBags: ${bags}\nJob ID: ${jobId}\nCharging card now...`);

    if (paymentMethodId && amount) {
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
        return res.status(200).json({ success: true, paymentIntentId: paymentIntent.id });
      } catch (err) {
        return res.status(200).json({ success: false, error: err.message });
      }
    }
    return res.status(200).json({ success: true });
  }

  return res.status(200).json({ success: false, error: "Unknown action" });
}
