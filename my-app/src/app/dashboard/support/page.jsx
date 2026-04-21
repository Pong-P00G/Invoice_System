"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getAuditLogs, getInvoices, getPayments, getTenantMe } from "@/lib/api";

const SUPPORT_EMAIL = "support@ledger.local";

const INITIAL_FORM = {
  topic: "billing",
  priority: "normal",
  subject: "",
  details: "",
};

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tenant, setTenant] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);
  const copyResetTimerRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [tenantData, invoiceData, paymentData, auditData] = await Promise.allSettled([
          getTenantMe(),
          getInvoices(),
          getPayments(),
          getAuditLogs({ limit: 8 }),
        ]);

        if (!active) return;

        if (tenantData.status === "fulfilled") {
          setTenant(tenantData.value?.tenant || null);
        }
        if (invoiceData.status === "fulfilled") {
          setInvoices(invoiceData.value?.invoices || []);
        }
        if (paymentData.status === "fulfilled") {
          setPayments(paymentData.value?.payments || []);
        }
        if (auditData.status === "fulfilled") {
          setLogs(auditData.value?.logs || []);
        }

        const failures = [tenantData, invoiceData, paymentData, auditData].filter((result) => result.status === "rejected");
        if (failures.length === 4) {
          setError("Unable to load support diagnostics.");
        } else if (failures.length > 0) {
          setError("Some diagnostics could not be loaded. You can still submit a support request.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
      if (copyResetTimerRef.current) {
        window.clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  const diagnostics = useMemo(() => {
    const overdueInvoices = invoices.filter((invoice) => {
      if (!invoice?.dueDate) return false;
      if (["paid", "cancelled"].includes(String(invoice.status || "").toLowerCase())) return false;
      return new Date(invoice.dueDate) < new Date();
    }).length;

    const lastPayment = payments[0]?.paidAt ? new Date(payments[0].paidAt).toLocaleString() : "No payments yet";
    const lastLog = logs[0]?.createdAt ? new Date(logs[0].createdAt).toLocaleString() : "No recent audit logs";
    const workspaceAge = tenant?.createdAt
      ? `${Math.max(1, Math.floor((Date.now() - new Date(tenant.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} days`
      : "Unavailable";

    return {
      overdueInvoices,
      lastPayment,
      lastLog,
      workspaceAge,
    };
  }, [invoices, logs, payments, tenant]);

  const requestDraft = useMemo(() => {
    return [
      `Workspace: ${tenant?.name || "Unknown workspace"}`,
      `Topic: ${form.topic}`,
      `Priority: ${form.priority}`,
      `Subject: ${form.subject || "-"}`,
      `Details: ${form.details || "-"}`,
      `Open invoices: ${invoices.length}`,
      `Overdue invoices: ${diagnostics.overdueInvoices}`,
      `Payments captured: ${payments.length}`,
      `Latest audit entry: ${logs[0]?.action || "Unavailable"}`,
    ].join("\n");
  }, [diagnostics.overdueInvoices, form.details, form.priority, form.subject, form.topic, invoices.length, logs, payments.length, tenant]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitMessage("");
    setSubmitError("");

    if (!form.subject.trim() || !form.details.trim()) {
      setSubmitError("Subject and details are required.");
      return;
    }

    const subject = encodeURIComponent(`[${form.priority.toUpperCase()}] ${form.subject.trim()}`);
    const body = encodeURIComponent(requestDraft);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitMessage("Support draft prepared in your mail client.");
  };

  const handleCopy = async () => {
    try {
      if (!navigator?.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(requestDraft);
      setCopied(true);
      setSubmitError("");
      if (copyResetTimerRef.current) {
        window.clearTimeout(copyResetTimerRef.current);
      }
      copyResetTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copyResetTimerRef.current = null;
      }, 2000);
    } catch {
      setSubmitError("Unable to copy the support summary.");
    }
  };

  const supportLanes = [
    {
      title: "Billing and Reconciliation",
      detail: "Invoice totals, tax treatment, balance mismatches, and payment matching.",
      sla: "Target response: 4 business hours",
    },
    {
      title: "Workspace Administration",
      detail: "Tenant configuration, owner access, and cross-team workspace issues.",
      sla: "Target response: same business day",
    },
    {
      title: "Technical Operations",
      detail: "API failures, login issues, and workflow interruptions across the dashboard.",
      sla: "Target response: 2 business hours",
    },
  ];

  const knowledgeBase = [
    "Review invoice status history before escalating payment disputes.",
    "Confirm tenant slug and owner role in Settings before reporting access issues.",
    "Attach the exact invoice number or audit action whenever possible.",
  ];

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-[rgba(169,180,185,0.14)] bg-linear-to-br from-[#ffffff] via-[#f5f9ff] to-[#eef2f7] p-7 shadow-[0px_14px_40px_rgba(42,52,57,0.06)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-primary-dim">
              Operational Support
            </div>
            <h1 className="mt-2 font-manrope text-[2.25rem] font-extrabold tracking-tight text-on-surface leading-tight">
              Support
            </h1>
            <p className="mt-2 max-w-2xl font-inter text-sm text-secondary">
              Escalate issues with enough workspace context that someone can act on them immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Workspace" value={tenant?.name || "Unknown"} />
            <MetricCard label="Open Invoices" value={String(invoices.length)} />
            <MetricCard label="Overdue" value={String(diagnostics.overdueInvoices)} tone={diagnostics.overdueInvoices > 0 ? "warn" : "success"} />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-[rgba(220,38,38,0.2)] bg-[#fff4f3] px-4 py-3 font-inter text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <div className="flex flex-col gap-5">
          <section className="rounded-[1.25rem] border border-[rgba(169,180,185,0.14)] bg-surface-container-lowest p-6 shadow-[0px_8px_28px_rgba(42,52,57,0.04)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-manrope text-xl font-bold text-on-surface">Support Lanes</h2>
                <p className="mt-1 font-inter text-xs text-secondary">
                  Pick the lane that matches the operational failure you need resolved.
                </p>
              </div>
              <div className="rounded-full bg-surface-container-high px-3 py-1 font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-secondary">
                {SUPPORT_EMAIL}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              {supportLanes.map((lane) => (
                <div
                  key={lane.title}
                  className="rounded-2xl border border-[rgba(169,180,185,0.14)] bg-surface-container-highest px-4 py-4"
                >
                  <div className="font-manrope text-lg font-bold text-on-surface">{lane.title}</div>
                  <div className="mt-1 font-inter text-sm text-secondary">{lane.detail}</div>
                  <div className="mt-3 font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-primary-dim">
                    {lane.sla}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <form
            onSubmit={handleSubmit}
            className="rounded-[1.25rem] border border-[rgba(169,180,185,0.14)] bg-surface-container-lowest p-6 shadow-[0px_8px_28px_rgba(42,52,57,0.04)]"
          >
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-manrope text-xl font-bold text-on-surface">Create Support Draft</h2>
                <p className="mt-1 font-inter text-xs text-secondary">
                  Build a structured escalation with live workspace diagnostics embedded.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                    Topic
                  </span>
                  <select
                    value={form.topic}
                    onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                    className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-3 py-3 font-inter text-sm text-on-surface"
                  >
                    <option value="billing">Billing</option>
                    <option value="access">Access Control</option>
                    <option value="workspace">Workspace Configuration</option>
                    <option value="technical">Technical Incident</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                    Priority
                  </span>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                    className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-3 py-3 font-inter text-sm text-on-surface"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                  Subject
                </span>
                <input
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Example: Payment matched to the wrong invoice"
                  className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-3 py-3 font-inter text-sm text-on-surface"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                  Details
                </span>
                <textarea
                  value={form.details}
                  onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                  placeholder="Describe what happened, what you expected, and the exact records affected."
                  rows={6}
                  className="resize-none rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-3 py-3 font-inter text-sm text-on-surface"
                />
              </label>

              <div className="rounded-2xl border border-[rgba(169,180,185,0.14)] bg-[#f8fbff] p-4">
                <div className="font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-secondary">
                  Draft Preview
                </div>
                <pre className="mt-3 whitespace-pre-wrap wrap-break-words font-inter text-xs leading-6 text-on-surface">
                  {requestDraft}
                </pre>
              </div>

              {submitError && <div className="font-inter text-sm text-error">{submitError}</div>}
              {submitMessage && <div className="font-inter text-sm text-success">{submitMessage}</div>}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-linear-to-r from-primary to-primary-dim px-5 py-3 font-inter text-[0.8125rem] font-medium text-on-primary transition-opacity hover:opacity-90"
                >
                  Open Email Draft
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-5 py-3 font-inter text-[0.8125rem] font-medium text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  {copied ? "Copied" : "Copy Summary"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-[1.25rem] border border-[rgba(169,180,185,0.14)] bg-surface-container-lowest p-6 shadow-[0px_8px_28px_rgba(42,52,57,0.04)]">
            <div>
              <h2 className="font-manrope text-xl font-bold text-on-surface">Live Diagnostics</h2>
              <p className="mt-1 font-inter text-xs text-secondary">
                Current workspace signals that help support triage faster.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <InfoTile label="Workspace Age" value={diagnostics.workspaceAge} helper="Approximate age of the current tenant record." />
              <InfoTile label="Latest Payment" value={diagnostics.lastPayment} helper="Most recent payment activity available in the workspace." />
              <InfoTile label="Latest Audit Event" value={diagnostics.lastLog} helper="Most recent audit activity captured by the API." />
              <InfoTile label="Payments Loaded" value={String(payments.length)} helper="Number of payments returned by the support diagnostics call." />
            </div>
          </section>

          <section className="rounded-[1.25rem] border border-[rgba(169,180,185,0.14)] bg-surface-container-lowest p-6 shadow-[0px_8px_28px_rgba(42,52,57,0.04)]">
            <div>
              <h2 className="font-manrope text-xl font-bold text-on-surface">Escalation Notes</h2>
              <p className="mt-1 font-inter text-xs text-secondary">
                Include these details to reduce back-and-forth.
              </p>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {knowledgeBase.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[rgba(169,180,185,0.14)] bg-surface-container-highest px-4 py-4 font-inter text-sm text-on-surface"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {loading && <div className="font-inter text-sm text-secondary">Loading support diagnostics...</div>}
    </div>
  );
}

function MetricCard({ label, value, tone = "neutral" }) {
  const toneClass = {
    neutral: "bg-surface-container-high text-on-surface",
    success: "bg-success-container text-success",
    warn: "bg-[#fff4df] text-[#9a6700]",
  }[tone];

  return (
    <div className="rounded-2xl border border-[rgba(169,180,185,0.12)] bg-white/80 px-4 py-3 backdrop-blur-sm">
      <div className="font-inter text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-secondary">
        {label}
      </div>
      <div className={`mt-2 inline-flex rounded-full px-3 py-1 font-inter text-sm font-semibold ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}

function InfoTile({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-[rgba(169,180,185,0.14)] bg-surface-container-highest px-4 py-4">
      <div className="font-inter text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-secondary">
        {label}
      </div>
      <div className="mt-2 wrap-break-words font-manrope text-lg font-bold text-on-surface">
        {value}
      </div>
      <div className="mt-1 font-inter text-xs text-secondary">
        {helper}
      </div>
    </div>
  );
}
