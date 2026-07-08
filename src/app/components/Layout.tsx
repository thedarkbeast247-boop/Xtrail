import { Link, useLocation } from "react-router";
import { Map, Compass, User, Car } from "lucide-react";

import { AppNotificationViewport } from "../context/NotificationContext";

export function Layout({
  children,
  showBottomNav = true,
}: {
  children: React.ReactNode;
  showBottomNav?: boolean;
}) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
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
      </div>
    </div>
  );
}