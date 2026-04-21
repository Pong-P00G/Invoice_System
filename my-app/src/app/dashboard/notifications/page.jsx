"use client";

import { useEffect, useState } from "react";
import { getAuditLogs } from "@/lib/api";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await getAuditLogs({ limit: 15 });
        if (!active) return;
        const notifications = (data?.logs || []).map((log) => ({
          id: log._id,
          title: log.action || "Activity",
          subtitle: `${log.entityType || "system"} updated`,
          time: new Date(log.createdAt).toLocaleString(),
        }));
        setItems(notifications);
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
          Notifications
        </h1>
        <p className="font-inter text-sm text-secondary mt-1">
          Recent account and billing activities across your workspace.
        </p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
        {loading && <div className="font-inter text-sm text-secondary">Loading notifications...</div>}
        {!loading && items.length === 0 && (
          <div className="font-inter text-sm text-secondary">No notifications yet.</div>
        )}
        {!loading && items.length > 0 && (
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div key={item.id} className="bg-surface-container-highest rounded-md p-3">
                <div className="font-inter text-sm font-medium text-on-surface">{item.title}</div>
                <div className="font-inter text-xs text-secondary mt-0.5">{item.subtitle}</div>
                <div className="font-inter text-xs text-secondary mt-1">{item.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
