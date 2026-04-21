"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getInvoices, getMe, logout } from "@/lib/api";

/* ── SVG Icon Components ── */
const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const IconInvoices = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="1" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="5.5" y1="5.5" x2="12.5" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="5.5" y1="9" x2="12.5" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="5.5" y1="12.5" x2="9.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconCreateNew = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="9" y1="5" x2="9" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="5" y1="9" x2="13" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconClients = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M1 15.5C1 12.5 3.5 10 7 10C10.5 10 13 12.5 13 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="13.5" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M17 15.5C17 13 15.5 11 13.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconReports = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="1" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="5" y="8" width="2.5" height="5" rx="0.5" fill="currentColor"/>
    <rect x="8" y="5" width="2.5" height="8" rx="0.5" fill="currentColor"/>
    <rect x="11" y="7" width="2.5" height="6" rx="0.5" fill="currentColor"/>
  </svg>
);

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.05 3.05L4.1 4.1M11.9 11.9L12.95 12.95M3.05 12.95L4.1 11.9M11.9 4.1L12.95 3.05" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const IconSupport = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
    <text x="8" y="11.5" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="600">?</text>
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="10.8" y1="10.8" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 15c0 1.1.9 2 2 2s2-.9 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M9 2C6.24 2 4 4.24 4 7v4l-1.5 2h13L14 11V7c0-2.76-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);

const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="4" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="9" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="14" cy="4" r="1.5" fill="currentColor"/>
    <circle cx="4" cy="9" r="1.5" fill="currentColor"/>
    <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
    <circle cx="14" cy="9" r="1.5" fill="currentColor"/>
    <circle cx="4" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="9" cy="14" r="1.5" fill="currentColor"/>
    <circle cx="14" cy="14" r="1.5" fill="currentColor"/>
  </svg>
);

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const data = await getMe();
      if (!data || !data.user) {
        router.push("/auth/login");
      } else {
        setUser(data.user);
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handleQuickExport = async () => {
    try {
      setExporting(true);
      const data = await getInvoices();
      const invoices = data?.invoices || [];
      const rows = [
        ["Invoice Number", "Client", "Issue Date", "Due Date", "Status", "Total", "Balance Due"],
        ...invoices.map((inv) => [
          inv.invoiceNumber || "",
          inv.clientId?.name || inv.customerId?.name || "Unknown",
          inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : "",
          inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "",
          inv.status || "",
          Number(inv.total || 0).toFixed(2),
          Number(inv.balanceDue || 0).toFixed(2),
        ]),
      ];

      const csv = rows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: IconDashboard },
    { name: "Invoices", path: "/dashboard/invoices", icon: IconInvoices },
    { name: "Create New", path: "/dashboard/create", icon: IconCreateNew },
    { name: "Clients", path: "/dashboard/clients", icon: IconClients },
    { name: "Reports", path: "/dashboard/reports", icon: IconReports },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="font-manrope text-secondary animate-pulse text-lg">Loading Workspace...</div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="h-screen flex bg-surface overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-50 shrink-0 bg-surface-container-low flex flex-col justify-between py-6 px-4 h-screen overflow-y-auto">
        {/* Brand */}
        <div>
          <div className="px-2 mb-8">
            <div className="font-manrope font-extrabold text-on-surface text-base tracking-tight leading-tight">
              The Ledger
            </div>
            <div className="font-inter text-[0.6rem] uppercase tracking-[0.15em] text-primary-dim font-semibold mt-0.5">
              Enterprise Account
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.path || 
                (link.path !== "/dashboard" && pathname.startsWith(link.path));
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-md font-inter text-[0.8125rem] transition-all ${
                    isActive
                      ? "bg-surface-container-lowest text-primary font-semibold shadow-[0px_1px_4px_rgba(42,52,57,0.04)]"
                      : "text-secondary hover:text-on-surface hover:bg-surface-container-lowest/40"
                  }`}
                >
                  <Icon />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-1 mt-auto">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 py-2 px-3 rounded-md font-inter text-[0.8125rem] transition-all ${
              pathname === "/dashboard/settings"
                ? "bg-surface-container-lowest text-primary font-semibold shadow-[0px_1px_4px_rgba(42,52,57,0.04)]"
                : "text-secondary hover:text-on-surface hover:bg-surface-container-lowest/40"
            }`}
          >
            <IconSettings /> Settings
          </Link>
          <Link
            href="/dashboard/support"
            className={`flex items-center gap-3 py-2 px-3 rounded-md font-inter text-[0.8125rem] transition-all ${
              pathname === "/dashboard/support"
                ? "bg-surface-container-lowest text-primary font-semibold shadow-[0px_1px_4px_rgba(42,52,57,0.04)]"
                : "text-secondary hover:text-on-surface hover:bg-surface-container-lowest/40"
            }`}
          >
            <IconSupport /> Support
          </Link>
          
          {/* User profile */}
          <div className="flex items-center gap-2.5 mt-4 px-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface text-[0.6875rem] font-semibold font-inter">
              {getInitials(user.name)}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-inter font-semibold text-on-surface text-[0.8125rem]">{user.name}</span>
              <span className="font-inter text-[0.625rem] text-secondary uppercase tracking-wider">{user.role || "ADMIN"}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* ── Top Bar ── */}
        <header className="shrink-0 bg-surface-container-lowest px-8 py-3 flex items-center justify-between">
          {/* Left: Search */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-surface-container-highest rounded-md px-4 py-2 w-72">
              <IconSearch />
              <input
                type="text"
                placeholder="Search directives..."
                className="bg-transparent font-inter text-sm text-on-surface placeholder:text-outline-variant w-full"
              />
            </div>
            <nav className="flex items-center gap-5">
              <Link href="/dashboard/directives" className="font-inter text-[0.8125rem] text-secondary hover:text-on-surface transition-colors">
                Directives
              </Link>
              <Link href="/dashboard/audit-log" className="font-inter text-[0.8125rem] text-secondary hover:text-on-surface transition-colors">
                Audit Log
              </Link>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/notifications")}
              className="text-secondary hover:text-on-surface transition-colors p-1"
            >
              <IconBell />
            </button>
            <button
              onClick={() => router.push("/dashboard/apps")}
              className="text-secondary hover:text-on-surface transition-colors p-1"
            >
              <IconGrid />
            </button>
            <button
              onClick={handleQuickExport}
              disabled={exporting}
              className="bg-linear-to-r from-primary to-primary-dim text-on-primary font-inter font-medium text-[0.8125rem] py-2 px-5 rounded-md transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {exporting ? "Exporting..." : "Quick Export"}
            </button>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 bg-surface-container-lowest overflow-y-auto">
          <div className="max-w-300 mx-auto px-8 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
