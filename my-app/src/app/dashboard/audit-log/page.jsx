"use client";

import { useEffect, useMemo, useState } from "react";
import { getAuditLogs } from "@/lib/api";

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

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openLogId, setOpenLogId] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getAuditLogs({ limit: 50 });
        if (!active) return;
        setLogs(data?.logs || []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load audit logs.");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const groupedLogs = useMemo(() => {
    return logs.map((log) => ({
      ...log,
      actor: log.userId?.name || log.userId?.email || "System",
      entity: log.entityType || "Unknown entity",
      createdLabel: log.createdAt ? new Date(log.createdAt).toLocaleString() : "-",
      metadata: Object.entries(log.meta || {}),
    }));
  }, [logs]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-manrope text-[2.25rem] font-extrabold tracking-tight text-on-surface leading-tight">
          Audit Log
        </h1>
        <p className="font-inter text-sm text-secondary mt-1">
          Trace user and system actions for compliance and diagnostics.
        </p>
      </div>

      {error && <div className="font-inter text-sm text-error">{error}</div>}
      {loading && <div className="font-inter text-sm text-secondary">Loading audit events...</div>}

      {!loading && (
        <div className="flex flex-col gap-4">
          {groupedLogs.map((log) => {
            const open = openLogId === log._id;
            return (
              <div
                key={log._id}
                className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0px_2px_12px_rgba(42,52,57,0.03)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenLogId((current) => (current === log._id ? null : log._id))}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1fr)] md:items-center">
                    <div>
                      <div className="font-manrope text-base font-bold text-on-surface">{log.action || "-"}</div>
                      <div className="mt-1 font-inter text-xs uppercase tracking-[0.18em] text-secondary">Action</div>
                    </div>
                    <div className="font-inter text-sm text-secondary">
                      <span className="font-semibold text-on-surface">{log.entity}</span>
                    </div>
                    <div className="font-inter text-sm text-secondary">{log.actor}</div>
                    <div className="font-inter text-sm text-secondary">{log.createdLabel}</div>
                  </div>
                  <div className="shrink-0 text-secondary">
                    <Chevron open={open} />
                  </div>
                </button>

                {open && (
                  <div className="border-t border-[rgba(169,180,185,0.14)] bg-surface-container-highest/40 px-5 py-4">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <DetailBlock label="Action" value={log.action || "-"} />
                      <DetailBlock label="Entity" value={log.entity} />
                      <DetailBlock label="Actor" value={log.actor} />
                    </div>

                    <div className="mt-4">
                      <div className="font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-secondary">
                        Metadata
                      </div>
                      {log.metadata.length > 0 ? (
                        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                          {log.metadata.map(([key, value]) => (
                            <div
                              key={key}
                              className="rounded-lg bg-surface-container-lowest px-4 py-3 font-inter text-sm text-secondary"
                            >
                              <span className="font-semibold text-on-surface">{key}:</span> {formatValue(value)}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-3 rounded-lg bg-surface-container-lowest px-4 py-3 font-inter text-sm text-secondary">
                          No metadata captured for this event.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {groupedLogs.length === 0 && (
            <div className="rounded-xl bg-surface-container-lowest px-4 py-8 text-center font-inter text-sm text-secondary shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
              No audit events found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailBlock({ label, value }) {
  return (
    <div className="rounded-lg bg-surface-container-lowest px-4 py-3">
      <div className="font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-secondary">
        {label}
      </div>
      <div className="mt-2 break-words font-inter text-sm text-on-surface">
        {value}
      </div>
    </div>
  );
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
