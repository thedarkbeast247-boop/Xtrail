import {
  useMemo,
  type ReactNode,
} from "react";

import {
  Link,
  useLocation,
  useParams,
} from "react-router";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Mountain,
  Navigation,
  Phone,
  Route,
  Share2,
  Ticket,
} from "lucide-react";

import { mockTrails } from "../data/mockData";

import { useNotification } from "../context/NotificationContext";
import { usePhase2Content } from "../context/Phase2ContentContext";

import type { Event as XTrailEvent } from "../types/event";
import type { Track } from "../types/track";
import type { Brand } from "../types/brand";

type EventDetailNavigationState = {
  from?: string;
  backLabel?: string;
};

function formatDate(date: string) {
  return new Date(
    `${date}T12:00:00`
  ).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatEntryFee(
  event: XTrailEvent
) {
  if (
    event.entryFee === undefined ||
    event.entryFee === null
  ) {
    return "See event details";
  }

  if (event.entryFee <= 0) {
    return "Free";
  }

  return `R${event.entryFee.toFixed(2)}`;
}

function formatStatus(
  status: XTrailEvent["eventStatus"]
) {
  return status.charAt(0).toUpperCase() +
    status.slice(1);
}

function getStatusStyles(
  status: XTrailEvent["eventStatus"]
) {
  switch (status) {
    case "upcoming":
      return "border-sky-500/20 bg-sky-500/15 text-sky-400";

    case "ongoing":
      return "border-emerald-500/20 bg-emerald-500/15 text-emerald-400";

    case "completed":
      return "border-neutral-700 bg-neutral-800 text-neutral-400";

    case "cancelled":
      return "border-red-500/20 bg-red-500/15 text-red-400";

    default:
      return "border-neutral-700 bg-neutral-800 text-neutral-400";
  }
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

export function EventDetail() {
  const { id } = useParams();
  const location = useLocation();

  const {
    getEventById,
    getTrackById,
    getBrandById,
  } = usePhase2Content();

  const { showNotification } =
    useNotification();

  const navigationState =
    location.state as EventDetailNavigationState | null;

  const backTarget =
    navigationState?.from ??
    "/events";

  const backLabel =
    navigationState?.backLabel ??
    "Back to Events";

  const event =
    id
      ? getEventById(id)
      : undefined;

  const linkedTracks =
    useMemo(() => {
      if (!event) {
        return [];
      }

      return event.trackIds
        .map((trackId) =>
          getTrackById(trackId)
        )
        .filter(
          (
            track
          ): track is Track =>
            Boolean(track) &&
            track?.publicationStatus ===
              "published"
        );
    }, [
      event,
      getTrackById,
    ]);

  const linkedTrails =
    useMemo(() => {
      if (!event) {
        return [];
      }

      const trailIds =
        new Set(
          event.trailIds
        );

      return mockTrails.filter(
        (trail) =>
          trailIds.has(trail.id)
      );
    }, [event]);

  const linkedBrands =
    useMemo(() => {
      if (!event) {
        return [];
      }

      return event.brandIds
        .map((brandId) =>
          getBrandById(brandId)
        )
        .filter(
          (
            brand
          ): brand is Brand =>
            Boolean(brand) &&
            brand?.publicationStatus ===
              "published"
        );
    }, [
      event,
      getBrandById,
    ]);

  if (
    !event ||
    event.publicationStatus !==
      "published"
  ) {
    return (
      <div className="min-h-screen bg-neutral-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <Link
            to={backTarget}
            className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            {backLabel}
          </Link>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
            <h1 className="text-2xl font-bold">
              Event not found
            </h1>

            <p className="mt-2 text-neutral-400">
              This event does not
              exist or has not been
              published yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const directionsQuery =
    event.lat !== undefined &&
    event.lng !== undefined
      ? `${event.lat},${event.lng}`
      : [
          event.address,
          event.location,
          event.province,
          event.country,
        ]
          .filter(Boolean)
          .join(", ");

  const directionsUrl =
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      directionsQuery
    )}`;

  const handleShare =
    async () => {
      const eventUrl =
        window.location.href;

      const shareText = [
        "Check out this event on XTrail:",
        "",
        event.name,
        formatDate(
          event.startDate
        ),
        event.location,
        "",
        eventUrl,
      ]
        .filter(Boolean)
        .join("\n");

      try {
        if (navigator.share) {
          await navigator.share({
            title: event.name,
            text: shareText,
            url: eventUrl,
          });

          return;
        }

        await navigator.clipboard.writeText(
          shareText
        );

        showNotification({
          title:
            "Event link copied",
          message:
            "The event link was copied to your clipboard.",
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
          "Failed to share event:",
          error
        );

        showNotification({
          title: "Share failed",
          message:
            "Unable to share this event right now.",
          variant: "error",
        });
      }
    };

  return (
    <div className="min-h-screen bg-neutral-950 pb-28 text-white">
      <div className="mx-auto max-w-4xl">
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
          <div className="relative h-72 sm:h-96">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
                <Calendar className="h-14 w-14 text-neutral-600" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {event.eventType}
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-sm ${getStatusStyles(
                  event.eventStatus
                )}`}
              >
                {formatStatus(
                  event.eventStatus
                )}
              </span>

              {event.featured && (
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                  Featured
                </span>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <h1 className="text-3xl font-bold sm:text-4xl">
                {event.name}
              </h1>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />

                  {formatDate(
                    event.startDate
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />

                  {event.location},{" "}
                  {event.province}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3">
              <InfoCard
                icon={
                  <Calendar className="h-4 w-4 text-orange-400" />
                }
                label="Start"
                value={formatDate(
                  event.startDate
                )}
              />

              <InfoCard
                icon={
                  <Ticket className="h-4 w-4 text-orange-400" />
                }
                label="Entry"
                value={formatEntryFee(
                  event
                )}
              />

              <InfoCard
                icon={
                  <Clock className="h-4 w-4 text-orange-400" />
                }
                label="Time"
                value={
                  event.startTime
                    ? event.endTime
                      ? `${event.startTime} – ${event.endTime}`
                      : event.startTime
                    : "TBA"
                }
              />

              <InfoCard
                icon={
                  <Route className="h-4 w-4 text-orange-400" />
                }
                label="Locations"
                value={`${linkedTracks.length} track${
                  linkedTracks.length ===
                  1
                    ? ""
                    : "s"
                } • ${linkedTrails.length} trail${
                  linkedTrails.length ===
                  1
                    ? ""
                    : "s"
                }`}
              />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-semibold text-white"
              >
                <Navigation className="h-4 w-4" />

                Directions
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-semibold text-white"
              >
                <Share2 className="h-4 w-4" />

                Share
              </button>
            </div>

            {/* Overview */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
              <h2 className="text-lg font-semibold">
                About This Event
              </h2>

              <p className="mt-3 leading-7 text-neutral-300">
                {event.description}
              </p>

              {event.endDate && (
                <p className="mt-4 text-sm text-neutral-400">
                  Ends{" "}
                  {formatDate(
                    event.endDate
                  )}
                </p>
              )}
            </section>

            {/* Registration */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
              <h2 className="text-lg font-semibold">
                Registration
              </h2>

              <div className="mt-4 space-y-3">
                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-neutral-500">
                    Required
                  </span>

                  <span className="font-medium text-white">
                    {event.registrationRequired
                      ? "Yes"
                      : "No"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-neutral-500">
                    Entry fee
                  </span>

                  <span className="font-medium text-white">
                    {formatEntryFee(
                      event
                    )}
                  </span>
                </div>

                {event.entryFeeNotes && (
                  <p className="rounded-2xl bg-neutral-950 p-3 text-sm leading-6 text-neutral-400">
                    {
                      event.entryFeeNotes
                    }
                  </p>
                )}

                {event.registrationUrl && (
                  <a
                    href={getExternalUrl(
                      event.registrationUrl
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-black hover:bg-orange-400"
                  >
                    Register for Event

                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </section>

            {/* Riding Locations */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                Event Locations
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Tracks & Trails
              </h2>

              <p className="mt-1 text-sm text-neutral-400">
                This event can use one
                or more tracks, trails,
                or a combination of
                both.
              </p>

              {linkedTracks.length ===
                0 &&
              linkedTrails.length ===
                0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-500">
                  No XTrail track or
                  trail has been linked
                  to this event yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {linkedTracks.map(
                    (track) => (
                      <Link
                        key={track.id}
                        to={`/track/${track.id}`}
                        state={{
                          from: `/event/${event.id}`,
                          backLabel:
                            "Back to Event",
                        }}
                        className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 transition hover:border-orange-500/30"
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
                          {track.imageUrl ? (
                            <img
                              src={
                                track.imageUrl
                              }
                              alt={
                                track.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Route className="h-5 w-5 text-neutral-600" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                            Track
                          </p>

                          <h3 className="truncate font-semibold">
                            {track.name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {
                              track.trackType
                            }{" "}
                            •{" "}
                            {
                              track.location
                            }
                          </p>
                        </div>
                      </Link>
                    )
                  )}

                  {linkedTrails.map(
                    (trail) => (
                      <Link
                        key={trail.id}
                        to={`/trail/${trail.id}`}
                        state={{
                          from: `/event/${event.id}`,
                          backLabel:
                            "Back to Event",
                        }}
                        className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 transition hover:border-emerald-500/30"
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
                          {trail.imageUrl ? (
                            <img
                              src={
                                trail.imageUrl
                              }
                              alt={
                                trail.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Mountain className="h-5 w-5 text-neutral-600" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                            Trail
                          </p>

                          <h3 className="truncate font-semibold">
                            {trail.name}
                          </h3>

                          <p className="mt-1 truncate text-xs text-neutral-500">
                            {
                              trail.trailType
                            }{" "}
                            •{" "}
                            {
                              trail.location
                            }
                          </p>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Requirements */}
            {event.requirements.length >
              0 && (
              <DetailList
                title="Requirements"
                values={
                  event.requirements
                }
              />
            )}

            {/* Rules */}
            {event.rules.length >
              0 && (
              <DetailList
                title="Event Rules"
                values={event.rules}
              />
            )}

            {/* Organizer */}
            {(event.organizerName ||
              event.organizerPhone ||
              event.organizerEmail ||
              event.organizerWebsite) && (
              <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                <h2 className="text-lg font-semibold">
                  Organizer
                </h2>

                {event.organizerName && (
                  <p className="mt-2 font-medium text-white">
                    {
                      event.organizerName
                    }
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {event.organizerPhone && (
                    <a
                      href={`tel:${event.organizerPhone}`}
                      className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm text-white"
                    >
                      <Phone className="h-4 w-4 text-orange-400" />

                      Call
                    </a>
                  )}

                  {event.organizerEmail && (
                    <a
                      href={`mailto:${event.organizerEmail}`}
                      className="inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm text-white"
                    >
                      <Mail className="h-4 w-4 text-orange-400" />

                      Email
                    </a>
                  )}

                  {event.organizerWebsite && (
                    <a
                      href={getExternalUrl(
                        event.organizerWebsite
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="col-span-2 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm text-white"
                    >
                      <Globe className="h-4 w-4 text-orange-400" />

                      Organizer Website
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Sponsors / brands */}
            {linkedBrands.length > 0 && (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  Partners
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Event Brands
                </h2>

                <div className="mt-4 space-y-3">
                  {linkedBrands.map(
                    (brand) => (
                      <Link
                        key={
                          brand.id
                        }
                        to={`/brand/${brand.id}`}
                        state={{
                          from: `/event/${event.id}`,
                          backLabel:
                            "Back to Event",
                        }}
                        className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-3 transition hover:border-orange-500/30"
                      >
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                          {brand.logoUrl ? (
                            <img
                              src={
                                brand.logoUrl
                              }
                              alt={
                                brand.name
                              }
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-lg font-bold text-black">
                              {brand.name
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {
                              brand.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {
                              brand.category
                            }
                          </p>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Gallery */}
            {event.galleryImageUrls
              .length > 0 && (
              <section>
                <h2 className="text-xl font-bold">
                  Event Photos
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {event.galleryImageUrls.map(
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
                          alt={`${event.name} photo ${
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

      <p className="mt-2 text-sm font-bold text-white">
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
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <div className="mt-4 space-y-3">
        {values.map(
          (value, index) => (
            <div
              key={`${value}-${index}`}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-400" />

              <p className="text-sm leading-6 text-neutral-300">
                {value}
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}