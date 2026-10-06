import {
  useMemo,
} from "react";

import {
  Link,
  useLocation,
  useParams,
} from "react-router";

import {
  ArrowLeft,
  BadgeCheck,
  Calendar,
  ExternalLink,
  MapPin,
  Megaphone,
  Mountain,
  Route,
  Share2,
} from "lucide-react";

import { mockTrails } from "../data/mockData";

import { useNotification } from "../context/NotificationContext";
import { usePhase2Content } from "../context/Phase2ContentContext";

function formatDate(date?: string) {
  if (!date) {
    return "";
  }

  return new Date(
    `${date}T12:00:00`
  ).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type PromotionNavigationState = {
  from?: string;
  backLabel?: string;
};

export function PromotionDetail() {
  const { id } = useParams();
  const location = useLocation();

  const {
    getPromotionById,
    getBrandById,
    getTrackById,
    getEventById,
  } = usePhase2Content();

  const { showNotification } =
    useNotification();

  const navigationState =
    location.state as PromotionNavigationState | null;

  const backTarget =
    navigationState?.from ??
    "/promotions";

  const backLabel =
    navigationState?.backLabel ??
    "Back to Promotions";

  const promotion =
    id
      ? getPromotionById(id)
      : undefined;

  const brand =
    promotion
      ? getBrandById(
          promotion.brandId
        )
      : undefined;

  const linkedTracks =
    useMemo(() => {
      if (!promotion) {
        return [];
      }

      return promotion.trackIds
        .map((trackId) =>
          getTrackById(trackId)
        )
        .filter(
          (track) =>
            track?.publicationStatus ===
            "published"
        );
    }, [
      promotion,
      getTrackById,
    ]);

  const linkedTrails =
    useMemo(() => {
      if (!promotion) {
        return [];
      }

      const trailIds =
        new Set(
          promotion.trailIds
        );

      return mockTrails.filter(
        (trail) =>
          trailIds.has(trail.id)
      );
    }, [promotion]);

  const linkedEvents =
    useMemo(() => {
      if (!promotion) {
        return [];
      }

      return promotion.eventIds
        .map((eventId) =>
          getEventById(eventId)
        )
        .filter(
          (event) =>
            event?.publicationStatus ===
              "published" &&
            event.eventStatus !==
              "cancelled"
        );
    }, [
      promotion,
      getEventById,
    ]);

  if (
    !promotion ||
    !brand ||
    brand.publicationStatus !==
      "published" ||
    ![
      "active",
      "scheduled",
    ].includes(promotion.status)
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
              Promotion unavailable
            </h1>

            <p className="mt-2 text-neutral-400">
              This content does not
              exist or is not currently
              available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleShare =
    async () => {
      const promotionUrl =
        window.location.href;

      const text = [
        promotion.title,
        brand.name,
        promotion.summary,
        "",
        promotionUrl,
      ]
        .filter(Boolean)
        .join("\n");

      try {
        if (navigator.share) {
          await navigator.share({
            title:
              promotion.title,
            text,
            url: promotionUrl,
          });

          return;
        }

        await navigator.clipboard.writeText(
          text
        );

        showNotification({
          title:
            "Promotion link copied",
          message:
            "The link was copied to your clipboard.",
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

        showNotification({
          title: "Share failed",
          message:
            "Unable to share this content right now.",
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

        <div className="overflow-hidden border-y border-neutral-800 bg-neutral-900 sm:rounded-3xl sm:border">
          {/* Hero */}
          <div className="relative h-72 overflow-hidden sm:h-[420px]">
            {promotion.imageUrl ? (
              <img
                src={
                  promotion.imageUrl
                }
                alt={
                  promotion.title
                }
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
                <Megaphone className="h-14 w-14 text-neutral-600" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                {
                  promotion.promotionType
                }
              </span>

              {promotion.sponsored && (
                <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold">
                  Sponsored
                </span>
              )}

              {promotion.status ===
                "scheduled" && (
                <span className="rounded-full border border-sky-500/20 bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-400">
                  Coming Soon
                </span>
              )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                {
                  promotion.promotionType
                }
              </p>

              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                {promotion.title}
              </h1>
            </div>
          </div>

          <div className="space-y-6 p-4 sm:p-6">
            {/* Brand */}
            <Link
              to={`/brand/${brand.id}`}
              state={{
                from: `/promotion/${promotion.id}`,
                backLabel:
                  "Back to Promotion",
              }}
              className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3"
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span className="text-xl font-bold text-black">
                    {brand.name
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold">
                    {brand.name}
                  </p>

                  {brand.verified && (
                    <BadgeCheck className="h-4 w-4 flex-shrink-0 text-sky-400" />
                  )}
                </div>

                <p className="mt-1 text-xs text-neutral-500">
                  {brand.category}
                </p>
              </div>
            </Link>

            {/* Share */}
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-4 text-sm font-semibold"
            >
              <Share2 className="h-4 w-4" />

              Share
            </button>

            {/* Summary */}
            <section>
              <p className="text-lg font-medium leading-7 text-neutral-200">
                {promotion.summary}
              </p>

              <p className="mt-4 whitespace-pre-line leading-7 text-neutral-400">
                {
                  promotion.description
                }
              </p>
            </section>

            {/* Dates */}
            {(promotion.startDate ||
              promotion.endDate) && (
              <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-orange-400" />

                  <div>
                    <p className="font-semibold">
                      Campaign Period
                    </p>

                    <p className="mt-1 text-sm text-neutral-400">
                      {promotion.startDate
                        ? formatDate(
                            promotion.startDate
                          )
                        : "No start date"}

                      {promotion.endDate
                        ? ` – ${formatDate(
                            promotion.endDate
                          )}`
                        : ""}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* CTA */}
            {promotion.ctaUrl &&
              promotion.ctaLabel && (
                <a
                  href={
                    promotion.ctaUrl.startsWith(
                      "http"
                    )
                      ? promotion.ctaUrl
                      : `https://${promotion.ctaUrl}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-black hover:bg-orange-400"
                >
                  {
                    promotion.ctaLabel
                  }

                  <ExternalLink className="h-4 w-4" />
                </a>
              )}

            {/* Gallery */}
            {promotion.galleryImageUrls
              .length > 0 && (
              <section>
                <h2 className="text-xl font-bold">
                  Gallery
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {promotion.galleryImageUrls.map(
                    (
                      imageUrl,
                      index
                    ) => (
                      <div
                        key={`${imageUrl}-${index}`}
                        className="aspect-square overflow-hidden rounded-2xl border border-neutral-800"
                      >
                        <img
                          src={
                            imageUrl
                          }
                          alt={`${promotion.title} ${
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

            {/* Promoted Locations */}
            {(linkedTracks.length >
              0 ||
              linkedTrails.length >
                0) && (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  Discover
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Featured Riding Locations
                </h2>

                <div className="mt-4 space-y-3">
                  {linkedTracks.map(
                    (track) =>
                      track && (
                        <Link
                          key={
                            track.id
                          }
                          to={`/track/${track.id}`}
                          state={{
                            from: `/promotion/${promotion.id}`,
                            backLabel:
                              "Back to Promotion",
                          }}
                          className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3"
                        >
                          <Route className="h-5 w-5 flex-shrink-0 text-orange-400" />

                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase text-orange-400">
                              Track
                            </p>

                            <p className="truncate font-semibold">
                              {
                                track.name
                              }
                            </p>

                            <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                              <MapPin className="h-3 w-3" />

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
                          from: `/promotion/${promotion.id}`,
                          backLabel:
                            "Back to Promotion",
                        }}
                        className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3"
                      >
                        <Mountain className="h-5 w-5 flex-shrink-0 text-emerald-400" />

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase text-emerald-400">
                            Trail
                          </p>

                          <p className="truncate font-semibold">
                            {
                              trail.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {
                              trail.location
                            }
                          </p>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </section>
            )}

            {/* Events */}
            {linkedEvents.length >
              0 && (
              <section>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                  Events
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Related Events
                </h2>

                <div className="mt-4 space-y-3">
                  {linkedEvents.map(
                    (event) =>
                      event && (
                        <Link
                          key={
                            event.id
                          }
                          to={`/event/${event.id}`}
                          state={{
                            from: `/promotion/${promotion.id}`,
                            backLabel:
                              "Back to Promotion",
                          }}
                          className="block rounded-2xl border border-neutral-800 bg-neutral-950 p-4"
                        >
                          <p className="font-semibold">
                            {
                              event.name
                            }
                          </p>

                          <p className="mt-1 text-xs text-neutral-500">
                            {
                              event.eventType
                            }{" "}
                            •{" "}
                            {
                              event.location
                            }
                          </p>
                        </Link>
                      )
                  )}
                </div>
              </section>
            )}

            {/* Transparency */}
            {promotion.sponsored && (
              <section className="rounded-3xl border border-orange-500/15 bg-orange-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400" />

                  <div>
                    <p className="text-sm font-semibold">
                      Sponsored Content
                    </p>

                    <p className="mt-1 text-xs leading-5 text-neutral-400">
                      This content is
                      promotional material
                      from or on behalf of
                      the listed brand.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}