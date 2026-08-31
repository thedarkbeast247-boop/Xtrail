import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Clock,
  LockKeyhole,
  Map,
  Route,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { useUserAccess } from "../context/UserAccessContext";
import {
  FREE_PLAN_RIDE_HISTORY_LIMIT,
  getFreePlanItemAccess,
} from "../lib/accessControl";
import {
  formatRideDuration,
  getRideStats,
  type SavedRide,
} from "../utils/rideStats";

export function RideHistory() {
  const [savedRides, setSavedRides] = useState<SavedRide[]>([]);

  const { currentUserAccess } = useUserAccess();

  useEffect(() => {
    const storedRides = localStorage.getItem("xtrail-saved-rides");

    if (!storedRides) {
      setSavedRides([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedRides) as SavedRide[];

      parsed.sort(
        (a, b) =>
          new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
      );

      setSavedRides(parsed);
    } catch (error) {
      console.error("Failed to load saved rides:", error);
      setSavedRides([]);
    }
  }, []);

  const rideFallbackIds = [...savedRides]
    .sort(
      (a, b) =>
        new Date(b.finishedAt).getTime() -
        new Date(a.finishedAt).getTime()
    )
    .map((ride) => ride.id);

  const rideItemAccess = getFreePlanItemAccess({
    user: currentUserAccess,
    availableIds: savedRides.map((ride) => ride.id),
    selectionKey: "rideIds",
    limit: FREE_PLAN_RIDE_HISTORY_LIMIT,
    fallbackIds: rideFallbackIds,
  });

  const unlockedRides = savedRides.filter((ride) =>
    rideItemAccess.isItemUnlocked(ride.id)
  );

  const unlockedRideCount = unlockedRides.length;
  const lockedRideCount = rideItemAccess.lockedIds.length;

  const rideStats = getRideStats(unlockedRides);

  const formatRideDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-ZA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatRideTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");
    const ss = String(seconds).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="min-h-full bg-neutral-950">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/profile">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-xl font-semibold text-white">Ride History</h1>
            <p className="text-sm text-neutral-400">
              View your saved XTrail rides.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 pt-5 pb-32">
        {savedRides.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-center">
            <h2 className="text-base font-medium text-white">
              No rides saved yet
            </h2>

            <p className="mt-2 text-sm text-neutral-400">
              Start a trail, complete your ride, and save it to build your ride
              history.
            </p>

            <Link to="/" className="mt-4 inline-block">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Explore Trails
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-neutral-500">
                    Ride history access
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {rideItemAccess.unlimited
                      ? "Unlimited"
                      : `${unlockedRideCount}/${FREE_PLAN_RIDE_HISTORY_LIMIT}`}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    {rideItemAccess.unlimited
                      ? "Unlimited ride history"
                      : "Free Plan"}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    rideItemAccess.unlimited
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-orange-500/10 text-orange-400"
                  }`}
                >
                  {rideItemAccess.unlimited ? (
                    <Route className="h-5 w-5" />
                  ) : (
                    <LockKeyhole className="h-5 w-5" />
                  )}
                </div>
              </div>

              {!rideItemAccess.unlimited && (
                <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-3">
                  {lockedRideCount > 0 ? (
                    <>
                      <p className="text-xs font-semibold text-orange-400">
                        {lockedRideCount} ride
                        {lockedRideCount === 1 ? "" : "s"} locked
                      </p>

                      <p className="mt-1 text-xs leading-5 text-neutral-400">
                        Your older rides remain safely stored. Subscribe to the
                        Pro Plan to unlock your complete ride history.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-orange-400">
                        Free ride-history limit
                      </p>

                      <p className="mt-1 text-xs leading-5 text-neutral-400">
                        Free Plan users can keep up to{" "}
                        {FREE_PLAN_RIDE_HISTORY_LIMIT} rides unlocked.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <p className="text-xs text-neutral-400">Unlocked rides</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {rideStats.totalRides}
                </p>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <p className="text-xs text-neutral-400">Unlocked distance</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {rideStats.totalDistanceKm.toFixed(1)} km
                </p>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <p className="text-xs text-neutral-400">Unlocked ride time</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatRideDuration(rideStats.totalDurationSeconds)}
                </p>
              </div>

              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <p className="text-xs text-neutral-400">Avg speed</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {rideStats.averageRideSpeedKmh.toFixed(1)} km/h
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {savedRides.map((ride) => {
                const isLocked = !rideItemAccess.isItemUnlocked(ride.id);

                return (
                  <div
                    key={ride.id}
                    className={`relative overflow-hidden rounded-2xl border bg-neutral-900 transition ${
                      isLocked
                        ? "min-h-[250px] border-orange-500/20"
                        : "border-neutral-800 active:scale-[0.98]"
                    }`}
                  >
                    {!isLocked && (
                      <Link
                        to={`/ride-history/${ride.id}`}
                        aria-label={`Open ride on ${ride.trailName}`}
                        className="absolute inset-0 z-20"
                      />
                    )}

                    {isLocked && (
                      <div className="absolute inset-0 z-30 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur-[1px]">
                        <div className="w-full max-w-[280px] text-center">
                          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15">
                            <LockKeyhole className="h-5 w-5 text-orange-400" />
                          </div>

                          <h2 className="mt-3 text-sm font-semibold text-white">
                            Pro Plan required
                          </h2>

                          <p className="mt-1 text-xs leading-5 text-neutral-400">
                            This ride remains safely stored, but it is not one of
                            your unlocked Free Plan selections.
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <Link to="/account/plan-review">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full border-neutral-700 text-xs text-neutral-300"
                              >
                                Plan Review
                              </Button>
                            </Link>

                            <Link to="/subscription">
                              <Button
                                type="button"
                                size="sm"
                                className="w-full bg-orange-600 text-xs hover:bg-orange-700"
                              >
                                Subscribe Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      className={`relative z-10 p-4 ${
                        isLocked
                          ? "pointer-events-none select-none blur-[2px] opacity-35"
                          : ""
                      }`}
                      aria-hidden={isLocked}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
                          {ride.trailImageUrl ? (
                            <img
                              src={ride.trailImageUrl}
                              alt={ride.trailName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h2 className="truncate text-base font-semibold text-white">
                                {ride.trailName}
                              </h2>

                              <p className="mt-1 text-xs text-neutral-400">
                                {formatRideDate(ride.finishedAt)}
                              </p>
                            </div>

                            <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-medium text-emerald-400">
                              Saved
                            </span>
                          </div>

                          <p className="mt-2 text-xs text-neutral-400">
                            Vehicle:{" "}
                            <span className="text-neutral-200">
                              {ride.vehicleName ?? "Vehicle not linked"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                        <div className="rounded-xl bg-neutral-950 p-3">
                          <div className="flex items-center gap-1 text-neutral-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Time</span>
                          </div>

                          <p className="mt-2 font-semibold text-white">
                            {formatRideTime(ride.durationSeconds)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-neutral-950 p-3">
                          <div className="flex items-center gap-1 text-neutral-500">
                            <Route className="h-3.5 w-3.5" />
                            <span>Distance</span>
                          </div>

                          <p className="mt-2 font-semibold text-white">
                            {ride.distanceKm.toFixed(2)} km
                          </p>
                        </div>

                        <div className="rounded-xl bg-neutral-950 p-3">
                          <div className="flex items-center gap-1 text-neutral-500">
                            <Map className="h-3.5 w-3.5" />
                            <span>Avg Speed</span>
                          </div>

                          <p className="mt-2 font-semibold text-white">
                            {ride.avgSpeedKmh.toFixed(1)} km/h
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}