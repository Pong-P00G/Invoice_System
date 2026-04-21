"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("651234567890123456789012"); // Mock tenant ID for the demo
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register(name, email, password, tenantId);
      if (data.error) {
        setError(data.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background layer */}
      <div className="absolute inset-0 z-0 bg-surface">
        <div className="absolute top-0 left-0 w-full h-full bg-surface-container-low opacity-50"></div>
        {/* Subtle glowing elements */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-tertiary-container blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[60%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-dim blur-[140px] opacity-10"></div>
      </div>

      {/* Register Card (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-md bg-surface-container-lowest bg-opacity-85 backdrop-blur-[20px] rounded-2xl shadow-[0px_12px_32px_rgba(42,52,57,0.06)] p-10 flex flex-col gap-8">
        
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-manrope text-[2rem] font-bold tracking-tight text-on-surface">Create Workspace</h1>
          <p className="font-inter text-sm text-secondary">Sign up to manage your financial narrative.</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-surface p-3 rounded-sm text-sm font-inter text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-3 font-inter text-sm text-on-surface transition-all focus:border-b-2 focus:border-b-primary focus:border-transparent outline-none"
              placeholder="Jane Doe"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-3 font-inter text-sm text-on-surface transition-all focus:border-b-2 focus:border-b-primary focus:border-transparent outline-none"
              placeholder="jane@company.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-3 font-inter text-sm text-on-surface transition-all focus:border-b-2 focus:border-b-primary focus:border-transparent outline-none"
              placeholder="Min 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-linear-to-r from-primary to-primary-dim text-on-primary font-inter font-medium text-sm py-3 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="text-center font-inter text-xs text-secondary">
          Already have an account?{" "}
          <a href="/auth/login" className="text-primary font-semibold hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
