"use client";

import { useEffect, useMemo, useState } from "react";
import { getAuditLogs, getInvoices, getPayments } from "@/lib/api";

export default function ReportsPage() {
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
          getAuditLogs({ limit: 20 }),
        ]);
        if (!active) return;
        setInvoices(invoiceData.invoices || []);
        setPayments(paymentData.payments || []);
        setLogs(logData.logs || []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load reports.");
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
    const revenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0);
    const balanceDue = invoices.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);
    const collectionRate = totalInvoiced > 0 ? ((revenue / totalInvoiced) * 100).toFixed(1) : "0.0";
    return { revenue, totalInvoiced, balanceDue, collectionRate };
  }, [invoices, payments]);

  const topClients = useMemo(() => {
    const map = new Map();
    invoices.forEach((inv) => {
      const name = inv.clientId?.name || inv.customerId?.name || "Unknown";
      const current = map.get(name) || { revenue: 0, count: 0 };
      current.revenue += Number(inv.total || 0);
      current.count += 1;
      map.set(name, current);
    });
    return Array.from(map.entries())
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [invoices]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-manrope text-[2.5rem] font-extrabold tracking-tight text-on-surface leading-none">
            Reports
          </h1>
          <p className="font-inter text-sm text-secondary mt-2">
            Financial analytics and performance insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] text-on-surface font-inter font-medium text-[0.8125rem] py-2 px-5 rounded-md hover:bg-surface-container-high transition-colors">
            Q1 2024
          </button>
          <button className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] text-on-surface font-inter font-medium text-[0.8125rem] py-2 px-5 rounded-md hover:bg-surface-container-high transition-colors">
            Q2 2024
          </button>
          <button className="bg-primary text-on-primary font-inter font-medium text-[0.8125rem] py-2 px-5 rounded-md">
            Q3 2024
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Revenue Collected", value: `$${metrics.revenue.toFixed(2)}`, color: "text-success" },
          { label: "Total Invoiced", value: `$${metrics.totalInvoiced.toFixed(2)}`, color: "text-on-surface" },
          { label: "Collection Rate", value: `${metrics.collectionRate}%`, color: "text-on-surface" },
          { label: "Outstanding", value: `$${metrics.balanceDue.toFixed(2)}`, color: "text-on-surface" },
        ].map((s, i) => (
          <div key={i} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
            <div className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-medium mb-2">{s.label}</div>
            <div className={`font-manrope text-2xl font-extrabold ${s.color} leading-none`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Monthly Revenue ── */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
        <h2 className="font-manrope text-lg font-bold text-on-surface mb-6">Recent Audit Activity</h2>
        {error && <div className="font-inter text-sm text-error mb-3">{error}</div>}
        {loading && <div className="font-inter text-sm text-secondary">Loading report data...</div>}
        {!loading && logs.length === 0 && <div className="font-inter text-sm text-secondary">No audit activity available.</div>}
        {!loading && logs.length > 0 && (
          <div className="flex flex-col gap-2">
            {logs.slice(0, 10).map((log) => (
              <div key={log._id} className="bg-surface-container-highest rounded-md p-3 flex items-center justify-between">
                <div>
                  <div className="font-inter text-sm text-on-surface">{log.action}</div>
                  <div className="font-inter text-xs text-secondary">{log.entityType || "system"}</div>
                </div>
                <div className="font-inter text-xs text-secondary">{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
        <h2 className="font-manrope text-lg font-bold text-on-surface mb-5">Top Performing Clients</h2>
        {topClients.length === 0 && <div className="font-inter text-sm text-secondary">No invoice data available.</div>}
        {topClients.length > 0 && (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Client</th>
                <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary text-right">Revenue</th>
                <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary text-right">Invoices</th>
              </tr>
            </thead>
            <tbody>
              {topClients.map((c) => (
                <tr key={c.name} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-4 px-4 font-inter text-[0.875rem] font-medium text-on-surface">{c.name}</td>
                  <td className="py-4 px-4 text-right font-manrope text-[0.9375rem] font-semibold text-on-surface">${c.revenue.toFixed(2)}</td>
                  <td className="py-4 px-4 text-right font-inter text-[0.875rem] text-secondary">{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
