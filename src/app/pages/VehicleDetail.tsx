import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Crown,
  Flame,
  Gauge,
  Lock,
  Medal,
  Mountain,
  Pencil,
  Repeat2,
  Route,
  Sparkles,
  Star,
  Target,
  Timer,
  Trophy,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { VehicleSetupProfile, VehicleType } from "../types/vehicle";
import { getVehicleSetupConfig } from "../utils/vehicleSetupConfig";
import { useVehicles } from "../context/VehicleContext";
import { useServices } from "../context/ServiceContext";
import { mockTrails } from "../data/mockData";
import type { SavedRide } from "../utils/rideStats";
import {
  calculateMaintenanceStatuses,
  type MaintenanceTaskStatus,
} from "../lib/maintenance";

const maintenanceStatusOrder = {
  overdue: 0,
  due_soon: 1,
  never_logged: 2,
  ok: 3,
} as const;

function formatDate(date: string | null) {
  if (!date) return "Not logged yet";
  return new Date(date).toLocaleDateString();
}

function formatVehicleType(type: string) {
  return type.replace(/-/g, " ");
}

function getMaintenanceDueText(task: MaintenanceTaskStatus) {
  if (task.status === "never_logged") {
    return "Not logged yet";
  }

  if (task.remaining === null) {
    return "No usage record";
  }

  if (task.remaining < 0) {
    return `${Math.abs(task.remaining).toFixed(1)} ${task.unit} overdue`;
  }

  return `${task.remaining.toFixed(1)} ${task.unit} remaining`;
}

function getMaintenanceProgressPercent(task: MaintenanceTaskStatus) {
  if (task.status === "never_logged" || task.lastDoneAt === null) {
    return 0;
  }

  if (task.remaining !== null && task.remaining < 0) {
    return 100;
  }

  const usedSinceLastService = Math.max(task.currentUsage - task.lastDoneAt, 0);
  return Math.min((usedSinceLastService / task.interval) * 100, 100);
}

function getProgressPercent(current: number, target: number) {
  if (target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}

type AchievementCategory = "Vehicle" | "Profile" | "Comparison" | "Rare";
type AchievementTier = "bronze" | "silver" | "gold" | "legendary";
type AchievementFilter = "all" | "unlocked" | "locked";

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  progressLabel: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: LucideIcon;
};

type VehicleStatSummary = {
  vehicleId: string;
  rides: number;
  distance: number;
  hours: number;
  trails: number;
};

function getVehicleRank(
  vehicleStats: VehicleStatSummary[],
  currentVehicleId: string | undefined,
  metric: keyof Omit<VehicleStatSummary, "vehicleId">
) {
  if (!currentVehicleId) return null;

  const currentVehicle = vehicleStats.find(
    (item) => item.vehicleId === currentVehicleId
  );

  if (!currentVehicle || currentVehicle[metric] <= 0) {
    return null;
  }

  const sorted = [...vehicleStats].sort((a, b) => b[metric] - a[metric]);
  return sorted.findIndex((item) => item.vehicleId === currentVehicleId) + 1;
}

function isHardTrail(trail: unknown) {
  const trailData = trail as Record<string, unknown> | null;

  const difficultyText = String(
    trailData?.difficulty ??
      trailData?.difficultyLabel ??
      trailData?.difficultyLevel ??
      trailData?.level ??
      ""
  ).toLowerCase();

  const difficultyNumber = Number(
    trailData?.difficultyRating ?? trailData?.rating ?? 0
  );

  return (
    difficultyText.includes("hard") ||
    difficultyText.includes("expert") ||
    difficultyText.includes("extreme") ||
    difficultyNumber >= 4
  );
}

function getAchievementCardClass(tier: AchievementTier, unlocked: boolean) {
  if (!unlocked) {
    return "border-neutral-800 bg-neutral-950";
  }

  if (tier === "legendary") {
    return "border-yellow-500/30 bg-yellow-500/10";
  }

  if (tier === "gold") {
    return "border-orange-500/30 bg-orange-500/10";
  }

  if (tier === "silver") {
    return "border-cyan-500/25 bg-cyan-500/10";
  }

  return "border-emerald-500/25 bg-emerald-500/10";
}

function getAchievementIconClass(tier: AchievementTier, unlocked: boolean) {
  if (!unlocked) {
    return "bg-neutral-800 text-neutral-500";
  }

  if (tier === "legendary") {
    return "bg-yellow-500 text-black";
  }

  if (tier === "gold") {
    return "bg-orange-500 text-black";
  }

  if (tier === "silver") {
    return "bg-cyan-500 text-black";
  }

  return "bg-emerald-500 text-black";
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const Icon = achievement.icon;
  const progressPercent = getProgressPercent(
    achievement.progress,
    achievement.target
  );

  return (
    <div
      className={`rounded-2xl border px-4 py-4 ${getAchievementCardClass(
        achievement.tier,
        achievement.unlocked
      )}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${getAchievementIconClass(
                achievement.tier,
                achievement.unlocked
              )}`}
            >
              {achievement.unlocked ? (
                <Icon className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {achievement.title}
              </p>

              <p className="mt-1 text-xs text-neutral-500">
                {achievement.category} • {achievement.tier}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-5 text-neutral-400">
            {achievement.description}
          </p>
        </div>

        {achievement.unlocked && (
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium text-neutral-400">
            {achievement.progressLabel}
          </p>

          <p className="text-xs text-neutral-500">
            {Math.round(progressPercent)}%
          </p>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
          <div
            className={`h-full rounded-full ${
              achievement.unlocked ? "bg-orange-500" : "bg-neutral-600"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function hasSetupValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim().length > 0;
}

function SetupDetail({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (!hasSetupValue(value)) return null;

  return (
    <div className="rounded-xl bg-neutral-950 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function SetupTagList({
  label,
  values,
}: {
  label: string;
  values?: string[];
}) {
  if (!values || values.length === 0) return null;

  return (
    <div className="rounded-xl bg-neutral-950 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {label}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function CollapsibleSetupSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <h3 className="text-sm font-semibold text-orange-400">{title}</h3>

        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-neutral-500" />
        )}
      </button>

      {isOpen && <div className="border-t border-neutral-800 px-4 pb-4 pt-3">{children}</div>}
    </div>
  );
}

const tubeMousseTublissOptions = [
  "Tube",
  "Mousse",
  "Tubliss",
  "Tubeless",
  "Custom",
];

const emptySetupProfile: VehicleSetupProfile = {
  primaryUse: "",
  terrainFocus: "",
  ridingSetup: "",
  ridingSetupNotes: "",
  setupNotes: "",

  frontTyreType: "",
  frontTyreName: "",
  rearTyreType: "",
  rearTyreName: "",
  tyreSize: "",
  wheelSetup: "",
  tyrePressure: "",
  tubeMousseTubliss: "",

  suspensionSetup: "",
  suspensionNotes: "",
  riderWeightKg: undefined,

  fuelSetup: "",
  fuelRangeKm: undefined,
  fuelTankSizeLitres: undefined,
  fuelNotes: "",

  protectionParts: [],
  protectionNotes: "",

  frontSprocket: undefined,
  rearSprocket: undefined,
  gearingNotes: "",

  luggageSetup: "",
  navigationSetup: "",
  windProtection: "",

  winch: "",
  recoveryGear: "",
  lightingSetup: "",
  lightingNotes: "",
  roofDoorsSetup: "",
  cargoSetup: "",
  drivetrainSetup: "",
  lockers: "",
  liftKit: "",
  snorkel: "",
  campingSetup: "",

  commsSetup: "",
  electronicsNotes: "",

  toolsAndSpares: [],
  toolsAndSparesNotes: "",

  customSetup: "",
};

export function VehicleDetail() {
  const { vehicleId } = useParams();
  const { vehicles, activeVehicleId, updateVehicle } = useVehicles();
  const { getServicesForVehicle } = useServices();
  const [savedRides, setSavedRides] = useState<SavedRide[]>([]);
  const [recentAchievement, setRecentAchievement] =
  useState<Achievement | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [achievementFilter, setAchievementFilter] =
    useState<AchievementFilter>("all");

  const [openAchievementCategories, setOpenAchievementCategories] = useState<
    Record<AchievementCategory, boolean>
  >({
    Vehicle: true,
    Comparison: false,
    Profile: false,
    Rare: false,
  });

  const toggleAchievementCategory = (category: AchievementCategory) => {
    setOpenAchievementCategories((prev) => ({
      ...prev,
      [category]: !(prev[category] ?? false),
    }));
  };

  const [openSetupSections, setOpenSetupSections] = useState<
    Record<string, boolean>
  >({
    general: true,
  });

  const toggleSetupSection = (sectionId: string) => {
    setOpenSetupSections((prev) => ({
      ...prev,
      [sectionId]: !(prev[sectionId] ?? false),
    }));
  };

  const [editVehicle, setEditVehicle] = useState({
    name: "",
    type: "" as "" | VehicleType,
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    hoursAtPurchase: 0,
    manualAddedHours: 0,
    mileage: 0,
    notes: "",
    image: "",
    bannerImage: "",
    setupProfile: emptySetupProfile,
  });

  const setupConfig = getVehicleSetupConfig(editVehicle.type);

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const isActiveVehicle = vehicle?.id === activeVehicleId;
  const handleOpenEditVehicle = () => {
    if (!vehicle) return;

    setEditVehicle({
      name: vehicle.name,
      type: vehicle.type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      hoursAtPurchase: vehicle.hoursAtPurchase ?? vehicle.hours ?? 0,
      manualAddedHours: vehicle.manualAddedHours ?? 0,
      mileage: vehicle.mileage ?? 0,
      notes: vehicle.notes ?? "",
      image: vehicle.image ?? "",
      bannerImage: vehicle.bannerImage ?? "",
      setupProfile: {
        ...emptySetupProfile,
        ...(vehicle.setupProfile ?? {}),
      },
    });

    setIsEditModalOpen(true);
  };

  const handleEditVehicleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "image" | "bannerImage"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setEditVehicle((prev) => ({
          ...prev,
          [field]: reader.result as string,
        }));
      }
    };

    reader.readAsDataURL(file);
  };

  const updateSetupProfileField = <Key extends keyof VehicleSetupProfile>(
    field: Key,
    value: VehicleSetupProfile[Key]
  ) => {
    setEditVehicle((prev) => ({
      ...prev,
      setupProfile: {
        ...prev.setupProfile,
        [field]: value,
      },
    }));
  };

  const handleSaveVehicleEdits = () => {
    if (!vehicle || !editVehicle.type) return;

    updateVehicle(vehicle.id, {
      name: editVehicle.name.trim(),
      type: editVehicle.type as VehicleType,
      brand: editVehicle.brand.trim(),
      model: editVehicle.model.trim(),
      year: Number(editVehicle.year),
      hours: Number(editVehicle.hoursAtPurchase),
      hoursAtPurchase: Number(editVehicle.hoursAtPurchase),
      manualAddedHours: Number(editVehicle.manualAddedHours),
      mileage: Number(editVehicle.mileage),
      notes: editVehicle.notes.trim(),
      image: editVehicle.image,
      bannerImage: editVehicle.bannerImage,
      setupProfile: editVehicle.setupProfile,
    });

    setIsEditModalOpen(false);
  };

  useEffect(() => {
    const storedSavedRides = localStorage.getItem("xtrail-saved-rides");

    if (!storedSavedRides) {
      setSavedRides([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedSavedRides) as SavedRide[];
      setSavedRides(parsed);
    } catch (error) {
      console.error("Failed to load saved rides:", error);
      setSavedRides([]);
    }
  }, []);

  const vehicleRides = useMemo(() => {
    return savedRides
      .filter((ride) => ride.vehicleId === vehicleId)
      .sort(
        (a, b) =>
          new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
      );
  }, [savedRides, vehicleId]);

  const totalRideDistance = useMemo(() => {
    return vehicleRides.reduce((sum, ride) => sum + ride.distanceKm, 0);
  }, [vehicleRides]);

  const totalRideDurationSeconds = useMemo(() => {
    return vehicleRides.reduce((sum, ride) => sum + ride.durationSeconds, 0);
  }, [vehicleRides]);

  const totalRideHours = totalRideDurationSeconds / 3600;

  const hoursAtPurchase = vehicle?.hoursAtPurchase ?? vehicle?.hours ?? 0;
  const manualAddedHours = vehicle?.manualAddedHours ?? 0;
  const currentEngineHours = hoursAtPurchase + totalRideHours + manualAddedHours;

  const vehicleServices = vehicle ? getServicesForVehicle(vehicle.id) : [];

  const vehicleWithCurrentEngineHours = vehicle
    ? {
        ...vehicle,
        hours: currentEngineHours,
        hoursAtPurchase,
        manualAddedHours,
      }
    : null;

  const maintenanceTasks = vehicleWithCurrentEngineHours
    ? calculateMaintenanceStatuses(vehicleWithCurrentEngineHours, vehicleServices)
    : [];

  const sortedMaintenanceTasks = [...maintenanceTasks].sort((a, b) => {
    const statusDifference =
      maintenanceStatusOrder[a.status] - maintenanceStatusOrder[b.status];

    if (statusDifference !== 0) return statusDifference;

    if (a.remaining === null && b.remaining === null) return 0;
    if (a.remaining === null) return 1;
    if (b.remaining === null) return -1;

    return a.remaining - b.remaining;
  });

  const nextMaintenanceTask = sortedMaintenanceTasks[0] ?? null;

  const urgentMaintenanceTasks = sortedMaintenanceTasks
    .filter((task) => task.status !== "ok")
    .slice(0, 2);

  const overallMaintenanceStatus = maintenanceTasks.some(
    (task) => task.status === "overdue"
  )
    ? "overdue"
    : maintenanceTasks.some(
        (task) => task.status === "due_soon" || task.status === "never_logged"
      )
    ? "due_soon"
    : "ok";

  const maintenanceStatusLabel =
    overallMaintenanceStatus === "ok"
      ? "Good"
      : overallMaintenanceStatus === "due_soon"
      ? "Due Soon"
      : "Overdue";

  const maintenanceStatusMessage =
    overallMaintenanceStatus === "ok"
      ? "All maintenance tasks are within safe limits."
      : overallMaintenanceStatus === "due_soon"
      ? "Some maintenance tasks are coming up soon or have not been logged yet."
      : "One or more maintenance tasks are overdue. Service is recommended.";

  const latestService = vehicleServices[0] ?? null;

  const overdueTaskCount = maintenanceTasks.filter(
    (task) => task.status === "overdue"
  ).length;

  const dueSoonTaskCount = maintenanceTasks.filter(
    (task) => task.status === "due_soon" || task.status === "never_logged"
  ).length;

  const ridesWithTrails = useMemo(() => {
    return vehicleRides.filter((ride) => Boolean(ride.trailId));
  }, [vehicleRides]);

  const completedTrailIdsForVehicle = useMemo(() => {
    return new Set(ridesWithTrails.map((ride) => ride.trailId as string));
  }, [ridesWithTrails]);

  const completedTrailsCount = completedTrailIdsForVehicle.size;

  const repeatedCompletionCount = Math.max(
    ridesWithTrails.length - completedTrailsCount,
    0
  );

  const completedTrailSummaries = useMemo(() => {
    const groupedMap = new Map<
      string,
      {
        trailId: string;
        trailName: string;
        completionCount: number;
        latestCompletedAt: string;
        trail: (typeof mockTrails)[number] | null;
      }
    >();

    for (const ride of ridesWithTrails) {
      if (!ride.trailId) continue;

      const existing = groupedMap.get(ride.trailId);
      const matchedTrail =
        mockTrails.find((trail) => trail.id === ride.trailId) ?? null;

      if (!existing) {
        groupedMap.set(ride.trailId, {
          trailId: ride.trailId,
          trailName: ride.trailName,
          completionCount: 1,
          latestCompletedAt: ride.finishedAt,
          trail: matchedTrail,
        });
        continue;
      }

      groupedMap.set(ride.trailId, {
        ...existing,
        completionCount: existing.completionCount + 1,
        latestCompletedAt:
          new Date(ride.finishedAt).getTime() >
          new Date(existing.latestCompletedAt).getTime()
            ? ride.finishedAt
            : existing.latestCompletedAt,
      });
    }

    return Array.from(groupedMap.values());
  }, [ridesWithTrails]);

  const recentCompletedTrails = [...completedTrailSummaries]
    .sort(
      (a, b) =>
        new Date(b.latestCompletedAt).getTime() -
        new Date(a.latestCompletedAt).getTime()
    )
    .slice(0, 3);

  const mostRiddenTrail = [...completedTrailSummaries].sort((a, b) => {
    if (b.completionCount !== a.completionCount) {
      return b.completionCount - a.completionCount;
    }

    return (
      new Date(b.latestCompletedAt).getTime() -
      new Date(a.latestCompletedAt).getTime()
    );
  })[0];

  const favoriteTerrain = useMemo(() => {
    const terrainCounts = new Map<string, number>();

    for (const ride of ridesWithTrails) {
      const trail = mockTrails.find((item) => item.id === ride.trailId);
      if (!trail?.trailType) continue;

      terrainCounts.set(
        trail.trailType,
        (terrainCounts.get(trail.trailType) ?? 0) + 1
      );
    }

    return Array.from(terrainCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  }, [ridesWithTrails]);

  const setupProfile = vehicle?.setupProfile ?? {};
  const displaySetupConfig = getVehicleSetupConfig(vehicle?.type);

  const hasAnySetupProfile = Object.values(setupProfile).some(hasSetupValue);

  const gearingSummary =
    setupProfile.frontSprocket || setupProfile.rearSprocket
      ? `${setupProfile.frontSprocket ?? "-"} / ${
          setupProfile.rearSprocket ?? "-"
        }`
      : "";

  const fuelTankSummary = setupProfile.fuelTankSizeLitres
    ? `${setupProfile.fuelTankSizeLitres} L`
    : "";

  const fuelRangeSummary = setupProfile.fuelRangeKm
    ? `${setupProfile.fuelRangeKm} km`
    : "";

  const riderWeightSummary = setupProfile.riderWeightKg
    ? `${setupProfile.riderWeightKg} kg`
    : "";
  
  const hasGeneralSetup =
    hasSetupValue(setupProfile.primaryUse) ||
    hasSetupValue(setupProfile.terrainFocus) ||
    hasSetupValue(setupProfile.ridingSetup) ||
    hasSetupValue(setupProfile.ridingSetupNotes) ||
    hasSetupValue(setupProfile.setupNotes);

  const hasTyresSetup =
    hasSetupValue(setupProfile.frontTyreType) ||
    hasSetupValue(setupProfile.rearTyreType) ||
    hasSetupValue(setupProfile.frontTyreName) ||
    hasSetupValue(setupProfile.rearTyreName) ||
    hasSetupValue(setupProfile.tyreSize) ||
    hasSetupValue(setupProfile.wheelSetup) ||
    hasSetupValue(setupProfile.tyrePressure) ||
    hasSetupValue(setupProfile.tubeMousseTubliss);

  const hasSuspensionSetup =
    hasSetupValue(setupProfile.suspensionSetup) ||
    hasSetupValue(riderWeightSummary) ||
    hasSetupValue(setupProfile.suspensionNotes);

  const hasGearingOrDrivetrainSetup =
    hasSetupValue(gearingSummary) ||
    hasSetupValue(setupProfile.drivetrainSetup) ||
    hasSetupValue(setupProfile.lockers) ||
    hasSetupValue(setupProfile.gearingNotes);

  const hasProtectionSetup =
    hasSetupValue(setupProfile.protectionParts) ||
    hasSetupValue(setupProfile.protectionNotes);

  const hasFuelSetup =
    hasSetupValue(setupProfile.fuelSetup) ||
    hasSetupValue(fuelTankSummary) ||
    hasSetupValue(fuelRangeSummary) ||
    hasSetupValue(setupProfile.fuelNotes);

  const hasNavigationSetup =
    hasSetupValue(setupProfile.navigationSetup) ||
    hasSetupValue(setupProfile.electronicsNotes);

  const hasLightingSetup =
    hasSetupValue(setupProfile.lightingSetup) ||
    hasSetupValue(setupProfile.lightingNotes);

  const hasToolsSetup =
    hasSetupValue(setupProfile.toolsAndSpares) ||
    hasSetupValue(setupProfile.toolsAndSparesNotes);

  const configuredSetupSectionCount = [
    hasGeneralSetup,
    hasTyresSetup,
    hasSuspensionSetup,
    hasGearingOrDrivetrainSetup,
    hasProtectionSetup,
    hasFuelSetup,
    hasNavigationSetup,
    hasLightingSetup,
    hasToolsSetup,
    hasSetupValue(setupProfile.customSetup),
  ].filter(Boolean).length;

  const expandAllSetupSections = () => {
    setOpenSetupSections({
      general: hasGeneralSetup,
      tyres: hasTyresSetup,
      suspension: hasSuspensionSetup,
      gearing: hasGearingOrDrivetrainSetup,
      protection: hasProtectionSetup,
      fuel: hasFuelSetup,
      navigation: hasNavigationSetup,
      lighting: hasLightingSetup,
      tools: hasToolsSetup,
      custom: hasSetupValue(setupProfile.customSetup),
    });
  };

  const collapseAllSetupSections = () => {
    setOpenSetupSections({
      general: false,
      tyres: false,
      suspension: false,
      gearing: false,
      protection: false,
      fuel: false,
      navigation: false,
      lighting: false,
      tools: false,
      custom: false,
    });
  };

  const profileRideCount = savedRides.length;

  const profileDistanceKm = savedRides.reduce(
    (sum, ride) => sum + ride.distanceKm,
    0
  );

  const profileHours = savedRides.reduce(
    (sum, ride) => sum + ride.durationSeconds / 3600,
    0
  );

  const vehiclesWithSavedRides = new Set(
    savedRides
      .filter((ride) => Boolean(ride.vehicleId))
      .map((ride) => ride.vehicleId)
  ).size;

  const allVehicleStats: VehicleStatSummary[] = vehicles.map((item) => {
    const ridesForVehicle = savedRides.filter(
      (ride) => ride.vehicleId === item.id
    );

    const uniqueTrailIds = new Set(
      ridesForVehicle
        .filter((ride) => Boolean(ride.trailId))
        .map((ride) => ride.trailId as string)
    );

    return {
      vehicleId: item.id,
      rides: ridesForVehicle.length,
      distance: ridesForVehicle.reduce((sum, ride) => sum + ride.distanceKm, 0),
      hours: ridesForVehicle.reduce(
        (sum, ride) => sum + ride.durationSeconds / 3600,
        0
      ),
      trails: uniqueTrailIds.size,
    };
  });

  const rideRank = getVehicleRank(allVehicleStats, vehicle?.id, "rides");
  const distanceRank = getVehicleRank(allVehicleStats, vehicle?.id, "distance");
  const hoursRank = getVehicleRank(allVehicleStats, vehicle?.id, "hours");
  const trailRank = getVehicleRank(allVehicleStats, vehicle?.id, "trails");

  const achievementSetupProfile = vehicle?.setupProfile ?? {};
  const achievementHasSetupProfile = Object.values(
    achievementSetupProfile
  ).some(hasSetupValue);

  const vehiclesWithSetupProfiles = vehicles.filter((item) =>
    Object.values(item.setupProfile ?? {}).some(hasSetupValue)
  ).length;

  const firstVehicleRide = vehicleRides[vehicleRides.length - 1] ?? null;

  const hasCompletedHardTrail = ridesWithTrails.some((ride) => {
    const trail = mockTrails.find((item) => item.id === ride.trailId);
    return isHardTrail(trail);
  });

  const vehicleAchievements: Achievement[] = [
    {
      id: "first-ride",
      title: "First Ride",
      description: "Save your first ride with this vehicle.",
      unlocked: vehicleRides.length >= 1,
      progress: vehicleRides.length,
      target: 1,
      progressLabel:
        vehicleRides.length >= 1
          ? `Unlocked ${formatDate(firstVehicleRide?.finishedAt ?? null)}`
          : `${vehicleRides.length}/1 ride`,
      category: "Vehicle",
      tier: "bronze",
      icon: Route,
    },
    {
      id: "ten-rides",
      title: "10 Rides",
      description: "Complete 10 rides with this vehicle.",
      unlocked: vehicleRides.length >= 10,
      progress: vehicleRides.length,
      target: 10,
      progressLabel: `${Math.min(vehicleRides.length, 10)}/10 rides`,
      category: "Vehicle",
      tier: "silver",
      icon: Medal,
    },
    {
      id: "twenty-five-rides",
      title: "25 Rides",
      description: "Build a strong ride history with 25 rides.",
      unlocked: vehicleRides.length >= 25,
      progress: vehicleRides.length,
      target: 25,
      progressLabel: `${Math.min(vehicleRides.length, 25)}/25 rides`,
      category: "Vehicle",
      tier: "gold",
      icon: Award,
    },
    {
      id: "hundred-km",
      title: "100 km Tracked",
      description: "Track 100 km of distance with this vehicle.",
      unlocked: totalRideDistance >= 100,
      progress: totalRideDistance,
      target: 100,
      progressLabel: `${Math.min(totalRideDistance, 100).toFixed(1)}/100 km`,
      category: "Vehicle",
      tier: "silver",
      icon: Route,
    },
    {
      id: "five-hundred-km",
      title: "500 km Machine",
      description: "Track 500 km with this vehicle.",
      unlocked: totalRideDistance >= 500,
      progress: totalRideDistance,
      target: 500,
      progressLabel: `${Math.min(totalRideDistance, 500).toFixed(1)}/500 km`,
      category: "Vehicle",
      tier: "gold",
      icon: Target,
    },
    {
      id: "one-thousand-km",
      title: "1000 km Legend",
      description: "Track 1000 km with this vehicle.",
      unlocked: totalRideDistance >= 1000,
      progress: totalRideDistance,
      target: 1000,
      progressLabel: `${Math.min(totalRideDistance, 1000).toFixed(1)}/1000 km`,
      category: "Rare",
      tier: "legendary",
      icon: Crown,
    },
    {
      id: "ten-hours",
      title: "10 Xtrail Hours",
      description: "Track 10 riding hours with this vehicle.",
      unlocked: totalRideHours >= 10,
      progress: totalRideHours,
      target: 10,
      progressLabel: `${Math.min(totalRideHours, 10).toFixed(1)}/10 h`,
      category: "Vehicle",
      tier: "silver",
      icon: Timer,
    },
    {
      id: "fifty-hours",
      title: "50 Xtrail Hours",
      description: "Track 50 riding hours with this vehicle.",
      unlocked: totalRideHours >= 50,
      progress: totalRideHours,
      target: 50,
      progressLabel: `${Math.min(totalRideHours, 50).toFixed(1)}/50 h`,
      category: "Rare",
      tier: "legendary",
      icon: Flame,
    },
    {
      id: "first-trail",
      title: "First Completed Trail",
      description: "Complete your first trail with this vehicle.",
      unlocked: completedTrailsCount >= 1,
      progress: completedTrailsCount,
      target: 1,
      progressLabel:
        completedTrailsCount >= 1
          ? `${completedTrailsCount} completed`
          : "0/1 trail",
      category: "Vehicle",
      tier: "bronze",
      icon: CheckCircle2,
    },
    {
      id: "five-trails",
      title: "5 Completed Trails",
      description: "Complete 5 unique trails with this vehicle.",
      unlocked: completedTrailsCount >= 5,
      progress: completedTrailsCount,
      target: 5,
      progressLabel: `${Math.min(completedTrailsCount, 5)}/5 trails`,
      category: "Vehicle",
      tier: "silver",
      icon: Mountain,
    },
    {
      id: "twenty-trails",
      title: "Trail Collector",
      description: "Complete 20 unique trails with this vehicle.",
      unlocked: completedTrailsCount >= 20,
      progress: completedTrailsCount,
      target: 20,
      progressLabel: `${Math.min(completedTrailsCount, 20)}/20 trails`,
      category: "Rare",
      tier: "legendary",
      icon: Trophy,
    },
    {
      id: "hard-trail",
      title: "Hard Trail Completed",
      description: "Complete a hard, expert, or extreme trail.",
      unlocked: hasCompletedHardTrail,
      progress: hasCompletedHardTrail ? 1 : 0,
      target: 1,
      progressLabel: hasCompletedHardTrail ? "Unlocked" : "0/1 hard trail",
      category: "Rare",
      tier: "gold",
      icon: Flame,
    },
    {
      id: "setup-profile",
      title: "Setup Profile",
      description: "Add setup details for this vehicle.",
      unlocked: achievementHasSetupProfile,
      progress: achievementHasSetupProfile ? 1 : 0,
      target: 1,
      progressLabel: achievementHasSetupProfile ? "Setup added" : "Not started",
      category: "Vehicle",
      tier: "bronze",
      icon: Sparkles,
    },
    {
      id: "first-service",
      title: "First Service Logged",
      description: "Log the first service for this vehicle.",
      unlocked: vehicleServices.length >= 1,
      progress: vehicleServices.length,
      target: 1,
      progressLabel:
        vehicleServices.length >= 1
          ? `Last service ${formatDate(latestService?.date ?? null)}`
          : "0/1 service",
      category: "Vehicle",
      tier: "bronze",
      icon: Wrench,
    },
    {
      id: "maintenance-keeper",
      title: "Maintenance Keeper",
      description: "Log 5 services for this vehicle.",
      unlocked: vehicleServices.length >= 5,
      progress: vehicleServices.length,
      target: 5,
      progressLabel: `${Math.min(vehicleServices.length, 5)}/5 services`,
      category: "Vehicle",
      tier: "gold",
      icon: Wrench,
    },
    {
      id: "ride-leader",
      title: "Ride Leader",
      description: "This is your most ridden vehicle by ride count.",
      unlocked: rideRank === 1 && vehicleRides.length > 0,
      progress: rideRank === 1 && vehicleRides.length > 0 ? 1 : 0,
      target: 1,
      progressLabel:
        rideRank === 1 && vehicleRides.length > 0
          ? "Rank #1"
          : rideRank
          ? `Rank #${rideRank}`
          : "No rank yet",
      category: "Comparison",
      tier: "gold",
      icon: Crown,
    },
    {
      id: "distance-leader",
      title: "Distance Leader",
      description: "This vehicle has the most tracked distance in your garage.",
      unlocked: distanceRank === 1 && totalRideDistance > 0,
      progress: distanceRank === 1 && totalRideDistance > 0 ? 1 : 0,
      target: 1,
      progressLabel:
        distanceRank === 1 && totalRideDistance > 0
          ? "Rank #1"
          : distanceRank
          ? `Rank #${distanceRank}`
          : "No rank yet",
      category: "Comparison",
      tier: "gold",
      icon: Target,
    },
    {
      id: "hours-leader",
      title: "Hours Leader",
      description: "This vehicle has the most Xtrail tracked hours.",
      unlocked: hoursRank === 1 && totalRideHours > 0,
      progress: hoursRank === 1 && totalRideHours > 0 ? 1 : 0,
      target: 1,
      progressLabel:
        hoursRank === 1 && totalRideHours > 0
          ? "Rank #1"
          : hoursRank
          ? `Rank #${hoursRank}`
          : "No rank yet",
      category: "Comparison",
      tier: "gold",
      icon: Timer,
    },
    {
      id: "trail-specialist",
      title: "Trail Specialist",
      description: "This vehicle has the most unique completed trails.",
      unlocked: trailRank === 1 && completedTrailsCount > 0,
      progress: trailRank === 1 && completedTrailsCount > 0 ? 1 : 0,
      target: 1,
      progressLabel:
        trailRank === 1 && completedTrailsCount > 0
          ? "Rank #1"
          : trailRank
          ? `Rank #${trailRank}`
          : "No rank yet",
      category: "Comparison",
      tier: "gold",
      icon: Star,
    },
    {
      id: "fleet-owner",
      title: "Fleet Owner",
      description: "Create 3 or more vehicles in your garage.",
      unlocked: vehicles.length >= 3,
      progress: vehicles.length,
      target: 3,
      progressLabel: `${Math.min(vehicles.length, 3)}/3 vehicles`,
      category: "Profile",
      tier: "silver",
      icon: Award,
    },
    {
      id: "multi-vehicle-rider",
      title: "Multi-Vehicle Rider",
      description: "Save rides on at least 2 different vehicles.",
      unlocked: vehiclesWithSavedRides >= 2,
      progress: vehiclesWithSavedRides,
      target: 2,
      progressLabel: `${Math.min(vehiclesWithSavedRides, 2)}/2 vehicles`,
      category: "Profile",
      tier: "silver",
      icon: Repeat2,
    },
    {
      id: "profile-explorer",
      title: "Profile Explorer",
      description: "Save 25 rides across your profile.",
      unlocked: profileRideCount >= 25,
      progress: profileRideCount,
      target: 25,
      progressLabel: `${Math.min(profileRideCount, 25)}/25 rides`,
      category: "Profile",
      tier: "gold",
      icon: Route,
    },
    {
      id: "profile-distance",
      title: "Profile 1000 km",
      description: "Track 1000 km across all vehicles.",
      unlocked: profileDistanceKm >= 1000,
      progress: profileDistanceKm,
      target: 1000,
      progressLabel: `${Math.min(profileDistanceKm, 1000).toFixed(1)}/1000 km`,
      category: "Profile",
      tier: "legendary",
      icon: Trophy,
    },
    {
      id: "profile-hours",
      title: "Profile 100 Hours",
      description: "Track 100 riding hours across all vehicles.",
      unlocked: profileHours >= 100,
      progress: profileHours,
      target: 100,
      progressLabel: `${Math.min(profileHours, 100).toFixed(1)}/100 h`,
      category: "Profile",
      tier: "legendary",
      icon: Timer,
    },
    {
      id: "garage-setup",
      title: "Garage Setup Complete",
      description: "Add setup profiles to every vehicle in your garage.",
      unlocked: vehicles.length > 0 && vehiclesWithSetupProfiles === vehicles.length,
      progress: vehiclesWithSetupProfiles,
      target: Math.max(vehicles.length, 1),
      progressLabel: `${vehiclesWithSetupProfiles}/${vehicles.length} vehicles`,
      category: "Profile",
      tier: "gold",
      icon: Sparkles,
    },
    {
      id: "all-rounder",
      title: "All-Rounder",
      description: "Ride, service, complete a trail, and add setup details.",
      unlocked:
        vehicleRides.length >= 1 &&
        vehicleServices.length >= 1 &&
        completedTrailsCount >= 1 &&
        achievementHasSetupProfile,
      progress:
        Number(vehicleRides.length >= 1) +
        Number(vehicleServices.length >= 1) +
        Number(completedTrailsCount >= 1) +
        Number(achievementHasSetupProfile),
      target: 4,
      progressLabel: `${
        Number(vehicleRides.length >= 1) +
        Number(vehicleServices.length >= 1) +
        Number(completedTrailsCount >= 1) +
        Number(achievementHasSetupProfile)
      }/4 complete`,
      category: "Rare",
      tier: "legendary",
      icon: Trophy,
    },
  ];

  const achievementCategories: AchievementCategory[] = [
    "Vehicle",
    "Comparison",
    "Profile",
    "Rare",
  ];

  const unlockedAchievementCount = vehicleAchievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  const unlockedAchievementIds = vehicleAchievements
    .filter((achievement) => achievement.unlocked)
    .map((achievement) => achievement.id);

  const unlockedAchievementSignature = unlockedAchievementIds.join("|");

  useEffect(() => {
    if (!vehicle?.id || unlockedAchievementIds.length === 0) return;

    const storageKey = `xtrail-seen-achievements-${vehicle.id}`;
    const storedSeenAchievements = localStorage.getItem(storageKey);

    let seenAchievementIds: string[] = [];

    try {
      seenAchievementIds = storedSeenAchievements
        ? (JSON.parse(storedSeenAchievements) as string[])
        : [];
    } catch (error) {
      console.error("Failed to load seen achievements:", error);
      seenAchievementIds = [];
    }

    const newlyUnlockedAchievement = vehicleAchievements.find(
      (achievement) =>
        achievement.unlocked && !seenAchievementIds.includes(achievement.id)
    );

    const nextSeenAchievementIds = Array.from(
      new Set([...seenAchievementIds, ...unlockedAchievementIds])
    );

    localStorage.setItem(storageKey, JSON.stringify(nextSeenAchievementIds));

    if (!newlyUnlockedAchievement) return;

    setRecentAchievement(newlyUnlockedAchievement);

    const timeoutId = window.setTimeout(() => {
      setRecentAchievement(null);
    }, 5000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [vehicle?.id, unlockedAchievementSignature]);

  if (!vehicle) {
    return <div className="p-4 text-white">Vehicle not found</div>;
  }

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      {recentAchievement && (
      <div className="fixed left-1/2 top-[13rem] z-[60] w-[calc(100%-2rem)] max-w-[400px] -translate-x-1/2 rounded-2xl border border-orange-500/30 bg-neutral-950 p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-black">
            <Trophy className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
              Achievement unlocked
            </p>

            <p className="mt-1 text-sm font-bold text-white">
              {recentAchievement.title}
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-400">
              {recentAchievement.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRecentAchievement(null)}
            className="rounded-full p-1 text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )}
      {/* Hero */}
      <div className="relative">
        <div className="h-52 w-full overflow-hidden">
          {vehicle.bannerImage ? (
            <img
              src={vehicle.bannerImage}
              alt={`${vehicle.name} banner`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-neutral-900" />
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-neutral-950" />

        <div className="absolute left-4 top-4">
          <Link to="/garage">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
        </div>

        <div className="absolute -bottom-14 left-0 w-full px-4 pb-6">
          <div className="flex items-end gap-4">
            <div className="flex min-w-0 flex-1 items-end gap-4">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-lg">
                {vehicle.image ? (
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                    No image
                  </div>
                )}
              </div>

              <div className="min-w-0 pb-1">
                <h1 className="truncate text-2xl font-bold text-white">
                  {vehicle.name}
                </h1>
                <p className="mt-2 truncate text-sm text-neutral-300">
                  {vehicle.brand} {vehicle.model} • {vehicle.year}
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 flex-col items-end gap-2 pb-1">
              <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-medium capitalize text-white">
                {formatVehicleType(vehicle.type)}
              </span>

              {isActiveVehicle && (
                <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                  Active
                </span>
              )}

              <button
                type="button"
                onClick={handleOpenEditVehicle}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-950/80 px-3 py-1 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-4 pb-32 pt-14">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Gauge className="h-4 w-4" />
              <span className="text-xs font-medium">Rides</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {vehicleRides.length}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium">Trails</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {completedTrailsCount}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-cyan-400">
              <Route className="h-4 w-4" />
              <span className="text-xs font-medium">Distance</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {totalRideDistance.toFixed(1)} km
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-center gap-2 text-orange-400">
              <Timer className="h-4 w-4" />
              <span className="text-xs font-medium">Engine</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {currentEngineHours.toFixed(1)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">Engine Hours</h2>

          <p className="mt-1 text-sm text-neutral-400">
            Total engine hours based on purchase hours plus Xtrail rides.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-950 px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Purchased
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {hoursAtPurchase.toFixed(1)} h
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Xtrail
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {totalRideHours.toFixed(1)} h
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Manual
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {manualAddedHours.toFixed(1)} h
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-3 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Current
              </p>
              <p className="mt-2 text-sm font-semibold text-white">
                {currentEngineHours.toFixed(1)} h
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance Status */}
        <div
          className={`rounded-2xl border p-5 ${
            overallMaintenanceStatus === "overdue"
              ? "border-red-500/30 bg-red-950/20"
              : "border-neutral-800 bg-neutral-900"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                {overallMaintenanceStatus === "overdue" ? (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                ) : (
                  <Wrench className="h-5 w-5 text-orange-400" />
                )}
                <h2 className="text-base font-semibold text-white">
                  Maintenance Status
                </h2>
              </div>

              <p className="mt-1 text-sm text-neutral-400">
                Current service condition for this vehicle
              </p>
            </div>

            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${
                overallMaintenanceStatus === "ok"
                  ? "border-emerald-500/20 bg-emerald-500/15 text-emerald-400"
                  : overallMaintenanceStatus === "due_soon"
                  ? "border-orange-500/20 bg-orange-500/15 text-orange-400"
                  : "border-red-500/20 bg-red-500/15 text-red-400"
              }`}
            >
              {maintenanceStatusLabel}
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-neutral-950 px-4 py-4">
            <p className="text-sm text-neutral-300">
              {maintenanceStatusMessage}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <div className="flex items-center gap-2 text-neutral-500">
                <CalendarDays className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide">Last service</p>
              </div>

              <p className="mt-2 text-sm font-medium text-white">
                {formatDate(latestService?.date ?? null)}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Attention
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {overdueTaskCount > 0
                  ? `${overdueTaskCount} overdue`
                  : dueSoonTaskCount > 0
                  ? `${dueSoonTaskCount} due soon`
                  : "No urgent tasks"}
              </p>
            </div>
          </div>

          {nextMaintenanceTask && (
            <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-neutral-500">
                    Next service
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white">
                    {nextMaintenanceTask.label}
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    {nextMaintenanceTask.nextDueAt !== null
                      ? `Next due at ${nextMaintenanceTask.nextDueAt.toFixed(
                          1
                        )} ${nextMaintenanceTask.unit}`
                      : "Log first service to calculate the next due point"}
                  </p>
                </div>

                <span
                  className={`flex-shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                    nextMaintenanceTask.status === "overdue"
                      ? "border-red-500/20 bg-red-500/15 text-red-400"
                      : nextMaintenanceTask.status === "due_soon" ||
                        nextMaintenanceTask.status === "never_logged"
                      ? "border-orange-500/20 bg-orange-500/15 text-orange-400"
                      : "border-emerald-500/20 bg-emerald-500/15 text-emerald-400"
                  }`}
                >
                  {getMaintenanceDueText(nextMaintenanceTask)}
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className={`h-full rounded-full ${
                    nextMaintenanceTask.status === "overdue"
                      ? "bg-red-500"
                      : nextMaintenanceTask.status === "due_soon"
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${getMaintenanceProgressPercent(
                      nextMaintenanceTask
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="mt-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Top urgent tasks
            </p>

            {urgentMaintenanceTasks.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-300">
                No urgent maintenance tasks right now.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {urgentMaintenanceTasks.map((task) => (
                  <div
                    key={task.taskId}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {task.label}
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        {task.notes ?? `${task.interval} ${task.unit} interval`}
                      </p>
                    </div>

                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        task.status === "overdue"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-orange-500/15 text-orange-400"
                      }`}
                    >
                      {getMaintenanceDueText(task)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to={`/service-log?vehicleId=${vehicle.id}`}
            className="mt-4 flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:border-neutral-700 hover:bg-neutral-900"
          >
            Open Service Log
            <ChevronRight className="h-4 w-4 text-neutral-500" />
          </Link>
        </div>

        {/* Trail Performance */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">
                Trail Performance
              </h2>

              <p className="mt-1 text-sm text-neutral-400">
                Trails completed with this vehicle
              </p>
            </div>

            <Link
              to={`/completed-trails?vehicleId=${vehicle.id}`}
              className="inline-flex items-center gap-1 rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-800"
            >
              View all
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-neutral-950 px-3 py-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-xs">Unique</p>
              </div>

              <p className="mt-2 text-lg font-bold text-white">
                {completedTrailsCount}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-3 py-3">
              <div className="flex items-center gap-2 text-orange-400">
                <Repeat2 className="h-4 w-4" />
                <p className="text-xs">Repeats</p>
              </div>

              <p className="mt-2 text-lg font-bold text-white">
                {repeatedCompletionCount}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-3 py-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Mountain className="h-4 w-4" />
                <p className="text-xs">Terrain</p>
              </div>

              <p className="mt-2 truncate text-sm font-semibold text-white">
                {favoriteTerrain ? favoriteTerrain[0] : "None yet"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <Trophy className="h-4 w-4" />
                <p className="text-xs uppercase tracking-wide">
                  Most ridden trail
                </p>
              </div>

              {mostRiddenTrail ? (
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {mostRiddenTrail.trailName}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {mostRiddenTrail.completionCount} completions with this
                      vehicle
                    </p>
                  </div>

                  <Star className="h-5 w-5 flex-shrink-0 text-yellow-400" />
                </div>
              ) : (
                <p className="mt-3 text-sm text-neutral-400">
                  Complete a trail with this vehicle to see its top trail.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Recent completed trails
              </p>

              {recentCompletedTrails.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-400">
                  No completed trails linked to this vehicle yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentCompletedTrails.map((trailSummary) => (
                    <Link
                      key={trailSummary.trailId}
                      to={`/trail/${trailSummary.trailId}`}
                      className="flex items-center gap-3 rounded-xl bg-neutral-900 px-3 py-3 transition hover:bg-neutral-800"
                    >
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                        {trailSummary.trail?.imageUrl ? (
                          <img
                            src={trailSummary.trail.imageUrl}
                            alt={trailSummary.trailName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
                            Trail
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">
                          {trailSummary.trailName}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          Last completed{" "}
                          {formatDate(trailSummary.latestCompletedAt)}
                        </p>
                      </div>

                      {trailSummary.completionCount > 1 && (
                        <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-xs font-medium text-orange-400">
                          x{trailSummary.completionCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Achievements */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-400" />
                <h2 className="text-base font-semibold text-white">
                  Vehicle Achievements
                </h2>
              </div>

              <p className="mt-1 text-sm text-neutral-400">
                Rewards, milestones, profile progress, and rare unlocks.
              </p>
            </div>

            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400">
              {unlockedAchievementCount}/{vehicleAchievements.length}
            </span>
          </div>

          <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">
                  Achievement Progress
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Unlock badges by riding, servicing, setting up, and exploring.
                </p>
              </div>

              <p className="text-sm font-bold text-orange-400">
                {Math.round(
                  getProgressPercent(unlockedAchievementCount, vehicleAchievements.length)
                )}
                %
              </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-orange-500"
                style={{
                  width: `${getProgressPercent(
                    unlockedAchievementCount,
                    vehicleAchievements.length
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(["all", "unlocked", "locked"] as AchievementFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setAchievementFilter(filter)}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition ${
                    achievementFilter === filter
                      ? "border-orange-500/40 bg-orange-500/15 text-orange-400"
                      : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {achievementCategories.map((category) => {
              const allCategoryAchievements = vehicleAchievements.filter(
                (achievement) => achievement.category === category
              );

              const unlockedInCategory = allCategoryAchievements.filter(
                (achievement) => achievement.unlocked
              ).length;

              const visibleCategoryAchievements = allCategoryAchievements
                .filter((achievement) => {
                  if (achievementFilter === "unlocked") return achievement.unlocked;
                  if (achievementFilter === "locked") return !achievement.unlocked;
                  return true;
                })
                .sort((a, b) => {
                  if (a.unlocked === b.unlocked) return 0;
                  return a.unlocked ? -1 : 1;
                });

              const isOpen = openAchievementCategories[category] ?? false;

              return (
                <div
                  key={category}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950"
                >
                  <button
                    type="button"
                    onClick={() => toggleAchievementCategory(category)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-orange-400">
                        {category}
                      </h3>

                      <p className="mt-1 text-xs text-neutral-500">
                        {unlockedInCategory}/{allCategoryAchievements.length} unlocked
                        {achievementFilter !== "all"
                          ? ` • ${visibleCategoryAchievements.length} shown`
                          : ""}
                      </p>
                    </div>

                    {isOpen ? (
                      <ChevronDown className="h-4 w-4 text-neutral-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-neutral-500" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="border-t border-neutral-800 px-4 pb-4 pt-4">
                      {visibleCategoryAchievements.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900 px-4 py-5 text-center">
                          <p className="text-sm font-medium text-white">
                            No achievements to show
                          </p>

                          <p className="mt-2 text-sm text-neutral-500">
                            Change the filter to see more achievements in this category.
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {visibleCategoryAchievements.map((achievement) => (
                            <AchievementCard
                              key={achievement.id}
                              achievement={achievement}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Vehicle Setup */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Vehicle Setup</h2>

              <p className="mt-1 text-sm text-neutral-400">
                Current setup profile for this {displaySetupConfig.label}.
              </p>

              {hasAnySetupProfile && (
                <p className="mt-2 text-xs text-neutral-500">
                  {configuredSetupSectionCount} setup section
                  {configuredSetupSectionCount === 1 ? "" : "s"} configured
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleOpenEditVehicle}
              className="rounded-full border border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 hover:text-white"
            >
              Edit
            </button>
          </div>

          {!hasAnySetupProfile ? (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 px-4 py-5 text-center">
              <p className="text-sm font-medium text-white">No setup profile yet</p>

              <p className="mt-2 text-sm text-neutral-400">
                Add tyres, suspension, protection, fuel range, and riding setup for this vehicle.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={expandAllSetupSections}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
                >
                  Expand all
                </button>

                <button
                  type="button"
                  onClick={collapseAllSetupSections}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
                >
                  Collapse all
                </button>
              </div>

              {/* General setup */}
              {hasGeneralSetup && (
                <CollapsibleSetupSection
                  title="Riding / Driving Setup"
                  isOpen={openSetupSections.general ?? true}
                  onToggle={() => toggleSetupSection("general")}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <SetupDetail label="Primary use" value={setupProfile.primaryUse} />
                    <SetupDetail label="Terrain focus" value={setupProfile.terrainFocus} />
                    <SetupDetail label="Setup" value={setupProfile.ridingSetup} />
                    <SetupDetail label="Notes" value={setupProfile.ridingSetupNotes} />
                  </div>

                  {setupProfile.setupNotes && (
                    <p className="mt-3 rounded-xl bg-neutral-900 px-4 py-3 text-sm leading-6 text-neutral-300">
                      {setupProfile.setupNotes}
                    </p>
                  )}
                </CollapsibleSetupSection>
              )}

              {/* Tyres / Wheels */}
              {displaySetupConfig.setupSections.includes("tyres") && hasTyresSetup && (
                <CollapsibleSetupSection
                  title="Tyres / Wheels"
                  isOpen={openSetupSections.tyres ?? false}
                  onToggle={() => toggleSetupSection("tyres")}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <SetupDetail label="Front type" value={setupProfile.frontTyreType} />
                    <SetupDetail label="Rear type" value={setupProfile.rearTyreType} />
                    <SetupDetail label="Front tyre" value={setupProfile.frontTyreName} />
                    <SetupDetail label="Rear tyre" value={setupProfile.rearTyreName} />
                    <SetupDetail label="Tyre size" value={setupProfile.tyreSize} />
                    <SetupDetail label="Wheel setup" value={setupProfile.wheelSetup} />
                    <SetupDetail label="Tyre pressure" value={setupProfile.tyrePressure} />
                    <SetupDetail label="Tube system" value={setupProfile.tubeMousseTubliss} />
                  </div>
                </CollapsibleSetupSection>
              )}

              {/* Suspension */}
              {displaySetupConfig.setupSections.includes("suspension") &&
                hasSuspensionSetup && (
                  <CollapsibleSetupSection
                    title="Suspension"
                    isOpen={openSetupSections.suspension ?? false}
                    onToggle={() => toggleSetupSection("suspension")}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <SetupDetail label="Setup" value={setupProfile.suspensionSetup} />
                      <SetupDetail label="Weight" value={riderWeightSummary} />
                    </div>

                    {setupProfile.suspensionNotes && (
                      <p className="mt-3 rounded-xl bg-neutral-900 px-4 py-3 text-sm leading-6 text-neutral-300">
                        {setupProfile.suspensionNotes}
                      </p>
                    )}
                  </CollapsibleSetupSection>
                )}

              {/* Gearing / Drivetrain */}
              {(displaySetupConfig.setupSections.includes("gearing") ||
                displaySetupConfig.setupSections.includes("drivetrain")) &&
                hasGearingOrDrivetrainSetup && (
                  <CollapsibleSetupSection
                    title={
                      displaySetupConfig.setupSections.includes("gearing")
                        ? "Gearing"
                        : "Drivetrain"
                    }
                    isOpen={openSetupSections.gearing ?? false}
                    onToggle={() => toggleSetupSection("gearing")}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <SetupDetail label="Gearing" value={gearingSummary} />
                      <SetupDetail label="Drivetrain" value={setupProfile.drivetrainSetup} />
                      <SetupDetail label="Lockers" value={setupProfile.lockers} />
                    </div>

                    {setupProfile.gearingNotes && (
                      <p className="mt-3 rounded-xl bg-neutral-900 px-4 py-3 text-sm leading-6 text-neutral-300">
                        {setupProfile.gearingNotes}
                      </p>
                    )}
                  </CollapsibleSetupSection>
                )}

              {/* Protection */}
              {displaySetupConfig.setupSections.includes("protection") &&
                hasProtectionSetup && (
                  <CollapsibleSetupSection
                    title="Protection"
                    isOpen={openSetupSections.protection ?? false}
                    onToggle={() => toggleSetupSection("protection")}
                  >
                    <div className="space-y-3">
                      <SetupTagList label="Parts" values={setupProfile.protectionParts} />

                      {setupProfile.protectionNotes && (
                        <p className="rounded-xl bg-neutral-900 px-4 py-3 text-sm leading-6 text-neutral-300">
                          {setupProfile.protectionNotes}
                        </p>
                      )}
                    </div>
                  </CollapsibleSetupSection>
                )}

              {/* Fuel / Range */}
              {displaySetupConfig.setupSections.includes("fuel") && hasFuelSetup && (
                <CollapsibleSetupSection
                  title="Fuel / Range"
                  isOpen={openSetupSections.fuel ?? false}
                  onToggle={() => toggleSetupSection("fuel")}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <SetupDetail label="Fuel setup" value={setupProfile.fuelSetup} />
                    <SetupDetail label="Tank size" value={fuelTankSummary} />
                    <SetupDetail label="Range" value={fuelRangeSummary} />
                  </div>

                  {setupProfile.fuelNotes && (
                    <p className="mt-3 rounded-xl bg-neutral-900 px-4 py-3 text-sm leading-6 text-neutral-300">
                      {setupProfile.fuelNotes}
                    </p>
                  )}
                </CollapsibleSetupSection>
              )}

              {/* Navigation */}
              {displaySetupConfig.setupSections.includes("navigation") &&
                hasNavigationSetup && (
                  <CollapsibleSetupSection
                    title="Navigation"
                    isOpen={openSetupSections.navigation ?? false}
                    onToggle={() => toggleSetupSection("navigation")}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <SetupDetail label="Navigation" value={setupProfile.navigationSetup} />
                    </div>

                    {setupProfile.electronicsNotes && (
                      <p className="mt-3 rounded-xl bg-neutral-900 px-4 py-3 text-sm leading-6 text-neutral-300">
                        {setupProfile.electronicsNotes}
                      </p>
                    )}
                  </CollapsibleSetupSection>
                )}

              {/* Lighting */}
              {displaySetupConfig.setupSections.includes("lighting") &&
                hasLightingSetup && (
                  <CollapsibleSetupSection
                    title="Lighting"
                    isOpen={openSetupSections.lighting ?? false}
                    onToggle={() => toggleSetupSection("lighting")}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <SetupDetail label="Lighting" value={setupProfile.lightingSetup} />
                    </div>

                    {setupProfile.lightingNotes && (
                      <p className="mt-3 rounded-xl bg-neutral-900 px-4 py-3 text-sm leading-6 text-neutral-300">
                        {setupProfile.lightingNotes}
                      </p>
                    )}
                  </CollapsibleSetupSection>
                )}

              {/* Tools / Spares */}
              {displaySetupConfig.setupSections.includes("tools") && hasToolsSetup && (
                <CollapsibleSetupSection
                  title="Tools / Spares"
                  isOpen={openSetupSections.tools ?? false}
                  onToggle={() => toggleSetupSection("tools")}
                >
                  <div className="space-y-3">
                    <SetupTagList
                      label="Carried items"
                      values={setupProfile.toolsAndSpares}
                    />

                    {setupProfile.toolsAndSparesNotes && (
                      <p className="rounded-xl bg-neutral-900 px-4 py-3 text-sm leading-6 text-neutral-300">
                        {setupProfile.toolsAndSparesNotes}
                      </p>
                    )}
                  </div>
                </CollapsibleSetupSection>
              )}

              {/* Custom */}
              {setupProfile.customSetup && (
                <CollapsibleSetupSection
                  title="Custom Setup"
                  isOpen={openSetupSections.custom ?? false}
                  onToggle={() => toggleSetupSection("custom")}
                >
                  <p className="rounded-xl bg-neutral-900 px-4 py-3 text-sm leading-6 text-neutral-300">
                    {setupProfile.customSetup}
                  </p>
                </CollapsibleSetupSection>
              )}
            </div>
          )}
        </div>

        {/* Vehicle Info */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">Vehicle Info</h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Type
              </p>

              <p className="mt-2 text-sm font-medium capitalize text-white">
                {formatVehicleType(vehicle.type)}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Year
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {vehicle.year}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Hours at purchase
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {hoursAtPurchase.toFixed(1)}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Mileage
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {vehicle.mileage}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Manual added hours
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                {manualAddedHours.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {vehicle.notes && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-base font-semibold text-white">Notes</h2>

            <p className="mt-3 text-sm leading-6 text-neutral-300">
              {vehicle.notes}
            </p>
          </div>
        )}

        {/* Ride History */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">
                Ride History
              </h2>

              <p className="mt-1 text-sm text-neutral-400">
                Saved rides linked to this vehicle
              </p>
            </div>
          </div>

          {vehicleRides.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 px-4 py-5 text-center">
              <p className="text-sm font-medium text-white">No rides yet</p>

              <p className="mt-2 text-sm text-neutral-400">
                Start and save a ride with this vehicle to build its ride
                history.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {vehicleRides.map((ride) => (
                <Link
                  key={ride.id}
                  to={`/ride-history/${ride.id}`}
                  className="block rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 transition hover:border-neutral-700 hover:bg-neutral-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {ride.trailName || "Ride"}
                      </p>

                      <p className="mt-1 text-xs text-neutral-400">
                        {formatDate(ride.finishedAt)}
                      </p>
                    </div>

                    <div className="text-right text-xs text-neutral-400">
                      <p>{ride.distanceKm.toFixed(1)} km</p>

                      <p className="mt-1">
                        {(ride.durationSeconds / 3600).toFixed(1)} h
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="max-h-[85vh] w-full max-w-[390px] overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                  Vehicle
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">Edit Vehicle</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Update this vehicle’s details and images.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition hover:bg-neutral-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Vehicle name
                </label>
                <input
                  type="text"
                  value={editVehicle.name}
                  onChange={(event) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Vehicle type
                </label>
                <select
                  value={editVehicle.type}
                  onChange={(event) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      type: event.target.value as VehicleType,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                >
                  <option value="">Select type</option>
                  <option value="dirt-bike">Dirt Bike</option>
                  <option value="adventure-bike">Adventure Bike</option>
                  <option value="quad">Quad</option>
                  <option value="sxs">SXS</option>
                  <option value="4x4">4x4</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-neutral-300">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={editVehicle.brand}
                    onChange={(event) =>
                      setEditVehicle((prev) => ({
                        ...prev,
                        brand: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300">
                    Model
                  </label>
                  <input
                    type="text"
                    value={editVehicle.model}
                    onChange={(event) =>
                      setEditVehicle((prev) => ({
                        ...prev,
                        model: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">Year</label>
                <input
                  type="number"
                  value={editVehicle.year}
                  onChange={(event) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      year: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-neutral-300">
                    Hours at purchase
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editVehicle.hoursAtPurchase}
                    onChange={(event) =>
                      setEditVehicle((prev) => ({
                        ...prev,
                        hoursAtPurchase: Number(event.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-300">
                    Manual hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={editVehicle.manualAddedHours}
                    onChange={(event) =>
                      setEditVehicle((prev) => ({
                        ...prev,
                        manualAddedHours: Number(event.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Mileage
                </label>
                <input
                  type="number"
                  min="0"
                  value={editVehicle.mileage}
                  onChange={(event) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      mileage: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Vehicle Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleEditVehicleImageUpload(event, "image")}
                  className="mt-2 block w-full text-sm text-neutral-400 file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
                />

                {editVehicle.image && (
                  <div className="mt-3 h-24 w-24 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                    <img
                      src={editVehicle.image}
                      alt="Vehicle preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">
                  Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    handleEditVehicleImageUpload(event, "bannerImage")
                  }
                  className="mt-2 block w-full text-sm text-neutral-400 file:mr-4 file:rounded-xl file:border-0 file:bg-neutral-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-neutral-700"
                />

                {editVehicle.bannerImage && (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                    <img
                      src={editVehicle.bannerImage}
                      alt="Banner preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-300">Notes</label>
                <textarea
                  value={editVehicle.notes}
                  onChange={(event) =>
                    setEditVehicle((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                />
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                    Setup Vehicle Profile
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-orange-400">
                    Riding Setup
                  </h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    Add the current setup focus for this {setupConfig.label}.
                  </p>
                </div>

                {/*Riding Setup*/}
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Primary use
                    </label>
                    <input
                      type="text"
                      value={editVehicle.setupProfile.primaryUse ?? ""}
                      onChange={(event) =>
                        updateSetupProfileField("primaryUse", event.target.value)
                      }
                      placeholder="Example: Weekend trails, racing, touring"
                      className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Terrain focus
                    </label>
                    <input
                      type="text"
                      value={editVehicle.setupProfile.terrainFocus ?? ""}
                      onChange={(event) =>
                        updateSetupProfileField("terrainFocus", event.target.value)
                      }
                      placeholder="Example: Rocks, sand, forest, mud"
                      className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Riding setup
                    </label>
                    <select
                      value={editVehicle.setupProfile.ridingSetup ?? ""}
                      onChange={(event) =>
                        updateSetupProfileField("ridingSetup", event.target.value)
                      }
                      className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                    >
                      <option value="">Select setup</option>
                      {setupConfig.ridingSetupOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Riding setup notes
                    </label>
                    <textarea
                      value={editVehicle.setupProfile.ridingSetupNotes ?? ""}
                      onChange={(event) =>
                        updateSetupProfileField("ridingSetupNotes", event.target.value)
                      }
                      rows={3}
                      placeholder="Example: Built for slow technical riding and rocky climbs."
                      className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      General setup notes
                    </label>
                    <textarea
                      value={editVehicle.setupProfile.setupNotes ?? ""}
                      onChange={(event) =>
                        updateSetupProfileField("setupNotes", event.target.value)
                      }
                      rows={3}
                      placeholder="Add anything important about the current setup."
                      className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/*Tyres / Wheels*/}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                <div>
                  <h3 className="mt-1 text-base font-semibold text-orange-400">
                    Tyres / Wheels
                  </h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    Add tyre, wheel, pressure, and traction details for this {setupConfig.label}.
                  </p>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Front tyre type
                      </label>
                      <select
                        value={editVehicle.setupProfile.frontTyreType ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("frontTyreType", event.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                      >
                        <option value="">Select type</option>
                        {setupConfig.tyreTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Rear tyre type
                      </label>
                      <select
                        value={editVehicle.setupProfile.rearTyreType ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("rearTyreType", event.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                      >
                        <option value="">Select type</option>
                        {setupConfig.tyreTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Front tyre name
                      </label>
                      <input
                        type="text"
                        value={editVehicle.setupProfile.frontTyreName ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("frontTyreName", event.target.value)
                        }
                        placeholder="Example: Michelin Enduro Medium"
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Rear tyre name
                      </label>
                      <input
                        type="text"
                        value={editVehicle.setupProfile.rearTyreName ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("rearTyreName", event.target.value)
                        }
                        placeholder="Example: Mitas Terra Force"
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Tyre size
                    </label>
                    <input
                      type="text"
                      value={editVehicle.setupProfile.tyreSize ?? ""}
                      onChange={(event) =>
                        updateSetupProfileField("tyreSize", event.target.value)
                      }
                      placeholder="Example: 90/90-21, 140/80-18, 33 inch, 32x10R15"
                      className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Wheel setup
                    </label>
                    <input
                      type="text"
                      value={editVehicle.setupProfile.wheelSetup ?? ""}
                      onChange={(event) =>
                        updateSetupProfileField("wheelSetup", event.target.value)
                      }
                      placeholder="Example: Beadlocks, stock wheels, heavy duty rims"
                      className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-neutral-300">
                      Tyre pressure
                    </label>
                    <input
                      type="text"
                      value={editVehicle.setupProfile.tyrePressure ?? ""}
                      onChange={(event) =>
                        updateSetupProfileField("tyrePressure", event.target.value)
                      }
                      placeholder="Example: Front 0.9 bar / Rear 0.7 bar"
                      className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                    />
                  </div>

                  {setupConfig.setupSections.includes("tube-system") && (
                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Tube / mousse / tubliss
                      </label>
                      <select
                        value={editVehicle.setupProfile.tubeMousseTubliss ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("tubeMousseTubliss", event.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                      >
                        <option value="">Select setup</option>
                        {tubeMousseTublissOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/*Suspension*/}
              {setupConfig.setupSections.includes("suspension") && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                  <div>
                    <h3 className="mt-1 text-base font-semibold text-orange-400">
                      Suspension
                    </h3>
                    <p className="mt-1 text-sm text-neutral-400">
                      Add the current suspension setup for this {setupConfig.label}.
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Suspension setup
                      </label>
                      <select
                        value={editVehicle.setupProfile.suspensionSetup ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("suspensionSetup", event.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                      >
                        <option value="">Select suspension setup</option>
                        {setupConfig.suspensionOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Rider / load weight
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editVehicle.setupProfile.riderWeightKg ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField(
                            "riderWeightKg",
                            event.target.value ? Number(event.target.value) : undefined
                          )
                        }
                        placeholder="Example: 78"
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      />
                      <p className="mt-1 text-xs text-neutral-500">
                        Use rider weight, load weight, or touring/cargo weight where relevant.
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Suspension notes
                      </label>
                      <textarea
                        value={editVehicle.setupProfile.suspensionNotes ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("suspensionNotes", event.target.value)
                        }
                        rows={3}
                        placeholder="Example: Soft rocks setup, loaded luggage setup, or 2 clicks slower rebound."
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/*Protection*/}
              {setupConfig.setupSections.includes("protection") && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                  <div>
                    <h3 className="mt-1 text-base font-semibold text-orange-400">
                      Protection
                    </h3>
                    <p className="mt-1 text-sm text-neutral-400">
                      Select protection parts fitted to this {setupConfig.label}.
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {setupConfig.protectionOptions.map((option) => {
                        const selectedParts =
                          editVehicle.setupProfile.protectionParts ?? [];

                        const isSelected = selectedParts.includes(option);

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              const nextParts = isSelected
                                ? selectedParts.filter((part) => part !== option)
                                : [...selectedParts, option];

                              updateSetupProfileField("protectionParts", nextParts);
                            }}
                            className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                              isSelected
                                ? "border-orange-500/40 bg-orange-500/15 text-orange-400"
                                : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Protection notes
                      </label>
                      <textarea
                        value={editVehicle.setupProfile.protectionNotes ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("protectionNotes", event.target.value)
                        }
                        rows={3}
                        placeholder="Example: AXP skid plate, radiator braces, or full underbody protection."
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/*Fuel / Range*/}
              {setupConfig.setupSections.includes("fuel") && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                  <div>
                    <h3 className="mt-1 text-base font-semibold text-orange-400">
                      Fuel / Range
                    </h3>
                    <p className="mt-1 text-sm text-neutral-400">
                      Add fuel capacity and expected range for this {setupConfig.label}.
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Fuel setup
                      </label>
                      <select
                        value={editVehicle.setupProfile.fuelSetup ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("fuelSetup", event.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                      >
                        <option value="">Select fuel setup</option>
                        {setupConfig.fuelOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium text-neutral-300">
                          Tank size
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={editVehicle.setupProfile.fuelTankSizeLitres ?? ""}
                          onChange={(event) =>
                            updateSetupProfileField(
                              "fuelTankSizeLitres",
                              event.target.value ? Number(event.target.value) : undefined
                            )
                          }
                          placeholder="Litres"
                          className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-neutral-300">
                          Range
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={editVehicle.setupProfile.fuelRangeKm ?? ""}
                          onChange={(event) =>
                            updateSetupProfileField(
                              "fuelRangeKm",
                              event.target.value ? Number(event.target.value) : undefined
                            )
                          }
                          placeholder="km"
                          className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Fuel notes
                      </label>
                      <textarea
                        value={editVehicle.setupProfile.fuelNotes ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("fuelNotes", event.target.value)
                        }
                        rows={3}
                        placeholder="Example: Gets around 70 km in hard enduro, or carries two jerry cans for long trips."
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/*Gearing / Drivetrain*/}
              {(setupConfig.setupSections.includes("gearing") ||
                setupConfig.setupSections.includes("drivetrain")) && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                  <div>

                    <h3 className="mt-1 text-base font-semibold text-orange-400">
                      {setupConfig.setupSections.includes("gearing")
                        ? "Gearing"
                        : "Drivetrain"}
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      {setupConfig.setupSections.includes("gearing")
                        ? `Add sprocket and gearing details for this ${setupConfig.label}.`
                        : `Add drivetrain, locker, and drive mode details for this ${setupConfig.label}.`}
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    {setupConfig.setupSections.includes("gearing") && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-neutral-300">
                              Front sprocket
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={editVehicle.setupProfile.frontSprocket ?? ""}
                              onChange={(event) =>
                                updateSetupProfileField(
                                  "frontSprocket",
                                  event.target.value ? Number(event.target.value) : undefined
                                )
                              }
                              placeholder="Example: 13"
                              className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                            />
                          </div>

                          <div>
                            <label className="text-sm font-medium text-neutral-300">
                              Rear sprocket
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={editVehicle.setupProfile.rearSprocket ?? ""}
                              onChange={(event) =>
                                updateSetupProfileField(
                                  "rearSprocket",
                                  event.target.value ? Number(event.target.value) : undefined
                                )
                              }
                              placeholder="Example: 50"
                              className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                            />
                          </div>
                        </div>

                        {(editVehicle.setupProfile.frontSprocket ||
                          editVehicle.setupProfile.rearSprocket) && (
                          <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                            <p className="text-xs uppercase tracking-wide text-neutral-500">
                              Current gearing
                            </p>

                            <p className="mt-2 text-lg font-semibold text-white">
                              {editVehicle.setupProfile.frontSprocket ?? "-"} /{" "}
                              {editVehicle.setupProfile.rearSprocket ?? "-"}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {setupConfig.setupSections.includes("drivetrain") && (
                      <>
                        <div>
                          <label className="text-sm font-medium text-neutral-300">
                            Drivetrain setup
                          </label>

                          <select
                            value={editVehicle.setupProfile.drivetrainSetup ?? ""}
                            onChange={(event) =>
                              updateSetupProfileField("drivetrainSetup", event.target.value)
                            }
                            className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                          >
                            <option value="">Select drivetrain setup</option>
                            {setupConfig.drivetrainOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-neutral-300">
                            Lockers / drive mode
                          </label>

                          <select
                            value={editVehicle.setupProfile.lockers ?? ""}
                            onChange={(event) =>
                              updateSetupProfileField("lockers", event.target.value)
                            }
                            className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                          >
                            <option value="">Select locker or drive mode</option>
                            {setupConfig.lockerOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Notes
                      </label>

                      <textarea
                        value={editVehicle.setupProfile.gearingNotes ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("gearingNotes", event.target.value)
                        }
                        rows={3}
                        placeholder={
                          setupConfig.setupSections.includes("gearing")
                            ? "Example: 13/50 works well for technical climbs but revs high on open roads."
                            : "Example: Low range with rear locker for rocky trails."
                        }
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/*Navigation*/}
              {setupConfig.setupSections.includes("navigation") && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                  <div>
                    <h3 className="mt-1 text-base font-semibold text-orange-400">
                      Navigation
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      Add navigation, mapping, and route-following setup for this{" "}
                      {setupConfig.label}.
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Navigation setup
                      </label>

                      <select
                        value={editVehicle.setupProfile.navigationSetup ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("navigationSetup", event.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                      >
                        <option value="">Select navigation setup</option>
                        {setupConfig.navigationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Navigation notes
                      </label>

                      <textarea
                        value={editVehicle.setupProfile.electronicsNotes ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("electronicsNotes", event.target.value)
                        }
                        rows={3}
                        placeholder="Example: Phone mount with offline maps, Garmin GPS, or tablet running route tracking."
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/*Lighting*/}
              {setupConfig.setupSections.includes("lighting") && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                  <div>
                    <h3 className="mt-1 text-base font-semibold text-orange-400">
                      Lighting
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      Add lighting, visibility, and night-riding setup for this{" "}
                      {setupConfig.label}.
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Lighting setup
                      </label>

                      <select
                        value={editVehicle.setupProfile.lightingSetup ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("lightingSetup", event.target.value)
                        }
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                      >
                        <option value="">Select lighting setup</option>
                        {setupConfig.lightingOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Lighting notes
                      </label>

                      <textarea
                        value={editVehicle.setupProfile.lightingNotes ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("lightingNotes", event.target.value)
                        }
                        rows={3}
                        placeholder="Example: LED headlight, roof light bar, rear work light, or night trail setup."
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/*Tools and spares*/}
              {setupConfig.setupSections.includes("tools") && (
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                      Setup Profile
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-white">
                      Tools / Spares
                    </h3>

                    <p className="mt-1 text-sm text-neutral-400">
                      Select tools and spares carried with this {setupConfig.label}.
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {setupConfig.toolsAndSparesOptions.map((option) => {
                        const selectedTools = editVehicle.setupProfile.toolsAndSpares ?? [];
                        const isSelected = selectedTools.includes(option);

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              const nextTools = isSelected
                                ? selectedTools.filter((tool) => tool !== option)
                                : [...selectedTools, option];

                              updateSetupProfileField("toolsAndSpares", nextTools);
                            }}
                            className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition ${
                              isSelected
                                ? "border-orange-500/40 bg-orange-500/15 text-orange-400"
                                : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-neutral-300">
                        Tools / spares notes
                      </label>

                      <textarea
                        value={editVehicle.setupProfile.toolsAndSparesNotes ?? ""}
                        onChange={(event) =>
                          updateSetupProfileField("toolsAndSparesNotes", event.target.value)
                        }
                        rows={3}
                        placeholder="Example: Carrying tyre levers, plug kit, compressor, spare belt, or recovery tools."
                        className="mt-1 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 rounded-xl border border-neutral-700 px-4 py-3 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveVehicleEdits}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}