import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, CheckCircle2, MapPin, Mountain } from "lucide-react";
import { Button } from "../components/ui/button";
import { mockTrails } from "../data/mockData";
import type { CompletedTrail } from "../types/completedTrail";

type CompletedTrailGroup = {
  trailId: string;
  trailName: string;
  completedAt: string;
  completionCount: number;
  latestRideId: string;
  trail: (typeof mockTrails)[number] | null;
};

export function CompletedTrails() {
  const [completedTrails, setCompletedTrails] = useState<CompletedTrail[]>([]);

  useEffect(() => {
    const storedCompletedTrails = localStorage.getItem("xtrail-completed-trails");

    if (!storedCompletedTrails) {
      setCompletedTrails([]);
      return;
    }

    try {
      const parsed = JSON.parse(storedCompletedTrails) as CompletedTrail[];
      setCompletedTrails(parsed);
    } catch (error) {
      console.error("Failed to load completed trails:", error);
      setCompletedTrails([]);
    }
  }, []);

  const groupedCompletedTrails = useMemo<CompletedTrailGroup[]>(() => {
    const groupedMap = new Map<string, CompletedTrail[]>();

    for (const completedTrail of completedTrails) {
      const existing = groupedMap.get(completedTrail.trailId) ?? [];
      existing.push(completedTrail);
      groupedMap.set(completedTrail.trailId, existing);
    }

    return Array.from(groupedMap.entries())
      .map(([trailId, records]) => {
        const sortedRecords = [...records].sort(
          (a, b) =>
            new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );

        const latestRecord = sortedRecords[0];
        const matchedTrail =
          mockTrails.find((trail) => trail.id === trailId) ?? null;

        return {
          trailId,
          trailName: latestRecord.trailName,
          completedAt: latestRecord.completedAt,
          completionCount: sortedRecords.length,
          latestRideId: latestRecord.rideId,
          trail: matchedTrail,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
  }, [completedTrails]);

  return (
    <div className="min-h-full bg-neutral-950">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link to="/profile">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-xl font-semibold text-white">Completed Trails</h1>
            <p className="text-sm text-neutral-400">
              Trails you’ve finished and ridden successfully.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4 py-5">
        {groupedCompletedTrails.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800">
              <CheckCircle2 className="h-5 w-5 text-neutral-400" />
            </div>

            <h2 className="mt-4 text-base font-medium text-white">
              No completed trails yet
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Finish a trail ride to start building your completed list.
            </p>

            <Link to="/" className="mt-4 inline-block">
              <Button className="bg-orange-500 text-black hover:bg-orange-400">
                Explore Trails
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedCompletedTrails.map((completedTrail) => (
              <Link
                key={completedTrail.trailId}
                to={`/trail/${completedTrail.trailId}`}
                className="block rounded-2xl border border-neutral-800 bg-neutral-900 transition hover:border-neutral-700"
              >
                <div className="flex gap-3 p-3">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800">
                    {completedTrail.trail?.imageUrl ? (
                      <img
                        src={completedTrail.trail.imageUrl}
                        alt={completedTrail.trailName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-semibold text-white">
                          {completedTrail.trailName}
                        </h2>

                        <div className="mt-1 flex items-center gap-2 text-xs text-neutral-400">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">
                            {[
                              completedTrail.trail?.location,
                              completedTrail.trail?.province,
                              completedTrail.trail?.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-400">
                        Completed
                      </span>

                      {completedTrail.completionCount > 1 && (
                        <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200">
                          {completedTrail.completionCount} completions
                        </span>
                      )}

                      {completedTrail.trail?.difficulty && (
                        <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200">
                          {completedTrail.trail.difficulty}
                        </span>
                      )}

                      {completedTrail.trail?.trailType && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-1 text-xs text-neutral-200">
                          <Mountain className="h-3 w-3" />
                          {completedTrail.trail.trailType}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-neutral-500">
                      Last completed{" "}
                      {new Date(completedTrail.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}