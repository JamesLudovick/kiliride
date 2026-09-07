import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  Loader2,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { login } from "../lib/api";
import { saveAuthSession } from "../lib/auth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const auth = await login(email, password);
      saveAuthSession(auth);

      window.location.href =
        auth.user.role === "ADMIN" || auth.user.role === "STAFF"
          ? "/dashboard"
          : "/";
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Login failed",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#0c2923] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(42,190,148,0.24),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(210,155,60,0.12),transparent_28%)]" />

        <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-14">
          <div>
            <a
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-100/80 transition hover:text-white"
              href="/"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to website
            </a>

            <div className="mt-16 max-w-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-emerald-300">
                <Car className="h-7 w-7" />
              </div>

              <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                KiliRide Operations
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-tight text-white xl:text-5xl">
                Manage your fleet with confidence.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-emerald-100/70">
                One place for vehicles, bookings, drivers, maintenance,
                payments and daily transport operations.
              </p>
            </div>

            <div className="mt-10 grid max-w-md gap-3">
              {[
                "Fleet and vehicle management",
                "Booking and driver operations",
                "Operational reporting",
              ].map((item) => (
                <div
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  key={item}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
                  <span className="text-sm font-medium text-white/80">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-100/50">
            <ShieldCheck className="h-4 w-4" />
            Protected by the KiliRide authentication API
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <a
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary lg:hidden"
            href="/"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </a>

          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                <Car className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-slate-900">KiliRide</p>
                <p className="text-xs text-slate-500">Operations</p>
              </div>
            </div>
          </div>

          <div className="kr-card p-6 sm:p-8">
            <div>
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-primary">
                Staff access
              </span>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to access the KiliRide operations dashboard.
              </p>
            </div>

            <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
              <label className="kr-label">
                Email address

                <input
                  className="kr-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="you@kiliride.com"
                  required
                />
              </label>

              <label className="kr-label">
                Password

                <input
                  className="kr-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                />
              </label>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                className="kr-button-primary mt-1 w-full"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}

                {isSubmitting ? "Signing in..." : "Sign in to dashboard"}
              </button>
            </form>
            
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            KiliRide Management System · Moshi, Kilimanjaro
          </p>
        </div>
      </section>
    </main>
  );
}