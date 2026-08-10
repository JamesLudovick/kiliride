import {
  ArrowRight,
  BriefcaseBusiness,
  Car,
  CheckCircle2,
  ChevronRight,
  Crown,
  HeartHandshake,
  Landmark,
  MapPin,
  Plane,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

const services = [
  {
    name: "Car Rentals",
    detail: "Reliable self-drive and chauffeur vehicles for everyday travel.",
    icon: Car,
    accent: "from-emerald-500/15 to-emerald-500/5",
  },
  {
    name: "VIP Transport",
    detail: "Comfortable executive transport for important guests and clients.",
    icon: Crown,
    accent: "from-amber-500/15 to-amber-500/5",
  },
  {
    name: "Airport Transfers",
    detail: "Smooth pickup and drop-off around Kilimanjaro International Airport.",
    icon: Plane,
    accent: "from-sky-500/15 to-sky-500/5",
  },
  {
    name: "Wedding Transport",
    detail: "Elegant vehicles and coordinated transport for special occasions.",
    icon: HeartHandshake,
    accent: "from-rose-500/15 to-rose-500/5",
  },
  {
    name: "Funeral Transport",
    detail: "Respectful and coordinated transportation for families and guests.",
    icon: Landmark,
    accent: "from-slate-500/15 to-slate-500/5",
  },
  {
    name: "Corporate Travel",
    detail: "Professional transport solutions for teams, companies and events.",
    icon: BriefcaseBusiness,
    accent: "from-violet-500/15 to-violet-500/5",
  },
];

const fleetPreview = [
  {
    name: "Toyota Land Cruiser",
    type: "SUV",
    detail: "Safari & premium travel",
  },
  {
    name: "Toyota Noah",
    type: "VAN",
    detail: "Family & group transport",
  },
  {
    name: "Toyota Corolla",
    type: "SEDAN",
    detail: "City & business travel",
  },
];

export function PublicHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7faf8] text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#073b2e]/95 text-white shadow-lg backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d6a84f] text-[#073b2e] shadow-lg shadow-black/10">
              <Car className="h-5 w-5" />
            </div>

            <div>
              <p className="text-base font-bold tracking-tight">KiliRide</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
                Mobility & Transport
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-white/70 md:flex">
            <a className="transition hover:text-white" href="#services">
              Services
            </a>
            <a className="transition hover:text-white" href="#fleet">
              Fleet
            </a>
            <a className="transition hover:text-white" href="#about">
              About
            </a>
          </nav>

          <a
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#073b2e] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f4f1e8]"
          >
            Staff login
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.13),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(214,168,79,0.18),transparent_28%)]" />

        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28 lg:pt-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#087456] shadow-sm">
              <MapPin className="h-3.5 w-3.5" />
              Moshi · Kilimanjaro, Tanzania
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[1.03] tracking-[-0.04em] text-[#073b2e] sm:text-6xl lg:text-7xl">
              Move people.
              <span className="block text-[#c39235]">Move business.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              KiliRide brings vehicle rentals, airport transfers, VIP transport,
              corporate travel and everyday fleet operations together in one
              modern platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/login"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087456] px-6 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-[#075d47]"
              >
                Open operations dashboard
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="#services"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-[#087456]"
              >
                Explore services
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Fleet-ready
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Operations focused
              </span>

              <span className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Built for Kilimanjaro
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#d6a84f]/20 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white bg-[#073b2e] p-4 shadow-2xl shadow-emerald-950/20">
              <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#0c5946] to-[#062f25] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                      Fleet overview
                    </p>
                    <p className="mt-1 text-xl font-bold text-white">
                      KiliRide Operations
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Sparkles className="h-5 w-5 text-[#d6a84f]" />
                  </div>
                </div>

                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.07] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/50">Fleet status</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        Ready for operations
                      </p>
                    </div>

                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/15">
                      <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-lg font-bold text-white">SUV</p>
                      <p className="mt-1 text-[10px] text-white/45">
                        Safari
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-lg font-bold text-white">VAN</p>
                      <p className="mt-1 text-[10px] text-white/45">
                        Groups
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-lg font-bold text-white">SEDAN</p>
                      <p className="mt-1 text-[10px] text-white/45">
                        Business
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                    <UsersRound className="h-5 w-5 text-[#d6a84f]" />
                    <p className="mt-3 text-sm font-semibold text-white">
                      Customer ready
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      Designed around real transport workflows.
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                    <p className="mt-3 text-sm font-semibold text-white">
                      Controlled access
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/45">
                      Secure staff and management operations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4">
          {[
            ["6+", "Transport services"],
            ["24/7", "Operations mindset"],
            ["TZ", "Built locally"],
            ["1", "Connected platform"],
          ].map(([value, label]) => (
            <div className="px-5 py-6 text-center" key={label}>
              <p className="text-2xl font-black tracking-tight text-[#073b2e]">
                {value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-5 py-20" id="services">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#087456]">
            What KiliRide handles
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight text-[#073b2e] sm:text-4xl">
            Transport for every journey.
          </h2>

          <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
            From a single airport pickup to managing an entire vehicle fleet,
            KiliRide is designed around the way a modern transport business
            actually operates.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5"
                key={service.name}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${service.accent}`}
                />

                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f5f0] text-[#087456] transition group-hover:bg-[#087456] group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#087456]" />
                </div>

                <h3 className="mt-6 text-base font-bold text-slate-900">
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

      {/* Fleet */}
      <section
        className="border-y border-slate-200 bg-[#073b2e] text-white"
        id="fleet"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d6a84f]">
              Fleet management
            </p>

            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              Know your vehicles.
              <span className="block text-[#d6a84f]">
                Run your business better.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
              KiliRide gives staff a clear place to register vehicles, monitor
              their status and keep the fleet organized as the business grows.
            </p>

            <a
              href="/login"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#d6a84f] px-5 py-3 text-sm font-bold text-[#073b2e] transition hover:-translate-y-0.5 hover:bg-[#e1b968]"
            >
              Open fleet management
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid gap-3">
            {fleetPreview.map((vehicle, index) => (
              <div
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.1]"
                key={vehicle.name}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#d6a84f]">
                  <Car className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{vehicle.name}</h3>
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
                      {vehicle.type}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-white/45">
                    {vehicle.detail}
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-[10px] uppercase tracking-wider text-white/35">
                    Example
                  </p>
                  <p className="mt-1 text-xs font-semibold text-emerald-300">
                    Fleet ready
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-[#d6a84f]" />

                <span className="sr-only">{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / CTA */}
      <section className="mx-auto max-w-7xl px-5 py-20" id="about">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#e8f5f0] via-white to-[#f7edda] px-6 py-12 text-center sm:px-10">
          <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-300/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#087456] text-white shadow-lg">
              <Car className="h-5 w-5" />
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-[#073b2e] sm:text-4xl">
              Built for KiliRide.
              <span className="block text-[#c39235]">
                Ready to grow with you.
              </span>
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
              A focused transport platform for managing vehicles, people,
              bookings and daily operations from one place.
            </p>

            <a
              href="/login"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#087456] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition hover:-translate-y-0.5 hover:bg-[#075d47]"
            >
              Go to staff dashboard
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-[#073b2e]">KiliRide</p>
            <p className="mt-1">Mobility & Transport · Moshi, Tanzania</p>
          </div>

          <p>© {new Date().getFullYear()} KiliRide. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}