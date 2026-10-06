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
  Facebook,
  Globe,
  Instagram,
  Mail,
  Megaphone,
  MessageCircle,
  Phone,
  Store,
} from "lucide-react";

import { usePhase2Content } from "../context/Phase2ContentContext";

type BrandDetailNavigationState = {
  from?: string;
  backLabel?: string;
};

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

function formatPromotionType(
  value: string
) {
  return value;
}

export function BrandDetail() {
  const { id } = useParams();
  const location = useLocation();

  const {
    events,
    getBrandById,
    getPromotionsForBrand,
  } = usePhase2Content();

  const navigationState =
    location.state as BrandDetailNavigationState | null;

  const backTarget =
    navigationState?.from ??
    "/brands";

  const backLabel =
    navigationState?.backLabel ??
    "Back to Brands";

  const brand =
    id
      ? getBrandById(id)
      : undefined;

  const brandEvents =
    useMemo(() => {
      if (!brand) {
        return [];
      }

      return events
        .filter(
          (event) =>
            event.brandIds.includes(
              brand.id
            ) &&
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
      brand,
      events,
    ]);

  const brandPromotions =
    useMemo(() => {
      if (!brand) {
        return [];
      }

      return getPromotionsForBrand(
        brand.id
      )
        .filter(
          (promotion) =>
            promotion.status ===
              "active" ||
            promotion.status ===
              "scheduled"
        )
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
            a.startDate &&
            b.startDate
          ) {
            return (
              new Date(
                b.startDate
              ).getTime() -
              new Date(
                a.startDate
              ).getTime()
            );
          }

          return 0;
        });
    }, [
      brand,
      getPromotionsForBrand,
    ]);

  if (
    !brand ||
    brand.publicationStatus !==
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
              Brand not found
            </h1>

            <p className="mt-2 text-neutral-400">
              This brand does not exist
              or has not been published
              yet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const whatsappNumber =
    brand.whatsapp
      ?.replace(/\D/g, "");

  const instagramUrl =
    brand.instagram
      ? brand.instagram.startsWith(
          "http"
        )
        ? brand.instagram
        : `https://instagram.com/${brand.instagram.replace(
            "@",
            ""
          )}`
      : "";

  const facebookUrl =
    brand.facebook
      ? getExternalUrl(
          brand.facebook
        )
      : "";

  const youtubeUrl =
    brand.youtube
      ? getExternalUrl(
          brand.youtube
        )
      : "";

  const tiktokUrl =
    brand.tiktok
      ? getExternalUrl(
          brand.tiktok
        )
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
        <div className="overflow-hidden border-y border-neutral-800 bg-neutral-900 sm:rounded-3xl sm:border">
          <div className="relative h-56 overflow-hidden bg-neutral-800 sm:h-72">
            {brand.bannerImageUrl ? (
              <img
                src={
                  brand.bannerImageUrl
                }
                alt={`${brand.name} banner`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            {brand.featured && (
              <span className="absolute right-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                Featured Brand
              </span>
            )}
          </div>

          <div className="relative space-y-6 p-4 sm:p-6">
            {/* Brand identity */}
            <div className="-mt-16 flex items-end gap-4">
              <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-neutral-900 bg-white shadow-xl">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={`${brand.name} logo`}
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <span className="text-3xl font-bold text-black">
                    {brand.name
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-3xl font-bold">
                    {brand.name}
                  </h1>

                  {brand.verified && (
                    <BadgeCheck className="h-6 w-6 flex-shrink-0 text-sky-400" />
                  )}
                </div>

                <p className="mt-1 text-sm font-medium text-orange-400">
                  {brand.category}
                </p>
              </div>
            </div>

            {brand.verified && (
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-400">
                <BadgeCheck className="h-4 w-4" />

                Official XTrail Brand
              </div>
            )}

            {/* About */}
            <section>
              <h2 className="text-xl font-bold">
                About {brand.name}
              </h2>

              <p className="mt-3 leading-7 text-neutral-300">
                {brand.description}
              </p>
            </section>

            {/* External actions */}
            {(brand.website ||
              brand.email ||
              brand.phone ||
              whatsappNumber) && (
              <div className="grid grid-cols-2 gap-3">
                {brand.website && (
                  <a
                    href={getExternalUrl(
                      brand.website
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-orange-500 px-3 text-sm font-semibold text-black hover:bg-orange-400"
                  >
                    <Globe className="h-4 w-4" />

                    Website
                  </a>
                )}

                {brand.phone && (
                  <a
                    href={`tel:${brand.phone}`}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-semibold text-white"
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
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-semibold text-white"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-400" />

                    WhatsApp
                  </a>
                )}

                {brand.email && (
                  <a
                    href={`mailto:${brand.email}`}
                    className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-950 px-3 text-sm font-semibold text-white"
                  >
                    <Mail className="h-4 w-4 text-orange-400" />

                    Email
                  </a>
                )}
              </div>
            )}

            {/* Promotions */}
            <section>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                    Latest
                  </p>

                  <h2 className="mt-1 text-xl font-bold">
                    Releases & Promotions
                  </h2>
                </div>

                {brandPromotions.length >
                  0 && (
                  <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-400">
                    {
                      brandPromotions.length
                    }
                  </span>
                )}
              </div>

              {brandPromotions.length ===
              0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-neutral-800 bg-neutral-950 p-5">
                  <div className="flex items-start gap-3">
                    <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-600" />

                    <div>
                      <p className="text-sm font-semibold">
                        No active releases
                      </p>

                      <p className="mt-1 text-xs leading-5 text-neutral-500">
                        Product launches,
                        bike releases and
                        sponsored campaigns
                        from this brand will
                        appear here.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  {brandPromotions.map(
                    (promotion) => (
                      <article
                        key={
                          promotion.id
                        }
                        className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950"
                      >
                        {promotion.imageUrl && (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={
                                promotion.imageUrl
                              }
                              alt={
                                promotion.title
                              }
                              className="h-full w-full object-cover"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                            {promotion.sponsored && (
                              <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                                Sponsored
                              </span>
                            )}
                          </div>
                        )}

                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
                            {formatPromotionType(
                              promotion.promotionType
                            )}
                          </p>

                          <h3 className="mt-1 text-lg font-bold">
                            {
                              promotion.title
                            }
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-neutral-400">
                            {
                              promotion.summary
                            }
                          </p>

                          {promotion.ctaUrl &&
                            promotion.ctaLabel && (
                              <a
                                href={getExternalUrl(
                                  promotion.ctaUrl
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300"
                              >
                                {
                                  promotion.ctaLabel
                                }

                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                        </div>
                      </article>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Events */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                Community
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Brand Events
              </h2>

              {brandEvents.length ===
              0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-neutral-800 bg-neutral-950 p-5">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-600" />

                    <div>
                      <p className="text-sm font-semibold">
                        No linked events
                      </p>

                      <p className="mt-1 text-xs text-neutral-500">
                        Sponsored events,
                        demo days and
                        product launches
                        will appear here.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {brandEvents.map(
                    (event) => (
                      <Link
                        key={
                          event.id
                        }
                        to={`/event/${event.id}`}
                        state={{
                          from: `/brand/${brand.id}`,
                          backLabel:
                            "Back to Brand",
                        }}
                        className="block rounded-2xl border border-neutral-800 bg-neutral-950 p-4 transition hover:border-orange-500/30"
                      >
                        <p className="font-semibold">
                          {event.name}
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          {new Date(
                            `${event.startDate}T12:00:00`
                          ).toLocaleDateString(
                            "en-ZA",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                          {" • "}
                          {
                            event.eventType
                          }
                        </p>

                        <p className="mt-1 text-xs text-neutral-400">
                          {
                            event.location
                          }
                          ,{" "}
                          {
                            event.province
                          }
                        </p>
                      </Link>
                    )
                  )}
                </div>
              )}
            </section>

            {/* Social */}
            {(instagramUrl ||
              facebookUrl ||
              youtubeUrl ||
              tiktokUrl) && (
              <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
                <h2 className="text-lg font-semibold">
                  Follow {brand.name}
                </h2>

                <div className="mt-4 flex flex-wrap gap-3">
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-800"
                    >
                      <Instagram className="h-4 w-4 text-pink-400" />

                      Instagram
                    </a>
                  )}

                  {facebookUrl && (
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-800"
                    >
                      <Facebook className="h-4 w-4 text-blue-400" />

                      Facebook
                    </a>
                  )}

                  {youtubeUrl && (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-800"
                    >
                      <ExternalLink className="h-4 w-4 text-red-400" />

                      YouTube
                    </a>
                  )}

                  {tiktokUrl && (
                    <a
                      href={tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-neutral-700 px-4 py-2 text-sm text-white hover:bg-neutral-800"
                    >
                      <ExternalLink className="h-4 w-4" />

                      TikTok
                    </a>
                  )}
                </div>
              </section>
            )}

            {/* Commercial transparency */}
            <section className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4">
              <div className="flex items-start gap-3">
                <Store className="mt-0.5 h-5 w-5 flex-shrink-0 text-neutral-500" />

                <div>
                  <p className="text-sm font-semibold text-neutral-300">
                    Brand Content
                  </p>

                  <p className="mt-1 text-xs leading-5 text-neutral-500">
                    Sponsored or promotional
                    content is labelled so
                    riders can distinguish
                    commercial content from
                    normal XTrail discovery
                    information.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}