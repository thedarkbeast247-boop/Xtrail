import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const ACTIVE_RIDE_STORAGE_KEY =
  "xtrail-active-ride-session";

export type RidePathPoint = {
  x: number;
  y: number;
};

export type RideRecordingStatus =
  | "idle"
  | "recording"
  | "paused"
  | "stopped";

export type RideRecordingSession = {
  status: RideRecordingStatus;

  vehicleId?: string;
  trailId?: string;

  durationSeconds: number;
  distanceKm: number;
  currentSpeedKmh: number;
  elevationGainM: number;

  pathPoints: RidePathPoint[];

  startedAt?: string;
  finishedAt?: string;
  updatedAt?: string;
};

type StartRideOptions = {
  vehicleId: string;
  trailId?: string;
};

type RideRecordingContextValue = {
  session: RideRecordingSession;

  isRecording: boolean;
  isPaused: boolean;
  isStopped: boolean;
  hasRideSession: boolean;

  averageSpeedKmh: number;

  startRide: (
    options: StartRideOptions
  ) => void;

  pauseRide: () => void;
  resumeRide: () => void;
  stopRide: () => void;
  resetRide: () => void;
};

const EMPTY_RIDE_SESSION: RideRecordingSession = {
  status: "idle",

  durationSeconds: 0,
  distanceKm: 0,
  currentSpeedKmh: 0,
  elevationGainM: 0,

  pathPoints: [],
};

const RideRecordingContext =
  createContext<RideRecordingContextValue | null>(
    null
  );

function isRideRecordingStatus(
  value: unknown
): value is RideRecordingStatus {
  return (
    value === "idle" ||
    value === "recording" ||
    value === "paused" ||
    value === "stopped"
  );
}

function loadStoredRideSession():
  RideRecordingSession {
  try {
    const storedSession =
      localStorage.getItem(
        ACTIVE_RIDE_STORAGE_KEY
      );

    if (!storedSession) {
      return EMPTY_RIDE_SESSION;
    }

    const parsed = JSON.parse(
      storedSession
    ) as Partial<RideRecordingSession>;

    if (
      !isRideRecordingStatus(parsed.status)
    ) {
      return EMPTY_RIDE_SESSION;
    }

    return {
      status: parsed.status,

      vehicleId:
        typeof parsed.vehicleId === "string"
          ? parsed.vehicleId
          : undefined,

      trailId:
        typeof parsed.trailId === "string"
          ? parsed.trailId
          : undefined,

      durationSeconds:
        typeof parsed.durationSeconds ===
        "number"
          ? parsed.durationSeconds
          : 0,

      distanceKm:
        typeof parsed.distanceKm === "number"
          ? parsed.distanceKm
          : 0,

      currentSpeedKmh:
        typeof parsed.currentSpeedKmh ===
        "number"
          ? parsed.currentSpeedKmh
          : 0,

      elevationGainM:
        typeof parsed.elevationGainM ===
        "number"
          ? parsed.elevationGainM
          : 0,

      pathPoints: Array.isArray(
        parsed.pathPoints
      )
        ? parsed.pathPoints.filter(
            (
              point
            ): point is RidePathPoint =>
              Boolean(
                point &&
                  typeof point === "object" &&
                  typeof (
                    point as RidePathPoint
                  ).x === "number" &&
                  typeof (
                    point as RidePathPoint
                  ).y === "number"
              )
          )
        : [],

      startedAt:
        typeof parsed.startedAt === "string"
          ? parsed.startedAt
          : undefined,

      finishedAt:
        typeof parsed.finishedAt === "string"
          ? parsed.finishedAt
          : undefined,

      updatedAt:
        typeof parsed.updatedAt === "string"
          ? parsed.updatedAt
          : undefined,
    };
  } catch (error) {
    console.error(
      "Failed to restore active ride session:",
      error
    );

    return EMPTY_RIDE_SESSION;
  }
}

export function RideRecordingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] =
    useState<RideRecordingSession>(
      loadStoredRideSession
    );

  /*
   * Persist the current ride session.
   *
   * This allows an active or paused ride to
   * survive normal route navigation and also
   * protects the prototype from losing the ride
   * immediately after a page refresh.
   */
  useEffect(() => {
    try {
      if (session.status === "idle") {
        localStorage.removeItem(
          ACTIVE_RIDE_STORAGE_KEY
        );

        return;
      }

      localStorage.setItem(
        ACTIVE_RIDE_STORAGE_KEY,
        JSON.stringify(session)
      );
    } catch (error) {
      console.error(
        "Failed to persist active ride session:",
        error
      );
    }
  }, [session]);

  /*
   * DEMO RECORDING ENGINE
   *
   * This continues to simulate movement until
   * XTrail's real GPS/background-location engine
   * is implemented.
   *
   * The important architectural difference is
   * that this timer now lives in a provider above
   * the individual pages. Leaving /record will
   * therefore no longer destroy the recording.
   */
  useEffect(() => {
    if (session.status !== "recording") {
      return;
    }

    const interval =
      window.setInterval(() => {
        setSession((previousSession) => {
          if (
            previousSession.status !==
            "recording"
          ) {
            return previousSession;
          }

          const simulatedSpeedKmh =
            Math.random() * 40 + 15;

          const nextDurationSeconds =
            previousSession.durationSeconds + 1;

          const nextDistanceKm =
            previousSession.distanceKm +
            simulatedSpeedKmh / 3600;

          const nextElevationGainM =
            previousSession.elevationGainM +
            Math.random() * 0.6;

          const lastPoint =
            previousSession.pathPoints[
              previousSession.pathPoints
                .length - 1
            ] ?? {
              x: 50,
              y: 50,
            };

          const nextX = Math.min(
            95,
            Math.max(
              5,
              lastPoint.x +
                (Math.random() - 0.5) * 5
            )
          );

          const nextY = Math.min(
            95,
            Math.max(
              5,
              lastPoint.y +
                (Math.random() - 0.5) * 5
            )
          );

          return {
            ...previousSession,

            durationSeconds:
              nextDurationSeconds,

            distanceKm:
              nextDistanceKm,

            currentSpeedKmh:
              simulatedSpeedKmh,

            elevationGainM:
              nextElevationGainM,

            pathPoints: [
              ...previousSession.pathPoints,
              {
                x: nextX,
                y: nextY,
              },
            ],

            updatedAt:
              new Date().toISOString(),
          };
        });
      }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [session.status]);

  const averageSpeedKmh =
    session.durationSeconds > 0
      ? session.distanceKm /
        (session.durationSeconds / 3600)
      : 0;

  const startRide = ({
    vehicleId,
    trailId,
  }: StartRideOptions) => {
    setSession((previousSession) => {
      if (previousSession.status !== "idle") {
        return previousSession;
      }

      const now = new Date().toISOString();

      return {
        status: "recording",

        vehicleId,
        trailId,

        durationSeconds: 0,
        distanceKm: 0,
        currentSpeedKmh: 0,
        elevationGainM: 0,

        pathPoints: [
          {
            x: 50,
            y: 50,
          },
        ],

        startedAt: now,
        finishedAt: undefined,
        updatedAt: now,
      };
    });
  };

  const pauseRide = () => {
    setSession((previousSession) => {
      if (
        previousSession.status !==
        "recording"
      ) {
        return previousSession;
      }

      return {
        ...previousSession,

        status: "paused",
        currentSpeedKmh: 0,

        updatedAt:
          new Date().toISOString(),
      };
    });
  };

  const resumeRide = () => {
    setSession((previousSession) => {
      if (
        previousSession.status !== "paused"
      ) {
        return previousSession;
      }

      return {
        ...previousSession,

        status: "recording",

        finishedAt: undefined,

        updatedAt:
          new Date().toISOString(),
      };
    });
  };

  const stopRide = () => {
    setSession((previousSession) => {
      if (
        previousSession.status !==
          "recording" &&
        previousSession.status !== "paused"
      ) {
        return previousSession;
      }

      const now = new Date().toISOString();

      return {
        ...previousSession,

        status: "stopped",
        currentSpeedKmh: 0,

        finishedAt: now,
        updatedAt: now,
      };
    });
  };

  const resetRide = () => {
    setSession({
      ...EMPTY_RIDE_SESSION,
    });
  };

  const value =
    useMemo<RideRecordingContextValue>(
      () => ({
        session,

        isRecording:
          session.status === "recording",

        isPaused:
          session.status === "paused",

        isStopped:
          session.status === "stopped",

        hasRideSession:
          session.status !== "idle",

        averageSpeedKmh,

        startRide,
        pauseRide,
        resumeRide,
        stopRide,
        resetRide,
      }),
      [session, averageSpeedKmh]
    );

  return (
    <RideRecordingContext.Provider
      value={value}
    >
      {children}
    </RideRecordingContext.Provider>
  );
}

export function useRideRecording() {
  const context = useContext(
    RideRecordingContext
  );

  if (!context) {
    throw new Error(
      "useRideRecording must be used inside RideRecordingProvider"
    );
  }

  return context;
}