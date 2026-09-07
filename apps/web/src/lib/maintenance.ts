import {
  MaintenanceRecord,
  Vehicle,
} from "./api";

export type MaintenanceReminderTone =
  | "danger"
  | "warning"
  | "info";

export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  title: string;
  description: string;
  tone: MaintenanceReminderTone;
  dueDate?: string;
  remainingKm?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
  );
}

function calendarDaysUntil(
  value: string,
  now: Date,
) {
  const due = startOfDay(new Date(value));
  const today = startOfDay(now);

  return Math.round(
    (due.getTime() - today.getTime()) / DAY_MS,
  );
}

function vehicleLabel(vehicle: Vehicle) {
  return `${vehicle.make} ${vehicle.model} · ${vehicle.registrationNumber}`;
}

function latestCompletedWithNextService(
  records: MaintenanceRecord[],
) {
  return records
    .filter(
      (record) =>
        record.status === "COMPLETED" &&
        (
          record.nextServiceDate !== null ||
          record.nextServiceMileage !== null
        ),
    )
    .sort(
      (a, b) =>
        new Date(b.serviceDate).getTime() -
        new Date(a.serviceDate).getTime(),
    )[0];
}

export function getMaintenanceReminders(
  vehicles: Vehicle[],
  now = new Date(),
): MaintenanceReminder[] {
  const reminders: MaintenanceReminder[] = [];

  for (const vehicle of vehicles) {
    const records = vehicle.maintenanceRecords ?? [];

    const scheduled = records.filter(
      (record) => record.status === "SCHEDULED",
    );

    for (const record of scheduled) {
      const days = calendarDaysUntil(
        record.serviceDate,
        now,
      );

      if (days > 7) {
        continue;
      }

      const service =
        record.description?.trim() ||
        record.type.replace(/_/g, " ").toLowerCase();

      if (days < 0) {
        reminders.push({
          id: `scheduled-${record.id}`,
          vehicleId: vehicle.id,
          title: `${vehicleLabel(vehicle)} service overdue`,
          description: `${service} was scheduled ${Math.abs(
            days,
          )} day${Math.abs(days) === 1 ? "" : "s"} ago.`,
          tone: "danger",
          dueDate: record.serviceDate,
        });

        continue;
      }

      if (days === 0) {
        reminders.push({
          id: `scheduled-${record.id}`,
          vehicleId: vehicle.id,
          title: `${vehicleLabel(vehicle)} service due today`,
          description: `${service} is scheduled for today.`,
          tone: "warning",
          dueDate: record.serviceDate,
        });

        continue;
      }

      reminders.push({
        id: `scheduled-${record.id}`,
        vehicleId: vehicle.id,
        title: `${vehicleLabel(vehicle)} service in ${days} day${
          days === 1 ? "" : "s"
        }`,
        description: `${service} is approaching.`,
        tone: "info",
        dueDate: record.serviceDate,
      });
    }

    const hasOpenMaintenance = records.some(
      (record) =>
        record.status === "SCHEDULED" ||
        record.status === "IN_PROGRESS",
    );

    if (hasOpenMaintenance) {
      continue;
    }

    const latest =
      latestCompletedWithNextService(records);

    if (!latest) {
      continue;
    }

    if (latest.nextServiceDate) {
      const days = calendarDaysUntil(
        latest.nextServiceDate,
        now,
      );

      if (days <= 7) {
        if (days < 0) {
          reminders.push({
            id: `next-date-${latest.id}`,
            vehicleId: vehicle.id,
            title: `${vehicleLabel(vehicle)} next service overdue`,
            description: `Next service date passed ${Math.abs(
              days,
            )} day${Math.abs(days) === 1 ? "" : "s"} ago.`,
            tone: "danger",
            dueDate: latest.nextServiceDate,
          });
        } else if (days === 0) {
          reminders.push({
            id: `next-date-${latest.id}`,
            vehicleId: vehicle.id,
            title: `${vehicleLabel(vehicle)} next service due today`,
            description:
              "The recorded next-service date is today.",
            tone: "warning",
            dueDate: latest.nextServiceDate,
          });
        } else {
          reminders.push({
            id: `next-date-${latest.id}`,
            vehicleId: vehicle.id,
            title: `${vehicleLabel(vehicle)} next service in ${days} day${
              days === 1 ? "" : "s"
            }`,
            description:
              "Prepare or schedule the vehicle's next service.",
            tone: "info",
            dueDate: latest.nextServiceDate,
          });
        }
      }
    }

    if (
      latest.nextServiceMileage !== null &&
      vehicle.currentMileage !== null
    ) {
      const remaining =
        latest.nextServiceMileage -
        vehicle.currentMileage;

      if (remaining <= 1000) {
        if (remaining <= 0) {
          reminders.push({
            id: `next-mileage-${latest.id}`,
            vehicleId: vehicle.id,
            title: `${vehicleLabel(vehicle)} service mileage exceeded`,
            description: `Service threshold exceeded by ${Math.abs(
              remaining,
            ).toLocaleString()} km.`,
            tone: "danger",
            remainingKm: remaining,
          });
        } else {
          reminders.push({
            id: `next-mileage-${latest.id}`,
            vehicleId: vehicle.id,
            title: `${vehicleLabel(vehicle)} approaching service mileage`,
            description: `${remaining.toLocaleString()} km remaining until ${latest.nextServiceMileage.toLocaleString()} km service.`,
            tone: "warning",
            remainingKm: remaining,
          });
        }
      }
    }
  }

  const priority = {
    danger: 0,
    warning: 1,
    info: 2,
  };

  return reminders.sort(
    (a, b) =>
      priority[a.tone] - priority[b.tone],
  );
}
