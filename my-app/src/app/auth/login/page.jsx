"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
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
        <div className="absolute top-0 left-0 w-full h-full bg-surface-container-lowest opacity-50"></div>
        {/* Subtle glowing elements */}
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-tertiary-container blur-[120px] opacity-30"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary-dim blur-[140px] opacity-10"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-surface-container-lowest bg-opacity-85 backdrop-blur-[20px] rounded-2xl shadow-[0px_12px_32px_rgba(42,52,57,0.06)] p-10 flex flex-col gap-8">
        
        <div className="flex flex-col gap-2 text-center">
          <h1 className="font-manrope text-[2rem] font-bold tracking-tight text-on-surface">Sign In</h1>
          <p className="font-inter text-sm text-secondary">Access your editorial workspace.</p>
        </div>

        {error && (
          <div className="bg-error-container text-on-surface p-3 rounded-sm text-sm font-inter text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
              placeholder="name@company.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-inter text-[0.6875rem] uppercase tracking-wider font-semibold text-secondary">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-surface-container-highest border border-[rgba(169,180,185,0.15)] rounded-sm p-3 font-inter text-sm text-on-surface transition-all focus:border-b-2 focus:border-b-primary focus:border-transparent outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-linear-to-r from-primary to-primary-dim text-on-primary font-inter font-medium text-sm py-3 rounded-sm transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="text-center font-inter text-xs text-secondary">
          Don't have an account?{" "}
          <a href="/auth/register" className="text-primary font-semibold hover:underline">
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
