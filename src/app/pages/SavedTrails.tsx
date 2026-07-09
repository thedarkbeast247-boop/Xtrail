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
import { LockedFeatureCard } from "../components/access/LockedFeatureCard";
import { useNotification } from "../context/NotificationContext";
import { useUserAccess } from "../context/UserAccessContext";
import {
  FREE_PLAN_SAVED_TRAILS_LIMIT,
  getSavedTrailsAccess,
} from "../lib/accessControl";
import { type SavedTrail } from "../types/savedTrail";

export function SavedTrails() {
  const [savedTrails, setSavedTrails] = useState<SavedTrail[]>([]);

  const { currentUserAccess } = useUserAccess();
  const { showNotification } = useNotification();

  const savedTrailsAccess = getSavedTrailsAccess(
    currentUserAccess,
    savedTrails.length
  );

  const visibleSavedTrails = savedTrailsAccess.unlimited
    ? savedTrails
    : savedTrails.slice(0, savedTrailsAccess.visibleLimit);

  const hiddenSavedTrailCount = savedTrailsAccess.hiddenCount;

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
    trailId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const updatedSavedTrails = savedTrails.filter(
        (savedTrail) => savedTrail.trailId !== trailId
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

      <div className="space-y-4 px-4 py-5">
        {savedTrails.length > 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-neutral-500">Saved trail access</p>

                <p className="mt-1 text-lg font-bold text-white">
                  {savedTrailsAccess.savedTrailLimitLabel}
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  {savedTrailsAccess.unlimited
                    ? "Unlimited saved trails"
                    : "Free plan"}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  savedTrailsAccess.unlimited
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-orange-500/10 text-orange-400"
                }`}
              >
                {savedTrailsAccess.unlimited ? (
                  <Bookmark className="h-5 w-5" />
                ) : (
                  <LockKeyhole className="h-5 w-5" />
                )}
              </div>
            </div>

            {!savedTrailsAccess.unlimited && (
              <div className="mt-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2">
                <p className="text-xs font-semibold text-orange-400">
                  Free saved trail limit
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Free users can view up to {FREE_PLAN_SAVED_TRAILS_LIMIT} saved
                  trails. Subscribe to unlock your full saved trail library.
                </p>
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
            {visibleSavedTrails.map((savedTrail) => (
              <Link
                key={savedTrail.id}
                to={`/trail/${savedTrail.trailId}`}
                className="block rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-neutral-700"
              >
                <div className="flex gap-3 p-3">
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
                        onClick={(event) =>
                          handleRemoveSavedTrail(event, savedTrail.trailId)
                        }
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 transition hover:bg-red-500/25"
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
                      Saved {new Date(savedTrail.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {hiddenSavedTrailCount > 0 && (
              <LockedFeatureCard
                compact
                title="Subscribe to view unlimited saved trails"
                message={`You have ${hiddenSavedTrailCount} more saved trail${
                  hiddenSavedTrailCount === 1 ? "" : "s"
                } waiting in your library. Subscribe to unlock unlimited saved trails.`}
                ctaLabel="Subscribe Now"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}