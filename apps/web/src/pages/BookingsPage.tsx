import { FormEvent, useEffect, useMemo, useState } from "react";
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
      const customerName = booking.customer?.user.name ?? "";
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-blue-600">KiliRide Operations</p>
            <h1 className="mt-1 text-2xl font-semibold">Bookings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage customer trips, assignments and payments.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setShowCreate((value) => !value);
              }}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              {showCreate ? "Close form" : "New booking"}
            </button>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-6 py-6">
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total bookings", stats.total, "bg-slate-900"],
            ["Pending", stats.pending, "bg-amber-500"],
            ["Active trips", stats.active, "bg-blue-600"],
            ["Completed", stats.completed, "bg-emerald-600"],
          ].map(([label, value, color]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div
                className={`mb-4 h-2 w-12 rounded-full ${String(color)}`}
              />
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </section>

        {showCreate && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Create booking</h2>
              <p className="mt-1 text-sm text-slate-500">
                Assigning a driver or vehicle is optional. The API will reject
                conflicting assignments.
              </p>
            </div>

            <form onSubmit={handleCreate} className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Customer *
                </span>
                <select
                  required
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.user.name} — {customer.user.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Driver
                </span>
                <select
                  value={driverId}
                  onChange={(event) => setDriverId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Leave unassigned</option>
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

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Vehicle
                </span>
                <select
                  value={vehicleId}
                  onChange={(event) => setVehicleId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Leave unassigned</option>
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

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Passengers *
                </span>
                <input
                  required
                  min="1"
                  type="number"
                  value={passengerCount}
                  onChange={(event) => setPassengerCount(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Pickup location *
                </span>
                <input
                  required
                  value={pickupLocation}
                  onChange={(event) => setPickupLocation(event.target.value)}
                  placeholder="e.g. Julius Nyerere Airport"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Destination *
                </span>
                <input
                  required
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="e.g. Arusha"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Pickup date & time *
                </span>
                <input
                  required
                  type="datetime-local"
                  value={pickupDate}
                  onChange={(event) => setPickupDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Drop-off date & time *
                </span>
                <input
                  required
                  type="datetime-local"
                  value={dropoffDate}
                  onChange={(event) => setDropoffDate(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Fare (TZS) *
                </span>
                <input
                  required
                  min="0"
                  step="1"
                  type="number"
                  value={fare}
                  onChange={(event) => setFare(event.target.value)}
                  placeholder="150000"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium">
                  Notes
                </span>
                <input
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional trip notes"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </label>

              <div className="flex items-end justify-end gap-3 md:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowCreate(false);
                  }}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create booking"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold">All bookings</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredBookings.length} booking
                {filteredBookings.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reference, customer or route..."
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-80"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "ALL" | BookingStatus,
                  )
                }
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
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

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading bookings...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-slate-700">No bookings found.</p>
              <p className="mt-1 text-sm text-slate-500">
                Create your first booking or change the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1250px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Booking</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Route</th>
                    <th className="px-5 py-3">Schedule</th>
                    <th className="px-5 py-3">Assignment</th>
                    <th className="px-5 py-3">Fare</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="align-top hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {booking.referenceNumber}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {booking.passengerCount} passenger
                          {booking.passengerCount === 1 ? "" : "s"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {booking.customer?.user.name ?? "Unknown customer"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {booking.customer?.user.phone ??
                            booking.customer?.user.email ??
                            "—"}
                        </p>
                      </td>

                      <td className="max-w-[230px] px-5 py-4">
                        <p className="font-medium">{booking.pickupLocation}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          → {booking.destination}
                        </p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <p>{formatDate(booking.pickupDate)}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          to {formatDate(booking.dropoffDate)}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium">
                          {booking.driver?.user.name ?? "No driver"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {booking.vehicle?.registrationNumber ??
                            "No vehicle"}
                        </p>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap font-medium">
                        {formatMoney(booking.fare)}
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
                          className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${statusClass(
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
                          className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${paymentClass(
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

                      <td className="px-5 py-4">
                        {booking.status !== "COMPLETED" &&
                          booking.status !== "CANCELLED" && (
                            <button
                              type="button"
                              onClick={() => void handleCancel(booking)}
                              className="text-xs font-semibold text-red-600 hover:text-red-700"
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
      </main>
    </div>
  );
}
