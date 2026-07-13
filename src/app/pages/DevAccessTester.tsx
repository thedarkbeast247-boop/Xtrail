import { Link } from "react-router";
import {
  AlertTriangle,
  BadgeCheck,
  Crown,
  RotateCcw,
  ShieldCheck,
  User,
  UserCog,
  Users,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useNotification } from "../context/NotificationContext";
import { useUserAccess } from "../context/UserAccessContext";
import {
  getAccessLabel,
  hasFullAppAccess,
} from "../lib/accessControl";
import type { AppRole } from "../types/access";

const devToolsEnabled =
  import.meta.env.DEV ||
  import.meta.env.VITE_ENABLE_DEV_TOOLS === "true";

function getRoleIcon(role: AppRole) {
  if (role === "global_admin") return <Crown className="h-5 w-5 text-red-400" />;
  if (role === "admin") return <ShieldCheck className="h-5 w-5 text-purple-400" />;
  if (role === "contributor") return <BadgeCheck className="h-5 w-5 text-emerald-400" />;
  return <User className="h-5 w-5 text-neutral-300" />;
}

function getRoleClassName(role: AppRole) {
  if (role === "global_admin") {
    return "border-red-500/20 bg-red-500/10 text-red-400";
  }

  if (role === "admin") {
    return "border-purple-500/20 bg-purple-500/10 text-purple-400";
  }

  if (role === "contributor") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  }

  return "border-neutral-700 bg-neutral-900 text-neutral-300";
}

export function DevAccessTester() {
  const {
    currentUserId,
    currentUserAccess,
    users,
    switchCurrentUser,
    markProAccessEnded,
    clearProAccessReview,
  } = useUserAccess();

  const { showNotification } = useNotification();

  if (!devToolsEnabled) {
    return (
      <div className="min-h-full bg-neutral-950 px-4 py-6">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
          <h1 className="text-xl font-bold text-white">
            Developer tools unavailable
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Developer tools are disabled for this build.
          </p>
        </div>
      </div>
    );
  }

  const handleSimulatePaymentFailed = () => {
    try {
      markProAccessEnded(currentUserId, "payment_failed");

      showNotification({
        title: "Payment failed simulated",
        message: "This user now needs to review their Free Plan selections.",
        variant: "warning",
      });
    } catch (error) {
      showNotification({
        title: "Could not simulate downgrade",
        message:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
    }
  };

  const handleRestoreProPlan = () => {
    try {
      clearProAccessReview(currentUserId);

      showNotification({
        title: "Pro Plan restored",
        message: "This user has full Pro access again.",
        variant: "success",
      });
    } catch (error) {
      showNotification({
        title: "Could not restore Pro",
        message:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "error",
      });
    }
  };

  const handleSwitchUser = (userId: string) => {
    const user = users.find((item) => item.id === userId);

    switchCurrentUser(userId);

    showNotification({
      title: "User switched",
      message: `You are now viewing the app as ${user?.displayName ?? "selected user"}.`,
      variant: "success",
    });
  };

  return (
    <div className="min-h-full bg-neutral-950">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
              Developer Tool
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white">
              Access Tester
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Switch between demo users to test free, paid, contributor, admin, and owner access.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <UserCog className="h-6 w-6" />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">Currently viewing as</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">
                {currentUserAccess.displayName}
              </p>
              <p className="text-xs text-neutral-400">
                {currentUserAccess.email}
              </p>
            </div>

            <Badge className={getRoleClassName(currentUserAccess.role)}>
              {getAccessLabel(currentUserAccess)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-4 py-5">
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4">
          <p className="text-sm font-semibold text-orange-400">
            Private testing only
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            This tool is enabled only for private testing before the public release.
            It must be disabled before XTrail goes live.
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-sm font-semibold text-white">
            Pro downgrade testing
          </p>

          <p className="mt-1 text-xs text-neutral-400">
            Simulate a missed payment or restore Pro access for the current demo user.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <Button
              type="button"
              onClick={handleSimulatePaymentFailed}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Simulate Payment Failed
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleRestoreProPlan}
              className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore Pro Plan
            </Button>

            <Link to="/account/plan-review">
              <Button
                type="button"
                variant="outline"
                className="w-full border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
              >
                Open Plan Review
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            const fullAccess = hasFullAppAccess(user);

            return (
              <div
                key={user.id}
                className={`rounded-2xl border p-4 ${
                  isCurrentUser
                    ? "border-red-500/40 bg-red-500/10"
                    : "border-neutral-800 bg-neutral-900"
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800">
                      {getRoleIcon(user.role)}
                    </div>

                    <div>
                      <h2 className="font-semibold text-white">
                        {user.displayName}
                      </h2>
                      <p className="text-xs text-neutral-400">{user.email}</p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className={getRoleClassName(user.role)}>
                          {getAccessLabel(user)}
                        </Badge>

                        <Badge className="border-neutral-700 bg-neutral-950 text-neutral-300">
                          {user.plan === "paid" ? "Paid" : "Free"}
                        </Badge>

                        <Badge className="border-neutral-700 bg-neutral-950 text-neutral-300">
                          {fullAccess ? "Full access" : "Limited access"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-neutral-500">Role</p>
                    <p className="mt-1 font-semibold text-white">{user.role}</p>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-neutral-500">Plan</p>
                    <p className="mt-1 font-semibold text-white">{user.plan}</p>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-neutral-500">Contributor</p>
                    <p className="mt-1 font-semibold text-white">
                      {user.contributorStatus}
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-neutral-500">2FA policy</p>
                    <p className="mt-1 font-semibold text-white">
                      {user.twoFactorRequired ? "Active" : "Optional"}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  disabled={isCurrentUser}
                  onClick={() => handleSwitchUser(user.id)}
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isCurrentUser ? "Currently Active" : `Use ${user.displayName}`}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/garage">
            <Button
              variant="outline"
              className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Test Garage
            </Button>
          </Link>

          <Link to="/progress">
            <Button
              variant="outline"
              className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Test Analytics
            </Button>
          </Link>

          <Link to="/profile">
            <Button
              variant="outline"
              className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Test Profile
            </Button>
          </Link>

          <Link to="/admin/users">
            <Button
              variant="outline"
              className="w-full border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            >
              Test Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}