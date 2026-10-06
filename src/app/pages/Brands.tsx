import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  BadgeCheck,
  Search,
  SlidersHorizontal,
  Store,
  X,
} from "lucide-react";

import { Link } from "react-router";

import { BrandCard } from "../components/content/BrandCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import { usePhase2Content } from "../context/Phase2ContentContext";

import type { BrandCategory } from "../types/brand";

const brandCategories: BrandCategory[] = [
  "Motorcycle Manufacturer",
  "4x4 Manufacturer",
  "Riding Gear",
  "Parts & Accessories",
  "Tyres",
  "Suspension",
  "Workshop",
  "Training",
  "Tour Operator",
  "Track Operator",
  "Event Organizer",
  "Other",
];

type BrandCategoryFilter =
  | "All"
  | BrandCategory;

type VerificationFilter =
  | "All"
  | "Verified"
  | "Unverified";

export function Brands() {
  const {
    brands,
    promotions,
  } = usePhase2Content();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<BrandCategoryFilter>("All");

  const [
    verificationFilter,
    setVerificationFilter,
  ] =
    useState<VerificationFilter>("All");

  const [
    showFilters,
    setShowFilters,
  ] =
    useState(false);

  const publishedBrands =
    useMemo(() => {
      return brands.filter(
        (brand) =>
          brand.publicationStatus ===
          "published"
      );
    }, [brands]);

  const activePromotionCountByBrand =
    useMemo(() => {
      const counts =
        new Map<string, number>();

      promotions
        .filter(
          (promotion) =>
            promotion.status ===
              "active" ||
            promotion.status ===
              "scheduled"
        )
        .forEach((promotion) => {
          counts.set(
            promotion.brandId,
            (counts.get(
              promotion.brandId
            ) ?? 0) + 1
          );
        });

      return counts;
    }, [promotions]);

  const filteredBrands =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLowerCase();

      return publishedBrands
        .filter((brand) => {
          if (!normalizedQuery) {
            return true;
          }

          const searchableText = [
            brand.name,
            brand.description,
            brand.category,
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedQuery
          );
        })
        .filter((brand) => {
          if (
            selectedCategory ===
            "All"
          ) {
            return true;
          }

          return (
            brand.category ===
            selectedCategory
          );
        })
        .filter((brand) => {
          if (
            verificationFilter ===
            "All"
          ) {
            return true;
          }

          if (
            verificationFilter ===
            "Verified"
          ) {
            return brand.verified;
          }

          return !brand.verified;
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
            a.verified !==
            b.verified
          ) {
            return a.verified
              ? -1
              : 1;
          }

          return a.name.localeCompare(
            b.name
          );
        });
    }, [
      publishedBrands,
      searchQuery,
      selectedCategory,
      verificationFilter,
    ]);

  const activeFilterCount =
    [
      selectedCategory !== "All",
      verificationFilter !== "All",
    ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory("All");
    setVerificationFilter("All");
  };

  return (
    <div className="min-h-full bg-neutral-950 text-white">
      {/* Header */}
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
              XTrail Partners
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Brands
            </h1>

            <p className="mt-1 text-sm leading-6 text-neutral-400">
              Discover manufacturers,
              riding gear, parts,
              workshops and brands
              supporting the off-road
              community.
            </p>
          </div>

          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
            <Store className="h-5 w-5" />
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-5">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

          <Input
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search brands, products or categories..."
            className="h-11 border-neutral-800 bg-neutral-900 pl-10 pr-10 text-white placeholder:text-neutral-600"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() =>
                setSearchQuery("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
              aria-label="Clear search"
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
            {filteredBrands.length}{" "}
            {filteredBrands.length === 1
              ? "brand"
              : "brands"}
          </p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-neutral-800 bg-neutral-900/70 px-4 py-4">
          <div className="space-y-5">
            <FilterSection
              title="Category"
              values={[
                "All",
                ...brandCategories,
              ]}
              selected={
                selectedCategory
              }
              onSelect={(value) =>
                setSelectedCategory(
                  value as BrandCategoryFilter
                )
              }
            />

            <FilterSection
              title="Verification"
              values={[
                "All",
                "Verified",
                "Unverified",
              ]}
              selected={
                verificationFilter
              }
              onSelect={(value) =>
                setVerificationFilter(
                  value as VerificationFilter
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

      {/* Content */}
      <div className="space-y-5 px-4 pb-32 pt-5">
        {publishedBrands.length ===
        0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900 p-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-500">
              <Store className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Brands are coming
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Official XTrail brand
              profiles will appear here
              once they are published.
            </p>
          </div>
        ) : filteredBrands.length ===
          0 ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-7 text-center">
            <Search className="mx-auto h-7 w-7 text-neutral-600" />

            <h2 className="mt-4 text-lg font-semibold">
              No matching brands
            </h2>

            <p className="mt-2 text-sm text-neutral-400">
              Try changing your search
              or filters.
            </p>

            <Button
              type="button"
              onClick={() => {
                setSearchQuery("");
                clearFilters();
              }}
              className="mt-5 bg-orange-500 text-black hover:bg-orange-400"
            >
              Reset Search
            </Button>
          </div>
        ) : (
          <>
            {filteredBrands.some(
              (brand) =>
                brand.verified
            ) && (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <BadgeCheck className="h-4 w-4 text-sky-400" />

                Verified profiles are
                official brand presences
                on XTrail.
              </div>
            )}

            {filteredBrands.map(
              (brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  activePromotionCount={
                    activePromotionCountByBrand.get(
                      brand.id
                    ) ?? 0
                  }
                />
              )
            )}
          </>
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