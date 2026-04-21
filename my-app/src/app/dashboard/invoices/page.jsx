"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getInvoices } from "@/lib/api";

export default function InvoicesPage() {
  const [filter, setFilter] = useState("All Invoices");
  const [selected, setSelected] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getInvoices();
        if (active) setInvoices(data.invoices || []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load invoices.");
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
      invoices.map((inv) => ({
        id: inv._id,
        invoiceNumber: inv.invoiceNumber,
        client: inv.clientId?.name || inv.customerId?.name || "Unknown Customer",
        date: new Date(inv.invoiceDate).toLocaleDateString(),
        total: Number(inv.total || 0),
        status: String(inv.status || "draft"),
      })),
    [invoices]
  );

  const filteredInvoices =
    filter === "All Invoices"
      ? rows
      : rows.filter((inv) => {
          if (filter === "Drafts") return inv.status === "draft";
          return inv.status === filter.toLowerCase();
        });

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(prev => prev.length === filteredInvoices.length ? [] : filteredInvoices.map(i => i.id));
  };

  const statusBadge = (status) => {
    const styles = {
      paid: "bg-surface-container-high text-secondary",
      sent: "bg-tertiary-container text-primary-dim",
      overdue: "bg-error-container text-on-surface",
      draft: "bg-surface-container-high text-secondary",
      cancelled: "bg-error-container text-on-surface",
    };
    return styles[status] || styles.draft;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Performance Header ── */}
      <div className="grid grid-cols-[1fr_280px] gap-5">
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-manrope text-lg font-bold text-on-surface">Invoice Performance</h2>
              <p className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary mt-0.5">Fiscal Year Q3</p>
            </div>
            <Link href="/dashboard/create" className="bg-linear-to-r from-primary to-primary-dim text-on-primary font-inter font-medium text-[0.8125rem] py-2.5 px-5 rounded-md transition-opacity hover:opacity-90 flex items-center gap-2">
              + Create New Invoice
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="font-manrope text-[2rem] font-extrabold text-on-surface tracking-tight leading-none">$428,190.00</div>
              <div className="font-inter text-[0.75rem] text-secondary mt-1">Total Receivables</div>
              <div className="h-1 w-16 bg-primary-dim rounded-full mt-2"></div>
            </div>
            <div>
              <div className="font-manrope text-[2rem] font-extrabold text-on-surface tracking-tight leading-none">$12,400.00</div>
              <div className="font-inter text-[0.75rem] text-secondary mt-1">Overdue Balance</div>
              <div className="h-1 w-16 bg-error rounded-full mt-2"></div>
            </div>
            <div>
              <div className="font-manrope text-[2rem] font-extrabold text-on-surface tracking-tight leading-none">42</div>
              <div className="font-inter text-[0.75rem] text-secondary mt-1">Pending Approvals</div>
              <div className="h-1 w-16 bg-primary-dim/40 rounded-full mt-2"></div>
            </div>
          </div>
        </div>

        {/* Pro Insight Card */}
        <div className="bg-primary rounded-xl p-6 text-on-primary flex flex-col justify-between overflow-hidden relative shadow-[0px_2px_12px_rgba(42,52,57,0.08)]">
          <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-dim/30 to-primary opacity-80"></div>
          <div className="relative z-10">
            <span className="bg-primary-dim/60 text-on-primary font-inter text-[0.625rem] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md inline-block mb-4">
              Pro Insight
            </span>
            <p className="font-manrope text-xl font-bold leading-snug">
              Your invoicing cycle is 12% faster than last month.
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Row ── */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["All Invoices", "Pending", "Overdue", "Drafts"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-5 py-2 rounded-full font-inter text-[0.8125rem] transition-all ${
                filter === status
                  ? "bg-primary text-on-primary font-medium shadow-[0px_2px_8px_rgba(4,17,57,0.15)]"
                  : "bg-surface-container-high text-secondary hover:text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-md px-4 py-2 font-inter text-[0.8125rem] text-secondary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1 5h12" stroke="currentColor" strokeWidth="1.2"/><path d="M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            Last 30 Days
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </button>
          <button className="flex items-center gap-2 font-inter text-[0.8125rem] text-secondary hover:text-on-surface transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            More Filters
          </button>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_2px_12px_rgba(42,52,57,0.03)] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low">
              <th className="py-4 px-5 w-10">
                <input
                  type="checkbox"
                  checked={selected.length === filteredInvoices.length && filteredInvoices.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded accent-primary cursor-pointer"
                />
              </th>
              <th className="py-4 px-5 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Invoice ID</th>
              <th className="py-4 px-5 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Client</th>
              <th className="py-4 px-5 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Issue Date</th>
              <th className="py-4 px-5 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Amount</th>
              <th className="py-4 px-5 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Status</th>
              <th className="py-4 px-5 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="py-12 text-center font-inter text-secondary text-sm">Loading invoices...</td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={7} className="py-12 text-center font-inter text-error text-sm">{error}</td>
              </tr>
            )}
            {!loading && !error && filteredInvoices.map((inv) => (
              <tr
                key={inv.id}
                className={`group transition-colors hover:bg-surface-container-low ${
                  selected.includes(inv.id) ? "bg-primary/3" : ""
                }`}
              >
                <td className="py-4 px-5">
                  <input
                    type="checkbox"
                    checked={selected.includes(inv.id)}
                    onChange={() => toggleSelect(inv.id)}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                </td>
                <td className="py-4 px-5">
                  <span className="font-inter text-[0.875rem] font-medium text-on-surface">{inv.invoiceNumber}</span>
                </td>
                <td className="py-4 px-5">
                  <span className="font-inter text-[0.875rem] text-on-surface">{inv.client}</span>
                </td>
                <td className="py-4 px-5 font-inter text-[0.875rem] text-secondary">{inv.date}</td>
                <td className="py-4 px-5">
                  <span className="font-manrope text-[0.9375rem] font-semibold text-on-surface">
                    ${inv.total.toFixed(2)}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <span className={`px-3 py-1 text-[0.625rem] font-inter font-semibold rounded-full uppercase tracking-wider ${statusBadge(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <button className="text-secondary hover:text-on-surface transition-colors opacity-0 group-hover:opacity-100">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="3" r="1.2" fill="currentColor"/><circle cx="8" cy="8" r="1.2" fill="currentColor"/><circle cx="8" cy="13" r="1.2" fill="currentColor"/></svg>
                  </button>
                </td>
              </tr>
            ))}
            {!loading && !error && filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center font-inter text-secondary text-sm">No invoices found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Bulk Action Bar */}
        {selected.length > 0 && (
          <div className="bg-primary/4 border-t border-[rgba(169,180,185,0.1)] px-5 py-3 flex items-center gap-6">
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 bg-primary text-on-primary rounded-full flex items-center justify-center font-inter text-[0.625rem] font-bold">{selected.length}</span>
              <span className="font-inter text-[0.8125rem] text-on-surface">Items selected</span>
            </span>
            <button className="flex items-center gap-1.5 font-inter text-[0.8125rem] text-secondary hover:text-on-surface transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11V3h10v8H2z" stroke="currentColor" strokeWidth="1.2"/><path d="M5 3V1h4v2" stroke="currentColor" strokeWidth="1.2"/><path d="M7 5v6" stroke="currentColor" strokeWidth="1.2"/></svg>
              Export PDF
            </button>
            <button className="flex items-center gap-1.5 font-inter text-[0.8125rem] text-secondary hover:text-on-surface transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 8l6 4 6-4M1 4l6 4 6-4-6-4-6 4z" stroke="currentColor" strokeWidth="1.2"/></svg>
              Send Reminders
            </button>
            <button className="flex items-center gap-1.5 font-inter text-[0.8125rem] text-error hover:text-error/80 transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M5 4V2h4v2M3 4v8h8V4" stroke="currentColor" strokeWidth="1.2"/></svg>
              Delete
            </button>
          </div>
        )}

        {/* Pagination */}
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="font-inter text-[0.8125rem] text-secondary">Showing 1 to 5 of 84 invoices</span>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-secondary hover:bg-surface-container-low transition-colors font-inter text-sm">&lt;</button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center bg-primary text-on-primary font-inter text-sm font-semibold">1</button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-secondary hover:bg-surface-container-low transition-colors font-inter text-sm">2</button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-secondary hover:bg-surface-container-low transition-colors font-inter text-sm">3</button>
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-secondary hover:bg-surface-container-low transition-colors font-inter text-sm">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
