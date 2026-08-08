import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  Car,
  CircleDollarSign,
  ClipboardCheck,
  LogOut,
  Settings,
  ShieldCheck,
  UsersRound,
  Wrench
} from "lucide-react";
import { getCurrentUser } from "../lib/api";
import { AuthUser, clearAuthSession, getStoredUser } from "../lib/auth";

const navItems = [
  { label: "Dashboard", icon: BarChart3 },
  { label: "Vehicles", icon: Car },
  { label: "Bookings", icon: CalendarClock },
  { label: "Customers", icon: UsersRound },
  { label: "Drivers", icon: ShieldCheck },
  { label: "Maintenance", icon: Wrench },
  { label: "Payments", icon: CircleDollarSign },
  { label: "Reports", icon: ClipboardCheck },
  { label: "Settings", icon: Settings }
];

const stats = [
  { label: "Total vehicles", value: "0", hint: "Vehicle module next" },
  { label: "Pending bookings", value: "0", hint: "Booking flow coming soon" },
  { label: "Active rentals", value: "0", hint: "Operations dashboard" },
  { label: "Revenue today", value: "TZS 0", hint: "Payments not connected yet" }
];

export function AdminDashboard() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [status, setStatus] = useState("Checking session...");

  useEffect(() => {
    getCurrentUser()
      .then(({ user }) => {
        if (user.role !== "ADMIN") {
          setStatus("This area is only for admin users.");
          return;
        }

        setUser(user);
        setStatus("");
      })
      .catch(() => {
        clearAuthSession();
        window.location.href = "/login";
      });
  }, []);

  function handleLogout() {
    clearAuthSession();
    window.location.href = "/login";
  }

  if (status) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-5">
        <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
          <p className="font-medium">{status}</p>
          <a className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" href="/login">
            Go to login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 text-foreground lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b bg-card lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <a href="/" className="block">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">KiliRide</p>
            <h1 className="text-lg font-semibold">Admin</h1>
          </a>
          <button
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm lg:hidden"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:grid lg:overflow-visible">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = index === 0;
            return (
              <button
                className={`inline-flex min-w-max items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
                key={item.label}
                type="button"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section>
        <header className="flex flex-wrap items-center justify-between gap-4 border-b bg-card px-5 py-4">
          <div>
            <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
            <h2 className="text-2xl font-semibold">Operations Dashboard</h2>
          </div>
          <button
            className="hidden items-center gap-2 rounded-md border px-3 py-2 text-sm lg:inline-flex"
            onClick={handleLogout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </header>

        <div className="px-5 py-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article className="rounded-lg border bg-card p-4 shadow-sm" key={stat.label}>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{stat.hint}</p>
              </article>
            ))}
          </section>

          <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-lg border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Build Roadmap</h3>
              <div className="mt-4 grid gap-3">
                {["Vehicle management", "Booking approvals", "Driver assignments", "Payments and reports"].map(
                  (item, index) => (
                    <div className="flex items-center gap-3 rounded-md border p-3" key={item}>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium">{item}</p>
                    </div>
                  )
                )}
              </div>
            </article>

            <article className="rounded-lg border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Session</h3>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">{user?.name}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">Role</dt>
                  <dd className="font-medium">{user?.role}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted-foreground">API</dt>
                  <dd className="font-medium text-primary">Connected</dd>
                </div>
              </dl>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
