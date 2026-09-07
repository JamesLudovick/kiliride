import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
  ShieldCheck,
  UserRound,
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
}


function cancelEditing() {
  setEditingDriver(null);
  setName("");
  setEmail("");
  setPhone("");
  setLicenseNumber("");
  setError("");
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
    <main className="min-h-screen">
      <header className="kr-page-header sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <button
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
              onClick={() => {
                window.location.href = "/dashboard";
              }}
              type="button"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to dashboard
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  KiliRide Operations
                </p>
                <h1 className="text-xl font-bold tracking-tight">
                  Driver Management
                </h1>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Driver system online
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="kr-card overflow-hidden">
          <div className="border-b bg-gradient-to-r from-primary/[0.07] via-transparent to-secondary/[0.08] px-5 py-5">
            <div className="flex items-center gap-2">
              {editingDriver ? (
  <>
    <UserRound className="h-4 w-4 text-primary" />
    <h2 className="font-bold">Edit driver</h2>
  </>
) : (
  <>
    <Plus className="h-4 w-4 text-primary" />
    <h2 className="font-bold">Add driver</h2>
  </>
)}

            </div>

            <p className="mt-1 text-xs text-muted-foreground">
  {editingDriver
    ? "Update the driver's contact and licence information."
    : "Create a driver profile with the driver's basic contact and licence information."}
</p>

          </div>

          <form
            className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4"
            onSubmit={editingDriver ? handleUpdateDriver : handleSubmit}
          >
            <label className="kr-label">
              Full name
              <input
                className="kr-input"
                placeholder="e.g. John Mwangi"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label className="kr-label">
              Email
              <input
                className="kr-input"
                type="email"
                placeholder="driver@example.com"
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
              Licence number
              <input
                className="kr-input"
                placeholder="Driver licence number"
                value={licenseNumber}
                onChange={(event) => setLicenseNumber(event.target.value)}
                required
              />
            </label>

            <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-4">
  <button
    className="kr-button-primary"
    disabled={saving}
    type="submit"
  >
    {saving ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : editingDriver ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : (
      <Plus className="h-4 w-4" />
    )}

    {saving
      ? editingDriver
        ? "Saving changes..."
        : "Creating driver..."
      : editingDriver
        ? "Save changes"
        : "Add driver"}
  </button>

  {editingDriver && (
    <button
      type="button"
      onClick={cancelEditing}
      disabled={saving}
      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
    >
      Cancel
    </button>
  )}
</div>

          </form>
        </section>

        <section className="kr-card overflow-hidden">
          <div className="border-b px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold">Drivers</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Manage driver profiles and current availability.
                </p>
              </div>

              <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">
                {filteredDrivers.length} of {drivers.length} driver
                {drivers.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-b bg-slate-50/50 p-5 sm:grid-cols-[1fr_auto_auto]">
            <label className="kr-label">
              Search drivers
              <input
                className="kr-input"
                placeholder="Name, email, phone or licence"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <label className="kr-label">
              Availability
              <select
                className="kr-select"
                value={availabilityFilter}
                onChange={(event) =>
                  setAvailabilityFilter(
                    event.target.value as "ALL" | DriverAvailability,
                  )
                }
              >
                <option value="ALL">All drivers</option>
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
                <option value="ON_TRIP">On trip</option>
                <option value="OFF_DUTY">Off duty</option>
              </select>
            </label>

            <div className="flex items-end">
              {(searchTerm || availabilityFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setAvailabilityFilter("ALL");
                  }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading drivers...
            </div>
          ) : drivers.length === 0 ? (
            <div className="p-10 text-center">
              <UserRound className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 font-semibold">No drivers yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first driver using the form above.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredDrivers.map((driver) => (
                <div
                  key={driver.id}
                  className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{driver.name}</h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${availabilityStyles[driver.availability]}`}
                        >
                          {formatAvailability(driver.availability)}
                        </span>
                      </div>

                      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                        <p>{driver.email}</p>
                        <p>
                          {driver.phone || "No phone"} · Licence:{" "}
                          {driver.licenseNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="kr-select min-w-40"
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

                    {driver.availability === "AVAILABLE" && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        Ready
                      </span>
                    )} 
                    <button
                      type="button"
                      onClick={() => startEditing(driver)}
                      className="rounded-lg border border-slate-200 px-3 py-2"
                    >
                      Edit
                    </button>

                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
