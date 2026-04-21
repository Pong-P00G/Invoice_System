"use client";

export default function AppsPage() {
  const apps = [
    { name: "Invoices", desc: "Create, manage, and track invoice lifecycle." },
    { name: "Payments", desc: "Record inbound and outbound payment activity." },
    { name: "Clients", desc: "Manage client profiles and billing relationships." },
    { name: "Reports", desc: "Review financial KPIs and performance trends." },
    { name: "Audit Log", desc: "Inspect historical system and user actions." },
    { name: "Settings", desc: "Configure workspace profile and security controls." },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-manrope text-[2.25rem] font-extrabold tracking-tight text-on-surface leading-tight">
          Workspace Apps
        </h1>
        <p className="font-inter text-sm text-secondary mt-1">
          Quick launcher for modules available in this environment.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {apps.map((app) => (
          <div
            key={app.name}
            className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]"
          >
            <div className="font-manrope text-lg font-bold text-on-surface">{app.name}</div>
            <div className="font-inter text-sm text-secondary mt-1">{app.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
