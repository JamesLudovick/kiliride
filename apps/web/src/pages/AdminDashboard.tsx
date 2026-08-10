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
  Wrench,
  ArrowUpRight,
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
  { label: "Settings", icon: Settings },
];

const stats = [
  {
    label: "Total vehicles",
    value: "0",
    hint: "Fleet vehicles registered",
    icon: Car,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Pending bookings",
    value: "0",
    hint: "Awaiting approval",
    icon: CalendarClock,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Active rentals",
    value: "0",
    hint: "Currently on the road",
    icon: BarChart3,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Revenue today",
    value: "TZS 0",
    hint: "Payments not connected yet",
    icon: CircleDollarSign,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
];

export function AdminDashboard() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [status, setStatus] = useState("Checking session...");

  useEffect(() => {
    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (currentUser.role !== "ADMIN") {
          setStatus("This area is only for admin users.");
          return;
        }

        setUser(currentUser);
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
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="kr-card w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-xl font-bold">KiliRide Operations</h1>

          <p className="mt-2 text-sm text-slate-500">{status}</p>

          <a
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            href="/login"
          >
            Go to login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="kr-sidebar hidden min-h-screen lg:flex lg:flex-col">
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Car className="h-5 w-5 text-emerald-300" />
            </div>

            <div>
              <p className="text-base font-bold text-white">KiliRide</p>
              <p className="text-[11px] font-medium text-emerald-200">
                Fleet Management
              </p>
            </div>
          </div>
        </div>

        <div className="px-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/70">
            Main menu
          </p>

          <nav className="grid gap-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = index === 0;

              return (
                <button
                  className={`kr-sidebar-item ${
                    active ? "kr-sidebar-item-active" : ""
                  }`}
                  key={item.label}
                  onClick={() => {
                    if (item.label === "Vehicles") {
                      window.location.href = "/dashboard/vehicles";
                    }
                  }}
                  type="button"
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  <span>{item.label}</span>

                  {item.label === "Vehicles" && (
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold text-white">
              KiliRide Operations
            </p>
            <p className="mt-1 text-[11px] leading-5 text-emerald-100/65">
              Manage your fleet, bookings, drivers and daily transport
              operations.
            </p>

            <button
              className="mt-4 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-white/10 hover:text-white"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <header className="border-b bg-white">
          <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                KiliRide Operations
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {user?.name || "Administrator"}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:block">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                System online
              </div>

              <button
                className="hidden items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 lg:inline-flex"
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-7 px-5 py-7 sm:px-7">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article className="kr-stat-card" key={stat.label}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>

                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {stat.value}
                      </p>
                    </div>

                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">{stat.hint}</p>
                </article>
              );
            })}
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <article className="kr-card overflow-hidden">
              <div className="border-b bg-gradient-to-r from-emerald-50/80 to-white px-5 py-5">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Development roadmap
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  KiliRide platform progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Core modules being prepared for daily fleet operations.
                </p>
              </div>

              <div className="grid gap-3 p-5">
                {[
                  {
                    title: "Vehicle management",
                    description:
                      "Register vehicles, track availability and manage fleet status.",
                    done: true,
                  },
                  {
                    title: "Booking approvals",
                    description:
                      "Review customer requests and approve upcoming trips.",
                    done: false,
                  },
                  {
                    title: "Driver assignments",
                    description:
                      "Assign drivers and coordinate daily transport operations.",
                    done: false,
                  },
                  {
                    title: "Payments & reports",
                    description:
                      "Track revenue, transactions and operational reports.",
                    done: false,
                  },
                ].map((item, index) => (
                  <div
                    className="flex items-center gap-4 rounded-xl border bg-white p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30"
                    key={item.title}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        item.done
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800">
                        {item.title}
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    {item.done && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                        Ready
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </article>

            <article className="kr-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Account
                  </p>
                  <h2 className="font-bold text-slate-900">Session</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Name
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {user?.name}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                    {user?.email}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                      Role
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-800">
                      {user?.role}
                    </p>
                  </div>

                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </div>
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}