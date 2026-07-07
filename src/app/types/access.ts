export type AppRole = "global_admin" | "admin" | "contributor" | "user";

export type AppPlan = "free" | "paid";

export type SubscriptionStatus =
  | "none"
  | "trial"
  | "active"
  | "past_due"
  | "cancelled";

export type ContributorStatus =
  | "none"
  | "pending"
  | "active"
  | "warning"
  | "suspended"
  | "revoked";

export type UserAccountStatus = "active" | "suspended" | "disabled";

export type FeatureKey =
  | "garage_unlimited_vehicles"
  | "premium_trails"
  | "offline_maps"
  | "advanced_analytics"
  | "gpx_exports"
  | "admin_area"
  | "user_management"
  | "trail_review"
  | "manual_access_management";

export interface UserAccessProfile {
  id: string;
  email: string;
  displayName: string;

  role: AppRole;
  plan: AppPlan;
  subscriptionStatus: SubscriptionStatus;
  accountStatus: UserAccountStatus;

  manualFullAccess: boolean;
  manualFullAccessReason?: string;
  manualFullAccessGrantedBy?: string;
  manualFullAccessGrantedAt?: string;

  contributorStatus: ContributorStatus;
  contributorAccessActive: boolean;
  contributorTrailsRequiredPerMonth: number;
  contributorTrailsSubmittedThisMonth: number;
  contributorTrailsApprovedThisMonth: number;

  trustLevel: number;

    twoFactorEnabled: boolean;
  twoFactorRequired: boolean;

  twoFactorRequiredOnFirstLogin: boolean;
  twoFactorRequiredForNewDevice: boolean;
  twoFactorRequiredForSensitiveActions: boolean;

  trustedDeviceIds: string[];
  lastTwoFactorVerifiedAt?: string;

  createdAt: string;
  updatedAt: string;
}