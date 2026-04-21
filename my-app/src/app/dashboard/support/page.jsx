"use client";

export default function SupportPage() {
  const items = [
    { title: "Billing and Invoice Issues", detail: "Resolve invoice calculation, taxes, and payment reconciliation issues." },
    { title: "Workspace Administration", detail: "Manage tenant settings, user roles, and security controls." },
    { title: "Technical Assistance", detail: "Diagnose API/network errors and workflow interruptions quickly." },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-manrope text-[2.25rem] font-extrabold tracking-tight text-on-surface leading-tight">
          Support
        </h1>
        <p className="font-inter text-sm text-secondary mt-1">
          Access documentation and contact channels for operational support.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]"
          >
            <h2 className="font-manrope text-lg font-bold text-on-surface">{item.title}</h2>
            <p className="font-inter text-sm text-secondary mt-1.5">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0px_2px_12px_rgba(42,52,57,0.03)]">
        <div className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold mb-2">
          Contact
        </div>
        <div className="font-inter text-sm text-on-surface">support@ledger.local</div>
      </div>
    </div>
  );
}
