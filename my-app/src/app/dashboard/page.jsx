"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAuditLogs, getInvoices, getPayments } from "@/lib/api";

export default function DashboardPage() {
  const [paymentTab, setPaymentTab] = useState("Inbound");
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [invoiceData, paymentData, logData] = await Promise.all([
          getInvoices(),
          getPayments(),
          getAuditLogs({ limit: 10 }),
        ]);
        if (!active) return;
        setInvoices(invoiceData.invoices || []);
        setPayments(paymentData.payments || []);
        setLogs(logData.logs || []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load dashboard data.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const metrics = useMemo(() => {
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalOutstanding = invoices.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);
    const overdueCount = invoices.filter((i) => {
      if (i.status === "paid" || i.status === "cancelled") return false;
      return new Date(i.dueDate) < new Date();
    }).length;
    return { totalRevenue, totalOutstanding, overdueCount };
  }, [invoices, payments]);

  const recentPayments = useMemo(
    () =>
      payments.slice(0, 5).map((p) => ({
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

  const actionItems = useMemo(
    () =>
      logs.slice(0, 5).map((l) => ({
        id: l._id,
        type: (l.action || "action").toUpperCase(),
        inv: l.entityType || "system",
        name: l.meta?.invoiceNumber || l.action,
        detail: new Date(l.createdAt).toLocaleString(),
      })),
    [logs]
  );

  return (
    <div className="flex flex-col gap-8">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-manrope text-[2rem] font-extrabold tracking-tight text-on-surface leading-tight">
            Executive Overview
          </h1>
          <p className="font-inter text-sm text-secondary mt-1">
            Monitoring architectural ledger performance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-surface-container-highest text-on-surface font-inter text-[0.8125rem] font-medium py-2 px-5 rounded-md border border-[rgba(169,180,185,0.15)] hover:bg-surface-container-high transition-colors">
            Last 30 Days
          </button>
          <Link href="/dashboard/create" className="bg-linear-to-r from-primary to-primary-dim text-on-primary font-inter font-medium text-[0.8125rem] py-2 px-5 rounded-md transition-opacity hover:opacity-90">
            + New Invoice
          </Link>
        </div>
      </div>
      {error && <div className="bg-error-container text-on-surface p-3 rounded-sm text-sm font-inter">{error}</div>}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-5">
        {/* Total Revenue */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="2" stroke="#041139" strokeWidth="1.5"/><path d="M2 7h14" stroke="#041139" strokeWidth="1.5"/></svg>
            </div>
            <span className="bg-success-container text-success font-inter text-xs font-semibold px-2 py-0.5 rounded-full">{payments.length} txns</span>
          </div>
          <div className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-medium mb-1">Total Revenue</div>
          <div className="font-manrope text-[2.5rem] font-extrabold text-on-surface leading-none tracking-tight">${metrics.totalRevenue.toFixed(2)}</div>
        </div>

        {/* Outstanding */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v14M5 6l4-4 4 4M5 12l4 4 4-4" stroke="#041139" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="bg-error-container/30 text-error font-inter text-xs font-semibold px-2 py-0.5 rounded-full">{invoices.length} invoices</span>
          </div>
          <div className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-medium mb-1">Outstanding</div>
          <div className="font-manrope text-[2.5rem] font-extrabold text-on-surface leading-none tracking-tight">${metrics.totalOutstanding.toFixed(2)}</div>
        </div>

        {/* Overdue Assets */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-lg bg-error/10 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L1.5 16h15L9 2z" stroke="#dc2626" strokeWidth="1.5" strokeLinejoin="round"/><line x1="9" y1="7" x2="9" y2="11" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="13.5" r="0.75" fill="#dc2626"/></svg>
            </div>
            <span className="bg-error-container text-on-surface font-inter text-xs font-semibold px-2.5 py-0.5 rounded-full">Live</span>
          </div>
          <div className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-medium mb-1">Overdue Assets</div>
          <div className="font-manrope text-[2.5rem] font-extrabold text-error leading-none tracking-tight">{metrics.overdueCount}</div>
        </div>
      </div>

      {/* ── Chart & Action Required ── */}
      <div className="grid grid-cols-[1fr_340px] gap-5">
        {/* Chart */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-manrope text-lg font-bold text-on-surface">Invoice Volume Trend</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-dim"></div>
                <span className="font-inter text-xs text-secondary">Processed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-outline-variant"></div>
                <span className="font-inter text-xs text-secondary">Forecast</span>
              </div>
            </div>
          </div>
          {/* SVG Chart Illustration */}
          <div className="relative h-52">
            <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2848b7" stopOpacity="0.15"/>
                  <stop offset="100%" stopColor="#2848b7" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1="0" y1="50" x2="600" y2="50" stroke="#f0f4f7" strokeWidth="1"/>
              <line x1="0" y1="100" x2="600" y2="100" stroke="#f0f4f7" strokeWidth="1"/>
              <line x1="0" y1="150" x2="600" y2="150" stroke="#f0f4f7" strokeWidth="1"/>
              {/* Area */}
              <path d="M0,160 C50,140 100,120 150,100 C200,80 230,40 280,30 C330,20 360,60 400,50 C440,40 470,20 520,30 C570,40 600,60 600,70 L600,200 L0,200 Z" fill="url(#chartGrad)"/>
              {/* Line */}
              <path d="M0,160 C50,140 100,120 150,100 C200,80 230,40 280,30 C330,20 360,60 400,50 C440,40 470,20 520,30 C570,40 600,60 600,70" fill="none" stroke="#2848b7" strokeWidth="2.5"/>
              {/* Forecast dashed */}
              <path d="M420,45 C470,35 530,50 600,70" fill="none" stroke="#a9b4b9" strokeWidth="2" strokeDasharray="6,4"/>
            </svg>
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
              {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"].map(m => (
                <span key={m} className="font-inter text-[0.625rem] text-outline-variant uppercase">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Required */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-manrope text-lg font-bold text-on-surface">Action Required</h2>
            <span className="bg-error-container text-on-surface font-inter text-[0.625rem] font-bold px-2 py-0.5 rounded-full">4 TASKS</span>
          </div>
          <div className="flex flex-col gap-3">
            {actionItems.map((item) => (
              <div key={item.id} className="bg-surface-container-highest rounded-lg p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`font-inter text-[0.625rem] uppercase tracking-wider font-bold ${
                    item.type === "OVERDUE" ? "text-error" : "text-primary-dim"
                  }`}>{item.type}</span>
                  <span className="font-inter text-[0.6875rem] text-secondary">{item.inv}</span>
                </div>
                <div className="font-inter text-[0.875rem] font-semibold text-on-surface">{item.name}</div>
                <div className="font-inter text-[0.75rem] text-secondary mt-0.5">{item.detail}</div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/reports" className="flex items-center gap-1 mt-4 font-inter text-[0.8125rem] text-primary-dim font-medium hover:underline">
            View All Disruptions →
          </Link>
        </div>
      </div>

      {/* ── Recent Payments ── */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-manrope text-xl font-bold text-on-surface">Recent Payments</h2>
          <div className="flex bg-surface-container-high rounded-md overflow-hidden">
            {["Inbound", "Outbound"].map(tab => (
              <button
                key={tab}
                onClick={() => setPaymentTab(tab)}
                className={`font-inter text-[0.8125rem] px-4 py-1.5 transition-colors ${
                  paymentTab === tab
                    ? "bg-primary text-on-primary font-medium"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Entity</th>
              <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Date</th>
              <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Method</th>
              <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Status</th>
              <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {!loading && recentPayments.map((p) => (
              <tr key={p.id} className="group hover:bg-surface-container-low transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-inter text-[0.6875rem] font-semibold text-primary">
                      {String(p.name).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-inter text-[0.875rem] font-medium text-on-surface">{p.name}</div>
                      <div className="font-inter text-[0.6875rem] text-secondary">{p.sub}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 font-inter text-[0.875rem] text-secondary">{p.date}</td>
                <td className="py-4 px-4 font-inter text-[0.875rem] text-secondary">{p.method}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 text-[0.6875rem] font-inter font-semibold rounded-full uppercase tracking-wider ${
                    p.status === "Settled"
                      ? "bg-surface-container-high text-secondary"
                      : "bg-tertiary-container text-primary-dim"
                  }`}>{p.status}</span>
                </td>
                <td className="py-4 px-4 text-right font-manrope text-[1rem] font-semibold text-on-surface">${p.amount.toFixed(2)}</td>
              </tr>
            ))}
            {!loading && recentPayments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center font-inter text-secondary text-sm">No payments yet.</td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={5} className="py-10 text-center font-inter text-secondary text-sm">Loading dashboard...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
