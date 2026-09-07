import {
  CalendarDays,
  Car,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const quickActions = [
  {
    title: "Bookings",
    description: "Create and manage customer journeys.",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    title: "Vehicles",
    description: "Check fleet availability and vehicle status.",
    href: "/dashboard/vehicles",
    icon: Car,
  },
  {
    title: "Drivers",
    description: "Manage driver availability and assignments.",
    href: "/dashboard/drivers",
    icon: ShieldCheck,
  },
];

export function StaffDashboard() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-emerald-900/5 bg-gradient-to-br from-[#0c3a31] via-[#0e493c] to-[#176451] p-6 text-white shadow-xl shadow-emerald-950/10 sm:p-8">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
            <Sparkles size={14} />
            KiliRide Operations
          </div>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Keep every journey running smoothly.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">
            Manage bookings, vehicles and drivers from one workspace built for
            day-to-day KiliRide operations.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-950">Quick access</h3>
          <p className="mt-1 text-sm text-slate-500">
            Jump directly into today&apos;s operational work.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5"
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-primary">
                    <Icon size={21} />
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-primary"
                  />
                </div>

                <div className="font-bold text-slate-950">{item.title}</div>

                <p className="mt-1.5 text-sm leading-5 text-slate-500">
                  {item.description}
                </p>
              </NavLink>
            );
          })}
        </div>
      </section>
    </div>
  );
}
