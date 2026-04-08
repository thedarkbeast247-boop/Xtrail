import { Link, useLocation } from 'react-router';
import { Map, Compass, User, Crown } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-0 sm:p-4">
      {/* Mobile Container */}
      <div className="w-full max-w-[430px] min-h-screen sm:h-[932px] sm:min-h-0 bg-neutral-950 flex flex-col relative shadow-2xl sm:border-x border-neutral-800 sm:rounded-3xl overflow-hidden">
        {/* Mobile Notch (Optional) */}
        <div className="hidden sm:flex absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-50"></div>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        
        {/* Bottom Navigation */}
        <nav className="bg-neutral-900 border-t border-neutral-800">
          <div className="flex justify-around items-center h-16 px-4">
            <Link 
              to="/" 
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive('/') 
                  ? 'text-emerald-500' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Map className="w-6 h-6" />
              <span className="text-xs">Map</span>
            </Link>
            
            <Link 
              to="/record" 
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive('/record') 
                  ? 'text-emerald-500' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Compass className="w-6 h-6" />
              <span className="text-xs">Record</span>
            </Link>
            
            <Link 
              to="/subscription" 
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive('/subscription') 
                  ? 'text-emerald-500' 
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Crown className="w-6 h-6" />
              <span className="text-xs">Premium</span>
            </Link>
            
            <Link 
              to="/profile" 
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive('/profile') 
                  ? 'text-emerald-500' 
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