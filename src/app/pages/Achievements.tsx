import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Award,
  TrendingUp,
  MapPin,
  Clock,
  Target,
  Star,
  Trophy,
  Zap,
  Lock,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { useVehicles } from "../context/VehicleContext";
import { useUserAccess } from "../context/UserAccessContext";

import {
  FREE_PLAN_VEHICLE_LIMIT,
  getFreePlanItemAccess,
} from "../lib/accessControl";

import type { SavedRide } from "../utils/rideStats";

type AchievementCategory =
  | "distance"
  | "trails"
  | "time"
  | "special";

type AchievementMetric =
  | "rides"
  | "distance"
  | "trails"
  | "hours";

type AchievementRule = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  metric: AchievementMetric;
  target: number;
};

type CalculatedAchievement =
  AchievementRule & {
    unlocked: boolean;
    unlockedDate?: string;
    currentValue: number;
  };

const achievementRules: AchievementRule[] = [
  {
    id: "first-ride",
    name: "First Ride",
    description: "Complete and save your first ride",
    icon: "Award",
    category: "special",
    metric: "rides",
    target: 1,
  },
  {
    id: "five-rides",
    name: "Getting Started",
    description: "Complete 5 rides",
    icon: "Zap",
    category: "special",
    metric: "rides",
    target: 5,
  },
  {
    id: "twenty-five-rides",
    name: "Regular Rider",
    description: "Complete 25 rides",
    icon: "Trophy",
    category: "special",
    metric: "rides",
    target: 25,
  },
  {
    id: "distance-80",
    name: "80 km",
    description: "Ride 80 km total",
    icon: "TrendingUp",
    category: "distance",
    metric: "distance",
    target: 80,
  },
  {
    id: "distance-160",
    name: "160 km",
    description: "Ride 160 km total",
    icon: "TrendingUp",
    category: "distance",
    metric: "distance",
    target: 160,
  },
  {
    id: "distance-400",
    name: "400 km",
    description: "Ride 400 km total",
    icon: "Target",
    category: "distance",
    metric: "distance",
    target: 400,
  },
  {
    id: "distance-1000",
    name: "1,000 km",
    description: "Ride 1,000 km total",
    icon: "Trophy",
    category: "distance",
    metric: "distance",
    target: 1000,
  },
  {
    id: "trail-explorer",
    name: "Trail Explorer",
    description: "Complete 5 different trails",
    icon: "MapPin",
    category: "trails",
    metric: "trails",
    target: 5,
  },
  {
    id: "trail-master",
    name: "Trail Master",
    description: "Complete 10 different trails",
    icon: "Star",
    category: "trails",
    metric: "trails",
    target: 10,
  },
  {
    id: "trail-legend",
    name: "Trail Legend",
    description: "Complete 25 different trails",
    icon: "Trophy",
    category: "trails",
    metric: "trails",
    target: 25,
  },
  {
    id: "ten-hours",
    name: "10 Hours",
    description: "Ride for 10 total hours",
    icon: "Clock",
    category: "time",
    metric: "hours",
    target: 10,
  },
  {
    id: "fifty-hours",
    name: "50 Hours",
    description: "Ride for 50 total hours",
    icon: "Clock",
    category: "time",
    metric: "hours",
    target: 50,
  },
  {
    id: "hundred-hours",
    name: "100 Hours",
    description: "Ride for 100 total hours",
    icon: "Trophy",
    category: "time",
    metric: "hours",
    target: 100,
  },
];

function getIconComponent(iconName: string) {
  const icons = {
    Award,
    TrendingUp,
    MapPin,
    Clock,
    Target,
    Star,
    Trophy,
    Zap,
  };

  return icons[
    iconName as keyof typeof icons
  ] ?? Award;
}

function getCategoryColor(
  category: AchievementCategory
) {
  switch (category) {
    case "distance":
      return "#ef4444";

    case "trails":
      return "#10b981";

    case "time":
      return "#f59e0b";

    case "special":
      return "#8b5cf6";

    default:
      return "#6b7280";
  }
}

function getMetricValue(
  metric: AchievementMetric,
  ridesCompleted: number,
  distanceKm: number,
  uniqueTrailCount: number,
  totalHours: number
) {
  if (metric === "rides") {
    return ridesCompleted;
  }

  if (metric === "distance") {
    return distanceKm;
  }

  if (metric === "trails") {
    return uniqueTrailCount;
  }

  return totalHours;
}

function findAchievementUnlockDate(
  rule: AchievementRule,
  rides: SavedRide[]
) {
  const chronologicalRides = [...rides].sort(
    (a, b) =>
      new Date(a.finishedAt).getTime() -
      new Date(b.finishedAt).getTime()
  );

  let rideCount = 0;
  let distanceKm = 0;
  let totalHours = 0;

  const completedTrailIds =
    new Set<string>();

  for (const ride of chronologicalRides) {
    rideCount += 1;
    distanceKm += ride.distanceKm;
    totalHours +=
      ride.durationSeconds / 3600;

    if (ride.trailId) {
      completedTrailIds.add(ride.trailId);
    }

    const currentValue = getMetricValue(
      rule.metric,
      rideCount,
      distanceKm,
      completedTrailIds.size,
      totalHours
    );

    if (currentValue >= rule.target) {
      return ride.finishedAt;
    }
  }

  return undefined;
}

export function Achievements() {
  const {
    vehicles,
    activeVehicle: storedActiveVehicle,
  } = useVehicles();

  const { currentUserAccess } =
    useUserAccess();

  const [savedRides, setSavedRides] =
    useState<SavedRide[]>([]);

  const [
    selectedVehicleId,
    setSelectedVehicleId,
  ] = useState("");

  const vehicleFallbackIds = [
    ...vehicles,
  ]
    .sort((a, b) => {
      if (
        a.id ===
        storedActiveVehicle?.id
      ) {
        return -1;
      }

      if (
        b.id ===
        storedActiveVehicle?.id
      ) {
        return 1;
      }

      return (
        new Date(
          b.updatedAt
        ).getTime() -
        new Date(
          a.updatedAt
        ).getTime()
      );
    })
    .map((vehicle) => vehicle.id);

  const vehicleItemAccess =
    getFreePlanItemAccess({
      user: currentUserAccess,
      availableIds: vehicles.map(
        (vehicle) => vehicle.id
      ),
      selectionKey: "vehicleIds",
      limit: FREE_PLAN_VEHICLE_LIMIT,
      fallbackIds:
        vehicleFallbackIds,
    });

  const unlockedVehicles =
    vehicles.filter((vehicle) =>
      vehicleItemAccess.isItemUnlocked(
        vehicle.id
      )
    );

  useEffect(() => {
    const storedRides =
      localStorage.getItem(
        "xtrail-saved-rides"
      );

    if (!storedRides) {
      setSavedRides([]);
      return;
    }

    try {
      const parsed = JSON.parse(
        storedRides
      ) as SavedRide[];

      setSavedRides(
        Array.isArray(parsed)
          ? parsed
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load saved rides:",
        error
      );

      setSavedRides([]);
    }
  }, []);

  useEffect(() => {
    if (
      unlockedVehicles.length === 0
    ) {
      setSelectedVehicleId("");
      return;
    }

    const selectedStillExists =
      unlockedVehicles.some(
        (vehicle) =>
          vehicle.id ===
          selectedVehicleId
      );

    if (selectedStillExists) {
      return;
    }

    const preferredVehicle =
      unlockedVehicles.find(
        (vehicle) =>
          vehicle.id ===
          storedActiveVehicle?.id
      ) ?? unlockedVehicles[0];

    setSelectedVehicleId(
      preferredVehicle.id
    );
  }, [
    selectedVehicleId,
    storedActiveVehicle?.id,
    unlockedVehicles,
  ]);

  const activeVehicle =
    unlockedVehicles.find(
      (vehicle) =>
        vehicle.id ===
        selectedVehicleId
    ) ?? null;

  const vehicleRides = useMemo(() => {
    if (!activeVehicle) {
      return [];
    }

    return savedRides.filter(
      (ride) =>
        ride.vehicleId ===
        activeVehicle.id
    );
  }, [
    activeVehicle,
    savedRides,
  ]);

  const achievements =
    useMemo<
      CalculatedAchievement[]
    >(() => {
      const ridesCompleted =
        vehicleRides.length;

      const totalDistanceKm =
        vehicleRides.reduce(
          (total, ride) =>
            total + ride.distanceKm,
          0
        );

      const totalHours =
        vehicleRides.reduce(
          (total, ride) =>
            total +
            ride.durationSeconds /
              3600,
          0
        );

      const uniqueTrailCount =
        new Set(
          vehicleRides
            .map(
              (ride) =>
                ride.trailId
            )
            .filter(
              (
                trailId
              ): trailId is string =>
                Boolean(trailId)
            )
        ).size;

      return achievementRules.map(
        (rule) => {
          const currentValue =
            getMetricValue(
              rule.metric,
              ridesCompleted,
              totalDistanceKm,
              uniqueTrailCount,
              totalHours
            );

          const unlocked =
            currentValue >=
            rule.target;

          return {
            ...rule,
            unlocked,
            currentValue,
            unlockedDate: unlocked
              ? findAchievementUnlockDate(
                  rule,
                  vehicleRides
                )
              : undefined,
          };
        }
      );
    }, [vehicleRides]);

  const unlockedCount =
    achievements.filter(
      (achievement) =>
        achievement.unlocked
    ).length;

  const totalCount =
    achievements.length;

  const progressPercent =
    totalCount > 0
      ? Math.round(
          (unlockedCount /
            totalCount) *
            100
        )
      : 0;

  if (
    unlockedVehicles.length === 0
  ) {
    return (
      <div className="min-h-full bg-neutral-950">
        <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6">
          <h1 className="mb-1 text-2xl text-white">
            Achievements
          </h1>

          <p className="text-sm text-neutral-400">
            Unlock badges & milestones
          </p>
        </div>

        <div className="px-4 py-5">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
            <Award className="mx-auto h-10 w-10 text-neutral-600" />

            <h2 className="mt-4 font-semibold text-white">
              Add a vehicle first
            </h2>

            <p className="mt-2 text-sm text-neutral-400">
              Achievements are tracked
              separately for each vehicle
              in your Garage.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6">
        <h1 className="mb-1 text-2xl text-white">
          Achievements
        </h1>

        <p className="text-sm text-neutral-400">
          Unlock badges & milestones from
          your real rides
        </p>
      </div>

      <div className="space-y-6 px-4 py-5">
        {/* Vehicle Selector */}
        <div>
          <label className="mb-1.5 block text-xs text-neutral-400">
            Select Vehicle
          </label>

          <Select
            value={selectedVehicleId}
            onValueChange={
              setSelectedVehicleId
            }
          >
            <SelectTrigger className="border-neutral-800 bg-neutral-900 text-white">
              <SelectValue />
            </SelectTrigger>

            <SelectContent className="border-neutral-800 bg-neutral-900">
              {unlockedVehicles.map(
                (vehicle) => (
                  <SelectItem
                    key={vehicle.id}
                    value={vehicle.id}
                    className="text-white"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor:
                            vehicle.color ||
                            "#ef4444",
                        }}
                      />

                      {vehicle.name}
                    </div>
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Progress Overview */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="mb-1 text-2xl text-white">
                {unlockedCount}/
                {totalCount}
              </div>

              <div className="text-sm text-neutral-400">
                Achievements Unlocked
              </div>
            </div>

            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${
                  activeVehicle?.color ??
                  "#ef4444"
                }20`,
                border: `3px solid ${
                  activeVehicle?.color ??
                  "#ef4444"
                }`,
              }}
            >
              <span
                className="text-xl"
                style={{
                  color:
                    activeVehicle?.color ??
                    "#ef4444",
                }}
              >
                {progressPercent}%
              </span>
            </div>
          </div>

          <Progress
            value={progressPercent}
            className="h-2"
          />
        </div>

        {vehicleRides.length === 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-sm font-medium text-white">
              No saved rides for this
              vehicle yet
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Record and save a ride using{" "}
              {activeVehicle?.name} to start
              unlocking achievements.
            </p>
          </div>
        )}

        {/* Achievement Categories */}
        <div>
          <h2 className="mb-3 text-white">
            All Achievements
          </h2>

          <div className="space-y-3">
            {achievements.map(
              (achievement) => {
                const Icon =
                  getIconComponent(
                    achievement.icon
                  );

                const isLocked =
                  !achievement.unlocked;

                const categoryColor =
                  getCategoryColor(
                    achievement.category
                  );

                const progressValue =
                  Math.min(
                    100,
                    Math.round(
                      (achievement.currentValue /
                        achievement.target) *
                        100
                    )
                  );

                return (
                  <div
                    key={achievement.id}
                    className={`rounded-lg border bg-neutral-900 p-4 ${
                      isLocked
                        ? "border-neutral-800"
                        : "border-neutral-700"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Badge Icon */}
                      <div
                        className={`relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl ${
                          isLocked
                            ? "bg-neutral-800"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            isLocked
                              ? undefined
                              : `${categoryColor}20`,
                        }}
                      >
                        {isLocked ? (
                          <Lock className="h-7 w-7 text-neutral-600" />
                        ) : (
                          <Icon
                            className="h-7 w-7"
                            style={{
                              color:
                                categoryColor,
                            }}
                          />
                        )}

                        {!isLocked && (
                          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                            <span className="text-xs text-white">
                              ✓
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`mb-1 ${
                            isLocked
                              ? "text-neutral-300"
                              : "text-white"
                          }`}
                        >
                          {achievement.name}
                        </h3>

                        <p className="text-sm text-neutral-400">
                          {
                            achievement.description
                          }
                        </p>

                        {!achievement.unlocked && (
                          <div className="mt-3">
                            <div className="mb-1.5 flex items-center justify-between text-xs">
                              <span className="text-neutral-500">
                                Progress
                              </span>

                              <span className="text-neutral-300">
                                {progressValue}%
                              </span>
                            </div>

                            <Progress
                              value={
                                progressValue
                              }
                              className="h-1.5"
                            />
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                            style={{
                              borderColor:
                                categoryColor,
                              color:
                                categoryColor,
                            }}
                          >
                            {
                              achievement.category
                            }
                          </Badge>

                          {achievement.unlocked &&
                            achievement.unlockedDate && (
                              <span className="text-xs text-neutral-500">
                                Unlocked{" "}
                                {new Date(
                                  achievement.unlockedDate
                                ).toLocaleDateString(
                                  "en-ZA",
                                  {
                                    day: "numeric",
                                    month:
                                      "short",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Category Summary */}
        <div>
          <h2 className="mb-3 text-white">
            By Category
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                "distance",
                "trails",
                "time",
                "special",
              ] as AchievementCategory[]
            ).map((category) => {
              const categoryAchievements =
                achievements.filter(
                  (achievement) =>
                    achievement.category ===
                    category
                );

              const unlockedInCategory =
                categoryAchievements.filter(
                  (achievement) =>
                    achievement.unlocked
                ).length;

              const categoryColor =
                getCategoryColor(
                  category
                );

              return (
                <div
                  key={category}
                  className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: `${categoryColor}20`,
                    }}
                  >
                    <Trophy
                      className="h-5 w-5"
                      style={{
                        color:
                          categoryColor,
                      }}
                    />
                  </div>

                  <div className="mb-1 capitalize text-white">
                    {category}
                  </div>

                  <div className="text-sm text-neutral-400">
                    {unlockedInCategory}/
                    {
                      categoryAchievements.length
                    }{" "}
                    unlocked
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}