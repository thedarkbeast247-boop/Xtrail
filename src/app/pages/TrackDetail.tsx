import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  Link,
  useLocation,
  useParams,
} from "react-router";

import {
  ArrowLeft,
  BadgeCheck,
  Bike,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Instagram,
  Mail,
  MapPin,
  Megaphone,
  MessageCircle,
  Navigation,
  Phone,
  Route,
  Share2,
  Sparkles,
  Star,
  Ticket,
} from "lucide-react";

import {
  AtvIcon,
  DirtBikeIcon,
  DualSportIcon,
  FourByFourIcon,
  SuvIcon,
  SxsIcon,
} from "../components/VehicleIcons";

import { TrackMapPreview } from "../components/content/TrackMapPreview";

import { useNotification } from "../context/NotificationContext";
import { usePhase2Content } from "../context/Phase2ContentContext";

import type { SavedTrack } from "../types/savedTrack";
import type { Track } from "../types/track";
import type { VehicleClass } from "../types/trail";

type TrackDetailNavigationState = {
  from?: string;
  backLabel?: string;
};

function getDifficultyStyles(
  difficulty: Track["difficulty"]
) {
  switch (difficulty) {
    case "Beginner":
      return "border-emerald-500/20 bg-emerald-500/15 text-emerald-400";

    case "Intermediate":
      return "border-yellow-500/20 bg-yellow-500/15 text-yellow-400";

    case "Advanced":
      return "border-orange-500/20 bg-orange-500/15 text-orange-400";

    case "Expert":
      return "border-red-500/20 bg-red-500/15 text-red-400";

    case "Mixed":
      return "border-purple-500/20 bg-purple-500/15 text-purple-400";

    default:
      return "border-neutral-700 bg-neutral-800 text-neutral-300";
  }
}

function getVehicleIcon(
  vehicleClass: VehicleClass
) {
  const className = "h-6 w-6";

  switch (vehicleClass) {
    case "Motocross":
      return (
        <DirtBikeIcon
          className={className}
        />
      );

    case "Dual-Sport":
      return (
        <DualSportIcon
          className={className}
        />
      );

    case "ATV":
      return (
        <AtvIcon
          className={className}
        />
      );

    case "UTV":
      return (
        <SxsIcon
          className={className}
        />
      );

    case "4x4":
      return (
        <FourByFourIcon
          className={className}
        />
      );

    case "SUV":
      return (
        <SuvIcon
          className={className}
        />
      );

    default:
      return (
        <Bike
          className={className}
        />
      );
  }
}

function formatEntryFee(
  track: Track
) {
  if (
    track.entryFee === undefined ||
    track.entryFee === null
  ) {
    return "Contact venue";
  }

  if (track.entryFee <= 0) {
    return "Free";
  }

  return `R${track.entryFee.toFixed(
    2
  )}`;
}

function formatEventDate(
  date: string
) {
  return new Date(
    `${date}T12:00:00`
  ).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getExternalUrl(
  value: string
) {
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `https://${value}`;
}

export function TrackDetail() {
  const { id } = useParams();
  const location = useLocation();

  const {
    getTrackById,
    getEventsForTrack,
    getPromotionsForTrack,
    getBrandById,
  } = usePhase2Content();

  const { showNotification } =
    useNotification();

  const navigationState =
    location.state as TrackDetailNavigationState | null;

  const backTarget =
    navigationState?.from ??
    "/tracks";

  const backLabel =
    navigationState?.backLabel ??
    "Back to Tracks";

  const track =
    id
      ? getTrackById(id)
      : undefined;

  const [savedTracks, setSavedTracks] =
    useState<SavedTrack[]>([]);

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

  const isTrackSaved =
    useMemo(() => {
      if (!track) {
        return false;
      }

      return savedTracks.some(
        (savedTrack) =>
          savedTrack.trackId ===
          track.id
      );
    }, [savedTracks, track]);

  const linkedEvents =
    useMemo(() => {
      if (!track) {
        return [];
      }

      return getEventsForTrack(
        track.id
      )
        .filter(
          (event) =>
            event.publicationStatus ===
              "published" &&
            event.eventStatus !==
              "cancelled"
        )
        .sort(
          (a, b) =>
            new Date(
              a.startDate
            ).getTime() -
            new Date(
              b.startDate
            ).getTime()
        );
    }, [
      track,
      getEventsForTrack,
    ]);
  
  const linkedPromotions =
    useMemo(() => {
      if (!track) {
        return [];
      }

      return getPromotionsForTrack(
        track.id
      )
        .filter(
          (promotion) =>
            promotion.status ===
              "active" ||
            promotion.status ===
              "scheduled"
        )
        .filter((promotion) => {
          const brand =
            getBrandById(
              promotion.brandId
            );

          return (
            brand?.publicationStatus ===
            "published"
          );
        })
        .sort((a, b) => {
          if (
            a.featured !==
            b.featured
          ) {
            return a.featured
              ? -1
              : 1;
          }

          if (
            a.sponsored !==
            b.sponsored
          ) {
            return a.sponsored
              ? -1
              : 1;
          }

          const aDate =
            a.startDate
              ? new Date(
                  a.startDate
                ).getTime()
              : 0;

          const bDate =
            b.startDate
              ? new Date(
                  b.startDate
                ).getTime()
              : 0;

          return bDate - aDate;
        });
    }, [
      track,
      getPromotionsForTrack,
      getBrandById,
    ]);

  const handleToggleSaveTrack =
    () => {
      if (!track) {
        return;
      }

      try {
        if (isTrackSaved) {
          const updatedSavedTracks =
            savedTracks.filter(
              (savedTrack) =>
                savedTrack.trackId !==
                track.id
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
            message: `${track.name} was removed from your saved tracks.`,
            variant: "info",
          });

          return;
        }

        const newSavedTrack: SavedTrack =
          {
            id: crypto.randomUUID(),

            trackId: track.id,
            trackName: track.name,

            trackImageUrl:
              track.imageUrl,

            location:
              track.location,

            province:
              track.province,

            country:
              track.country,

            trackType:
              track.trackType,

            savedAt:
              new Date().toISOString(),
          };

        const updatedSavedTracks = [
          newSavedTrack,
          ...savedTracks,
        ];

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
          title: "Track saved",
          message: `${track.name} was added to your saved tracks.`,
          variant: "success",
        });
      } catch (error) {
        console.error(
          "Failed to toggle saved track:",
          error
        );

        showNotification({
          title:
            "Could not update saved track",
          message:
            "Unable to update your saved tracks right now.",
          variant: "error",
        });
      }
    };

  const handleShareTrack =
    async () => {
      if (!track) {
        return;
      }

      const trackUrl =
        window.location.href;

      const shareLines = [
        "Check out this track on Xtrail:",
        "",
        track.name,
        track.trackType,
        track.location
          ? `Location: ${track.location}`
          : null,
        track.province
          ? `Province: ${track.province}`
          : null,
        "",
        trackUrl,
      ].filter(Boolean);

      const shareText =
        shareLines.join("\n");

      try {
        if (navigator.share) {
          await navigator.share({
            title: track.name,
            text: shareText,
            url: trackUrl,
          });

          return;
        }

        await navigator.clipboard.writeText(
          shareText
        );

        showNotification({
          title:
            "Track link copied",
          message:
            "The track link was copied to your clipboard.",
          variant: "success",
        });
      } catch (error) {
        if (
          error instanceof Error &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "Failed to share track:",
          error
        );

        showNotification({
          title: "Share failed",
          message:
            "Unable to share this track right now.",
          variant: "error",
        });
      }
    };

  if (
    !track ||
    track.publicationStatus !==
      "published"
  ) {
    return (
      <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            to={backTarget}
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            {backLabel}
          </Link>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h1 className="text-2xl font-bold">
              Track not found
            </h1>

            <p className="mt-2 text-neutral-400">
              This track does not
              exist or has not been
              published yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${track.lat},${track.lng}`;

  const whatsappNumber =
    track.whatsapp
      ?.replace(/\D/g, "");

  const instagramUrl =
    track.instagram
      ? track.instagram.startsWith(
          "http"
        )
        ? track.instagram
        : `https://instagram.com/${track.instagram.replace(
            "@",
            ""
          )}`
      : "";

  return (
    <div className="min-h-screen bg-neutral-950 pb-28 text-white">
      <div className="mx-auto max-w-4xl">
        {/* Back */}
        <div className="px-4 pt-4">
          <Link
            to={backTarget}
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            {backLabel}
          </Link>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden border-y border-neutral-800 bg-neutral-900 sm:rounded-3xl sm:border">
          <div className="relative h-72 w-full sm:h-96">
            {track.imageUrl ? (
              <img
                src={track.imageUrl}
                alt={track.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
                <Route className="h-12 w-12 text-neutral-600" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${getDifficultyStyles(
                  track.difficulty
                )}`}
              >
                {track.difficulty}
              </span>

              <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {track.trackType}
              </span>

              {track.featured && (
                <span className="rounded-full border border-orange-400/30 bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                  Featured
                </span>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <h1 className="text-3xl font-bold sm:text-4xl">
                {track.name}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-200">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />

                  <span>
                    {track.location},{" "}
                    {track.province}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />

                  <span>
                    {track.reviewCount >
                    0
                      ? `${track.rating.toFixed(
                          1
                        )} (${track.reviewCount} reviews)`
                      : "New listing"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-4 sm:p-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <InfoCard
                icon={
                  <Route className="h-4 w-4 text-orange-400" />
                }
                label="Track Length"
                value={
                  track.lengthKm !==
                  undefined
                    ? `${track.lengthKm} km`
                    : "TBA"
                }
              />

              <InfoCard
                icon={
                  <Ticket className="h-4 w-4 text-orange-400" />
                }
                label="Entry"
                value={formatEntryFee(
                  track
                )}
              />

              <InfoCard
                icon={
                  <Bike className="h-4 w-4 text-orange-400" />
                }
                label="Surface"
                value={track.surface}
              />

              <InfoCard
                icon={
                  <Navigation className="h-4 w-4 text-orange-400" />
                }
                label="Direction"
                value={track.direction}
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={
                  handleToggleSaveTrack
                }
                className={`inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                  isTrackSaved
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                    : "border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
                }`}
              >
                <Bookmark className="h-4 w-4" />

                {isTrackSaved
                  ? "Saved"
                  : "Save"}
              </button>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                <Navigation className="h-4 w-4" />

                Directions
              </a>

              <button
                type="button"
                onClick={
                  handleShareTrack
                }
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                <Share2 className="h-4 w-4" />

                Share
              </button>
            </div>

            {/* Overview */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
              <h2 className="text-lg font-semibold text-white">
                Track Overview
              </h2>

              <p className="mt-3 leading-7 text-neutral-300">
                {track.description}
              </p>

              <div className="mt-5 border-t border-neutral-800 pt-5">
                <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-200">
                  Location
                </h3>

                <div className="mt-3 space-y-2 text-sm text-neutral-300">
                  <p>
                    <span className="text-neutral-500">
                      Area:
                    </span>{" "}
                    {track.location}
                  </p>

                  {track.address && (
                    <p>
                      <span className="text-neutral-500">
                        Address:
                      </span>{" "}
                      {track.address}
                    </p>
                  )}

                  <p>
                    <span className="text-neutral-500">
                      Province:
                    </span>{" "}
                    {track.province}
                  </p>

                  <p>
                    <span className="text-neutral-500">
                      Country:
                    </span>{" "}
                    {track.country}
                  </p>
                </div>
              </div>
            </section>

            {/* Track map */}
            <section>
              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  Map
                </p>

                <h2 className="mt-1 text-xl font-bold text-white">
                  Track Location & Layout
                </h2>

                <p className="mt-1 text-sm text-neutral-400">
                  The track layout will
                  appear here when GPS
                  route data is available.
                </p>
              </div>

              <TrackMapPreview
                trackName={
                  track.name
                }
                lat={track.lat}
                lng={track.lng}
                routePoints={
                  track.routePoints ??
                  []
                }
              />

              {track.routeSource && (
                <p className="mt-2 text-xs text-neutral-500">
                  Route source:{" "}
                  {track.routeSource.replace(
                    /_/g,
                    " "
                  )}
                  {track.routeUpdatedAt
                    ? ` • Updated ${new Date(
                        track.routeUpdatedAt
                      ).toLocaleDateString(
                        "en-ZA"
                      )}`
                    : ""}
                </p>
              )}
            </section>

            {/* Vehicles */}
            <section>
              <h2 className="text-lg font-semibold text-white">
                Supported Vehicles
              </h2>

              {track.vehicleClass
                .length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {track.vehicleClass.map(
                    (vehicleClass) => (
                      <div
                        key={
                          vehicleClass
                        }
                        className="flex items-center gap-3 rounded-2xl bg-neutral-800/80 px-4 py-4 text-neutral-200"
                      >
                        <div className="text-orange-400">
                          {getVehicleIcon(
                            vehicleClass
                          )}
                        </div>

                        <span className="text-sm font-medium">
                          {
                            vehicleClass
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-3 text-sm text-neutral-500">
                  Vehicle compatibility
                  has not been specified.
                </p>
              )}
            </section>

            {/* Features */}
            {(track.features.length >
              0 ||
              track.customFeatures
                .length > 0) && (
              <DetailList
                title="Track Features"
                values={[
                  ...track.features,
                  ...track.customFeatures,
                ]}
              />
            )}

            {/* Facilities */}
            {(track.facilities.length >
              0 ||
              track.customFacilities
                .length > 0) && (
              <DetailList
                title="Facilities"
                values={[
                  ...track.facilities,
                  ...track.customFacilities,
                ]}
              />
            )}

            {/* Opening hours */}
            {track.operatingHours
              .length > 0 && (
              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                    <Clock className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Opening Hours
                    </h2>

                    <p className="text-xs text-neutral-500">
                      Confirm with the
                      venue before
                      travelling.
                    </p>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-neutral-800">
                  {track.operatingHours.map(
                    (operatingHour) => (
                      <div
                        key={
                          operatingHour.day
                        }
                        className="flex items-start justify-between gap-4 py-3 text-sm"
                      >
                        <span className="font-medium text-neutral-300">
                          {
                            operatingHour.day
                          }
                        </span>

                        <div className="text-right">
                          <p
                            className={
                              operatingHour.isOpen
                                ? "text-white"
                                : "text-neutral-600"
                            }
                          >
                            {operatingHour.isOpen
                              ? `${
                                  operatingHour.opensAt ??
                                  "Open"
                                }${
                                  operatingHour.closesAt
                                    ? ` – ${operatingHour.closesAt}`
                                    : ""
                                }`
                              : "Closed"}
                          </p>

                          {operatingHour.notes && (
                            <p className="mt-0.5 text-xs text-neutral-500">
                              {
                                operatingHour.notes
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Access */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                  <Ticket className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Track Access
                  </h2>

                  <p className="text-xs text-neutral-500">
                    Entry and booking
                    information.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-neutral-500">
                    Entry fee
                  </span>

                  <span className="text-right font-medium text-white">
                    {formatEntryFee(
                      track
                    )}
                  </span>
                </div>

                {track.entryFeeNotes && (
                  <p className="rounded-2xl bg-neutral-950 p-3 text-neutral-400">
                    {
                      track.entryFeeNotes
                    }
                  </p>
                )}

                <div className="flex items-start justify-between gap-4">
                  <span className="text-neutral-500">
                    Booking
                  </span>

                  <span className="text-right font-medium text-white">
                    {track.requiresBooking
                      ? "Required"
                      : "Not required"}
                  </span>
                </div>

                {track.requiresBooking &&
                  track.bookingUrl && (
                    <a
                      href={getExternalUrl(
                        track.bookingUrl
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                    >
                      Book / Register

                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
              </div>
            </section>

            {/* Rules */}
            {track.rules.length >
              0 && (
              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                <h2 className="text-lg font-semibold text-white">
                  Track Rules
                </h2>

                <div className="mt-4 space-y-3">
                  {track.rules.map(
                    (rule, index) => (
                      <div
                        key={`${rule}-${index}`}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-400" />

                        <p className="text-sm leading-6 text-neutral-300">
                          {rule}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Contact */}
            {(track.phone ||
              track.whatsapp ||
              track.email ||
              track.website ||
              track.instagram) && (
              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                <h2 className="text-lg font-semibold text-white">
                  Contact Track
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Contact the venue
                  directly for current
                  conditions, pricing and
                  opening information.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {track.phone && (
                    <a
                      href={`tel:${track.phone}`}
                      className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-medium text-white"
                    >
                      <Phone className="h-4 w-4 text-orange-400" />

                      Call
                    </a>
                  )}

                  {whatsappNumber && (
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-medium text-white"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-400" />

                      WhatsApp
                    </a>
                  )}

                  {track.email && (
                    <a
                      href={`mailto:${track.email}`}
                      className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-medium text-white"
                    >
                      <Mail className="h-4 w-4 text-orange-400" />

                      Email
                    </a>
                  )}

                  {track.website && (
                    <a
                      href={getExternalUrl(
                        track.website
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-medium text-white"
                    >
                      <Globe className="h-4 w-4 text-orange-400" />

                      Website
                    </a>
                  )}

                  {instagramUrl && (
                    <a
                      href={
                        instagramUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="col-span-2 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-medium text-white"
                    >
                      <Instagram className="h-4 w-4 text-pink-400" />

                      Instagram
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Gallery */}
            {track.galleryImageUrls
              .length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-white">
                  Track Photos
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {track.galleryImageUrls.map(
                    (
                      imageUrl,
                      index
                    ) => (
                      <div
                        key={`${imageUrl}-${index}`}
                        className="aspect-square overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
                      >
                        <img
                          src={
                            imageUrl
                          }
                          alt={`${track.name} photo ${
                            index + 1
                          }`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Linked Events */}
            <section>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                    Community
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    Upcoming Events
                  </h2>
                </div>

                {linkedEvents.length >
                  0 && (
                  <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
                    {
                      linkedEvents.length
                    }
                  </span>
                )}
              </div>

              {linkedEvents.length ===
              0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-neutral-800 bg-neutral-900 p-5">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-600" />

                    <div>
                      <p className="text-sm font-semibold text-white">
                        No events linked
                        yet
                      </p>

                      <p className="mt-1 text-xs leading-5 text-neutral-500">
                        Events using this
                        track will appear
                        here once they
                        are published.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {linkedEvents.map(
                    (event) => (
                      <Link
                        key={
                          event.id
                        }
                        to={`/event/${event.id}`}
                        state={{
                          from: `/track/${track.id}`,
                          backLabel:
                            "Back to Track",
                        }}
                        className="block rounded-2xl border border-neutral-800 bg-neutral-900 p-4 transition hover:border-orange-500/30"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                            <Calendar className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-white">
                              {
                                event.name
                              }
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              {formatEventDate(
                                event.startDate
                              )}
                              {" • "}
                              {
                                event.eventType
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-neutral-400">
                              {
                                event.location
                              }
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  )}
                </div>
                            )}
            </section>

            {/* Linked Promotions */}
            {linkedPromotions.length > 0 && (
              <section>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                      Featured
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-white">
                      Releases & Promotions
                    </h2>

                    <p className="mt-1 text-sm text-neutral-500">
                      Brand content connected
                      to this riding location.
                    </p>
                  </div>

                  <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
                    {linkedPromotions.length}
                  </span>
                </div>

                <div className="mt-4 space-y-4">
                  {linkedPromotions.map(
                    (promotion) => {
                      const brand =
                        getBrandById(
                          promotion.brandId
                        );

                      if (!brand) {
                        return null;
                      }

                      return (
                        <article
                          key={promotion.id}
                          className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900"
                        >
                          {/* Promotion image */}
                          {promotion.imageUrl ? (
                            <Link
                              to={`/promotion/${promotion.id}`}
                              state={{
                                from: `/track/${track.id}`,
                                backLabel:
                                  "Back to Track",
                              }}
                              className="block"
                            >
                              <div className="relative h-48 overflow-hidden bg-neutral-800">
                                <img
                                  src={
                                    promotion.imageUrl
                                  }
                                  alt={
                                    promotion.title
                                  }
                                  className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                                  {promotion.sponsored && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                      <Megaphone className="h-3 w-3" />

                                      Sponsored
                                    </span>
                                  )}

                                  {promotion.featured && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                                      <Sparkles className="h-3 w-3" />

                                      Featured
                                    </span>
                                  )}

                                  {promotion.status ===
                                    "scheduled" && (
                                    <span className="rounded-full border border-sky-500/20 bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-400 backdrop-blur-sm">
                                      Coming Soon
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <Link
                              to={`/promotion/${promotion.id}`}
                              state={{
                                from: `/track/${track.id}`,
                                backLabel:
                                  "Back to Track",
                              }}
                              className="flex h-32 items-center justify-center bg-neutral-950"
                            >
                              <Megaphone className="h-8 w-8 text-neutral-600" />
                            </Link>
                          )}

                          <div className="p-4">
                            {/* Brand */}
                            <Link
                              to={`/brand/${brand.id}`}
                              state={{
                                from: `/track/${track.id}`,
                                backLabel:
                                  "Back to Track",
                              }}
                              className="flex items-center gap-3"
                            >
                              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                                {brand.logoUrl ? (
                                  <img
                                    src={
                                      brand.logoUrl
                                    }
                                    alt={`${brand.name} logo`}
                                    className="h-full w-full object-contain p-1.5"
                                  />
                                ) : (
                                  <span className="font-bold text-black">
                                    {brand.name
                                      .charAt(0)
                                      .toUpperCase()}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <p className="truncate text-sm font-semibold text-white">
                                    {brand.name}
                                  </p>

                                  {brand.verified && (
                                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-sky-400" />
                                  )}
                                </div>

                                <p className="mt-0.5 text-xs text-neutral-500">
                                  {brand.category}
                                </p>
                              </div>
                            </Link>

                            {/* Promotion */}
                            <Link
                              to={`/promotion/${promotion.id}`}
                              state={{
                                from: `/track/${track.id}`,
                                backLabel:
                                  "Back to Track",
                              }}
                              className="mt-4 block"
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                                {
                                  promotion.promotionType
                                }
                              </p>

                              <h3 className="mt-1 text-lg font-bold text-white">
                                {
                                  promotion.title
                                }
                              </h3>

                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">
                                {
                                  promotion.summary
                                }
                              </p>
                            </Link>

                            {(promotion.startDate ||
                              promotion.endDate) && (
                              <div className="mt-4 flex items-center gap-2 border-t border-neutral-800 pt-3 text-xs text-neutral-500">
                                <Calendar className="h-3.5 w-3.5" />

                                {promotion.startDate
                                  ? formatEventDate(
                                      promotion.startDate
                                    )
                                  : ""}

                                {promotion.startDate &&
                                  promotion.endDate &&
                                  " – "}

                                {promotion.endDate
                                  ? formatEventDate(
                                      promotion.endDate
                                    )
                                  : ""}
                              </div>
                            )}

                            <div className="mt-4 grid grid-cols-2 gap-3">
                              <Link
                                to={`/promotion/${promotion.id}`}
                                state={{
                                  from: `/track/${track.id}`,
                                  backLabel:
                                    "Back to Track",
                                }}
                                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-orange-500 px-3 text-sm font-semibold text-black transition hover:bg-orange-400"
                              >
                                View Promotion
                              </Link>

                              <Link
                                to={`/brand/${brand.id}`}
                                state={{
                                  from: `/track/${track.id}`,
                                  backLabel:
                                    "Back to Track",
                                }}
                                className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                              >
                                View Brand
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>

                <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-xs leading-5 text-neutral-500">
                    Sponsored content is
                    clearly labelled.
                    Featured placement does
                    not necessarily mean the
                    content is sponsored.
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-neutral-800/80 p-4">
      <div className="flex items-center gap-2 text-neutral-400">
        {icon}

        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-2 text-lg font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function DetailList({
  title,
  values,
}: {
  title: string;
  values: string[];
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {values.map(
          (value, index) => (
            <div
              key={`${value}-${index}`}
              className="flex items-start gap-2 rounded-2xl border border-neutral-800 bg-neutral-900 px-3 py-3"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-400" />

              <span className="text-sm text-neutral-300">
                {value}
              </span>
            </div>
          )
        )}
      </div>
    </section>
  );
}