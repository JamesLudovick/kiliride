import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Car,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Booking,
  Driver,
  Vehicle,
  getBookings,
  getDrivers,
  getVehicles,
} from "../lib/api";
import { getStoredUser } from "../lib/auth";

function formatMoney(value: string | number) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-TZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-TZ", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function bookingStatusClass(status: Booking["status"]) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    case "IN_PROGRESS":
      return "bg-sky-50 text-sky-700";
    case "ASSIGNED":
      return "bg-violet-50 text-violet-700";
    case "CONFIRMED":
      return "bg-cyan-50 text-cyan-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function formatBookingStatus(status: Booking["status"]) {
  switch (status) {
    case "IN_PROGRESS":
      return "In progress";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

export function AdminDashboard() {
  const user = getStoredUser();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [bookingData, vehicleData, driverData] = await Promise.all([
          getBookings(),
          getVehicles(),
          getDrivers(),
        ]);

        setBookings(bookingData);
        setVehicles(vehicleData);
        setDrivers(driverData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load KiliRide operations data.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const today = useMemo(() => new Date(), []);

  const todayBookings = useMemo(
    () =>
      bookings
        .filter((booking) =>
          isSameLocalDay(new Date(booking.pickupDate), today),
        )
        .sort(
          (a, b) =>
            new Date(a.pickupDate).getTime() -
            new Date(b.pickupDate).getTime(),
        ),
    [bookings, today],
  );

  const upcomingBookings = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            new Date(booking.pickupDate).getTime() > today.getTime() &&
            booking.status !== "CANCELLED" &&
            booking.status !== "COMPLETED",
        )
        .sort(
          (a, b) =>
            new Date(a.pickupDate).getTime() -
            new Date(b.pickupDate).getTime(),
        )
        .slice(0, 5),
    [bookings, today],
  );

  const bookingStats = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "PENDING")
        .length,
      active: bookings.filter(
        (booking) =>
          booking.status === "ASSIGNED" ||
          booking.status === "IN_PROGRESS",
      ).length,
      completed: bookings.filter(
        (booking) => booking.status === "COMPLETED",
      ).length,
      paymentAttention: bookings.filter(
        (booking) => booking.paymentStatus !== "PAID",
      ).length,
    }),
    [bookings],
  );

  const fleetStats = useMemo(
    () => ({
      total: vehicles.length,
      available: vehicles.filter(
        (vehicle) => vehicle.status === "AVAILABLE",
      ).length,
      onTrip: vehicles.filter(
        (vehicle) => vehicle.status === "ON_TRIP",
      ).length,
      maintenance: vehicles.filter(
        (vehicle) => vehicle.status === "MAINTENANCE",
      ).length,
      inactive: vehicles.filter(
        (vehicle) => vehicle.status === "INACTIVE",
      ).length,
    }),
    [vehicles],
  );

  const driverStats = useMemo(
    () => ({
      total: drivers.length,
      available: drivers.filter(
        (driver) => driver.availability === "AVAILABLE",
      ).length,
      onTrip: drivers.filter(
        (driver) => driver.availability === "ON_TRIP",
      ).length,
      unavailable: drivers.filter(
        (driver) =>
          driver.availability === "UNAVAILABLE" ||
          driver.availability === "OFF_DUTY",
      ).length,
    }),
    [drivers],
  );

  const todayPaidValue = useMemo(
    () =>
      todayBookings
        .filter((booking) => booking.paymentStatus === "PAID")
        .reduce((total, booking) => total + Number(booking.fare), 0),
    [todayBookings],
  );

  const alerts = useMemo(() => {
    const items: {
      title: string;
      description: string;
      tone: "warning" | "danger" | "info" | "success";
    }[] = [];

    if (bookingStats.pending > 0) {
      items.push({
        title: `${bookingStats.pending} pending booking${
          bookingStats.pending === 1 ? "" : "s"
        }`,
        description: "Review reservations that still need confirmation.",
        tone: "warning",
      });
    }

    if (fleetStats.maintenance > 0) {
      items.push({
        title: `${fleetStats.maintenance} vehicle${
          fleetStats.maintenance === 1 ? "" : "s"
        } in maintenance`,
        description: "These vehicles are currently unavailable for assignment.",
        tone: "warning",
      });
    }

    if (driverStats.unavailable > 0) {
      items.push({
        title: `${driverStats.unavailable} unavailable driver${
          driverStats.unavailable === 1 ? "" : "s"
        }`,
        description: "Driver capacity is reduced for upcoming assignments.",
        tone: "info",
      });
    }

    if (bookingStats.paymentAttention > 0) {
      items.push({
        title: `${bookingStats.paymentAttention} booking${
          bookingStats.paymentAttention === 1 ? "" : "s"
        } need payment attention`,
        description: "At least one booking is unpaid or partially paid.",
        tone: "info",
      });
    }

    if (items.length === 0) {
      items.push({
        title: "Operations look healthy",
        description: "There are no immediate operational alerts.",
        tone: "success",
      });
    }

    return items.slice(0, 4);
  }, [
    bookingStats.pending,
    bookingStats.paymentAttention,
    driverStats.unavailable,
    fleetStats.maintenance,
  ]);

  const firstName = user?.name?.split(" ")[0] || "Admin";

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good morning"
      : greetingHour < 17
        ? "Good afternoon"
        : "Good evening";

  if (loading) {
    return (
      <div className="flex min-h-[480px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-primary"
          />

          <p className="mt-3 text-sm font-semibold text-slate-600">
            Loading KiliRide operations...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Checking bookings, fleet and drivers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Welcome / command area */}
      <section className="overflow-hidden rounded-2xl border border-emerald-950/5 bg-gradient-to-br from-[#0b352c] via-[#0e493c] to-[#176451] px-5 py-4 text-white shadow-lg shadow-emerald-950/10 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-50">
              <CheckCircle2 size={14} />
              Operations online
            </span>

            <h2 className="mt-3 text-xl font-bold tracking-tight sm:text-2xl">
              {greeting}, {firstName}.
            </h2>

            <p className="mt-1.5 max-w-xl text-sm leading-5 text-emerald-50/70">
              Here&apos;s what is happening across bookings, vehicles and
              drivers today.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <NavLink
              to="/dashboard/bookings"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3.5 text-xs font-bold text-[#0c3a31] shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              <CalendarDays size={17} />
              Manage bookings
            </NavLink>

            <NavLink
              to="/dashboard/vehicles"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              <Car size={17} />
              View fleet
            </NavLink>
          </div>
        </div>
      </section>

      {error && (
        <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle size={19} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-bold">Unable to load all operations data</p>
            <p className="mt-1 text-xs text-red-600">{error}</p>
          </div>
        </section>
      )}

      {/* Primary KPIs */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Today&apos;s bookings
              </p>

              <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">
                {todayBookings.length}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Pickups today
              </p>
            </div>

            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-primary">
              <CalendarDays size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-amber-200/70 bg-white p-3.5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Pending
              </p>

              <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">
                {bookingStats.pending}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Needs confirmation
              </p>
            </div>

            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Clock3 size={17} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-sky-200/70 bg-white p-3.5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Active trips
              </p>

              <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">
                {bookingStats.active}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Assigned or in progress
              </p>
            </div>

            <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <MapPin size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-200/70 bg-white p-3.5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Vehicles available
              </p>

              <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">
                {fleetStats.available}
                <span className="ml-1 text-base font-semibold text-slate-300">
                  / {fleetStats.total}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Ready for assignment
              </p>
            </div>

            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Car size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-violet-200/70 bg-white p-3.5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Drivers available
              </p>

              <p className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950">
                {driverStats.available}
                <span className="ml-1 text-base font-semibold text-slate-300">
                  / {driverStats.total}
                </span>
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Ready for assignment
              </p>
            </div>

            <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <ShieldCheck size={19} />
            </div>
          </div>
        </article>
      </section>

      {/* Today's operations + attention */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.75fr)_minmax(280px,0.65fr)]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3.5 sm:px-5">
            <div>
              <h3 className="font-bold text-slate-950">
                Today&apos;s operations
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Trips scheduled to start today.
              </p>
            </div>

            <NavLink
              to="/dashboard/bookings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-emerald-800"
            >
              All bookings
              <ArrowUpRight size={14} />
            </NavLink>
          </div>

          {todayBookings.length === 0 ? (
            <div className="flex min-h-[185px] items-center justify-center px-5 py-5">
              <div className="max-w-md text-center">
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-primary">
                  <CalendarDays size={25} />
                </div>

                <h4 className="mt-3 text-sm font-bold text-slate-900">
                  No pickups scheduled today
                </h4>

                <p className="mt-1.5 text-xs leading-5 text-slate-500">
                  New bookings scheduled for today will appear here with their
                  customer, route and assignment details.
                </p>

                <NavLink
                  to="/dashboard/bookings"
                  className="kr-button-primary mt-3 h-9 px-3 text-xs"
                >
                  Manage bookings
                </NavLink>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {todayBookings.slice(0, 6).map((booking) => (
                <div
                  key={booking.id}
                  className="grid gap-4 px-5 py-4 transition hover:bg-emerald-50/20 lg:grid-cols-[80px_minmax(0,1.25fr)_minmax(0,1fr)_auto]"
                >
                  <div>
                    <p className="text-lg font-bold tracking-tight text-slate-900">
                      {formatTime(booking.pickupDate)}
                    </p>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Pickup
                    </p>
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900">
                      {booking.customer?.name ?? "Unknown customer"}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {booking.referenceNumber} · {booking.passengerCount} passenger
                      {booking.passengerCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-start gap-2">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-primary"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {booking.pickupLocation}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          to {booking.destination}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 lg:justify-end">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-600">
                        {booking.vehicle?.registrationNumber ?? "No vehicle"}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {booking.driver?.user.name ?? "No driver"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${bookingStatusClass(
                        booking.status,
                      )}`}
                    >
                      {formatBookingStatus(booking.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
            <h3 className="text-sm font-bold text-slate-950">Needs attention</h3>

            <p className="mt-1 text-xs text-slate-500">
              Operational items worth reviewing.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => {
              const iconClass =
                alert.tone === "warning"
                  ? "bg-amber-50 text-amber-700"
                  : alert.tone === "danger"
                    ? "bg-red-50 text-red-700"
                    : alert.tone === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-sky-50 text-sky-700";

              return (
                <div key={alert.title} className="flex gap-3 p-3.5">
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${iconClass}`}
                  >
                    {alert.tone === "success" ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <AlertTriangle size={17} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {alert.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {alert.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      {/* Lower summaries */}
      <section className="grid gap-4 lg:grid-cols-3">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-950">Fleet overview</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Current vehicle state.
                </p>
              </div>

              <Car size={19} className="text-slate-300" />
            </div>
          </div>

          <div className="space-y-3 p-5">
            {[
              {
                label: "Available",
                value: fleetStats.available,
                dot: "bg-emerald-500",
              },
              {
                label: "On trip",
                value: fleetStats.onTrip,
                dot: "bg-sky-500",
              },
              {
                label: "Maintenance",
                value: fleetStats.maintenance,
                dot: "bg-amber-500",
              },
              {
                label: "Inactive",
                value: fleetStats.inactive,
                dot: "bg-slate-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>

                <span className="text-sm font-bold text-slate-800">
                  {item.value}
                </span>
              </div>
            ))}

            <NavLink
              to="/dashboard/vehicles"
              className="mt-4 flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold text-primary transition hover:bg-emerald-50"
            >
              View fleet
              <ArrowUpRight size={14} />
            </NavLink>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-950">
                  Booking overview
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Reservation pipeline.
                </p>
              </div>

              <CalendarDays size={19} className="text-slate-300" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-5">
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
                Pending
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {bookingStats.pending}
              </p>
            </div>

            <div className="rounded-xl bg-sky-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-sky-700">
                Active
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {bookingStats.active}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                Completed
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {bookingStats.completed}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
                Total
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {bookingStats.total}
              </p>
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-950">
                  Today&apos;s booking value
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Fare value marked as paid.
                </p>
              </div>

              <CircleDollarSign size={19} className="text-slate-300" />
            </div>
          </div>

          <div className="p-5">
            <p className="text-3xl font-bold tracking-tight text-slate-950">
              {formatMoney(todayPaidValue)}
            </p>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              This uses the booking fare for today&apos;s reservations currently
              marked as paid. Detailed payment accounting will come with the
              Payments module.
            </p>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-amber-50 px-3 py-3">
              <span className="text-xs font-semibold text-amber-800">
                Payment attention
              </span>

              <span className="text-sm font-bold text-amber-800">
                {bookingStats.paymentAttention}
              </span>
            </div>
          </div>
        </article>
      </section>

      {/* Upcoming */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3.5 sm:px-5">
          <div>
            <h3 className="font-bold text-slate-950">
              Upcoming journeys
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Next confirmed operational work.
            </p>
          </div>

          <Clock3 size={19} className="text-slate-300" />
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-semibold text-slate-600">
              No upcoming journeys
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Future active bookings will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingBookings.map((booking) => (
              <NavLink
                key={booking.id}
                to="/dashboard/bookings"
                className="rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/20 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary">
                      {formatShortDate(booking.pickupDate)} ·{" "}
                      {formatTime(booking.pickupDate)}
                    </p>

                    <p className="mt-2 font-bold text-slate-900">
                      {booking.customer?.name ?? "Unknown customer"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${bookingStatusClass(
                      booking.status,
                    )}`}
                  >
                    {formatBookingStatus(booking.status)}
                  </span>
                </div>

                <div className="mt-4 flex items-start gap-2 text-sm text-slate-600">
                  <MapPin
                    size={14}
                    className="mt-0.5 shrink-0 text-slate-400"
                  />

                  <p className="line-clamp-2">
                    {booking.pickupLocation} → {booking.destination}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <UsersRound size={13} />
                    {booking.passengerCount} passenger
                    {booking.passengerCount === 1 ? "" : "s"}
                  </div>

                  <span className="text-xs font-bold text-slate-600">
                    {booking.vehicle?.registrationNumber ?? "Unassigned"}
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
