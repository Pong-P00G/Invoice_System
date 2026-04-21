"use client";

import { useEffect, useState } from "react";
import { changePassword, getMe, getTenantMe, updateTenantMe } from "@/lib/api";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [tenantMissing, setTenantMissing] = useState(false);
  const [tenantForm, setTenantForm] = useState({ name: "", slug: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const meData = await getMe();
        if (!active) return;
        setIsOwner(String(meData?.user?.role || "").toLowerCase() === "owner");

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
            const defaultName = "My Workspace";
            const defaultSlug = "my-workspace";
            setTenantMissing(true);
            setTenantForm({
              name: defaultName,
              slug: defaultSlug,
            });
          } else {
            setProfileError(tenantErr.message || "Failed to load workspace settings.");
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

  if (loading) {
    return <div className="font-inter text-sm text-secondary">Loading settings...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-manrope text-[2.25rem] font-extrabold tracking-tight text-on-surface leading-tight">
          Settings
        </h1>
        <p className="font-inter text-sm text-secondary mt-1">
          Manage workspace profile and account security controls.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-5">
        <form
          onSubmit={handleProfileSave}
          className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)] flex flex-col gap-5"
        >
          <div>
            <h2 className="font-manrope text-lg font-bold text-on-surface">Workspace Profile</h2>
            <p className="font-inter text-xs text-secondary mt-1">
              These details identify your tenant across invoice records.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-inter text-[0.6875rem] uppercase tracking-wider text-secondary font-semibold">
                Workspace Name
              </span>
              <input
                value={tenantForm.name}
                onChange={(e) => setTenantForm((prev) => ({ ...prev, name: e.target.value }))}
                disabled={!isOwner || savingProfile}
                className="bg-surface-container-highest border border-[rgba(169,180,185,0.2)] rounded-md px-3 py-2.5 font-inter text-sm text-on-surface disabled:opacity-60"
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
                className="bg-surface-container-highest border border-[rgba(169,180,185,0.2)] rounded-md px-3 py-2.5 font-inter text-sm text-on-surface disabled:opacity-60"
                placeholder="acme-studio"
              />
            </label>
          </div>

          {!isOwner && (
            <div className="font-inter text-xs text-secondary bg-surface-container-high rounded-md p-3">
              Only workspace owners can update tenant profile settings.
            </div>
          )}
          {tenantMissing && isOwner && (
            <div className="font-inter text-xs text-secondary bg-surface-container-high rounded-md p-3">
              Tenant record was missing. Save this form to recreate workspace settings.
            </div>
          )}
          {profileError && <div className="font-inter text-sm text-error">{profileError}</div>}
          {profileMessage && <div className="font-inter text-sm text-success">{profileMessage}</div>}

          <div>
            <button
              type="submit"
              disabled={!isOwner || savingProfile}
              className="bg-linear-to-r from-primary to-primary-dim text-on-primary font-inter font-medium text-[0.8125rem] py-2.5 px-5 rounded-md transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save Workspace Settings"}
            </button>
          </div>
        </form>

        <form
          onSubmit={handlePasswordSave}
          className="bg-surface-container-lowest rounded-xl p-6 shadow-[0px_2px_12px_rgba(42,52,57,0.03)] flex flex-col gap-4"
        >
          <div>
            <h2 className="font-manrope text-lg font-bold text-on-surface">Password Security</h2>
            <p className="font-inter text-xs text-secondary mt-1">
              Rotate your password regularly to keep your account secure.
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
              className="bg-surface-container-highest border border-[rgba(169,180,185,0.2)] rounded-md px-3 py-2.5 font-inter text-sm text-on-surface"
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
              className="bg-surface-container-highest border border-[rgba(169,180,185,0.2)] rounded-md px-3 py-2.5 font-inter text-sm text-on-surface"
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
              className="bg-surface-container-highest border border-[rgba(169,180,185,0.2)] rounded-md px-3 py-2.5 font-inter text-sm text-on-surface"
            />
          </label>

          {passwordError && <div className="font-inter text-sm text-error">{passwordError}</div>}
          {passwordMessage && <div className="font-inter text-sm text-success">{passwordMessage}</div>}

          <button
            type="submit"
            disabled={savingPassword}
            className="bg-surface-container-highest border border-[rgba(169,180,185,0.2)] text-on-surface font-inter font-medium text-[0.8125rem] py-2.5 px-5 rounded-md hover:bg-surface-container-high transition-colors disabled:opacity-60"
          >
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
