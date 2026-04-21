"use client";

import { useEffect, useState } from "react";
import { changePassword, getMe, getTenantMe, updateTenantMe } from "@/lib/api";

const DEFAULT_PREFERENCES = {
  compactTables: false,
  emailSummaries: true,
  overdueAlerts: true,
  weekStartsOn: "monday",
};

const PREFERENCES_KEY = "ledger-dashboard-preferences";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [tenantMissing, setTenantMissing] = useState(false);
  const [tenantForm, setTenantForm] = useState({ name: "", slug: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [preferencesMessage, setPreferencesMessage] = useState("");
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const meData = await getMe();
        if (!active) return;

        const nextUser = meData?.user || null;
        setUser(nextUser);
        setIsOwner(String(nextUser?.role || "").toLowerCase() === "owner");

        try {
          const tenantData = await getTenantMe();
          if (!active) return;
          setTenantMissing(false);
          setTenantForm({
            name: tenantData?.tenant?.name || "",
            slug: tenantData?.tenant?.slug || "",
          });
        } catch (tenantErr) {
          if (!active) return;
          if ((tenantErr.message || "").toLowerCase().includes("tenant not found")) {
            setTenantMissing(true);
            setTenantForm({
              name: "My Workspace",
              slug: "my-workspace",
            });
          } else {
            setProfileError(tenantErr.message || "Failed to load workspace settings.");
          }
        }

        const storedPreferences = window.localStorage.getItem(PREFERENCES_KEY);
        if (storedPreferences) {
          try {
            const parsed = JSON.parse(storedPreferences);
            if (active) {
              setPreferences((prev) => ({ ...prev, ...parsed }));
            }
          } catch {
            window.localStorage.removeItem(PREFERENCES_KEY);
          }
        }
      } catch (err) {
        if (!active) return;
        setProfileError(err.message || "Failed to load workspace settings.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileMessage("");
    setProfileError("");

    if (!tenantForm.name.trim() || !tenantForm.slug.trim()) {
      setProfileError("Workspace name and slug are required.");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await updateTenantMe({
        name: tenantForm.name.trim(),
        slug: tenantForm.slug.trim(),
      });
      setTenantForm({
        name: res?.tenant?.name || tenantForm.name.trim(),
        slug: res?.tenant?.slug || tenantForm.slug.trim(),
      });
      setTenantMissing(false);
      setProfileMessage("Workspace settings updated.");
    } catch (err) {
      setProfileError(err.message || "Failed to save workspace settings.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage("Password updated successfully.");
    } catch (err) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handlePreferenceToggle = (key) => {
    setPreferencesMessage("");
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePreferenceSave = (e) => {
    e.preventDefault();
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    setPreferencesMessage("Local dashboard preferences saved.");
  };

  if (loading) {
    return <div className="font-inter text-sm text-secondary">Loading settings...</div>;
  }

  const workspaceCompletion = [
    Boolean(tenantForm.name.trim()),
    Boolean(tenantForm.slug.trim()),
    Boolean(user?.email),
    Boolean(user?.role),
  ].filter(Boolean).length;
  const workspaceScore = Math.round((workspaceCompletion / 4) * 100);

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[1.5rem] border border-[rgba(169,180,185,0.14)] bg-linear-to-br from-[#ffffff] via-[#f7faff] to-[#eef4ff] p-7 shadow-[0px_14px_40px_rgba(42,52,57,0.06)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-primary-dim">
              Workspace Control
            </div>
            <h1 className="mt-2 font-manrope text-[2.25rem] font-extrabold tracking-tight text-on-surface leading-tight">
              Settings
            </h1>
            <p className="mt-2 max-w-2xl font-inter text-sm text-secondary">
              Keep tenant identity, account security, and daily operator preferences aligned in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Workspace Score" value={`${workspaceScore}%`} tone="primary" />
            <MetricCard label="Role Access" value={user?.role || "Unknown"} tone="neutral" />
            <MetricCard label="Profile State" value={tenantMissing ? "Needs Save" : "Active"} tone={tenantMissing ? "warn" : "success"} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <div className="flex flex-col gap-5">
          <form
            onSubmit={handleProfileSave}
            className="rounded-[1.25rem] border border-[rgba(169,180,185,0.14)] bg-surface-container-lowest p-6 shadow-[0px_8px_28px_rgba(42,52,57,0.04)]"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-manrope text-xl font-bold text-on-surface">Workspace Profile</h2>
                  <p className="mt-1 font-inter text-xs text-secondary">
                    These values identify your tenant across invoice, payment, and reporting flows.
                  </p>
                </div>
                <div className="rounded-full bg-surface-container-high px-3 py-1 font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-secondary">
                  Tenant Identity
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                    Workspace Name
                  </span>
                  <input
                    value={tenantForm.name}
                    onChange={(e) => setTenantForm((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!isOwner || savingProfile}
                    className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-3 py-3 font-inter text-sm text-on-surface disabled:opacity-60"
                    placeholder="Acme Studio"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                    Workspace Slug
                  </span>
                  <input
                    value={tenantForm.slug}
                    onChange={(e) => setTenantForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                    disabled={!isOwner || savingProfile}
                    className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-3 py-3 font-inter text-sm text-on-surface disabled:opacity-60"
                    placeholder="acme-studio"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <InfoTile label="Owner Access" value={isOwner ? "Enabled" : "Restricted"} helper={isOwner ? "You can update tenant metadata." : "Only owners can save tenant changes."} />
                <InfoTile label="Tenant Record" value={tenantMissing ? "Missing" : "Connected"} helper={tenantMissing ? "Save once to recreate the record." : "Workspace profile is available."} />
                <InfoTile label="Workspace URL" value={tenantForm.slug ? `/t/${tenantForm.slug}` : "Pending"} helper="Internal routing reference for the workspace slug." />
              </div>

              {!isOwner && (
                <div className="rounded-xl bg-surface-container-high px-4 py-3 font-inter text-xs text-secondary">
                  Only workspace owners can update tenant profile settings.
                </div>
              )}
              {tenantMissing && isOwner && (
                <div className="rounded-xl bg-surface-container-high px-4 py-3 font-inter text-xs text-secondary">
                  Tenant record was missing. Save this form to recreate workspace settings.
                </div>
              )}
              {profileError && <div className="font-inter text-sm text-error">{profileError}</div>}
              {profileMessage && <div className="font-inter text-sm text-success">{profileMessage}</div>}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={!isOwner || savingProfile}
                  className="rounded-xl bg-linear-to-r from-primary to-primary-dim px-5 py-3 font-inter text-[0.8125rem] font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save Workspace Settings"}
                </button>
                <div className="font-inter text-xs text-secondary">
                  Changes update tenant metadata for the current workspace.
                </div>
              </div>
            </div>
          </form>

          <form
            onSubmit={handlePreferenceSave}
            className="rounded-[1.25rem] border border-[rgba(169,180,185,0.14)] bg-surface-container-lowest p-6 shadow-[0px_8px_28px_rgba(42,52,57,0.04)]"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-manrope text-xl font-bold text-on-surface">Workspace Preferences</h2>
                  <p className="mt-1 font-inter text-xs text-secondary">
                    Local view controls for the current browser session and workstation.
                  </p>
                </div>
                <div className="rounded-full bg-[#edf4ff] px-3 py-1 font-inter text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-primary-dim">
                  Local Only
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <ToggleRow
                  title="Compact Table Density"
                  detail="Tighten row spacing for invoice and payment tables."
                  checked={preferences.compactTables}
                  onChange={() => handlePreferenceToggle("compactTables")}
                />
                <ToggleRow
                  title="Email Summary Reminder"
                  detail="Keep reminder summaries enabled in your workspace routine."
                  checked={preferences.emailSummaries}
                  onChange={() => handlePreferenceToggle("emailSummaries")}
                />
                <ToggleRow
                  title="Overdue Alerts Priority"
                  detail="Surface overdue invoice warnings more aggressively."
                  checked={preferences.overdueAlerts}
                  onChange={() => handlePreferenceToggle("overdueAlerts")}
                />
              </div>

              <label className="flex flex-col gap-1.5 max-w-sm">
                <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                  Week Starts On
                </span>
                <select
                  value={preferences.weekStartsOn}
                  onChange={(e) => {
                    setPreferencesMessage("");
                    setPreferences((prev) => ({ ...prev, weekStartsOn: e.target.value }));
                  }}
                  className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-3 py-3 font-inter text-sm text-on-surface"
                >
                  <option value="monday">Monday</option>
                  <option value="sunday">Sunday</option>
                  <option value="saturday">Saturday</option>
                </select>
              </label>

              {preferencesMessage && <div className="font-inter text-sm text-success">{preferencesMessage}</div>}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-5 py-3 font-inter text-[0.8125rem] font-medium text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  Save Local Preferences
                </button>
                <div className="font-inter text-xs text-secondary">
                  Stored in this browser only.
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col gap-5">
          <section className="rounded-[1.25rem] border border-[rgba(169,180,185,0.14)] bg-surface-container-lowest p-6 shadow-[0px_8px_28px_rgba(42,52,57,0.04)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-manrope text-xl font-bold text-on-surface">Account Access</h2>
                <p className="mt-1 font-inter text-xs text-secondary">
                  Current operator context for this workspace.
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-on-primary">
                {String(user?.name || "U")
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3">
              <InfoTile label="Full Name" value={user?.name || "Unknown"} helper="Authenticated account display name." />
              <InfoTile label="Email" value={user?.email || "Unavailable"} helper="Primary login email for this account." />
              <InfoTile label="Role" value={user?.role || "Unknown"} helper="Role returned by the current session." />
            </div>
          </section>

          <form
            onSubmit={handlePasswordSave}
            className="rounded-[1.25rem] border border-[rgba(169,180,185,0.14)] bg-surface-container-lowest p-6 shadow-[0px_8px_28px_rgba(42,52,57,0.04)]"
          >
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-manrope text-xl font-bold text-on-surface">Password Security</h2>
                <p className="mt-1 font-inter text-xs text-secondary">
                  Rotate your password regularly and keep operators off shared credentials.
                </p>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                  Current Password
                </span>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  disabled={savingPassword}
                  className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-3 py-3 font-inter text-sm text-on-surface"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                  New Password
                </span>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  disabled={savingPassword}
                  className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-3 py-3 font-inter text-sm text-on-surface"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                  Confirm New Password
                </span>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  disabled={savingPassword}
                  className="rounded-xl border border-[rgba(169,180,185,0.2)] bg-surface-container-highest px-3 py-3 font-inter text-sm text-on-surface"
                />
              </label>

              <div className="rounded-xl bg-surface-container-high px-4 py-3 font-inter text-xs text-secondary">
                Minimum 8 characters. Password updates apply to the authenticated account immediately.
              </div>

              {passwordError && <div className="font-inter text-sm text-error">{passwordError}</div>}
              {passwordMessage && <div className="font-inter text-sm text-success">{passwordMessage}</div>}

              <button
                type="submit"
                disabled={savingPassword}
                className="rounded-xl bg-linear-to-r from-primary to-primary-dim px-5 py-3 font-inter text-[0.8125rem] font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, tone }) {
  const toneClass = {
    primary: "bg-[#eff4ff] text-primary",
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
      <div className="mt-2 font-manrope text-lg font-bold text-on-surface break-words">
        {value}
      </div>
      <div className="mt-1 font-inter text-xs text-secondary">
        {helper}
      </div>
    </div>
  );
}

function ToggleRow({ title, detail, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-[rgba(169,180,185,0.14)] bg-surface-container-highest px-4 py-4">
      <div>
        <div className="font-inter text-sm font-semibold text-on-surface">{title}</div>
        <div className="mt-1 font-inter text-xs text-secondary">{detail}</div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative mt-0.5 h-7 w-12 rounded-full transition-colors ${checked ? "bg-primary-dim" : "bg-surface-container-high"}`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-[0px_2px_6px_rgba(42,52,57,0.2)] transition-all ${checked ? "left-6" : "left-1"}`}
        />
      </button>
    </label>
  );
}
