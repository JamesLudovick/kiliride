import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Loader2,
  ReceiptText,
  Search,
  WalletCards,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  Booking,
  PaymentMethod,
  PaymentStatus,
  getBookings,
} from "../lib/api";

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Cash",
  MPESA: "M-Pesa",
  AIRTEL_MONEY: "Airtel Money",
  MIXX_BY_YAS: "Mixx by Yas",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  OTHER: "Other",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: "Unpaid",
  PARTIALLY_PAID: "Partially paid",
  PAID: "Paid",
};

function formatMoney(value: string | number) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-TZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function paidTotal(booking: Booking) {
  return booking.payments.reduce(
    (total, payment) => total + Number(payment.amount),
    0,
  );
}

function balanceTotal(booking: Booking) {
  return Math.max(
    0,
    Number(booking.fare) - paidTotal(booking),
  );
}

function derivedPaymentStatus(
  booking: Booking,
): PaymentStatus {
  const paid = paidTotal(booking);
  const fare = Number(booking.fare);

  if (paid <= 0) {
    return "UNPAID";
  }

  if (paid >= fare) {
    return "PAID";
  }

  return "PARTIALLY_PAID";
}

function paymentStatusClass(status: PaymentStatus) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700";
    case "PARTIALLY_PAID":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function paymentMethodIcon(method: PaymentMethod) {
  switch (method) {
    case "CASH":
      return Banknote;
    case "BANK_TRANSFER":
    case "CARD":
      return CreditCard;
    default:
      return WalletCards;
  }
}

export function PaymentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] =
    useState<"ALL" | PaymentMethod>("ALL");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | PaymentStatus>("ALL");

  async function loadPayments() {
    try {
      setLoading(true);
      setError("");

      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payment data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPayments();
  }, []);

  const transactions = useMemo(() => {
    return bookings
      .flatMap((booking) =>
        booking.payments.map((payment) => ({
          payment,
          booking,
          customerName:
            booking.customer?.name ?? "Unknown customer",
        })),
      )
      .sort(
        (a, b) =>
          new Date(b.payment.paidAt).getTime() -
          new Date(a.payment.paidAt).getTime(),
      );
  }, [bookings]);

  const stats = useMemo(() => {
    const totalCollected = transactions.reduce(
      (total, item) =>
        total + Number(item.payment.amount),
      0,
    );

    const outstanding = bookings
      .filter(
        (booking) => booking.status !== "CANCELLED",
      )
      .reduce(
        (total, booking) =>
          total + balanceTotal(booking),
        0,
      );

    const fullyPaid = bookings.filter(
      (booking) =>
        booking.status !== "CANCELLED" &&
        derivedPaymentStatus(booking) === "PAID",
    ).length;

    return {
      totalCollected,
      outstanding,
      transactions: transactions.length,
      fullyPaid,
    };
  }, [bookings, transactions]);

  const filteredTransactions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return transactions.filter((item) => {
      const status =
        derivedPaymentStatus(item.booking);

      const matchesMethod =
        methodFilter === "ALL" ||
        item.payment.method === methodFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        status === statusFilter;

      const matchesSearch =
        !query ||
        item.customerName
          .toLowerCase()
          .includes(query) ||
        item.booking.referenceNumber
          .toLowerCase()
          .includes(query) ||
        item.booking.pickupLocation
          .toLowerCase()
          .includes(query) ||
        item.booking.destination
          .toLowerCase()
          .includes(query) ||
        item.payment.reference
          ?.toLowerCase()
          .includes(query) ||
        paymentMethodLabels[item.payment.method]
          .toLowerCase()
          .includes(query);

      return (
        matchesMethod &&
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    transactions,
    searchTerm,
    methodFilter,
    statusFilter,
  ]);

  const outstandingBookings = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return bookings
      .filter((booking) => {
        if (booking.status === "CANCELLED") {
          return false;
        }

        if (balanceTotal(booking) <= 0) {
          return false;
        }

        const status = derivedPaymentStatus(booking);

        if (
          statusFilter !== "ALL" &&
          status !== statusFilter
        ) {
          return false;
        }

        if (!query) {
          return true;
        }

        const customerName =
          booking.customer?.name ?? "";

        return (
          customerName
            .toLowerCase()
            .includes(query) ||
          booking.referenceNumber
            .toLowerCase()
            .includes(query) ||
          booking.pickupLocation
            .toLowerCase()
            .includes(query) ||
          booking.destination
            .toLowerCase()
            .includes(query)
        );
      })
      .sort(
        (a, b) =>
          balanceTotal(b) - balanceTotal(a),
      );
  }, [bookings, searchTerm, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Workspace header */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              <CircleDollarSign size={13} />
              Payments workspace
            </span>

            {!loading && (
              <span className="text-xs font-medium text-slate-400">
                {transactions.length} transaction
                {transactions.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Track KiliRide collections, balances and
            customer payment history.
          </p>
        </div>

        <NavLink
          to="/dashboard/bookings"
          className="kr-button-primary shrink-0"
        >
          <ReceiptText size={17} />
          Record from bookings
        </NavLink>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 shadow-sm">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />
          {error}
        </div>
      )}

      {/* Financial KPIs */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-emerald-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Total collected
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {formatMoney(stats.totalCollected)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Recorded payment value
              </p>
            </div>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <Banknote size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-amber-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Outstanding
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {formatMoney(stats.outstanding)}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Remaining customer balances
              </p>
            </div>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-700">
              <CircleDollarSign size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-sky-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Transactions
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {stats.transactions}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Payment records
              </p>
            </div>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
              <ReceiptText size={19} />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-violet-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Fully paid
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                {stats.fullyPaid}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Settled bookings
              </p>
            </div>

            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <CheckCircle2 size={19} />
            </div>
          </div>
        </article>
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
          <div className="relative">
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
              placeholder="Search customer, booking or payment reference..."
            />
          </div>

          <select
            value={methodFilter}
            onChange={(event) =>
              setMethodFilter(
                event.target.value as
                  | "ALL"
                  | PaymentMethod,
              )
            }
            className="kr-select"
          >
            <option value="ALL">
              All payment methods
            </option>

            {Object.entries(
              paymentMethodLabels,
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "ALL"
                  | PaymentStatus,
              )
            }
            className="kr-select"
          >
            <option value="ALL">
              All payment statuses
            </option>

            {Object.entries(
              paymentStatusLabels,
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Transactions */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">
                Recent transactions
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredTransactions.length} payment
                {filteredTransactions.length === 1
                  ? ""
                  : "s"}{" "}
                shown
              </p>
            </div>

            <ReceiptText
              size={19}
              className="text-slate-400"
            />
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
                Loading payment data...
              </p>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center px-5 py-10">
            <div className="max-w-sm text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-primary">
                <CircleDollarSign size={25} />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                No payments found
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Record payments from a booking and they
                will appear here automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/80">
                <tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-5 py-3">
                    Customer
                  </th>
                  <th className="px-5 py-3">
                    Booking
                  </th>
                  <th className="px-5 py-3">
                    Method
                  </th>
                  <th className="px-5 py-3">
                    Amount
                  </th>
                  <th className="px-5 py-3">
                    Date
                  </th>
                  <th className="px-5 py-3">
                    Reference
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map(
                  ({ payment, booking, customerName }) => {
                    const MethodIcon =
                      paymentMethodIcon(
                        payment.method,
                      );

                    return (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {customerName}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {booking.pickupLocation} →{" "}
                            {booking.destination}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <NavLink
                            to="/dashboard/bookings"
                            className="text-sm font-bold text-primary hover:underline"
                          >
                            {booking.referenceNumber}
                          </NavLink>

                          <p className="mt-1 text-[10px] text-slate-400">
                            Fare{" "}
                            {formatMoney(
                              booking.fare,
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-700">
                            <MethodIcon size={13} />
                            {
                              paymentMethodLabels[
                                payment.method
                              ]
                            }
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-bold text-slate-900">
                            {formatMoney(
                              payment.amount,
                            )}
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-xs font-medium text-slate-600">
                          {formatDate(
                            payment.paidAt,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <p className="max-w-[180px] truncate text-xs font-medium text-slate-600">
                            {payment.reference ||
                              "No reference"}
                          </p>
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

      {/* Outstanding balances */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-950">
                Outstanding balances
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Active bookings that still have money
                remaining.
              </p>
            </div>

            <CircleDollarSign
              size={19}
              className="text-amber-500"
            />
          </div>
        </div>

        {!loading &&
        outstandingBookings.length === 0 ? (
          <div className="flex min-h-[170px] items-center justify-center px-5 py-8">
            <div className="text-center">
              <CheckCircle2
                size={28}
                className="mx-auto text-emerald-600"
              />

              <p className="mt-3 text-sm font-bold text-slate-800">
                No outstanding balances
              </p>

              <p className="mt-1 text-xs text-slate-400">
                All matching active bookings are settled.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50/80">
                <tr className="border-b border-slate-100 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  <th className="px-5 py-3">
                    Customer / Booking
                  </th>
                  <th className="px-5 py-3">
                    Fare
                  </th>
                  <th className="px-5 py-3">
                    Paid
                  </th>
                  <th className="px-5 py-3">
                    Balance
                  </th>
                  <th className="px-5 py-3">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {outstandingBookings.map(
                  (booking) => {
                    const paid =
                      paidTotal(booking);

                    const balance =
                      balanceTotal(booking);

                    const status =
                      derivedPaymentStatus(
                        booking,
                      );

                    return (
                      <tr
                        key={booking.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {booking.customer?.name ??
                              "Unknown customer"}
                          </p>

                          <p className="mt-1 text-xs font-bold text-primary">
                            {
                              booking.referenceNumber
                            }
                          </p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">
                          {formatMoney(
                            booking.fare,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700">
                          {formatMoney(paid)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="font-bold text-amber-700">
                            {formatMoney(balance)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1.5 text-xs font-bold ${paymentStatusClass(
                              status,
                            )}`}
                          >
                            {
                              paymentStatusLabels[
                                status
                              ]
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <NavLink
                            to="/dashboard/bookings"
                            className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-bold text-primary transition hover:bg-emerald-50"
                          >
                            Record payment
                          </NavLink>
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
