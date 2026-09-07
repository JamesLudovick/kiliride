import {
  FormEvent,
  useState,
} from "react";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  MapPin,
  Plane,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";

import { register } from "../lib/api";
import { saveAuthSession } from "../lib/auth";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] =
    useState("");
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

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

    const cleanName = name.trim();

    if (cleanName.length < 2) {
      setError(
        "Please enter your full name.",
      );
      return;
    }

    if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
      setError(
        "Username must be 3–30 characters and can use letters, numbers, dots, underscores or hyphens.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Your password must be at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "The two passwords do not match.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = await register({
        name: cleanName,
        username: username.trim().toLowerCase(),
        email: email.trim(),
        phone:
          phone.trim() || undefined,
        password,
      });

      saveAuthSession(auth);
      window.location.href = "/account";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7faf8] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden bg-[#073b2e] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(16,185,129,0.25),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(214,168,79,0.18),transparent_30%)]" />

        <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-14">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-100/70 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to KiliRide
            </Link>

            <div className="mt-16 max-w-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#d6a84f]">
                <Car className="h-7 w-7" />
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.22em] text-[#d6a84f]">
                Your KiliRide account
              </p>

              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl">
                Your journey starts
                <span className="block text-emerald-300">
                  before the road does.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-emerald-100/65">
                Create an account for a smoother
                KiliRide experience across
                Kilimanjaro and beyond.
              </p>
            </div>

            <div className="mt-10 grid max-w-md gap-3">
              {[
                {
                  icon: Plane,
                  text: "Airport transfers and travel services",
                },
                {
                  icon: MapPin,
                  text: "Transport around Kilimanjaro and Tanzania",
                },
                {
                  icon: CheckCircle2,
                  text: "One account for your KiliRide journey",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-emerald-300" />
                    <span className="text-sm font-medium text-white/75">
                      {item.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-100/45">
            <LockKeyhole className="h-4 w-4" />
            Customer accounts are protected by
            KiliRide authentication
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-lg">
          <Link
            to="/"
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-primary lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to KiliRide
          </Link>

          <div className="mb-7 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white">
                <Car className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  KiliRide
                </p>
                <p className="text-xs text-slate-500">
                  Kilimanjaro, Tanzania
                </p>
              </div>
            </div>
          </div>

          <div className="kr-card p-6 sm:p-8">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-primary">
                <UserPlus className="h-3.5 w-3.5" />
                Customer account
              </span>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Join KiliRide and get ready for
                your next journey.
              </p>
            </div>

            <form
              className="mt-7 grid gap-4"
              onSubmit={handleSubmit}
            >
              <label className="kr-label">
                Full name

                <input
                  className="kr-input"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  type="text"
                  autoComplete="name"
                  placeholder="James Nasuwa"
                  required
                />
              </label>

              <label className="kr-label">
                Username

                <input
                  className="kr-input"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                        .toLowerCase()
                        .replace(/\s/g, ""),
                    )
                  }
                  type="text"
                  autoComplete="username"
                  placeholder="james.nasuwa"
                  minLength={3}
                  maxLength={30}
                  required
                />

                <span className="mt-1 block text-[11px] font-normal text-slate-400">
                  You can use this instead of your email when signing in.
                </span>
              </label>

              <label className="kr-label">
                Email address

                <input
                  className="kr-input"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value,
                    )
                  }
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="kr-label">
                Phone number
                <span className="ml-1 font-normal text-slate-400">
                  (optional)
                </span>

                <input
                  className="kr-input"
                  value={phone}
                  onChange={(event) =>
                    setPhone(
                      event.target.value,
                    )
                  }
                  type="tel"
                  autoComplete="tel"
                  placeholder="+255..."
                />
              </label>

              <label className="kr-label">
                Password

                <div className="relative">
                  <input
                    className="kr-input pr-11"
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
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    minLength={8}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </label>

              <label className="kr-label">
                Confirm password

                <input
                  className="kr-input"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value,
                    )
                  }
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  required
                />
              </label>

              <p className="text-xs leading-5 text-slate-400">
                Public registration creates a
                customer account only. Staff and
                management access is assigned
                internally.
              </p>

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
                  <UserPlus className="h-4 w-4" />
                )}

                {isSubmitting
                  ? "Creating account..."
                  : "Create KiliRide account"}
              </button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            KiliRide · Moshi, Kilimanjaro
          </p>
        </div>
      </section>
    </main>
  );
}
