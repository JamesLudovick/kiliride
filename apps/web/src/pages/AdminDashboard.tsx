import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CalendarClock,
  Car,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileWarning,
  Gauge,
  LogOut,
  Settings,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import {
  getCurrentUser,
  getVehicles,
  logout,
  Vehicle,
} from "../lib/api";

import { AuthUser, clearAuthSession, getStoredUser } from "../lib/auth";

const navigation = [
  {
    title: "Main",
    items: [{ label: "Dashboard", icon: BarChart3 }],
  },
  {
    title: "Operations",
    items: [
      { label: "Bookings", icon: CalendarClock },
      { label: "Enquiries", icon: ClipboardCheck },
      { label: "Service Types", icon: ClipboardCheck },
      { label: "Schedule / Calendar", icon: CalendarClock },
      { label: "Drivers", icon: ShieldCheck },
      { label: "Vehicles", icon: Car },
    ],
  },
  {
    title: "Fleet Management",
    items: [
      { label: "Maintenance", icon: Wrench },
      { label: "Fuel Management", icon: Gauge },
      { label: "Vehicle Documents", icon: FileWarning },
      { label: "Inspections", icon: ClipboardCheck },
    ],
  },
  {
    title: "Customers & Finance",
    items: [
      { label: "Customers", icon: UsersRound },
      { label: "Payments & Deposits", icon: CircleDollarSign },
      { label: "Invoices", icon: ClipboardCheck },
      { label: "Expenses", icon: CircleDollarSign },
    ],
  },
  {
    title: "Reports",
    items: [{ label: "Reports & Analytics", icon: BarChart3 }],
  },
  {
    title: "Settings",
    items: [
      { label: "Users & Roles", icon: UsersRound },
      { label: "Settings", icon: Settings },
    ],
  },
];

const scheduleDays = [
  "FRI 16",
  "SAT 17",
  "SUN 18",
  "MON 19",
  "TUE 20",
  "WED 21",
  "THU 22",
];

const scheduleTypes = [
  {
    label: "Daily Drive",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  {
    label: "Rental",
    className: "bg-teal-100 text-teal-800 border-teal-200",
  },
  {
    label: "Airport",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    label: "Maintenance",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
];

function formatVehicleType(type: Vehicle["type"]) {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

function formatStatus(status: Vehicle["status"]) {
  switch (status) {
    case "ON_TRIP":
      return "On trip";
    case "MAINTENANCE":
      return "Maintenance";
    case "INACTIVE":
      return "Inactive";
    default:
      return "Available";
  }
}

export function AdminDashboard() {
  console.log("ADMIN DASHBOARD LOADED");

  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState("Checking session...");
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");

  useEffect(() => {
    getCurrentUser()
      .then(async ({ user: currentUser }) => {
        if (currentUser.role !== "ADMIN") {
          setStatus("This area is only for admin users.");
          setVehiclesLoading(false);
          return;
        }

        setUser(currentUser);
        setStatus("");

        try {
          setVehiclesLoading(true);
          const data = await getVehicles();
          setVehicles(data);
          setVehiclesError("");
        } catch (error) {
          setVehiclesError(
            error instanceof Error
              ? error.message
              : "Unable to load fleet vehicles.",
          );
        } finally {
          setVehiclesLoading(false);
        }
      })
      .catch(() => {
        clearAuthSession();
        window.location.href = "/login";
      });
  }, []);

  async function handleLogout() {
  try {
    await logout();
  } catch {
    clearAuthSession();
  }

  window.location.href = "/login";
}


  function handleNavigation(label: string) {
    if (label === "Bookings") {
      window.location.href = "/dashboard/bookings";
      return;
    }

    if (label === "Drivers") {
      window.location.href = "/dashboard/drivers";
      return;
    }

    if (label === "Vehicles") {
      window.location.href = "/dashboard/vehicles";
      return;
    }

    if (label === "Dashboard") {
      window.location.href = "/dashboard";
    }
  }

  const fleetStats = useMemo(() => {
    const total = vehicles.length;

    const available = vehicles.filter(
      (vehicle) => vehicle.status === "AVAILABLE",
    ).length;

    const onTrip = vehicles.filter(
      (vehicle) => vehicle.status === "ON_TRIP",
    ).length;

    const maintenance = vehicles.filter(
      (vehicle) => vehicle.status === "MAINTENANCE",
    ).length;

    const inactive = vehicles.filter(
      (vehicle) => vehicle.status === "INACTIVE",
    ).length;

    const utilization =
      total > 0 ? Math.round((onTrip / total) * 100) : 0;

    return {
      total,
      available,
      onTrip,
      maintenance,
      inactive,
      utilization,
    };
  }, [vehicles]);

  const fleetCards = [
    {
      label: "Total vehicles",
      value: fleetStats.total,
      hint: "Fleet vehicles registered",
      icon: Car,
      color: "text-primary",
      bg: "bg-emerald-50",
    },
    {
      label: "Available",
      value: fleetStats.available,
      hint:
        fleetStats.total > 0
          ? `${Math.round(
              (fleetStats.available / fleetStats.total) * 100,
            )}% of fleet`
          : "Ready for assignment",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "On trip",
      value: fleetStats.onTrip,
      hint:
        fleetStats.total > 0
          ? `${Math.round(
              (fleetStats.onTrip / fleetStats.total) * 100,
            )}% of fleet`
          : "Currently assigned",
      icon: CalendarClock,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Maintenance",
      value: fleetStats.maintenance,
      hint: "Vehicles requiring service",
      icon: Wrench,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Inactive",
      value: fleetStats.inactive,
      hint: "Currently unavailable",
      icon: ShieldCheck,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
  ];

  const alerts = useMemo(() => {
    const result: {
      title: string;
      description: string;
      type: "warning" | "danger" | "info";
    }[] = [];

    if (fleetStats.maintenance > 0) {
      result.push({
        title: `${fleetStats.maintenance} vehicle${
          fleetStats.maintenance === 1 ? "" : "s"
        } in maintenance`,
        description: "Review the fleet maintenance queue.",
        type: "warning",
      });
    }

    if (fleetStats.inactive > 0) {
      result.push({
        title: `${fleetStats.inactive} inactive vehicle${
          fleetStats.inactive === 1 ? "" : "s"
        }`,
        description: "Check availability and vehicle status.",
        type: "info",
      });
    }

    if (fleetStats.onTrip > 0) {
      result.push({
        title: `${fleetStats.onTrip} vehicle${
          fleetStats.onTrip === 1 ? "" : "s"
        } currently on trip`,
        description: "Monitor active fleet assignments.",
        type: "info",
      });
    }

    if (result.length === 0) {
      result.push({
        title: "Fleet is operational",
        description: "No vehicle alerts require attention.",
        type: "info",
      });
    }

    return result;
  }, [
    fleetStats.maintenance,
    fleetStats.inactive,
    fleetStats.onTrip,
  ]);

  if (status) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="kr-card w-full max-w-md p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-xl font-bold">
            KiliRide Operations
          </h1>

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
      {/* SIDEBAR */}
      <aside className="kr-sidebar hidden min-h-screen lg:flex lg:flex-col">
        <div className="px-5 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Car className="h-5 w-5 text-emerald-300" />
            </div>

            <div>
              <p className="text-base font-bold text-white">
                KiliRide
              </p>

              <p className="text-[11px] font-medium text-emerald-200">
                Fleet Management
              </p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {navigation.map((section) => (
            <div className="mb-5" key={section.title}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200/60">
                {section.title}
              </p>

              <nav className="grid gap-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.label === "Dashboard";

                  return (
                    <button
                      className={`kr-sidebar-item ${
                        active ? "kr-sidebar-item-active" : ""
                      }`}
                      key={item.label}
                      onClick={() => handleNavigation(item.label)}
                      type="button"
                    >
                      <Icon className="h-[17px] w-[17px] shrink-0" />

                      <span>{item.label}</span>

                      {item.label === "Vehicles" && (
                        <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <p className="text-xs font-semibold text-white">
                System online
              </p>
            </div>

            <p className="mt-2 text-[11px] leading-5 text-emerald-100/65">
              Fleet, bookings and daily transport operations.
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

      {/* MAIN CONTENT */}
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

        <div className="mx-auto max-w-[1600px] space-y-6 px-5 py-6 sm:px-7">
          {/* KPI CARDS */}
          <section className="flex gap-4 overflow-x-auto pb-2 xl:grid xl:grid-cols-5 xl:overflow-visible">
            {fleetCards.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  className="kr-stat-card min-w-[250px] shrink-0 xl:min-w-0 xl:shrink"
                  key={stat.label}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {stat.label}
                      </p>

                      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                        {vehiclesLoading ? "—" : stat.value}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-400">
                    {stat.hint}
                  </p>
                </article>
              );
            })}
          </section>

          {vehiclesError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-semibold">
                  Unable to load fleet data
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {vehiclesError}
                </p>
              </div>
            </div>
          )}

          {/* BOOKINGS + SCHEDULE + ALERTS */}
          <section className="grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)_245px]">
            {/* TODAY'S BOOKINGS */}
            <article className="kr-card overflow-hidden">
              <div className="border-b px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Today's bookings
                </p>

                <h2 className="mt-1 text-base font-bold text-slate-900">
                  Operations
                </h2>
              </div>

              <div className="p-4">
                {[
                  {
                    label: "Daily Drives",
                    icon: Car,
                  },
                  {
                    label: "Rental Services",
                    icon: CalendarClock,
                  },
                  {
                    label: "Airport Transfers",
                    icon: ArrowUpRight,
                  },
                  {
                    label: "Self Drive",
                    icon: UsersRound,
                  },
                  {
                    label: "Tourist Rentals",
                    icon: ShieldCheck,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      className="flex items-center gap-3 rounded-xl px-2 py-3"
                      key={item.label}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-slate-700">
                          {item.label}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Booking module
                        </p>
                      </div>

                      <span className="text-xs font-bold text-slate-400">
                        —
                      </span>
                    </div>
                  );
                })}

                <div className="mt-2 border-t pt-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-slate-700">
                      Total bookings
                    </span>

                    <span className="text-lg font-bold text-primary">
                      —
                    </span>
                  </div>

                  <p className="mt-2 px-2 text-[10px] leading-4 text-slate-400">
                    Booking data will appear here when the booking module is
                    connected.
                  </p>
                </div>
              </div>
            </article>

            {/* VEHICLE SCHEDULE */}
            <article className="kr-card min-w-0 overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Vehicle schedule
                  </p>

                  <h2 className="mt-1 text-base font-bold text-slate-900">
                    Fleet calendar
                  </h2>
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                  <button
                    className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    type="button"
                  >
                    Today
                  </button>

                  <button
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white"
                    type="button"
                  >
                    Week
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[145px_repeat(7,minmax(85px,1fr))] border-b bg-slate-50">
                    <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Vehicle
                    </div>

                    {scheduleDays.map((day) => (
                      <div
                        className="border-l px-2 py-3 text-center text-[10px] font-bold text-slate-500"
                        key={day}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {vehicles.length === 0 && !vehiclesLoading ? (
                    <div className="flex min-h-[260px] items-center justify-center p-8">
                      <div className="max-w-sm text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
                          <Car className="h-6 w-6" />
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-slate-800">
                          No vehicles registered
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Add vehicles to your fleet and they will appear on
                          the schedule.
                        </p>

                        <button
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white"
                          onClick={() =>
                            (window.location.href = "/dashboard/vehicles")
                          }
                          type="button"
                        >
                          Manage vehicles
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    vehicles.slice(0, 6).map((vehicle, index) => (
                      <div
                        className="grid min-h-[68px] grid-cols-[145px_repeat(7,minmax(85px,1fr))] border-b last:border-b-0"
                        key={vehicle.id}
                      >
                        <div className="flex items-center gap-2 px-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Car className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-bold text-slate-800">
                              {vehicle.make} {vehicle.model}
                            </p>

                            <p className="truncate text-[9px] text-slate-400">
                              {vehicle.registrationNumber}
                            </p>
                          </div>
                        </div>

                        {scheduleDays.map((day, dayIndex) => {
                          const shouldShow =
                            (vehicle.status === "ON_TRIP" &&
                              dayIndex === index % 4) ||
                            (vehicle.status === "MAINTENANCE" &&
                              dayIndex === 2) ||
                            (vehicle.status === "AVAILABLE" &&
                              dayIndex === (index + 1) % 5);

                          if (!shouldShow) {
                            return (
                              <div
                                className="border-l bg-white"
                                key={day}
                              />
                            );
                          }

                          let schedule =
                            scheduleTypes[
                              (index + dayIndex) % scheduleTypes.length
                            ];

                          if (vehicle.status === "MAINTENANCE") {
                            schedule = scheduleTypes[3];
                          }

                          return (
                            <div
                              className="border-l p-1.5"
                              key={day}
                            >
                              <div
                                className={`h-full min-h-[52px] rounded-lg border px-2 py-1.5 ${schedule.className}`}
                              >
                                <p className="truncate text-[9px] font-bold">
                                  {schedule.label}
                                </p>

                                <p className="mt-1 text-[8px] opacity-70">
                                  {vehicle.status === "MAINTENANCE"
                                    ? "Service"
                                    : "08:00 - 17:00"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 border-t bg-slate-50 px-5 py-3">
                {scheduleTypes.map((type) => (
                  <div
                    className="flex items-center gap-2"
                    key={type.label}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-sm border ${type.className}`}
                    />

                    <span className="text-[10px] font-medium text-slate-500">
                      {type.label}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            {/* ALERTS */}
            <article className="kr-card overflow-hidden">
              <div className="border-b px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Alerts
                </p>

                <h2 className="mt-1 text-base font-bold text-slate-900">
                  Fleet attention
                </h2>
              </div>

              <div className="divide-y">
                {alerts.map((alert, index) => {
                  const isWarning = alert.type === "warning";
                  const isDanger = alert.type === "danger";

                  return (
                    <div
                      className="p-4"
                      key={`${alert.title}-${index}`}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isDanger
                              ? "bg-red-50 text-red-600"
                              : isWarning
                                ? "bg-amber-50 text-amber-600"
                                : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {isWarning || isDanger ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800">
                            {alert.title}
                          </p>

                          <p className="mt-1 text-[10px] leading-4 text-slate-500">
                            {alert.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className="flex w-full items-center justify-between border-t px-5 py-3 text-xs font-semibold text-primary hover:bg-emerald-50"
                type="button"
              >
                View all alerts
                <ChevronRight className="h-4 w-4" />
              </button>
            </article>
          </section>

          {/* BOTTOM OPERATIONS */}
          <section className="grid gap-5 xl:grid-cols-[0.8fr_1.5fr_0.7fr]">
            {/* FINANCIAL SUMMARY */}
            <article className="kr-card">
              <div className="border-b px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Financial summary
                </p>

                <h2 className="mt-1 text-base font-bold text-slate-900">
                  Today
                </h2>
              </div>

              <div className="grid gap-1 p-5">
                {[
                  ["Today's revenue", "TZS 0"],
                  ["Outstanding payments", "TZS 0"],
                  ["Deposits held", "TZS 0"],
                  ["Today's expenses", "TZS 0"],
                ].map(([label, value]) => (
                  <div
                    className="flex items-center justify-between border-b py-3 last:border-0"
                    key={label}
                  >
                    <span className="text-xs font-medium text-slate-500">
                      {label}
                    </span>

                    <span className="text-xs font-bold text-slate-700">
                      {value}
                    </span>
                  </div>
                ))}

                <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                  <span className="text-xs font-bold text-emerald-700">
                    Net today
                  </span>

                  <span className="text-sm font-bold text-emerald-700">
                    TZS 0
                  </span>
                </div>

                <p className="mt-3 text-[10px] leading-4 text-slate-400">
                  Payments and expenses will be connected when those modules
                  are implemented.
                </p>
              </div>
            </article>

            {/* TODAY'S OPERATIONS */}
            <article className="kr-card min-w-0 overflow-hidden">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Today's operations
                  </p>

                  <h2 className="mt-1 text-base font-bold text-slate-900">
                    Fleet activity
                  </h2>
                </div>

                <Clock3 className="h-5 w-5 text-slate-300" />
              </div>

              {vehicles.length === 0 ? (
                <div className="p-8 text-center">
                  <Car className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No operational activity yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Vehicle assignments will appear here as operations are
                    created.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                          Vehicle
                        </th>

                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                          Type
                        </th>

                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                          Registration
                        </th>

                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                          Status
                        </th>

                        <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {vehicles.slice(0, 6).map((vehicle) => {
                        const statusClass =
                          vehicle.status === "AVAILABLE"
                            ? "bg-emerald-50 text-emerald-700"
                            : vehicle.status === "ON_TRIP"
                              ? "bg-blue-50 text-blue-700"
                              : vehicle.status === "MAINTENANCE"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600";

                        return (
                          <tr
                            className="transition hover:bg-slate-50"
                            key={vehicle.id}
                          >
                            <td className="px-4 py-3">
                              <p className="text-xs font-bold text-slate-700">
                                {vehicle.make} {vehicle.model}
                              </p>
                            </td>

                            <td className="px-4 py-3 text-xs text-slate-500">
                              {formatVehicleType(vehicle.type)}
                            </td>

                            <td className="px-4 py-3 text-xs font-medium text-slate-600">
                              {vehicle.registrationNumber}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusClass}`}
                              >
                                {formatStatus(vehicle.status)}
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <button
                                className="text-primary hover:text-emerald-800"
                                onClick={() =>
                                  (window.location.href =
                                    "/dashboard/vehicles")
                                }
                                type="button"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <button
                className="flex w-full items-center justify-between border-t px-5 py-3 text-xs font-semibold text-primary hover:bg-emerald-50"
                onClick={() =>
                  (window.location.href = "/dashboard/vehicles")
                }
                type="button"
              >
                View all vehicles
                <ChevronRight className="h-4 w-4" />
              </button>
            </article>

            {/* UTILIZATION */}
            <article className="kr-card">
              <div className="border-b px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  Vehicle utilization
                </p>

                <h2 className="mt-1 text-base font-bold text-slate-900">
                  Fleet overview
                </h2>
              </div>

              <div className="p-5">
                <div
                  className="mx-auto flex h-40 w-40 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(
                      #148269 0deg ${fleetStats.utilization * 3.6}deg,
                      #e2e8f0 ${fleetStats.utilization * 3.6}deg 360deg
                    )`,
                  }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                    <span className="text-3xl font-bold text-slate-900">
                      {fleetStats.utilization}%
                    </span>

                    <span className="text-[10px] font-medium text-slate-400">
                      On trip
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-2">
                  {[
                    {
                      label: "Available",
                      value: fleetStats.available,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "On trip",
                      value: fleetStats.onTrip,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Maintenance",
                      value: fleetStats.maintenance,
                      color: "bg-amber-500",
                    },
                    {
                      label: "Inactive",
                      value: fleetStats.inactive,
                      color: "bg-slate-400",
                    },
                  ].map((item) => (
                    <div
                      className="flex items-center justify-between"
                      key={item.label}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                        />

                        <span className="text-xs text-slate-500">
                          {item.label}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-slate-700">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold text-primary transition hover:bg-emerald-50"
                  onClick={() =>
                    (window.location.href = "/dashboard/vehicles")
                  }
                  type="button"
                >
                  View fleet
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          </section>
        </div>
      </section>
    </main>
  );
}
