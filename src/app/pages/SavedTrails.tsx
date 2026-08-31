import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  Bookmark,
  LockKeyhole,
  MapPin,
  Mountain,
  Trash2,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { useNotification } from "../context/NotificationContext";
import { useUserAccess } from "../context/UserAccessContext";
import {
  FREE_PLAN_SAVED_TRAILS_LIMIT,
  getFreePlanItemAccess,
} from "../lib/accessControl";
import { type SavedTrail } from "../types/savedTrail";

export function SavedTrails() {
  const [savedTrails, setSavedTrails] = useState<SavedTrail[]>([]);

  const { currentUserAccess } = useUserAccess();
  const { showNotification } = useNotification();

  const savedTrailFallbackIds = [...savedTrails]
    .sort(
      (a, b) =>
        new Date(b.savedAt).getTime() -
        new Date(a.savedAt).getTime()
    )
    .map((savedTrail) => savedTrail.id);

  const savedTrailItemAccess = getFreePlanItemAccess({
    user: currentUserAccess,
    availableIds: savedTrails.map((savedTrail) => savedTrail.id),
    selectionKey: "savedTrailIds",
    limit: FREE_PLAN_SAVED_TRAILS_LIMIT,
    fallbackIds: savedTrailFallbackIds,
  });

  const unlockedSavedTrailCount = savedTrails.filter((savedTrail) =>
    savedTrailItemAccess.isItemUnlocked(savedTrail.id)
  ).length;

  const lockedSavedTrailCount =
    savedTrailItemAccess.lockedIds.length;

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

  const handleRemoveSavedTrail = (
    event: MouseEvent<HTMLButtonElement>,
    savedTrailId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const updatedSavedTrails = savedTrails.filter(
        (savedTrail) => savedTrail.id !== savedTrailId
      );

      localStorage.setItem(
        "xtrail-saved-trails",
        JSON.stringify(updatedSavedTrails)
      );

      setSavedTrails(updatedSavedTrails);

      showNotification({
        title: "Trail removed",
        message: "The trail was removed from your saved list.",
        variant: "info",
      });
    } catch (error) {
      console.error("Failed to remove saved trail:", error);

      showNotification({
        title: "Could not remove trail",
        message: "Something went wrong while removing this saved trail.",
        variant: "error",
      });
    }
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
            <h1 className="text-xl font-semibold text-white">Saved Trails</h1>
            <p className="text-sm text-neutral-400">
              Trails you’ve bookmarked for later.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pt-5 pb-32">
        {savedTrails.length > 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-neutral-500">
                  Saved trail access
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {savedTrailItemAccess.unlimited
                    ? "Unlimited"
                    : `${unlockedSavedTrailCount}/${FREE_PLAN_SAVED_TRAILS_LIMIT}`}
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  {savedTrailItemAccess.unlimited
                    ? "Unlimited saved trails"
                    : "Free Plan"}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  savedTrailItemAccess.unlimited
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-orange-500/10 text-orange-400"
                }`}
              >
                {savedTrailItemAccess.unlimited ? (
                  <Bookmark className="h-5 w-5" />
                ) : (
                  <LockKeyhole className="h-5 w-5" />
                )}
              </div>
            </div>

            {!savedTrailItemAccess.unlimited && (
              <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-3">
                {lockedSavedTrailCount > 0 ? (
                  <>
                    <p className="text-xs font-semibold text-orange-400">
                      {lockedSavedTrailCount} saved trail
                      {lockedSavedTrailCount === 1 ? "" : "s"} locked
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-400">
                      Your extra saved trails remain safely stored. Subscribe
                      to the Pro Plan to unlock your full saved-trail library.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-orange-400">
                      Free saved trail limit
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-400">
                      Free Plan users can keep up to{" "}
                      {FREE_PLAN_SAVED_TRAILS_LIMIT} saved trails unlocked.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {savedTrails.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
              <Bookmark className="h-5 w-5 text-neutral-400" />
            </div>

            <h2 className="mt-4 text-base font-medium text-white">
              No saved trails yet
            </h2>

            <p className="mt-2 text-sm text-neutral-400">
              Save trails from the trail detail page to build your list.
            </p>

            <Link to="/" className="mt-4 inline-block">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Explore Trails
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedTrails.map((savedTrail) => {
              const isLocked =
                !savedTrailItemAccess.isItemUnlocked(savedTrail.id);

              return (
                <div
                  key={savedTrail.id}
                  className={`relative overflow-hidden rounded-2xl border bg-neutral-900 transition ${
                    isLocked
                      ? "min-h-[230px] border-orange-500/20"
                      : "border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  {!isLocked && (
                    <Link
                      to={`/trail/${savedTrail.trailId}`}
                      aria-label={`Open ${savedTrail.trailName}`}
                      className="absolute inset-0 z-0"
                    />
                  )}

                  {isLocked && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-neutral-950/75 p-4 backdrop-blur-[1px]">
                      <div className="max-w-[280px] text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15">
                          <LockKeyhole className="h-5 w-5 text-orange-400" />
                        </div>

                        <h2 className="mt-3 text-sm font-semibold text-white">
                          Pro Plan required
                        </h2>

                        <p className="mt-1 text-xs leading-5 text-neutral-400">
                          This saved trail remains safely stored, but it is not
                          one of your unlocked Free Plan selections.
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Link to="/account/plan-review">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full border-neutral-700 text-neutral-300"
                            >
                              Plan Review
                            </Button>
                          </Link>

                          <Link to="/subscription">
                            <Button
                              type="button"
                              size="sm"
                              className="w-full bg-orange-600 hover:bg-orange-700"
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
                      {savedTrail.trailImageUrl ? (
                        <img
                          src={savedTrail.trailImageUrl}
                          alt={savedTrail.trailName}
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
                            {savedTrail.trailName}
                          </h2>

                          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />

                            <span className="truncate">
                              {[
                                savedTrail.location,
                                savedTrail.province,
                                savedTrail.country,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isLocked}
                          onClick={(event) =>
                            handleRemoveSavedTrail(event, savedTrail.id)
                          }
                          title="Remove saved trail"
                          className="pointer-events-auto relative z-20 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 transition hover:bg-red-500/25 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-medium text-emerald-400">
                          Saved
                        </span>

                        {savedTrail.difficulty && (
                          <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200">
                            {savedTrail.difficulty}
                          </span>
                        )}

                        {savedTrail.trailType && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200">
                            <Mountain className="h-3 w-3" />
                            {savedTrail.trailType}
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-xs text-neutral-500">
                        Saved{" "}
                        {new Date(savedTrail.savedAt).toLocaleDateString(
                          "en-ZA"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}