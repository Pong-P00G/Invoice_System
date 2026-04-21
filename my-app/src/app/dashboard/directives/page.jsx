"use client";

import { useEffect, useMemo, useState } from "react";
import { getInvoices } from "@/lib/api";

export default function DirectivesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getInvoices();
        if (!active) return;
        setInvoices(data?.invoices || []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load directives.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const directives = useMemo(() => {
    const overdue = invoices.filter(
      (i) => i.status !== "paid" && i.status !== "cancelled" && new Date(i.dueDate) < new Date()
    ).length;
    const drafts = invoices.filter((i) => i.status === "draft").length;
    const outstanding = invoices.reduce((sum, i) => sum + Number(i.balanceDue || 0), 0);
    return [
      {
        title: "Resolve Overdue Invoices",
        detail: `${overdue} invoices are past due and require collection follow-up.`,
        priority: overdue > 0 ? "High" : "Low",
      },
      {
        title: "Finalize Draft Invoices",
        detail: `${drafts} draft invoices are pending review before sending.`,
        priority: drafts > 0 ? "Medium" : "Low",
      },
      {
        title: "Reduce Outstanding Balance",
        detail: `Current balance due is $${outstanding.toFixed(2)} across active invoices.`,
        priority: outstanding > 0 ? "Medium" : "Low",
      },
    ];
  }, [invoices]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-manrope text-[2.25rem] font-extrabold tracking-tight text-on-surface leading-tight">
          Directives
        </h1>
        <p className="font-inter text-sm text-secondary mt-1">
          Operational actions generated from your current billing posture.
        </p>
      </div>

      {error && <div className="font-inter text-sm text-error">{error}</div>}
      {loading && <div className="font-inter text-sm text-secondary">Loading directives...</div>}

      {!loading && (
        <div className="grid grid-cols-1 gap-4">
          {directives.map((item) => (
            <div
              key={item.title}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-manrope text-lg font-bold text-on-surface">{item.title}</h2>
                <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                  {item.priority}
                </span>
              </div>
              <p className="font-inter text-sm text-secondary">{item.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
