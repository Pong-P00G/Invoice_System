"use client";

import { useEffect, useMemo, useState } from "react";
import { createInvoice, getCustomers } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [lineItems, setLineItems] = useState([
    { description: "Architectural Blueprint Review", qty: 12, rate: 185.0 },
    { description: "Structural Consultation", qty: 1, rate: 450.0 },
    { description: "", qty: 1, rate: 0 },
  ]);

  const [notes, setNotes] = useState("Thank you for your business. It's been a pleasure working on the Metropolis Project.");
  const [terms, setTerms] = useState("Please remit payment within 30 days. Late payments are subject to a 1.5% monthly fee.");

  useEffect(() => {
    let active = true;
    async function loadCustomers() {
      try {
        const data = await getCustomers();
        if (!active) return;
        const list = data.customers || [];
        setCustomers(list);
        if (list.length > 0) setCustomerId(String(list[0]._id));
      } catch (err) {
        if (active) setError(err.message || "Failed to load customers.");
      }
    }
    loadCustomers();
    return () => {
      active = false;
    };
  }, []);

  const subtotal = useMemo(() => lineItems.reduce((sum, item) => sum + item.qty * item.rate, 0), [lineItems]);
  const tax = subtotal * 0.085;
  const total = subtotal + tax;

  const updateItem = (index, field, value) => {
    setLineItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addRow = () => {
    setLineItems(prev => [...prev, { description: "", qty: 1, rate: 0 }]);
  };

  const removeRow = (index) => {
    setLineItems((prev) => {
      if (prev.length === 1) return [{ description: "", qty: 1, rate: 0 }];
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmitInvoice = async () => {
    setError("");
    setSuccess("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    const cleanItems = lineItems
      .filter((item) => item.description && item.qty > 0)
      .map((item) => ({
        description: item.description,
        quantity: Number(item.qty),
        unitPrice: Number(item.rate),
        taxRate: 8.5,
      }));

    if (cleanItems.length === 0) {
      setError("Please add at least one valid line item.");
      return;
    }

    setLoading(true);
    try {
      const data = await createInvoice({
        customerId,
        invoiceNumber,
        invoiceDate,
        dueDate,
        notes,
        terms,
        lineItems: cleanItems,
      });
      setSuccess(`Invoice ${data.invoice?.invoiceNumber || ""} created.`);
      setTimeout(() => router.push("/dashboard/invoices"), 800);
    } catch (err) {
      setError(err.message || "Failed to create invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="font-inter text-[0.6875rem] uppercase tracking-[0.15em] text-primary-dim font-bold mb-1">
            New Document
          </div>
          <h1 className="font-manrope text-[2.5rem] font-extrabold tracking-tight text-on-surface leading-none">
            Invoice Creator
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] text-on-surface font-inter font-medium text-[0.8125rem] py-2.5 px-5 rounded-md hover:bg-surface-container-high transition-colors">
            Save Draft
          </button>
          <button
            onClick={handleSubmitInvoice}
            disabled={loading}
            className="bg-linear-to-r from-primary to-primary-dim text-on-primary font-inter font-medium text-[0.8125rem] py-2.5 px-5 rounded-md transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Submitting..." : "Finalize & Send"}
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-error-container text-on-surface p-3 rounded-sm text-sm font-inter">{error}</div>
      )}
      {success && (
        <div className="bg-tertiary-container text-on-surface p-3 rounded-sm text-sm font-inter">{success}</div>
      )}

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-[1fr_300px] gap-5">
        {/* Left Column */}
        <div className="flex flex-col gap-5">
          {/* Client Information */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
            <div className="flex items-center gap-2 mb-5">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="7" cy="5.5" r="3" stroke="#041139" strokeWidth="1.5"/><path d="M1 15.5C1 12.5 3.5 10 7 10C10.5 10 13 12.5 13 15.5" stroke="#041139" strokeWidth="1.5" strokeLinecap="round"/><circle cx="13.5" cy="6" r="2.5" stroke="#041139" strokeWidth="1.3"/><path d="M17 15.5C17 13 15.5 11 13.5 10.5" stroke="#041139" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <h2 className="font-manrope text-base font-bold text-on-surface">Client Information</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Select Client</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-3 font-inter text-sm text-on-surface w-full"
                >
                  {customers.length === 0 && <option value="">No customers found</option>}
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Billing Address</label>
                <div className="font-inter text-[0.875rem] text-on-surface leading-relaxed">
                  {customers.find((c) => c._id === customerId)?.address || "No billing address"}
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="1" width="14" height="16" rx="2" stroke="#041139" strokeWidth="1.5"/><line x1="5.5" y1="5.5" x2="12.5" y2="5.5" stroke="#041139" strokeWidth="1.5" strokeLinecap="round"/><line x1="5.5" y1="9" x2="12.5" y2="9" stroke="#041139" strokeWidth="1.5" strokeLinecap="round"/><line x1="5.5" y1="12.5" x2="9.5" y2="12.5" stroke="#041139" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <h2 className="font-manrope text-base font-bold text-on-surface">Service Details</h2>
              </div>
              <button onClick={addRow} className="font-inter text-[0.8125rem] text-primary-dim font-medium hover:underline">+ Add Row</button>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Description</th>
                  <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary w-16 text-center">Qty</th>
                  <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary w-24 text-right">Rate</th>
                  <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary w-28 text-right">Amount</th>
                  <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="py-4 px-4">
                      <input
                        type="text"
                        placeholder="Enter service description..."
                        value={item.description}
                        onChange={e => updateItem(i, "description", e.target.value)}
                        className="bg-transparent font-inter text-[0.875rem] text-secondary placeholder:text-outline-variant w-full"
                      />
                    </td>
                    <td className="py-4 px-4 text-center font-inter text-[0.875rem] text-secondary">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateItem(i, "qty", Number(e.target.value))}
                        className="w-16 bg-transparent text-center"
                      />
                    </td>
                    <td className="py-4 px-4 text-right font-inter text-[0.875rem] text-secondary">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(i, "rate", Number(e.target.value))}
                        className="w-20 bg-transparent text-right"
                      />
                    </td>
                    <td className="py-4 px-4 text-right font-manrope text-[0.9375rem] font-semibold text-on-surface">
                      ${(item.qty * item.rate).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="font-inter text-[0.75rem] text-error hover:text-error/80 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes & Terms */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
              <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary mb-2 block">Notes to Client</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-3 font-inter text-sm text-on-surface resize-none h-20 focus:border-b-2 focus:border-b-primary transition-all"
              ></textarea>
            </div>
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
              <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary mb-2 block">Payment Terms</label>
              <textarea
                value={terms}
                onChange={e => setTerms(e.target.value)}
                className="w-full bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-3 font-inter text-sm text-on-surface resize-none h-20 focus:border-b-2 focus:border-b-primary transition-all"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-5">
          {/* Document Identity */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
            <h3 className="font-manrope text-base font-bold text-on-surface mb-5">Document Identity</h3>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Invoice Number</label>
                <input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm px-3 py-2 font-manrope text-sm text-on-surface"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Issue Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm px-3 py-2 font-inter text-sm text-on-surface"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm px-3 py-2 font-inter text-sm text-on-surface"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Currency</label>
                <div className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm px-3 py-2 font-inter text-sm text-on-surface flex items-center justify-between cursor-pointer">
                  <span>USD ($) - United States Dollar</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-primary rounded-xl p-6 text-on-primary relative overflow-hidden shadow-[0px_2px_12px_rgba(42,52,57,0.08)]">
            <div className="absolute inset-0 bg-linear-to-br from-primary via-primary-dim/20 to-primary opacity-80"></div>
            <div className="relative z-10">
              <h3 className="font-manrope text-base font-bold mb-4">Financial Summary</h3>
              
              <div className="flex justify-between font-inter text-[0.8125rem] text-on-primary/80 mb-1.5">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-inter text-[0.8125rem] text-on-primary/80 mb-3">
                <span>Tax (8.5%)</span>
                <span>${tax.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="border-t border-on-primary/20 pt-3 mb-4">
                <div className="font-inter text-[0.625rem] uppercase tracking-wider text-on-primary/60 mb-1">Total Amount</div>
                <div className="font-manrope text-3xl font-extrabold">${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              </div>

              <button
                type="button"
                onClick={handleSubmitInvoice}
                disabled={loading}
                className="w-full bg-on-primary text-primary font-inter font-medium text-[0.8125rem] py-3 rounded-md hover:bg-on-primary/90 transition-colors disabled:opacity-70"
              >
                {loading ? "Submitting..." : "Send Invoice Now"}
              </button>
            </div>
          </div>

          {/* Recipient Preview */}
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Recipient Preview</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="#a9b4b9" strokeWidth="1.2"/><circle cx="7" cy="7" r="2.5" stroke="#a9b4b9" strokeWidth="1.2"/></svg>
            </div>
            <div className="bg-surface-container-highest rounded-md p-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-surface-container-high flex items-center justify-center font-inter text-[0.625rem] font-bold text-secondary">AA</div>
                <span className="font-inter text-[0.8125rem] font-medium text-on-surface">Aether Architecture</span>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="h-2 w-3/4 bg-surface-container-high rounded-full"></div>
                <div className="h-2 w-1/2 bg-surface-container-high rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
