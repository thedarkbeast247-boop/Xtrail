import {
  Check,
  Crown,
  Gauge,
  Map,
  ShieldCheck,
  Star,
  Wrench,
  X,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useUserAccess } from "../context/UserAccessContext";
import { getPublicPlanLabel } from "../lib/accessControl";

const freeFeatures = [
  "View 5 trails in your selected area",
  "Add up to 2 garage vehicles",
  "View 5 saved trails",
  "View 5 ride history entries",
  "View 5 completed trails",
  "Basic ride recording",
  "Basic profile and quick access",
];

const proFeatures = [
  "Unlimited trail discovery",
  "Unlimited garage vehicles",
  "Unlimited saved trails",
  "Unlimited ride history",
  "Unlimited completed trails",
  "Progress Dashboard access",
  "Full groups and group ride planning",
  "Vehicle health and service insights",
  "Advanced ride stats and long-term tracking",
];

const futureProFeatures = [
  "Offline maps",
  "GPX import and export",
  "Advanced map layers",
  "Emergency buddy tools",
  "Trail compatibility and readiness checks",
];

export function Subscription() {
  const { currentUserAccess } = useUserAccess();
  const currentPlanLabel = getPublicPlanLabel(currentUserAccess);
  const isProPlan = currentPlanLabel === "Pro Plan";

  return (
    <div className="min-h-full bg-neutral-950">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-orange-950/70 to-neutral-950 px-4 py-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-400">
            <Crown className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-bold text-white">Choose Your Plan</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Start free, then subscribe to Pro when you need unlimited access.
          </p>
        </div>
      </div>

      <div className="space-y-5 px-4 py-6">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-neutral-500">Current plan</p>
              <p className="mt-1 text-xl font-semibold text-white">
                {currentPlanLabel}
              </p>
            </div>

            <Badge
              variant="outline"
              className={
                isProPlan
                  ? "border-orange-500/40 text-orange-400"
                  : "border-neutral-700 text-neutral-400"
              }
            >
              Active
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-white">Free Plan</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Good for testing XTrail and getting started.
              </p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-white">R0</p>
              <p className="text-xs text-neutral-500">no cost</p>
            </div>
          </div>

          <div className="space-y-3">
            {freeFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                <span className="text-sm text-neutral-300">{feature}</span>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="mt-6 w-full border-neutral-700 text-neutral-300"
            disabled={!isProPlan}
          >
            {isProPlan ? "Available as free access" : "Current Plan"}
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-2xl border-2 border-orange-500 bg-gradient-to-br from-orange-950/80 via-neutral-900 to-neutral-950 p-5">
          <div className="absolute right-4 top-4">
            <Badge className="bg-orange-500 text-black">Recommended</Badge>
          </div>

          <div className="mb-5 pr-24">
            <h2 className="text-2xl font-bold text-white">Pro Plan</h2>
            <p className="mt-1 text-sm text-orange-200/80">
              Unlock the full XTrail experience.
            </p>
          </div>

          <div className="mb-5 flex items-end gap-2">
            <span className="text-4xl font-bold text-white">R45</span>
            <span className="pb-1 text-sm text-neutral-300">/ month</span>
          </div>

          <div className="space-y-3">
            {proFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-400" />
                <span className="text-sm text-white">{feature}</span>
              </div>
            ))}
          </div>

          <Button className="mt-6 h-12 w-full bg-orange-600 text-base hover:bg-orange-700">
            <Crown className="mr-2 h-5 w-5" />
            {isProPlan ? "Pro Plan Active" : "Subscribe Now"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
            <Map className="mx-auto mb-2 h-7 w-7 text-orange-400" />
            <p className="text-sm font-semibold text-white">Unlimited trails</p>
            <p className="mt-1 text-xs text-neutral-500">Pro Plan</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
            <Gauge className="mx-auto mb-2 h-7 w-7 text-orange-400" />
            <p className="text-sm font-semibold text-white">Ride stats</p>
            <p className="mt-1 text-xs text-neutral-500">Pro Plan</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
            <Wrench className="mx-auto mb-2 h-7 w-7 text-orange-400" />
            <p className="text-sm font-semibold text-white">Garage insights</p>
            <p className="mt-1 text-xs text-neutral-500">Pro Plan</p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-center">
            <Star className="mx-auto mb-2 h-7 w-7 text-orange-400" />
            <p className="text-sm font-semibold text-white">Groups</p>
            <p className="mt-1 text-xs text-neutral-500">Pro Plan</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800 text-neutral-300">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <h3 className="font-semibold text-white">Coming later</h3>
              <p className="text-sm text-neutral-400">
                These can become Pro features once they are built.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {futureProFeatures.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-600" />
                <span className="text-sm text-neutral-400">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h3 className="text-lg font-semibold text-white">
            Frequently Asked Questions
          </h3>

          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-white">
                Can I cancel anytime?
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                Yes. Subscription billing will be connected later when the
                backend and payments are added.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                Why is there only one paid plan?
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                XTrail will start simple with Free and Pro. More plans can be
                added later once advanced features are ready.
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-white">
                What happens to my data?
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                Your local test data stays on your device for now. Backend
                syncing will be added later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}