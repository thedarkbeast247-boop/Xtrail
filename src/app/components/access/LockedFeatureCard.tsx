import { Link } from "react-router";
import { Crown, LockKeyhole, Sparkles } from "lucide-react";

import { Button } from "../ui/button";

interface LockedFeatureCardProps {
  title: string;
  message: string;
  ctaLabel?: string;
  compact?: boolean;
}

export function LockedFeatureCard({
  title,
  message,
  ctaLabel = "Upgrade",
  compact = false,
}: LockedFeatureCardProps) {
  return (
    <div
      className={`rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-neutral-900 to-neutral-950 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
          <LockKeyhole className="h-6 w-6" />
        </div>

        <div className="flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
          <Crown className="h-3.5 w-3.5" />
          Premium
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white">{title}</h2>

      <p className="mt-2 text-sm leading-relaxed text-neutral-400">
        {message}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Link to="/subscription">
          <Button className="w-full bg-orange-600 hover:bg-orange-700">
            <Sparkles className="mr-2 h-4 w-4" />
            {ctaLabel}
          </Button>
        </Link>

        <Link to="/">
          <Button
            variant="outline"
            className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
          >
            Explore Free
          </Button>
        </Link>
      </div>
    </div>
  );
}