import {
  getMaintenanceProfile,
  getTrackingModeLabel,
  getVehicleUsageUnit,
  getVehicleUsageValue,
} from "../lib/maintenance";
import {
  Settings,
  LogOut,
  Calendar,
  Crown,
  Plus,
  MapPin,
  Wrench,
  Users,
  BarChart3,
  Car,
  Clock,
  Bookmark,
  CheckCircle2,
  ShieldCheck,
  Bug,
  Database,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { useVehicles } from "../context/VehicleContext";
import { useServices } from "../context/ServiceContext";
import { calculateMaintenanceStatuses } from "../lib/maintenance";
import { useEffect, useMemo, useState } from "react";
import { getRideStats, formatRideDuration, type SavedRide } from "../utils/rideStats";
import { type CompletedTrail } from "../types/completedTrail";
import { type SavedTrail } from "../types/savedTrail";
import { useUserAccess } from "../context/UserAccessContext";
import {
  canAccessAdminArea,
  getPublicPlanLabel,
  isGlobalAdmin,
} from "../lib/accessControl";
import { useNotification } from "../context/NotificationContext";


export function Profile() {
  const { currentUserAccess, signOut } = useUserAccess();
  const { showNotification } = useNotification();
  const canOpenAdminArea = canAccessAdminArea(currentUserAccess);
  const isOwnerAccount = isGlobalAdmin(currentUserAccess);

  const { vehicles, activeVehicle, setActiveVehicleId } = useVehicles();
  const { getServicesForVehicle } = useServices();
  const [savedRides, setSavedRides] = useState<SavedRide[]>([]);
  const [completedTrails, setCompletedTrails] = useState<CompletedTrail[]>([]);
  const [savedTrails, setSavedTrails] = useState<SavedTrail[]>([]);

  useEffect(() => {
    const storedRides = localStorage.getItem("xtrail-saved-rides");

    if (!storedRides) {
      setSavedRides([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedRides) as SavedRide[];
      setSavedRides(parsed);
    } catch (error) {
      console.error("Failed to load saved rides:", error);
      setSavedRides([]);
    }
  }, []);

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
    const storedSavedTrails = localStorage.getItem("xtrail-saved-trails");

    if (!storedSavedTrails) {
      setSavedTrails([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedSavedTrails) as SavedTrail[];
      setSavedTrails(parsed);
    } catch (error) {
      console.error("Failed to load saved trails:", error);
      setSavedTrails([]);
    }
  }, []);

  const rideStats = useMemo(() => {
    return getRideStats(savedRides);
  }, [savedRides]);

  const uniqueCompletedTrailsCount = useMemo(() => {
    const uniqueTrailIds = new Set(
      completedTrails.map((trail) => trail.trailId)
    );

    return uniqueTrailIds.size;
  }, [completedTrails]);

  const maintenanceProfile = activeVehicle
  ? getMaintenanceProfile(activeVehicle.type)
  : null;

  const vehicleServices = activeVehicle
  ? getServicesForVehicle(activeVehicle.id)
  : [];

  const maintenanceStatuses = activeVehicle
  ? calculateMaintenanceStatuses(activeVehicle, vehicleServices)
  : [];

  const trackingModeLabel = activeVehicle
    ? getTrackingModeLabel(activeVehicle.type)
    : "";

  const usageUnit = activeVehicle
    ? getVehicleUsageUnit(activeVehicle.type)
    : "hours";

  const usageValue = activeVehicle
    ? getVehicleUsageValue(activeVehicle)
    : 0;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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

  const formatRideDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString();
  };

  const getVehicleInitials = (name: string) => {
    const parts = name.trim().split(" ");
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  };

  const currentPlanLabel = getPublicPlanLabel(currentUserAccess);
  const hasProAccess = currentPlanLabel === "Pro Plan";

  return (
    <div className="min-h-full bg-neutral-950">
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6 border-b border-neutral-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center text-white text-xl">
              {currentUserAccess.displayName
                .split(" ")
                .map((namePart) => namePart[0])
                .join("")}
            </div>
            <div>
              <h1 className="text-white text-xl mb-0.5">{currentUserAccess.displayName}</h1>
              <p className="text-neutral-400 text-sm">{currentUserAccess.email}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-neutral-500 text-xs">
                  Since {formatDate(currentUserAccess.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="text-neutral-400">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown
              className={`w-4 h-4 ${
                hasProAccess ? "text-amber-500" : "text-neutral-500"
              }`}
            />
            <span className="text-white text-sm">
              {currentPlanLabel}
            </span>
          </div>

          {!hasProAccess && (
            <Link to="/subscription">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 h-8 text-xs">
                Subscribe Now
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Access */}
      <div className="px-4 py-5 space-y-6">
        <div>
          <h2 className="text-white mb-3">Quick Access</h2>
          <div className="grid grid-cols-3 gap-3">
            <Link to="/service-log">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-[108px] flex flex-col items-center justify-center
                transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-95">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Wrench className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-white text-xs text-center">Service Log</div>
              </div>
            </Link>

            <Link to="/friends">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-[108px] flex flex-col items-center justify-center
                transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-95">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-white text-xs text-center">Friends</div>
              </div>
            </Link>

            <Link to="/completed-trails">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-[108px] flex flex-col items-center justify-center
                transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-95">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-white text-xs text-center">Completed Trails</div>
              </div>
            </Link>

            <Link to="/saved-trails">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-[108px] flex flex-col items-center justify-center
                transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-95">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Bookmark className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="text-white text-xs text-center">Saved Trails</div>
              </div>
            </Link>

            <Link to="/progress">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-[108px] flex flex-col items-center justify-center
                transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-95">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-white text-xs text-center">Progress</div>
              </div>
            </Link>

            <Link to="/garage">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-[108px] flex flex-col items-center justify-center
                transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-95">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Car className="w-5 h-5 text-red-500" />
                </div>
                <div className="text-white text-xs text-center">Garage</div>
              </div>
            </Link>

            <Link to="/account/plan-review">
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-[108px] flex flex-col items-center justify-center
                transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-95">
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-5 h-5 text-orange-400" />
                </div>
                <div className="text-white text-xs text-center">Plan Review</div>
              </div>
            </Link>
            {canOpenAdminArea && (
              <Link to="/admin/users">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-[108px] flex flex-col items-center justify-center
                  transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-95">
                  <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="text-white text-xs text-center">Admin</div>
                </div>
              </Link>
            )}
            {isOwnerAccount && (
              <Link to="/dev/access-tester">
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-[108px] flex flex-col items-center justify-center
                  transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-95">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Bug className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="text-white text-xs text-center">Dev Access</div>
                </div>
              </Link>
            )}
            {isOwnerAccount && (
              <Link to="/dev/data-transfer">
                <div
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 min-h-[108px] flex flex-col items-center justify-center
                    transition-all duration-200 hover:border-neutral-700 hover:bg-neutral-800/60 active:scale-95"
                >
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-white text-xs text-center">
                    Data Transfer
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white">Active Vehicle</h2>
            <Link to="/garage">
              <Button
                size="sm"
                variant="outline"
                className="border-neutral-700 text-neutral-400 h-8 text-xs gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center">
              <p className="text-neutral-400 text-sm mb-4">
                No vehicles added yet.
              </p>
              <Link to="/garage">
                <Button className="bg-red-600 hover:bg-red-700">
                  Go to Garage
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {vehicles.map((vehicle) => {
                  const isActive = activeVehicle?.id === vehicle.id;

                  return (
                    <button
                      key={vehicle.id}
                      onClick={() => setActiveVehicleId(vehicle.id)}
                                      className={`min-w-[160px] rounded-lg border p-3 text-left transition-colors ${
                                        isActive
                                          ? "border-red-500 bg-neutral-900"
                                          : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-neutral-700 bg-neutral-800 flex items-center justify-center">
                          {vehicle.image ? (
                            <img
                              src={vehicle.image}
                              alt={vehicle.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-sm">
                              {getVehicleInitials(vehicle.name)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="text-white text-sm truncate">
                            {vehicle.name}
                          </div>
                          <div className="text-neutral-500 text-xs truncate">
                            {vehicle.type}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {activeVehicle && (
                <>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mt-3">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-neutral-700 bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        {activeVehicle.image ? (
                          <img
                            src={activeVehicle.image}
                            alt={activeVehicle.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xl">
                            {getVehicleInitials(activeVehicle.name)}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-white text-lg mb-1">
                          {activeVehicle.name}
                        </h3>
                        <p className="text-neutral-400 text-sm mb-1">
                          {activeVehicle.brand} {activeVehicle.model} •{" "}
                          {activeVehicle.year}
                        </p>
                        <p className="text-neutral-500 text-xs">
                          {activeVehicle.type}
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                            <div className="text-neutral-400 text-xs mb-1">Tracking Mode</div>
                            <div className="text-white text-sm">{trackingModeLabel}</div>
                          </div>

                          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                            <div className="text-neutral-400 text-xs mb-1">Current Usage</div>
                            <div className="text-white text-sm">
                              {usageValue.toFixed(0)} {usageUnit}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-white mb-3 mt-6">Stats</h2>
                    
                    {savedRides.length === 0 ? (
                      <div className="mb-4 bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-400">
                        No saved rides yet. Complete a trail ride and save it to start building your stats.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                          <p className="text-xs text-neutral-400">Total rides</p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {rideStats.totalRides}
                          </p>
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                          <p className="text-xs text-neutral-400">Trails completed</p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {uniqueCompletedTrailsCount}
                          </p>
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                          <p className="text-xs text-neutral-400">Total distance</p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {rideStats.totalDistanceKm.toFixed(1)} km
                          </p>
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                          <p className="text-xs text-neutral-400">Total ride time</p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {formatRideDuration(rideStats.totalDurationSeconds)}
                          </p>
                        </div>

                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                          <p className="text-xs text-neutral-400">Avg ride distance</p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {rideStats.averageRideDistanceKm.toFixed(1)} km
                          </p>
                        </div>

                        <div className="col-span-2 bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                          <p className="text-xs text-neutral-400">Avg ride speed</p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {rideStats.averageRideSpeedKmh.toFixed(1)} km/h
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mt-3">
                      <div className="flex items-center gap-2 text-neutral-400 text-sm mb-2">
                        <Clock className="w-4 h-4" />
                        Vehicle Notes
                      </div>
                      <div className="text-white text-sm">
                        {activeVehicle.notes?.trim()
                          ? activeVehicle.notes
                          : "No notes added yet."}
                      </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mt-3">
                      <div className="text-neutral-400 text-sm mb-2">
                        Added to Garage
                      </div>
                      <div className="text-white text-sm">
                        {formatDate(activeVehicle.createdAt)}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {maintenanceStatuses.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-white mb-3">Maintenance Status</h2>

                  <div className="space-y-3">
                    {[...maintenanceStatuses]
                      .sort((a, b) => {
                        const order = {
                          overdue: 0,
                          due_soon: 1,
                          ok: 2,
                          never_logged: 3,
                        };
                        return order[a.status] - order[b.status];
                      })
                      .map((task) => {
                      const statusStyles =
                        task.status === "overdue"
                          ? "border-red-700 bg-red-950/20"
                          : task.status === "due_soon"
                          ? "border-amber-700 bg-amber-950/20"
                          : task.status === "never_logged"
                          ? "border-neutral-700 bg-neutral-900"
                          : "border-neutral-800 bg-neutral-900";

                      const statusLabel =
                        task.status === "overdue"
                          ? "Overdue"
                          : task.status === "due_soon"
                          ? "Due Soon"
                          : task.status === "never_logged"
                          ? "Not Logged"
                          : "OK";

                      return (
                        <div
                          key={task.taskId}
                          className={`border rounded-lg p-4 ${statusStyles}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-white text-sm">{task.label}</div>
                              <div className="text-neutral-400 text-xs mt-1">
                                Every {task.interval} {task.unit}
                              </div>
                            </div>

                            <div className="text-xs px-2 py-1 rounded-full border border-neutral-700 text-neutral-200">
                              {statusLabel}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 mt-4">
                            <div>
                              <div className="text-neutral-500 text-xs mb-1">Last Done</div>
                              <div className="text-white text-sm">
                                {task.lastDoneAt !== null
                                  ? `${task.lastDoneAt} ${task.unit}`
                                  : "-"}
                              </div>
                            </div>

                            <div>
                              <div className="text-neutral-500 text-xs mb-1">Next Due</div>
                              <div className="text-white text-sm">
                                {task.nextDueAt !== null
                                  ? `${task.nextDueAt} ${task.unit}`
                                  : "-"}
                              </div>
                            </div>

                            <div>
                              <div className="text-neutral-500 text-xs mb-1">
                                {task.status === "overdue" ? "Overdue By" : "Remaining"}
                              </div>
                              <div className="text-white text-sm">
                                {task.remaining !== null
                                  ? `${
                                      task.status === "overdue"
                                        ? Math.abs(task.remaining)
                                        : task.remaining
                                    } ${task.unit}`
                                  : "-"}
                              </div>
                            </div>
                          </div>

                          {task.lastServiceDate && (
                            <div className="text-neutral-500 text-xs mt-3">
                              Last service date: {new Date(task.lastServiceDate).toLocaleDateString()}
                            </div>
                          )}

                          {task.notes && (
                            <div className="text-neutral-500 text-xs mt-2">{task.notes}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {maintenanceProfile && (
                <div className="mt-6">
                  <h2 className="text-white mb-3">Maintenance Schedule</h2>

                  <div className="space-y-3">
                    {maintenanceProfile.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-white text-sm">{task.label}</div>
                            <div className="text-neutral-400 text-xs mt-1">
                              Every {task.interval} {task.unit}
                            </div>
                            {task.notes && (
                              <div className="text-neutral-500 text-xs mt-2">
                                {task.notes}
                              </div>
                            )}
                          </div>

                          <div className="text-xs px-2 py-1 rounded-full border border-neutral-700 text-neutral-300">
                            {task.category}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {maintenanceProfile && (
                <div className="mt-6 grid grid-cols-1 gap-4">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-white mb-3">Pre-Ride Checklist</h2>
                    <div className="space-y-2">
                      {maintenanceProfile.preRideChecklist.map((item, index) => (
                        <div key={index} className="text-sm text-neutral-300">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                    <h2 className="text-white mb-3">Post-Ride Checklist</h2>
                    <div className="space-y-2">
                      {maintenanceProfile.postRideChecklist.map((item, index) => (
                        <div key={index} className="text-sm text-neutral-300">
                          • {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent Rides</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Your latest saved rides from Xtrail.
              </p>
            </div>

            <Link to="/ride-history">
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-neutral-700 text-neutral-300"
              >
                View All
              </Button>
            </Link>
          </div>

          {savedRides.length === 0 ? (
            <div className="rounded-2xl bg-neutral-800/60 p-4 text-sm text-neutral-400">
              No saved rides yet. Start a trail and save your first ride.
            </div>
          ) : (
            <div className="space-y-3">
              {savedRides.slice(0, 3).map((ride) => (
                <div
                  key={ride.id}
                  className="rounded-2xl bg-neutral-800/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-white">
                        {ride.trailName}
                      </h4>
                      <p className="mt-1 text-xs text-neutral-400">
                        {formatRideDate(ride.finishedAt)}
                      </p>
                    </div>

                    <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-medium text-emerald-400">
                      Saved
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl bg-neutral-900/80 p-3">
                      <p className="text-neutral-500">Time</p>
                      <p className="mt-1 font-semibold text-white">
                        {formatRideTime(ride.durationSeconds)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-neutral-900/80 p-3">
                      <p className="text-neutral-500">Distance</p>
                      <p className="mt-1 font-semibold text-white">
                        {ride.distanceKm.toFixed(2)} km
                      </p>
                    </div>

                    <div className="rounded-xl bg-neutral-900/80 p-3">
                      <p className="text-neutral-500">Avg Speed</p>
                      <p className="mt-1 font-semibold text-white">
                        {ride.avgSpeedKmh.toFixed(1)} km/h
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Saved Trails</h3>
              <p className="mt-1 text-sm text-neutral-400">
                Trails you’ve bookmarked to revisit later.
              </p>
            </div>

            <Link to="/saved-trails">
              <Button
                variant="outline"
                size="sm"
                className="h-9 border-neutral-700 text-neutral-300"
              >
                View All
              </Button>
            </Link>
          </div>

          {savedTrails.length === 0 ? (
            <div className="rounded-2xl bg-neutral-800/60 p-4 text-sm text-neutral-400">
              No saved trails yet. Save trails from the trail detail page.
            </div>
          ) : (
            <div className="space-y-3">
              {savedTrails.slice(0, 3).map((savedTrail) => (
                <Link
                  key={savedTrail.id}
                  to={`/trail/${savedTrail.trailId}`}
                                  className="block rounded-2xl bg-neutral-800/70 p-4 transition hover:bg-neutral-800"
                                >
                                  <div className="flex gap-3">
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-900">
                      {savedTrail.trailImageUrl ? (
                        <img
                          src={savedTrail.trailImageUrl}
                          alt={savedTrail.trailName}
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
                          <h4 className="truncate text-sm font-semibold text-white">
                            {savedTrail.trailName}
                          </h4>
                          <p className="mt-1 text-xs text-neutral-400">
                            {[savedTrail.location, savedTrail.province]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-medium text-emerald-400">
                          Saved
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {savedTrail.difficulty && (
                          <span className="rounded-full bg-neutral-900/80 px-2.5 py-1 text-xs text-neutral-300">
                            {savedTrail.difficulty}
                          </span>
                        )}

                        {savedTrail.trailType && (
                          <span className="rounded-full bg-neutral-900/80 px-2.5 py-1 text-xs text-neutral-300">
                            {savedTrail.trailType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 pt-4 border-t border-neutral-800">
          <Button
            variant="outline"
            className="w-full justify-start border-neutral-800 text-neutral-300 h-11"
          >
            <Settings className="w-4 h-4 mr-3" />
            Account Settings
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              signOut();

              showNotification({
                title: "Signed out",
                message: "You have been signed out of XTrail.",
                variant: "info",
              });
            }}
            className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}