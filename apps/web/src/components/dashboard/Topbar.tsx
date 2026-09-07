import { Bell, ChevronRight } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import { getStoredUser } from "../../lib/auth";

const pageDetails: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  "/dashboard": {
    title: "Dashboard",
    description: "Your KiliRide operations overview.",
  },
  "/dashboard/bookings": {
    title: "Bookings",
    description: "Manage trips, reservations and customer journeys.",
  },
  "/dashboard/calendar": {
    title: "Calendar",
    description: "Plan bookings, fleet movements and maintenance schedules.",
  },
  "/dashboard/customers": {
    title: "Customers",
    description: "Manage customer profiles, contacts and booking relationships.",
  },
  "/dashboard/payments": {
    title: "Payments",
    description: "Track collections, balances and payment history.",
  },
  "/dashboard/maintenance": {
    title: "Maintenance",
    description: "Manage fleet servicing, repairs and maintenance history.",
  },
  "/dashboard/vehicles": {
    title: "Vehicles",
    description: "Manage fleet vehicles and availability.",
  },
  "/dashboard/drivers": {
    title: "Drivers",
    description: "Manage drivers and duty availability.",
  },
};

export function Topbar() {
  const location = useLocation();
  const user = getStoredUser();

  const page = pageDetails[location.pathname] ?? {
    title: "KiliRide",
    description: "Transport operations management.",
  };

  const currentDate = new Intl.DateTimeFormat("en-TZ", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 lg:hidden">
            <NavLink to="/" className="text-primary">
              KiliRide
            </NavLink>
            <ChevronRight size={12} />
            Operations
          </div>

          <h1 className="truncate text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            {page.title}
          </h1>

          <p className="mt-0.5 hidden text-sm text-slate-500 sm:block">
            {page.description}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right md:block">
            <div className="text-xs font-semibold text-slate-700">
              {currentDate}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              Kilimanjaro, Tanzania
            </div>
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-primary"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary ring-2 ring-white" />
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-xs font-bold text-white">
              {(user?.name ?? "K")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="hidden min-w-0 sm:block">
              <div className="max-w-[120px] truncate text-xs font-semibold text-slate-800">
                {user?.name ?? "KiliRide"}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {user?.role ?? "Staff"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
