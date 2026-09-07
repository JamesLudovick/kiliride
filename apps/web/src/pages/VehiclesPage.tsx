import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Truck,
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
                <Car className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  KiliRide Operations
                </p>
                <h1 className="text-xl font-bold tracking-tight">
                  Vehicle Management
                </h1>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Fleet system online
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
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-2">
                  {editingVehicle ? (
                    <Car className="h-4 w-4 text-primary" />
                  ) : (
                    <Plus className="h-4 w-4 text-primary" />
                  )}

                  <h2 className="font-bold">
                    {editingVehicle ? "Edit vehicle" : "Add vehicle"}
                  </h2>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {editingVehicle
                    ? "Update the vehicle details and save your changes."
                    : "Add the basic details exactly as they appear on the vehicle documents."}
                </p>
              </div>

              <div className="hidden rounded-lg border bg-card px-3 py-2 text-[11px] text-muted-foreground md:block">
                {editingVehicle ? (
                  <>
                    Editing: <strong>{editingVehicle.registrationNumber}</strong>
                  </>
                ) : (
                  <>
                    Example: <strong>T 123 ABC</strong> · Toyota · Land Cruiser
                  </>
                )}
              </div>
            </div>
          </div>

          <form
            className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={editingVehicle ? handleUpdateVehicle : handleSubmit}
          >
            <label className="kr-label">
              Registration number
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
              Make
              <input
                className="kr-input"
                placeholder="e.g. Toyota"
                value={make}
                onChange={(event) => setMake(event.target.value)}
                required
              />
              <span className="kr-help">Manufacturer</span>
            </label>

            <label className="kr-label">
              Model
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
              Year
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
              <span className="kr-help">Optional exterior color</span>
            </label>

            <label className="kr-label">
              Vehicle type
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
              <span className="kr-help">Choose the closest category</span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end lg:col-span-3 lg:justify-end">
              {editingVehicle && (
                <button
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 sm:w-auto"
                  disabled={saving}
                  onClick={cancelEditing}
                  type="button"
                >
                  Cancel edit
                </button>
              )}

              <button
                className="kr-button-primary w-full sm:w-auto"
                disabled={saving}
                type="submit"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingVehicle ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}

                {saving
                  ? editingVehicle
                    ? "Saving changes..."
                    : "Adding vehicle..."
                  : editingVehicle
                    ? "Save changes"
                    : "Add vehicle"}
              </button>
            </div>
          </form>
        </section>

        <section className="kr-card overflow-hidden">
          <div className="flex flex-col justify-between gap-3 border-b px-5 py-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <h2 className="font-bold">Fleet vehicles</h2>
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                Manage availability and operational status.
              </p>
            </div>

            <div className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading fleet...
            </div>
          ) : vehicles.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Car className="h-5 w-5 text-muted-foreground" />
              </div>

              <h3 className="mt-4 text-sm font-semibold">
                No vehicles yet
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
                Add your first fleet vehicle using the form above.
                For example: T 123 ABC, Toyota Land Cruiser, 2024.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Vehicle</th>
                    <th className="px-5 py-3 font-semibold">Year</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr
                      className="border-b last:border-0 hover:bg-muted/20"
                      key={vehicle.id}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Car className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="font-semibold">
                              {vehicle.make} {vehicle.model}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {vehicle.registrationNumber}
                              {vehicle.color
                                ? ` · ${vehicle.color}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-muted-foreground">
                        {vehicle.year}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {vehicle.type}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none ${statusStyles[vehicle.status]}`}
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

                          {vehicle.status === "AVAILABLE" && (
                            <CheckCircle2 className="hidden h-4 w-4 text-emerald-500 sm:block" />
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-2.5 text-xs font-medium transition hover:bg-muted"
                            onClick={() => startEditing(vehicle)}
                            type="button"
                          >
                            Edit
                          </button>

                          <button
                            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            onClick={() => void handleDelete(vehicle.id)}
                            type="button"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
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