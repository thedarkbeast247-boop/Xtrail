import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Megaphone,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Link } from "react-router";

import { PromotionCard } from "../components/content/PromotionCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import { usePhase2Content } from "../context/Phase2ContentContext";

import type {
  PromotionStatus,
  PromotionType,
} from "../types/promotion";

const promotionTypes: PromotionType[] = [
  "Bike Release",
  "Gear Release",
  "Product Release",
  "Brand Campaign",
  "Event Campaign",
  "Announcement",
];

type PromotionTypeFilter =
  | "All"
  | PromotionType;

type CommercialFilter =
  | "All"
  | "Sponsored"
  | "Organic";

function isPublicStatus(
  status: PromotionStatus
) {
  return (
    status === "active" ||
    status === "scheduled"
  );
}

export function Promotions() {
  const {
    promotions,
    brands,
  } = usePhase2Content();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedType,
    setSelectedType,
  ] =
    useState<PromotionTypeFilter>("All");

  const [
    commercialFilter,
    setCommercialFilter,
  ] =
    useState<CommercialFilter>("All");

  const [
    showFilters,
    setShowFilters,
  ] =
    useState(false);

  const publishedBrandIds =
    useMemo(() => {
      return new Set(
        brands
          .filter(
            (brand) =>
              brand.publicationStatus ===
              "published"
          )
          .map((brand) => brand.id)
      );
    }, [brands]);

  const visiblePromotions =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLowerCase();

      return promotions
        .filter((promotion) =>
          isPublicStatus(
            promotion.status
          )
        )
        .filter((promotion) =>
          publishedBrandIds.has(
            promotion.brandId
          )
        )
        .filter((promotion) => {
          if (!normalizedQuery) {
            return true;
          }

          const brand =
            brands.find(
              (candidate) =>
                candidate.id ===
                promotion.brandId
            );

          const searchableText = [
            promotion.title,
            promotion.summary,
            promotion.description,
            promotion.promotionType,
            brand?.name ?? "",
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedQuery
          );
        })
        .filter((promotion) => {
          if (
            selectedType ===
            "All"
          ) {
            return true;
          }

          return (
            promotion.promotionType ===
            selectedType
          );
        })
        .filter((promotion) => {
          if (
            commercialFilter ===
            "All"
          ) {
            return true;
          }

          if (
            commercialFilter ===
            "Sponsored"
          ) {
            return promotion.sponsored;
          }

          return !promotion.sponsored;
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
            a.status !==
            b.status
          ) {
            return a.status ===
              "active"
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
      promotions,
      brands,
      publishedBrandIds,
      searchQuery,
      selectedType,
      commercialFilter,
    ]);

  const activeFilterCount =
    [
      selectedType !== "All",
      commercialFilter !== "All",
    ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedType("All");
    setCommercialFilter("All");
  };

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
              What's New
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Releases & Promotions
            </h1>

            <p className="mt-1 text-sm leading-6 text-neutral-400">
              New bikes, riding gear,
              products, brand campaigns
              and announcements from the
              off-road industry.
            </p>
          </div>

          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
            <Megaphone className="h-5 w-5" />
          </div>
        </div>

        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

          <Input
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search bikes, gear, products or brands..."
            className="h-11 border-neutral-800 bg-neutral-900 pl-10 pr-10 text-white placeholder:text-neutral-600"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() =>
                setSearchQuery("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setShowFilters(
                (previous) =>
                  !previous
              )
            }
            className="gap-2 border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
          >
            <SlidersHorizontal className="h-4 w-4" />

            Filters

            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-bold text-black">
                {activeFilterCount}
              </span>
            )}
          </Button>

          <p className="text-xs text-neutral-500">
            {visiblePromotions.length}{" "}
            {visiblePromotions.length ===
            1
              ? "item"
              : "items"}
          </p>
        </div>
      </div>

      {showFilters && (
        <div className="border-b border-neutral-800 bg-neutral-900/70 px-4 py-4">
          <div className="space-y-5">
            <FilterSection
              title="Content Type"
              values={[
                "All",
                ...promotionTypes,
              ]}
              selected={
                selectedType
              }
              onSelect={(value) =>
                setSelectedType(
                  value as PromotionTypeFilter
                )
              }
            />

            <FilterSection
              title="Content"
              values={[
                "All",
                "Sponsored",
                "Organic",
              ]}
              selected={
                commercialFilter
              }
              onSelect={(value) =>
                setCommercialFilter(
                  value as CommercialFilter
                )
              }
            />

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-orange-400 hover:text-orange-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-5 px-4 pb-32 pt-5">
        {visiblePromotions.length ===
        0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900 p-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-500">
              <Megaphone className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Nothing to show yet
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Product launches and
              brand campaigns will
              appear here when
              published.
            </p>
          </div>
        ) : (
          visiblePromotions.map(
            (promotion) => {
              const brand =
                brands.find(
                  (candidate) =>
                    candidate.id ===
                    promotion.brandId
                );

              return (
                <PromotionCard
                  key={promotion.id}
                  promotion={
                    promotion
                  }
                  brand={brand}
                />
              );
            }
          )
        )}
      </div>
    </div>
  );
}

function FilterSection({
  title,
  values,
  selected,
  onSelect,
}: {
  title: string;
  values: readonly string[];
  selected: string;
  onSelect: (
    value: string
  ) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        {title}
      </p>

      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const isSelected =
            selected === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() =>
                onSelect(value)
              }
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? "border-orange-500 bg-orange-500 text-black"
                  : "border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-neutral-600"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}