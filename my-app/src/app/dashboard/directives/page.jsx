"use client";

import { useEffect, useMemo, useState } from "react";
import { getInvoices } from "@/lib/api";

const priorities = {
  High: "bg-[#fff1f1] text-error",
  Medium: "bg-[#fff7e6] text-[#9a6700]",
  Low: "bg-surface-container-high text-secondary",
};

function Chevron({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DirectivesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDirective, setOpenDirective] = useState(0);

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
    const overdueInvoices = invoices.filter(
      (i) => i.status !== "paid" && i.status !== "cancelled" && new Date(i.dueDate) < new Date()
    );
    const draftInvoices = invoices.filter((i) => i.status === "draft");
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
        summary: overdue > 0 ? "Prioritize collection outreach and owner assignment." : "No overdue collections require action right now.",
        bullets: overdueInvoices.slice(0, 3).map((invoice) => `Invoice ${invoice.invoiceNumber || "Unknown"} is overdue for ${invoice.clientId?.name || invoice.customerId?.name || "Unknown client"}.`),
      },
      {
        title: "Finalize Draft Invoices",
        detail: `${drafts} draft invoices are pending review before sending.`,
        priority: drafts > 0 ? "Medium" : "Low",
        summary: drafts > 0 ? "Review draft accuracy before releasing customer-facing documents." : "Draft volume is clear.",
        bullets: draftInvoices.slice(0, 3).map((invoice) => `Draft ${invoice.invoiceNumber || "Untitled"} is still waiting to be issued.`),
      },
      {
        title: "Reduce Outstanding Balance",
        detail: `Current balance due is $${outstanding.toFixed(2)} across active invoices.`,
        priority: outstanding > 0 ? "Medium" : "Low",
        summary: outstanding > 0 ? "Track open receivables before they convert into overdue risk." : "Outstanding receivables are fully cleared.",
        bullets: [
          `${invoices.filter((i) => Number(i.balanceDue || 0) > 0).length} active invoices still carry a balance due.`,
          `Current receivable exposure stands at $${outstanding.toFixed(2)}.`,
        ],
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
          {directives.map((item, index) => {
            const open = openDirective === index;
            const bullets = item.bullets.length > 0 ? item.bullets : ["No invoice rows currently require a deeper follow-up under this directive."];
            return (
              <div
                key={item.title}
                className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0px_2px_12px_rgba(42,52,57,0.03)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenDirective((current) => (current === index ? -1 : index))}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-manrope text-lg font-bold text-on-surface">{item.title}</h2>
                      <span className={`rounded-full px-2.5 py-1 font-inter text-[0.6875rem] font-semibold uppercase tracking-wider ${priorities[item.priority]}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-2 font-inter text-sm text-secondary">{item.detail}</p>
                  </div>
                  <div className="shrink-0 text-secondary">
                    <Chevron open={open} />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-[rgba(169,180,185,0.14)] bg-surface-container-highest/40 px-5 py-4">
                    <p className="font-inter text-sm text-on-surface">{item.summary}</p>
                    <div className="mt-4 flex flex-col gap-2">
                      {bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="rounded-lg bg-surface-container-lowest px-4 py-3 font-inter text-sm text-secondary"
                        >
                          {bullet}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
