import { Trail } from "../types/trail";
import { MapPin, Star, Clock, Route } from "lucide-react";
import { Link } from "react-router";

type TrailCardProps = {
  trail: Trail;
  isCompleted?: boolean;
  isSaved?: boolean;
};

function getDifficultyStyles(difficulty: Trail["difficulty"]) {
  switch (difficulty) {
    case "Easy":
      return "bg-green-500/15 text-green-400 border-green-500/20";
    case "Moderate":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/20";
    case "Difficult":
      return "bg-orange-500/15 text-orange-400 border-orange-500/20";
    case "Expert":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    default:
      return "bg-zinc-500/15 text-zinc-400 border-zinc-500/20";
  }
}

export default function TrailCard({ trail, isCompleted = false, isSaved = false }: TrailCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-lg transition hover:border-orange-500/30">
      

      <div className="space-y-4 p-4">
        <div>
          <h3 className="line-clamp-2 text-xl font-semibold text-white">
            {trail.name}
          </h3>

          <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{trail.location}</span>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-zinc-300">{trail.description}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-zinc-800/80 p-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <Route className="h-4 w-4" />
              <span className="text-xs">Distance</span>
            </div>
            <p className="mt-2 text-base font-semibold text-white">
              {trail.distance} km
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-800/80 p-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Duration</span>
            </div>
            <p className="mt-2 text-base font-semibold text-white">
              {trail.duration} min
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-800/80 p-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <Star className="h-4 w-4" />
              <span className="text-xs">Rating</span>
            </div>
            <p className="mt-2 text-base font-semibold text-white">
              {trail.rating}
              <span className="ml-1 text-sm text-zinc-400">
                ({trail.reviewCount})
              </span>
            </p>
          </div>

          <div className="rounded-2xl bg-zinc-800/80 p-3">
            <p className="text-xs text-zinc-400">Type</p>
            <p className="mt-2 line-clamp-2 text-base font-semibold text-white">
              {trail.trailType}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-zinc-400">Supported vehicles</p>
          <div className="flex flex-wrap gap-2">
            {trail.vehicleClass.slice(0, 3).map((vehicle: Trail["vehicleClass"][number]) => (
              <span
                key={vehicle}
                className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200"
              >
                {vehicle}
              </span>
            ))}

            {trail.vehicleClass.length > 3 && (
              <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-400">
                +{trail.vehicleClass.length - 3} more
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${getDifficultyStyles(
                trail.difficulty
              )}`}
            >
              {trail.difficulty}
            </span>

            {isCompleted && (
              <span className="rounded-full bg-emerald-600/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                Completed
              </span>
            )}

            {isSaved && (
              <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-400">
                Saved
              </span>
            )}

            {trail.isPremium && (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black">
                Premium
              </span>
            )}
          </div>
        </div>

        <Link
        to={`/trail/${trail.id}`}
        className="block w-full rounded-2xl bg-orange-500 px-4 py-3 text-center font-semibold text-black transition hover:bg-orange-400"
        >
        View Trail
        </Link>
      </div>
    </div>
  );
}