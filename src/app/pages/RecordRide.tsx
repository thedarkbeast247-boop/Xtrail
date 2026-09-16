import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  Gauge,
  Locate,
  Mountain,
  Pause,
  Play,
  Route,
  StopCircle,
  TrendingUp,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { mockTrails } from "../data/mockData";
import { useNotification } from "../context/NotificationContext";
import { useVehicles } from "../context/VehicleContext";
import { useUserAccess } from "../context/UserAccessContext";
import { useRideRecording } from "../context/RideRecordingContext";

import {
  FREE_PLAN_SAVED_TRAILS_LIMIT,
  FREE_PLAN_VEHICLE_LIMIT,
  getFreePlanItemAccess,
  getSavedTrailsAccess,
} from "../lib/accessControl";

import type { CompletedTrail } from "../types/completedTrail";
import type { SavedTrail } from "../types/savedTrail";
import type { SavedRide } from "../utils/rideStats";
import type { RidePathPoint } from "../context/RideRecordingContext";

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

function formatFinishedAt(isoDate: string) {
  return new Date(isoDate).toLocaleString("en-ZA");
}

function buildRoutePathData(points: RidePathPoint[]) {
  if (points.length < 2) {
    return undefined;
  }

  return points
    .map((point, index) => {
      const x = Number((point.x * 4).toFixed(1));
      const y = Number((point.y * 1.2).toFixed(1));

      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
}

export function RecordRide() {
  const { showNotification } = useNotification();

  const [searchParams] = useSearchParams();

  const requestedTrailId = searchParams.get("trailId");

  const {
    session,
    isRecording,
    isPaused,
    isStopped,
    hasRideSession,
    averageSpeedKmh,
    startRide,
    pauseRide,
    resumeRide,
    stopRide,
    resetRide,
  } = useRideRecording();

  /*
   * If there is already an active/stopped ride session,
   * the session's trail is the source of truth.
   *
   * This allows the user to leave /record, navigate
   * elsewhere, then return using the normal Record tab
   * without losing the trail that was being recorded.
   */
  const effectiveTrailId =
    hasRideSession
      ? session.trailId
      : requestedTrailId ?? undefined;

  const selectedTrail = useMemo(() => {
    if (!effectiveTrailId) {
      return null;
    }

    return (
      mockTrails.find(
        (trail) => trail.id === effectiveTrailId
      ) ?? null
    );
  }, [effectiveTrailId]);

  const invalidTrailRequested =
    !hasRideSession &&
    Boolean(requestedTrailId) &&
    !selectedTrail;

  const {
    vehicles,
    activeVehicle: storedActiveVehicle,
    setActiveVehicleId,
  } = useVehicles();

  const { currentUserAccess } = useUserAccess();

  /*
   * Keep the user's current active Garage vehicle at
   * the front of the fallback list.
   */
  const vehicleFallbackIds = useMemo(() => {
    return [...vehicles]
      .sort((a, b) => {
        if (a.id === storedActiveVehicle?.id) {
          return -1;
        }

        if (b.id === storedActiveVehicle?.id) {
          return 1;
        }

        return (
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
        );
      })
      .map((vehicle) => vehicle.id);
  }, [vehicles, storedActiveVehicle?.id]);

  const vehicleItemAccess = getFreePlanItemAccess({
    user: currentUserAccess,
    availableIds: vehicles.map((vehicle) => vehicle.id),
    selectionKey: "vehicleIds",
    limit: FREE_PLAN_VEHICLE_LIMIT,
    fallbackIds: vehicleFallbackIds,
  });

  const unlockedVehicles = vehicles.filter((vehicle) =>
    vehicleItemAccess.isItemUnlocked(vehicle.id)
  );

  const lockedVehicleCount =
    vehicles.length - unlockedVehicles.length;

  const [selectedVehicleId, setSelectedVehicleId] =
    useState("");

  /*
   * Vehicle selected while preparing a NEW ride.
   */
  const selectedVehicle =
    unlockedVehicles.find(
      (vehicle) => vehicle.id === selectedVehicleId
    ) ?? null;

  /*
   * Vehicle linked to an EXISTING ride session.
   *
   * We intentionally look through all Garage vehicles
   * here rather than only unlocked vehicles. If the user
   * started a ride and their access state changes while
   * it is running, the ride should not suddenly lose its
   * vehicle association.
   */
  const rideVehicle =
    session.vehicleId
      ? vehicles.find(
          (vehicle) =>
            vehicle.id === session.vehicleId
        ) ?? null
      : selectedVehicle;

  const rideInProgress =
    isRecording || isPaused;

  const [showStopConfirmation, setShowStopConfirmation] =
    useState(false);

  const [wasPausedBeforeStop, setWasPausedBeforeStop] =
    useState(false);

  const isSavingRideRef = useRef(false);

  /*
   * Keep the local dropdown selection synchronized with
   * either the active ride session or the Garage.
   */
  useEffect(() => {
    if (hasRideSession) {
      setSelectedVehicleId(
        session.vehicleId ?? ""
      );

      return;
    }

    const selectedVehicleIsStillAvailable =
      unlockedVehicles.some(
        (vehicle) =>
          vehicle.id === selectedVehicleId
      );

    if (selectedVehicleIsStillAvailable) {
      return;
    }

    const preferredVehicle =
      unlockedVehicles.find(
        (vehicle) =>
          vehicle.id === storedActiveVehicle?.id
      ) ??
      unlockedVehicles[0] ??
      null;

    setSelectedVehicleId(
      preferredVehicle?.id ?? ""
    );
  }, [
    hasRideSession,
    session.vehicleId,
    vehicles,
    currentUserAccess,
    storedActiveVehicle?.id,
    selectedVehicleId,
  ]);

  const handleVehicleChange = (
    vehicleId: string
  ) => {
    if (hasRideSession) {
      return;
    }

    setSelectedVehicleId(vehicleId);

    setActiveVehicleId(vehicleId);
  };

  const handleStart = () => {
    if (!selectedVehicle) {
      showNotification({
        title: "Vehicle needed",
        message:
          "Select an available vehicle before starting your ride.",
        variant: "warning",
      });

      return;
    }

    startRide({
      vehicleId: selectedVehicle.id,
      trailId: selectedTrail?.id,
    });

    setActiveVehicleId(
      selectedVehicle.id
    );

    showNotification({
      title: "Ride started",
      message: selectedTrail
        ? `Recording ${selectedTrail.name}.`
        : "Your unplanned ride is now recording.",
      variant: "success",
    });
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeRide();

      return;
    }

    pauseRide();
  };

  const handleRequestStop = () => {
    setWasPausedBeforeStop(isPaused);

    /*
     * Pause first so the timer/distance do not continue
     * changing while the confirmation modal is open.
     */
    if (isRecording) {
      pauseRide();
    }

    setShowStopConfirmation(true);
  };

  const handleCancelStop = () => {
    setShowStopConfirmation(false);

    /*
     * If the ride was already paused before Stop was
     * pressed, leave it paused.
     *
     * If it was actively recording, resume it.
     */
    if (!wasPausedBeforeStop) {
      resumeRide();
    }
  };

  const handleConfirmStop = () => {
    stopRide();

    setShowStopConfirmation(false);
  };

  const handleDiscardRide = () => {
    resetRide();

    setShowStopConfirmation(false);

    showNotification({
      title: "Ride discarded",
      message:
        "The ride was not added to Ride History.",
      variant: "info",
    });
  };

  const handleSaveRide = () => {
    if (!isStopped || isSavingRideRef.current) {
      return;
    }

    if (!rideVehicle) {
      showNotification({
        title: "Vehicle unavailable",
        message:
          "The vehicle used for this ride could not be found in your Garage.",
        variant: "error",
      });

      return;
    }

    isSavingRideRef.current = true;

    const finishedAt =
      session.finishedAt ??
      new Date().toISOString();

    const rideId =
      crypto.randomUUID();

    const savedRide: SavedRide = {
      id: rideId,

      trailId: selectedTrail?.id,

      trailName:
        selectedTrail?.name ??
        "Unplanned Ride",

      trailImageUrl:
        selectedTrail?.imageUrl,

      durationSeconds:
        session.durationSeconds,

      distanceKm: Number(
        session.distanceKm.toFixed(2)
      ),

      avgSpeedKmh: Number(
        averageSpeedKmh.toFixed(1)
      ),

      finishedAt,

      vehicleId:
        rideVehicle.id,

      vehicleName:
        rideVehicle.name,

      vehicleType:
        rideVehicle.type,

      coverImageUrl:
        selectedTrail?.imageUrl ??
        rideVehicle.bannerImage ??
        rideVehicle.image,

      galleryImages: [],

      routePathData:
        buildRoutePathData(
          session.pathPoints
        ),
    };

    let savedTrailResult:
      | "not_applicable"
      | "saved"
      | "already_saved"
      | "limit_reached" = "not_applicable";

    try {
      /*
       * Save the ride into Ride History.
       */
      const storedRides =
        localStorage.getItem(
          "xtrail-saved-rides"
        );

      const parsedRides: SavedRide[] =
        storedRides
          ? JSON.parse(storedRides)
          : [];

      localStorage.setItem(
        "xtrail-saved-rides",
        JSON.stringify([
          savedRide,
          ...parsedRides,
        ])
      );

      /*
       * If this was a known XTrail trail,
       * create a Completed Trail record too.
       */
      if (savedRide.trailId) {
        const storedCompletedTrails =
          localStorage.getItem(
            "xtrail-completed-trails"
          );

        const parsedCompletedTrails: CompletedTrail[] =
          storedCompletedTrails
            ? JSON.parse(
                storedCompletedTrails
              )
            : [];

        const completedTrail: CompletedTrail = {
          id: crypto.randomUUID(),

          trailId:
            savedRide.trailId,

          trailName:
            savedRide.trailName,

          completedAt:
            savedRide.finishedAt,

          rideId:
            savedRide.id,
        };

        localStorage.setItem(
          "xtrail-completed-trails",
          JSON.stringify([
            completedTrail,
            ...parsedCompletedTrails,
          ])
        );
      }

      /*
      * If this ride is linked to an XTrail trail,
      * keep the trail in Saved Trails as well.
      *
      * Do not create duplicates, and do not bypass
      * the Free Plan saved-trail limit.
      */
      if (savedRide.trailId && selectedTrail) {
        const storedSavedTrails =
          localStorage.getItem("xtrail-saved-trails");

        const parsedSavedTrails: SavedTrail[] =
          storedSavedTrails
            ? JSON.parse(storedSavedTrails)
            : [];

        const trailAlreadySaved =
          parsedSavedTrails.some(
            (savedTrail) =>
              savedTrail.trailId === savedRide.trailId
          );

        if (trailAlreadySaved) {
          savedTrailResult = "already_saved";
        } else {
          const uniqueSavedTrailCount = new Set(
            parsedSavedTrails.map(
              (savedTrail) => savedTrail.trailId
            )
          ).size;

          const savedTrailsAccess =
            getSavedTrailsAccess(
              currentUserAccess,
              uniqueSavedTrailCount
            );

          if (savedTrailsAccess.isLimitReached) {
            savedTrailResult = "limit_reached";
          } else {
            const savedTrail: SavedTrail = {
              id: crypto.randomUUID(),
              trailId: selectedTrail.id,
              trailName: selectedTrail.name,
              trailImageUrl: selectedTrail.imageUrl,
              location: selectedTrail.location,
              province: selectedTrail.province,
              country: selectedTrail.country,
              difficulty: selectedTrail.difficulty,
              trailType: selectedTrail.trailType,
              savedAt: savedRide.finishedAt,
            };

            localStorage.setItem(
              "xtrail-saved-trails",
              JSON.stringify([
                savedTrail,
                ...parsedSavedTrails,
              ])
            );

            savedTrailResult = "saved";
          }
        }
      }

      let rideSavedMessage =
        "Your ride was saved to Ride History.";

      if (savedRide.trailId) {
        if (savedTrailResult === "saved") {
          rideSavedMessage =
            `${savedRide.trailName} was added to Ride History, Completed Trails, and Saved Trails.`;
        } else if (savedTrailResult === "already_saved") {
          rideSavedMessage =
            `${savedRide.trailName} was added to Ride History and Completed Trails. It is already in Saved Trails.`;
        } else if (savedTrailResult === "limit_reached") {
          rideSavedMessage =
            `${savedRide.trailName} was added to Ride History and Completed Trails. Your Free Plan Saved Trails limit of ${FREE_PLAN_SAVED_TRAILS_LIMIT} is already full.`;
        } else {
          rideSavedMessage =
            `${savedRide.trailName} was added to Ride History and Completed Trails.`;
        }
      }

      showNotification({
        title: "Ride saved",
        message: rideSavedMessage,
        variant: "success",
      });

      /*
       * Only reset the global ride session after
       * saving succeeded.
       */
      resetRide();
      isSavingRideRef.current = false;
    } catch (error) {
      isSavingRideRef.current = false;

      console.error(
        "Failed to save ride:",
        error
      );

      showNotification({
        title: "Save failed",
        message:
          "XTrail could not save this ride. Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-gradient-to-b from-emerald-950 to-neutral-950 px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Record Ride
            </h1>

            <p className="mt-1 text-sm text-neutral-400">
              Track your off-road adventure
            </p>
          </div>

          <Link to="/ride-history">
            <Button
              variant="outline"
              size="sm"
              className="border-neutral-700 text-neutral-300"
            >
              <Clock className="mr-2 h-4 w-4" />
              History
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Existing Ride Session */}
        {rideInProgress && (
          <div className="mb-6 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                  isPaused
                    ? "bg-yellow-400"
                    : "bg-emerald-400 animate-pulse"
                }`}
              />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">
                  Active Ride Session
                </p>

                <p className="mt-1 text-sm text-neutral-300">
                  This ride remains active while you
                  navigate around XTrail.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Linked Trail */}
        {selectedTrail && (
          <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                <Route className="h-5 w-5 text-emerald-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  Linked Trail
                </p>

                <h2 className="mt-1 truncate font-semibold text-white">
                  {selectedTrail.name}
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  {selectedTrail.location}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-neutral-900/80 px-2.5 py-1 text-neutral-300">
                    {selectedTrail.distance} km
                  </span>

                  <span className="rounded-full bg-neutral-900/80 px-2.5 py-1 text-neutral-300">
                    {selectedTrail.difficulty}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invalid requested trail */}
        {invalidTrailRequested && (
          <div className="mb-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />

              <div>
                <p className="font-semibold text-yellow-300">
                  Trail not found
                </p>

                <p className="mt-1 text-sm text-neutral-400">
                  The requested trail could not be found.
                  You can still record this as an
                  unplanned ride.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Unplanned ride */}
        {!effectiveTrailId && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-start gap-3">
              <Route className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-500" />

              <div>
                <p className="font-semibold text-white">
                  Unplanned Ride
                </p>

                <p className="mt-1 text-sm text-neutral-400">
                  No trail is linked to this ride.
                  You can start recording normally.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Selection */}
        {!hasRideSession && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-white">
                Vehicle
              </label>

              <Link to="/garage">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-emerald-500"
                >
                  <Car className="mr-1.5 h-4 w-4" />
                  Garage
                </Button>
              </Link>
            </div>

            {unlockedVehicles.length > 0 ? (
              <Select
                value={selectedVehicleId}
                onValueChange={handleVehicleChange}
              >
                <SelectTrigger className="border-neutral-800 bg-neutral-900 text-white">
                  <SelectValue placeholder="Choose your vehicle" />
                </SelectTrigger>

                <SelectContent className="border-neutral-800 bg-neutral-900">
                  {unlockedVehicles.map(
                    (vehicle) => {
                      const vehicleColor =
                        vehicle.color ??
                        "#10b981";

                      return (
                        <SelectItem
                          key={vehicle.id}
                          value={vehicle.id}
                          className="text-white"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 flex-shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  vehicleColor,
                              }}
                            />

                            <div className="flex min-w-0 flex-col">
                              <span className="truncate">
                                {vehicle.name}
                              </span>

                              <span className="truncate text-xs text-neutral-500">
                                {vehicle.year}{" "}
                                {vehicle.brand}{" "}
                                {vehicle.model}
                              </span>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    }
                  )}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-400" />

                  <div>
                    <p className="font-semibold text-yellow-300">
                      No vehicle available
                    </p>

                    <p className="mt-1 text-sm text-neutral-400">
                      Add a vehicle in your Garage before
                      recording a ride.
                    </p>

                    <Link
                      to="/garage"
                      className="mt-3 inline-block"
                    >
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        Open Garage
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {!vehicleItemAccess.unlimited &&
              lockedVehicleCount > 0 && (
                <p className="mt-2 text-xs text-orange-400">
                  {unlockedVehicles.length} of{" "}
                  {vehicles.length} vehicles are
                  available on your Free Plan.
                </p>
              )}
          </div>
        )}

        {/* Ride Vehicle */}
        {hasRideSession && rideVehicle && (
          <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Ride Vehicle
            </p>

            <div className="mt-2 flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    rideVehicle.color ??
                    "#10b981",
                }}
              />

              <div>
                <p className="font-semibold text-white">
                  {rideVehicle.name}
                </p>

                <p className="text-xs text-neutral-500">
                  {rideVehicle.year}{" "}
                  {rideVehicle.brand}{" "}
                  {rideVehicle.model}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Missing ride vehicle */}
        {hasRideSession &&
          session.vehicleId &&
          !rideVehicle && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />

                <div>
                  <p className="font-semibold text-red-300">
                    Ride vehicle unavailable
                  </p>

                  <p className="mt-1 text-sm text-neutral-400">
                    The vehicle used to start this ride
                    can no longer be found in your Garage.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Live Map */}
        <div className="relative mb-6 h-80 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          <img
            src="https://images.unsplash.com/photo-1669092557499-093cb88dc249?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZXJpYWwlMjBmb3Jlc3QlMjB0ZXJyYWluJTIwM0QlMjB0b3BvZ3JhcGhpYyUyMHNhdGVsbGl0ZXxlbnwxfHx8fDE3NzQ3MDU5Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Terrain map"
            className="h-full w-full object-cover opacity-40"
          />

          {/* Recorded Path */}
          {session.pathPoints.length > 1 && (
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="ride-path-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor="#10b981"
                    stopOpacity="0.4"
                  />

                  <stop
                    offset="100%"
                    stopColor="#10b981"
                    stopOpacity="1"
                  />
                </linearGradient>
              </defs>

              <polyline
                points={session.pathPoints
                  .map(
                    (point) =>
                      `${point.x},${point.y}`
                  )
                  .join(" ")}
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
              />

              <polyline
                points={session.pathPoints
                  .map(
                    (point) =>
                      `${point.x},${point.y}`
                  )
                  .join(" ")}
                fill="none"
                stroke="url(#ride-path-gradient)"
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {/* Current GPS position */}
          {rideInProgress &&
            session.pathPoints.length > 0 && (
              <div
                className="pointer-events-none absolute z-10 -ml-2.5 -mt-2.5 h-5 w-5 transition-all duration-1000"
                style={{
                  left: `${
                    session.pathPoints[
                      session.pathPoints.length - 1
                    ]?.x
                  }%`,

                  top: `${
                    session.pathPoints[
                      session.pathPoints.length - 1
                    ]?.y
                  }%`,
                }}
              >
                <div
                  className={`absolute inset-0 rounded-full bg-emerald-500 opacity-20 ${
                    isRecording
                      ? "animate-ping"
                      : ""
                  }`}
                />

                <div className="absolute inset-0 rounded-full border-4 border-emerald-400 opacity-60" />

                <div className="absolute inset-1.5 rounded-full bg-emerald-500 shadow-lg" />
              </div>
            )}

          {/* Top Status */}
          <div className="absolute left-3 right-3 top-3 z-20 flex items-center justify-between">
            {isRecording ? (
              <Badge className="flex items-center gap-1.5 bg-red-600 px-3 py-1.5 text-white animate-pulse">
                <div className="h-2 w-2 rounded-full bg-white" />
                Recording
              </Badge>
            ) : isPaused ? (
              <Badge className="flex items-center gap-1.5 bg-yellow-600 px-3 py-1.5 text-white">
                <div className="h-2 w-2 rounded-full bg-white" />
                Paused
              </Badge>
            ) : isStopped ? (
              <Badge className="flex items-center gap-1.5 bg-emerald-700 px-3 py-1.5 text-white">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Ride Complete
              </Badge>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/90 px-3 py-2 backdrop-blur-sm">
                <Locate className="h-4 w-4 text-neutral-400" />

                <span className="text-sm text-neutral-400">
                  Ready to record
                </span>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900/90 px-3 py-1.5 backdrop-blur-sm">
              <Mountain className="h-4 w-4 text-emerald-500" />

              <span className="text-sm text-white">
                {session.elevationGainM.toFixed(0)} m
              </span>
            </div>
          </div>

          {/* Distance Overlay */}
          {hasRideSession && (
            <div className="absolute bottom-3 left-3 rounded-lg border border-neutral-700 bg-neutral-900/90 px-3 py-2 backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-500">
                {session.distanceKm.toFixed(2)}
              </div>

              <div className="text-xs text-neutral-400">
                km
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" />

              <span className="text-sm text-neutral-400">
                Duration
              </span>
            </div>

            <div className="text-2xl text-white">
              {formatTime(
                session.durationSeconds
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />

              <span className="text-sm text-neutral-400">
                Distance
              </span>
            </div>

            <div className="text-2xl text-white">
              {session.distanceKm.toFixed(2)}
            </div>

            <div className="text-xs text-neutral-500">
              km
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-emerald-500" />

              <span className="text-sm text-neutral-400">
                Current Speed
              </span>
            </div>

            <div className="text-2xl text-white">
              {session.currentSpeedKmh.toFixed(1)}
            </div>

            <div className="text-xs text-neutral-500">
              km/h
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-emerald-500" />

              <span className="text-sm text-neutral-400">
                Avg Speed
              </span>
            </div>

            <div className="text-2xl text-white">
              {averageSpeedKmh.toFixed(1)}
            </div>

            <div className="text-xs text-neutral-500">
              km/h
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-sm text-neutral-400">
                Elevation Gain
              </span>

              <div className="mt-1 text-xl text-white">
                {session.elevationGainM.toFixed(0)} m
              </div>
            </div>

            {rideVehicle && (
              <div
                className="flex items-center gap-2 rounded-full border-2 px-3 py-1.5"
                style={{
                  borderColor:
                    rideVehicle.color ??
                    "#10b981",

                  backgroundColor: `${
                    rideVehicle.color ??
                    "#10b981"
                  }20`,
                }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      rideVehicle.color ??
                      "#10b981",
                  }}
                />

                <span className="text-sm text-white">
                  {rideVehicle.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recording Controls */}
        <div className="space-y-3">
          {!hasRideSession ? (
            <Button
              type="button"
              onClick={handleStart}
              className="h-14 w-full bg-emerald-600 text-lg hover:bg-emerald-700"
              disabled={!selectedVehicle}
            >
              <Play className="mr-2 h-6 w-6" />
              Start Recording
            </Button>
          ) : rideInProgress ? (
            <>
              <Button
                type="button"
                onClick={handlePauseResume}
                className={`h-14 w-full text-lg ${
                  isPaused
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="mr-2 h-6 w-6" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-6 w-6" />
                    Pause
                  </>
                )}
              </Button>

              <Button
                type="button"
                onClick={handleRequestStop}
                variant="outline"
                className="h-14 w-full border-red-700 text-lg text-red-500 hover:bg-red-950"
              >
                <StopCircle className="mr-2 h-6 w-6" />
                Stop Ride
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {/* Stop Confirmation */}
      {showStopConfirmation && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-5 py-8">
          <div className="w-full max-w-[340px] rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <StopCircle className="h-6 w-6 text-red-400" />
            </div>

            <h2 className="mt-4 text-center text-xl font-semibold text-white">
              Stop this ride?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-neutral-400">
              Recording will stop and you will be
              able to review the ride before saving
              it.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelStop}
                className="border-neutral-700 text-neutral-300"
              >
                Keep Riding
              </Button>

              <Button
                type="button"
                onClick={handleConfirmStop}
                className="bg-red-600 text-white hover:bg-red-500"
              >
                Stop Ride
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ride Summary */}
      {isStopped && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 px-5 py-8">
          <div className="app-scrollbar max-h-[85vh] w-full max-w-[360px] overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  Ride Complete
                </p>

                <h2 className="mt-1 text-xl font-semibold text-white">
                  {selectedTrail?.name ??
                    "Unplanned Ride"}
                </h2>
              </div>
            </div>

            <p className="mt-3 text-sm text-neutral-400">
              Finished{" "}
              {formatFinishedAt(
                session.finishedAt ??
                  new Date().toISOString()
              )}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-neutral-800/80 p-3">
                <p className="text-xs text-neutral-400">
                  Duration
                </p>

                <p className="mt-2 font-semibold text-white">
                  {formatTime(
                    session.durationSeconds
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-800/80 p-3">
                <p className="text-xs text-neutral-400">
                  Distance
                </p>

                <p className="mt-2 font-semibold text-white">
                  {session.distanceKm.toFixed(2)} km
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-800/80 p-3">
                <p className="text-xs text-neutral-400">
                  Avg Speed
                </p>

                <p className="mt-2 font-semibold text-white">
                  {averageSpeedKmh.toFixed(1)} km/h
                </p>
              </div>

              <div className="rounded-2xl bg-neutral-800/80 p-3">
                <p className="text-xs text-neutral-400">
                  Vehicle
                </p>

                <p className="mt-2 truncate font-semibold text-white">
                  {rideVehicle?.name ??
                    "Unavailable"}
                </p>
              </div>
            </div>

            {selectedTrail && (
              <div className="mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                <p className="text-xs font-semibold text-emerald-400">
                  Trail Updates
                </p>

                <p className="mt-1 text-sm text-neutral-300">
                  Saving this ride will add{" "}
                  {selectedTrail.name} to Completed Trails and
                  add it to Saved Trails if it is not already
                  saved and your plan has room.
                </p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiscardRide}
                className="border-neutral-700 text-neutral-300"
              >
                Discard
              </Button>

              <Button
                type="button"
                onClick={handleSaveRide}
                disabled={!rideVehicle}
                className="bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Save Ride
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}