import {
  CalendarCheck,
  MapPin,
  Route,
  Star,
  Wallet,
} from "lucide-react";
import { Link } from "react-router";

import type { Track } from "../../types/track";
import type { VehicleClass } from "../../types/trail";

import {
  AtvIcon,
  DirtBikeIcon,
  DualSportIcon,
  FourByFourIcon,
  SuvIcon,
  SxsIcon,
} from "../VehicleIcons";

type TrackCardProps = {
  track: Track;
};

function getDifficultyStyles(
  difficulty: Track["difficulty"]
) {
  switch (difficulty) {
    case "Beginner":
      return "border-emerald-500/20 bg-emerald-500/15 text-emerald-400";

    case "Intermediate":
      return "border-yellow-500/20 bg-yellow-500/15 text-yellow-400";

    case "Advanced":
      return "border-orange-500/20 bg-orange-500/15 text-orange-400";

    case "Expert":
      return "border-red-500/20 bg-red-500/15 text-red-400";

    case "Mixed":
      return "border-purple-500/20 bg-purple-500/15 text-purple-400";

    default:
      return "border-neutral-700 bg-neutral-800 text-neutral-300";
  }
}

function VehicleIcon({
  vehicleClass,
}: {
  vehicleClass: VehicleClass;
}) {
  const className = "h-4 w-4";

  switch (vehicleClass) {
    case "Motocross":
      return (
        <DirtBikeIcon className={className} />
      );

    case "Dual-Sport":
      return (
        <DualSportIcon className={className} />
      );

    case "ATV":
      return <AtvIcon className={className} />;

    case "UTV":
      return <SxsIcon className={className} />;

    case "4x4":
      return (
        <FourByFourIcon className={className} />
      );

    case "SUV":
      return <SuvIcon className={className} />;

    default:
      return null;
  }
}

function formatEntryFee(track: Track) {
  if (
    track.entryFee === undefined ||
    track.entryFee === null
  ) {
    return "Contact venue";
  }

  if (track.entryFee <= 0) {
    return "Free";
  }

  return `R${track.entryFee.toFixed(2)}`;
}

export function TrackCard({
  track,
}: TrackCardProps) {
  return (
    <Link
      to={`/track/${track.id}`}
      state={{
        from: "/tracks",
      }}
      className="block"
    >
      <article className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-lg transition hover:border-orange-500/30 active:scale-[0.995]">
        <div className="relative h-48 overflow-hidden bg-neutral-800">
          {track.imageUrl ? (
            <img
              src={track.imageUrl}
              alt={track.name}
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
              <Route className="h-10 w-10 text-neutral-600" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {track.trackType}
            </span>

            {track.featured && (
              <span className="rounded-full border border-orange-500/20 bg-orange-500 px-3 py-1 text-xs font-bold text-black">
                Featured
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="line-clamp-2 text-xl font-bold text-white">
              {track.name}
            </h2>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-neutral-200">
              <MapPin className="h-4 w-4 flex-shrink-0" />

              <span className="truncate">
                {track.location}
                {track.province
                  ? `, ${track.province}`
                  : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getDifficultyStyles(
                track.difficulty
              )}`}
            >
              {track.difficulty}
            </span>

            <span className="rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300">
              {track.surface}
            </span>

            {track.requiresBooking && (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-400">
                <CalendarCheck className="h-3.5 w-3.5" />
                Booking
              </span>
            )}
          </div>

          {track.description && (
            <p className="line-clamp-2 text-sm leading-6 text-neutral-400">
              {track.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Route className="h-3.5 w-3.5" />

                <span className="text-[11px]">
                  Length
                </span>
              </div>

              <p className="mt-1.5 text-sm font-semibold text-white">
                {track.lengthKm !== undefined
                  ? `${track.lengthKm.toFixed(
                      track.lengthKm % 1 === 0
                        ? 0
                        : 1
                    )} km`
                  : "TBA"}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Wallet className="h-3.5 w-3.5" />

                <span className="text-[11px]">
                  Entry
                </span>
              </div>

              <p className="mt-1.5 truncate text-sm font-semibold text-white">
                {formatEntryFee(track)}
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
              <div className="flex items-center gap-1.5 text-neutral-500">
                <Star className="h-3.5 w-3.5" />

                <span className="text-[11px]">
                  Rating
                </span>
              </div>

              <p className="mt-1.5 text-sm font-semibold text-white">
                {track.reviewCount > 0
                  ? track.rating.toFixed(1)
                  : "New"}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
              Suitable for
            </p>

            {track.vehicleClass.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {track.vehicleClass.map(
                  (vehicleClass) => (
                    <span
                      key={vehicleClass}
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs text-neutral-300"
                    >
                      <VehicleIcon
                        vehicleClass={
                          vehicleClass
                        }
                      />

                      {vehicleClass}
                    </span>
                  )
                )}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">
                Vehicle compatibility not specified.
              </p>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}