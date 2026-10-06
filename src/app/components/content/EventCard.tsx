import {
  Calendar,
  MapPin,
  Mountain,
  Route,
  Ticket,
} from "lucide-react";

import { Link } from "react-router";

import type { Event as XTrailEvent } from "../../types/event";

type EventCardProps = {
  event: XTrailEvent;
};

function formatEventDate(date: string) {
  return new Date(
    `${date}T12:00:00`
  ).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
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
    return "See details";
  }

  if (event.entryFee <= 0) {
    return "Free";
  }

  return `R${event.entryFee.toFixed(2)}`;
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

function formatStatus(
  status: XTrailEvent["eventStatus"]
) {
  return status.charAt(0).toUpperCase() +
    status.slice(1);
}

export function EventCard({
  event,
}: EventCardProps) {
  const linkedTrackCount =
    event.trackIds.length;

  const linkedTrailCount =
    event.trailIds.length;

  return (
    <Link
      to={`/event/${event.id}`}
      state={{
        from: "/events",
        backLabel: "Back to Events",
      }}
      className="block"
    >
      <article className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-lg transition hover:border-orange-500/30 active:scale-[0.995]">
        <div className="relative h-48 overflow-hidden bg-neutral-800">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.name}
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
              <Calendar className="h-10 w-10 text-neutral-600" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
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
              <span className="rounded-full border border-orange-500/20 bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                Featured
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="line-clamp-2 text-xl font-bold text-white">
              {event.name}
            </h2>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-200">
              <MapPin className="h-4 w-4 flex-shrink-0" />

              <span className="truncate">
                {event.location}
                {event.province
                  ? `, ${event.province}`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center gap-2 text-neutral-500">
                <Calendar className="h-4 w-4" />

                <span className="text-xs">
                  Date
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {formatEventDate(
                  event.startDate
                )}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center gap-2 text-neutral-500">
                <Ticket className="h-4 w-4" />

                <span className="text-xs">
                  Entry
                </span>
              </div>

              <p className="mt-2 text-sm font-semibold text-white">
                {formatEntryFee(
                  event
                )}
              </p>
            </div>
          </div>

          {event.description && (
            <p className="line-clamp-2 text-sm leading-6 text-neutral-400">
              {event.description}
            </p>
          )}

          {(linkedTrackCount > 0 ||
            linkedTrailCount > 0) && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Riding Locations
              </p>

              <div className="flex flex-wrap gap-2">
                {linkedTrackCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-400">
                    <Route className="h-3.5 w-3.5" />

                    {linkedTrackCount}{" "}
                    {linkedTrackCount === 1
                      ? "Track"
                      : "Tracks"}
                  </span>
                )}

                {linkedTrailCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                    <Mountain className="h-3.5 w-3.5" />

                    {linkedTrailCount}{" "}
                    {linkedTrailCount === 1
                      ? "Trail"
                      : "Trails"}
                  </span>
                )}
              </div>
            </div>
          )}

          {event.organizerName && (
            <p className="border-t border-neutral-800 pt-3 text-xs text-neutral-500">
              Organized by{" "}
              <span className="font-medium text-neutral-300">
                {event.organizerName}
              </span>
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}