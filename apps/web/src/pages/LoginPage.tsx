import { FormEvent, useState } from "react";
import { ArrowLeft, Loader2, LogIn, ShieldCheck } from "lucide-react";
import { login } from "../lib/api";
import { saveAuthSession } from "../lib/auth";

export function LoginPage() {
  const [email, setEmail] = useState("admin@kiliride.local");
  const [password, setPassword] = useState("AdminPassword123");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const auth = await login(email, password);
      saveAuthSession(auth);
      window.location.href = auth.user.role === "ADMIN" ? "/admin" : "/";
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-muted/30 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden border-r bg-card px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to website
        </a>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">KiliRide</p>
          <h1 className="mt-3 max-w-xl text-4xl font-bold leading-tight">
            Operations access for the Moshi transport team.
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Staff and managers use this area to control fleet operations, bookings,
            drivers, services, and reports as the platform grows.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Protected by the NestJS authentication API
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <div>
            <p className="text-sm font-medium text-primary">Admin login</p>
            <h2 className="mt-2 text-2xl font-semibold">Sign in to KiliRide</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use the seeded admin account or another authorized staff account.
            </p>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium">
              Email
              <input
                className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring-4"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Password
              <input
                className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-primary/20 focus:ring-4"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <button
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Sign in
            </button>
          </form>

          <a className="mt-5 inline-flex text-sm text-muted-foreground lg:hidden" href="/">
            Back to website
          </a>
        </div>
      </section>
    </main>
  );
}
