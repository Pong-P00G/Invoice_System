"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import Link from "next/link";

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
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Branding Section */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-primary relative overflow-hidden items-center justify-center p-12 lg:p-24">
        {/* Abstract Background Decoration */}
        <div className="absolute inset-0 z-0">
          <svg className="absolute bottom-0 left-0 w-full h-full opacity-20 rotate-180" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="0" r="80" fill="url(#grad2)" />
            <circle cx="0" cy="100" r="60" fill="url(#grad2)" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,#2848b7_0%,transparent_50%)] opacity-40"></div>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="w-12 h-12 bg-white rounded-xl mb-12 flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 border-4 border-primary rounded-lg border-b-transparent animate-spin-slow"></div>
          </div>
          <h2 className="font-manrope text-4xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-8">
            Start your <span className="text-primary-light">financial journey.</span>
          </h2>
          <p className="font-inter text-lg text-white/60 leading-relaxed mb-12">
            Join thousands of professionals who have transformed their billing workflow. Scalable, secure, and built for speed.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-white font-bold text-2xl">99.9%</span>
              <span className="text-white/50 text-xs uppercase tracking-widest font-semibold">Uptime</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-white font-bold text-2xl">24/7</span>
              <span className="text-white/50 text-xs uppercase tracking-widest font-semibold">Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm flex flex-col gap-10">
          <div className="flex flex-col gap-3">
            <h1 className="font-manrope text-3xl font-bold tracking-tight text-on-surface">Create Workspace</h1>
            <p className="font-inter text-secondary">Get started with your 14-day free trial.</p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg text-sm font-medium flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="7"/><line x1="8" y1="5" x2="8" y2="9"/><line x1="8" y1="12" x2="8.01" y2="12"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-inter text-xs font-semibold text-on-surface-dim uppercase tracking-widest">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-outline-variant/30 rounded-xl p-3.5 font-inter text-sm text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline-variant"
                placeholder="Jane Doe"
              />
            </div>

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
                placeholder="jane@company.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-inter text-xs font-semibold text-on-surface-dim uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-outline-variant/30 rounded-xl p-3.5 font-inter text-sm text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline-variant"
                placeholder="Min. 8 characters"
              />
            </div>

            <div className="text-[11px] text-secondary leading-relaxed">
              By clicking "Create Account", you agree to our{" "}
              <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-inter font-semibold text-sm py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dim active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Account...
                </>
              ) : "Create Account"}
            </button>
          </form>

          <div className="text-center font-inter text-sm text-secondary">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
