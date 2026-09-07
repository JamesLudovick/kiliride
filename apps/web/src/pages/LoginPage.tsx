import {
  FormEvent,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { login } from "../lib/api";
import { saveAuthSession } from "../lib/auth";

const services = [
  {
    label: "Airport transfers",
    icon: Plane,
  },
  {
    label: "Vehicle rental",
    icon: Car,
  },
  {
    label: "Safari & tours",
    icon: Route,
  },
  {
    label: "Corporate travel",
    icon: BriefcaseBusiness,
  },
];

export function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] =
    useState("");
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [error, setError] = useState("");
  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  async function handleSubmit(
    event: FormEvent,
  ) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      const auth = await login(
        identifier.trim(),
        password,
      );

      saveAuthSession(auth);

      window.location.href =
        auth.user.role === "ADMIN" ||
        auth.user.role === "STAFF"
          ? "/dashboard"
          : auth.user.role === "CUSTOMER"
            ? "/account"
            : auth.user.role === "DRIVER"
              ? "/driver"
              : "/";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to sign in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand experience */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#062f27] lg:block">
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(36,192,146,0.25),transparent_29%),radial-gradient(circle_at_82%_84%,rgba(214,168,79,0.22),transparent_28%)]" />

        <div className="absolute -left-24 bottom-20 h-72 w-72 rounded-full border border-white/[0.05]" />
        <div className="absolute -left-10 bottom-6 h-72 w-72 rounded-full border border-white/[0.04]" />
        <div className="absolute right-14 top-28 h-40 w-40 rounded-full border border-white/[0.04]" />

        <div className="relative flex min-h-screen flex-col px-12 py-10 xl:px-16 xl:py-12">
          {/* Top brand */}
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-3"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d6a84f] text-[#073b2e] shadow-lg shadow-black/10">
                <Car className="h-5 w-5" />
              </div>

              <div>
                <p className="text-lg font-black tracking-[0.14em] text-white">
                  KILIRIDE
                </p>

                <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-100/40">
                  Mobility & Transport
                </p>
              </div>
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Website
            </Link>
          </div>

          {/* Main marketing message */}
          <div className="my-auto max-w-xl py-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.08] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              One KiliRide account
            </div>

            <h1 className="mt-6 text-5xl font-black leading-[1.02] tracking-[-0.045em] text-white xl:text-6xl">
              Move better.
              <span className="block text-[#62deb5]">
                Travel further.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-emerald-50/55">
              From everyday transport to
              airport transfers, rentals,
              chauffeur journeys, tours and
              business travel — KiliRide keeps
              every journey connected.
            </p>

            {/* Service grid */}
            <div className="mt-9 grid grid-cols-2 gap-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <div
                    key={service.label}
                    className="group rounded-2xl border border-white/[0.08] bg-white/[0.05] p-4 transition hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-[#d6a84f]">
                        <Icon className="h-4 w-4" />
                      </div>

                      <p className="text-xs font-semibold text-white/75">
                        {service.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust panel */}
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/10 p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-bold text-white">
                  Customer and team access
                </p>

                <p className="mt-1 text-[11px] leading-5 text-white/40">
                  Customers, staff and management
                  use the same secure KiliRide
                  sign-in.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 text-[11px] text-white/35">
            <span>
              KiliRide Mobility & Transport
            </span>

            <span>
              Built for journeys that grow.
            </span>
          </div>
        </div>
      </section>

      {/* Login side */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-8 lg:px-12">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-amber-100/30 blur-3xl" />

        <div className="relative w-full max-w-[460px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link
              to="/"
              className="flex items-center gap-3"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary text-white">
                <Car className="h-5 w-5" />
              </div>

              <div>
                <p className="font-black tracking-[0.08em] text-slate-900">
                  KILIRIDE
                </p>

                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Mobility & Transport
                </p>
              </div>
            </Link>
          </div>

          {/* Login card */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Secure access
                </span>

                <span className="text-[10px] font-semibold text-slate-400">
                  Customer · Team
                </span>
              </div>

              <div className="mt-6">
                <h2 className="text-3xl font-black tracking-[-0.035em] text-slate-950">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to your KiliRide
                  account and continue where you
                  left off.
                </p>
              </div>

              <form
                className="mt-8 grid gap-5"
                onSubmit={handleSubmit}
              >
                <label className="grid gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Email or username
                  </span>

                  <input
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                    value={identifier}
                    onChange={(event) =>
                      setIdentifier(
                        event.target.value,
                      )
                    }
                    type="text"
                    autoComplete="username"
                    placeholder="Email or username"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Password
                  </span>

                  <div className="relative">
                    <input
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value,
                        )
                      }
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      required
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current,
                        )
                      }
                      className="absolute right-3.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-primary"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </label>

                {error ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  className="mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087456] px-5 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-[#076448] disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}

                  {isSubmitting
                    ? "Signing in..."
                    : "Sign in to KiliRide"}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100" />

                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-300">
                  New here?
                </span>

                <div className="h-px flex-1 bg-slate-100" />
              </div>

              <Link
                to="/register"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/60"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Create a customer account
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Join KiliRide in a few
                      moments
                    </p>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </div>

            {/* Bottom security strip */}
            <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-8">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />

              <p className="text-[10px] leading-5 text-slate-400">
                Staff and management accounts are
                automatically directed to the
                operations dashboard.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 px-1 text-[10px] text-slate-400">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-semibold transition hover:text-primary"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to website
            </Link>

            <span>
              KiliRide Mobility & Transport
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
