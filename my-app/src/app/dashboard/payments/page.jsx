"use client";

import { useEffect, useMemo, useState } from "react";
import { createPayment, getInvoices, getPayments } from "@/lib/api";

export default function PaymentsPage() {
  const [tab, setTab] = useState("All");
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ invoiceId: "", amount: "", method: "bank_transfer", reference: "" });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [paymentData, invoiceData] = await Promise.all([getPayments(), getInvoices()]);
        if (!active) return;
        setPayments(paymentData.payments || []);
        const inv = invoiceData.invoices || [];
        setInvoices(inv);
        if (inv.length > 0) setForm((prev) => ({ ...prev, invoiceId: String(inv[0]._id) }));
      } catch (err) {
        if (active) setError(err.message || "Failed to load payments.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(
    () =>
      payments.map((p) => ({
        id: p._id,
        name: p.invoiceId?.invoiceNumber || "Invoice",
        sub: p.reference || "-",
        date: new Date(p.paidAt).toLocaleDateString(),
        method: p.method,
        status: "Settled",
        amount: Number(p.amount || 0),
      })),
    [payments]
  );

  const filtered = tab === "All" ? rows : rows.filter((p) => p.status === tab);

  const statusBadge = (status) => {
    const map = {
      Settled: "bg-surface-container-high text-secondary",
      Pending: "bg-tertiary-container text-primary-dim",
      Processing: "bg-primary/10 text-primary-dim",
    };
    return map[status] || map.Settled;
  };

  const totalReceived = rows.reduce((sum, p) => sum + p.amount, 0);

  const handleRecordPayment = async () => {
    setError("");
    if (!form.invoiceId || !form.amount) {
      setError("Invoice and amount are required.");
      return;
    }
    try {
      const payload = {
        invoiceId: form.invoiceId,
        amount: Number(form.amount),
        method: form.method,
        reference: form.reference,
      };
      const data = await createPayment(payload);
      setPayments((prev) => [data.payment, ...prev]);
      setForm((prev) => ({ ...prev, amount: "", reference: "" }));
    } catch (err) {
      setError(err.message || "Failed to record payment.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-manrope text-[2.5rem] font-extrabold tracking-tight text-on-surface leading-none">
            Payments
          </h1>
          <p className="font-inter text-sm text-secondary mt-2">
            Track all inbound and outbound financial transactions.
          </p>
        </div>
        <button onClick={handleRecordPayment} className="bg-linear-to-r from-primary to-primary-dim text-on-primary font-inter font-medium text-[0.8125rem] py-2.5 px-5 rounded-md transition-opacity hover:opacity-90">
          + Record Payment
        </button>
      </div>
      {error && (
        <div className="bg-error-container text-on-surface p-3 rounded-sm text-sm font-inter">{error}</div>
      )}
      <div className="grid grid-cols-4 gap-2">
        <select
          value={form.invoiceId}
          onChange={(e) => setForm((prev) => ({ ...prev, invoiceId: e.target.value }))}
          className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-2 font-inter text-xs"
        >
          {invoices.map((inv) => (
            <option key={inv._id} value={inv._id}>
              {inv.invoiceNumber} (${Number(inv.balanceDue || 0).toFixed(2)})
            </option>
          ))}
        </select>
        <input
          value={form.amount}
          onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
          className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-2 font-inter text-xs"
          placeholder="Amount"
          type="number"
          min="0"
          step="0.01"
        />
        <select
          value={form.method}
          onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
          className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-2 font-inter text-xs"
        >
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="other">Other</option>
        </select>
        <input
          value={form.reference}
          onChange={(e) => setForm((prev) => ({ ...prev, reference: e.target.value }))}
          className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-2 font-inter text-xs"
          placeholder="Reference"
        />
      </div>

      {/* ── Stat Row ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Received", value: `$${totalReceived.toFixed(2)}` },
          { label: "Pending Clearance", value: "$0.00" },
          { label: "Failed Transactions", value: "0" },
        ].map((s, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
            <div className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-medium mb-1">{s.label}</div>
            <div className="font-manrope text-2xl font-extrabold text-on-surface leading-none">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex gap-2">
        {["All", "Settled", "Pending", "Processing"].map(s => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-5 py-2 rounded-full font-inter text-[0.8125rem] transition-all ${
              tab === s
                ? "bg-primary text-on-primary font-medium"
                : "bg-surface-container-high text-secondary hover:text-on-surface"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_2px_12px_rgba(42,52,57,0.03)] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="py-4 px-6 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Entity</th>
              <th className="py-4 px-6 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Date</th>
              <th className="py-4 px-6 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Method</th>
              <th className="py-4 px-6 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Status</th>
              <th className="py-4 px-6 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.map((p) => (
              <tr key={p.id} className="group hover:bg-surface-container-low transition-colors">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-inter text-[0.6875rem] font-bold text-primary-dim">
                      {String(p.name).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-inter text-[0.875rem] font-medium text-on-surface">{p.name}</div>
                      <div className="font-inter text-[0.6875rem] text-secondary">{p.sub}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 font-inter text-[0.875rem] text-secondary">{p.date}</td>
                <td className="py-4 px-6 font-inter text-[0.875rem] text-secondary">{p.method}</td>
                <td className="py-4 px-6">
                  <span className={`px-3 py-1 text-[0.625rem] font-inter font-semibold rounded-full uppercase tracking-wider ${statusBadge(p.status)}`}>{p.status}</span>
                </td>
                <td className="py-4 px-6 text-right font-manrope text-[1rem] font-semibold text-on-surface">${p.amount.toFixed(2)}</td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="py-12 text-center font-inter text-secondary text-sm">No payments found.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={5} className="py-12 text-center font-inter text-secondary text-sm">Loading payments...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
