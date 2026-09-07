import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Headphones,
  Loader2,
  LogOut,
  MapPin,
  Navigation,
  Phone,
  Route,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  Booking,
  Driver,
  getDriverPortalBookings,
  getDriverPortalProfile,
  updateDriverPortalBookingStatus,
} from "../lib/api";
import {
  clearAuthSession,
  getStoredUser,
} from "../lib/auth";
import { logout } from "../lib/api";

type HistoryFilter =
  | "ALL"
  | "THIS_MONTH"
  | "LAST_30_DAYS";

const serviceLabels: Record<
  Booking["serviceType"],
  string
> = {
  AIRPORT_TRANSFER: "Airport transfer",
  SELF_DRIVE: "Self drive",
  CHAUFFEUR: "Chauffeur",
  SAFARI: "Safari / Tour",
  CORPORATE: "Corporate",
  WEDDING_EVENT: "Wedding / Event",
  OTHER: "Transport",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-TZ", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function isThisMonth(value: string) {
  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

function isWithinLast30Days(value: string) {
  const date = new Date(value).getTime();
  const now = Date.now();
  const thirtyDays =
    30 * 24 * 60 * 60 * 1000;

  return (
    date <= now &&
    date >= now - thirtyDays
  );
}

function statusLabel(status: Booking["status"]) {
  if (status === "IN_PROGRESS") {
    return "In progress";
  }

  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

function statusClass(status: Booking["status"]) {
  switch (status) {
    case "IN_PROGRESS":
      return "bg-sky-50 text-sky-700";
    case "ASSIGNED":
      return "bg-violet-50 text-violet-700";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    case "CONFIRMED":
      return "bg-cyan-50 text-cyan-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function mapsUrl(booking: Booking) {
  const origin = encodeURIComponent(
    booking.pickupLocation,
  );
  const destination = encodeURIComponent(
    booking.destination,
  );

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
}

export function DriverPortalPage() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [driver, setDriver] =
    useState<Driver | null>(null);
  const [bookings, setBookings] =
    useState<Booking[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [historyFilter, setHistoryFilter] =
    useState<HistoryFilter>("ALL");

  async function loadPortal() {
    try {
      setLoading(true);
      setError("");

      const [profile, tripData] =
        await Promise.all([
          getDriverPortalProfile(),
          getDriverPortalBookings(),
        ]);

      setDriver(profile);
      setBookings(tripData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load driver portal.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPortal();
  }, []);

  const firstName =
    (user?.name ?? "Driver")
      .trim()
      .split(/\s+/)[0];

  const activeTrip = useMemo(
    () =>
      bookings.find(
        (booking) =>
          booking.status === "IN_PROGRESS",
      ) ?? null,
    [bookings],
  );

  const nextTrip = useMemo(() => {
    if (activeTrip) {
      return activeTrip;
    }

    return (
      bookings
        .filter(
          (booking) =>
            booking.status === "ASSIGNED" ||
            booking.status === "CONFIRMED",
        )
        .sort(
          (a, b) =>
            new Date(
              a.pickupDate,
            ).getTime() -
            new Date(
              b.pickupDate,
            ).getTime(),
        )[0] ?? null
    );
  }, [activeTrip, bookings]);

  const upcomingTrips = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.id !== nextTrip?.id &&
            (booking.status === "ASSIGNED" ||
              booking.status ===
                "CONFIRMED"),
        )
        .sort(
          (a, b) =>
            new Date(
              a.pickupDate,
            ).getTime() -
            new Date(
              b.pickupDate,
            ).getTime(),
        ),
    [bookings, nextTrip],
  );

  const completedTrips = useMemo(
    () =>
      bookings
        .filter(
          (booking) =>
            booking.status === "COMPLETED",
        )
        .sort(
          (a, b) =>
            new Date(
              b.dropoffDate,
            ).getTime() -
            new Date(
              a.dropoffDate,
            ).getTime(),
        ),
    [bookings],
  );

  const filteredCompletedTrips =
    useMemo(() => {
      if (historyFilter === "THIS_MONTH") {
        return completedTrips.filter(
          (booking) =>
            isThisMonth(
              booking.dropoffDate,
            ),
        );
      }

      if (
        historyFilter === "LAST_30_DAYS"
      ) {
        return completedTrips.filter(
          (booking) =>
            isWithinLast30Days(
              booking.dropoffDate,
            ),
        );
      }

      return completedTrips;
    }, [
      completedTrips,
      historyFilter,
    ]);

  async function changeTripStatus(
    booking: Booking,
    status: "IN_PROGRESS" | "COMPLETED",
  ) {
    try {
      setUpdatingId(booking.id);
      setError("");

      await updateDriverPortalBookingStatus(
        booking.id,
        status,
      );

      await loadPortal();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update trip.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6]">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />

          <p className="mt-3 text-sm font-semibold text-slate-600">
            Loading your trips...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#073b2e] text-white">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d6a84f] text-[#073b2e]">
              <Car className="h-5 w-5" />
            </div>

            <div>
              <p className="font-black tracking-[0.12em]">
                KILIRIDE
              </p>

              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
                Driver
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">
              Sign out
            </span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-7">
        {/* Driver greeting */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {driver?.availability
                .replace(/_/g, " ")
                .toLowerCase()}
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-[-0.035em] text-[#073b2e] sm:text-4xl">
              Hello,{" "}
              <span className="text-[#c39235]">
                {firstName}
              </span>
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Your assigned KiliRide journeys
              are here.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-primary">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800">
                {driver?.name}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Licence {driver?.licenseNumber}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-3">
          <DriverMetric
            label="Assigned"
            value={
              bookings.filter(
                (booking) =>
                  booking.status === "ASSIGNED",
              ).length
            }
            icon={CalendarDays}
          />

          <DriverMetric
            label="In progress"
            value={
              activeTrip ? 1 : 0
            }
            icon={Navigation}
          />

          <DriverMetric
            label="Completed"
            value={
              bookings.filter(
                (booking) =>
                  booking.status === "COMPLETED",
              ).length
            }
            icon={CheckCircle2}
          />
        </section>

        {/* Main trip */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                Priority
              </p>
              <h2 className="mt-1 text-lg font-black text-slate-950">
                {activeTrip
                  ? "Trip in progress"
                  : "Next assigned trip"}
              </h2>
            </div>
          </div>

          {nextTrip ? (
            <TripCard
              booking={nextTrip}
              prominent
              updating={
                updatingId === nextTrip.id
              }
              onStart={() =>
                void changeTripStatus(
                  nextTrip,
                  "IN_PROGRESS",
                )
              }
              onComplete={() =>
                void changeTripStatus(
                  nextTrip,
                  "COMPLETED",
                )
              }
            />
          ) : (
            <div className="flex min-h-[260px] items-center justify-center rounded-[26px] border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="max-w-sm">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-primary">
                  <Route className="h-6 w-6" />
                </div>

                <h3 className="mt-4 font-black text-slate-900">
                  No assigned trip
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  New assignments from KiliRide
                  operations will appear here
                  automatically.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Upcoming */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-black text-slate-950">
              Upcoming assignments
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Trips scheduled after your next
              assignment.
            </p>
          </div>

          {upcomingTrips.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-7 text-center text-sm text-slate-400 shadow-sm">
              No additional assignments.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {upcomingTrips.map(
                (booking) => (
                  <TripCard
                    key={booking.id}
                    booking={booking}
                    updating={false}
                  />
                ),
              )}
            </div>
          )}
        </section>

        {/* Driver-only trip history */}
        <section className="pb-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                My activity
              </p>

              <h2 className="mt-1 text-lg font-black text-slate-950">
                My trip history
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Only journeys completed by you
                are shown here.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <HistoryFilterButton
                active={
                  historyFilter === "ALL"
                }
                onClick={() =>
                  setHistoryFilter("ALL")
                }
              >
                All completed
              </HistoryFilterButton>

              <HistoryFilterButton
                active={
                  historyFilter ===
                  "THIS_MONTH"
                }
                onClick={() =>
                  setHistoryFilter(
                    "THIS_MONTH",
                  )
                }
              >
                This month
              </HistoryFilterButton>

              <HistoryFilterButton
                active={
                  historyFilter ===
                  "LAST_30_DAYS"
                }
                onClick={() =>
                  setHistoryFilter(
                    "LAST_30_DAYS",
                  )
                }
              >
                Last 30 days
              </HistoryFilterButton>
            </div>
          </div>

          <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-5">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Completed journeys
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {
                      filteredCompletedTrips.length
                    }{" "}
                    trip
                    {
                      filteredCompletedTrips.length ===
                      1
                        ? ""
                        : "s"
                    }
                  </p>
                </div>
              </div>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                {
                  filteredCompletedTrips.length
                }
              </span>
            </div>

            {filteredCompletedTrips.length ===
            0 ? (
              <div className="flex min-h-[180px] items-center justify-center px-5 py-8 text-center">
                <div>
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                    <Route className="h-5 w-5" />
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-800">
                    No completed trips
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    No journeys match this
                    history filter.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredCompletedTrips.map(
                  (booking) => (
                    <div
                      key={booking.id}
                      className="group flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50/70 sm:px-5"
                    >
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {
                              booking.pickupLocation
                            }
                            {" "}
                            →
                            {" "}
                            {
                              booking.destination
                            }
                          </p>

                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                            {
                              serviceLabels[
                                booking
                                  .serviceType
                              ]
                            }
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
                          <span>
                            {
                              formatDateTime(
                                booking.pickupDate,
                              )
                            }
                          </span>

                          <span>
                            {
                              booking.referenceNumber
                            }
                          </span>

                          {booking.vehicle && (
                            <span>
                              {
                                booking.vehicle
                                  .registrationNumber
                              }
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden shrink-0 text-right sm:block">
                        <p className="text-[10px] font-bold text-emerald-700">
                          Completed
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          Your trip
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        </section>

        <section className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500">
            <Headphones className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Need operational help?
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Contact KiliRide operations before
              changing an assignment.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function TripCard({
  booking,
  prominent = false,
  updating,
  onStart,
  onComplete,
}: {
  booking: Booking;
  prominent?: boolean;
  updating: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}) {
  const customerPhone =
    booking.customer?.phone ??
    booking.customer?.user?.phone ??
    null;

  return (
    <article
      className={`overflow-hidden border bg-white shadow-sm ${
        prominent
          ? "rounded-[28px] border-emerald-200"
          : "rounded-2xl border-slate-200"
      }`}
    >
      <div
        className={`flex items-center justify-between gap-3 ${
          prominent
            ? "bg-[#073b2e] px-5 py-4 text-white sm:px-6"
            : "border-b border-slate-100 px-4 py-3"
        }`}
      >
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.12em] ${
              prominent
                ? "text-[#d6a84f]"
                : "text-emerald-700"
            }`}
          >
            {serviceLabels[
              booking.serviceType
            ]}
          </p>

          <p
            className={`mt-1 text-xs font-bold ${
              prominent
                ? "text-white/55"
                : "text-slate-400"
            }`}
          >
            {booking.referenceNumber}
          </p>
        </div>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            prominent &&
            booking.status === "IN_PROGRESS"
              ? "bg-sky-400/15 text-sky-200"
              : statusClass(
                  booking.status,
                )
          }`}
        >
          {statusLabel(booking.status)}
        </span>
      </div>

      <div className={prominent ? "p-5 sm:p-6" : "p-4"}>
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-primary">
            <MapPin className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Route
            </p>
            <p className="mt-1 font-black text-slate-900">
              {booking.pickupLocation}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              → {booking.destination}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <DetailBox
            icon={Clock3}
            label="Pickup"
            value={formatDateTime(
              booking.pickupDate,
            )}
          />

          <DetailBox
            icon={UserRound}
            label="Customer"
            value={
              booking.customer?.name ??
              "Customer"
            }
          />

          <DetailBox
            icon={Car}
            label="Vehicle"
            value={
              booking.vehicle
                ? `${booking.vehicle.make} ${booking.vehicle.model} · ${booking.vehicle.registrationNumber}`
                : "Not assigned"
            }
          />
        </div>

        {prominent && (
          <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-5 sm:flex-row">
            <a
              href={mapsUrl(booking)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Navigation className="h-4 w-4" />
              Open route
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {customerPhone && (
              <a
                href={`tel:${customerPhone}`}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700"
              >
                <Phone className="h-4 w-4" />
                Call customer
              </a>
            )}

            {booking.status ===
              "ASSIGNED" && (
              <button
                type="button"
                disabled={updating}
                onClick={onStart}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#087456] px-4 text-xs font-bold text-white disabled:opacity-60"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Start trip
              </button>
            )}

            {booking.status ===
              "IN_PROGRESS" && (
              <button
                type="button"
                disabled={updating}
                onClick={onComplete}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#d6a84f] px-4 text-xs font-black text-[#073b2e] disabled:opacity-60"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Complete trip
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function HistoryFilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-[11px] font-bold transition ${
        active
          ? "bg-[#073b2e] text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function DriverMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CalendarDays;
}) {
  return (
    <article className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-2xl font-black text-slate-950">
          {value}
        </p>
      </div>
    </article>
  );
}

function DetailBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5">
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-700">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
