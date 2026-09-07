import {
  ArrowRight,
  CalendarDays,
  Car,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Compass,
  Headphones,
  Home,
  LogOut,
  MapPin,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { logout } from "../lib/api";
import {
  clearAuthSession,
  getStoredUser,
} from "../lib/auth";

const services = [
  {
    title: "Airport transfer",
    description:
      "Pickup or drop-off for your flight.",
    icon: Plane,
  },
  {
    title: "Vehicle rental",
    description:
      "Choose transport for your own journey.",
    icon: Car,
  },
  {
    title: "Safari & tours",
    description:
      "Transport for tours and longer travel.",
    icon: Route,
  },
];

export function CustomerAccountPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const rawFirstName =
    user?.name.trim().split(/\s+/)[0] ??
    "Traveller";

  const firstName =
    rawFirstName.charAt(0).toUpperCase() +
    rawFirstName.slice(1).toLowerCase();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      clearAuthSession();
    } finally {
      navigate("/", {
        replace: true,
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-950 lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      {/* Desktop customer navigation */}
      <aside className="hidden min-h-screen flex-col bg-[#073b2e] text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-6">
          <Link
            to="/account"
            className="flex items-center gap-3"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d6a84f] text-[#073b2e]">
              <Car className="h-5 w-5" />
            </div>

            <div>
              <p className="font-black tracking-[0.13em]">
                KILIRIDE
              </p>

              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                Customer
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
            My KiliRide
          </p>

          <nav className="space-y-1.5">
            <CustomerNavItem
              icon={Home}
              label="Overview"
              href="#overview"
              active
            />

            <CustomerNavItem
              icon={CalendarDays}
              label="My journeys"
              href="#journeys"
            />

            <CustomerNavItem
              icon={WalletCards}
              label="Payments"
              href="#payments"
            />

            <CustomerNavItem
              icon={UserRound}
              label="My profile"
              href="#profile"
            />
          </nav>

          <p className="mb-3 mt-8 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
            Explore
          </p>

          <nav className="space-y-1.5">
            <CustomerNavItem
              icon={Compass}
              label="Plan a journey"
              href="#services"
            />

            <CustomerNavItem
              icon={Headphones}
              label="Support"
              href="#support"
            />
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-2xl bg-white/[0.06] p-3.5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-black">
                {firstName
                  .slice(0, 1)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold">
                  {user?.name}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-white/35">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/55 transition hover:bg-red-500/10 hover:text-red-200"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Customer application */}
      <section className="min-w-0">
        {/* Mobile header */}
        <header className="border-b border-slate-200 bg-white lg:hidden">
          <div className="flex h-[72px] items-center justify-between px-5">
            <Link
              to="/account"
              className="flex items-center gap-3"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
                <Car className="h-5 w-5" />
              </div>

              <div>
                <p className="font-black tracking-[0.1em] text-slate-900">
                  KILIRIDE
                </p>

                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  My account
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {/* Top customer header */}
          <section
            id="overview"
            className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  My KiliRide
                </span>

                <span className="text-xs text-slate-400">
                  Customer account
                </span>
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] text-[#073b2e] sm:text-4xl">
                Welcome back,{" "}
                <span className="text-[#c39235]">
                  {firstName}
                </span>
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Everything about your journeys in
                one place.
              </p>
            </div>

            <a
              href="#services"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#087456] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#076448]"
            >
              Plan a journey
              <ArrowRight className="h-4 w-4" />
            </a>
          </section>

          {/* Customer summary */}
          <section className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryCard
              icon={CalendarDays}
              label="Journeys"
              value="0"
              note="Your bookings"
            />

            <SummaryCard
              icon={Clock3}
              label="Upcoming"
              value="0"
              note="No scheduled trip"
            />

            <SummaryCard
              icon={CircleDollarSign}
              label="Balance"
              value="—"
              note="No payment due"
            />
          </section>

          {/* Main dashboard */}
          <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
            {/* Upcoming trip */}
            <article
              id="journeys"
              className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                    Next journey
                  </p>

                  <h2 className="mt-1 font-bold text-slate-950">
                    Upcoming trip
                  </h2>
                </div>

                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>

              <div className="relative flex min-h-[310px] items-center justify-center overflow-hidden px-6 py-10">
                <div className="absolute right-[-50px] top-[-50px] h-52 w-52 rounded-full bg-emerald-50" />
                <div className="absolute bottom-[-90px] left-[-60px] h-56 w-56 rounded-full bg-amber-50" />

                <div className="relative max-w-md text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[#073b2e] text-white shadow-lg shadow-emerald-950/10">
                    <MapPin className="h-7 w-7" />
                  </div>

                  <h3 className="mt-5 text-xl font-black text-slate-900">
                    No journey scheduled
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Your next confirmed trip,
                    assigned vehicle and driver
                    will appear here.
                  </p>

                  <a
                    href="#services"
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-white"
                  >
                    Start planning
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </article>

            {/* Profile */}
            <aside
              id="profile"
              className="space-y-4"
            >
              <article className="overflow-hidden rounded-[24px] bg-[#073b2e] p-5 text-white shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                    <UserRound className="h-5 w-5 text-emerald-300" />
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-200">
                    <ShieldCheck className="h-3 w-3" />
                    Active
                  </span>
                </div>

                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/35">
                  Customer profile
                </p>

                <h3 className="mt-1 text-xl font-black">
                  {user?.name}
                </h3>

                <p className="mt-1 truncate text-xs text-white/45">
                  {user?.email}
                </p>

                {user?.phone && (
                  <p className="mt-1 text-xs text-white/45">
                    {user.phone}
                  </p>
                )}

                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-[11px] leading-5 text-white/40">
                    Your personal travel and
                    account information will stay
                    connected to this profile.
                  </p>
                </div>
              </article>

              <article
                id="payments"
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-[#b98222]">
                    <WalletCards className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      Payments
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      No payment activity yet
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Current balance
                    </span>

                    <span className="text-sm font-black text-slate-800">
                      —
                    </span>
                  </div>
                </div>
              </article>
            </aside>
          </section>

          {/* Services */}
          <section
            id="services"
            className="mt-6"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                  Explore
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Plan your next journey
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose the type of transport
                  you need.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <button
                    key={service.title}
                    type="button"
                    className="group rounded-[22px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-primary transition group-hover:bg-primary group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary" />
                    </div>

                    <h3 className="mt-5 font-black text-slate-900">
                      {service.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {service.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Support */}
          <section
            id="support"
            className="mt-6 flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600">
                <Headphones className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-slate-900">
                  Need help with a journey?
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  KiliRide support will be
                  available from your customer
                  account.
                </p>
              </div>
            </div>

            <Link
              to="/"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Visit website
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <p className="py-7 text-center text-[10px] text-slate-400 lg:text-left">
            KiliRide Mobility & Transport ·
            Customer portal
          </p>
        </div>
      </section>
    </main>
  );
}

function CustomerNavItem({
  icon: Icon,
  label,
  href,
  active = false,
}: {
  icon: typeof Home;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-white/10 text-white"
          : "text-white/50 hover:bg-white/[0.06] hover:text-white/80"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>

        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-950">
            {value}
          </span>

          <span className="truncate text-[10px] text-slate-400">
            {note}
          </span>
        </div>
      </div>
    </article>
  );
}
