import { FormEvent, useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDot,
  IdCard,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import {
  createDriver,
  Driver,
  DriverAvailability,
  getDrivers,
  updateDriver,
  updateDriverAvailability,
} from "../lib/api";
import { getStoredUser } from "../lib/auth";




const availabilityStyles: Record<DriverAvailability, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  UNAVAILABLE: "bg-red-50 text-red-700",
  ON_TRIP: "bg-blue-50 text-blue-700",
  OFF_DUTY: "bg-slate-100 text-slate-600",
};

function formatAvailability(value: DriverAvailability) {
  switch (value) {
    case "ON_TRIP":
      return "On trip";
    case "OFF_DUTY":
      return "Off duty";
    case "UNAVAILABLE":
      return "Unavailable";
    default:
      return "Available";
  }
}



export function DriversPage() {
  const user = getStoredUser();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [availabilityFilter, setAvailabilityFilter] =
    useState<"ALL" | DriverAvailability>("ALL");


  async function loadDrivers() {
    try {
      setLoading(true);
      setError("");

      const data = await getDrivers();
      setDrivers(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load drivers.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDrivers();
  }, []);

  const filteredDrivers = drivers.filter((driver) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      driver.name.toLowerCase().includes(search) ||
      driver.email.toLowerCase().includes(search) ||
      (driver.phone ?? "").toLowerCase().includes(search) ||
      driver.licenseNumber.toLowerCase().includes(search);

    const matchesAvailability =
      availabilityFilter === "ALL" ||
      driver.availability === availabilityFilter;

    return matchesSearch && matchesAvailability;
  });


  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await createDriver({
        name,
        email,
        phone: phone || undefined,
        licenseNumber,
      });

      setName("");
      setEmail("");
      setPhone("");
      setLicenseNumber("");
      setShowForm(false);

      await loadDrivers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create driver.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAvailabilityChange(
    id: string,
    availability: DriverAvailability,
  ) {
    try {
      setError("");

      await updateDriverAvailability(id, availability);
      await loadDrivers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update driver availability.",
      );
    }
  }


  function startEditing(driver: Driver) {
    setEditingDriver(driver);
    setName(driver.name);
    setEmail(driver.email);
    setPhone(driver.phone ?? "");
    setLicenseNumber(driver.licenseNumber);
    setError("");
    setShowForm(true);
  }

  function cancelEditing() {
    setEditingDriver(null);
    setName("");
    setEmail("");
    setPhone("");
    setLicenseNumber("");
    setError("");
    setShowForm(false);
  }

  async function handleUpdateDriver(event: FormEvent) {
  event.preventDefault();

  if (!editingDriver) {
    return;
  }

  try {
    setSaving(true);
    setError("");

    const updated = await updateDriver(editingDriver.id, {
      name,
      email,
      phone: phone || undefined,
      licenseNumber,
    });

    setDrivers((current) =>
      current.map((driver) =>
        driver.id === updated.id ? updated : driver,
      ),
    );

    cancelEditing();
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Unable to update driver.",
    );
  } finally {
    setSaving(false);
  }
}



  const driverStats = {
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
  };

  if (!user || !["ADMIN", "STAFF"].includes(user.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="kr-card w-full max-w-md p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only administrators and staff can manage drivers.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-5">
      {/* Driver workspace toolbar */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              <ShieldCheck size={13} />
              Driver workspace
            </span>

            {!loading && (
              <span className="text-xs font-medium text-slate-400">
                {drivers.length} driver{drivers.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Manage driver profiles, contact details and daily availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              cancelEditing();
            } else {
              setShowForm(true);
            }
          }}
          className={
            showForm
              ? "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              : "kr-button-primary shrink-0"
          }
        >
          {showForm ? (
            <>
              <X size={17} />
              Close form
            </>
          ) : (
            <>
              <Plus size={17} />
              Add driver
            </>
          )}
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Driver statistics */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Total drivers
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {driverStats.total}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Registered drivers
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <UserRound size={19} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Available
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {driverStats.available}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Ready for assignment
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={19} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                On trip
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {driverStats.onTrip}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Currently operating
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <CircleDot size={19} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Unavailable
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {driverStats.unavailable}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Off duty or unavailable
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <ShieldCheck size={19} />
            </div>
          </div>
        </div>
      </section>

      {/* Add/edit driver */}
      {showForm && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-white px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-sm">
                {editingDriver ? <Pencil size={18} /> : <Plus size={19} />}
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {editingDriver ? "Edit driver" : "Add a driver"}
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
                  {editingDriver
                    ? `Update the contact and licence information for ${editingDriver.name}.`
                    : "Create a KiliRide driver profile with contact and licence details."}
                </p>
              </div>
            </div>
          </div>

          <form
            className="grid gap-x-5 gap-y-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4"
            onSubmit={editingDriver ? handleUpdateDriver : handleSubmit}
          >
            <label className="kr-label">
              Full name *
              <input
                className="kr-input"
                placeholder="e.g. Joseph Mushi"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label className="kr-label">
              Email *
              <input
                className="kr-input"
                type="email"
                placeholder="driver@kiliride.co.tz"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="kr-label">
              Phone
              <input
                className="kr-input"
                placeholder="e.g. +255 712 345 678"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>

            <label className="kr-label">
              Licence number *
              <input
                className="kr-input"
                placeholder="Driver licence number"
                value={licenseNumber}
                onChange={(event) => setLicenseNumber(event.target.value)}
                required
              />
            </label>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end md:col-span-2 xl:col-span-4">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                className="kr-button-primary min-w-[150px]"
                disabled={saving}
                type="submit"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    {editingDriver ? "Saving..." : "Creating..."}
                  </>
                ) : editingDriver ? (
                  <>
                    <CheckCircle2 size={17} />
                    Save changes
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Add driver
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Driver directory */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Driver directory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredDrivers.length} of {drivers.length} driver
                {drivers.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-[330px]">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className="kr-input pl-9"
                  placeholder="Search name, phone, email or licence..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>

              <select
                className="kr-select sm:w-[185px]"
                value={availabilityFilter}
                onChange={(event) =>
                  setAvailabilityFilter(
                    event.target.value as "ALL" | DriverAvailability,
                  )
                }
              >
                <option value="ALL">All availability</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="ON_TRIP">On trip</option>
                <option value="OFF_DUTY">Off duty</option>
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
                Loading drivers...
              </p>
            </div>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center px-5 py-10">
            <div className="max-w-md text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-primary">
                <UserRound size={25} />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900">
                {drivers.length === 0
                  ? "No drivers yet"
                  : "No matching drivers"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {drivers.length === 0
                  ? "Create the first KiliRide driver profile to begin managing assignments and availability."
                  : "No driver matches the current search or availability filter."}
              </p>

              {drivers.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="kr-button-primary mt-5"
                >
                  <Plus size={17} />
                  Add first driver
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setAvailabilityFilter("ALL");
                  }}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredDrivers.map((driver) => {
              const initials = driver.name
                .split(" ")
                .filter(Boolean)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <article
                  key={driver.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5"
                >
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8f6f1] text-sm font-black text-primary">
                          {initials || "DR"}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-bold text-slate-950">
                            {driver.name}
                          </h3>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            KiliRide Driver
                          </p>
                        </div>
                      </div>

                      <select
                        className={`max-w-[140px] rounded-full border-0 px-2.5 py-1.5 text-[11px] font-bold outline-none ${availabilityStyles[driver.availability]}`}
                        value={driver.availability}
                        onChange={(event) =>
                          void handleAvailabilityChange(
                            driver.id,
                            event.target.value as DriverAvailability,
                          )
                        }
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="UNAVAILABLE">Unavailable</option>
                        <option value="ON_TRIP">On trip</option>
                        <option value="OFF_DUTY">Off duty</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 px-5 py-4">
                    <div className="flex items-start gap-3">
                      <Mail
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Email
                        </p>
                        <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
                          {driver.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Phone
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-slate-700">
                          {driver.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <IdCard
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Licence
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-slate-700">
                          {driver.licenseNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          driver.availability === "AVAILABLE"
                            ? "bg-emerald-500"
                            : driver.availability === "ON_TRIP"
                              ? "bg-sky-500"
                              : driver.availability === "UNAVAILABLE"
                                ? "bg-red-500"
                                : "bg-slate-400"
                        }`}
                      />

                      {formatAvailability(driver.availability)}
                    </div>

                    <button
                      type="button"
                      onClick={() => startEditing(driver)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-primary"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
