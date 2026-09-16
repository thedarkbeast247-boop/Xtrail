import {
  Link,
  useLocation,
  useNavigate,
} from "react-router";
import {
  Map,
  Compass,
  User,
  Car,
  Pause,
  Play,
  Square,
  MapPinned,
} from "lucide-react";

import { AppNotificationViewport } from "../context/NotificationContext";
import { useRideRecording } from "../context/RideRecordingContext";
import {
  useState,
  type ReactNode,
} from "react";

function formatRideTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  return `${hh}:${mm}:${ss}`;
}

export function Layout({
  children,
  showBottomNav = true,
}: {
  children: ReactNode;
  showBottomNav?: boolean;
}) {
  const location = useLocation();

  const navigate = useNavigate();

  const [showRideStopConfirm, setShowRideStopConfirm] =
    useState(false);
  
  const [
    rideWasPausedBeforeStop,
    setRideWasPausedBeforeStop,
  ] = useState(false);

  const {
    session,
    isRecording,
    isPaused,
    pauseRide,
    resumeRide,
    stopRide,
  } = useRideRecording();

  const showActiveRideBar =
    showBottomNav &&
    location.pathname !== "/record" &&
    (isRecording || isPaused);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handlePauseResumeRide = () => {
    if (isPaused) {
      resumeRide();
    } else {
      pauseRide();
    }
  };

  const handleOpenRideMap = () => {
    navigate("/record");
  };

  const handleRequestStopRide = () => {
    setRideWasPausedBeforeStop(isPaused);

    if (isRecording) {
      pauseRide();
    }

    setShowRideStopConfirm(true);
  };

  const handleCancelStopRide = () => {
    setShowRideStopConfirm(false);

    if (!rideWasPausedBeforeStop) {
      resumeRide();
    }
  };

  const handleConfirmStopRide = () => {
    stopRide();

    setShowRideStopConfirm(false);

    navigate("/record");
  };

  return (
    <div className="flex h-[100dvh] items-stretch justify-center overflow-hidden bg-neutral-950 p-0 sm:items-center sm:p-4">
      {/* Mobile Container */}
      <div className="relative flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-neutral-950 shadow-2xl sm:h-[932px] sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:border-x sm:border-neutral-800">
        <AppNotificationViewport />

        <div
          id="app-modal-root"
          className="pointer-events-none absolute inset-0 z-[80]"
        />

        {/* Mobile Notch */}
        <div className="absolute left-1/2 top-0 z-50 hidden h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-black sm:flex" />

        <main className="app-scrollbar min-h-0 flex-1 touch-pan-y overflow-x-hidden overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          {children}
        </main>

        {/* Global Active Ride Indicator */}
        {showActiveRideBar && (
          <div className="shrink-0 border-t border-neutral-800 bg-neutral-950 px-3 py-2">
            <div
              className={`rounded-2xl border px-4 py-3 ${
                isPaused
                  ? "border-yellow-500/30 bg-yellow-500/10"
                  : "border-emerald-500/30 bg-emerald-500/10"
              }`}
            >
              {/* Ride Status */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                        isPaused
                          ? "bg-yellow-400"
                          : "bg-emerald-400 animate-pulse"
                      }`}
                    />

                    <span
                      className={`text-[11px] font-bold uppercase tracking-wide ${
                        isPaused
                          ? "text-yellow-300"
                          : "text-emerald-300"
                      }`}
                    >
                      {isPaused
                        ? "Ride Paused"
                        : "Ride Active"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-neutral-400">
                    {session.distanceKm.toFixed(2)} km
                  </p>
                </div>

                <div className="flex-shrink-0 text-right">
                  <p className="font-mono text-base font-semibold text-white">
                    {formatRideTime(
                      session.durationSeconds
                    )}
                  </p>

                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                    Live Ride
                  </p>
                </div>
              </div>

              {/* Ride Controls */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleRequestStopRide}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 active:scale-[0.98]"
                >
                  <Square className="h-4 w-4 fill-current" />
                  Stop
                </button>

                <button
                  type="button"
                  onClick={handlePauseResumeRide}
                  className={`flex h-10 items-center justify-center gap-2 rounded-xl border text-xs font-semibold transition active:scale-[0.98] ${
                    isPaused
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      : "border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20"
                  }`}
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 fill-current" />
                      Pause
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenRideMap}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20 active:scale-[0.98]"
                >
                  <MapPinned className="h-4 w-4" />
                  Map
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        {showBottomNav && (
          <nav className="shrink-0 border-t border-neutral-800 bg-neutral-900">
            <div className="flex h-16 items-center justify-around px-2">
              <Link
                to="/"
                className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                  isActive("/") ||
                  isActive("/trail/1") ||
                  isActive("/trail/2") ||
                  isActive("/trail/3") ||
                  isActive("/trail/4") ||
                  isActive("/trail/5") ||
                  isActive("/trail/6")
                    ? "text-red-500"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Map className="h-6 w-6" />
                <span className="text-xs">Home</span>
              </Link>

              <Link to="/record" className="relative -mt-6">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-lg transition-all ${
                    isActive("/record")
                      ? "scale-110 bg-red-600"
                      : "hover:bg-red-700"
                  }`}
                >
                  <Compass className="h-7 w-7 text-white" />
                </div>

                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-neutral-400">
                  Record
                </span>
              </Link>

              <Link
                to="/garage"
                className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                  isActive("/garage")
                    ? "text-red-500"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Car className="h-6 w-6" />
                <span className="text-xs">Garage</span>
              </Link>

              <Link
                to="/profile"
                className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                  isActive("/profile") ||
                  isActive("/service-log") ||
                  isActive("/friends") ||
                  isActive("/progress") ||
                  isActive("/achievements") ||
                  isActive("/subscription") ||
                  location.pathname.startsWith("/admin")
                    ? "text-red-500"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <User className="h-6 w-6" />
                <span className="text-xs">Profile</span>
              </Link>
            </div>
          </nav>
        )}
        {/* Global Ride Stop Confirmation */}
        {showRideStopConfirm && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 px-5">
            <div className="w-full max-w-[340px] rounded-3xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <Square className="h-6 w-6 fill-current text-red-400" />
              </div>

              <h2 className="mt-4 text-center text-xl font-semibold text-white">
                Stop this ride?
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-neutral-400">
                Recording will stop and you will be taken back to the ride
                summary where you can save or discard it.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCancelStopRide}
                  className="h-11 rounded-xl border border-neutral-700 bg-neutral-900 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-800"
                >
                  Keep Riding
                </button>

                <button
                  type="button"
                  onClick={handleConfirmStopRide}
                  className="h-11 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  Stop Ride
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}