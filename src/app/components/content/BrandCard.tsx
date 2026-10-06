import {
  BadgeCheck,
  ExternalLink,
  Megaphone,
} from "lucide-react";

import { Link } from "react-router";

import type { Brand } from "../../types/brand";

type BrandCardProps = {
  brand: Brand;
  activePromotionCount?: number;
};

export function BrandCard({
  brand,
  activePromotionCount = 0,
}: BrandCardProps) {
  return (
    <Link
      to={`/brand/${brand.id}`}
      state={{
        from: "/brands",
        backLabel: "Back to Brands",
      }}
      className="block"
    >
      <article className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 transition hover:border-orange-500/30 active:scale-[0.995]">
        {/* Banner */}
        <div className="relative h-32 overflow-hidden bg-neutral-800">
          {brand.bannerImageUrl ? (
            <img
              src={brand.bannerImageUrl}
              alt={`${brand.name} banner`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-black" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {brand.featured && (
            <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-black">
              Featured
            </span>
          )}
        </div>

        <div className="relative px-4 pb-4">
          {/* Logo */}
          <div className="-mt-10 flex items-end justify-between gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-neutral-900 bg-white shadow-lg">
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={`${brand.name} logo`}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <span className="text-2xl font-bold text-black">
                  {brand.name
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
            </div>

            {brand.website && (
              <ExternalLink className="mb-2 h-4 w-4 text-neutral-500" />
            )}
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-lg font-bold text-white">
                {brand.name}
              </h2>

              {brand.verified && (
                <BadgeCheck className="h-5 w-5 flex-shrink-0 text-sky-400" />
              )}
            </div>

            <p className="mt-1 text-xs font-medium uppercase tracking-wide text-orange-400">
              {brand.category}
            </p>

            {brand.description && (
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-400">
                {brand.description}
              </p>
            )}

            {activePromotionCount > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400">
                <Megaphone className="h-3.5 w-3.5" />

                {activePromotionCount} active{" "}
                {activePromotionCount === 1
                  ? "promotion"
                  : "promotions"}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}