"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import Link from "next/link";

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
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Branding Section */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12 lg:p-24">
        {/* Abstract Background Decoration */}
        <div className="absolute inset-0 z-0">
          <svg className="absolute top-0 right-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="0" r="80" fill="url(#grad1)" />
            <circle cx="0" cy="100" r="60" fill="url(#grad1)" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#2848b7_0%,transparent_50%)] opacity-40"></div>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="w-12 h-12 bg-white rounded-xl mb-12 flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 border-4 border-primary rounded-full border-t-transparent animate-spin-slow"></div>
          </div>
          <h2 className="font-manrope text-4xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-8">
            Empowering your <span className="text-primary-light">financial vision.</span>
          </h2>
          <p className="font-inter text-lg text-white/60 leading-relaxed mb-12">
            The intelligent ledger system designed for modern enterprises. Manage invoices, track performance, and scale with confidence.
          </p>
          
          <div className="flex gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-primary overflow-hidden">
                  <img src={`https://i.pravatar.cc/40?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="text-white/60 text-sm font-medium flex flex-col justify-center">
              <span>Trusted by 500+ companies</span>
              <div className="flex items-center gap-1">
                <span className="text-success">★★★★★</span>
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h1 className="font-manrope text-3xl font-bold tracking-tight text-on-surface">Welcome Back</h1>
            <p className="font-inter text-secondary">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg text-sm font-medium flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="7"/><line x1="8" y1="5" x2="8" y2="9"/><line x1="8" y1="12" x2="8.01" y2="12"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-inter text-xs font-semibold text-on-surface-dim uppercase tracking-widest">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-outline-variant/30 rounded-xl p-3.5 font-inter text-sm text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline-variant"
                placeholder="name@company.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-inter text-xs font-semibold text-on-surface-dim uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="font-inter text-xs font-medium text-primary hover:underline">Forgot?</a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-outline-variant/30 rounded-xl p-3.5 font-inter text-sm text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline-variant"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-outline-variant text-primary focus:ring-primary" />
              <label htmlFor="remember" className="font-inter text-sm text-secondary cursor-pointer">Remember me for 30 days</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-inter font-semibold text-sm py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dim active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : "Sign In"}
            </button>
          </form>

          <div className="text-center font-inter text-sm text-secondary">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary font-bold hover:underline">
              Create a workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
