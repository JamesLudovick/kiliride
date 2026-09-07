import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  IdCard,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";

import {
  Customer,
  CreateCustomerInput,
  archiveCustomer,
  createCustomer,
  getCustomers,
  restoreCustomer,
  updateCustomer,
} from "../lib/api";

function customerInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archiveUpdatingId, setArchiveUpdatingId] =
    useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [archiveFilter, setArchiveFilter] =
    useState<"ACTIVE" | "ARCHIVED" | "ALL">("ACTIVE");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomers(true);
      setCustomers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customers.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  function clearForm() {
    setEditingCustomer(null);
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setPassportNumber("");
    setLicenseNumber("");
  }

  function closeForm() {
    clearForm();
    setShowForm(false);
    setError("");
  }

  function openCreateForm() {
    clearForm();
    setShowForm(true);
    setError("");
  }

  function startEditing(customer: Customer) {
    setEditingCustomer(customer);
    setName(customer.name);
    setPhone(customer.phone ?? "");
    setEmail(customer.email ?? "");
    setAddress(customer.address ?? "");
    setPassportNumber(customer.passportNumber ?? "");
    setLicenseNumber(customer.licenseNumber ?? "");
    setShowForm(true);
    setError("");
  }

  async function handleArchive(customer: Customer) {
    const bookingCount = customer._count?.Booking ?? 0;

    const confirmed = window.confirm(
      bookingCount > 0
        ? `Archive ${customer.name}? Their ${bookingCount} booking record${bookingCount === 1 ? "" : "s"} will be preserved.`
        : `Archive ${customer.name}? They will no longer appear when creating new bookings.`,
    );

    if (!confirmed) {
      return;
    }

    setArchiveUpdatingId(customer.id);
    setError("");
    setSuccess("");

    try {
      await archiveCustomer(customer.id);

      if (editingCustomer?.id === customer.id) {
        closeForm();
      }

      setSuccess(
        `${customer.name} was archived. Booking history was preserved.`,
      );

      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to archive customer.",
      );
    } finally {
      setArchiveUpdatingId(null);
    }
  }

  async function handleRestore(customer: Customer) {
    setArchiveUpdatingId(customer.id);
    setError("");
    setSuccess("");

    try {
      await restoreCustomer(customer.id);

      setSuccess(
        `${customer.name} was restored and can be used for new bookings again.`,
      );

      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to restore customer.",
      );
    } finally {
      setArchiveUpdatingId(null);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data: CreateCustomerInput = {
        name: name.trim(),
        ...(phone.trim() && {
          phone: phone.trim(),
        }),
        ...(email.trim() && {
          email: email.trim(),
        }),
        ...(address.trim() && {
          address: address.trim(),
        }),
        ...(passportNumber.trim() && {
          passportNumber: passportNumber.trim(),
        }),
        ...(licenseNumber.trim() && {
          licenseNumber: licenseNumber.trim(),
        }),
      };

      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, data);
      } else {
        await createCustomer(data);
      }

      await loadCustomers();
      closeForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingCustomer
            ? "Unable to update customer."
            : "Unable to create customer.",
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesArchiveFilter =
        archiveFilter === "ALL" ||
        (archiveFilter === "ACTIVE" && !customer.isArchived) ||
        (archiveFilter === "ARCHIVED" && customer.isArchived);

      if (!matchesArchiveFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        customer.name,
        customer.phone,
        customer.email,
        customer.address,
        customer.licenseNumber,
        customer.passportNumber,
      ].some((value) => value?.toLowerCase().includes(query));
    });
  }, [customers, searchTerm, archiveFilter]);

  const customerStats = useMemo(() => {
    return {
      active: customers.filter(
        (customer) => !customer.isArchived,
      ).length,

      archived: customers.filter(
        (customer) => customer.isArchived,
      ).length,

      withBookings: customers.filter(
        (customer) => (customer._count?.Booking ?? 0) > 0,
      ).length,

      onlineAccounts: customers.filter(
        (customer) => Boolean(customer.userId),
      ).length,
    };
  }, [customers]);

  return (
    <div className="space-y-5">
      {/* Workspace actions */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              <UsersRound size={13} />
              Customer workspace
            </span>

            {!loading && (
              <span className="text-xs font-medium text-slate-400">
                {customers.length} customer
                {customers.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Manage KiliRide customers from calls, WhatsApp, walk-ins and
            online accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              closeForm();
            } else {
              openCreateForm();
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
              Add customer
            </>
          )}
        </button>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-medium text-emerald-800 shadow-sm">
          {success}
        </div>
      )}

      {/* Customer statistics */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Active customers
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {customerStats.active}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Available for bookings
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700">
              <UsersRound size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-emerald-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Archived
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {customerStats.archived}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Preserved records
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Archive size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-sky-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                With bookings
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {customerStats.withBookings}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Have booking history
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <CalendarDays size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-violet-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Online accounts
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {customerStats.onlineAccounts}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Linked to login
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <Link2 size={19} />
            </div>
          </div>
        </article>
      </section>

      {/* Add/edit form */}
      {showForm && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-white px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-white">
                {editingCustomer ? (
                  <Pencil size={18} />
                ) : (
                  <Plus size={19} />
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  {editingCustomer
                    ? "Edit customer"
                    : "Add a customer"}
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-500">
                  {editingCustomer
                    ? `Update the customer record for ${editingCustomer.name}.`
                    : "Create a customer without requiring them to register for an online account."}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-x-5 gap-y-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <label className="kr-label">
              Full name *
              <input
                className="kr-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. John Massawe"
                required
              />
            </label>

            <label className="kr-label">
              Phone
              <input
                className="kr-input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="e.g. +255 712 345 678"
              />
            </label>

            <label className="kr-label">
              Email
              <input
                className="kr-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="customer@example.com"
              />
            </label>

            <label className="kr-label">
              Address
              <input
                className="kr-input"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="e.g. Moshi, Kilimanjaro"
              />
            </label>

            <label className="kr-label">
              Passport number
              <input
                className="kr-input"
                value={passportNumber}
                onChange={(event) =>
                  setPassportNumber(event.target.value)
                }
                placeholder="Optional passport number"
              />
            </label>

            <label className="kr-label">
              Driving licence
              <input
                className="kr-input"
                value={licenseNumber}
                onChange={(event) =>
                  setLicenseNumber(event.target.value)
                }
                placeholder="Optional licence number"
              />
            </label>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 md:col-span-2 xl:col-span-3">
              <div className="flex gap-2">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-primary"
                />

                <p className="text-xs leading-5 text-emerald-900/70">
                  A customer created here can immediately be used for
                  bookings. An online login account is not required.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end md:col-span-2 xl:col-span-3">
              <button
                type="button"
                disabled={saving}
                onClick={closeForm}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="kr-button-primary min-w-[160px]"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    {editingCustomer
                      ? "Saving..."
                      : "Creating..."}
                  </>
                ) : editingCustomer ? (
                  <>
                    <CheckCircle2 size={17} />
                    Save changes
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Add customer
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Directory */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-bold text-slate-950">
              Customer directory
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredCustomers.length} of {customers.length} customer
              {customers.length === 1 ? "" : "s"} shown
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <select
              value={archiveFilter}
              onChange={(event) =>
                setArchiveFilter(
                  event.target.value as
                    | "ACTIVE"
                    | "ARCHIVED"
                    | "ALL",
                )
              }
              className="kr-select sm:w-[150px]"
            >
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
              <option value="ALL">All customers</option>
            </select>

            <div className="relative w-full lg:w-[330px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                className="kr-input pl-9"
                placeholder="Search name, phone, email or ID..."
              />
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
                Loading customers...
              </p>
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex min-h-[270px] items-center justify-center px-5 py-10">
            <div className="max-w-md text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-primary">
                <UsersRound size={25} />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                {customers.length === 0
                  ? "No customers yet"
                  : "No matching customers"}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {customers.length === 0
                  ? "Create your first customer. They can then be selected immediately when making a booking."
                  : "Try another name, phone number, email or identification number."}
              </p>

              {customers.length === 0 ? (
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="kr-button-primary mt-5"
                >
                  <Plus size={17} />
                  Add first customer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <article
                key={customer.id}
                className={`overflow-hidden rounded-2xl border transition ${
                  customer.isArchived
                    ? "border-slate-200 bg-slate-50/70"
                    : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5"
                }`}
              >
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8f6f1] text-sm font-black text-primary">
                        {customerInitials(customer.name) || "CU"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-950">
                          {customer.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          KiliRide customer
                        </p>
                      </div>
                    </div>

                    {customer.isArchived ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                        <Archive size={11} />
                        Archived
                      </span>
                    ) : (
                      <span
                        className={
                          customer.userId
                            ? "inline-flex shrink-0 items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-bold text-violet-700"
                            : "inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700"
                        }
                      >
                        {customer.userId ? (
                          <>
                            <Link2 size={11} />
                            Online
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={11} />
                            Office
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 px-5 py-4">
                  <div className="flex items-start gap-3">
                    <Phone
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Phone
                      </p>

                      <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
                        {customer.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

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
                        {customer.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Address
                      </p>

                      <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
                        {customer.address || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {(customer.passportNumber ||
                    customer.licenseNumber) && (
                    <div className="flex items-start gap-3">
                      <IdCard
                        size={15}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />

                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                          Identification
                        </p>

                        <p className="mt-0.5 truncate text-sm font-medium text-slate-700">
                          {customer.passportNumber
                            ? `Passport: ${customer.passportNumber}`
                            : `Licence: ${customer.licenseNumber}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 p-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={14} />
                    <span>
                      {customer._count?.Booking ?? 0} booking
                      {(customer._count?.Booking ?? 0) === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {!customer.isArchived && (
                      <button
                        type="button"
                        disabled={archiveUpdatingId === customer.id}
                        onClick={() => startEditing(customer)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-slate-600 transition hover:bg-emerald-50 hover:text-primary disabled:opacity-40"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    )}

                    {customer.isArchived ? (
                      <button
                        type="button"
                        disabled={archiveUpdatingId === customer.id}
                        onClick={() =>
                          void handleRestore(customer)
                        }
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-primary transition hover:bg-emerald-50 disabled:opacity-40"
                      >
                        {archiveUpdatingId === customer.id ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <RotateCcw size={14} />
                        )}
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={archiveUpdatingId === customer.id}
                        onClick={() =>
                          void handleArchive(customer)
                        }
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-amber-700 transition hover:bg-amber-50 disabled:opacity-40"
                      >
                        {archiveUpdatingId === customer.id ? (
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                        ) : (
                          <Archive size={14} />
                        )}
                        Archive
                      </button>
                    )}
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
