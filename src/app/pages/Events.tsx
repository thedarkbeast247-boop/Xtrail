import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Calendar,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Link } from "react-router";

import { EventCard } from "../components/content/EventCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

import { usePhase2Content } from "../context/Phase2ContentContext";

import type {
  EventStatus,
  EventType,
} from "../types/event";

import type { VehicleClass } from "../types/trail";

const eventTypes: EventType[] = [
  "Race",
  "Practice Day",
  "Training",
  "Demo Day",
  "Community Ride",
  "Competition",
  "Festival",
  "Product Launch",
  "Meetup",
  "Other",
];

const eventStatuses: EventStatus[] = [
  "upcoming",
  "ongoing",
  "completed",
  "cancelled",
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

type EventTypeFilter =
  | "All"
  | EventType;

type EventStatusFilter =
  | "All"
  | EventStatus;

type VehicleFilter =
  | "All"
  | VehicleClass;

type ProvinceFilter =
  | "All"
  | (typeof southAfricanProvinces)[number];

function formatStatus(
  status: EventStatus
) {
  return status.charAt(0).toUpperCase() +
    status.slice(1);
}

export function Events() {
  const { events } =
    usePhase2Content();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [
    selectedEventType,
    setSelectedEventType,
  ] =
    useState<EventTypeFilter>("All");

  const [
    selectedEventStatus,
    setSelectedEventStatus,
  ] =
    useState<EventStatusFilter>(
      "All"
    );

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

  const publishedEvents =
    useMemo(() => {
      return events.filter(
        (event) =>
          event.publicationStatus ===
          "published"
      );
    }, [events]);

  const filteredEvents =
    useMemo(() => {
      const normalizedQuery =
        searchQuery
          .trim()
          .toLowerCase();

      return publishedEvents
        .filter((event) => {
          if (!normalizedQuery) {
            return true;
          }

          const searchableText = [
            event.name,
            event.description,
            event.eventType,
            event.location,
            event.province,
            event.country,
            event.organizerName ?? "",
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(
            normalizedQuery
          );
        })
        .filter((event) => {
          if (
            selectedEventType ===
            "All"
          ) {
            return true;
          }

          return (
            event.eventType ===
            selectedEventType
          );
        })
        .filter((event) => {
          if (
            selectedEventStatus ===
            "All"
          ) {
            return true;
          }

          return (
            event.eventStatus ===
            selectedEventStatus
          );
        })
        .filter((event) => {
          if (
            selectedVehicle ===
            "All"
          ) {
            return true;
          }

          return event.vehicleClass.includes(
            selectedVehicle
          );
        })
        .filter((event) => {
          if (
            selectedProvince ===
            "All"
          ) {
            return true;
          }

          return (
            event.province ===
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

          const aDate =
            new Date(
              a.startDate
            ).getTime();

          const bDate =
            new Date(
              b.startDate
            ).getTime();

          return aDate - bDate;
        });
    }, [
      publishedEvents,
      searchQuery,
      selectedEventType,
      selectedEventStatus,
      selectedVehicle,
      selectedProvince,
    ]);

  const activeFilterCount =
    [
      selectedEventType !== "All",
      selectedEventStatus !== "All",
      selectedVehicle !== "All",
      selectedProvince !== "All",
    ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedEventType("All");
    setSelectedEventStatus("All");
    setSelectedVehicle("All");
    setSelectedProvince("All");
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
              Discover
            </p>

            <h1 className="mt-1 text-2xl font-bold">
              Events
            </h1>

            <p className="mt-1 text-sm leading-6 text-neutral-400">
              Find races, practice
              days, community rides,
              demo days and off-road
              events.
            </p>
          </div>

          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
            <Calendar className="h-5 w-5" />
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
            placeholder="Search events, locations or organizers..."
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
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1
              ? "event"
              : "events"}
          </p>
        </div>
      </div>

      {showFilters && (
        <div className="border-b border-neutral-800 bg-neutral-900/70 px-4 py-4">
          <div className="space-y-5">
            <FilterSection
              title="Event Type"
              values={[
                "All",
                ...eventTypes,
              ]}
              selected={
                selectedEventType
              }
              onSelect={(value) =>
                setSelectedEventType(
                  value as EventTypeFilter
                )
              }
            />

            <FilterSection
              title="Status"
              values={[
                "All",
                ...eventStatuses.map(
                  formatStatus
                ),
              ]}
              selected={
                selectedEventStatus ===
                "All"
                  ? "All"
                  : formatStatus(
                      selectedEventStatus
                    )
              }
              onSelect={(value) => {
                if (
                  value === "All"
                ) {
                  setSelectedEventStatus(
                    "All"
                  );

                  return;
                }

                const matchedStatus =
                  eventStatuses.find(
                    (status) =>
                      formatStatus(
                        status
                      ) === value
                  );

                if (
                  matchedStatus
                ) {
                  setSelectedEventStatus(
                    matchedStatus
                  );
                }
              }}
            />

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
                className="text-sm font-semibold text-orange-400 hover:text-orange-300"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-5 px-4 pb-32 pt-5">
        {publishedEvents.length ===
        0 ? (
          <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900 p-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800 text-neutral-500">
              <Calendar className="h-6 w-6" />
            </div>

            <h2 className="mt-4 text-lg font-semibold">
              Events are coming
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-400">
              No published events have
              been added yet. Owner
              content will appear here
              once published.
            </p>
          </div>
        ) : filteredEvents.length ===
          0 ? (
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-7 text-center">
            <Search className="mx-auto h-7 w-7 text-neutral-600" />

            <h2 className="mt-4 text-lg font-semibold">
              No matching events
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
          filteredEvents.map(
            (event) => (
              <EventCard
                key={event.id}
                event={event}
              />
            )
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