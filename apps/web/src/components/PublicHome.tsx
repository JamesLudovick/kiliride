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

 const services = [
  {
    name: "Airport Transfers",
    detail:
      "Reliable airport pickups and drop-offs for local and long-distance journeys.",
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
  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f7f5] text-slate-950">
      {/* Public header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#062f27]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-6">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-3"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#d6a84f] text-[#073b2e] shadow-lg shadow-black/10">
              <Car className="h-5 w-5" />
            </div>

            <div>
              <p className="text-base font-black tracking-[0.12em]">
                KILIRIDE
              </p>

              <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.22em] text-white/35">
                Mobility & Transport
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-[13px] font-semibold text-white/55 lg:flex">
            <a
              href="#services"
              className="transition hover:text-white"
            >
              Services
            </a>

            <a
              href="#fleet"
              className="transition hover:text-white"
            >
              Fleet
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-white"
            >
              How it works
            </a>

            <a
              href="#why-kiliride"
              className="transition hover:text-white"
            >
              Why KiliRide
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/login"
              className="hidden h-10 items-center justify-center rounded-xl px-4 text-xs font-bold text-white/65 transition hover:bg-white/[0.07] hover:text-white sm:inline-flex"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#d6a84f] px-4 text-xs font-black text-[#073b2e] transition hover:-translate-y-0.5 hover:bg-[#e0b75e]"
            >
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#062f27] text-white">
        {/* Ambient background */}
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_18%,rgba(25,181,136,0.24),transparent_29%),radial-gradient(circle_at_88%_28%,rgba(214,168,79,0.19),transparent_27%),linear-gradient(135deg,#062f27_0%,#073b2e_55%,#052820_100%)]" />

        <div className="absolute inset-0 -z-10 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:52px_52px]" />

        <div className="absolute -left-28 top-20 -z-10 h-80 w-80 rounded-full border border-white/[0.05]" />
        <div className="absolute -left-12 top-36 -z-10 h-72 w-72 rounded-full border border-white/[0.04]" />

        <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl gap-12 px-5 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          {/* Hero message */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Transport · Rental · Travel
            </div>

            <h1 className="mt-7 text-[52px] font-black leading-[0.95] tracking-[-0.055em] sm:text-6xl lg:text-[66px] xl:text-[72px]">
              Move your way.
              <span className="mt-1 block text-[#d6a84f]">
                We handle the journey.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-emerald-50/70 sm:text-[17px]">
              From airport transfers and vehicle
              rental to chauffeur services,
              tours and business transport —
              KiliRide brings every journey
              together in one modern mobility
              experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#services"
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[14px] bg-[#0a8a67] px-6 text-sm font-black text-white shadow-xl shadow-black/10 transition hover:-translate-y-0.5 hover:bg-[#0b9872]"
              >
                Explore KiliRide
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#fleet"
                className="inline-flex h-[50px] items-center justify-center gap-2 rounded-[14px] border border-white/15 bg-white/[0.06] px-6 text-sm font-bold text-white/75 backdrop-blur transition hover:bg-white/[0.1] hover:text-white"
              >
                View our fleet
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/60">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Airport transfers
              </span>

              <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/60">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Vehicle rental
              </span>

              <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/60">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Chauffeur & tours
              </span>
            </div>
          </div>

          {/* Modern mobility visual */}
          <div className="relative mx-auto w-full max-w-[535px] lg:ml-auto">
            <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full bg-[#d6a84f]/20 blur-3xl" />

            <div className="absolute -bottom-16 -left-12 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/[0.12] bg-white/[0.055] p-2.5 shadow-[0_32px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
              <div className="rounded-[25px] border border-white/[0.08] bg-[#0a4739]/75 p-5 sm:p-6">
                {/* Visual top */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d6a84f]">
                      KiliRide mobility
                    </p>

                    <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                      Your journey.
                      <span className="block text-emerald-300">
                        Your way.
                      </span>
                    </h2>
                  </div>

                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.07] text-[#d6a84f]">
                    <Car className="h-5 w-5" />
                  </div>
                </div>

                {/* Service choices */}
                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div className="rounded-[18px] border border-white/[0.09] bg-white/[0.055] p-4 transition hover:bg-white/[0.085]">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                      <Plane className="h-4 w-4" />
                    </div>

                    <p className="mt-4 text-sm font-black text-white">
                      Airport
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-white/48">
                      Pickups and drop-offs made simple.
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-white/[0.09] bg-white/[0.055] p-4 transition hover:bg-white/[0.085]">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#d6a84f]/10 text-[#e5ba65]">
                      <Car className="h-4 w-4" />
                    </div>

                    <p className="mt-4 text-sm font-black text-white">
                      Rental
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-white/48">
                      Travel freely on your schedule.
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-white/[0.09] bg-white/[0.055] p-4 transition hover:bg-white/[0.085]">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-300/10 text-sky-300">
                      <Crown className="h-4 w-4" />
                    </div>

                    <p className="mt-4 text-sm font-black text-white">
                      Chauffeur
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-white/48">
                      Professional travel, handled for you.
                    </p>
                  </div>

                  <div className="rounded-[18px] border border-white/[0.09] bg-white/[0.055] p-4 transition hover:bg-white/[0.085]">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-300/10 text-violet-300">
                      <Route className="h-4 w-4" />
                    </div>

                    <p className="mt-4 text-sm font-black text-white">
                      Tours
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-white/48">
                      Journeys and experiences made easier.
                    </p>
                  </div>
                </div>

                {/* Bottom journey statement */}
                <div className="mt-3 flex items-center gap-4 rounded-[18px] border border-white/[0.09] bg-black/10 p-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-300/10 text-emerald-300">
                    <Route className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-white">
                      Everything connected by KiliRide.
                    </p>

                    <p className="mt-1 text-[11px] leading-4 text-white/48">
                      From planning to arrival, your
                      journey stays connected.
                    </p>
                  </div>

                  <ArrowRight className="h-4 w-4 shrink-0 text-[#d6a84f]" />
                </div>
              </div>
            </div>

            {/* Floating trust card */}
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-[#073b2e] shadow-xl sm:flex">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-[#087456]">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div>
                <p className="text-[10px] font-black">
                  Travel with confidence
                </p>

                <p className="mt-0.5 text-[9px] text-slate-400">
                  Flexible · Managed · Connected
                </p>
              </div>
            </div>
          </div>
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
      {(
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
