import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Car,
  CheckCircle2,
  CircleDot,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
  updateVehicleStatus,
  Vehicle,
} from "../lib/api";
import { getStoredUser } from "../lib/auth";

const vehicleTypes: Vehicle["type"][] = [
  "SEDAN",
  "SUV",
  "VAN",
  "PICKUP",
];

const vehicleStatuses: Vehicle["status"][] = [
  "AVAILABLE",
  "ON_TRIP",
  "MAINTENANCE",
  "INACTIVE",
];

const statusStyles: Record<Vehicle["status"], string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700",
  ON_TRIP: "bg-blue-50 text-blue-700",
  MAINTENANCE: "bg-amber-50 text-amber-700",
  INACTIVE: "bg-slate-100 text-slate-600",
};

export function VehiclesPage() {
  const user = getStoredUser();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [registrationNumber, setRegistrationNumber] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [type, setType] = useState<Vehicle["type"]>("SUV");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | Vehicle["status"]>("ALL");

  async function loadVehicles() {
    try {
      setError("");
      setLoading(true);

      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load vehicles.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVehicles();
  }, []);

  function startEditing(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setRegistrationNumber(vehicle.registrationNumber);
    setMake(vehicle.make);
    setModel(vehicle.model);
    setYear(String(vehicle.year));
    setColor(vehicle.color ?? "");
    setType(vehicle.type);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await createVehicle({
        registrationNumber,
        make,
        model,
        year: Number(year),
        color,
        type,
      });

      setRegistrationNumber("");
      setMake("");
      setModel("");
      setYear("");
      setColor("");
      setType("SUV");
      setShowForm(false);

      await loadVehicles();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create vehicle.",
      );
    } finally {
      setSaving(false);
    }
  }

  function cancelEditing() {
    setEditingVehicle(null);
    setRegistrationNumber("");
    setMake("");
    setModel("");
    setYear("");
    setColor("");
    setType("SUV");
    setError("");
    setShowForm(false);
  }

  async function handleUpdateVehicle(event: FormEvent) {
    event.preventDefault();

    if (!editingVehicle) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updated = await updateVehicle(editingVehicle.id, {
        registrationNumber,
        make,
        model,
        year: Number(year),
        color: color || undefined,
        type,
      });

      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === updated.id ? updated : vehicle,
        ),
      );

      cancelEditing();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update vehicle.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    id: string,
    status: Vehicle["status"],
  ) {
    try {
      setError("");
      await updateVehicleStatus(id, status);
      await loadVehicles();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update vehicle status.",
      );
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this vehicle?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await deleteVehicle(id);
      await loadVehicles();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove vehicle.",
      );
    }
  }

  const filteredVehicles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !query ||
        vehicle.registrationNumber.toLowerCase().includes(query) ||
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.type.toLowerCase().includes(query) ||
        (vehicle.color ?? "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || vehicle.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vehicles, searchTerm, statusFilter]);

  const fleetStats = useMemo(
    () => ({
      total: vehicles.length,
      available: vehicles.filter((vehicle) => vehicle.status === "AVAILABLE")
        .length,
      onTrip: vehicles.filter((vehicle) => vehicle.status === "ON_TRIP")
        .length,
      maintenance: vehicles.filter(
        (vehicle) => vehicle.status === "MAINTENANCE",
      ).length,
    }),
    [vehicles],
  );

  if (!user || !["ADMIN", "STAFF"].includes(user.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="kr-card w-full max-w-md p-8 text-center">
          <ShieldIcon />
          <h1 className="mt-4 text-xl font-bold">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only administrators and staff can manage vehicles.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="space-y-5">
      {/* Fleet workspace toolbar */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              <Car size={13} />
              Fleet workspace
            </span>

            {!loading && (
              <span className="text-xs font-medium text-slate-400">
                {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Manage your fleet, availability and operational vehicle status.
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
              Add vehicle
            </>
          )}
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Fleet statistics */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                Total fleet
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {fleetStats.total}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Registered vehicles
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <Car size={19} />
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
                {fleetStats.available}
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
                {fleetStats.onTrip}
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
                Maintenance
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {fleetStats.maintenance}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Temporarily unavailable
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Wrench size={19} />
            </div>
          </div>
        </div>
      </section>

      {/* Vehicle form */}
      {showForm && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-white px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-sm">
                {editingVehicle ? <Pencil size={18} /> : <Plus size={19} />}
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {editingVehicle ? "Edit vehicle" : "Add a vehicle"}
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
                  {editingVehicle
                    ? `Update the details for ${editingVehicle.registrationNumber}.`
                    : "Add the vehicle exactly as it appears in the fleet and registration records."}
                </p>
              </div>
            </div>
          </div>

          <form
            className="grid gap-x-5 gap-y-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3"
            onSubmit={editingVehicle ? handleUpdateVehicle : handleSubmit}
          >
            <label className="kr-label">
              Registration number *
              <input
                className="kr-input"
                placeholder="e.g. T 123 ABC"
                value={registrationNumber}
                onChange={(event) =>
                  setRegistrationNumber(event.target.value)
                }
                required
              />
              <span className="kr-help">
                Vehicle plate / registration number
              </span>
            </label>

            <label className="kr-label">
              Make *
              <input
                className="kr-input"
                placeholder="e.g. Toyota"
                value={make}
                onChange={(event) => setMake(event.target.value)}
                required
              />
              <span className="kr-help">Vehicle manufacturer</span>
            </label>

            <label className="kr-label">
              Model *
              <input
                className="kr-input"
                placeholder="e.g. Land Cruiser"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                required
              />
              <span className="kr-help">Vehicle model</span>
            </label>

            <label className="kr-label">
              Year *
              <input
                className="kr-input"
                placeholder="e.g. 2024"
                type="number"
                min="1900"
                max="2100"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                required
              />
              <span className="kr-help">Manufacturing year</span>
            </label>

            <label className="kr-label">
              Color
              <input
                className="kr-input"
                placeholder="e.g. White"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />
              <span className="kr-help">Exterior color</span>
            </label>

            <label className="kr-label">
              Vehicle type *
              <select
                className="kr-select"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as Vehicle["type"])
                }
              >
                {vehicleTypes.map((vehicleType) => (
                  <option key={vehicleType} value={vehicleType}>
                    {vehicleType}
                  </option>
                ))}
              </select>
              <span className="kr-help">
                Select the closest fleet category
              </span>
            </label>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end md:col-span-2 xl:col-span-3">
              <button
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                disabled={saving}
                onClick={cancelEditing}
                type="button"
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
                    {editingVehicle ? "Saving..." : "Adding..."}
                  </>
                ) : editingVehicle ? (
                  <>
                    <CheckCircle2 size={17} />
                    Save changes
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Add vehicle
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Fleet directory */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Fleet directory
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredVehicles.length} of {vehicles.length} vehicle
                {vehicles.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-[330px]">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search plate, make, model or type..."
                  className="kr-input pl-9"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "ALL" | Vehicle["status"],
                  )
                }
                className="kr-select sm:w-[180px]"
              >
                <option value="ALL">All statuses</option>

                {vehicleStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
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
                Loading fleet...
              </p>
            </div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center px-5 py-10">
            <div className="max-w-md text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-primary">
                <Car size={25} />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-900">
                {vehicles.length === 0
                  ? "No vehicles in the fleet"
                  : "No matching vehicles"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {vehicles.length === 0
                  ? "Add the first KiliRide vehicle to begin managing fleet availability and assignments."
                  : "Try changing the fleet search or status filter."}
              </p>

              {vehicles.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="kr-button-primary mt-5"
                >
                  <Plus size={17} />
                  Add first vehicle
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
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
          <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <article
                key={vehicle.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5"
              >
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-primary">
                        <Car size={21} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-950">
                          {vehicle.make} {vehicle.model}
                        </h3>

                        <p className="mt-1 text-sm font-semibold tracking-wide text-slate-500">
                          {vehicle.registrationNumber}
                        </p>
                      </div>
                    </div>

                    <select
                      className={`max-w-[135px] rounded-full border-0 px-2.5 py-1.5 text-[11px] font-bold outline-none ${statusStyles[vehicle.status]}`}
                      value={vehicle.status}
                      onChange={(event) =>
                        void handleStatusChange(
                          vehicle.id,
                          event.target.value as Vehicle["status"],
                        )
                      }
                    >
                      {vehicleStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                  <div className="px-4 py-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Type
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {vehicle.type}
                    </p>
                  </div>

                  <div className="px-4 py-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Year
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {vehicle.year}
                    </p>
                  </div>

                  <div className="px-4 py-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      Color
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                      {vehicle.color || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        vehicle.status === "AVAILABLE"
                          ? "bg-emerald-500"
                          : vehicle.status === "ON_TRIP"
                            ? "bg-sky-500"
                            : vehicle.status === "MAINTENANCE"
                              ? "bg-amber-500"
                              : "bg-slate-400"
                      }`}
                    />
                    {vehicle.status.replace("_", " ")}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-primary"
                      onClick={() => startEditing(vehicle)}
                      type="button"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    <button
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-red-600 transition hover:bg-red-50"
                      onClick={() => void handleDelete(vehicle.id)}
                      type="button"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );

}

function ShieldIcon() {
  return (
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 3l7 4v5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V7l7-4z"
        />
      </svg>
    </div>
  );
}
