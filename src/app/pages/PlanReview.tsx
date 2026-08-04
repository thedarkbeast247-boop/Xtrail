import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  Clock,
  Crown,
  LockKeyhole,
  Route,
  ShieldAlert,
  Truck,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { useNotification } from "../context/NotificationContext";
import { useUserAccess } from "../context/UserAccessContext";
import { useVehicles } from "../context/VehicleContext";
import {
  FREE_PLAN_COMPLETED_TRAILS_LIMIT,
  FREE_PLAN_RIDE_HISTORY_LIMIT,
  FREE_PLAN_SAVED_TRAILS_LIMIT,
  FREE_PLAN_VEHICLE_LIMIT,
} from "../lib/accessControl";
import type {
  FreePlanSelections,
  ProAccessEndedReason,
} from "../types/access";
import type { CompletedTrail } from "../types/completedTrail";
import type { SavedTrail } from "../types/savedTrail";
import type { SavedRide } from "../utils/rideStats";

type SelectableItem = {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
};

const proEndedReasonLabels: Record<ProAccessEndedReason, string> = {
  payment_missed: "Payment missed",
  payment_failed: "Payment failed",
  subscription_cancelled: "Subscription cancelled",
  subscription_expired: "Subscription expired",
  trial_ended: "Free trial ended",
  refund_processed: "Refund processed",
  chargeback_disputed: "Payment disputed",
  subscription_paused: "Subscription paused",
  manual_downgrade: "Plan changed to Free",
  account_suspended: "Account suspended",
};

function getStoredArray<T>(key: string): T[] {
  const stored = localStorage.getItem(key);

  if (!stored) return [];

  try {
    return JSON.parse(stored) as T[];
  } catch (error) {
    console.error(`Failed to load ${key}:`, error);
    return [];
  }
}

function getSelectedOrDefault(
  existingSelection: string[],
  defaultIds: string[],
  limit: number
) {
  const validExistingSelection = existingSelection.filter((id) =>
    defaultIds.includes(id)
  );

  if (validExistingSelection.length > 0) {
    return validExistingSelection.slice(0, limit);
  }

  return defaultIds.slice(0, limit);
}

function toggleSelection(selectedIds: string[], id: string, limit: number) {
  if (selectedIds.includes(id)) {
    return selectedIds.filter((selectedId) => selectedId !== id);
  }

  if (selectedIds.length >= limit) {
    return selectedIds;
  }

  return [...selectedIds, id];
}

function SelectionSection({
  title,
  description,
  limit,
  icon,
  items,
  selectedIds,
  onToggle,
  emptyText,
  readOnly = false,
}: {
  title: string;
  description: string;
  limit: number;
  icon: ReactNode;
  items: SelectableItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  emptyText: string;
  readOnly?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-neutral-400">{description}</p>
          <p className="mt-2 text-xs text-orange-400">
            {selectedIds.length}/{limit} selected
            {readOnly ? " • Selections locked" : ""}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-sm text-neutral-400">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            const limitReached =
              !isSelected && selectedIds.length >= limit;

            const isDisabled = readOnly || limitReached;

            return (
              <button
                key={item.id}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  if (!readOnly) {
                    onToggle(item.id);
                  }
                }}
                className={`w-full rounded-xl border p-3 text-left transition ${
                  isSelected
                    ? "border-orange-500/50 bg-orange-500/10"
                    : "border-neutral-800 bg-neutral-950 hover:border-neutral-700"
                } ${
                  limitReached ? "cursor-not-allowed opacity-50" : ""
                } ${readOnly ? "cursor-default" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      isSelected
                        ? "border-orange-500 bg-orange-500 text-black"
                        : "border-neutral-700"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {item.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-neutral-400">
                      {item.subtitle}
                    </p>

                    {item.meta && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {item.meta}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function PlanReview() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const {
    currentUserId,
    currentUserAccess,
    reviewFreePlanSelections,
    clearProAccessReview,
  } = useUserAccess();

  const { vehicles, activeVehicle } = useVehicles();

  const [savedTrails, setSavedTrails] = useState<SavedTrail[]>([]);
  const [savedRides, setSavedRides] = useState<SavedRide[]>([]);
  const [completedTrails, setCompletedTrails] = useState<CompletedTrail[]>([]);

  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [selectedSavedTrailIds, setSelectedSavedTrailIds] = useState<string[]>(
    []
  );
  const [selectedRideIds, setSelectedRideIds] = useState<string[]>([]);
  const [selectedCompletedTrailIds, setSelectedCompletedTrailIds] = useState<
    string[]
  >([]);

  useEffect(() => {
    setSavedTrails(getStoredArray<SavedTrail>("xtrail-saved-trails"));
    setSavedRides(getStoredArray<SavedRide>("xtrail-saved-rides"));
    setCompletedTrails(
      getStoredArray<CompletedTrail>("xtrail-completed-trails")
    );
  }, []);

  const vehicleItems = useMemo<SelectableItem[]>(() => {
    return [...vehicles]
      .sort((a, b) => {
        if (a.id === activeVehicle?.id) return -1;
        if (b.id === activeVehicle?.id) return 1;

        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      })
      .map((vehicle) => ({
        id: vehicle.id,
        title: vehicle.name,
        subtitle: `${vehicle.brand} ${vehicle.model} • ${vehicle.year}`,
        meta: vehicle.id === activeVehicle?.id ? "Active vehicle" : vehicle.type,
      }));
  }, [activeVehicle?.id, vehicles]);

  const savedTrailItems = useMemo<SelectableItem[]>(() => {
    return [...savedTrails]
      .sort(
        (a, b) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      )
      .map((trail) => ({
        id: trail.id,
        title: trail.trailName,
        subtitle: [trail.location, trail.province].filter(Boolean).join(", "),
        meta: trail.difficulty,
      }));
  }, [savedTrails]);

  const rideItems = useMemo<SelectableItem[]>(() => {
    return [...savedRides]
      .sort(
        (a, b) =>
          new Date(b.finishedAt).getTime() - new Date(a.finishedAt).getTime()
      )
      .map((ride) => ({
        id: ride.id,
        title: ride.trailName,
        subtitle: `${ride.distanceKm.toFixed(1)} km • ${ride.avgSpeedKmh.toFixed(
          1
        )} km/h`,
        meta: ride.vehicleName ?? "Vehicle not linked",
      }));
  }, [savedRides]);

  const completedTrailItems = useMemo<SelectableItem[]>(() => {
    return [...completedTrails]
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() -
          new Date(a.completedAt).getTime()
      )
      .map((trail) => ({
        id: trail.id,
        title: trail.trailName,
        subtitle: new Date(trail.completedAt).toLocaleDateString("en-ZA"),
        meta: "Completed trail",
      }));
  }, [completedTrails]);

  useEffect(() => {
    setSelectedVehicleIds(
      getSelectedOrDefault(
        currentUserAccess.freePlanSelections.vehicleIds,
        vehicleItems.map((item) => item.id),
        FREE_PLAN_VEHICLE_LIMIT
      )
    );

    setSelectedSavedTrailIds(
      getSelectedOrDefault(
        currentUserAccess.freePlanSelections.savedTrailIds,
        savedTrailItems.map((item) => item.id),
        FREE_PLAN_SAVED_TRAILS_LIMIT
      )
    );

    setSelectedRideIds(
      getSelectedOrDefault(
        currentUserAccess.freePlanSelections.rideIds,
        rideItems.map((item) => item.id),
        FREE_PLAN_RIDE_HISTORY_LIMIT
      )
    );

    setSelectedCompletedTrailIds(
      getSelectedOrDefault(
        currentUserAccess.freePlanSelections.completedTrailIds,
        completedTrailItems.map((item) => item.id),
        FREE_PLAN_COMPLETED_TRAILS_LIMIT
      )
    );
  }, [
    completedTrailItems,
    currentUserAccess.freePlanSelections.completedTrailIds,
    currentUserAccess.freePlanSelections.rideIds,
    currentUserAccess.freePlanSelections.savedTrailIds,
    currentUserAccess.freePlanSelections.vehicleIds,
    rideItems,
    savedTrailItems,
    vehicleItems,
  ]);

  const reasonText = currentUserAccess.proAccessEndedReason
    ? proEndedReasonLabels[currentUserAccess.proAccessEndedReason]
    : "No downgrade reason saved yet";

  const deleteAfterText = currentUserAccess.proAccessDataDeleteAfter
    ? new Date(currentUserAccess.proAccessDataDeleteAfter).toLocaleDateString(
        "en-ZA"
      )
    : "Not scheduled yet";

  const isReviewEditable =
    currentUserAccess.proAccessReviewStatus === "needs_review";

  const isReviewLocked =
    currentUserAccess.proAccessReviewStatus === "reviewed";

  const isProReviewActive =
    isReviewEditable || isReviewLocked;

  const reviewedAtText = currentUserAccess.proAccessReviewedAt
    ? new Date(currentUserAccess.proAccessReviewedAt).toLocaleDateString(
        "en-ZA"
      )
    : null;

  const handleSaveSelections = () => {
    if (!isReviewEditable) {
      showNotification({
        title: "Selections already locked",
        message:
          "Your Free Plan choices cannot be changed. Subscribe to the Pro Plan to unlock all of your items.",
        variant: "warning",
      });

      return;
    }

    const selections: FreePlanSelections = {
      vehicleIds: selectedVehicleIds,
      savedTrailIds: selectedSavedTrailIds,
      rideIds: selectedRideIds,
      completedTrailIds: selectedCompletedTrailIds,
    };

    try {
      reviewFreePlanSelections(currentUserId, selections);

      showNotification({
        title: "Free Plan selections locked",
        message:
          "Your selected items will stay unlocked. Extra items remain safely stored and locked until Pro is active again.",
        variant: "success",
      });

      navigate("/profile");
    } catch (error) {
      showNotification({
        title: "Could not save selections",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while saving your selections.",
        variant: "error",
      });
    }
  };

  const handleRestorePro = () => {
    clearProAccessReview(currentUserId);

    showNotification({
      title: "Pro Plan restored",
      message: "All Pro features and locked data are available again.",
      variant: "success",
    });

    navigate("/profile");
  };

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-orange-950/70 to-neutral-950 px-4 py-5">
        <Link
          to="/profile"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Plan Review</h1>
            <p className="mt-1 text-sm text-neutral-400">
              Choose which items stay unlocked on the Free Plan.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-5">
        <div
          className={`rounded-2xl border p-4 ${
            isProReviewActive
              ? "border-orange-500/20 bg-orange-500/10"
              : "border-neutral-800 bg-neutral-900"
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              isProReviewActive ? "text-orange-400" : "text-white"
            }`}
          >
            {isReviewEditable
              ? "Choose your Free Plan items"
              : isReviewLocked
              ? "Free Plan selections locked"
              : "Plan review not required"}
          </p>

          {isReviewEditable ? (
            <>
              <p className="mt-2 text-sm text-neutral-300">
                Reason:{" "}
                <span className="font-medium text-white">{reasonText}</span>
              </p>

              <p className="mt-2 text-xs leading-5 text-neutral-400">
                Your extra data is still saved. Choose carefully which items
                stay unlocked. After confirming, these selections cannot be
                changed unless the Pro Plan is restored.
              </p>

              <p className="mt-2 text-xs text-neutral-500">
                Locked extra data retention date: {deleteAfterText}
              </p>
            </>
          ) : isReviewLocked ? (
            <>
              <p className="mt-2 text-xs leading-5 text-neutral-300">
                Your selected Free Plan items are now fixed for this downgrade
                period. Extra items remain safely stored but locked.
              </p>

              {reviewedAtText && (
                <p className="mt-2 text-xs text-neutral-500">
                  Selections confirmed on: {reviewedAtText}
                </p>
              )}

              <p className="mt-2 text-xs text-neutral-500">
                Locked extra data retention date: {deleteAfterText}
              </p>
            </>
          ) : (
            <p className="mt-2 text-xs leading-5 text-neutral-400">
              This account does not currently need to choose Free Plan items.
            </p>
          )}
        </div>

        <SelectionSection
          title="Vehicles"
          description={`Select ${FREE_PLAN_VEHICLE_LIMIT} vehicles to keep unlocked.`}
          limit={FREE_PLAN_VEHICLE_LIMIT}
          icon={<Truck className="h-5 w-5" />}
          items={vehicleItems}
          selectedIds={selectedVehicleIds}
          onToggle={(id) =>
            setSelectedVehicleIds((current) =>
              toggleSelection(current, id, FREE_PLAN_VEHICLE_LIMIT)
            )
          }
          emptyText="No vehicles added yet."
          readOnly={!isReviewEditable}
        />

        <SelectionSection
          title="Saved Trails"
          description={`Select ${FREE_PLAN_SAVED_TRAILS_LIMIT} saved trails to keep unlocked.`}
          limit={FREE_PLAN_SAVED_TRAILS_LIMIT}
          icon={<LockKeyhole className="h-5 w-5" />}
          items={savedTrailItems}
          selectedIds={selectedSavedTrailIds}
          onToggle={(id) =>
            setSelectedSavedTrailIds((current) =>
              toggleSelection(current, id, FREE_PLAN_SAVED_TRAILS_LIMIT)
            )
          }
          emptyText="No saved trails yet."
          readOnly={!isReviewEditable}
        />

        <SelectionSection
          title="Ride History"
          description={`Select ${FREE_PLAN_RIDE_HISTORY_LIMIT} rides to keep unlocked.`}
          limit={FREE_PLAN_RIDE_HISTORY_LIMIT}
          icon={<Route className="h-5 w-5" />}
          items={rideItems}
          selectedIds={selectedRideIds}
          onToggle={(id) =>
            setSelectedRideIds((current) =>
              toggleSelection(current, id, FREE_PLAN_RIDE_HISTORY_LIMIT)
            )
          }
          emptyText="No ride history yet."
          readOnly={!isReviewEditable}
        />

        <SelectionSection
          title="Completed Trails"
          description={`Select ${FREE_PLAN_COMPLETED_TRAILS_LIMIT} completed trails to keep unlocked.`}
          limit={FREE_PLAN_COMPLETED_TRAILS_LIMIT}
          icon={<Clock className="h-5 w-5" />}
          items={completedTrailItems}
          selectedIds={selectedCompletedTrailIds}
          onToggle={(id) =>
            setSelectedCompletedTrailIds((current) =>
              toggleSelection(current, id, FREE_PLAN_COMPLETED_TRAILS_LIMIT)
            )
          }
          emptyText="No completed trails yet."
          readOnly={!isReviewEditable}
        />

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-sm font-semibold text-white">
            Want everything unlocked again?
          </p>

          <p className="mt-1 text-sm text-neutral-400">
            Subscribe to the Pro Plan to unlock all saved data and remove Free
            Plan limits.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            {isReviewEditable ? (
              <Button
                type="button"
                onClick={handleSaveSelections}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Confirm and Lock Selections
              </Button>
            ) : isReviewLocked ? (
              <div className="rounded-xl border border-neutral-700 bg-neutral-950 p-3">
                <div className="flex items-start gap-3">
                  <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-orange-400" />

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Selections locked
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-400">
                      These choices cannot be changed while using the Free Plan.
                      Subscribe to restore access to all of your items.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <Link to="/subscription">
              <Button
                type="button"
                variant="outline"
                className="w-full border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
              >
                <Crown className="mr-2 h-4 w-4" />
                Subscribe Now
              </Button>
            </Link>

            {import.meta.env.DEV && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRestorePro}
                className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
              >
                Dev: Restore Pro Plan
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}