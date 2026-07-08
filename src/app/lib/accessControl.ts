import type { FeatureKey, UserAccessProfile } from "../types/access";

export const FREE_PLAN_VEHICLE_LIMIT = 2;
export const FREE_PLAN_TRAIL_VIEW_LIMIT = 5;

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
    accessLabel: getAccessLabel(user),
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

export function getFeatureUpgradeContent(feature: FeatureKey) {
  if (feature === "trail_discovery_unlimited") {
    return {
      title: "Unlock more trails in your area",
      message:
        "Free users can view up to 5 trails in their selected area. Upgrade to see unlimited trails, premium routes, and advanced trail details.",
      ctaLabel: "Upgrade Trails",
    };
  }

  if (feature === "garage_unlimited_vehicles") {
    return {
      title: "Unlock unlimited Garage",
      message:
        "Free users can add up to 2 vehicles. Upgrade to add unlimited vehicles, setup tracking, and full garage insights.",
      ctaLabel: "Upgrade Garage",
    };
  }

  if (feature === "premium_trails") {
    return {
      title: "Unlock premium trails",
      message:
        "Free users can preview trails. Upgrade to view full premium trail details, route insights, and advanced trail information.",
      ctaLabel: "Upgrade Trails",
    };
  }

  if (feature === "offline_maps") {
    return {
      title: "Unlock offline maps",
      message:
        "Offline maps are a premium feature built for riders who need access when signal drops.",
      ctaLabel: "Upgrade Maps",
    };
  }

  if (feature === "advanced_analytics") {
    return {
      title: "Unlock advanced analytics",
      message:
        "Free users get basic ride tracking. Upgrade to see advanced progress charts, trends, riding history, and performance insights.",
      ctaLabel: "Upgrade Analytics",
    };
  }

  if (feature === "gpx_exports") {
    return {
      title: "Unlock GPX exports",
      message:
        "Upgrade to export your rides and trails for backup, sharing, and external GPS tools.",
      ctaLabel: "Upgrade Exports",
    };
  }

  if (feature === "saved_trails_unlimited") {
    return {
      title: "Unlock unlimited saved trails",
      message:
        "Free users can save a limited number of trails. Upgrade to build a full trail library.",
      ctaLabel: "Upgrade Saved Trails",
    };
  }

  if (feature === "ride_history_unlimited") {
    return {
      title: "Unlock full ride history",
      message:
        "Free users can view limited ride history. Upgrade to keep full access to all your rides and stats.",
      ctaLabel: "Upgrade History",
    };
  }

  if (feature === "completed_trails_unlimited") {
    return {
      title: "Unlock completed trail history",
      message:
        "Upgrade to keep a full record of completed trails and long-term progress.",
      ctaLabel: "Upgrade Progress",
    };
  }

  if (feature === "friends_groups") {
    return {
      title: "Unlock advanced groups",
      message:
        "Upgrade to create and manage advanced riding groups, shared rides, and community planning tools.",
      ctaLabel: "Upgrade Groups",
    };
  }

  if (feature === "admin_area") {
    return {
      title: "Admin access required",
      message:
        "Only the Global Admin / Owner and Admin users can access this area.",
      ctaLabel: "Back to Profile",
    };
  }

  return {
    title: "Premium feature",
    message:
      "Upgrade to unlock this feature and get full access to XTrail.",
    ctaLabel: "Upgrade",
  };
}

export function getFeatureAccess(user: UserAccessProfile, feature: FeatureKey) {
  const allowed = canAccessFeature(user, feature);
  const upgradeContent = getFeatureUpgradeContent(feature);

  return {
    allowed,
    accessLabel: getAccessLabel(user),
    ...upgradeContent,
  };
}