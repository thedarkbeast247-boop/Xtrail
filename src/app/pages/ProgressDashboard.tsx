import {
  useEffect,
  useState,
} from "react";
import {
  TrendingUp,
  Award,
  Target,
  Clock,
  MapPin,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { AccessGate } from "../components/access/AccessGate";
import { useVehicles } from "../context/VehicleContext";
import {
  getRideStats,
  type SavedRide,
} from "../utils/rideStats";

type TimeRange = "week" | "month" | "year";

type ActivityBucket = {
  key: string;
  label: string;
  rides: number;
  hours: number;
  distance: number;
};

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getRangeStart(
  range: TimeRange,
  now: Date
) {
  if (range === "week") {
    const start = startOfDay(now);
    start.setDate(start.getDate() - 6);
    return start;
  }

  if (range === "month") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
  }

  return new Date(now.getFullYear(), 0, 1);
}

function isRideInsideRange(
  ride: SavedRide,
  range: TimeRange,
  now: Date
) {
  const rideDate = new Date(ride.finishedAt);

  if (Number.isNaN(rideDate.getTime())) {
    return false;
  }

  const rangeStart = getRangeStart(range, now);

  return (
    rideDate.getTime() >= rangeStart.getTime() &&
    rideDate.getTime() <= now.getTime()
  );
}

function buildActivityData(
  rides: SavedRide[],
  range: TimeRange,
  now: Date
): ActivityBucket[] {
  if (range === "week") {
    const buckets: ActivityBucket[] = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = startOfDay(now);
      date.setDate(date.getDate() - offset);

      buckets.push({
        key: getLocalDateKey(date),
        label: date.toLocaleDateString("en-ZA", {
          weekday: "short",
        }),
        rides: 0,
        hours: 0,
        distance: 0,
      });
    }

    const bucketMap = new Map(
      buckets.map((bucket) => [
        bucket.key,
        bucket,
      ])
    );

    rides.forEach((ride) => {
      const rideDate = new Date(ride.finishedAt);

      if (Number.isNaN(rideDate.getTime())) {
        return;
      }

      const bucket = bucketMap.get(
        getLocalDateKey(rideDate)
      );

      if (!bucket) {
        return;
      }

      bucket.rides += 1;
      bucket.hours += ride.durationSeconds / 3600;
      bucket.distance += ride.distanceKm;
    });

    return buckets;
  }

  if (range === "month") {
    const year = now.getFullYear();
    const month = now.getMonth();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const numberOfBuckets = Math.ceil(
      daysInMonth / 7
    );

    const buckets: ActivityBucket[] =
      Array.from(
        { length: numberOfBuckets },
        (_, index) => {
          const startDay = index * 7 + 1;
          const endDay = Math.min(
            startDay + 6,
            daysInMonth
          );

          return {
            key: `week-${index}`,
            label: `${startDay}-${endDay}`,
            rides: 0,
            hours: 0,
            distance: 0,
          };
        }
      );

    rides.forEach((ride) => {
      const rideDate = new Date(ride.finishedAt);

      if (
        Number.isNaN(rideDate.getTime()) ||
        rideDate.getFullYear() !== year ||
        rideDate.getMonth() !== month
      ) {
        return;
      }

      const bucketIndex = Math.floor(
        (rideDate.getDate() - 1) / 7
      );

      const bucket = buckets[bucketIndex];

      if (!bucket) {
        return;
      }

      bucket.rides += 1;
      bucket.hours += ride.durationSeconds / 3600;
      bucket.distance += ride.distanceKm;
    });

    return buckets;
  }

  const year = now.getFullYear();

  const buckets: ActivityBucket[] =
    Array.from({ length: 12 }, (_, month) => {
      const date = new Date(year, month, 1);

      return {
        key: `month-${month}`,
        label: date.toLocaleDateString(
          "en-ZA",
          {
            month: "short",
          }
        ),
        rides: 0,
        hours: 0,
        distance: 0,
      };
    });

  rides.forEach((ride) => {
    const rideDate = new Date(ride.finishedAt);

    if (
      Number.isNaN(rideDate.getTime()) ||
      rideDate.getFullYear() !== year
    ) {
      return;
    }

    const bucket = buckets[rideDate.getMonth()];

    if (!bucket) {
      return;
    }

    bucket.rides += 1;
    bucket.hours += ride.durationSeconds / 3600;
    bucket.distance += ride.distanceKm;
  });

  return buckets;
}

function getLongestRide(rides: SavedRide[]) {
  if (rides.length === 0) {
    return null;
  }

  return rides.reduce((longest, ride) =>
    ride.distanceKm > longest.distanceKm
      ? ride
      : longest
  );
}

function getMostActiveDay(rides: SavedRide[]) {
  const rideCounts = new Map<
    string,
    {
      date: Date;
      count: number;
    }
  >();

  rides.forEach((ride) => {
    const rideDate = new Date(ride.finishedAt);

    if (Number.isNaN(rideDate.getTime())) {
      return;
    }

    const key = getLocalDateKey(rideDate);
    const existing = rideCounts.get(key);

    if (existing) {
      existing.count += 1;
      return;
    }

    rideCounts.set(key, {
      date: rideDate,
      count: 1,
    });
  });

  const entries = Array.from(
    rideCounts.values()
  );

  if (entries.length === 0) {
    return null;
  }

  return entries.reduce((mostActive, current) =>
    current.count > mostActive.count
      ? current
      : mostActive
  );
}

function getLongestStreak(rides: SavedRide[]) {
  const uniqueDays = Array.from(
    new Set(
      rides
        .map((ride) => {
          const date = new Date(
            ride.finishedAt
          );

          if (
            Number.isNaN(date.getTime())
          ) {
            return null;
          }

          return startOfDay(date).getTime();
        })
        .filter(
          (
            value
          ): value is number =>
            value !== null
        )
    )
  ).sort((a, b) => a - b);

  if (uniqueDays.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (
    let index = 1;
    index < uniqueDays.length;
    index += 1
  ) {
    const difference =
      uniqueDays[index] -
      uniqueDays[index - 1];

    const oneDay =
      24 * 60 * 60 * 1000;

    if (difference === oneDay) {
      current += 1;
      longest = Math.max(
        longest,
        current
      );
    } else {
      current = 1;
    }
  }

  return longest;
}

function getRangeLabel(range: TimeRange) {
  if (range === "week") {
    return "Last 7 Days";
  }

  if (range === "month") {
    return "This Month";
  }

  return "This Year";
}

function getActivityTitle(range: TimeRange) {
  if (range === "week") {
    return "Daily Activity";
  }

  if (range === "month") {
    return "Weekly Activity";
  }

  return "Monthly Activity";
}

export function ProgressDashboard() {
  const { vehicles } = useVehicles();

  const [savedRides, setSavedRides] =
    useState<SavedRide[]>([]);

  const [
    selectedVehicle,
    setSelectedVehicle,
  ] = useState<string>("all");

  const [timeRange, setTimeRange] =
    useState<TimeRange>("week");

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
        "Failed to load ride history:",
        error
      );

      setSavedRides([]);
    }
  }, []);

  useEffect(() => {
    if (
      selectedVehicle !== "all" &&
      !vehicles.some(
        (vehicle) =>
          vehicle.id === selectedVehicle
      )
    ) {
      setSelectedVehicle("all");
    }
  }, [selectedVehicle, vehicles]);

  const now = new Date();

  const vehicleFilteredRides =
    selectedVehicle === "all"
      ? savedRides
      : savedRides.filter(
          (ride) =>
            ride.vehicleId ===
            selectedVehicle
        );

  const filteredRides =
    vehicleFilteredRides.filter((ride) =>
      isRideInsideRange(
        ride,
        timeRange,
        now
      )
    );

  const rideStats =
    getRideStats(filteredRides);

  const uniqueCompletedTrails =
    new Set(
      filteredRides
        .map((ride) => ride.trailId)
        .filter(
          (
            trailId
          ): trailId is string =>
            Boolean(trailId)
        )
    ).size;

  const activityData =
    buildActivityData(
      filteredRides,
      timeRange,
      now
    );

  const longestRide =
    getLongestRide(filteredRides);

  const mostActiveDay =
    getMostActiveDay(filteredRides);

  const longestStreak =
    getLongestStreak(filteredRides);

  const totalHours =
    rideStats.totalDurationSeconds /
    3600;

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: any) => {
    if (
      !active ||
      !payload ||
      !payload.length
    ) {
      return null;
    }

    return (
      <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-3 shadow-lg">
        <p className="mb-1 text-sm text-white">
          {label}
        </p>

        {payload.map(
          (
            entry: any,
            index: number
          ) => {
            let value = entry.value;

            if (
              entry.dataKey ===
              "distance"
            ) {
              value = `${Number(
                entry.value
              ).toFixed(1)} km`;
            }

            if (
              entry.dataKey === "hours"
            ) {
              value = `${Number(
                entry.value
              ).toFixed(1)} h`;
            }

            return (
              <p
                key={index}
                className="text-xs text-neutral-400"
              >
                {entry.name}:{" "}
                <span className="text-white">
                  {value}
                </span>
              </p>
            );
          }
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6">
        <h1 className="mb-1 text-2xl text-white">
          Progress Dashboard
        </h1>

        <p className="text-sm text-neutral-400">
          Track your real XTrail riding
          activity
        </p>
      </div>

      <div className="space-y-6 px-4 py-5">
        <AccessGate
          feature="advanced_analytics"
          fallbackTitle="Pro Plan required"
          fallbackMessage="Subscribe to the Pro Plan to unlock your Progress Dashboard, ride trends, vehicle comparisons, and long-term stats."
          fallbackCtaLabel="Subscribe Now"
        >
          {/* Vehicle & Time Range Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs text-neutral-400">
                Vehicle
              </label>

              <Select
                value={selectedVehicle}
                onValueChange={
                  setSelectedVehicle
                }
              >
                <SelectTrigger className="border-neutral-800 bg-neutral-900 text-white">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="border-neutral-800 bg-neutral-900">
                  <SelectItem
                    value="all"
                    className="text-white"
                  >
                    All Vehicles
                  </SelectItem>

                  {vehicles.map(
                    (vehicle) => (
                      <SelectItem
                        key={vehicle.id}
                        value={vehicle.id}
                        className="text-white"
                      >
                        {vehicle.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-neutral-400">
                Time Range
              </label>

              <Select
                value={timeRange}
                onValueChange={(value) =>
                  setTimeRange(
                    value as TimeRange
                  )
                }
              >
                <SelectTrigger className="border-neutral-800 bg-neutral-900 text-white">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent className="border-neutral-800 bg-neutral-900">
                  <SelectItem
                    value="week"
                    className="text-white"
                  >
                    Last 7 Days
                  </SelectItem>

                  <SelectItem
                    value="month"
                    className="text-white"
                  >
                    This Month
                  </SelectItem>

                  <SelectItem
                    value="year"
                    className="text-white"
                  >
                    This Year
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Filter Summary */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
            <p className="text-xs text-neutral-500">
              Showing
            </p>

            <p className="mt-1 text-sm text-neutral-200">
              {selectedVehicle ===
              "all"
                ? "All Vehicles"
                : vehicles.find(
                    (vehicle) =>
                      vehicle.id ===
                      selectedVehicle
                  )?.name ??
                  "Selected Vehicle"}
              {" • "}
              {getRangeLabel(
                timeRange
              )}
            </p>
          </div>

          {filteredRides.length ===
            0 && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-center">
              <p className="font-medium text-white">
                No rides in this period
              </p>

              <p className="mt-2 text-sm text-neutral-400">
                Complete and save rides to
                start building your real
                XTrail analytics.
              </p>
            </div>
          )}

          {/* Overview */}
          <div>
            <h2 className="mb-3 text-white">
              Overview
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-500" />

                  <span className="text-sm text-neutral-400">
                    Total Distance
                  </span>
                </div>

                <div className="text-2xl text-white">
                  {rideStats.totalDistanceKm.toFixed(
                    1
                  )}
                </div>

                <div className="text-xs text-neutral-500">
                  km
                </div>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />

                  <span className="text-sm text-neutral-400">
                    Riding Time
                  </span>
                </div>

                <div className="text-2xl text-white">
                  {totalHours.toFixed(1)}
                </div>

                <div className="text-xs text-neutral-500">
                  hours
                </div>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-500" />

                  <span className="text-sm text-neutral-400">
                    Trails
                  </span>
                </div>

                <div className="text-2xl text-white">
                  {uniqueCompletedTrails}
                </div>

                <div className="text-xs text-neutral-500">
                  unique completed
                </div>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />

                  <span className="text-sm text-neutral-400">
                    Rides
                  </span>
                </div>

                <div className="text-2xl text-white">
                  {rideStats.totalRides}
                </div>

                <div className="text-xs text-neutral-500">
                  saved rides
                </div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div>
            <h2 className="mb-3 text-white">
              {getActivityTitle(
                timeRange
              )}
            </h2>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <div className="h-56">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={activityData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#404040"
                      opacity={0.3}
                    />

                    <XAxis
                      dataKey="label"
                      stroke="#737373"
                      tick={{
                        fill: "#a3a3a3",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      allowDecimals={false}
                      stroke="#737373"
                      tick={{
                        fill: "#a3a3a3",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      content={
                        <CustomTooltip />
                      }
                    />

                    <Bar
                      dataKey="rides"
                      name="Rides"
                      fill="#ef4444"
                      radius={[
                        4,
                        4,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Distance Progress */}
          <div>
            <h2 className="mb-3 text-white">
              Distance Progress
            </h2>

            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <div className="h-56">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={activityData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#404040"
                      opacity={0.3}
                    />

                    <XAxis
                      dataKey="label"
                      stroke="#737373"
                      tick={{
                        fill: "#a3a3a3",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      stroke="#737373"
                      tick={{
                        fill: "#a3a3a3",
                        fontSize: 11,
                      }}
                    />

                    <Tooltip
                      content={
                        <CustomTooltip />
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="distance"
                      name="Distance"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{
                        fill: "#ef4444",
                        r: 4,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Personal Bests */}
          <div>
            <h2 className="mb-3 text-white">
              Personal Bests
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20">
                    <Award className="h-5 w-5 text-amber-500" />
                  </div>

                  <div>
                    <div className="text-white">
                      Longest Ride
                    </div>

                    <div className="text-sm text-neutral-500">
                      Distance record
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl text-white">
                    {longestRide
                      ? longestRide.distanceKm.toFixed(
                          1
                        )
                      : "0.0"}
                  </div>

                  <div className="text-xs text-neutral-500">
                    km
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>

                  <div>
                    <div className="text-white">
                      Most Active Day
                    </div>

                    <div className="text-sm text-neutral-500">
                      {mostActiveDay
                        ? mostActiveDay.date.toLocaleDateString(
                            "en-ZA",
                            {
                              day: "numeric",
                              month:
                                "short",
                            }
                          )
                        : "No ride data"}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl text-white">
                    {mostActiveDay?.count ??
                      0}
                  </div>

                  <div className="text-xs text-neutral-500">
                    rides
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                    <Target className="h-5 w-5 text-emerald-500" />
                  </div>

                  <div>
                    <div className="text-white">
                      Longest Streak
                    </div>

                    <div className="text-sm text-neutral-500">
                      Consecutive riding
                      days
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl text-white">
                    {longestStreak}
                  </div>

                  <div className="text-xs text-neutral-500">
                    days
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Comparison */}
          {selectedVehicle ===
            "all" && (
            <div>
              <h2 className="mb-3 text-white">
                Vehicle Comparison
              </h2>

              {vehicles.length === 0 ? (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                  Add vehicles to your
                  Garage to compare their
                  ride activity.
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicles.map(
                    (vehicle) => {
                      const vehicleRides =
                        savedRides.filter(
                          (ride) =>
                            ride.vehicleId ===
                              vehicle.id &&
                            isRideInsideRange(
                              ride,
                              timeRange,
                              now
                            )
                        );

                      const vehicleStats =
                        getRideStats(
                          vehicleRides
                        );

                      const vehicleHours =
                        vehicleStats.totalDurationSeconds /
                        3600;

                      const vehicleColor =
                        vehicle.color ||
                        "#ef4444";

                      return (
                        <div
                          key={vehicle.id}
                          className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <div
                                className="h-3 w-3 flex-shrink-0 rounded-full"
                                style={{
                                  backgroundColor:
                                    vehicleColor,
                                }}
                              />

                              <span className="truncate text-white">
                                {
                                  vehicle.name
                                }
                              </span>
                            </div>

                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor:
                                  vehicleColor,
                                color:
                                  vehicleColor,
                              }}
                            >
                              {vehicle.type}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <div className="text-lg text-white">
                                {
                                  vehicleStats.totalRides
                                }
                              </div>

                              <div className="text-xs text-neutral-500">
                                rides
                              </div>
                            </div>

                            <div>
                              <div className="text-lg text-white">
                                {vehicleHours.toFixed(
                                  1
                                )}
                              </div>

                              <div className="text-xs text-neutral-500">
                                hours
                              </div>
                            </div>

                            <div>
                              <div className="text-lg text-white">
                                {vehicleStats.totalDistanceKm.toFixed(
                                  1
                                )}
                              </div>

                              <div className="text-xs text-neutral-500">
                                km
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}
        </AccessGate>
      </div>
    </div>
  );
}