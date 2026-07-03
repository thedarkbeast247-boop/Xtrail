import { Link, useLocation } from 'react-router';
import { Map, Compass, User, Car } from 'lucide-react';
import { AppNotificationViewport } from '../context/NotificationContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-0 sm:p-4">
      {/* Mobile Container */}
      <div className="w-full max-w-[430px] min-h-screen sm:h-[932px] sm:min-h-0 bg-neutral-950 flex flex-col relative shadow-2xl sm:border-x border-neutral-800 sm:rounded-3xl overflow-hidden">
        <AppNotificationViewport />
        <div id="app-modal-root" className="pointer-events-none absolute inset-0 z-[80]" />
        {/* Mobile Notch (Optional) */}
        <div className="hidden sm:flex absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50"></div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-neutral-900 border-t border-neutral-800">
          <div className="flex justify-around items-center h-16 px-2">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive('/') || isActive('/trail/1') || isActive('/trail/2') || isActive('/trail/3') || isActive('/trail/4') || isActive('/trail/5') || isActive('/trail/6')
                  ? 'text-red-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Map className="w-6 h-6" />
              <span className="text-xs">Home</span>
            </Link>

            <Link
              to="/record"
              className="relative -mt-6"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isActive('/record')
                  ? 'bg-red-600 scale-110'
                  : 'bg-red-600 hover:bg-red-700'
              }`}>
                <Compass className="w-7 h-7 text-white" />
              </div>
              <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs text-neutral-400 whitespace-nowrap">Record</span>
            </Link>

            <Link
              to="/garage"
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive('/garage')
                  ? 'text-red-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Car className="w-6 h-6" />
              <span className="text-xs">Garage</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-colors ${
                isActive('/profile') || isActive('/service-log') || isActive('/friends') || isActive('/progress') || isActive('/achievements') || isActive('/subscription')
                  ? 'text-red-500'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}