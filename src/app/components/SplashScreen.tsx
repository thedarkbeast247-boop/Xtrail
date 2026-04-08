import { Mountain } from 'lucide-react';

export function SplashScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 to-neutral-950 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6 relative">
          <Mountain className="w-24 h-24 text-emerald-500 mx-auto animate-pulse" />
          <div className="absolute inset-0 w-24 h-24 mx-auto bg-emerald-500 opacity-20 blur-2xl rounded-full"></div>
        </div>
        <h1 className="text-white text-3xl mb-2">TrailTracker</h1>
        <p className="text-neutral-400">Loading your adventure...</p>
      </div>
    </div>
  );
}
