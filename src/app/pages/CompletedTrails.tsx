import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  Mountain,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { useUserAccess } from "../context/UserAccessContext";
import { useVehicles } from "../context/VehicleContext";
import { mockTrails } from "../data/mockData";
import {
  FREE_PLAN_COMPLETED_TRAILS_LIMIT,
  FREE_PLAN_VEHICLE_LIMIT,
  getFreePlanItemAccess,
} from "../lib/accessControl";
import type { CompletedTrail } from "../types/completedTrail";
import type { SavedRide } from "../utils/rideStats";

type CompletedTrailGroup = {
  trailId: string;
  trailName: string;
  completedAt: string;
  completionCount: number;
  latestRideId: string;
  trail: (typeof mockTrails)[number] | null;
};

function groupCompletedTrailRecords(
  records: CompletedTrail[]
): CompletedTrailGroup[] {
  const groupedMap = new Map<string, CompletedTrail[]>();

  for (const completedTrail of records) {
    const existingRecords =
      groupedMap.get(completedTrail.trailId) ?? [];

    existingRecords.push(completedTrail);
    groupedMap.set(completedTrail.trailId, existingRecords);
  }

  return Array.from(groupedMap.entries())
    .map(([trailId, trailRecords]) => {
      const sortedRecords = [...trailRecords].sort(
        (a, b) =>
          new Date(b.completedAt).getTime() -
          new Date(a.completedAt).getTime()
      );

      const latestRecord = sortedRecords[0];

      const matchedTrail =
        mockTrails.find((trail) => trail.id === trailId) ?? null;

      return {
        trailId,
        trailName: latestRecord.trailName,
        completedAt: latestRecord.completedAt,
        completionCount: sortedRecords.length,
        latestRideId: latestRecord.rideId,
        trail: matchedTrail,
      };
    })
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() -
        new Date(a.completedAt).getTime()
    );
}

export function CompletedTrails() {
  const [completedTrails, setCompletedTrails] = useState<CompletedTrail[]>([]);
  const [savedRides, setSavedRides] = useState<SavedRide[]>([]);

  const [searchParams] = useSearchParams();
  const vehicleIdFromUrl = searchParams.get("vehicleId");

  const { vehicles, activeVehicle } = useVehicles();
  const { currentUserAccess } = useUserAccess();

  const selectedVehicle =
    vehicles.find((vehicle) => vehicle.id === vehicleIdFromUrl) ?? null;

    const vehicleFallbackIds = [...vehicles]
      .sort((a, b) => {
        if (a.id === activeVehicle?.id) return -1;
        if (b.id === activeVehicle?.id) return 1;

        return (
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
        );
      })
      .map((vehicle) => vehicle.id);

    const vehicleItemAccess = getFreePlanItemAccess({
      user: currentUserAccess,
      availableIds: vehicles.map((vehicle) => vehicle.id),
      selectionKey: "vehicleIds",
      limit: FREE_PLAN_VEHICLE_LIMIT,
      fallbackIds: vehicleFallbackIds,
    });

    const isVehicleFilterLocked =
      selectedVehicle !== null &&
      !vehicleItemAccess.isItemUnlocked(selectedVehicle.id);

  useEffect(() => {
    const storedCompletedTrails = localStorage.getItem("xtrail-completed-trails");

    if (!storedCompletedTrails) {
      setCompletedTrails([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedCompletedTrails) as CompletedTrail[];
      setCompletedTrails(parsed);
    } catch (error) {
      console.error("Failed to load completed trails:", error);
      setCompletedTrails([]);
    }
  }, []);

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

  const filteredCompletedTrails = useMemo(() => {
    if (!vehicleIdFromUrl) {
      return completedTrails;
    }

    const rideIdsForVehicle = new Set(
      savedRides
        .filter((ride) => ride.vehicleId === vehicleIdFromUrl)
        .map((ride) => ride.id)
    );

    return completedTrails.filter((completedTrail) =>
      rideIdsForVehicle.has(completedTrail.rideId)
    );
  }, [completedTrails, savedRides, vehicleIdFromUrl]);

  const allGroupedCompletedTrails = useMemo(
    () => groupCompletedTrailRecords(completedTrails),
    [completedTrails]
  );

  const groupedCompletedTrails = useMemo(
    () => groupCompletedTrailRecords(filteredCompletedTrails),
    [filteredCompletedTrails]
  );

  const completedTrailFallbackIds = allGroupedCompletedTrails.map(
    (completedTrail) => completedTrail.trailId
  );

  const completedTrailItemAccess = getFreePlanItemAccess({
    user: currentUserAccess,
    availableIds: allGroupedCompletedTrails.map(
      (completedTrail) => completedTrail.trailId
    ),
    selectionKey: "completedTrailIds",
    limit: FREE_PLAN_COMPLETED_TRAILS_LIMIT,
    fallbackIds: completedTrailFallbackIds,
  });

  const unlockedCompletedTrailCount = allGroupedCompletedTrails.filter(
    (completedTrail) =>
      completedTrailItemAccess.isItemUnlocked(
        completedTrail.trailId
      )
  ).length;

  const lockedCompletedTrailCount =
    groupedCompletedTrails.length -
    groupedCompletedTrails.filter((completedTrail) =>
      completedTrailItemAccess.isItemUnlocked(
        completedTrail.trailId
      )
    ).length;

    if (isVehicleFilterLocked && selectedVehicle) {
    return (
      <div className="min-h-full bg-neutral-950">
        <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/garage">
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            <div>
              <h1 className="text-xl font-semibold text-white">
                Vehicle Completed Trails
              </h1>

              <p className="text-sm text-neutral-400">
                This vehicle is currently locked.
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-5 pb-32">
          <div className="rounded-2xl border border-orange-500/20 bg-neutral-900 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/15">
              <LockKeyhole className="h-6 w-6 text-orange-400" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              Pro Plan required
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-400">
              Completed-trail history for this vehicle is locked because
              the vehicle is not one of your unlocked Free Plan selections.
            </p>

            <div className="mt-5 space-y-3">
              <Link to="/subscription" className="block">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Subscribe Now
                </Button>
              </Link>

              <Link to="/account/plan-review" className="block">
                <Button
                  variant="outline"
                  className="w-full border-neutral-700 text-neutral-300"
                >
                  View Plan Review
                </Button>
              </Link>

              <Link to="/garage" className="block">
                <Button
                  variant="ghost"
                  className="w-full text-neutral-400 hover:text-white"
                >
                  Back to Garage
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-950">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to={vehicleIdFromUrl ? `/garage/${vehicleIdFromUrl}` : "/profile"}>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-xl font-semibold text-white">
              {vehicleIdFromUrl ? "Vehicle Completed Trails" : "Completed Trails"}
            </h1>

            <p className="text-sm text-neutral-400">
              {vehicleIdFromUrl && selectedVehicle
                ? `Trails completed with ${selectedVehicle.name}.`
                : "Trails you’ve finished and ridden successfully."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-5 pb-32">
        {groupedCompletedTrails.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
              <CheckCircle2 className="h-5 w-5 text-neutral-400" />
            </div>

            <h2 className="mt-4 text-base font-medium text-white">
              {vehicleIdFromUrl
                ? "No completed trails for this vehicle yet"
                : "No completed trails yet"}
            </h2>

            <p className="mt-2 text-sm text-neutral-400">
              {vehicleIdFromUrl
                ? "Save a ride linked to this vehicle and trail to build its completed trail history."
                : "Finish a trail ride to start building your completed list."}
            </p>

            <Link to="/" className="mt-4 inline-block">
              <Button className="bg-orange-500 text-black hover:bg-orange-400">
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
                    Completed trail access
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {completedTrailItemAccess.unlimited
                      ? "Unlimited"
                      : `${unlockedCompletedTrailCount}/${FREE_PLAN_COMPLETED_TRAILS_LIMIT}`}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    {completedTrailItemAccess.unlimited
                      ? "Unlimited completed trails"
                      : "Free Plan"}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    completedTrailItemAccess.unlimited
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-orange-500/10 text-orange-400"
                  }`}
                >
                  {completedTrailItemAccess.unlimited ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <LockKeyhole className="h-5 w-5" />
                  )}
                </div>
              </div>

              {!completedTrailItemAccess.unlimited && (
                <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-3">
                  {lockedCompletedTrailCount > 0 ? (
                    <>
                      <p className="text-xs font-semibold text-orange-400">
                        {lockedCompletedTrailCount} completed trail
                        {lockedCompletedTrailCount === 1 ? "" : "s"} locked
                      </p>

                      <p className="mt-1 text-xs leading-5 text-neutral-400">
                        Your extra completed trails and repeat completions remain
                        safely stored. Subscribe to the Pro Plan to unlock your
                        full completed-trail history.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-orange-400">
                        Free completed-trail limit
                      </p>

                      <p className="mt-1 text-xs leading-5 text-neutral-400">
                        Free Plan users can keep up to{" "}
                        {FREE_PLAN_COMPLETED_TRAILS_LIMIT} unique completed trails
                        unlocked.
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {groupedCompletedTrails.map((completedTrail) => {
                  const isLocked =
                    !completedTrailItemAccess.isItemUnlocked(
                      completedTrail.trailId
                    );

                  return (
                    <div
                      key={completedTrail.trailId}
                      className={`relative overflow-hidden rounded-2xl border bg-neutral-900 transition ${
                        isLocked
                          ? "min-h-[230px] border-orange-500/20"
                          : "border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      {!isLocked && (
                        <Link
                          to={`/trail/${completedTrail.trailId}`}
                          aria-label={`Open ${completedTrail.trailName}`}
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
                              This completed trail remains safely stored, but it is
                              not one of your unlocked Free Plan selections.
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
                        className={`relative z-10 flex gap-3 p-3 ${
                          isLocked
                            ? "pointer-events-none select-none blur-[2px] opacity-35"
                            : "pointer-events-none"
                        }`}
                        aria-hidden={isLocked}
                      >
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
                          {completedTrail.trail?.imageUrl ? (
                            <img
                              src={completedTrail.trail.imageUrl}
                              alt={completedTrail.trailName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-semibold text-white">
                              {completedTrail.trailName}
                            </h2>

                            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />

                              <span className="truncate">
                                {[
                                  completedTrail.trail?.location,
                                  completedTrail.trail?.province,
                                  completedTrail.trail?.country,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-400">
                              Completed
                            </span>

                            {completedTrail.completionCount > 1 && (
                              <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200">
                                {completedTrail.completionCount} completions
                              </span>
                            )}

                            {completedTrail.trail?.difficulty && (
                              <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200">
                                {completedTrail.trail.difficulty}
                              </span>
                            )}

                            {completedTrail.trail?.trailType && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200">
                                <Mountain className="h-3 w-3" />
                                {completedTrail.trail.trailType}
                              </span>
                            )}
                          </div>

                          <p className="mt-3 text-xs text-neutral-500">
                            Last completed{" "}
                            {new Date(
                              completedTrail.completedAt
                            ).toLocaleDateString("en-ZA")}
                          </p>
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