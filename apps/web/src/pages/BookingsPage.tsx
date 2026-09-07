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
  AirportTransferType,
  Booking,
  BookingServiceType,
  BookingStatus,
  Customer,
  Driver,
  PaymentStatus,
  Vehicle,
  cancelBooking,
  createBooking,
  createCustomer,
  getBookings,
  getCustomers,
  getDrivers,
  getVehicles,
  updateBooking,
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

const serviceTypeLabels: Record<BookingServiceType, string> = {
  AIRPORT_TRANSFER: "Airport Transfer",
  SELF_DRIVE: "Self Drive",
  CHAUFFEUR: "Chauffeur",
  SAFARI: "Safari / Tour",
  CORPORATE: "Corporate",
  WEDDING_EVENT: "Wedding / Event",
  OTHER: "Other",
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


const nextBookingAction: Partial<
  Record<
    BookingStatus,
    {
      status: BookingStatus;
      label: string;
    }
  >
> = {
  PENDING: {
    status: "CONFIRMED",
    label: "Confirm",
  },
  CONFIRMED: {
    status: "ASSIGNED",
    label: "Mark assigned",
  },
  ASSIGNED: {
    status: "IN_PROGRESS",
    label: "Start trip",
  },
  IN_PROGRESS: {
    status: "COMPLETED",
    label: "Complete trip",
  },
};

function canCancelBooking(status: BookingStatus) {
  return (
    status === "PENDING" ||
    status === "CONFIRMED" ||
    status === "ASSIGNED"
  );
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] =
    useState<string | null>(null);

  const [resourceEditingId, setResourceEditingId] =
    useState<string | null>(null);
  const [resourceDriverId, setResourceDriverId] = useState("");
  const [resourceVehicleId, setResourceVehicleId] = useState("");
  const [resourceSavingId, setResourceSavingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | BookingStatus>("ALL");
  const [showCreate, setShowCreate] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [serviceType, setServiceType] =
    useState<BookingServiceType>("AIRPORT_TRANSFER");

  const [airportTransferType, setAirportTransferType] =
    useState<AirportTransferType>("ARRIVAL");
  const [flightNumber, setFlightNumber] = useState("");
  const [airline, setAirline] = useState("");
  const [airportTerminal, setAirportTerminal] = useState("");
  const [showQuickCustomer, setShowQuickCustomer] = useState(false);
  const [customerSaving, setCustomerSaving] = useState(false);
  const [quickCustomerError, setQuickCustomerError] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");

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
    setServiceType("AIRPORT_TRANSFER");
    setAirportTransferType("ARRIVAL");
    setFlightNumber("");
    setAirline("");
    setAirportTerminal("");
    setShowQuickCustomer(false);
    setQuickCustomerError("");
    setNewCustomerName("");
    setNewCustomerPhone("");
    setNewCustomerEmail("");

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

  async function handleQuickCustomerCreate() {
    const customerName = newCustomerName.trim();

    if (!customerName) {
      setQuickCustomerError("Customer name is required.");
      return;
    }

    try {
      setCustomerSaving(true);
      setQuickCustomerError("");
      setError("");
      setSuccess("");

      const created = await createCustomer({
        name: customerName,
        ...(newCustomerPhone.trim()
          ? { phone: newCustomerPhone.trim() }
          : {}),
        ...(newCustomerEmail.trim()
          ? { email: newCustomerEmail.trim() }
          : {}),
      });

      setCustomers((current) =>
        [...current, created].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );

      setCustomerId(created.id);

      setNewCustomerName("");
      setNewCustomerPhone("");
      setNewCustomerEmail("");
      setShowQuickCustomer(false);

      setSuccess(
        `${created.name} was created and selected for this booking.`,
      );
    } catch (err) {
      setQuickCustomerError(
        err instanceof Error
          ? err.message
          : "Unable to create customer.",
      );
    } finally {
      setCustomerSaving(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createBooking({
        customerId,
        serviceType,

        ...(serviceType === "AIRPORT_TRANSFER"
          ? {
              airportTransferType,
              ...(flightNumber.trim()
                ? { flightNumber: flightNumber.trim() }
                : {}),
              ...(airline.trim()
                ? { airline: airline.trim() }
                : {}),
              ...(airportTerminal.trim()
                ? { airportTerminal: airportTerminal.trim() }
                : {}),
            }
          : {}),

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

  function openResourceEditor(booking: Booking) {
    if (resourceEditingId === booking.id) {
      setResourceEditingId(null);
      return;
    }

    setResourceEditingId(booking.id);
    setResourceDriverId(booking.driverId ?? "");
    setResourceVehicleId(booking.vehicleId ?? "");
    setError("");
    setSuccess("");
  }

  async function handleResourceSave(booking: Booking) {
    setError("");
    setSuccess("");
    setResourceSavingId(booking.id);

    try {
      await updateBooking(booking.id, {
        driverId: resourceDriverId,
        vehicleId: resourceVehicleId,
      });

      setSuccess(
        `Resources updated for ${booking.referenceNumber}.`,
      );

      setResourceEditingId(null);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update booking resources.",
      );
    } finally {
      setResourceSavingId(null);
    }
  }

  async function handleStatusChange(
    booking: Booking,
    status: BookingStatus,
  ) {
    setError("");
    setSuccess("");
    setStatusUpdatingId(booking.id);

    try {
      await updateBookingStatus(booking.id, status);
      setResourceEditingId(null);

      setSuccess(
        `${booking.referenceNumber} is now ${statusLabels[status]}.`,
      );

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update booking status.",
      );
    } finally {
      setStatusUpdatingId(null);
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
    setStatusUpdatingId(booking.id);

    try {
      await cancelBooking(booking.id);
      setSuccess(`${booking.referenceNumber} has been cancelled.`);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to cancel booking.",
      );
    } finally {
      setStatusUpdatingId(null);
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
        serviceTypeLabels[booking.serviceType]
          .toLowerCase()
          .includes(query) ||
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
            <div className="lg:col-span-4">
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label
                  htmlFor="booking-customer"
                  className="text-sm font-semibold text-slate-800"
                >
                  Customer *
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setQuickCustomerError("");
                    setShowQuickCustomer((value) => !value);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:text-emerald-800"
                >
                  {showQuickCustomer ? (
                    <>
                      <X size={13} />
                      Cancel new customer
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      New customer
                    </>
                  )}
                </button>
              </div>

              <select
                id="booking-customer"
                required
                value={customerId}
                onChange={(event) => {
                  setCustomerId(event.target.value);
                  setQuickCustomerError("");
                }}
                className="kr-select"
              >
                <option value="">
                  {customers.length === 0
                    ? "No customers yet"
                    : "Select customer"}
                </option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} —{" "}
                    {customer.phone ??
                      customer.email ??
                      "No contact"}
                  </option>
                ))}
              </select>

              <span className="kr-help">
                Select an existing customer or create one without leaving
                this booking.
              </span>

              {showQuickCustomer && (
                <div
                  className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleQuickCustomerCreate();
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        New customer
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        Create the customer now and KiliRide will select them
                        automatically for this booking.
                      </p>
                    </div>

                    <UsersRound
                      size={18}
                      className="shrink-0 text-primary"
                    />
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <label className="kr-label">
                      Name *
                      <input
                        value={newCustomerName}
                        onChange={(event) =>
                          setNewCustomerName(event.target.value)
                        }
                        className="kr-input bg-white"
                        placeholder="e.g. John Massawe"
                      />
                    </label>

                    <label className="kr-label">
                      Phone
                      <input
                        value={newCustomerPhone}
                        onChange={(event) =>
                          setNewCustomerPhone(event.target.value)
                        }
                        className="kr-input bg-white"
                        placeholder="+255 7..."
                      />
                    </label>

                    <label className="kr-label">
                      Email
                      <input
                        type="email"
                        value={newCustomerEmail}
                        onChange={(event) =>
                          setNewCustomerEmail(event.target.value)
                        }
                        className="kr-input bg-white"
                        placeholder="Optional"
                      />
                    </label>
                  </div>

                  {quickCustomerError && (
                    <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                      {quickCustomerError}
                    </div>
                  )}

                  <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={customerSaving}
                      onClick={() => {
                        setShowQuickCustomer(false);
                        setQuickCustomerError("");
                        setNewCustomerName("");
                        setNewCustomerPhone("");
                        setNewCustomerEmail("");
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={
                        customerSaving || !newCustomerName.trim()
                      }
                      onClick={() =>
                        void handleQuickCustomerCreate()
                      }
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {customerSaving ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          Create & select
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <label className="kr-label lg:col-span-2">
              Service type *
              <select
                required
                value={serviceType}
                onChange={(event) => {
                  const nextServiceType =
                    event.target.value as BookingServiceType;

                  setServiceType(nextServiceType);

                  if (nextServiceType !== "AIRPORT_TRANSFER") {
                    setAirportTransferType("ARRIVAL");
                    setFlightNumber("");
                    setAirline("");
                    setAirportTerminal("");
                  }
                }}
                className="kr-select"
              >
                {Object.entries(serviceTypeLabels).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>

              <span className="kr-help">
                Type of transport service.
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

            {serviceType === "AIRPORT_TRANSFER" && (
              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 lg:col-span-12">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Airport transfer details
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Add flight information when available. This helps
                      operations coordinate airport pickups and departures.
                    </p>
                  </div>

                  <MapPin
                    size={18}
                    className="shrink-0 text-sky-700"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <label className="kr-label">
                    Transfer direction *
                    <select
                      required
                      value={airportTransferType}
                      onChange={(event) =>
                        setAirportTransferType(
                          event.target.value as AirportTransferType,
                        )
                      }
                      className="kr-select bg-white"
                    >
                      <option value="ARRIVAL">
                        Arrival — Airport pickup
                      </option>

                      <option value="DEPARTURE">
                        Departure — Airport drop-off
                      </option>
                    </select>
                  </label>

                  <label className="kr-label">
                    Flight number
                    <input
                      value={flightNumber}
                      onChange={(event) =>
                        setFlightNumber(event.target.value)
                      }
                      className="kr-input bg-white"
                      placeholder="e.g. KQ 482"
                    />
                  </label>

                  <label className="kr-label">
                    Airline
                    <input
                      value={airline}
                      onChange={(event) =>
                        setAirline(event.target.value)
                      }
                      className="kr-input bg-white"
                      placeholder="e.g. Kenya Airways"
                    />
                  </label>

                  <label className="kr-label">
                    Terminal / meeting point
                    <input
                      value={airportTerminal}
                      onChange={(event) =>
                        setAirportTerminal(event.target.value)
                      }
                      className="kr-input bg-white"
                      placeholder="e.g. KIA arrivals"
                    />
                  </label>
                </div>
              </div>
            )}

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

                      <span className="mt-1.5 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                        {serviceTypeLabels[booking.serviceType]}
                      </span>

                      {booking.serviceType === "AIRPORT_TRANSFER" &&
                        booking.airportTransferType && (
                          <p className="mt-1 text-[10px] font-semibold text-sky-600">
                            {booking.airportTransferType === "ARRIVAL"
                              ? "Airport arrival"
                              : "Airport departure"}
                            {booking.flightNumber
                              ? ` · ${booking.flightNumber}`
                              : ""}
                          </p>
                        )}

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
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold ${statusClass(
                          booking.status,
                        )}`}
                      >
                        {statusLabels[booking.status]}
                      </span>
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

                    <td className="px-5 py-4 align-top">
                      {(() => {
                        const nextAction =
                          nextBookingAction[booking.status];

                        const isUpdating =
                          statusUpdatingId === booking.id;

                        const isResourceSaving =
                          resourceSavingId === booking.id;

                        const resourcesReady = Boolean(
                          booking.driverId && booking.vehicleId,
                        );

                        const needsResources =
                          nextAction?.status === "ASSIGNED";

                        const nextActionDisabled =
                          isUpdating ||
                          isResourceSaving ||
                          (needsResources && !resourcesReady);

                        const canManageResources =
                          booking.status === "PENDING" ||
                          booking.status === "CONFIRMED" ||
                          booking.status === "ASSIGNED";

                        const resourceEditorOpen =
                          resourceEditingId === booking.id;

                        const hasAnyResource =
                          Boolean(
                            booking.driverId || booking.vehicleId,
                          );

                        const assignedNeedsBoth =
                          booking.status === "ASSIGNED";

                        const resourceSaveDisabled =
                          isResourceSaving ||
                          (
                            assignedNeedsBoth &&
                            (
                              !resourceDriverId ||
                              !resourceVehicleId
                            )
                          );

                        return (
                          <div className="flex min-w-[190px] flex-col items-end gap-2">
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {nextAction && (
                                <button
                                  type="button"
                                  disabled={nextActionDisabled}
                                  onClick={() =>
                                    void handleStatusChange(
                                      booking,
                                      nextAction.status,
                                    )
                                  }
                                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-[11px] font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                >
                                  {isUpdating ? (
                                    <Loader2
                                      size={13}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <CheckCircle2 size={13} />
                                  )}

                                  {nextAction.label}
                                </button>
                              )}

                              {canManageResources && (
                                <button
                                  type="button"
                                  disabled={
                                    isUpdating ||
                                    isResourceSaving
                                  }
                                  onClick={() =>
                                    openResourceEditor(booking)
                                  }
                                  className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-primary disabled:opacity-40"
                                >
                                  {resourceEditorOpen
                                    ? "Close"
                                    : hasAnyResource
                                      ? "Change resources"
                                      : "Assign resources"}
                                </button>
                              )}

                              {canCancelBooking(booking.status) && (
                                <button
                                  type="button"
                                  disabled={
                                    isUpdating ||
                                    isResourceSaving
                                  }
                                  onClick={() =>
                                    void handleCancel(booking)
                                  }
                                  className="h-8 rounded-lg px-2.5 text-[11px] font-bold text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                                >
                                  Cancel
                                </button>
                              )}

                              {booking.status === "COMPLETED" && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                                  <CheckCircle2 size={14} />
                                  Journey finished
                                </span>
                              )}

                              {booking.status === "CANCELLED" && (
                                <span className="text-[11px] font-bold text-slate-400">
                                  Booking closed
                                </span>
                              )}
                            </div>

                            {needsResources && !resourcesReady && (
                              <p className="max-w-[190px] text-right text-[10px] leading-4 text-amber-600">
                                Assign both a driver and vehicle first.
                              </p>
                            )}

                            {resourceEditorOpen &&
                              canManageResources && (
                                <div className="w-[260px] rounded-xl border border-slate-200 bg-slate-50 p-3 text-left shadow-sm">
                                  <p className="text-xs font-bold text-slate-900">
                                    Trip resources
                                  </p>

                                  <p className="mt-1 text-[10px] leading-4 text-slate-500">
                                    Assign the driver and vehicle before
                                    starting this journey.
                                  </p>

                                  <label className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                    Driver
                                  </label>

                                  <select
                                    value={resourceDriverId}
                                    onChange={(event) =>
                                      setResourceDriverId(
                                        event.target.value,
                                      )
                                    }
                                    className="kr-select mt-1 bg-white text-xs"
                                  >
                                    <option value="">
                                      Unassigned
                                    </option>

                                    {drivers.map((driver) => (
                                      <option
                                        key={driver.id}
                                        value={driver.id}
                                        disabled={
                                          driver.availability !==
                                            "AVAILABLE" &&
                                          driver.id !==
                                            resourceDriverId
                                        }
                                      >
                                        {driver.name} —{" "}
                                        {driver.availability}
                                      </option>
                                    ))}
                                  </select>

                                  <label className="mt-3 block text-[10px] font-bold uppercase tracking-wide text-slate-500">
                                    Vehicle
                                  </label>

                                  <select
                                    value={resourceVehicleId}
                                    onChange={(event) =>
                                      setResourceVehicleId(
                                        event.target.value,
                                      )
                                    }
                                    className="kr-select mt-1 bg-white text-xs"
                                  >
                                    <option value="">
                                      Unassigned
                                    </option>

                                    {vehicles.map((vehicle) => (
                                      <option
                                        key={vehicle.id}
                                        value={vehicle.id}
                                        disabled={
                                          vehicle.status !==
                                            "AVAILABLE" &&
                                          vehicle.id !==
                                            resourceVehicleId
                                        }
                                      >
                                        {vehicle.registrationNumber}
                                        {" — "}
                                        {vehicle.make}{" "}
                                        {vehicle.model}
                                      </option>
                                    ))}
                                  </select>

                                  {assignedNeedsBoth &&
                                    (
                                      !resourceDriverId ||
                                      !resourceVehicleId
                                    ) && (
                                      <p className="mt-2 text-[10px] leading-4 text-amber-600">
                                        An assigned booking must keep
                                        both resources.
                                      </p>
                                    )}

                                  <div className="mt-3 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      disabled={isResourceSaving}
                                      onClick={() =>
                                        setResourceEditingId(null)
                                      }
                                      className="h-8 rounded-lg px-2.5 text-[11px] font-bold text-slate-500 hover:bg-white"
                                    >
                                      Cancel
                                    </button>

                                    <button
                                      type="button"
                                      disabled={resourceSaveDisabled}
                                      onClick={() =>
                                        void handleResourceSave(
                                          booking,
                                        )
                                      }
                                      className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-[11px] font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                    >
                                      {isResourceSaving && (
                                        <Loader2
                                          size={12}
                                          className="animate-spin"
                                        />
                                      )}

                                      Save resources
                                    </button>
                                  </div>
                                </div>
                              )}
                          </div>
                        );
                      })()}
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
