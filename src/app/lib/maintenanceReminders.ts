import type {
  MaintenanceStatus,
  MaintenanceTaskStatus,
} from "./maintenance";

export function getMaintenanceStatusLabel(status: MaintenanceStatus) {
  if (status === "overdue") return "Overdue";
  if (status === "due_soon") return "Due Soon";
  if (status === "never_logged") return "Not Logged";
  return "OK";
}

export function getMaintenanceStatusClass(status: MaintenanceStatus) {
  if (status === "overdue") {
    return "border-red-500/20 bg-red-500/10 text-red-400";
  }

  if (status === "due_soon") {
    return "border-orange-500/20 bg-orange-500/10 text-orange-400";
  }

  if (status === "never_logged") {
    return "border-neutral-700 bg-neutral-900 text-neutral-400";
  }

  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
}

export function getMaintenanceReminderText(task: MaintenanceTaskStatus) {
  if (task.status === "never_logged") {
    return "No service logged yet";
  }

  if (task.remaining === null) {
    return "No usage data available";
  }

  if (task.remaining < 0) {
    return `Overdue by ${Math.abs(task.remaining).toFixed(1)} ${task.unit}`;
  }

  if (task.status === "due_soon") {
    return `Due in ${task.remaining.toFixed(1)} ${task.unit}`;
  }

  return `${task.remaining.toFixed(1)} ${task.unit} remaining`;
}

export function getUrgentMaintenanceStatuses(
  statuses: MaintenanceTaskStatus[]
) {
  return statuses
    .filter(
      (task) =>
        task.status === "overdue" ||
        task.status === "due_soon" ||
        task.status === "never_logged"
    )
    .sort((a, b) => {
      const order = {
        overdue: 0,
        due_soon: 1,
        never_logged: 2,
        ok: 3,
      };

      return order[a.status] - order[b.status];
    });
}

export function getMaintenanceReminderSummary(
  statuses: MaintenanceTaskStatus[]
) {
  const overdueCount = statuses.filter(
    (task) => task.status === "overdue"
  ).length;

  const dueSoonCount = statuses.filter(
    (task) => task.status === "due_soon"
  ).length;

  const neverLoggedCount = statuses.filter(
    (task) => task.status === "never_logged"
  ).length;

  const okCount = statuses.filter((task) => task.status === "ok").length;

  return {
    overdueCount,
    dueSoonCount,
    neverLoggedCount,
    okCount,
    urgentCount: overdueCount + dueSoonCount,
    totalCount: statuses.length,
  };
}