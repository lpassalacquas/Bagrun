import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PRICE_PER_BAG = 0.50;
const ZELLE = { name: "Zelle", handle: "3058770025" };
const CASHAPP = { name: "Cash App", handle: "$05LPS" };
const VENMO = { name: "Venmo", handle: "@Luca-Passalacqua" };
const ADMIN_PIN = "2005";

const STATUS_COLORS = {
  pending: { bg: "#FEF3C7", text: "#92400E", label: "Pending" },
  scheduled: { bg: "#DBEAFE", text: "#1E40AF", label: "Scheduled" },
  complete: { bg: "#D1FAE5", text: "#065F46", label: "Complete" },
  paid: { bg: "#FFEDD5", text: "#9A3412", label: "Paid" },
};

function generateId() {
  return "JOB-" + Math.random().toString(36).substr(2, 6).toUpperCase();
}

const fonts = `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700;800&display=swap');`;

const styles = `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Syne', sans-serif; background: #0C0C0C; color: #F0EDE8; min-height: 100vh; }
.nav { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid #1E1E1E; }
.nav-logo { font-size: 13px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #FF8C00; font-family: 'DM Mono', monospace; }
.nav-tabs { display: flex; gap: 4px; background: #161616; border-radius: 8px; padding: 3px; }
.nav-tab { padding: 6px 14px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; font-family: 'Syne', sans-serif; letter-spacing: 0.05em; transition: all 0.15s; background: transparent; color: #666; }
.nav-tab.active { background: #FF8C00; color: #0C0C0C; }
.form-page { max-width: 500px; margin: 0 auto; padding: 2.5rem 1.5rem; }
.form-hero { margin-bottom: 2.5rem; }
.form-hero h1 { font-size: 2rem; font-weight: 800; line-height: 1.1; margin-bottom: 0.5rem; }
.form-hero h1 span { color: #FF8C00; }
.form-hero p { font-size: 13px; color: #888; line-height: 1.6; font-family: 'DM Mono', monospace; }
.form-card { background: #141414; border: 1px solid #222; border-radius: 16px; padding: 1.75rem; }
.form-section-label { font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #555; font-family: 'DM Mono', monospace; margin-bottom: 1rem; }
.form-group { margin-bottom: 1rem; }
.form-label { display: block; font-size: 12px; color: #999; margin-bottom: 5px; font-family: 'DM Mono', monospace; }
.form-input { width: 100%; background: #0C0C0C; border: 1px solid #2A2A2A; border-radius: 8px; padding: 10px 12px; color: #F0EDE8; font-size: 14px; font-family: 'Syne', sans-serif; outline: none; transition: border-color 0.15s; }
.form-input:focus { border-color: #FF8C00; }
.form-input::placeholder { color: #444; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.card-block { background: #0C0C0C; border: 1px solid #2A2A2A; border-radius: 8px; padding: 12px; margin-bottom: 1rem; }
.divider { border: none; border-top: 1px solid #1E1E1E; margin: 1.25rem 0; }
.price-preview { background: #0C0C0C; border-radius: 8px; padding: 12px 14px;
