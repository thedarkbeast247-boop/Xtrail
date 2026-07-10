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

export type ProAccessEndedReason =
  | "payment_missed"
  | "payment_failed"
  | "subscription_cancelled"
  | "subscription_expired"
  | "trial_ended"
  | "refund_processed"
  | "chargeback_disputed"
  | "subscription_paused"
  | "manual_downgrade"
  | "account_suspended";

export type ProAccessReviewStatus =
  | "not_required"
  | "needs_review"
  | "reviewed"
  | "retention_warning"
  | "retention_expired";

export interface FreePlanSelections {
  vehicleIds: string[];
  savedTrailIds: string[];
  rideIds: string[];
  completedTrailIds: string[];
}

export type FeatureKey =
  | "garage_unlimited_vehicles"
  | "premium_trails"
  | "offline_maps"
  | "advanced_analytics"
  | "gpx_exports"
  | "saved_trails_unlimited"
  | "ride_history_unlimited"
  | "completed_trails_unlimited"
  | "friends_groups"
  | "admin_area"
  | "user_management"
  | "trail_review"
  | "manual_access_management"
  | "trail_discovery_unlimited";

export interface UserAccessProfile {
  id: string;
  email: string;
  displayName: string;

  role: AppRole;
  plan: AppPlan;
  subscriptionStatus: SubscriptionStatus;
  accountStatus: UserAccountStatus;

  proAccessEndedReason: ProAccessEndedReason | null;
  proAccessEndedAt: string | null;
  proAccessDataDeleteAfter: string | null;
  proAccessReviewStatus: ProAccessReviewStatus;
  proAccessReviewedAt: string | null;
  freePlanSelections: FreePlanSelections;

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