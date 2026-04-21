import type { VehicleType } from "../types/vehicle";

export type MaintenanceTrackingMode = "hours" | "distance";

export interface MaintenanceTaskRule {
  id: string;
  label: string;
  interval: number;
  unit: "hours" | "km";
  category: "service" | "inspection" | "cleaning" | "recovery";
  notes?: string;
}

export interface MaintenanceProfile {
  trackingMode: MaintenanceTrackingMode;
  preRideChecklist: string[];
  postRideChecklist: string[];
  tasks: MaintenanceTaskRule[];
}

const hourBasedProfile: MaintenanceProfile = {
  trackingMode: "hours",
  preRideChecklist: [
    "Check engine oil level",
    "Check coolant level if liquid-cooled",
    "Inspect tire condition and pressure",
    "Check chain tension and lubrication",
    "Make sure throttle snaps back smoothly",
    "Check front and rear brakes",
    "Quick bolt check on critical hardware",
  ],
  postRideChecklist: [
    "Wash off mud and grit carefully",
    "Clean and re-oil air filter after dusty rides",
    "Lubricate chain after washing and drying",
    "Inspect bike for loose or damaged parts",
  ],
  tasks: [
    {
      id: "oil-change",
      label: "Oil Change",
      interval: 10,
      unit: "hours",
      category: "service",
      notes: "General default for off-road bikes and quads. Confirm with owner manual.",
    },
    {
      id: "oil-filter",
      label: "Oil Filter",
      interval: 10,
      unit: "hours",
      category: "service",
    },
    {
      id: "brake-pad-check",
      label: "Brake Pad Inspection",
      interval: 20,
      unit: "hours",
      category: "inspection",
    },
    {
      id: "valve-check",
      label: "Valve Clearance Check",
      interval: 20,
      unit: "hours",
      category: "inspection",
    },
    {
      id: "spark-plug",
      label: "Spark Plug Inspection",
      interval: 50,
      unit: "hours",
      category: "inspection",
    },
    {
      id: "suspension-service",
      label: "Suspension Service",
      interval: 50,
      unit: "hours",
      category: "service",
    },
    {
      id: "coolant-flush",
      label: "Coolant Flush",
      interval: 100,
      unit: "hours",
      category: "service",
    },
  ],
};

const distanceBasedProfile: MaintenanceProfile = {
  trackingMode: "distance",
  preRideChecklist: [
    "Check engine oil level",
    "Inspect tires for wear and correct pressure",
    "Check underbody for leaks or loose parts",
    "Inspect steering and suspension visually",
    "Check recovery gear before leaving",
  ],
  postRideChecklist: [
    "Wash undercarriage and remove trapped mud",
    "Inspect brakes for grit or damage",
    "Check engine air filter after dusty trips",
    "Inspect suspension, bushings, and steering components",
    "Clean and inspect recovery gear",
  ],
  tasks: [
    {
      id: "engine-oil-service",
      label: "Engine Oil Service",
      interval: 5000,
      unit: "km",
      category: "service",
      notes: "Use as a default starting point. Confirm actual interval from owner manual.",
    },
    {
      id: "major-service",
      label: "Major Service",
      interval: 10000,
      unit: "km",
      category: "service",
    },
    {
      id: "transfer-case-service",
      label: "Transfer Case Service",
      interval: 32000,
      unit: "km",
      category: "service",
    },
    {
      id: "diff-oil-service",
      label: "Differential Oil Service",
      interval: 48000,
      unit: "km",
      category: "service",
    },
    {
      id: "driveline-lubrication",
      label: "Driveline Lubrication",
      interval: 10000,
      unit: "km",
      category: "service",
    },
    {
      id: "shock-inspection",
      label: "Shock Inspection",
      interval: 10000,
      unit: "km",
      category: "inspection",
    },
    {
      id: "air-filter-check",
      label: "Air Filter Check",
      interval: 5000,
      unit: "km",
      category: "inspection",
    },
  ],
};

export function getMaintenanceProfile(vehicleType: VehicleType): MaintenanceProfile {
  switch (vehicleType) {
    case "dirt-bike":
    case "adventure-bike":
    case "quad":
    case "sxs":
      return hourBasedProfile;

    case "4x4":
    case "other":
    default:
      return distanceBasedProfile;
  }
}

export function getTrackingModeLabel(vehicleType: VehicleType): string {
  return getMaintenanceProfile(vehicleType).trackingMode === "hours"
    ? "Hours"
    : "Distance";
}

export function getVehicleUsageValue(vehicle: {
  type: VehicleType;
  hours: number;
  mileage: number;
}): number {
  const profile = getMaintenanceProfile(vehicle.type);
  return profile.trackingMode === "hours" ? vehicle.hours : vehicle.mileage;
}

export function getVehicleUsageUnit(vehicleType: VehicleType): "hours" | "km" {
  return getMaintenanceProfile(vehicleType).trackingMode === "hours"
    ? "hours"
    : "km";
}

export type MaintenanceStatus = "ok" | "due_soon" | "overdue" | "never_logged";

export interface VehicleServiceLike {
  id: string;
  title: string;
  hours?: number;
  mileage?: number;
  date: string;
}

export interface MaintenanceTaskStatus {
  taskId: string;
  label: string;
  category: MaintenanceTaskRule["category"];
  interval: number;
  unit: "hours" | "km";
  trackingMode: MaintenanceTrackingMode;
  lastServiceDate: string | null;
  lastDoneAt: number | null;
  nextDueAt: number | null;
  currentUsage: number;
  remaining: number | null;
  status: MaintenanceStatus;
  notes?: string;
}

function normalizeTaskLabel(label: string): string {
  return label.trim().toLowerCase();
}

export function calculateMaintenanceStatuses(
  vehicle: {
    type: VehicleType;
    hours: number;
    mileage: number;
  },
  services: VehicleServiceLike[]
): MaintenanceTaskStatus[] {
  const profile = getMaintenanceProfile(vehicle.type);
  const currentUsage = getVehicleUsageValue(vehicle);

  return profile.tasks.map((task) => {
    const matchingServices = services
    .filter(
        (service) =>
        normalizeTaskLabel(service.title).includes(
            normalizeTaskLabel(task.label)
        )
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const latestService = matchingServices[0];

    if (!latestService) {
      return {
        taskId: task.id,
        label: task.label,
        category: task.category,
        interval: task.interval,
        unit: task.unit,
        trackingMode: profile.trackingMode,
        lastServiceDate: null,
        lastDoneAt: null,
        nextDueAt: null,
        currentUsage,
        remaining: null,
        status: "never_logged",
        notes: task.notes,
      };
    }

    const lastDoneAt =
      profile.trackingMode === "hours"
        ? latestService.hours ?? 0
        : latestService.mileage ?? 0;

    const nextDueAt = lastDoneAt + task.interval;
    const remaining = nextDueAt - currentUsage;

    let status: MaintenanceStatus = "ok";

    if (remaining < 0) {
      status = "overdue";
    } else if (remaining <= task.interval * 0.2) {
      status = "due_soon";
    }

    return {
      taskId: task.id,
      label: task.label,
      category: task.category,
      interval: task.interval,
      unit: task.unit,
      trackingMode: profile.trackingMode,
      lastServiceDate: latestService.date,
      lastDoneAt,
      nextDueAt,
      currentUsage,
      remaining,
      status,
      notes: task.notes,
    };
  });
}