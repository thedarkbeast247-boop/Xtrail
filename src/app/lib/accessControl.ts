import type { FeatureKey, UserAccessProfile } from "../types/access";

export const FREE_PLAN_VEHICLE_LIMIT = 2;
export const FREE_PLAN_TRAIL_VIEW_LIMIT = 5;
export const FREE_PLAN_SAVED_TRAILS_LIMIT = 5;
export const FREE_PLAN_RIDE_HISTORY_LIMIT = 5;
export const FREE_PLAN_COMPLETED_TRAILS_LIMIT = 5;

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
  if (isPaidUser(user)) return "Pro Plan";
  return "Free Plan";
}

export function getPublicPlanLabel(user: UserAccessProfile) {
  return hasFullAppAccess(user) ? "Pro Plan" : "Free Plan";
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
    accessLabel: getPublicPlanLabel(user),
    vehicleLimit: unlimited ? null : FREE_PLAN_VEHICLE_LIMIT,
    vehicleLimitLabel: unlimited
      ? "Unlimited"
      : `${currentVehicleCount}/${FREE_PLAN_VEHICLE_LIMIT}`,
    isVehicleLimitReached:
      !unlimited && currentVehicleCount >= FREE_PLAN_VEHICLE_LIMIT,
  };
}

export function getTrailDiscoveryAccess(
  user: UserAccessProfile,
  currentTrailCount: number
) {
  const unlimited = canAccessFeature(user, "trail_discovery_unlimited");

  const visibleLimit = unlimited
    ? currentTrailCount
    : FREE_PLAN_TRAIL_VIEW_LIMIT;

  return {
    unlimited,
    accessLabel: getPublicPlanLabel(user),
    visibleLimit,
    trailViewLimitLabel: unlimited
      ? "Unlimited"
      : `${Math.min(
          currentTrailCount,
          FREE_PLAN_TRAIL_VIEW_LIMIT
        )}/${FREE_PLAN_TRAIL_VIEW_LIMIT}`,
    hiddenCount: unlimited
      ? 0
      : Math.max(0, currentTrailCount - FREE_PLAN_TRAIL_VIEW_LIMIT),
    isLimitReached:
      !unlimited && currentTrailCount >= FREE_PLAN_TRAIL_VIEW_LIMIT,
  };
}

export function getSavedTrailsAccess(
  user: UserAccessProfile,
  currentSavedTrailCount: number
) {
  const unlimited = canAccessFeature(user, "saved_trails_unlimited");

  const visibleLimit = unlimited
    ? currentSavedTrailCount
    : FREE_PLAN_SAVED_TRAILS_LIMIT;

  return {
    unlimited,
    accessLabel: getPublicPlanLabel(user),
    visibleLimit,
    savedTrailLimitLabel: unlimited
      ? "Unlimited"
      : `${Math.min(
          currentSavedTrailCount,
          FREE_PLAN_SAVED_TRAILS_LIMIT
        )}/${FREE_PLAN_SAVED_TRAILS_LIMIT}`,
    hiddenCount: unlimited
      ? 0
      : Math.max(0, currentSavedTrailCount - FREE_PLAN_SAVED_TRAILS_LIMIT),
    isLimitReached:
      !unlimited && currentSavedTrailCount >= FREE_PLAN_SAVED_TRAILS_LIMIT,
  };
}

export function getRideHistoryAccess(
  user: UserAccessProfile,
  currentRideCount: number
) {
  const unlimited = canAccessFeature(user, "ride_history_unlimited");

  const visibleLimit = unlimited
    ? currentRideCount
    : FREE_PLAN_RIDE_HISTORY_LIMIT;

  return {
    unlimited,
    accessLabel: getPublicPlanLabel(user),
    visibleLimit,
    rideHistoryLimitLabel: unlimited
      ? "Unlimited"
      : `${Math.min(
          currentRideCount,
          FREE_PLAN_RIDE_HISTORY_LIMIT
        )}/${FREE_PLAN_RIDE_HISTORY_LIMIT}`,
    hiddenCount: unlimited
      ? 0
      : Math.max(0, currentRideCount - FREE_PLAN_RIDE_HISTORY_LIMIT),
    isLimitReached:
      !unlimited && currentRideCount >= FREE_PLAN_RIDE_HISTORY_LIMIT,
  };
}

export function getCompletedTrailsAccess(
  user: UserAccessProfile,
  currentCompletedTrailCount: number
) {
  const unlimited = canAccessFeature(user, "completed_trails_unlimited");

  const visibleLimit = unlimited
    ? currentCompletedTrailCount
    : FREE_PLAN_COMPLETED_TRAILS_LIMIT;

  return {
    unlimited,
    accessLabel: getPublicPlanLabel(user),
    visibleLimit,
    completedTrailLimitLabel: unlimited
      ? "Unlimited"
      : `${Math.min(
          currentCompletedTrailCount,
          FREE_PLAN_COMPLETED_TRAILS_LIMIT
        )}/${FREE_PLAN_COMPLETED_TRAILS_LIMIT}`,
    hiddenCount: unlimited
      ? 0
      : Math.max(
          0,
          currentCompletedTrailCount - FREE_PLAN_COMPLETED_TRAILS_LIMIT
        ),
    isLimitReached:
      !unlimited &&
      currentCompletedTrailCount >= FREE_PLAN_COMPLETED_TRAILS_LIMIT,
  };
}

export function getFeatureUpgradeContent(feature: FeatureKey) {
  if (feature === "trail_discovery_unlimited") {
    return {
      title: "Pro Plan required",
      message:
        "Free users can view up to 5 trails in their selected area. Subscribe to the Pro Plan to view unlimited trails.",
      ctaLabel: "Subscribe Now",
    };
  }

  if (feature === "garage_unlimited_vehicles") {
    return {
      title: "Pro Plan required",
      message:
        "Free users can add up to 2 vehicles. Subscribe to the Pro Plan to add unlimited vehicles.",
      ctaLabel: "Subscribe Now",
    };
  }

  if (feature === "premium_trails") {
    return {
      title: "Pro Plan required",
      message:
        "Subscribe to the Pro Plan to unlock full trail details, route insights, and advanced trail information.",
      ctaLabel: "Subscribe Now",
    };
  }

  if (feature === "offline_maps") {
    return {
      title: "Pro Plan required",
      message:
        "Subscribe to the Pro Plan to download and use trails when signal drops.",
      ctaLabel: "Subscribe Now",
    };
  }

  if (feature === "advanced_analytics") {
    return {
      title: "Pro Plan required",
      message:
        "Subscribe to the Pro Plan to unlock progress charts, riding trends, and long-term performance insights.",
      ctaLabel: "Subscribe Now",
    };
  }

  if (feature === "gpx_exports") {
    return {
      title: "Pro Plan required",
      message:
        "Subscribe to the Pro Plan to export rides and trails for backup, sharing, and external GPS tools.",
      ctaLabel: "Subscribe Now",
    };
  }

  if (feature === "saved_trails_unlimited") {
    return {
      title: "Pro Plan required",
      message:
        "Free users can view up to 5 saved trails. Subscribe to the Pro Plan to unlock unlimited saved trails.",
      ctaLabel: "Subscribe Now",
    };
  }

  if (feature === "ride_history_unlimited") {
    return {
      title: "Pro Plan required",
      message:
        "Free users can view up to 5 recent rides. Subscribe to the Pro Plan to unlock unlimited ride history.",
      ctaLabel: "Subscribe Now",
    };
  }

  if (feature === "completed_trails_unlimited") {
    return {
      title: "Pro Plan required",
      message:
        "Free users can view up to 5 completed trails. Subscribe to the Pro Plan to unlock unlimited completed trails.",
      ctaLabel: "Subscribe Now",
    };
  }

  if (feature === "friends_groups") {
    return {
      title: "Pro Plan required",
      message:
        "Subscribe to the Pro Plan to create and manage advanced riding groups, shared rides, and group planning tools.",
      ctaLabel: "Subscribe Now",
    };
  }

  if (feature === "admin_area") {
    return {
      title: "Access required",
      message: "You do not have permission to access this area.",
      ctaLabel: "Back to Profile",
    };
  }

  return {
    title: "Pro Plan required",
    message:
      "Subscribe to the Pro Plan to unlock this feature and get full access to XTrail.",
    ctaLabel: "Subscribe Now",
  };
}

export function getFeatureAccess(user: UserAccessProfile, feature: FeatureKey) {
  const allowed = canAccessFeature(user, feature);
  const upgradeContent = getFeatureUpgradeContent(feature);

  return {
    allowed,
    accessLabel: getPublicPlanLabel(user),
    ...upgradeContent,
  };
}