import {
  BadgeCheck,
  Calendar,
  Megaphone,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router";

import type { Brand } from "../../types/brand";
import type { Promotion } from "../../types/promotion";

type PromotionCardProps = {
  promotion: Promotion;
  brand?: Brand;
  compact?: boolean;
};

function formatDate(date?: string) {
  if (!date) {
    return "";
  }

  return new Date(
    `${date}T12:00:00`
  ).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPromotionLabel(
  promotion: Promotion
) {
  if (promotion.status === "scheduled") {
    return "Coming Soon";
  }

  switch (promotion.promotionType) {
    case "Bike Release":
      return "New Bike";

    case "Gear Release":
      return "New Gear";

    case "Product Release":
      return "New Product";

    case "Brand Campaign":
      return "Brand Campaign";

    case "Event Campaign":
      return "Event Campaign";

    case "Announcement":
      return "Announcement";

    default:
      return promotion.promotionType;
  }
}

export function PromotionCard({
  promotion,
  brand,
  compact = false,
}: PromotionCardProps) {
  return (
    <Link
      to={`/promotion/${promotion.id}`}
      state={{
        from: "/promotions",
        backLabel: "Back to Promotions",
      }}
      className="block"
    >
      <article className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 transition hover:border-orange-500/30 active:scale-[0.995]">
        <div
          className={`relative overflow-hidden bg-neutral-800 ${
            compact ? "h-40" : "h-52"
          }`}
        >
          {promotion.imageUrl ? (
            <img
              src={promotion.imageUrl}
              alt={promotion.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
              <Megaphone className="h-10 w-10 text-neutral-600" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {promotion.sponsored && (
              <span className="rounded-full border border-white/10 bg-black/75 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                Sponsored
              </span>
            )}

            {promotion.featured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                <Sparkles className="h-3 w-3" />
                Featured
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
              {getPromotionLabel(
                promotion
              )}
            </p>

            <h2 className="mt-1 line-clamp-2 text-xl font-bold text-white">
              {promotion.title}
            </h2>
          </div>
        </div>

        <div className="space-y-4 p-4">
          {brand && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
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

                <p className="text-xs text-neutral-500">
                  {brand.category}
                </p>
              </div>
            </div>
          )}

          <p className="line-clamp-3 text-sm leading-6 text-neutral-400">
            {promotion.summary}
          </p>

          {(promotion.startDate ||
            promotion.endDate) && (
            <div className="flex items-center gap-2 border-t border-neutral-800 pt-3 text-xs text-neutral-500">
              <Calendar className="h-3.5 w-3.5" />

              {promotion.startDate &&
                formatDate(
                  promotion.startDate
                )}

              {promotion.startDate &&
                promotion.endDate &&
                " – "}

              {promotion.endDate &&
                formatDate(
                  promotion.endDate
                )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}