import {
  ArrowRight,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  ChevronRight,
  Crown,
  LogOut,
  MapPin,
  Plane,
  Route,
  ShieldCheck,
  Sparkles,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { logout } from "../lib/api";
import {
  clearAuthSession,
  getStoredUser,
  isStaffOrAdmin,
} from "../lib/auth";

const services = [
  {
    name: "Airport Transfers",
    detail:
      "Reliable arrivals and departures for Kilimanjaro International Airport and nearby destinations.",
    icon: Plane,
  },
  {
    name: "Self-Drive Rental",
    detail:
      "Flexible vehicle rental for customers who want freedom to travel on their own schedule.",
    icon: Car,
  },
  {
    name: "Chauffeur Service",
    detail:
      "Professional driver transport for business, leisure and private journeys.",
    icon: Crown,
  },
  {
    name: "Safari & Tour Transport",
    detail:
      "Comfortable transport for safari departures, tours and travel around Tanzania.",
    icon: Route,
  },
  {
    name: "Corporate Travel",
    detail:
      "Organised transport solutions for companies, teams, guests and business movements.",
    icon: BriefcaseBusiness,
  },
  {
    name: "Wedding & Event Transport",
    detail:
      "Coordinated vehicle and guest transport for weddings, events and special occasions.",
    icon: UsersRound,
  },
];

const fleetCategories = [
  {
    name: "SUV",
    detail:
      "Safari, long-distance and premium travel.",
  },
  {
    name: "Sedan",
    detail:
      "Airport, city and business journeys.",
  },
  {
    name: "Van",
    detail:
      "Families, groups and coordinated travel.",
  },
];

const journeySteps = [
  {
    number: "01",
    title: "Create your account",
    detail:
      "Set up your KiliRide customer account in a few moments.",
  },
  {
    number: "02",
    title: "Choose your journey",
    detail:
      "Airport, rental, safari, chauffeur, corporate or event travel.",
  },
  {
    number: "03",
    title: "KiliRide coordinates it",
    detail:
      "Your trip, vehicle and transport details are managed through one operation.",
  },
];

export function PublicHome() {
  const user = getStoredUser();
  const staffUser = isStaffOrAdmin(user);

  async function handleSignOut() {
    try {
      await logout();
    } catch {
      clearAuthSession();
    } finally {
      window.location.href = "/";
    }
  }

  const firstName =
    user?.name.split(" ")[0] ?? "";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8faf8] text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#073b2e]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6a84f] text-[#073b2e]">
              <Car className="h-5 w-5" />
            </div>

            <div>
              <p className="text-base font-black tracking-[0.08em]">
                KILIRIDE
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Kilimanjaro · Tanzania
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/65 lg:flex">
            <a
              className="transition hover:text-white"
              href="#services"
            >
              Services
            </a>

            <a
              className="transition hover:text-white"
              href="#fleet"
            >
              Fleet
            </a>

            <a
              className="transition hover:text-white"
              href="#how-it-works"
            >
              How it works
            </a>

            <a
              className="transition hover:text-white"
              href="#why-kiliride"
            >
              Why KiliRide
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="hidden rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white sm:inline-flex"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-sm font-bold text-[#073b2e] transition hover:bg-[#f3f0e7]"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Create account
                  </span>
                  <span className="sm:hidden">
                    Join
                  </span>
                </Link>
              </>
            ) : staffUser ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#073b2e]"
              >
                Operations
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                to="/account"
                className="inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2 text-white transition hover:bg-white/10"
              >
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#d6a84f] text-xs font-black text-[#073b2e]">
                  {firstName.slice(0, 1).toUpperCase()}
                </div>

                <div className="hidden text-left sm:block">
                  <p className="text-[10px] text-white/45">
                    My account
                  </p>
                  <p className="text-xs font-bold">
                    {firstName}
                  </p>
                </div>

                <ArrowRight className="h-3.5 w-3.5 text-white/40" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.15),transparent_31%),radial-gradient(circle_at_88%_18%,rgba(214,168,79,0.20),transparent_31%)]" />

        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/85 px-3 py-1.5 text-xs font-bold text-[#087456] shadow-sm">
              <MapPin className="h-3.5 w-3.5" />
              Moshi · Kilimanjaro
            </div>

            <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.045em] text-[#073b2e] sm:text-6xl lg:text-7xl">
              Reliable transport
              <span className="block text-[#c39235]">
                for every journey.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Airport transfers, vehicle rental,
              chauffeur travel, safari transport
              and business mobility from
              Kilimanjaro to destinations across
              Tanzania.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!user ? (
                <Link
                  to="/register"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087456] px-6 text-sm font-bold text-white shadow-lg shadow-emerald-950/15 transition hover:-translate-y-0.5 hover:bg-[#075d47]"
                >
                  Create your account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : staffUser ? (
                <Link
                  to="/dashboard"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087456] px-6 text-sm font-bold text-white shadow-lg shadow-emerald-950/15"
                >
                  Open operations
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href="#services"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087456] px-6 text-sm font-bold text-white shadow-lg shadow-emerald-950/15"
                >
                  Explore KiliRide
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}

              <a
                href="#services"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:text-[#087456]"
              >
                Explore services
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Airport transfers
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Car rental
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Safari transport
              </span>
            </div>
          </div>

          {/* Hero operational/travel visual */}
          <div className="relative">
            <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[#d6a84f]/20 blur-3xl" />
            <div className="absolute -bottom-14 -left-10 h-52 w-52 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white bg-[#073b2e] p-4 shadow-2xl shadow-emerald-950/20">
              <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#0c5946] to-[#062f25] p-6 sm:p-7">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#d6a84f]">
                      Your journey
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-white">
                      Kilimanjaro & beyond
                    </h2>
                  </div>

                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10">
                    <Sparkles className="h-5 w-5 text-[#d6a84f]" />
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.07] p-5">
                  <div className="flex items-center gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                      <Plane className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs text-white/45">
                        Start
                      </p>
                      <p className="font-bold text-white">
                        Kilimanjaro International
                        Airport
                      </p>
                    </div>
                  </div>

                  <div className="ml-[21px] h-8 border-l border-dashed border-white/20" />

                  <div className="flex items-center gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#d6a84f]/10 text-[#d6a84f]">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-xs text-white/45">
                        Continue
                      </p>
                      <p className="font-bold text-white">
                        Moshi · Arusha · Safari ·
                        Tanzania
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                    <Car className="h-5 w-5 text-emerald-300" />
                    <p className="mt-3 text-sm font-bold text-white">
                      Flexible fleet
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      Vehicles matched to the
                      journey.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                    <ShieldCheck className="h-5 w-5 text-[#d6a84f]" />
                    <p className="mt-3 text-sm font-bold text-white">
                      Managed travel
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      Coordinated through one
                      KiliRide operation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service strip */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
          {[
            ["Airport", "Arrivals & departures"],
            ["Rental", "Self-drive flexibility"],
            ["Safari", "Tour transport"],
            ["Business", "Corporate mobility"],
          ].map(([value, label]) => (
            <div
              key={value}
              className="px-4 py-6 text-center"
            >
              <p className="text-base font-black text-[#073b2e] sm:text-lg">
                {value}
              </p>

              <p className="mt-1 text-[11px] font-medium text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section
        className="mx-auto max-w-7xl px-5 py-20"
        id="services"
      >
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087456]">
            KiliRide services
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#073b2e] sm:text-4xl">
            Transport built around
            the journey.
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
            From the airport to the city,
            safari, business meeting or special
            event, KiliRide brings the journey
            together.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.name}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f5f0] text-[#087456] transition group-hover:bg-[#087456] group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 text-base font-bold text-slate-900">
                  {service.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {service.detail}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Fleet categories */}
      <section
        id="fleet"
        className="bg-[#073b2e] text-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6a84f]">
                The KiliRide fleet
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                The right vehicle
                <span className="block text-[#d6a84f]">
                  for the right journey.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
                From comfortable city travel to
                group transfers and safari-ready
                journeys, fleet selection should
                match the trip.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {fleetCategories.map(
                (vehicle) => (
                  <article
                    key={vehicle.name}
                    className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 text-[#d6a84f]">
                      <Car className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 text-xl font-black">
                      {vehicle.name}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-white/50">
                      {vehicle.detail}
                    </p>
                  </article>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-5 py-20"
      >
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087456]">
            Simple from the start
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#073b2e] sm:text-4xl">
            How KiliRide works.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {journeySteps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="text-sm font-black text-[#c39235]">
                {step.number}
              </span>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Why KiliRide */}
      <section
        id="why-kiliride"
        className="mx-auto max-w-7xl px-5 pb-20"
      >
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#e7f4ef] via-white to-[#f7eddc] p-6 sm:p-10 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087456]">
                Why KiliRide
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#073b2e] sm:text-4xl">
                Local transport.
                <span className="block text-[#c39235]">
                  Better coordinated.
                </span>
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                KiliRide combines customer travel
                with real fleet, driver, booking
                and maintenance operations behind
                the scenes.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                "Built around Kilimanjaro transport",
                "Real booking and fleet coordination",
                "Customer and operations accounts connected",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-white/75 px-4 py-3.5"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />

                  <span className="text-sm font-semibold text-slate-700">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {!user && (
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-12 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#073b2e]">
                Ready to start with KiliRide?
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Create your customer account or
                sign in if you already have one.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-700"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087456] px-5 text-sm font-bold text-white"
              >
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200 bg-[#073b2e] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-black tracking-[0.08em]">
              KILIRIDE
            </p>
            <p className="mt-1 text-xs text-white/45">
              Mobility & Transport · Moshi,
              Kilimanjaro
            </p>
          </div>

          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} KiliRide.
            All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
