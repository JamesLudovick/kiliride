import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Loader2,
  Plus,
  Search,
  Wrench,
  X,
} from "lucide-react";

import {
  createVehicleMaintenance,
  getVehicles,
  MaintenanceRecord,
  MaintenanceStatus,
  MaintenanceType,
  updateVehicleMaintenanceStatus,
  Vehicle,
} from "../lib/api";
import { getMaintenanceReminders } from "../lib/maintenance";

const maintenanceTypeLabels: Record<
  MaintenanceType,
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

const maintenanceStatusLabels: Record<
  MaintenanceStatus,
  string
> = {
  SCHEDULED: "Scheduled",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const maintenanceStatusStyles: Record<
  MaintenanceStatus,
  string
> = {
  SCHEDULED: "bg-sky-50 text-sky-700",
  IN_PROGRESS: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

type MaintenanceRow = {
  record: MaintenanceRecord;
  vehicle: Vehicle;
};

function formatMoney(value: string | number | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-TZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function localDateTimeValue(date = new Date()) {
  const offset = date.getTimezoneOffset();
  const local = new Date(
    date.getTime() - offset * 60_000,
  );

  return local.toISOString().slice(0, 16);
}

export function MaintenancePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusSavingId, setStatusSavingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [vehicleId, setVehicleId] = useState("");
  const [type, setType] =
    useState<MaintenanceType>("ROUTINE_SERVICE");
  const [initialStatus, setInitialStatus] =
    useState<"SCHEDULED" | "IN_PROGRESS">("SCHEDULED");
  const [serviceDate, setServiceDate] = useState(
    localDateTimeValue(),
  );
  const [mileage, setMileage] = useState("");
  const [cost, setCost] = useState("");
  const [provider, setProvider] = useState("");
  const [description, setDescription] =
    useState("");
  const [nextServiceDate, setNextServiceDate] =
    useState("");
  const [nextServiceMileage, setNextServiceMileage] =
    useState("");
  const [notes, setNotes] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | MaintenanceStatus>("ALL");

  async function loadMaintenance() {
    try {
      setLoading(true);
      setError("");

      const data = await getVehicles();
      setVehicles(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load maintenance records.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMaintenance();
  }, []);

  function resetForm() {
    setVehicleId("");
    setType("ROUTINE_SERVICE");
    setInitialStatus("SCHEDULED");
    setServiceDate(localDateTimeValue());
    setMileage("");
    setCost("");
    setProvider("");
    setDescription("");
    setNextServiceDate("");
    setNextServiceMileage("");
    setNotes("");
    setShowForm(false);
  }

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!vehicleId) {
      setError("Select a vehicle.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createVehicleMaintenance(vehicleId, {
        type,
        status: initialStatus,
        serviceDate: new Date(
          serviceDate,
        ).toISOString(),
        ...(mileage && {
          mileage: Number(mileage),
        }),
        ...(cost && {
          cost: Number(cost),
        }),
        ...(provider.trim() && {
          provider: provider.trim(),
        }),
        ...(description.trim() && {
          description: description.trim(),
        }),
        ...(nextServiceDate && {
          nextServiceDate: new Date(
            nextServiceDate,
          ).toISOString(),
        }),
        ...(nextServiceMileage && {
          nextServiceMileage: Number(
            nextServiceMileage,
          ),
        }),
        ...(notes.trim() && {
          notes: notes.trim(),
        }),
      });

      resetForm();
      await loadMaintenance();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create maintenance record.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    vehicleId: string,
    maintenanceId: string,
    status: MaintenanceStatus,
  ) {
    try {
      setStatusSavingId(maintenanceId);
      setError("");

      await updateVehicleMaintenanceStatus(
        vehicleId,
        maintenanceId,
        status,
      );

      await loadMaintenance();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update maintenance status.",
      );
    } finally {
      setStatusSavingId(null);
    }
  }

  const records = useMemo<MaintenanceRow[]>(() => {
    return vehicles
      .flatMap((vehicle) =>
        (vehicle.maintenanceRecords ?? []).map(
          (record) => ({
            vehicle,
            record,
          }),
        ),
      )
      .sort(
        (a, b) =>
          new Date(b.record.serviceDate).getTime() -
          new Date(a.record.serviceDate).getTime(),
      );
  }, [vehicles]);

  const reminders = useMemo(
    () => getMaintenanceReminders(vehicles),
    [vehicles],
  );

  const stats = useMemo(() => {
    const inService = records.filter(
      ({ record }) =>
        record.status === "IN_PROGRESS",
    ).length;

    const scheduled = records.filter(
      ({ record }) =>
        record.status === "SCHEDULED",
    ).length;

    const overdue = reminders.filter(
      (reminder) => reminder.tone === "danger",
    ).length;

    const completedSpend = records
      .filter(
        ({ record }) =>
          record.status === "COMPLETED",
      )
      .reduce(
        (total, { record }) =>
          total + Number(record.cost ?? 0),
        0,
      );

    return {
      inService,
      scheduled,
      overdue,
      completedSpend,
    };
  }, [records, reminders]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return records.filter(({ record, vehicle }) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        record.status === statusFilter;

      const matchesSearch =
        !query ||
        vehicle.registrationNumber
          .toLowerCase()
          .includes(query) ||
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        maintenanceTypeLabels[record.type]
          .toLowerCase()
          .includes(query) ||
        (record.provider ?? "")
          .toLowerCase()
          .includes(query) ||
        (record.description ?? "")
          .toLowerCase()
          .includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [records, searchTerm, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-700">
              <Wrench size={13} />
              Maintenance workspace
            </span>

            {!loading && (
              <span className="text-xs font-medium text-slate-400">
                {records.length} service record
                {records.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Schedule servicing, track repairs and keep the
            KiliRide fleet road-ready.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm();
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
              Add maintenance
            </>
          )}
        </button>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 shadow-sm">
          <AlertTriangle
            size={18}
            className="mt-0.5 shrink-0"
          />
          {error}
        </div>
      )}

      {/* KPI cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                In service
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {stats.inService}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Currently being worked on
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <Wrench size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-sky-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Scheduled
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {stats.scheduled}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Planned maintenance
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <CalendarClock size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-red-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Overdue
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {stats.overdue}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Service due date has passed
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
              <Clock3 size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Completed spend
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {formatMoney(stats.completedSpend)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Cost of completed work
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <CircleDollarSign size={19} />
            </div>
          </div>
        </article>
      </section>

      {/* Service reminders */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <div className="flex items-center gap-2">
              <BellRing
                size={18}
                className="text-amber-600"
              />

              <h2 className="font-bold text-slate-950">
                Service reminders
              </h2>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Automatic alerts from service dates and
              odometer thresholds.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
            {reminders.length}
          </span>
        </div>

        {reminders.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 size={18} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                No service reminders right now
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                KiliRide will warn you seven days before a
                scheduled service and within 1,000 km of the
                next service mileage.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 p-4 lg:grid-cols-2">
            {reminders.map((reminder) => {
              const toneClass =
                reminder.tone === "danger"
                  ? "border-red-200 bg-red-50/70 text-red-700"
                  : reminder.tone === "warning"
                    ? "border-amber-200 bg-amber-50/70 text-amber-700"
                    : "border-sky-200 bg-sky-50/70 text-sky-700";

              return (
                <article
                  key={reminder.id}
                  className={`rounded-xl border p-3.5 ${toneClass}`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="text-sm font-bold">
                        {reminder.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 opacity-80">
                        {reminder.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* New maintenance form */}
      {showForm && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50/80 to-white px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-sm">
                <Wrench size={18} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Add maintenance record
                </h2>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Schedule future work or begin maintenance
                  immediately.
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleCreate}
            className="grid gap-x-5 gap-y-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <label className="kr-label">
              Vehicle *
              <select
                className="kr-select"
                value={vehicleId}
                onChange={(event) =>
                  setVehicleId(event.target.value)
                }
                required
              >
                <option value="">
                  Select vehicle
                </option>

                {vehicles.map((vehicle) => (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                  >
                    {vehicle.make} {vehicle.model} ·{" "}
                    {vehicle.registrationNumber} ·{" "}
                    {vehicle.status.replace("_", " ")}
                  </option>
                ))}
              </select>

              <span className="kr-help">
                Vehicle receiving the service
              </span>
            </label>

            <label className="kr-label">
              Service type *
              <select
                className="kr-select"
                value={type}
                onChange={(event) =>
                  setType(
                    event.target
                      .value as MaintenanceType,
                  )
                }
              >
                {Object.entries(
                  maintenanceTypeLabels,
                ).map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>

              <span className="kr-help">
                Type of maintenance work
              </span>
            </label>

            <label className="kr-label">
              Initial status *
              <select
                className="kr-select"
                value={initialStatus}
                onChange={(event) =>
                  setInitialStatus(
                    event.target.value as
                      | "SCHEDULED"
                      | "IN_PROGRESS",
                  )
                }
              >
                <option value="SCHEDULED">
                  Scheduled
                </option>
                <option value="IN_PROGRESS">
                  Start immediately
                </option>
              </select>

              <span className="kr-help">
                Starting immediately marks the vehicle as
                maintenance
              </span>
            </label>

            <label className="kr-label">
              Service date *
              <input
                type="datetime-local"
                className="kr-input"
                value={serviceDate}
                onChange={(event) =>
                  setServiceDate(event.target.value)
                }
                required
              />
            </label>

            <label className="kr-label">
              Mileage
              <input
                type="number"
                min="0"
                className="kr-input"
                placeholder="e.g. 84320"
                value={mileage}
                onChange={(event) =>
                  setMileage(event.target.value)
                }
              />

              <span className="kr-help">
                Odometer reading in kilometres
              </span>
            </label>

            <label className="kr-label">
              Cost
              <input
                type="number"
                min="0"
                step="0.01"
                className="kr-input"
                placeholder="e.g. 180000"
                value={cost}
                onChange={(event) =>
                  setCost(event.target.value)
                }
              />

              <span className="kr-help">
                Service cost in TZS
              </span>
            </label>

            <label className="kr-label">
              Workshop / provider
              <input
                className="kr-input"
                placeholder="e.g. Moshi Auto Garage"
                value={provider}
                onChange={(event) =>
                  setProvider(event.target.value)
                }
              />
            </label>

            <label className="kr-label md:col-span-2">
              Description
              <input
                className="kr-input"
                placeholder="e.g. Engine oil and filter replacement"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
              />
            </label>

            <label className="kr-label">
              Next service date
              <input
                type="datetime-local"
                className="kr-input"
                value={nextServiceDate}
                onChange={(event) =>
                  setNextServiceDate(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="kr-label">
              Next service mileage
              <input
                type="number"
                min="0"
                className="kr-input"
                placeholder="e.g. 90000"
                value={nextServiceMileage}
                onChange={(event) =>
                  setNextServiceMileage(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="kr-label md:col-span-2 xl:col-span-3">
              Notes
              <textarea
                rows={3}
                className="kr-input min-h-[90px] resize-y py-3"
                placeholder="Additional maintenance notes..."
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
              />
            </label>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end md:col-span-2 xl:col-span-3">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="kr-button-primary min-w-[170px]"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Add maintenance
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Records */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="font-bold text-slate-950">
                Maintenance history
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredRecords.length} of{" "}
                {records.length} service record
                {records.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative sm:w-[330px]">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  className="kr-input pl-9"
                  placeholder="Search vehicle, provider or service..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />
              </div>

              <select
                className="kr-select sm:w-[180px]"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "ALL"
                      | MaintenanceStatus,
                  )
                }
              >
                <option value="ALL">
                  All statuses
                </option>

                {Object.entries(
                  maintenanceStatusLabels,
                ).map(([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[230px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={25}
                className="mx-auto animate-spin text-primary"
              />
              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading maintenance...
              </p>
            </div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex min-h-[230px] items-center justify-center px-5 py-10">
            <div className="max-w-sm text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                <Wrench size={25} />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                No maintenance records found
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Add a maintenance record to begin
                tracking fleet service history.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/80">
                <tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-5 py-3">
                    Vehicle
                  </th>
                  <th className="px-5 py-3">
                    Service
                  </th>
                  <th className="px-5 py-3">
                    Date / mileage
                  </th>
                  <th className="px-5 py-3">
                    Provider
                  </th>
                  <th className="px-5 py-3">
                    Cost
                  </th>
                  <th className="px-5 py-3">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(
                  ({ record, vehicle }) => {
                    const savingThis =
                      statusSavingId === record.id;

                    return (
                      <tr
                        key={record.id}
                        className="align-top transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {vehicle.make}{" "}
                            {vehicle.model}
                          </p>

                          <p className="mt-1 text-xs font-bold text-primary">
                            {
                              vehicle.registrationNumber
                            }
                          </p>

                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            {vehicle.status.replace(
                              "_",
                              " ",
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {
                              maintenanceTypeLabels[
                                record.type
                              ]
                            }
                          </p>

                          <p className="mt-1 max-w-[240px] text-xs leading-5 text-slate-500">
                            {record.description ||
                              "No description"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="text-sm font-semibold text-slate-700">
                            {formatDate(
                              record.serviceDate,
                            )}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {record.mileage !== null
                              ? `${record.mileage.toLocaleString()} km`
                              : "Mileage not recorded"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[180px] text-sm font-medium text-slate-700">
                            {record.provider ||
                              "Not specified"}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-bold text-slate-800">
                            {formatMoney(record.cost)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold ${
                              maintenanceStatusStyles[
                                record.status
                              ]
                            }`}
                          >
                            {
                              maintenanceStatusLabels[
                                record.status
                              ]
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex min-w-[170px] flex-wrap justify-end gap-1.5">
                            {savingThis && (
                              <Loader2
                                size={17}
                                className="m-2 animate-spin text-primary"
                              />
                            )}

                            {!savingThis &&
                              record.status ===
                                "SCHEDULED" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleStatusChange(
                                        vehicle.id,
                                        record.id,
                                        "IN_PROGRESS",
                                      )
                                    }
                                    className="rounded-lg bg-amber-50 px-2.5 py-2 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100"
                                  >
                                    Start
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleStatusChange(
                                        vehicle.id,
                                        record.id,
                                        "COMPLETED",
                                      )
                                    }
                                    className="rounded-lg bg-emerald-50 px-2.5 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
                                  >
                                    Complete
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleStatusChange(
                                        vehicle.id,
                                        record.id,
                                        "CANCELLED",
                                      )
                                    }
                                    className="rounded-lg px-2.5 py-2 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                            {!savingThis &&
                              record.status ===
                                "IN_PROGRESS" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleStatusChange(
                                        vehicle.id,
                                        record.id,
                                        "COMPLETED",
                                      )
                                    }
                                    className="rounded-lg bg-emerald-50 px-2.5 py-2 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
                                  >
                                    <span className="inline-flex items-center gap-1">
                                      <CheckCircle2
                                        size={13}
                                      />
                                      Complete
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      void handleStatusChange(
                                        vehicle.id,
                                        record.id,
                                        "CANCELLED",
                                      )
                                    }
                                    className="rounded-lg px-2.5 py-2 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}

                            {!savingThis &&
                              (record.status ===
                                "COMPLETED" ||
                                record.status ===
                                  "CANCELLED") && (
                                <span className="px-2 py-2 text-[11px] font-semibold text-slate-400">
                                  No actions
                                </span>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
