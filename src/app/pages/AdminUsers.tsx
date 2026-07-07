import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertTriangle,
  BadgeCheck,
  Crown,
  KeyRound,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

import { useNotification } from "../context/NotificationContext";
import { useUserAccess } from "../context/UserAccessContext";
import {
  canAccessAdminArea,
  canManageRoles,
  getAccessLabel,
  getContributorProgressLabel,
  hasFullAppAccess,
} from "../lib/accessControl";

import type {
  AppPlan,
  AppRole,
  ContributorStatus,
  UserAccessProfile,
  UserAccountStatus,
} from "../types/access";

const roleOptions: { value: AppRole; label: string }[] = [
  { value: "global_admin", label: "Global Admin / Owner" },
  { value: "admin", label: "Admin" },
  { value: "contributor", label: "Contributor" },
  { value: "user", label: "User" },
];

const planOptions: { value: AppPlan; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

const contributorStatusOptions: { value: ContributorStatus; label: string }[] =
  [
    { value: "none", label: "None" },
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "warning", label: "Warning" },
    { value: "suspended", label: "Suspended" },
    { value: "revoked", label: "Revoked" },
  ];

const accountStatusOptions: { value: UserAccountStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "disabled", label: "Disabled" },
];

function getRoleClassName(role: AppRole) {
  if (role === "global_admin") return "border-red-500/20 bg-red-500/10 text-red-400";
  if (role === "admin") return "border-purple-500/20 bg-purple-500/10 text-purple-400";
  if (role === "contributor") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  return "border-neutral-700 bg-neutral-900 text-neutral-300";
}

function getPlanClassName(plan: AppPlan) {
  if (plan === "paid") return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  return "border-neutral-700 bg-neutral-900 text-neutral-300";
}

function getStatusClassName(status: UserAccountStatus) {
  if (status === "active") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
  if (status === "suspended") return "border-orange-500/20 bg-orange-500/10 text-orange-400";
  return "border-red-500/20 bg-red-500/10 text-red-400";
}

export function AdminUsers() {
  const {
    currentUserAccess,
    users,
    updateUserAccess,
    setUserRole,
    setUserPlan,
    grantManualFullAccess,
    removeManualFullAccess,
  } = useUserAccess();

  const { showNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState("");
  const [manualAccessReasons, setManualAccessReasons] = useState<
    Record<string, string>
  >({});

  const canOpenAdminArea = canAccessAdminArea(currentUserAccess);
  const canEditRoles = canManageRoles(currentUserAccess);

  const filteredUsers = useMemo(() => {
    const value = searchTerm.trim().toLowerCase();

    if (!value) return users;

    return users.filter((user) => {
      return (
        user.displayName.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.role.toLowerCase().includes(value) ||
        user.plan.toLowerCase().includes(value)
      );
    });
  }, [searchTerm, users]);

  const adminStats = useMemo(() => {
    return {
      totalUsers: users.length,
      fullAccessUsers: users.filter((user) => hasFullAppAccess(user)).length,
      contributors: users.filter((user) => user.role === "contributor").length,
      paidUsers: users.filter((user) => user.plan === "paid").length,
      twoFactorRequired: users.filter((user) => user.twoFactorRequired).length,
    };
  }, [users]);

  const runAdminAction = (action: () => void, successMessage: string) => {
    try {
      action();

      showNotification({
        title: "Admin action saved",
        message: successMessage,
        variant: "success",
      });
    } catch (error) {
      showNotification({
        title: "Action blocked",
        message:
          error instanceof Error
            ? error.message
            : "You do not have permission to complete this action.",
        variant: "error",
      });
    }
  };

  const handleRoleChange = (user: UserAccessProfile, role: AppRole) => {
    runAdminAction(
      () => setUserRole(user.id, role),
      `${user.displayName}'s role was updated.`
    );
  };

  const handlePlanChange = (user: UserAccessProfile, plan: AppPlan) => {
    runAdminAction(
      () => setUserPlan(user.id, plan),
      `${user.displayName}'s plan was updated.`
    );
  };

  const handleAccountStatusChange = (
    user: UserAccessProfile,
    accountStatus: UserAccountStatus
  ) => {
    if (user.role === "global_admin") {
      showNotification({
        title: "Owner protected",
        message: "The Global Admin / Owner account cannot be suspended or disabled.",
        variant: "warning",
      });

      return;
    }

    runAdminAction(
      () => updateUserAccess(user.id, { accountStatus }),
      `${user.displayName}'s account status was updated.`
    );
  };

  const handleContributorStatusChange = (
    user: UserAccessProfile,
    contributorStatus: ContributorStatus
  ) => {
    runAdminAction(
      () =>
        updateUserAccess(user.id, {
          role: contributorStatus === "active" ? "contributor" : user.role,
          contributorStatus,
          contributorAccessActive: contributorStatus === "active",
        }),
      `${user.displayName}'s contributor status was updated.`
    );
  };

  const handleRequireTwoFactorPolicy = (user: UserAccessProfile) => {
    if (user.twoFactorRequired) {
      showNotification({
        title: "2FA policy already active",
        message: `${user.displayName} already has the correct 2FA policy.`,
        variant: "info",
      });

      return;
    }

    runAdminAction(
      () =>
        updateUserAccess(user.id, {
          twoFactorRequired: true,
          twoFactorRequiredForNewDevice: true,
          twoFactorRequiredForSensitiveActions: true,
        }),
      `${user.displayName}'s 2FA policy was updated.`
    );
  };

  const handleGrantManualAccess = (user: UserAccessProfile) => {
    const reason =
      manualAccessReasons[user.id]?.trim() || "Granted by admin from app.";

    runAdminAction(
      () => grantManualFullAccess(user.id, reason),
      `${user.displayName} now has manual full access.`
    );
  };

  const handleRemoveManualAccess = (user: UserAccessProfile) => {
    runAdminAction(
      () => removeManualFullAccess(user.id),
      `${user.displayName}'s manual full access was removed.`
    );
  };

  if (!canOpenAdminArea) {
    return (
      <div className="min-h-full bg-neutral-950 px-4 py-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <h1 className="text-xl font-semibold text-white">
            Admin access required
          </h1>

          <p className="mt-2 text-sm text-neutral-300">
            You do not have permission to access user management.
          </p>

          <Link to="/profile">
            <Button className="mt-5 bg-red-600 hover:bg-red-700">
              Back to Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-neutral-950">
      <div className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-4 py-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-500">
              XTrail Admin
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white">
              User Management
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Manage roles, access, plans, contributor status, and 2FA rules.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <UserCog className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">Signed in as</p>
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
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <p className="text-xs text-neutral-500">Total users</p>
            <p className="mt-1 text-xl font-bold text-white">
              {adminStats.totalUsers}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <p className="text-xs text-neutral-500">Full access</p>
            <p className="mt-1 text-xl font-bold text-white">
              {adminStats.fullAccessUsers}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <p className="text-xs text-neutral-500">Contributors</p>
            <p className="mt-1 text-xl font-bold text-white">
              {adminStats.contributors}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-3">
            <p className="text-xs text-neutral-500">2FA policy</p>
            <p className="mt-1 text-xl font-bold text-white">
              {adminStats.twoFactorRequired}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-neutral-500" />
            <p className="text-sm font-semibold text-white">Search users</p>
          </div>

          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, role, or plan..."
            className="border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
          />

          <p className="mt-2 text-xs text-neutral-500">
            Showing {filteredUsers.length} of {users.length} users.
          </p>
        </div>

        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const isProtectedOwner = user.role === "global_admin";
            const userHasFullAccess = hasFullAppAccess(user);

            return (
              <div
                key={user.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white">
                      {isProtectedOwner ? (
                        <Crown className="h-5 w-5 text-red-400" />
                      ) : user.role === "admin" ? (
                        <ShieldCheck className="h-5 w-5 text-purple-400" />
                      ) : user.role === "contributor" ? (
                        <BadgeCheck className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <Users className="h-5 w-5 text-neutral-300" />
                      )}
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

                        <Badge className={getPlanClassName(user.plan)}>
                          {user.plan === "paid" ? "Paid" : "Free"}
                        </Badge>

                        <Badge className={getStatusClassName(user.accountStatus)}>
                          {user.accountStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-xs text-neutral-500">Full access</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {userHasFullAccess ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-xs text-neutral-500">Trust level</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      Level {user.trustLevel}
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-xs text-neutral-500">2FA enabled</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {user.twoFactorEnabled ? "Yes" : "No"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                    <p className="text-xs text-neutral-500">2FA required</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {user.twoFactorRequired ? "Active" : "Optional"}
                    </p>
                  </div>
                </div>

                <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                  <div className="mb-2 flex items-center gap-2 text-neutral-300">
                    <BadgeCheck className="h-4 w-4" />
                    <p className="text-sm font-semibold">Contributor progress</p>
                  </div>

                  <p className="text-xs text-neutral-400">
                    {getContributorProgressLabel(user)}
                  </p>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-800">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (user.contributorTrailsApprovedThisMonth /
                            user.contributorTrailsRequiredPerMonth) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-xs text-neutral-500">Role</p>
                      <Select
                        value={user.role}
                        disabled={!canEditRoles || isProtectedOwner}
                        onValueChange={(value) =>
                          handleRoleChange(user, value as AppRole)
                        }
                      >
                        <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-700 bg-neutral-800">
                          {roleOptions.map((role) => (
                            <SelectItem
                              key={role.value}
                              value={role.value}
                              className="text-white"
                            >
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-neutral-500">Plan</p>
                      <Select
                        value={user.plan}
                        disabled={isProtectedOwner}
                        onValueChange={(value) =>
                          handlePlanChange(user, value as AppPlan)
                        }
                      >
                        <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-700 bg-neutral-800">
                          {planOptions.map((plan) => (
                            <SelectItem
                              key={plan.value}
                              value={plan.value}
                              className="text-white"
                            >
                              {plan.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-xs text-neutral-500">
                        Account status
                      </p>
                      <Select
                        value={user.accountStatus}
                        disabled={isProtectedOwner}
                        onValueChange={(value) =>
                          handleAccountStatusChange(
                            user,
                            value as UserAccountStatus
                          )
                        }
                      >
                        <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-700 bg-neutral-800">
                          {accountStatusOptions.map((status) => (
                            <SelectItem
                              key={status.value}
                              value={status.value}
                              className="text-white"
                            >
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="mb-1 text-xs text-neutral-500">
                        Contributor
                      </p>
                      <Select
                        value={user.contributorStatus}
                        disabled={isProtectedOwner}
                        onValueChange={(value) =>
                          handleContributorStatusChange(
                            user,
                            value as ContributorStatus
                          )
                        }
                      >
                        <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent className="border-neutral-700 bg-neutral-800">
                          {contributorStatusOptions.map((status) => (
                            <SelectItem
                              key={status.value}
                              value={status.value}
                              className="text-white"
                            >
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-neutral-500">
                      Manual full access reason
                    </p>
                    <Input
                      value={manualAccessReasons[user.id] ?? ""}
                      disabled={isProtectedOwner}
                      onChange={(event) =>
                        setManualAccessReasons((prev) => ({
                          ...prev,
                          [user.id]: event.target.value,
                        }))
                      }
                      placeholder="Example: Sponsored rider, tester, partner..."
                      className="border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {user.manualFullAccess ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isProtectedOwner}
                        onClick={() => handleRemoveManualAccess(user)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Remove Access
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        disabled={isProtectedOwner}
                        onClick={() => handleGrantManualAccess(user)}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Grant Full Access
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleRequireTwoFactorPolicy(user)}
                      className="border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                    >
                      <KeyRound className="mr-2 h-4 w-4" />
                      {user.twoFactorRequired ? "2FA Policy Active" : "Enforce 2FA Policy"}
                    </Button>
                  </div>
                </div>

                {user.manualFullAccess && (
                  <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-xs font-semibold text-emerald-400">
                      Manual full access active
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {user.manualFullAccessReason || "No reason added."}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}