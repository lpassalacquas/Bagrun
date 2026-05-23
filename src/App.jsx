import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PRICE_PER_BAG = 1.00;
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
.price-preview { background: #0C0C0C; border-radius: 8px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border: 1px solid #1E1E1E; }
.price-label { font-size: 12px; color: #666; font-family: 'DM Mono', monospace; }
.price-amount { font-size: 18px; font-weight: 700; color: #FF8C00; font-family: 'DM Mono', monospace; }
.submit-btn { width: 100%; padding: 13px; background: #FF8C00; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; color: #0C0C0C; font-family: 'Syne', sans-serif; cursor: pointer; letter-spacing: 0.05em; transition: all 0.15s; }
.submit-btn:hover { background: #FFA533; transform: translateY(-1px); }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.secure-note { text-align: center; font-size: 11px; color: #444; font-family: 'DM Mono', monospace; margin-top: 10px; }
.success-page { max-width: 460px; margin: 4rem auto; padding: 0 1.5rem; text-align: center; }
.success-icon { font-size: 3rem; margin-bottom: 1rem; }
.success-page h2 { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }
.success-page p { color: #888; font-family: 'DM Mono', monospace; font-size: 13px; line-height: 1.6; }
.job-id { display: inline-block; background: #141414; border: 1px solid #FF8C00; color: #FF8C00; font-family: 'DM Mono', monospace; font-size: 13px; padding: 6px 14px; border-radius: 6px; margin: 1.25rem 0; }
.back-btn { background: transparent; border: 1px solid #333; color: #888; padding: 10px 20px; border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 13px; cursor: pointer; margin-top: 1rem; }
.admin-page { padding: 1.5rem; }
.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.admin-title { font-size: 1.25rem; font-weight: 800; }
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 1.5rem; }
.stat-card { background: #141414; border: 1px solid #1E1E1E; border-radius: 12px; padding: 1rem; }
.stat-val { font-size: 1.5rem; font-weight: 800; color: #FF8C00; font-family: 'DM Mono', monospace; }
.stat-label { font-size: 11px; color: #555; font-family: 'DM Mono', monospace; margin-top: 2px; }
.add-job-btn { background: #FF8C00; border: none; border-radius: 8px; color: #0C0C0C; font-size: 12px; font-weight: 700; font-family: 'Syne', sans-serif; padding: 8px 16px; cursor: pointer; letter-spacing: 0.05em; }
.jobs-list { display: flex; flex-direction: column; gap: 10px; }
.job-card { background: #141414; border: 1px solid #1E1E1E; border-radius: 12px; padding: 1.25rem; }
.job-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; flex-wrap: wrap; }
.job-name { font-size: 15px; font-weight: 700; }
.job-addr { font-size: 12px; color: #666; font-family: 'DM Mono', monospace; margin-top: 2px; }
.status-badge { font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.08em; text-transform: uppercase; white-space: nowrap; }
.job-meta { display: flex; gap: 16px; margin-top: 10px; flex-wrap: wrap; }
.job-meta-item { font-size: 11px; font-family: 'DM Mono', monospace; color: #666; }
.job-meta-item span { color: #F0EDE8; font-weight: 500; }
.job-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.action-btn { font-size: 12px; font-weight: 600; font-family: 'Syne', sans-serif; padding: 7px 14px; border-radius: 7px; cursor: pointer; border: 1px solid #2A2A2A; background: #0C0C0C; color: #F0EDE8; transition: all 0.15s; }
.action-btn.primary { background: #FF8C00; border-color: #FF8C00; color: #0C0C0C; }
.action-btn.danger { border-color: #7F1D1D; color: #FCA5A5; }
.action-btn.zelle { border-color: #6D28D9; color: #C4B5FD; }
.photos-row { display: flex; gap: 8px; margin-top: 10px; }
.photo-thumb { width: 60px; height: 60px; border-radius: 6px; object-fit: cover; border: 1px solid #2A2A2A; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
.modal { background: #141414; border: 1px solid #2A2A2A; border-radius: 16px; padding: 1.75rem; width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto; }
.modal h3 { font-size: 1.1rem; font-weight: 800; margin-bottom: 1.25rem; }
.modal-actions { display: flex; gap: 8px; margin-top: 1.25rem; justify-content: flex-end; }
.cancel-btn { background: transparent; border: 1px solid #2A2A2A; color: #888; padding: 9px 18px; border-radius: 8px; font-family: 'Syne', sans-serif; font-size: 13px; cursor: pointer; }
.photo-upload-area { border: 1px dashed #2A2A2A; border-radius: 8px; padding: 1.5rem; text-align: center; cursor: pointer; margin-bottom: 10px; }
.photo-upload-area p { font-size: 12px; color: #555; font-family: 'DM Mono', monospace; }
.upload-preview { width: 100%; max-height: 140px; border-radius: 8px; object-fit: cover; margin-top: 8px; }
.pin-page { max-width: 320px; margin: 6rem auto; padding: 0 1.5rem; text-align: center; }
.pin-page h2 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.5rem; }
.pin-page p { color: #666; font-size: 13px; font-family: 'DM Mono', monospace; margin-bottom: 1.5rem; }
.pin-input { width: 100%; background: #141414; border: 1px solid #2A2A2A; border-radius: 10px; padding: 12px; color: #F0EDE8; font-size: 1.5rem; text-align: center; font-family: 'DM Mono', monospace; outline: none; letter-spacing: 0.4em; }
.pin-input:focus { border-color: #FF8C00; }
.pin-error { color: #F87171; font-size: 12px; font-family: 'DM Mono', monospace; margin-top: 8px; }
.error-msg { color: #F87171; font-size: 12px; font-family: 'DM Mono', monospace; margin-top: 8px; text-align: center; }
`;

const CARD_STYLE = {
  style: {
    base: {
      color: "#F0EDE8",
      fontFamily: "DM Mono, monospace",
      fontSize: "14px",
      "::placeholder": { color: "#444" },
    },
    invalid: { color: "#F87171" },
  },
};

function CheckoutForm({ job, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);
    try {
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
        billing_details: { name: job.name },
      });
      if (pmError) { setError(pmError.message); setLoading(false); return; }
      onSuccess(paymentMethod.id);
    } catch (e) {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <p style={{ fontSize: 12, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: "1rem" }}>
        Card saved now · charged ${job.total.toFixed(2)} after pickup is confirmed with photos
      </p>
      <div className="card-block">
        <CardElement options={CARD_STYLE} />
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div className="modal-actions">
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        <button className="submit-btn" style={{ width: "auto", padding: "9px 20px" }} onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Confirm booking"}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("customer");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [jobs, setJobs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bagrun_jobs") || "[]"); } catch { return []; }
  });
  const [customerForm, setCustomerForm] = useState({ name: "", apt: "", bags: "", date: "", notes: "" });
  const [checkoutJob, setCheckoutJob] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(null);
  const [addForm, setAddForm] = useState({ name: "", apt: "", bags: "", date: "", notes: "" });
  const [pickupPhoto, setPickupPhoto] = useState(null);
  const [disposalPhoto, setDisposalPhoto] = useState(null);
  const [zelleModal, setZelleModal] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  useEffect(() => {
    try { localStorage.setItem("bagrun_jobs", JSON.stringify(jobs)); } catch {}
  }, [jobs]);

  function saveJob(job) { setJobs(prev => [job, ...prev]); }
  function updateJob(id, updates) { setJobs(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j)); }
  function deleteJob(id) { setJobs(prev => prev.filter(j => j.id !== id)); }

  function handleCustomerProceed() {
    const { name, apt, bags, date } = customerForm;
    if (!name || !apt || !bags || !date) return;
    const job = {
      id: generateId(),
      name, address: `Apt ${apt}`,
      bags: parseInt(bags), date,
      notes: customerForm.notes,
      status: "pending",
      total: parseInt(bags) * PRICE_PER_BAG,
      paymentMethodId: null,
      cardLast4: null,
      createdAt: new Date().toISOString(),
      pickupPhoto: null, disposalPhoto: null,
      paymentMethod: "stripe",
    };
    setCheckoutJob(job);
  }

  function handlePaymentSuccess(paymentMethodId) {
    const job = { ...checkoutJob, paymentMethodId };
    saveJob(job);
    setSubmitted(job);
    setCheckoutJob(null);
    setCustomerForm({ name: "", apt: "", bags: "", date: "", notes: "" });
  }

  function handleAdminAdd() {
    const { name, apt, bags, date } = addForm;
    if (!name || !apt || !bags || !date) return;
    const job = {
      id: generateId(), name, address: `Apt ${apt}`,
      bags: parseInt(bags), date, notes: addForm.notes,
      status: "scheduled", total: parseInt(bags) * PRICE_PER_BAG,
      paymentMethodId: null, cardLast4: null,
      createdAt: new Date().toISOString(),
      pickupPhoto: null, disposalPhoto: null, paymentMethod: "manual",
    };
    saveJob(job);
    setShowAddModal(false);
    setAddForm({ name: "", apt: "", bags: "", date: "", notes: "" });
  }

  async function handleCompleteJob() {
    if (!pickupPhoto || !disposalPhoto) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      if (completeModal.paymentMethod === "stripe" && completeModal.paymentMethodId) {
        const res = await fetch("/api/charge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethodId: completeModal.paymentMethodId,
            amount: Math.round(completeModal.total * 100),
            jobId: completeModal.id,
            customerName: completeModal.name,
          }),
        });
        const data = await res.json();
        if (!data.success) { setCompleteError(data.error || "Charge failed."); setCompleting(false); return; }
      }
      updateJob(completeModal.id, {
        status: completeModal.paymentMethod === "stripe" ? "paid" : "complete",
        pickupPhoto, disposalPhoto,
      });
      setCompleteModal(null);
      setPickupPhoto(null);
      setDisposalPhoto(null);
    } catch (e) {
      setCompleteError("Network error. Try again.");
    }
    setCompleting(false);
  }

  function readPhoto(file, setter) {
    const reader = new FileReader();
    reader.onload = e => setter(e.target.result);
    reader.readAsDataURL(file);
  }

  function checkPin() {
    if (pin === ADMIN_PIN) { setAdminUnlocked(true); setPinError(false); }
    else { setPinError(true); setPin(""); }
  }

  const bagCount = parseInt(customerForm.bags) || 0;
  const price = (bagCount * PRICE_PER_BAG).toFixed(2);
  const totalEarned = jobs.filter(j => j.status === "paid" || j.status === "complete").reduce((s, j) => s + j.total, 0);

  return (
    <>
      <style>{fonts}{styles}</style>
      <div>
        <nav className="nav">
          <div className="nav-logo">🗑 BagRun</div>
          <div className="nav-tabs">
            <button className={`nav-tab ${view === "customer" ? "active" : ""}`} onClick={() => { setView("customer"); setSubmitted(null); setCheckoutJob(null); }}>Book pickup</button>
            <button className={`nav-tab ${view === "admin" ? "active" : ""}`} onClick={() => setView("admin")}>Admin</button>
          </div>
        </nav>

        {view === "customer" && !submitted && !checkoutJob && (
          <div className="form-page">
            <div className="form-hero">
              <h1>Trash pickup,<br /><span>done for you.</span></h1>
              <p>Reserve at White Oak · Baton Rouge, LA<br />Leave your bags outside your door. We grab them & dispose of them.<br />Only $0.50 per bag · charged after pickup is confirmed.</p>
            </div>
            <div className="form-card">
              <p className="form-section-label">Your details</p>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" placeholder="Jane Smith" value={customerForm.name} onChange={e => setCustomerForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Apartment number</label>
                <input className="form-input" placeholder="e.g. 204" value={customerForm.apt} onChange={e => setCustomerForm(p => ({ ...p, apt: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Number of bags</label>
                  <input className="form-input" type="number" min="1" placeholder="e.g. 4" value={customerForm.bags} onChange={e => setCustomerForm(p => ({ ...p, bags: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pickup date</label>
                  <input className="form-input" type="date" value={customerForm.date} onChange={e => setCustomerForm(p => ({ ...p, date: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Special instructions (optional)</label>
                <input className="form-input" placeholder="Bags on left side of door..." value={customerForm.notes} onChange={e => setCustomerForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              {bagCount > 0 && (
                <div className="price-preview">
                  <span className="price-label">{bagCount} bag{bagCount !== 1 ? "s" : ""} × $0.50</span>
                  <span className="price-amount">${price}</span>
                </div>
              )}
              <button className="submit-btn" onClick={handleCustomerProceed} disabled={!customerForm.name || !customerForm.apt || !customerForm.bags || !customerForm.date}>
                Continue to payment →
              </button>
            </div>
          </div>
        )}

        {view === "customer" && checkoutJob && !submitted && (
          <div className="form-page">
            <div className="form-hero">
              <h1>Almost done,<br /><span>{checkoutJob.name.split(" ")[0]}.</span></h1>
              <p>Enter your card to save on file. You won't be charged until pickup is confirmed with photos.</p>
            </div>
            <div className="form-card">
              <Elements stripe={stripePromise}>
                <CheckoutForm job={checkoutJob} onSuccess={handlePaymentSuccess} onCancel={() => setCheckoutJob(null)} />
              </Elements>
            </div>
          </div>
        )}

        {view === "customer" && submitted && (
          <div className="success-page">
            <div className="success-icon">✅</div>
            <h2>You're all set!</h2>
            <p>Your pickup request is confirmed. Leave your bags outside on the scheduled date.</p>
            <div className="job-id">{submitted.id}</div>
            <p>You'll be charged <strong style={{ color: "#FF8C00" }}>${submitted.total.toFixed(2)}</strong> once pickup is confirmed with photos.</p>
            <br />
            <button className="back-btn" onClick={() => setSubmitted(null)}>Book another pickup</button>
          </div>
        )}

        {view === "admin" && !adminUnlocked && (
          <div className="pin-page">
            <h2>Admin access</h2>
            <p>Enter your PIN to continue</p>
            <input className="pin-input" type="password" maxLength={4} placeholder="····" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && checkPin()} />
            {pinError && <p className="pin-error">Wrong PIN.</p>}
            <br /><br />
            <button className="submit-btn" onClick={checkPin} style={{ maxWidth: 200 }}>Unlock →</button>
          </div>
        )}

        {view === "admin" && adminUnlocked && (
          <div className="admin-page">
            <div className="admin-header">
              <div className="admin-title">Dashboard</div>
              <button className="add-job-btn" onClick={() => setShowAddModal(true)}>+ Add job manually</button>
            </div>
            <div className="stats-row">
              <div className="stat-card"><div className="stat-val">${totalEarned.toFixed(2)}</div><div className="stat-label">total earned</div></div>
              <div className="stat-card"><div className="stat-val">{jobs.length}</div><div className="stat-label">all jobs</div></div>
              <div className="stat-card"><div className="stat-val">{jobs.filter(j => j.status === "pending").length}</div><div className="stat-label">pending</div></div>
              <div className="stat-card"><div className="stat-val">{jobs.filter(j => j.status === "scheduled").length}</div><div className="stat-label">scheduled</div></div>
            </div>
            {jobs.length === 0 && <div style={{ textAlign: "center", padding: "3rem 0", color: "#444", fontFamily: "DM Mono, monospace", fontSize: 13 }}>No jobs yet.</div>}
            <div className="jobs-list">
              {jobs.map(job => {
                const sc = STATUS_COLORS[job.status] || STATUS_COLORS.pending;
                return (
                  <div className="job-card" key={job.id}>
                    <div className="job-top">
                      <div><div className="job-name">{job.name}</div><div className="job-addr">{job.address}</div></div>
                      <span className="status-badge" style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                    </div>
                    <div className="job-meta">
                      <div className="job-meta-item">Bags: <span>{job.bags}</span></div>
                      <div className="job-meta-item">Total: <span>${job.total.toFixed(2)}</span></div>
                      <div className="job-meta-item">Date: <span>{job.date}</span></div>
                      <div className="job-meta-item">ID: <span>{job.id}</span></div>
                      <div className="job-meta-item">Pay: <span>{job.paymentMethod}</span></div>
                    </div>
                    {(job.pickupPhoto || job.disposalPhoto) && (
                      <div className="photos-row">
                        {job.pickupPhoto && <img className="photo-thumb" src={job.pickupPhoto} alt="pickup" />}
                        {job.disposalPhoto && <img className="photo-thumb" src={job.disposalPhoto} alt="disposal" />}
                      </div>
                    )}
                    {job.notes && <p style={{ fontSize: 12, color: "#555", fontFamily: "DM Mono, monospace", marginTop: 8 }}>Note: {job.notes}</p>}
                    <div className="job-actions">
                      {job.status === "pending" && <button className="action-btn" onClick={() => updateJob(job.id, { status: "scheduled" })}>Mark scheduled</button>}
                      {(job.status === "pending" || job.status === "scheduled") && <button className="action-btn primary" onClick={() => setCompleteModal(job)}>Mark complete + photos</button>}
                      {job.status === "complete" && <button className="action-btn zelle" onClick={() => setZelleModal(job)}>Send payment request</button>}
                      <button className="action-btn danger" onClick={() => deleteJob(job.id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Add job manually</h3>
              <div className="form-group"><label className="form-label">Customer name</label><input className="form-input" placeholder="John Doe" value={addForm.name} onChange={e => setAddForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Apartment number</label><input className="form-input" placeholder="e.g. 204" value={addForm.apt} onChange={e => setAddForm(p => ({ ...p, apt: e.target.value }))} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Bags</label><input className="form-input" type="number" min="1" placeholder="2" value={addForm.bags} onChange={e => setAddForm(p => ({ ...p, bags: e.target.value }))} /></div>
                <div className="form-group"><label className="form-label">Date</label><input className="form-input" type="date" value={addForm.date} onChange={e => setAddForm(p => ({ ...p, date: e.target.value }))} /></div>
              </div>
              <div className="form-group"><label className="form-label">Notes (optional)</label><input className="form-input" placeholder="Any details..." value={addForm.notes} onChange={e => setAddForm(p => ({ ...p, notes: e.target.value }))} /></div>
              {addForm.bags && <div className="price-preview"><span className="price-label">{addForm.bags} bags × $0.50</span><span className="price-amount">${(parseInt(addForm.bags) * 0.5).toFixed(2)}</span></div>}
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="submit-btn" style={{ width: "auto", padding: "9px 20px" }} onClick={handleAdminAdd} disabled={!addForm.name || !addForm.apt || !addForm.bags || !addForm.date}>Add job</button>
              </div>
            </div>
          </div>
        )}

        {completeModal && (
          <div className="modal-overlay" onClick={() => setCompleteModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Complete · {completeModal.name}</h3>
              <p style={{ fontSize: 12, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: "1.25rem" }}>Upload both photos to confirm and {completeModal.paymentMethod === "stripe" ? `charge $${completeModal.total.toFixed(2)}` : "mark complete"}.</p>
              <label className="form-label" style={{ marginBottom: 6 }}>Photo 1 — bags picked up</label>
              <label className="photo-upload-area">
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && readPhoto(e.target.files[0], setPickupPhoto)} />
                {pickupPhoto ? <img className="upload-preview" src={pickupPhoto} alt="pickup" /> : <p>Tap to upload pickup photo</p>}
              </label>
              <label className="form-label" style={{ marginBottom: 6, marginTop: 8 }}>Photo 2 — bags disposed</label>
              <label className="photo-upload-area">
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && readPhoto(e.target.files[0], setDisposalPhoto)} />
                {disposalPhoto ? <img className="upload-preview" src={disposalPhoto} alt="disposal" /> : <p>Tap to upload disposal photo</p>}
              </label>
              {completeError && <p className="error-msg">{completeError}</p>}
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => { setCompleteModal(null); setPickupPhoto(null); setDisposalPhoto(null); setCompleteError(null); }}>Cancel</button>
                <button className="submit-btn" style={{ width: "auto", padding: "9px 20px" }} onClick={handleCompleteJob} disabled={!pickupPhoto || !disposalPhoto || completing}>
                  {completing ? "Processing..." : completeModal.paymentMethod === "stripe" ? `Charge $${completeModal.total.toFixed(2)}` : "Mark complete"}
                </button>
              </div>
            </div>
          </div>
        )}

        {zelleModal && (
          <div className="modal-overlay" onClick={() => setZelleModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3>Collect payment · {zelleModal.name}</h3>
              <p style={{ fontSize: 12, color: "#666", fontFamily: "DM Mono, monospace", marginBottom: "1.25rem" }}>Request ${zelleModal.total.toFixed(2)} via any of these:</p>
              {[ZELLE, CASHAPP, VENMO].map(p => (
                <div key={p.name} style={{ background: "#0C0C0C", border: "1px solid #2A2A2A", borderRadius: 8, padding: "12px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div><div style={{ fontSize: 12, color: "#666", fontFamily: "DM Mono, monospace" }}>{p.handle}</div></div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#FF8C00", fontFamily: "DM Mono, monospace" }}>${zelleModal.total.toFixed(2)}</div>
                </div>
              ))}
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setZelleModal(null)}>Close</button>
                <button className="submit-btn" style={{ width: "auto", padding: "9px 20px" }} onClick={() => { updateJob(zelleModal.id, { status: "paid" }); setZelleModal(null); }}>Mark as paid</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
