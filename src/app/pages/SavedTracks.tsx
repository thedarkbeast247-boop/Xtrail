import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";

import { Link } from "react-router";

import {
  ArrowLeft,
  Bookmark,
  MapPin,
  Route,
  Trash2,
} from "lucide-react";

import { Button } from "../components/ui/button";

import { useNotification } from "../context/NotificationContext";
import { usePhase2Content } from "../context/Phase2ContentContext";

import type { SavedTrack } from "../types/savedTrack";

export function SavedTracks() {
  const [savedTracks, setSavedTracks] =
    useState<SavedTrack[]>([]);

  const { tracks } =
    usePhase2Content();

  const { showNotification } =
    useNotification();

  useEffect(() => {
    const storedSavedTracks =
      localStorage.getItem(
        "xtrail-saved-tracks"
      );

    if (!storedSavedTracks) {
      setSavedTracks([]);
      return;
    }

    try {
      const parsed =
        JSON.parse(
          storedSavedTracks
        ) as SavedTrack[];

      setSavedTracks(parsed);
    } catch (error) {
      console.error(
        "Failed to load saved tracks:",
        error
      );

      setSavedTracks([]);
    }
  }, []);

  const displayedSavedTracks =
    useMemo(() => {
      return [...savedTracks].sort(
        (a, b) =>
          new Date(
            b.savedAt
          ).getTime() -
          new Date(
            a.savedAt
          ).getTime()
      );
    }, [savedTracks]);

  const publishedTrackIds =
    useMemo(() => {
      return new Set(
        tracks
          .filter(
            (track) =>
              track.publicationStatus ===
              "published"
          )
          .map(
            (track) => track.id
          )
      );
    }, [tracks]);

  const handleRemoveSavedTrack = (
    event: MouseEvent<HTMLButtonElement>,
    savedTrackId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const updatedSavedTracks =
        savedTracks.filter(
          (savedTrack) =>
            savedTrack.id !==
            savedTrackId
        );

      localStorage.setItem(
        "xtrail-saved-tracks",
        JSON.stringify(
          updatedSavedTracks
        )
      );

      setSavedTracks(
        updatedSavedTracks
      );

      showNotification({
        title: "Track removed",
        message:
          "The track was removed from your saved list.",
        variant: "info",
      });
    } catch (error) {
      console.error(
        "Failed to remove saved track:",
        error
      );

      showNotification({
        title:
          "Could not remove track",
        message:
          "Something went wrong while removing this saved track.",
        variant: "error",
      });
    }
  };

  return (
    <div className="min-h-full bg-neutral-950">
      {/* Header */}
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
            <h1 className="text-xl font-semibold text-white">
              Saved Tracks
            </h1>

            <p className="text-sm text-neutral-400">
              Tracks you've bookmarked
              for later.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 pb-32 pt-5">
        {/* Summary */}
        {savedTracks.length > 0 && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-neutral-500">
                  Saved track library
                </p>

                <p className="mt-1 text-lg font-bold text-white">
                  {savedTracks.length}
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Tracks saved for
                  future rides.
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <Bookmark className="h-5 w-5" />
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {savedTracks.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
              <Bookmark className="h-5 w-5 text-neutral-400" />
            </div>

            <h2 className="mt-4 text-base font-medium text-white">
              No saved tracks yet
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Save motocross,
              supercross and other
              riding tracks from their
              Track Detail page.
            </p>

            <Link
              to="/tracks"
              className="mt-4 inline-block"
            >
              <Button className="bg-orange-500 text-black hover:bg-orange-400">
                Explore Tracks
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedSavedTracks.map(
              (savedTrack) => {
                const isAvailable =
                  publishedTrackIds.has(
                    savedTrack.trackId
                  );

                return (
                  <div
                    key={
                      savedTrack.id
                    }
                    className={`relative overflow-hidden rounded-2xl border bg-neutral-900 transition ${
                      isAvailable
                        ? "border-neutral-800 hover:border-neutral-700"
                        : "border-neutral-800 opacity-70"
                    }`}
                  >
                    {isAvailable && (
                      <Link
                        to={`/track/${savedTrack.trackId}`}
                        state={{
                          from: "/saved-tracks",
                          backLabel:
                            "Back to Saved Tracks",
                        }}
                        aria-label={`Open ${savedTrack.trackName}`}
                        className="absolute inset-0 z-0"
                      />
                    )}

                    <div className="relative z-10 flex gap-3 p-3 pointer-events-none">
                      {/* Image */}
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
                        {savedTrack.trackImageUrl ? (
                          <img
                            src={
                              savedTrack.trackImageUrl
                            }
                            alt={
                              savedTrack.trackName
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Route className="h-6 w-6 text-neutral-600" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h2 className="truncate text-base font-semibold text-white">
                              {
                                savedTrack.trackName
                              }
                            </h2>

                            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />

                              <span className="truncate">
                                {[
                                  savedTrack.location,
                                  savedTrack.province,
                                  savedTrack.country,
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    ", "
                                  )}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(
                              event
                            ) =>
                              handleRemoveSavedTrack(
                                event,
                                savedTrack.id
                              )
                            }
                            title="Remove saved track"
                            className="pointer-events-auto relative z-20 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400 transition hover:bg-red-500/25"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-400">
                            Saved
                          </span>

                          {savedTrack.trackType && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200">
                              <Route className="h-3 w-3" />

                              {
                                savedTrack.trackType
                              }
                            </span>
                          )}

                          {!isAvailable && (
                            <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-500">
                              Currently unavailable
                            </span>
                          )}
                        </div>

                        <p className="mt-3 text-xs text-neutral-500">
                          Saved{" "}
                          {new Date(
                            savedTrack.savedAt
                          ).toLocaleDateString(
                            "en-ZA"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}