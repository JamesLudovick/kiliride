import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  CalendarDays,
  CalendarRange,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Booking,
  getBookings,
  getVehicles,
  MaintenanceRecord,
  Vehicle,
} from "../lib/api";

type CalendarFilter =
  | "ALL"
  | "BOOKINGS"
  | "MAINTENANCE";

type CalendarEventTone =
  | "booking"
  | "dropoff"
  | "warning"
  | "danger"
  | "success"
  | "neutral";

type CalendarEventKind =
  | "BOOKING_PICKUP"
  | "BOOKING_DROPOFF"
  | "MAINTENANCE"
  | "NEXT_SERVICE";

type CalendarEvent = {
  id: string;
  category: "BOOKINGS" | "MAINTENANCE";
  kind: CalendarEventKind;
  date: Date;
  title: string;
  label: string;
  subtitle: string;
  tone: CalendarEventTone;
  booking?: Booking;
  vehicle?: Vehicle;
  maintenance?: MaintenanceRecord;
};

const weekdayLabels = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

const maintenanceTypeLabels: Record<
  MaintenanceRecord["type"],
  string
> = {
  ROUTINE_SERVICE: "Routine service",
  REPAIR: "Repair",
  INSPECTION: "Inspection",
  TYRE_SERVICE: "Tyre service",
  BATTERY: "Battery",
  BODYWORK: "Bodywork",
  OTHER: "Other",
};

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(date.getDate()).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}

function isSameDay(a: Date, b: Date) {
  return dateKey(a) === dateKey(b);
}

function isSameMonth(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth()
  );
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-TZ", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en-TZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-TZ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function bookingStatusLabel(
  status: Booking["status"],
) {
  if (status === "IN_PROGRESS") {
    return "In progress";
  }

  return (
    status.charAt(0) +
    status.slice(1).toLowerCase()
  );
}

function serviceTypeLabel(
  value: Booking["serviceType"],
) {
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function eventToneClasses(
  tone: CalendarEventTone,
) {
  switch (tone) {
    case "booking":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "dropoff":
      return "border-sky-200 bg-sky-50 text-sky-800";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "danger":
      return "border-red-200 bg-red-50 text-red-700";
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function createCalendarDays(month: Date) {
  const firstDay = new Date(
    month.getFullYear(),
    month.getMonth(),
    1,
  );

  const mondayOffset =
    (firstDay.getDay() + 6) % 7;

  const gridStart = new Date(
    firstDay.getFullYear(),
    firstDay.getMonth(),
    1 - mondayOffset,
  );

  return Array.from(
    {
      length: 42,
    },
    (_, index) =>
      new Date(
        gridStart.getFullYear(),
        gridStart.getMonth(),
        gridStart.getDate() + index,
      ),
  );
}

export function CalendarPage() {
  const [bookings, setBookings] = useState<
    Booking[]
  >([]);
  const [vehicles, setVehicles] = useState<
    Vehicle[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] =
    useState<CalendarFilter>("ALL");

  const [displayMonth, setDisplayMonth] =
    useState(
      () =>
        new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ),
    );

  const [
    selectedEvent,
    setSelectedEvent,
  ] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    async function loadCalendar() {
      try {
        setLoading(true);
        setError("");

        const [bookingData, vehicleData] =
          await Promise.all([
            getBookings(),
            getVehicles(),
          ]);

        setBookings(bookingData);
        setVehicles(vehicleData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load calendar data.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCalendar();
  }, []);

  const today = useMemo(
    () => startOfDay(new Date()),
    [],
  );

  const events = useMemo<CalendarEvent[]>(() => {
    const result: CalendarEvent[] = [];

    for (const booking of bookings) {
      if (booking.status === "CANCELLED") {
        continue;
      }

      const customerName =
        booking.customer?.name ??
        booking.referenceNumber;

      const pickupDate = new Date(
        booking.pickupDate,
      );

      result.push({
        id: `pickup-${booking.id}`,
        category: "BOOKINGS",
        kind: "BOOKING_PICKUP",
        date: pickupDate,
        title: customerName,
        label: `Pickup · ${customerName}`,
        subtitle: `${booking.pickupLocation} → ${booking.destination}`,
        tone: "booking",
        booking,
      });

      const dropoffDate = new Date(
        booking.dropoffDate,
      );

      result.push({
        id: `dropoff-${booking.id}`,
        category: "BOOKINGS",
        kind: "BOOKING_DROPOFF",
        date: dropoffDate,
        title: customerName,
        label: `Drop-off · ${customerName}`,
        subtitle: booking.destination,
        tone: "dropoff",
        booking,
      });
    }

    for (const vehicle of vehicles) {
      const records =
        vehicle.maintenanceRecords ?? [];

      for (const record of records) {
        if (record.status === "CANCELLED") {
          continue;
        }

        const serviceDate = new Date(
          record.serviceDate,
        );

        let tone: CalendarEventTone =
          "neutral";

        if (
          record.status === "SCHEDULED" &&
          startOfDay(serviceDate).getTime() <
            today.getTime()
        ) {
          tone = "danger";
        } else if (
          record.status === "SCHEDULED" ||
          record.status === "IN_PROGRESS"
        ) {
          tone = "warning";
        } else if (
          record.status === "COMPLETED"
        ) {
          tone = "success";
        }

        result.push({
          id: `maintenance-${record.id}`,
          category: "MAINTENANCE",
          kind: "MAINTENANCE",
          date: serviceDate,
          title: `${vehicle.make} ${vehicle.model}`,
          label: `${
            record.status === "COMPLETED"
              ? "Serviced"
              : record.status === "IN_PROGRESS"
                ? "In service"
                : "Service"
          } · ${vehicle.registrationNumber}`,
          subtitle:
            record.description ??
            maintenanceTypeLabels[record.type],
          tone,
          vehicle,
          maintenance: record,
        });
      }

      const latestCompletedWithNextDate =
        records
          .filter(
            (record) =>
              record.status === "COMPLETED" &&
              Boolean(
                record.nextServiceDate,
              ),
          )
          .sort(
            (a, b) =>
              new Date(
                b.serviceDate,
              ).getTime() -
              new Date(
                a.serviceDate,
              ).getTime(),
          )[0];

      if (
        latestCompletedWithNextDate
          ?.nextServiceDate
      ) {
        const nextDate = new Date(
          latestCompletedWithNextDate.nextServiceDate,
        );

        result.push({
          id: `next-service-${latestCompletedWithNextDate.id}`,
          category: "MAINTENANCE",
          kind: "NEXT_SERVICE",
          date: nextDate,
          title: `${vehicle.make} ${vehicle.model}`,
          label: `Next service · ${vehicle.registrationNumber}`,
          subtitle:
            latestCompletedWithNextDate
              .description ??
            maintenanceTypeLabels[
              latestCompletedWithNextDate.type
            ],
          tone:
            startOfDay(
              nextDate,
            ).getTime() <
            today.getTime()
              ? "danger"
              : "warning",
          vehicle,
          maintenance:
            latestCompletedWithNextDate,
        });
      }
    }

    return result.sort(
      (a, b) =>
        a.date.getTime() - b.date.getTime(),
    );
  }, [bookings, vehicles, today]);

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          filter === "ALL" ||
          event.category === filter,
      ),
    [events, filter],
  );

  useEffect(() => {
    if (
      selectedEvent &&
      filter !== "ALL" &&
      selectedEvent.category !== filter
    ) {
      setSelectedEvent(null);
    }
  }, [filter, selectedEvent]);

  const calendarDays = useMemo(
    () => createCalendarDays(displayMonth),
    [displayMonth],
  );

  const eventsByDay = useMemo(() => {
    const grouped = new Map<
      string,
      CalendarEvent[]
    >();

    for (const event of filteredEvents) {
      const key = dateKey(event.date);
      const current = grouped.get(key) ?? [];
      current.push(event);
      grouped.set(key, current);
    }

    return grouped;
  }, [filteredEvents]);

  const monthBookingCount = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status !== "CANCELLED" &&
          isSameMonth(
            new Date(booking.pickupDate),
            displayMonth,
          ),
      ).length,
    [bookings, displayMonth],
  );

  const monthMaintenanceCount = useMemo(
    () =>
      events.filter(
        (event) =>
          event.category === "MAINTENANCE" &&
          isSameMonth(
            event.date,
            displayMonth,
          ),
      ).length,
    [events, displayMonth],
  );

  const overdueCount = useMemo(
    () =>
      events.filter(
        (event) =>
          event.category === "MAINTENANCE" &&
          event.tone === "danger",
      ).length,
    [events],
  );

  const todayCount = useMemo(
    () =>
      filteredEvents.filter((event) =>
        isSameDay(event.date, today),
      ).length,
    [filteredEvents, today],
  );

  function moveMonth(amount: number) {
    setDisplayMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() + amount,
          1,
        ),
    );
    setSelectedEvent(null);
  }

  function goToday() {
    const now = new Date();

    setDisplayMonth(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ),
    );
    setSelectedEvent(null);
  }

  return (
    <div className="space-y-5">
      {/* Calendar toolbar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                <CalendarRange size={13} />
                Operations calendar
              </span>

              {!loading && (
                <span className="text-xs font-medium text-slate-400">
                  {events.length} operational event
                  {events.length === 1
                    ? ""
                    : "s"}
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-slate-500">
              See bookings, vehicle movements and
              maintenance schedules in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label="Previous month"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="min-w-[170px] text-center">
              <p className="font-bold text-slate-950">
                {formatMonth(displayMonth)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label="Next month"
            >
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              onClick={goToday}
              className="inline-flex h-10 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-xs font-bold text-primary transition hover:bg-emerald-100"
            >
              Today
            </button>
          </div>
        </div>
      </section>

      {error && (
        <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0"
          />
          <div>
            <p className="font-bold">
              Unable to load operations calendar
            </p>
            <p className="mt-1 text-xs">
              {error}
            </p>
          </div>
        </section>
      )}

      {/* KPI cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-emerald-200/70 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Bookings this month
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {monthBookingCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Scheduled pickups
          </p>
        </article>

        <article className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Maintenance events
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {monthMaintenanceCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            In {formatMonth(displayMonth)}
          </p>
        </article>

        <article className="rounded-2xl border border-red-200/70 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Overdue service
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {overdueCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Requires attention
          </p>
        </article>

        <article className="rounded-2xl border border-sky-200/70 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Today
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {todayCount}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Visible operational events
          </p>
        </article>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap gap-2">
        {(
          [
            ["ALL", "All"],
            ["BOOKINGS", "Bookings"],
            ["MAINTENANCE", "Maintenance"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={
              filter === value
                ? "rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm"
                : "rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            }
          >
            {label}
          </button>
        ))}
      </section>

      {loading ? (
        <section className="flex min-h-[480px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <Loader2
              size={28}
              className="mx-auto animate-spin text-primary"
            />
            <p className="mt-3 text-sm font-semibold text-slate-600">
              Loading operations calendar...
            </p>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Month view */}
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
              {weekdayLabels.map((day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-xs"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((day) => {
                const key = dateKey(day);
                const dayEvents =
                  eventsByDay.get(key) ?? [];

                const currentMonth =
                  isSameMonth(
                    day,
                    displayMonth,
                  );

                const todayCell =
                  isSameDay(day, today);

                return (
                  <div
                    key={key}
                    className={`min-h-[110px] border-b border-r border-slate-100 p-1.5 sm:min-h-[132px] sm:p-2 ${
                      currentMonth
                        ? "bg-white"
                        : "bg-slate-50/60"
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                          todayCell
                            ? "bg-primary text-white"
                            : currentMonth
                              ? "text-slate-700"
                              : "text-slate-300"
                        }`}
                      >
                        {day.getDate()}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="text-[9px] font-bold text-slate-300">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayEvents
                        .slice(0, 3)
                        .map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() =>
                              setSelectedEvent(
                                event,
                              )
                            }
                            className={`block w-full truncate rounded-md border px-1.5 py-1 text-left text-[9px] font-bold leading-4 transition hover:shadow-sm sm:text-[10px] ${eventToneClasses(
                              event.tone,
                            )}`}
                            title={event.label}
                          >
                            {event.label}
                          </button>
                        ))}

                      {dayEvents.length > 3 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedEvent(
                              dayEvents[3],
                            )
                          }
                          className="px-1 text-[9px] font-bold text-slate-400 hover:text-primary"
                        >
                          +{dayEvents.length - 3} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          {/* Event details */}
          <aside className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:sticky xl:top-[96px]">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-bold text-slate-950">
                Event details
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Select an event from the calendar.
              </p>
            </div>

            {!selectedEvent ? (
              <div className="flex min-h-[330px] items-center justify-center p-6">
                <div className="max-w-[240px] text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-primary">
                    <CalendarDays size={22} />
                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-800">
                    Nothing selected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Click a booking or maintenance
                    event to see its operational
                    details.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 p-5">
                <div>
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${eventToneClasses(
                      selectedEvent.tone,
                    )}`}
                  >
                    {selectedEvent.kind ===
                    "BOOKING_PICKUP"
                      ? "Booking pickup"
                      : selectedEvent.kind ===
                          "BOOKING_DROPOFF"
                        ? "Booking drop-off"
                        : selectedEvent.kind ===
                            "NEXT_SERVICE"
                          ? "Next service"
                          : "Maintenance"}
                  </span>

                  <h3 className="mt-3 text-lg font-bold text-slate-950">
                    {selectedEvent.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedEvent.subtitle}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3.5">
                  <div className="flex items-center gap-2">
                    <Clock3
                      size={16}
                      className="text-primary"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {formatFullDate(
                          selectedEvent.date,
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {formatTime(
                          selectedEvent.date,
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedEvent.booking && (
                  <BookingDetails
                    booking={
                      selectedEvent.booking
                    }
                  />
                )}

                {selectedEvent.vehicle &&
                  selectedEvent.maintenance && (
                    <MaintenanceDetails
                      vehicle={
                        selectedEvent.vehicle
                      }
                      record={
                        selectedEvent.maintenance
                      }
                    />
                  )}
              </div>
            )}
          </aside>
        </section>
      )}

      {/* Legend */}
      <section className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[11px] font-semibold text-slate-500 shadow-sm">
        <span className="font-bold text-slate-700">
          Legend
        </span>

        <LegendDot
          className="bg-emerald-500"
          label="Booking pickup"
        />

        <LegendDot
          className="bg-sky-500"
          label="Booking drop-off"
        />

        <LegendDot
          className="bg-amber-500"
          label="Maintenance / upcoming"
        />

        <LegendDot
          className="bg-red-500"
          label="Overdue service"
        />

        <LegendDot
          className="bg-emerald-300"
          label="Completed service"
        />
      </section>
    </div>
  );
}

function BookingDetails({
  booking,
}: {
  booking: Booking;
}) {
  return (
    <>
      <div className="space-y-3">
        <DetailRow
          icon={CalendarDays}
          label="Booking"
          value={booking.referenceNumber}
        />

        <DetailRow
          icon={UserRound}
          label="Customer"
          value={
            booking.customer?.name ??
            "Customer unavailable"
          }
        />

        <DetailRow
          icon={MapPin}
          label="Route"
          value={`${booking.pickupLocation} → ${booking.destination}`}
        />

        <DetailRow
          icon={Car}
          label="Vehicle"
          value={
            booking.vehicle
              ? `${booking.vehicle.registrationNumber} · ${booking.vehicle.make} ${booking.vehicle.model}`
              : "Not assigned"
          }
        />

        <DetailRow
          icon={ShieldCheck}
          label="Driver"
          value={
            booking.driver?.user.name ??
            "Not assigned"
          }
        />

        <DetailRow
          icon={CheckCircle2}
          label="Status"
          value={`${bookingStatusLabel(
            booking.status,
          )} · ${serviceTypeLabel(
            booking.serviceType,
          )}`}
        />
      </div>

      <NavLink
        to="/dashboard/bookings"
        className="kr-button-primary flex w-full justify-center"
      >
        Open bookings
      </NavLink>
    </>
  );
}

function MaintenanceDetails({
  vehicle,
  record,
}: {
  vehicle: Vehicle;
  record: MaintenanceRecord;
}) {
  return (
    <>
      <div className="space-y-3">
        <DetailRow
          icon={Car}
          label="Vehicle"
          value={`${vehicle.registrationNumber} · ${vehicle.make} ${vehicle.model}`}
        />

        <DetailRow
          icon={Wrench}
          label="Service"
          value={
            maintenanceTypeLabels[
              record.type
            ]
          }
        />

        <DetailRow
          icon={CheckCircle2}
          label="Status"
          value={record.status
            .replace(/_/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (character) =>
              character.toUpperCase(),
            )}
        />

        <DetailRow
          icon={ShieldCheck}
          label="Provider"
          value={
            record.provider ??
            "Not specified"
          }
        />

        <DetailRow
          icon={Clock3}
          label="Mileage"
          value={
            record.mileage !== null
              ? `${record.mileage.toLocaleString()} km`
              : "Not recorded"
          }
        />

        {record.nextServiceDate && (
          <DetailRow
            icon={CalendarRange}
            label="Next service"
            value={new Intl.DateTimeFormat(
              "en-TZ",
              {
                day: "numeric",
                month: "short",
                year: "numeric",
              },
            ).format(
              new Date(
                record.nextServiceDate,
              ),
            )}
          />
        )}

        {record.description && (
          <div className="rounded-xl border border-slate-100 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Description
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {record.description}
            </p>
          </div>
        )}
      </div>

      <NavLink
        to="/dashboard/maintenance"
        className="kr-button-primary flex w-full justify-center"
      >
        Open maintenance
      </NavLink>
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={15} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-xs font-semibold leading-5 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function LegendDot({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-2.5 w-2.5 rounded-full ${className}`}
      />
      {label}
    </span>
  );
}
