"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createCustomer, getCustomers, getInvoices } from "@/lib/api";

export default function ClientsPage() {
  const [tab, setTab] = useState("Active");
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedClient, setSelectedClient] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newClient, setNewClient] = useState({ name: "", email: "", address: "" });

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [clientData, invoiceData] = await Promise.all([getCustomers(), getInvoices()]);
        if (!active) return;
        setClients(clientData.customers || []);
        setInvoices(invoiceData.invoices || []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load clients.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredClients = useMemo(() => {
    if (tab === "Archived") return [];
    return clients;
  }, [clients, tab]);

  const client = filteredClients[selectedClient] || null;

  const clientInvoices = useMemo(() => {
    if (!client) return [];
    return invoices
      .filter((inv) => String(inv.clientId?._id || inv.clientId || inv.customerId?._id || inv.customerId) === String(client._id))
      .slice(0, 5);
  }, [invoices, client]);

  const totalOutstanding = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0);
  }, [invoices]);

  const handleAddClient = async () => {
    setError("");
    if (!newClient.name || !newClient.email) {
      setError("Name and email are required.");
      return;
    }
    try {
      const res = await createCustomer(newClient);
      const created = res.customer;
      setClients((prev) => [created, ...prev]);
      setNewClient({ name: "", email: "", address: "" });
      setSelectedClient(0);
    } catch (err) {
      setError(err.message || "Failed to create client.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-manrope text-[2.5rem] font-extrabold tracking-tight text-on-surface leading-none">
            Client Management
          </h1>
          <p className="font-inter text-sm text-secondary mt-2 max-w-md">
            Manage your architectural partners, track billing cycles, and overview historical financial performance.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container-lowest rounded-lg px-6 py-4 shadow-[0px_2px_12px_rgba(42,52,57,0.03)] border border-[rgba(169,180,185,0.1)]">
            <div className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-medium">Active Retainers</div>
            <div className="font-manrope text-2xl font-extrabold text-on-surface mt-0.5">{clients.length}</div>
          </div>
          <div className="bg-surface-container-lowest rounded-lg px-6 py-4 shadow-[0px_2px_12px_rgba(42,52,57,0.03)] border border-[rgba(169,180,185,0.1)]">
            <div className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-medium">Total Outstanding</div>
            <div className="font-manrope text-2xl font-extrabold text-on-surface mt-0.5">${totalOutstanding.toFixed(2)}</div>
          </div>
        </div>
      </div>
      {error && (
        <div className="bg-error-container text-on-surface p-3 rounded-sm text-sm font-inter">{error}</div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-[1fr_320px] gap-5">
        {/* Left: Portfolio Directory */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_2px_12px_rgba(42,52,57,0.03)] overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="font-manrope text-lg font-bold text-on-surface">Portfolio Directory</h2>
            <div className="flex bg-surface-container-high rounded-md overflow-hidden">
              {["Active", "Archived"].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`font-inter text-[0.8125rem] px-4 py-1.5 transition-all ${
                    tab === t
                      ? "bg-primary text-on-primary font-medium"
                      : "text-secondary hover:text-on-surface"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="py-3 px-6 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Partner Entity</th>
                <th className="py-3 px-6 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Total Billed</th>
                <th className="py-3 px-6 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Current Balance</th>
                <th className="py-3 px-6 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredClients.map((c, i) => (
                <tr
                  key={c._id}
                  onClick={() => setSelectedClient(i)}
                  className={`group cursor-pointer transition-colors ${
                    selectedClient === i ? "bg-primary/3" : "hover:bg-surface-container-low"
                  }`}
                >
                  <td className="py-5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-inter text-[0.6875rem] font-bold text-primary-dim">
                        {String(c.name || "C")
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="font-inter text-[0.875rem] font-semibold text-on-surface">{c.name}</div>
                        <div className="font-inter text-[0.6875rem] text-secondary">{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-6 font-manrope text-[0.9375rem] font-semibold text-on-surface">
                    ${invoices
                      .filter((inv) => String(inv.clientId?._id || inv.clientId || inv.customerId?._id || inv.customerId) === String(c._id))
                      .reduce((sum, inv) => sum + Number(inv.total || 0), 0)
                      .toFixed(2)}
                  </td>
                  <td className="py-5 px-6">
                    {(() => {
                      const balance = invoices
                        .filter((inv) => String(inv.clientId?._id || inv.clientId || inv.customerId?._id || inv.customerId) === String(c._id))
                        .reduce((sum, inv) => sum + Number(inv.balanceDue || 0), 0);
                      return balance > 0 ? (
                      <span className={`px-3 py-1 text-[0.6875rem] font-inter font-semibold rounded-full ${
                        "bg-tertiary-container text-primary-dim"
                      }`}>
                        ${balance.toFixed(2)}<br/><span className="text-[0.5625rem]">Pending</span>
                      </span>
                      ) : (
                      <span className="font-inter text-[0.875rem] text-secondary">Settled</span>
                      );
                    })()}
                  </td>
                  <td className="py-5 px-6">
                    <button className="text-primary-dim hover:text-primary transition-colors font-inter text-lg">→</button>
                  </td>
                </tr>
              ))}
              {!loading && filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-6 text-center font-inter text-secondary text-sm">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Add Client CTA */}
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <input
                value={newClient.name}
                onChange={(e) => setNewClient((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-2 font-inter text-xs"
                placeholder="Client name"
              />
              <input
                value={newClient.email}
                onChange={(e) => setNewClient((prev) => ({ ...prev, email: e.target.value }))}
                className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-2 font-inter text-xs"
                placeholder="Email"
              />
              <input
                value={newClient.address}
                onChange={(e) => setNewClient((prev) => ({ ...prev, address: e.target.value }))}
                className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-2 font-inter text-xs"
                placeholder="Address"
              />
            </div>
            <button onClick={handleAddClient} className="w-full bg-linear-to-r from-primary to-primary-dim text-on-primary font-inter font-medium text-[0.8125rem] py-3 rounded-md transition-opacity hover:opacity-90">
              + Add New Client
            </button>
          </div>
        </div>

        {/* Right: Client Insight Panel */}
        <div className="flex flex-col gap-5">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="#2848b7" strokeWidth="1.2"/><line x1="6" y1="3.5" x2="6" y2="7.5" stroke="#2848b7" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6" cy="9" r="0.6" fill="#2848b7"/></svg>
              </div>
              <h3 className="font-manrope text-base font-bold text-on-surface">Client Insight</h3>
            </div>

            <div className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-medium mb-1">Selected Client</div>
            <div className="font-manrope text-xl font-extrabold text-on-surface">{client?.name || "No client selected"}</div>
            <div className="font-inter text-[0.75rem] text-secondary mt-1">{client?.email || "-"}</div>

            <div className="flex items-center justify-between mt-6 mb-3">
              <span className="font-inter text-[0.75rem] text-on-surface font-medium">Last 5 Invoices</span>
              <Link href="/dashboard/invoices" className="font-inter text-[0.75rem] text-primary-dim font-medium hover:underline">
                View Full Ledger
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {clientInvoices.map((inv) => (
                <div key={inv._id} className="flex items-center justify-between bg-surface-container-highest rounded-md px-3 py-2.5">
                  <div>
                    <div className="font-inter text-[0.8125rem] font-medium text-on-surface">{inv.invoiceNumber}</div>
                    <div className="font-inter text-[0.625rem] text-secondary">{new Date(inv.invoiceDate).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-manrope text-[0.875rem] font-semibold text-on-surface">${Number(inv.total || 0).toFixed(2)}</div>
                    <span className={`font-inter text-[0.5625rem] font-semibold uppercase tracking-wider ${
                      inv.status === "paid" ? "text-success" : "text-primary-dim"
                    }`}>{inv.status}</span>
                  </div>
                </div>
              ))}
              {clientInvoices.length === 0 && (
                <div className="font-inter text-[0.75rem] text-secondary">No invoices for this client yet.</div>
              )}
            </div>
          </div>

          {/* Growth Forecast */}
          <div className="bg-primary rounded-xl p-6 text-on-primary relative overflow-hidden shadow-[0px_2px_12px_rgba(42,52,57,0.08)]">
            <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-dim/20 to-primary opacity-80"></div>
            <div className="relative z-10">
              <div className="font-inter text-[0.625rem] uppercase tracking-wider font-bold text-on-primary/70 mb-2">Growth Forecast</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-manrope text-3xl font-extrabold">+12.4%</span>
                <span className="text-lg">📈</span>
              </div>
              <p className="font-inter text-[0.75rem] text-on-primary/80 leading-relaxed">
                Projected billables for next quarter based on historical pipeline and project density.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
