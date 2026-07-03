import type { FeatureKey, UserAccessProfile } from "../types/access";

export const FREE_PLAN_VEHICLE_LIMIT = 2;

export function isActiveAccount(user: UserAccessProfile) {
  return user.accountStatus === "active";
}

export function isGlobalAdmin(user: UserAccessProfile) {
  return isActiveAccount(user) && user.role === "global_admin";
}

export function isAdmin(user: UserAccessProfile) {
  return isActiveAccount(user) && user.role === "admin";
}

export function isAdminOrOwner(user: UserAccessProfile) {
  return isGlobalAdmin(user) || isAdmin(user);
}

export function isContributor(user: UserAccessProfile) {
  return (
    isActiveAccount(user) &&
    user.role === "contributor" &&
    user.contributorStatus === "active" &&
    user.contributorAccessActive
  );
}

export function contributorMeetsMonthlyRequirement(user: UserAccessProfile) {
  return (
    user.contributorTrailsApprovedThisMonth >=
    user.contributorTrailsRequiredPerMonth
  );
}

export function isPaidUser(user: UserAccessProfile) {
  return (
    isActiveAccount(user) &&
    user.plan === "paid" &&
    user.subscriptionStatus === "active"
  );
}

export function hasFullAppAccess(user: UserAccessProfile) {
  if (!isActiveAccount(user)) return false;

  return (
    isGlobalAdmin(user) ||
    isAdmin(user) ||
    isContributor(user) ||
    isPaidUser(user) ||
    user.manualFullAccess
  );
}

export function canAccessAdminArea(user: UserAccessProfile) {
  return isAdminOrOwner(user);
}

export function canManageUsers(user: UserAccessProfile) {
  return isAdminOrOwner(user);
}

export function canManageRoles(user: UserAccessProfile) {
  return isGlobalAdmin(user);
}

export function canGrantManualAccess(user: UserAccessProfile) {
  return isAdminOrOwner(user);
}

export function canRemoveManualAccess(user: UserAccessProfile) {
  return isAdminOrOwner(user);
}

export function canReviewTrails(user: UserAccessProfile) {
  return isAdminOrOwner(user);
}

export function canManageSystemSettings(user: UserAccessProfile) {
  return isGlobalAdmin(user);
}

export function canAccessFeature(user: UserAccessProfile, feature: FeatureKey) {
  if (!isActiveAccount(user)) return false;

  if (isGlobalAdmin(user)) return true;

  if (feature === "admin_area") return canAccessAdminArea(user);
  if (feature === "user_management") return canManageUsers(user);
  if (feature === "trail_review") return canReviewTrails(user);
  if (feature === "manual_access_management") return canGrantManualAccess(user);

  return hasFullAppAccess(user);
}

export function getAccessLabel(user: UserAccessProfile) {
  if (isGlobalAdmin(user)) return "Global Admin / Owner";
  if (isAdmin(user)) return "Admin access";
  if (isContributor(user)) return "Contributor access";
  if (user.manualFullAccess) return "Manual full access";
  if (isPaidUser(user)) return "Paid plan";
  return "Free plan";
}

export function getContributorProgressLabel(user: UserAccessProfile) {
  return `${user.contributorTrailsApprovedThisMonth}/${user.contributorTrailsRequiredPerMonth} approved trails this month`;
}

export function getGarageAccess(
  user: UserAccessProfile,
  currentVehicleCount: number
) {
  const unlimited = hasFullAppAccess(user);

  return {
    unlimited,
    accessLabel: getAccessLabel(user),
    vehicleLimit: unlimited ? null : FREE_PLAN_VEHICLE_LIMIT,
    vehicleLimitLabel: unlimited
      ? "Unlimited"
      : `${currentVehicleCount}/${FREE_PLAN_VEHICLE_LIMIT}`,
    isVehicleLimitReached:
      !unlimited && currentVehicleCount >= FREE_PLAN_VEHICLE_LIMIT,
  };
}