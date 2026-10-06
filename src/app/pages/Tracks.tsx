import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  MapPinned,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Link } from "react-router";

import { TrackCard } from "../components/content/TrackCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import { usePhase2Content } from "../context/Phase2ContentContext";

import type {
  TrackDifficulty,
  TrackType,
} from "../types/track";

import type { VehicleClass } from "../types/trail";

const trackTypes: TrackType[] = [
  "Motocross",
  "Supercross",
  "Enduro Track",
  "Training Track",
  "Off-road Park",
  "Other",
];

const trackDifficulties: TrackDifficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
  "Mixed",
];

const vehicleClasses: VehicleClass[] = [
  "ATV",
  "Motocross",
  "Dual-Sport",
  "SUV",
  "4x4",
  "UTV",
];

const southAfricanProvinces = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

type TrackTypeFilter =
  | "All"
  | TrackType;

type DifficultyFilter =
  | "All"
  | TrackDifficulty;

type VehicleFilter =
  | "All"
  | VehicleClass;

type ProvinceFilter =
  | "All"
  | (typeof southAfricanProvinces)[number];

export function Tracks() {
  const { tracks } = usePhase2Content();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedTrackType,
    setSelectedTrackType,
  ] =
    useState<TrackTypeFilter>("All");

  const [
    selectedDifficulty,
    setSelectedDifficulty,
  ] =
    useState<DifficultyFilter>("All");

  const [
    selectedVehicle,
    setSelectedVehicle,
  ] =
    useState<VehicleFilter>("All");

  const [
    selectedProvince,
    setSelectedProvince,
  ] =
    useState<ProvinceFilter>("All");

  const [
    showFilters,
    setShowFilters,
  ] =
    useState(false);

  const publishedTracks =
    useMemo(() => {
      return tracks.filter(
        (track) =>
          track.publicationStatus ===
          "published"
      );
    }, [tracks]);

  const filteredTracks =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLowerCase();

      return publishedTracks
        .filter((track) => {
          if (!normalizedQuery) {
            return true;
          }

          const searchableText = [
            track.name,
            track.description,
            track.location,
            track.province,
            track.country,
            track.trackType,
            track.surface,
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedQuery
          );
        })
        .filter((track) => {
          if (
            selectedTrackType ===
            "All"
          ) {
            return true;
          }

          return (
            track.trackType ===
            selectedTrackType
          );
        })
        .filter((track) => {
          if (
            selectedDifficulty ===
            "All"
          ) {
            return true;
          }

          return (
            track.difficulty ===
            selectedDifficulty
          );
        })
        .filter((track) => {
          if (
            selectedVehicle ===
            "All"
          ) {
            return true;
          }

          return track.vehicleClass.includes(
            selectedVehicle
          );
        })
        .filter((track) => {
          if (
            selectedProvince ===
            "All"
          ) {
            return true;
          }

          return (
            track.province ===
            selectedProvince
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
            b.rating !==
            a.rating
          ) {
            return (
              b.rating -
              a.rating
            );
          }

          return a.name.localeCompare(
            b.name
          );
        });
    }, [
      publishedTracks,
      searchQuery,
      selectedTrackType,
      selectedDifficulty,
      selectedVehicle,
      selectedProvince,
    ]);

  const activeFilterCount =
    [
      selectedTrackType !== "All",
      selectedDifficulty !== "All",
      selectedVehicle !== "All",
      selectedProvince !== "All",
    ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedTrackType("All");
    setSelectedDifficulty("All");
    setSelectedVehicle("All");
    setSelectedProvince("All");
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
              Discover
            </p>

            <h1 className="mt-1 text-2xl font-bold text-white">
              Tracks
            </h1>

            <p className="mt-1 text-sm text-neutral-400">
              Find motocross, supercross,
              enduro and off-road riding
              facilities.
            </p>
          </div>

          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
            <MapPinned className="h-5 w-5" />
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
            placeholder="Search tracks, areas or surfaces..."
            className="h-11 border-neutral-800 bg-neutral-900 pl-10 pr-10 text-white placeholder:text-neutral-600"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() =>
                setSearchQuery("")
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
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
            {filteredTracks.length}{" "}
            {filteredTracks.length === 1
              ? "track"
              : "tracks"}
          </p>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-neutral-800 bg-neutral-900/70 px-4 py-4">
          <div className="space-y-5">
            {/* Track type */}
            <FilterSection
              title="Track Type"
              values={[
                "All",
                ...trackTypes,
              ]}
              selected={
                selectedTrackType
              }
              onSelect={(value) =>
                setSelectedTrackType(
                  value as TrackTypeFilter
                )
              }
            />

            {/* Difficulty */}
            <FilterSection
              title="Difficulty"
              values={[
                "All",
                ...trackDifficulties,
              ]}
              selected={
                selectedDifficulty
              }
              onSelect={(value) =>
                setSelectedDifficulty(
                  value as DifficultyFilter
                )
              }
            />

            {/* Vehicle */}
            <FilterSection
              title="Vehicle"
              values={[
                "All",
                ...vehicleClasses,
              ]}
              selected={
                selectedVehicle
              }
              onSelect={(value) =>
                setSelectedVehicle(
                  value as VehicleFilter
                )
              }
            />

            {/* Province */}
            <FilterSection
              title="Province"
              values={[
                "All",
                ...southAfricanProvinces,
              ]}
              selected={
                selectedProvince
              }
              onSelect={(value) =>
                setSelectedProvince(
                  value as ProvinceFilter
                )
              }
            />

            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-orange-400 transition hover:text-orange-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Track list */}
      <div className="space-y-5 px-4 pb-32 pt-5">
        {publishedTracks.length ===
        0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900 p-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-500">
              <MapPinned className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              Tracks are coming
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-400">
              No published tracks have
              been added yet. XTrail
              Owner content will appear
              here once published.
            </p>
          </div>
        ) : filteredTracks.length ===
          0 ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-500">
              <Search className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              No matching tracks
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Try changing the search
              term or removing one of
              the filters.
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
            {filteredTracks.map(
              (track) => (
                <TrackCard
                  key={track.id}
                  track={track}
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
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {title}
        </p>
      </div>

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