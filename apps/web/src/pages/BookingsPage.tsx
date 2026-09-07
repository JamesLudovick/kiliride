import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Loader2,
  MapPin,
  Plus,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import {
  Booking,
  BookingStatus,
  Customer,
  Driver,
  PaymentStatus,
  Vehicle,
  cancelBooking,
  createBooking,
  getBookings,
  getCustomers,
  getDrivers,
  getVehicles,
  updateBookingPaymentStatus,
  updateBookingStatus,
} from "../lib/api";

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const paymentLabels: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-TZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: string | number) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function statusClass(status: BookingStatus) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    case "IN_PROGRESS":
      return "bg-blue-50 text-blue-700";
    case "ASSIGNED":
      return "bg-violet-50 text-violet-700";
    case "CONFIRMED":
      return "bg-cyan-50 text-cyan-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function paymentClass(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700";
    case "PARTIALLY_PAID":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL");
  const [showCreate, setShowCreate] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [passengerCount, setPassengerCount] = useState("1");
  const [fare, setFare] = useState("");
  const [notes, setNotes] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [bookingData, customerData, driverData, vehicleData] =
        await Promise.all([
          getBookings(),
          getCustomers(),
          getDrivers(),
          getVehicles(),
        ]);

      setBookings(bookingData);
      setCustomers(customerData);
      setDrivers(driverData);
      setVehicles(vehicleData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load booking data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function resetForm() {
    setCustomerId("");
    setDriverId("");
    setVehicleId("");
    setPickupLocation("");
    setDestination("");
    setPickupDate("");
    setDropoffDate("");
    setPassengerCount("1");
    setFare("");
    setNotes("");
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createBooking({
        customerId,
        ...(driverId ? { driverId } : {}),
        ...(vehicleId ? { vehicleId } : {}),
        pickupLocation,
        destination,
        pickupDate: new Date(pickupDate).toISOString(),
        dropoffDate: new Date(dropoffDate).toISOString(),
        passengerCount: Number(passengerCount),
        fare: Number(fare),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      resetForm();
      setShowCreate(false);
      setSuccess("Booking created successfully.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create booking.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    booking: Booking,
    status: BookingStatus,
  ) {
    setError("");
    setSuccess("");

    try {
      await updateBookingStatus(booking.id, status);
      setSuccess(`${booking.referenceNumber} is now ${statusLabels[status]}.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update booking status.",
      );
    }
  }

  async function handlePaymentChange(
    booking: Booking,
    paymentStatus: PaymentStatus,
  ) {
    setError("");
    setSuccess("");

    try {
      await updateBookingPaymentStatus(booking.id, paymentStatus);
      setSuccess(`Payment status updated for ${booking.referenceNumber}.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update payment status.",
      );
    }
  }

  async function handleCancel(booking: Booking) {
    if (
      !window.confirm(
        `Cancel booking ${booking.referenceNumber}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await cancelBooking(booking.id);
      setSuccess(`${booking.referenceNumber} has been cancelled.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to cancel booking.",
      );
    }
  }

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const customerName = booking.customer?.name ?? "";
      const matchesSearch =
        !query ||
        booking.referenceNumber.toLowerCase().includes(query) ||
        customerName.toLowerCase().includes(query) ||
        booking.pickupLocation.toLowerCase().includes(query) ||
        booking.destination.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      active: bookings.filter(
        (b) => b.status === "ASSIGNED" || b.status === "IN_PROGRESS",
      ).length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
    };
  }, [bookings]);

  return (
    <div className="space-y-5">
      {/* Page action strip */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              <CalendarDays size={13} />
              Reservations workspace
            </span>

            {!loading && (
              <span className="text-xs font-medium text-slate-400">
                {bookings.length} booking{bookings.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Create journeys, assign resources and follow each trip through completion.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowCreate((value) => !value);
          }}
          className={
            showCreate
              ? "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              : "kr-button-primary shrink-0"
          }
        >
          {showCreate ? (
            <>
              <X size={17} />
              Close form
            </>
          ) : (
            <>
              <Plus size={17} />
              New booking
            </>
          )}
        </button>
      </section>

      {/* Feedback */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-700 shadow-sm">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      {/* Booking statistics */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Total bookings
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {stats.total}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                All reservations
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <CalendarDays size={19} />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Pending
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {stats.pending}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Needs attention
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 size={19} />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-emerald-200/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Active trips
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {stats.active}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Assigned or in progress
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-primary">
              <MapPin size={19} />
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-emerald-200/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Completed
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {stats.completed}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Finished journeys
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={19} />
            </div>
          </div>
        </div>
      </section>

      {/* Create booking */}
      {showCreate && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-white px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-sm">
                <Plus size={19} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Create a new booking
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
                  Record the journey now. A driver or vehicle can be assigned
                  immediately or added later when operations are confirmed.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleCreate}
            className="grid gap-x-5 gap-y-5 p-5 sm:p-6 lg:grid-cols-12"
          >
            <label className="kr-label lg:col-span-6">
              Customer *
              <select
                required
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className="kr-select"
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} — {customer.email ?? customer.phone ?? "No contact"}
                  </option>
                ))}
              </select>
              <span className="kr-help">
                Select an existing KiliRide customer.
              </span>
            </label>

            <label className="kr-label lg:col-span-3">
              Driver
              <select
                value={driverId}
                onChange={(event) => setDriverId(event.target.value)}
                className="kr-select"
              >
                <option value="">Unassigned</option>
                {drivers.map((driver) => (
                  <option
                    key={driver.id}
                    value={driver.id}
                    disabled={driver.availability !== "AVAILABLE"}
                  >
                    {driver.name} — {driver.availability}
                  </option>
                ))}
              </select>
            </label>

            <label className="kr-label lg:col-span-3">
              Vehicle
              <select
                value={vehicleId}
                onChange={(event) => setVehicleId(event.target.value)}
                className="kr-select"
              >
                <option value="">Unassigned</option>
                {vehicles.map((vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                    disabled={vehicle.status !== "AVAILABLE"}
                  >
                    {vehicle.registrationNumber} — {vehicle.make}{" "}
                    {vehicle.model}
                  </option>
                ))}
              </select>
            </label>

            <label className="kr-label lg:col-span-6">
              Pickup location *
              <input
                required
                value={pickupLocation}
                onChange={(event) => setPickupLocation(event.target.value)}
                placeholder="e.g. Kilimanjaro International Airport"
                className="kr-input"
              />
            </label>

            <label className="kr-label lg:col-span-6">
              Destination *
              <input
                required
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="e.g. Moshi town"
                className="kr-input"
              />
            </label>

            <label className="kr-label lg:col-span-4">
              Pickup date & time *
              <input
                required
                type="datetime-local"
                value={pickupDate}
                onChange={(event) => setPickupDate(event.target.value)}
                className="kr-input"
              />
            </label>

            <label className="kr-label lg:col-span-4">
              Drop-off date & time *
              <input
                required
                type="datetime-local"
                value={dropoffDate}
                onChange={(event) => setDropoffDate(event.target.value)}
                className="kr-input"
              />
            </label>

            <label className="kr-label lg:col-span-4">
              Passengers *
              <input
                required
                min="1"
                type="number"
                value={passengerCount}
                onChange={(event) => setPassengerCount(event.target.value)}
                className="kr-input"
              />
            </label>

            <label className="kr-label lg:col-span-4">
              Fare (TZS) *
              <input
                required
                min="0"
                step="1"
                type="number"
                value={fare}
                onChange={(event) => setFare(event.target.value)}
                placeholder="e.g. 150000"
                className="kr-input"
              />
            </label>

            <label className="kr-label lg:col-span-8">
              Notes
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Flight number, special requests or internal trip notes"
                className="kr-input"
              />
            </label>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end lg:col-span-12">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreate(false);
                }}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                disabled={saving}
                type="submit"
                className="kr-button-primary min-w-[150px]"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Create booking
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Booking directory */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Booking directory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredBookings.length} of {bookings.length} booking
                {bookings.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-[330px]">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search customer, reference or route..."
                  className="kr-input pl-9"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "ALL" | BookingStatus,
                  )
                }
                className="kr-select sm:w-[175px]"
              >
                <option value="ALL">All statuses</option>

                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={25}
                className="mx-auto animate-spin text-primary"
              />
              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading bookings...
              </p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center px-5 py-10">
            <div className="max-w-md text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-primary">
                <CalendarDays size={25} />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900">
                {bookings.length === 0
                  ? "No bookings yet"
                  : "No matching bookings"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {bookings.length === 0
                  ? "Create the first KiliRide reservation and start building today's operations schedule."
                  : "No reservations match the search or status filter you selected."}
              </p>

              {bookings.length === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setShowCreate(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="kr-button-primary mt-5"
                >
                  <Plus size={17} />
                  Create first booking
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  <th className="px-5 py-3.5">Booking</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Journey</th>
                  <th className="px-5 py-3.5">Schedule</th>
                  <th className="px-5 py-3.5">Assignment</th>
                  <th className="px-5 py-3.5">Fare</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="align-top transition hover:bg-emerald-50/25"
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">
                        {booking.referenceNumber}
                      </p>

                      <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                        <UsersRound size={13} />
                        {booking.passengerCount} passenger
                        {booking.passengerCount === 1 ? "" : "s"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {booking.customer?.name ?? "Unknown customer"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {booking.customer?.phone ??
                          booking.customer?.email ??
                          "—"}
                      </p>
                    </td>

                    <td className="max-w-[240px] px-5 py-4">
                      <div className="flex gap-2">
                        <MapPin
                          size={15}
                          className="mt-0.5 shrink-0 text-primary"
                        />

                        <div>
                          <p className="font-semibold text-slate-800">
                            {booking.pickupLocation}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            to {booking.destination}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <p className="font-medium text-slate-700">
                        {formatDate(booking.pickupDate)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        to {formatDate(booking.dropoffDate)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-700">
                        {booking.driver?.user.name ?? "Driver unassigned"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {booking.vehicle?.registrationNumber ??
                          "Vehicle unassigned"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <CircleDollarSign
                          size={15}
                          className="text-slate-400"
                        />
                        {formatMoney(booking.fare)}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={booking.status}
                        disabled={
                          booking.status === "COMPLETED" ||
                          booking.status === "CANCELLED"
                        }
                        onChange={(event) =>
                          void handleStatusChange(
                            booking,
                            event.target.value as BookingStatus,
                          )
                        }
                        className={`rounded-full border-0 px-2.5 py-1.5 text-xs font-bold outline-none ${statusClass(
                          booking.status,
                        )}`}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-4">
                      <select
                        value={booking.paymentStatus}
                        onChange={(event) =>
                          void handlePaymentChange(
                            booking,
                            event.target.value as PaymentStatus,
                          )
                        }
                        className={`rounded-full border-0 px-2.5 py-1.5 text-xs font-bold outline-none ${paymentClass(
                          booking.paymentStatus,
                        )}`}
                      >
                        {Object.entries(paymentLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {booking.status !== "COMPLETED" &&
                        booking.status !== "CANCELLED" && (
                          <button
                            type="button"
                            onClick={() => void handleCancel(booking)}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:text-red-700"
                          >
                            Cancel
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
