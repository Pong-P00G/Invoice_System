"use client";

import { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/api";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <div className="bg-surface-container-lowest rounded-xl shadow-[0px_2px_12px_rgba(42,52,57,0.03)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/60">
                <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Action</th>
                <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Entity</th>
                <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">User</th>
                <th className="py-3 px-4 font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3.5 px-4 font-inter text-sm font-medium text-on-surface">{log.action || "-"}</td>
                  <td className="py-3.5 px-4 font-inter text-sm text-secondary">{log.entityType || "-"}</td>
                  <td className="py-3.5 px-4 font-inter text-sm text-secondary">{log.userId?.name || log.userId?.email || "-"}</td>
                  <td className="py-3.5 px-4 font-inter text-sm text-secondary">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center font-inter text-sm text-secondary">
                    No audit events found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
