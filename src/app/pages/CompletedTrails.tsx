import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  Mountain,
} from "lucide-react";

import { LockedFeatureCard } from "../components/access/LockedFeatureCard";
import { Button } from "../components/ui/button";
import { useUserAccess } from "../context/UserAccessContext";
import { useVehicles } from "../context/VehicleContext";
import { mockTrails } from "../data/mockData";
import {
  FREE_PLAN_COMPLETED_TRAILS_LIMIT,
  getCompletedTrailsAccess,
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

export function CompletedTrails() {
  const [completedTrails, setCompletedTrails] = useState<CompletedTrail[]>([]);
  const [savedRides, setSavedRides] = useState<SavedRide[]>([]);

  const [searchParams] = useSearchParams();
  const vehicleIdFromUrl = searchParams.get("vehicleId");

  const { vehicles } = useVehicles();
  const { currentUserAccess } = useUserAccess();

  const selectedVehicle =
    vehicles.find((vehicle) => vehicle.id === vehicleIdFromUrl) ?? null;

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

  const groupedCompletedTrails = useMemo<CompletedTrailGroup[]>(() => {
    const groupedMap = new Map<string, CompletedTrail[]>();

    for (const completedTrail of filteredCompletedTrails) {
      const existing = groupedMap.get(completedTrail.trailId) ?? [];
      existing.push(completedTrail);
      groupedMap.set(completedTrail.trailId, existing);
    }

    return Array.from(groupedMap.entries())
      .map(([trailId, records]) => {
        const sortedRecords = [...records].sort(
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
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
  }, [filteredCompletedTrails]);

  const completedTrailsAccess = getCompletedTrailsAccess(
    currentUserAccess,
    groupedCompletedTrails.length
  );

  const visibleCompletedTrails = completedTrailsAccess.unlimited
    ? groupedCompletedTrails
    : groupedCompletedTrails.slice(0, completedTrailsAccess.visibleLimit);

  const hiddenCompletedTrailCount = completedTrailsAccess.hiddenCount;

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

      <div className="space-y-4 px-4 py-5">
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
                    {completedTrailsAccess.completedTrailLimitLabel}
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    {completedTrailsAccess.unlimited
                      ? "Unlimited completed trails"
                      : "Free Plan"}
                  </p>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    completedTrailsAccess.unlimited
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-orange-500/10 text-orange-400"
                  }`}
                >
                  {completedTrailsAccess.unlimited ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <LockKeyhole className="h-5 w-5" />
                  )}
                </div>
              </div>

              {!completedTrailsAccess.unlimited && (
                <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2">
                  <p className="text-xs font-semibold text-orange-400">
                    Free completed trail limit
                  </p>

                  <p className="mt-1 text-xs text-neutral-400">
                    Free users can view up to {FREE_PLAN_COMPLETED_TRAILS_LIMIT}{" "}
                    completed trails. Subscribe to the Pro Plan to unlock your
                    full completed trail history.
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {visibleCompletedTrails.map((completedTrail) => (
                <Link
                  key={completedTrail.trailId}
                  to={`/trail/${completedTrail.trailId}`}
                  className="block rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-neutral-700"
                >
                  <div className="flex gap-3 p-3">
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
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
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}

              {hiddenCompletedTrailCount > 0 && (
                <LockedFeatureCard
                  compact
                  title="Pro Plan required"
                  message={`You have ${hiddenCompletedTrailCount} more completed trail${
                    hiddenCompletedTrailCount === 1 ? "" : "s"
                  } waiting in your history. Subscribe to the Pro Plan to unlock unlimited completed trails.`}
                  ctaLabel="Subscribe Now"
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}