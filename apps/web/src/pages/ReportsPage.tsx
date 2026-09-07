import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  CalendarDays,
  Car,
  CircleDollarSign,
  CreditCard,
  Loader2,
  TrendingUp,
  UsersRound,
  Wrench,
} from "lucide-react";

import {
  Booking,
  BookingServiceType,
  Customer,
  getBookings,
  getCustomers,
  getVehicles,
  PaymentMethod,
  Vehicle,
} from "../lib/api";

type ReportPeriod =
  | "ALL"
  | "THIS_MONTH"
  | "LAST_90_DAYS"
  | "THIS_YEAR";

const paymentMethodLabels: Record<
  PaymentMethod,
  string
> = {
  CASH: "Cash",
  MPESA: "M-Pesa",
  AIRTEL_MONEY: "Airtel Money",
  MIXX_BY_YAS: "Mixx by Yas",
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  OTHER: "Other",
};

const serviceTypeLabels: Record<
  BookingServiceType,
  string
> = {
  AIRPORT_TRANSFER: "Airport transfer",
  SELF_DRIVE: "Self drive",
  CHAUFFEUR: "Chauffeur",
  SAFARI: "Safari / Tour",
  CORPORATE: "Corporate",
  WEDDING_EVENT: "Wedding / Event",
  OTHER: "Other",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(value);
}

function periodStart(
  period: ReportPeriod,
  now: Date,
) {
  switch (period) {
    case "THIS_MONTH":
      return new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      );

    case "LAST_90_DAYS": {
      const date = new Date(now);
      date.setDate(date.getDate() - 89);
      date.setHours(0, 0, 0, 0);
      return date;
    }

    case "THIS_YEAR":
      return new Date(
        now.getFullYear(),
        0,
        1,
      );

    default:
      return null;
  }
}

function isInPeriod(
  value: string,
  period: ReportPeriod,
  now: Date,
) {
  const start = periodStart(period, now);

  if (!start) {
    return true;
  }

  const date = new Date(value);

  return (
    date.getTime() >= start.getTime() &&
    date.getTime() <= now.getTime()
  );
}

function paidTotal(booking: Booking) {
  return booking.payments.reduce(
    (total, payment) =>
      total + Number(payment.amount),
    0,
  );
}

function balanceTotal(booking: Booking) {
  return Math.max(
    0,
    Number(booking.fare) -
      paidTotal(booking),
  );
}

function percent(
  value: number,
  total: number,
) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(0, (value / total) * 100),
  );
}

function shortMonth(date: Date) {
  return new Intl.DateTimeFormat("en-TZ", {
    month: "short",
  }).format(date);
}

export function ReportsPage() {
  const [bookings, setBookings] =
    useState<Booking[]>([]);
  const [customers, setCustomers] =
    useState<Customer[]>([]);
  const [vehicles, setVehicles] =
    useState<Vehicle[]>([]);

  const [period, setPeriod] =
    useState<ReportPeriod>("ALL");

  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        setError("");

        const [
          bookingData,
          customerData,
          vehicleData,
        ] = await Promise.all([
          getBookings(),
          getCustomers(),
          getVehicles(),
        ]);

        setBookings(bookingData);
        setCustomers(customerData);
        setVehicles(vehicleData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load report data.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadReports();
  }, []);

  const now = useMemo(() => new Date(), []);

  const filteredBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status !== "CANCELLED" &&
          isInPeriod(
            booking.pickupDate,
            period,
            now,
          ),
      ),
    [bookings, period, now],
  );

  const filteredPayments = useMemo(
    () =>
      bookings.flatMap((booking) =>
        booking.payments
          .filter((payment) =>
            isInPeriod(
              payment.paidAt,
              period,
              now,
            ),
          )
          .map((payment) => ({
            payment,
            booking,
          })),
      ),
    [bookings, period, now],
  );

  const filteredMaintenance =
    useMemo(
      () =>
        vehicles.flatMap((vehicle) =>
          (
            vehicle.maintenanceRecords ??
            []
          )
            .filter(
              (record) =>
                record.status ===
                  "COMPLETED" &&
                isInPeriod(
                  record.serviceDate,
                  period,
                  now,
                ),
            )
            .map((record) => ({
              record,
              vehicle,
            })),
        ),
      [vehicles, period, now],
    );

  const financialStats = useMemo(() => {
    const collected =
      filteredPayments.reduce(
        (total, item) =>
          total +
          Number(item.payment.amount),
        0,
      );

    const outstanding =
      filteredBookings.reduce(
        (total, booking) =>
          total + balanceTotal(booking),
        0,
      );

    const bookingValue =
      filteredBookings.reduce(
        (total, booking) =>
          total + Number(booking.fare),
        0,
      );

    const maintenanceSpend =
      filteredMaintenance.reduce(
        (total, item) =>
          total +
          Number(item.record.cost ?? 0),
        0,
      );

    return {
      collected,
      outstanding,
      bookingValue,
      maintenanceSpend,
    };
  }, [
    filteredBookings,
    filteredMaintenance,
    filteredPayments,
  ]);

  const bookingStats = useMemo(() => {
    const completed =
      filteredBookings.filter(
        (booking) =>
          booking.status === "COMPLETED",
      ).length;

    const active =
      filteredBookings.filter(
        (booking) =>
          booking.status === "ASSIGNED" ||
          booking.status ===
            "IN_PROGRESS",
      ).length;

    const pending =
      filteredBookings.filter(
        (booking) =>
          booking.status === "PENDING" ||
          booking.status ===
            "CONFIRMED",
      ).length;

    const completionRate =
      filteredBookings.length > 0
        ? Math.round(
            (completed /
              filteredBookings.length) *
              100,
          )
        : 0;

    return {
      total: filteredBookings.length,
      completed,
      active,
      pending,
      completionRate,
    };
  }, [filteredBookings]);

  const serviceBreakdown = useMemo(() => {
    const counts =
      Object.keys(
        serviceTypeLabels,
      ).reduce(
        (accumulator, key) => {
          accumulator[
            key as BookingServiceType
          ] = {
            count: 0,
            value: 0,
          };

          return accumulator;
        },
        {} as Record<
          BookingServiceType,
          {
            count: number;
            value: number;
          }
        >,
      );

    for (const booking of filteredBookings) {
      counts[booking.serviceType].count += 1;
      counts[booking.serviceType].value +=
        Number(booking.fare);
    }

    return Object.entries(counts)
      .map(([type, values]) => ({
        type:
          type as BookingServiceType,
        ...values,
      }))
      .filter((item) => item.count > 0)
      .sort(
        (a, b) => b.count - a.count,
      );
  }, [filteredBookings]);

  const paymentBreakdown = useMemo(() => {
    const values =
      Object.keys(
        paymentMethodLabels,
      ).reduce(
        (accumulator, key) => {
          accumulator[
            key as PaymentMethod
          ] = {
            count: 0,
            amount: 0,
          };

          return accumulator;
        },
        {} as Record<
          PaymentMethod,
          {
            count: number;
            amount: number;
          }
        >,
      );

    for (const item of filteredPayments) {
      values[
        item.payment.method
      ].count += 1;

      values[
        item.payment.method
      ].amount += Number(
        item.payment.amount,
      );
    }

    return Object.entries(values)
      .map(([method, values]) => ({
        method: method as PaymentMethod,
        ...values,
      }))
      .filter((item) => item.count > 0)
      .sort(
        (a, b) =>
          b.amount - a.amount,
      );
  }, [filteredPayments]);

  const topCustomers = useMemo(() => {
    const customerMap = new Map<
      string,
      {
        id: string;
        name: string;
        bookings: number;
        value: number;
        paid: number;
      }
    >();

    for (const booking of filteredBookings) {
      const current =
        customerMap.get(
          booking.customerId,
        ) ?? {
          id: booking.customerId,
          name:
            booking.customer?.name ??
            "Unknown customer",
          bookings: 0,
          value: 0,
          paid: 0,
        };

      current.bookings += 1;
      current.value += Number(
        booking.fare,
      );
      current.paid += paidTotal(
        booking,
      );

      customerMap.set(
        booking.customerId,
        current,
      );
    }

    return [...customerMap.values()]
      .sort(
        (a, b) => b.value - a.value,
      )
      .slice(0, 8);
  }, [filteredBookings]);

  const vehicleActivity = useMemo(() => {
    return vehicles
      .map((vehicle) => {
        const vehicleBookings =
          filteredBookings.filter(
            (booking) =>
              booking.vehicleId ===
              vehicle.id,
          );

        const completed =
          vehicleBookings.filter(
            (booking) =>
              booking.status ===
              "COMPLETED",
          ).length;

        const bookingValue =
          vehicleBookings.reduce(
            (total, booking) =>
              total +
              Number(booking.fare),
            0,
          );

        const maintenanceCost =
          filteredMaintenance
            .filter(
              (item) =>
                item.vehicle.id ===
                vehicle.id,
            )
            .reduce(
              (total, item) =>
                total +
                Number(
                  item.record.cost ??
                    0,
                ),
              0,
            );

        return {
          vehicle,
          bookings:
            vehicleBookings.length,
          completed,
          bookingValue,
          maintenanceCost,
        };
      })
      .sort(
        (a, b) =>
          b.bookings - a.bookings,
      );
  }, [
    vehicles,
    filteredBookings,
    filteredMaintenance,
  ]);

  const rollingRevenue = useMemo(() => {
    const months = Array.from(
      {
        length: 6,
      },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() -
            (5 - index),
          1,
        );

        return {
          year: date.getFullYear(),
          month: date.getMonth(),
          label: shortMonth(date),
          amount: 0,
        };
      },
    );

    for (const booking of bookings) {
      for (const payment of booking.payments) {
        const date = new Date(
          payment.paidAt,
        );

        const month = months.find(
          (item) =>
            item.year ===
              date.getFullYear() &&
            item.month ===
              date.getMonth(),
        );

        if (month) {
          month.amount += Number(
            payment.amount,
          );
        }
      }
    }

    return months;
  }, [bookings, now]);

  const maxMonthlyRevenue =
    useMemo(
      () =>
        Math.max(
          1,
          ...rollingRevenue.map(
            (item) => item.amount,
          ),
        ),
      [rollingRevenue],
    );

  const maxServiceCount = useMemo(
    () =>
      Math.max(
        1,
        ...serviceBreakdown.map(
          (item) => item.count,
        ),
      ),
    [serviceBreakdown],
  );

  const maxPaymentAmount = useMemo(
    () =>
      Math.max(
        1,
        ...paymentBreakdown.map(
          (item) => item.amount,
        ),
      ),
    [paymentBreakdown],
  );

  if (loading) {
    return (
      <div className="flex min-h-[480px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={30}
            className="mx-auto animate-spin text-primary"
          />

          <p className="mt-3 text-sm font-semibold text-slate-600">
            Building KiliRide reports...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Analysing bookings, payments,
            customers and fleet activity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">
              <BarChart3 size={13} />
              Reports & analytics
            </span>

            <span className="text-xs font-medium text-slate-400">
              Live operational data
            </span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Track revenue, booking performance,
            customers, fleet activity and
            maintenance costs.
          </p>
        </div>

        <select
          value={period}
          onChange={(event) =>
            setPeriod(
              event.target
                .value as ReportPeriod,
            )
          }
          className="kr-select w-full sm:w-[210px]"
        >
          <option value="ALL">
            All time
          </option>
          <option value="THIS_MONTH">
            This month
          </option>
          <option value="LAST_90_DAYS">
            Last 90 days
          </option>
          <option value="THIS_YEAR">
            This year
          </option>
        </select>
      </section>

      {error && (
        <section className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-bold">
              Unable to load complete reports
            </p>
            <p className="mt-1 text-xs">
              {error}
            </p>
          </div>
        </section>
      )}

      {/* Main KPIs */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Collected"
          value={formatMoney(
            financialStats.collected,
          )}
          description="Recorded payments"
          icon={Banknote}
        />

        <MetricCard
          label="Outstanding"
          value={formatMoney(
            financialStats.outstanding,
          )}
          description="Open customer balances"
          icon={CircleDollarSign}
        />

        <MetricCard
          label="Booking value"
          value={formatMoney(
            financialStats.bookingValue,
          )}
          description={`${bookingStats.total} booking${
            bookingStats.total === 1
              ? ""
              : "s"
          } in period`}
          icon={CalendarDays}
        />

        <MetricCard
          label="Maintenance spend"
          value={formatMoney(
            financialStats.maintenanceSpend,
          )}
          description="Completed service costs"
          icon={Wrench}
        />
      </section>

      {/* Operations stats */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SmallStat
          label="Completed bookings"
          value={bookingStats.completed}
          detail={`${bookingStats.completionRate}% completion rate`}
        />

        <SmallStat
          label="Active trips"
          value={bookingStats.active}
          detail="Assigned / in progress"
        />

        <SmallStat
          label="Pending pipeline"
          value={bookingStats.pending}
          detail="Pending / confirmed"
        />

        <SmallStat
          label="Active customers"
          value={customers.length}
          detail="Non-archived profiles"
        />
      </section>

      {/* Revenue + service mix */}
      <section className="grid gap-4 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            title="Revenue trend"
            description="Recorded collections over the last six months."
            icon={TrendingUp}
          />

          <div className="p-5">
            <div className="grid h-[230px] grid-cols-6 items-end gap-3">
              {rollingRevenue.map(
                (item) => (
                  <div
                    key={`${item.year}-${item.month}`}
                    className="flex h-full min-w-0 flex-col justify-end"
                  >
                    <div className="mb-2 truncate text-center text-[10px] font-bold text-slate-500">
                      {item.amount > 0
                        ? formatCompactMoney(
                            item.amount,
                          )
                        : "—"}
                    </div>

                    <div className="flex h-[160px] items-end rounded-xl bg-slate-50 px-1.5">
                      <div
                        className="w-full rounded-t-lg bg-primary"
                        style={{
                          height: `${Math.max(
                            item.amount > 0
                              ? 8
                              : 0,
                            percent(
                              item.amount,
                              maxMonthlyRevenue,
                            ),
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-center text-[11px] font-bold text-slate-500">
                      {item.label}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            title="Bookings by service"
            description="Demand across KiliRide service categories."
            icon={CalendarDays}
          />

          <div className="space-y-4 p-5">
            {serviceBreakdown.length ===
            0 ? (
              <EmptyLine text="No booking data for this period." />
            ) : (
              serviceBreakdown.map(
                (item) => (
                  <ProgressRow
                    key={item.type}
                    label={
                      serviceTypeLabels[
                        item.type
                      ]
                    }
                    value={`${item.count} booking${
                      item.count === 1
                        ? ""
                        : "s"
                    }`}
                    subvalue={formatMoney(
                      item.value,
                    )}
                    percentage={percent(
                      item.count,
                      maxServiceCount,
                    )}
                  />
                ),
              )
            )}
          </div>
        </article>
      </section>

      {/* Payments + customers */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            title="Payment methods"
            description="Where collected money is coming from."
            icon={CreditCard}
          />

          <div className="space-y-4 p-5">
            {paymentBreakdown.length ===
            0 ? (
              <EmptyLine text="No payments recorded for this period." />
            ) : (
              paymentBreakdown.map(
                (item) => (
                  <ProgressRow
                    key={item.method}
                    label={
                      paymentMethodLabels[
                        item.method
                      ]
                    }
                    value={`${item.count} transaction${
                      item.count === 1
                        ? ""
                        : "s"
                    }`}
                    subvalue={formatMoney(
                      item.amount,
                    )}
                    percentage={percent(
                      item.amount,
                      maxPaymentAmount,
                    )}
                  />
                ),
              )
            )}
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            title="Top customers"
            description="Customers ranked by booking value."
            icon={UsersRound}
          />

          {topCustomers.length === 0 ? (
            <div className="p-5">
              <EmptyLine text="No customer booking activity for this period." />
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
                      Bookings
                    </th>
                    <th className="px-5 py-3">
                      Value
                    </th>
                    <th className="px-5 py-3">
                      Paid
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {topCustomers.map(
                    (customer) => (
                      <tr
                        key={customer.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800">
                            {
                              customer.name
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-slate-600">
                          {
                            customer.bookings
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-800">
                          {formatMoney(
                            customer.value,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-emerald-700">
                          {formatMoney(
                            customer.paid,
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

      {/* Fleet */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <SectionHeading
          title="Fleet activity"
          description="Trips, booking value and maintenance cost by vehicle."
          icon={Car}
        />

        {vehicleActivity.length === 0 ? (
          <div className="p-5">
            <EmptyLine text="No vehicles available." />
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
                    Bookings
                  </th>
                  <th className="px-5 py-3">
                    Completed
                  </th>
                  <th className="px-5 py-3">
                    Booking value
                  </th>
                  <th className="px-5 py-3">
                    Maintenance
                  </th>
                  <th className="px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {vehicleActivity.map(
                  (item) => (
                    <tr
                      key={item.vehicle.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {
                            item.vehicle.make
                          }{" "}
                          {
                            item.vehicle.model
                          }
                        </p>

                        <p className="mt-1 text-xs font-bold text-primary">
                          {
                            item.vehicle
                              .registrationNumber
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {item.bookings}
                      </td>

                      <td className="px-5 py-4 text-sm font-bold text-slate-700">
                        {item.completed}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-800">
                        {formatMoney(
                          item.bookingValue,
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-amber-700">
                        {formatMoney(
                          item.maintenanceCost,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-600">
                          {item.vehicle.status.replace(
                            "_",
                            " ",
                          )}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Banknote;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-primary">
          <Icon size={19} />
        </div>
      </div>
    </article>
  );
}

function SmallStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>

      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold text-slate-950">
          {value}
        </p>

        <p className="pb-1 text-right text-[10px] text-slate-400">
          {detail}
        </p>
      </div>
    </article>
  );
}

function SectionHeading({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: typeof BarChart3;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
      <div>
        <h2 className="font-bold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <Icon
        size={19}
        className="shrink-0 text-slate-300"
      />
    </div>
  );
}

function ProgressRow({
  label,
  value,
  subvalue,
  percentage,
}: {
  label: string;
  value: string;
  subvalue: string;
  percentage: number;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-800">
            {label}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            {value}
          </p>
        </div>

        <p className="text-xs font-bold text-slate-700">
          {subvalue}
        </p>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-primary"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

function EmptyLine({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-slate-500">
        {text}
      </p>
    </div>
  );
}

function formatCompactMoney(value: number) {
  if (value >= 1_000_000_000) {
    return `${(
      value / 1_000_000_000
    ).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `${(
      value / 1_000_000
    ).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(
      value / 1_000
    ).toFixed(0)}K`;
  }

  return String(Math.round(value));
}
