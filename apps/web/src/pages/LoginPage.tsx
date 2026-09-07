import {
  FormEvent,
  useState,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
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

const journeyTypes = [
  {
    label: "Airport",
    icon: Plane,
  },
  {
    label: "Rental",
    icon: Car,
  },
  {
    label: "Tours",
    icon: Route,
  },
];

export function LoginPage() {
  const [identifier, setIdentifier] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

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
    <main className="min-h-screen bg-[#edf3f0] p-0 lg:p-4">
      <div className="mx-auto min-h-screen max-w-[1600px] overflow-hidden bg-white lg:grid lg:min-h-[calc(100vh-2rem)] lg:grid-cols-[1.08fr_0.92fr] lg:rounded-[34px] lg:shadow-[0_30px_90px_rgba(7,59,46,0.12)]">
        {/* Brand side */}
        <section className="relative hidden overflow-hidden bg-[#062f27] lg:flex lg:flex-col">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_14%,rgba(30,190,143,0.24),transparent_30%),radial-gradient(circle_at_86%_82%,rgba(214,168,79,0.20),transparent_29%)]" />

          <div className="absolute -left-24 bottom-[-70px] h-80 w-80 rounded-full border border-white/[0.06]" />
          <div className="absolute -left-10 bottom-[-20px] h-72 w-72 rounded-full border border-white/[0.05]" />
          <div className="absolute right-[-80px] top-24 h-64 w-64 rounded-full border border-white/[0.04]" />

          <div className="relative flex min-h-full flex-1 flex-col px-10 py-9 xl:px-14 xl:py-11">
            {/* Brand */}
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="flex items-center gap-3"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d6a84f] text-[#073b2e] shadow-xl shadow-black/10">
                  <Car className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-lg font-black tracking-[0.14em] text-white">
                    KILIRIDE
                  </p>

                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">
                    Mobility & Transport
                  </p>
                </div>
              </Link>

              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-bold text-white/55 transition hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Website
              </Link>
            </div>

            {/* Main content */}
            <div className="my-auto max-w-[620px] py-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/10 bg-emerald-300/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" />
                One account. Your journey.
              </div>

              <h1 className="mt-6 text-5xl font-black leading-[0.98] tracking-[-0.05em] text-white xl:text-6xl">
                Move with
                <span className="block text-[#63dfb6]">
                  confidence.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-emerald-50/55">
                Book transport, manage journeys
                and stay connected with KiliRide
                from one secure account.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                {journeyTypes.map(
                  (journey) => {
                    const Icon = journey.icon;

                    return (
                      <div
                        key={journey.label}
                        className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2.5"
                      >
                        <Icon className="h-4 w-4 text-[#d6a84f]" />

                        <span className="text-xs font-semibold text-white/65">
                          {journey.label}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>

              {/* Experience card */}
              <div className="mt-10 max-w-lg rounded-[24px] border border-white/[0.09] bg-white/[0.055] p-5 backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d6a84f]">
                      KiliRide access
                    </p>

                    <h2 className="mt-2 text-lg font-black text-white">
                      One sign-in. The right
                      workspace.
                    </h2>
                  </div>

                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[
                    "Customer",
                    "Driver",
                    "Operations",
                  ].map((role) => (
                    <div
                      key={role}
                      className="rounded-xl bg-black/10 px-3 py-3 text-center"
                    >
                      <p className="text-[10px] font-bold text-white/55">
                        {role}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-[10px] text-white/30">
              <span>
                KiliRide Mobility & Transport
              </span>

              <span>
                Transport · Rental · Travel
              </span>
            </div>
          </div>
        </section>

        {/* Login section */}
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-8 sm:px-8 lg:min-h-full lg:px-12 xl:px-16">
          <div className="absolute right-[-70px] top-[-70px] h-80 w-80 rounded-full bg-emerald-100/45 blur-3xl" />

          <div className="absolute bottom-[-100px] left-[-70px] h-72 w-72 rounded-full bg-amber-100/35 blur-3xl" />

          <div className="relative w-full max-w-[440px]">
            {/* Mobile header */}
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Link
                to="/"
                className="flex items-center gap-3"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#073b2e] text-white">
                  <Car className="h-5 w-5" />
                </div>

                <div>
                  <p className="font-black tracking-[0.1em] text-[#073b2e]">
                    KILIRIDE
                  </p>

                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Mobility & Transport
                  </p>
                </div>
              </Link>

              <Link
                to="/"
                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500"
                aria-label="Back to website"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#087456]">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Secure sign in
                </span>
              </div>

              <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] text-[#073b2e]">
                Welcome back.
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Enter your email or username to
                continue to your KiliRide
                account.
              </p>
            </div>

            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit}
            >
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-700">
                  Email or username
                </span>

                <input
                  className="h-[52px] w-full rounded-[14px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-350 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
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

              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-700">
                  Password
                </span>

                <div className="relative">
                  <input
                    className="h-[52px] w-full rounded-[14px] border border-slate-200 bg-white px-4 pr-12 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-350 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
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
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current,
                      )
                    }
                    className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-[#087456]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#087456] px-5 text-sm font-black text-white shadow-lg shadow-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-[#076448] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )}

                {isSubmitting
                  ? "Signing in..."
                  : "Continue to KiliRide"}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                New customer
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <Link
              to="/register"
              className="group flex items-center justify-between rounded-[18px] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-[#087456]">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Create an account
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Start planning your journeys
                  </p>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#087456]" />
            </Link>

            <div className="mt-8 flex items-center gap-2 text-[10px] leading-5 text-slate-400">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />

              <span>
                Customers, drivers and operations
                teams are directed automatically
                to their correct workspace.
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
