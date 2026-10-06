import { MapPin, Route } from "lucide-react";

import type { TrackRoutePoint } from "../../types/track";

type TrackMapPreviewProps = {
  trackName: string;
  lat: number;
  lng: number;
  routePoints: TrackRoutePoint[];
};

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 600;
const PADDING = 70;

function createPolylinePoints(
  routePoints: TrackRoutePoint[]
) {
  if (routePoints.length < 2) {
    return "";
  }

  const latitudes = routePoints.map(
    (point) => point.lat
  );

  const longitudes = routePoints.map(
    (point) => point.lng
  );

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);

  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const latSpan =
    maxLat - minLat || 1;

  const lngSpan =
    maxLng - minLng || 1;

  return routePoints
    .map((point) => {
      const x =
        PADDING +
        ((point.lng - minLng) /
          lngSpan) *
          (VIEWBOX_WIDTH -
            PADDING * 2);

      const y =
        VIEWBOX_HEIGHT -
        PADDING -
        ((point.lat - minLat) /
          latSpan) *
          (VIEWBOX_HEIGHT -
            PADDING * 2);

      return `${x},${y}`;
    })
    .join(" ");
}

export function TrackMapPreview({
  trackName,
  lat,
  lng,
  routePoints,
}: TrackMapPreviewProps) {
  const hasRecordedLayout =
    routePoints.length >= 2;

  const polylinePoints =
    createPolylinePoints(
      routePoints
    );

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900">
      <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="h-full w-full"
          role="img"
          aria-label={`${trackName} track map`}
        >
          <defs>
            <pattern
              id="track-map-grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-neutral-800"
              />
            </pattern>

            <radialGradient
              id="track-map-glow"
              cx="50%"
              cy="50%"
              r="70%"
            >
              <stop
                offset="0%"
                stopColor="rgb(38 38 38)"
              />

              <stop
                offset="100%"
                stopColor="rgb(10 10 10)"
              />
            </radialGradient>
          </defs>

          <rect
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT}
            fill="url(#track-map-glow)"
          />

          <rect
            width={VIEWBOX_WIDTH}
            height={VIEWBOX_HEIGHT}
            fill="url(#track-map-grid)"
          />

          {hasRecordedLayout ? (
            <>
              <polyline
                points={
                  polylinePoints
                }
                fill="none"
                stroke="rgb(249 115 22)"
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.18"
              />

              <polyline
                points={
                  polylinePoints
                }
                fill="none"
                stroke="rgb(249 115 22)"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {(() => {
                const firstPoint =
                  polylinePoints
                    .split(" ")[0]
                    ?.split(",");

                if (
                  !firstPoint ||
                  firstPoint.length < 2
                ) {
                  return null;
                }

                return (
                  <circle
                    cx={Number(
                      firstPoint[0]
                    )}
                    cy={Number(
                      firstPoint[1]
                    )}
                    r="13"
                    fill="rgb(34 197 94)"
                    stroke="white"
                    strokeWidth="4"
                  />
                );
              })()}
            </>
          ) : (
            <>
              <circle
                cx={VIEWBOX_WIDTH / 2}
                cy={
                  VIEWBOX_HEIGHT /
                  2
                }
                r="70"
                fill="rgb(249 115 22)"
                opacity="0.1"
              />

              <circle
                cx={VIEWBOX_WIDTH / 2}
                cy={
                  VIEWBOX_HEIGHT /
                  2
                }
                r="22"
                fill="rgb(249 115 22)"
              />

              <circle
                cx={VIEWBOX_WIDTH / 2}
                cy={
                  VIEWBOX_HEIGHT /
                  2
                }
                r="7"
                fill="white"
              />
            </>
          )}
        </svg>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <div className="rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            {hasRecordedLayout
              ? "Track Layout"
              : "Track Location"}
          </div>

          {hasRecordedLayout && (
            <div className="rounded-full border border-orange-500/20 bg-orange-500/15 px-3 py-1.5 text-xs font-semibold text-orange-400 backdrop-blur-sm">
              {
                routePoints.length
              }{" "}
              GPS points
            </div>
          )}
        </div>

        {!hasRecordedLayout && (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center px-5">
            <div className="max-w-[280px] rounded-2xl border border-neutral-700 bg-black/80 px-4 py-3 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 text-orange-400">
                <MapPin className="h-4 w-4" />

                <span className="text-xs font-semibold">
                  Location available
                </span>
              </div>

              <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                A recorded track layout
                has not been added yet.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-neutral-800 px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {hasRecordedLayout ? (
              <Route className="h-4 w-4 flex-shrink-0 text-orange-400" />
            ) : (
              <MapPin className="h-4 w-4 flex-shrink-0 text-orange-400" />
            )}

            <p className="truncate text-sm font-medium text-white">
              {trackName}
            </p>
          </div>
        </div>

        <p className="flex-shrink-0 text-[11px] text-neutral-500">
          {lat.toFixed(5)},{" "}
          {lng.toFixed(5)}
        </p>
      </div>
    </div>
  );
}