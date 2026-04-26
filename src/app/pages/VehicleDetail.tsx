import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Gauge, Route, Timer } from "lucide-react";
import { useVehicles } from "../context/VehicleContext";
import type { SavedRide } from "../utils/rideStats";
import { getMaintenanceStatus } from "../lib/maintenance";

export function VehicleDetail() {
  const { vehicleId } = useParams();
  const { vehicles } = useVehicles();
  const [savedRides, setSavedRides] = useState<SavedRide[]>([]);

  const vehicle = vehicles.find((v: any) => v.id === vehicleId);

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

  // Vehicle ride stats Start
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

  const maintenanceStatus = getMaintenanceStatus(vehicle);
  // Vehicle ride stats End

  if (!vehicle) {
    return (
      <div className="p-4 text-white">
        Vehicle not found
      </div>
    );
  }

  return (

    <div className="min-h-full bg-neutral-950 text-white">
      
      {/* Hero */}
      <div className="relative">
        {/* Banner */}
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

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-neutral-950" />

        {/* Back button */}
        <div className="absolute left-4 top-4">
          <Link to="/garage">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
        </div>

        {/* Vehicle overlay content */}
        <div className="absolute -bottom-14 left-0 w-full px-4 pb-6">
          <div className="flex items-end gap-4">
            
            {/* Image + Name */}
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

              <div className="min-w-0 bottom-1 pb-1">
                <h1 className="text-2xl font-bold text-white">{vehicle.name}</h1>
                <p className="mt-2 text-sm text-neutral-300">
                  {vehicle.model} • {vehicle.year}
                </p>
              </div>
            </div>

            {/* Badge */}
            <div className="flex-shrink-0 pb-1">
              <span className="inline-flex rounded-full bg-red-600 px-3 py-1 text-xs font-medium capitalize text-white">
                {vehicle.type.replace("-", " ")}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 px-4 pb-4 pt-14">
        <div className="grid grid-cols-3 gap-3">
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
              <span className="text-xs font-medium">Hours</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">
              {totalRideHours.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Maintenance Status */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Maintenance Status</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Current service condition for this vehicle
              </p>
            </div>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                maintenanceStatus.status === "good"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : maintenanceStatus.status === "due-soon"
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                  : "bg-red-500/15 text-red-400 border border-red-500/20"
              }`}
            >
              {maintenanceStatus.status === "good"
                ? "Good"
                : maintenanceStatus.status === "due-soon"
                ? "Due Soon"
                : "Overdue"}
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-neutral-950 px-4 py-4">
            <p className="text-sm text-neutral-300">{maintenanceStatus.message}</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h2 className="text-base font-semibold text-white">Vehicle Info</h2>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-400">Type</p>
              <p className="mt-2 text-sm font-medium capitalize text-white">
                {vehicle.type.replace("-", " ")}
              </p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-400">Year</p>
              <p className="mt-2 text-sm font-medium text-white">{vehicle.year}</p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-400">Hours</p>
              <p className="mt-2 text-sm font-medium text-white">{vehicle.hours}</p>
            </div>

            <div className="rounded-xl bg-neutral-950 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-neutral-400">Mileage</p>
              <p className="mt-2 text-sm font-medium text-white">{vehicle.mileage}</p>
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

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Ride History</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Saved rides linked to this vehicle
              </p>
            </div>
          </div>

          {vehicleRides.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 px-4 py-5 text-center">
              <p className="text-sm font-medium text-white">
                No rides yet
              </p>
              <p className="mt-2 text-sm text-neutral-400">
                Start and save a ride with this vehicle to build its ride history.
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
                        {new Date(ride.finishedAt).toLocaleDateString()}
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
    </div>
  );
}