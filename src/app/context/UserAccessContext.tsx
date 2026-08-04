import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  canGrantManualAccess,
  canManageRoles,
  canRemoveManualAccess,
} from "../lib/accessControl";

import type {
  AppPlan,
  AppRole,
  FreePlanSelections,
  ProAccessEndedReason,
  UserAccessProfile,
} from "../types/access";

interface UserAccessContextValue {
  currentUserId: string;
  currentUserAccess: UserAccessProfile;
  users: UserAccessProfile[];

  switchCurrentUser: (userId: string) => void;

  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => void;
  signOut: () => void;

  updateCurrentUserAccess: (updates: Partial<UserAccessProfile>) => void;
  updateUserAccess: (
    userId: string,
    updates: Partial<UserAccessProfile>
  ) => void;

  setUserRole: (userId: string, role: AppRole) => void;
  setUserPlan: (userId: string, plan: AppPlan) => void;

  grantManualFullAccess: (userId: string, reason?: string) => void;
  removeManualFullAccess: (userId: string) => void;

  markProAccessEnded: (
    userId: string,
    reason: ProAccessEndedReason
  ) => void;

  reviewFreePlanSelections: (
    userId: string,
    selections: FreePlanSelections
  ) => void;

  clearProAccessReview: (userId: string) => void;
}

const now = new Date().toISOString();

function getDateAfterDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function getEmptyFreePlanSelections(): FreePlanSelections {
  return {
    vehicleIds: [],
    savedTrailIds: [],
    rideIds: [],
    completedTrailIds: [],
  };
}

function getDefaultProAccessState() {
  return {
    proAccessEndedReason: null,
    proAccessEndedAt: null,
    proAccessDataDeleteAfter: null,
    proAccessReviewStatus: "not_required" as const,
    proAccessReviewedAt: null,
    freePlanSelections: getEmptyFreePlanSelections(),
  };
}

function withProAccessDefaults(user: UserAccessProfile): UserAccessProfile {
  return {
    ...user,
    proAccessEndedReason: user.proAccessEndedReason ?? null,
    proAccessEndedAt: user.proAccessEndedAt ?? null,
    proAccessDataDeleteAfter: user.proAccessDataDeleteAfter ?? null,
    proAccessReviewStatus: user.proAccessReviewStatus ?? "not_required",
    proAccessReviewedAt: user.proAccessReviewedAt ?? null,
    freePlanSelections: {
      vehicleIds: user.freePlanSelections?.vehicleIds ?? [],
      savedTrailIds: user.freePlanSelections?.savedTrailIds ?? [],
      rideIds: user.freePlanSelections?.rideIds ?? [],
      completedTrailIds: user.freePlanSelections?.completedTrailIds ?? [],
    },
  };
}

const ownerAccessProfile: UserAccessProfile = {
  id: "owner-rudie-maartens",
  email: "rudie@xtrail.app",
  displayName: "Rudie Maartens",

  role: "global_admin",
  plan: "free",
  subscriptionStatus: "none",
  accountStatus: "active",

  manualFullAccess: false,
  manualFullAccessReason: "",

  contributorStatus: "none",
  contributorAccessActive: false,
  contributorTrailsRequiredPerMonth: 3,
  contributorTrailsSubmittedThisMonth: 0,
  contributorTrailsApprovedThisMonth: 0,

  trustLevel: 4,

  twoFactorEnabled: true,
  twoFactorRequired: true,

  twoFactorRequiredOnFirstLogin: true,
  twoFactorRequiredForNewDevice: true,
  twoFactorRequiredForSensitiveActions: true,

  trustedDeviceIds: [],
  lastTwoFactorVerifiedAt: "",

  createdAt: now,
  updatedAt: now,

  ...getDefaultProAccessState(),
};



const OWNER_USER_ID = ownerAccessProfile.id;

const OWNER_PROTECTED_FIELDS: (keyof UserAccessProfile)[] = [
  "id",
  "email",
  "displayName",
  "role",
  "plan",
  "subscriptionStatus",
  "accountStatus",
  "manualFullAccess",
  "manualFullAccessReason",
  "manualFullAccessGrantedBy",
  "manualFullAccessGrantedAt",
  "contributorStatus",
  "contributorAccessActive",
  "trustLevel",
  "twoFactorRequired",
  "twoFactorRequiredOnFirstLogin",
  "twoFactorRequiredForNewDevice",
  "twoFactorRequiredForSensitiveActions",
];

function isOwnerUser(userId: string) {
  return userId === OWNER_USER_ID;
}

function hasProtectedOwnerUpdate(updates: Partial<UserAccessProfile>) {
  return OWNER_PROTECTED_FIELDS.some((field) => field in updates);
}

function lockOwnerProfile(user: UserAccessProfile): UserAccessProfile {
  return {
    ...user,

    id: ownerAccessProfile.id,
    email: ownerAccessProfile.email,
    displayName: ownerAccessProfile.displayName,

    role: "global_admin",
    plan: "free",
    subscriptionStatus: "none",
    accountStatus: "active",

    manualFullAccess: false,
    manualFullAccessReason: "",
    manualFullAccessGrantedBy: "",
    manualFullAccessGrantedAt: "",

    contributorStatus: "none",
    contributorAccessActive: false,

    trustLevel: 4,

    twoFactorEnabled: true,
    twoFactorRequired: true,
    twoFactorRequiredOnFirstLogin: true,
    twoFactorRequiredForNewDevice: true,
    twoFactorRequiredForSensitiveActions: true,
    trustedDeviceIds: user.trustedDeviceIds ?? [],
    lastTwoFactorVerifiedAt: user.lastTwoFactorVerifiedAt ?? "",

    ...getDefaultProAccessState(),
  };
}

const demoFreeUser: UserAccessProfile = {
  id: "demo-free-user",
  email: "freeuser@xtrail.app",
  displayName: "Free User",

  role: "user",
  plan: "free",
  subscriptionStatus: "none",
  accountStatus: "active",

  manualFullAccess: false,
  manualFullAccessReason: "",

  contributorStatus: "none",
  contributorAccessActive: false,
  contributorTrailsRequiredPerMonth: 3,
  contributorTrailsSubmittedThisMonth: 0,
  contributorTrailsApprovedThisMonth: 0,

  trustLevel: 0,

  twoFactorEnabled: false,
  twoFactorRequired: false,

  twoFactorRequiredOnFirstLogin: false,
  twoFactorRequiredForNewDevice: false,
  twoFactorRequiredForSensitiveActions: false,

  trustedDeviceIds: [],
  lastTwoFactorVerifiedAt: "",

  createdAt: now,
  updatedAt: now,

  ...getDefaultProAccessState(),
};

const demoPaidUser: UserAccessProfile = {
  id: "demo-paid-user",
  email: "paiduser@xtrail.app",
  displayName: "Paid User",

  role: "user",
  plan: "paid",
  subscriptionStatus: "active",
  accountStatus: "active",

  manualFullAccess: false,
  manualFullAccessReason: "",

  contributorStatus: "none",
  contributorAccessActive: false,
  contributorTrailsRequiredPerMonth: 3,
  contributorTrailsSubmittedThisMonth: 0,
  contributorTrailsApprovedThisMonth: 0,

  trustLevel: 1,

  twoFactorEnabled: false,
  twoFactorRequired: false,

  twoFactorRequiredOnFirstLogin: false,
  twoFactorRequiredForNewDevice: false,
  twoFactorRequiredForSensitiveActions: false,

  trustedDeviceIds: [],
  lastTwoFactorVerifiedAt: "",

  createdAt: now,
  updatedAt: now,

  ...getDefaultProAccessState(),
};

const demoContributorUser: UserAccessProfile = {
  id: "demo-contributor-user",
  email: "contributor@xtrail.app",
  displayName: "Contributor User",

  role: "contributor",
  plan: "free",
  subscriptionStatus: "none",
  accountStatus: "active",

  manualFullAccess: false,
  manualFullAccessReason: "",

  contributorStatus: "active",
  contributorAccessActive: true,
  contributorTrailsRequiredPerMonth: 3,
  contributorTrailsSubmittedThisMonth: 3,
  contributorTrailsApprovedThisMonth: 3,

  trustLevel: 2,

  twoFactorEnabled: false,
  twoFactorRequired: false,

  twoFactorRequiredOnFirstLogin: false,
  twoFactorRequiredForNewDevice: false,
  twoFactorRequiredForSensitiveActions: true,

  trustedDeviceIds: [],
  lastTwoFactorVerifiedAt: "",

  createdAt: now,
  updatedAt: now,

  ...getDefaultProAccessState(),
};

const demoAdminUser: UserAccessProfile = {
  id: "demo-admin-user",
  email: "admin@xtrail.app",
  displayName: "Admin User",

  role: "admin",
  plan: "free",
  subscriptionStatus: "none",
  accountStatus: "active",

  manualFullAccess: false,
  manualFullAccessReason: "",

  contributorStatus: "none",
  contributorAccessActive: false,
  contributorTrailsRequiredPerMonth: 3,
  contributorTrailsSubmittedThisMonth: 0,
  contributorTrailsApprovedThisMonth: 0,

  trustLevel: 3,

  twoFactorEnabled: true,
  twoFactorRequired: true,

  twoFactorRequiredOnFirstLogin: true,
  twoFactorRequiredForNewDevice: true,
  twoFactorRequiredForSensitiveActions: true,

  trustedDeviceIds: [],
  lastTwoFactorVerifiedAt: "",

  createdAt: now,
  updatedAt: now,

  ...getDefaultProAccessState(),
};

const defaultAccessProfiles = [
  ownerAccessProfile,
  demoFreeUser,
  demoPaidUser,
  demoContributorUser,
  demoAdminUser,
];

const USER_ACCESS_STORAGE_KEY = "xtrail-user-access-profiles";
const CURRENT_USER_STORAGE_KEY = "xtrail-current-user-id";
const AUTH_STORAGE_KEY = "xtrail-authenticated";

function getInitialUserAccessProfiles() {
  if (typeof window === "undefined") {
    return defaultAccessProfiles.map(withProAccessDefaults);
  }

  const storedProfiles = window.localStorage.getItem(USER_ACCESS_STORAGE_KEY);

  if (!storedProfiles) {
    return defaultAccessProfiles.map(withProAccessDefaults);
  }

  try {
    const parsedProfiles = JSON.parse(storedProfiles) as UserAccessProfile[];

    const storedOwner = parsedProfiles.find(
      (user) => user.id === ownerAccessProfile.id
    );

    const lockedOwnerProfile: UserAccessProfile = {
      ...ownerAccessProfile,
      ...storedOwner,
      id: ownerAccessProfile.id,
      email: ownerAccessProfile.email,
      displayName: ownerAccessProfile.displayName,
      role: "global_admin",
      accountStatus: "active",

      twoFactorEnabled: true,
      twoFactorRequired: true,
      twoFactorRequiredOnFirstLogin: true,
      twoFactorRequiredForNewDevice: true,
      twoFactorRequiredForSensitiveActions: true,

      trustedDeviceIds: storedOwner?.trustedDeviceIds ?? [],
      lastTwoFactorVerifiedAt: storedOwner?.lastTwoFactorVerifiedAt ?? "",

      updatedAt: new Date().toISOString(),
    };

      const otherProfiles = parsedProfiles
      .filter((user) => user.id !== ownerAccessProfile.id)
      .map((user) => {
        const normalizedUser = withProAccessDefaults(user);

        return {
          ...normalizedUser,
          twoFactorRequiredOnFirstLogin:
            normalizedUser.twoFactorRequiredOnFirstLogin ?? false,
          twoFactorRequiredForNewDevice:
            normalizedUser.twoFactorRequiredForNewDevice ?? false,
          twoFactorRequiredForSensitiveActions:
            normalizedUser.twoFactorRequiredForSensitiveActions ?? false,
          trustedDeviceIds: normalizedUser.trustedDeviceIds ?? [],
          lastTwoFactorVerifiedAt: normalizedUser.lastTwoFactorVerifiedAt ?? "",
        };
      });

    const missingDefaultProfiles = defaultAccessProfiles.filter((defaultUser) => {
      if (defaultUser.id === ownerAccessProfile.id) return false;

      return !otherProfiles.some((user) => user.id === defaultUser.id);
    });

    return [
      lockedOwnerProfile,
      ...otherProfiles,
      ...missingDefaultProfiles.map(withProAccessDefaults),
    ];
  } catch (error) {
    console.error("Failed to load user access profiles:", error);
    return defaultAccessProfiles.map(withProAccessDefaults);
  }
}

function getInitialCurrentUserId(users: UserAccessProfile[]) {
  if (typeof window === "undefined") {
    return ownerAccessProfile.id;
  }

  const storedUserId = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY);

  if (storedUserId && users.some((user) => user.id === storedUserId)) {
    return storedUserId;
  }

  return ownerAccessProfile.id;
}

const UserAccessContext = createContext<UserAccessContextValue | undefined>(
  undefined
);

export function UserAccessProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserAccessProfile[]>(
    getInitialUserAccessProfiles
  );

  const [currentUserId, setCurrentUserId] = useState(() =>
    getInitialCurrentUserId(users)
  );

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return true;

    return window.localStorage.getItem(AUTH_STORAGE_KEY) !== "false";
  });

  useEffect(() => {
    window.localStorage.setItem(USER_ACCESS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    window.localStorage.setItem(
      AUTH_STORAGE_KEY,
      isAuthenticated ? "true" : "false"
    );
  }, [isAuthenticated]);

  const currentUserAccess =
    users.find((user) => user.id === currentUserId) ?? ownerAccessProfile;

  const updateUserAccess = (
    userId: string,
    updates: Partial<UserAccessProfile>
  ) => {
    if (isOwnerUser(userId) && hasProtectedOwnerUpdate(updates)) {
      throw new Error(
        "The Global Admin / Owner account is protected and cannot be changed."
      );
    }

    setUsers((prev) =>
      prev.map((user) => {
        if (user.id !== userId) return user;

        const updatedUser = {
          ...user,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        if (isOwnerUser(userId)) {
          return lockOwnerProfile(updatedUser);
        }

        return updatedUser;
      })
    );
  };

    const markProAccessEnded = (
    userId: string,
    reason: ProAccessEndedReason
  ) => {
    if (isOwnerUser(userId)) {
      throw new Error("The Global Admin / Owner plan cannot be downgraded.");
    }

    updateUserAccess(userId, {
      plan: "free",
      subscriptionStatus:
        reason === "subscription_cancelled" ? "cancelled" : "past_due",
      proAccessEndedReason: reason,
      proAccessEndedAt: new Date().toISOString(),
      proAccessDataDeleteAfter: getDateAfterDays(90),
      proAccessReviewStatus: "needs_review",
      proAccessReviewedAt: null,
    });
  };

  const reviewFreePlanSelections = (
    userId: string,
    selections: FreePlanSelections
  ) => {
    const user = users.find((item) => item.id === userId);

    if (!user) {
      throw new Error("User does not exist.");
    }

    if (user.proAccessReviewStatus !== "needs_review") {
      if (
        user.proAccessReviewStatus === "reviewed" ||
        user.proAccessReviewedAt
      ) {
        throw new Error(
          "Your Free Plan selections are already locked. Subscribe to the Pro Plan to unlock all of your items."
        );
      }

      throw new Error(
        "Plan Review is not currently available for this account."
      );
    }

    updateUserAccess(userId, {
      freePlanSelections: selections,
      proAccessReviewStatus: "reviewed",
      proAccessReviewedAt: new Date().toISOString(),
    });
  };

  const clearProAccessReview = (userId: string) => {
    updateUserAccess(userId, {
      ...getDefaultProAccessState(),
      plan: "paid",
      subscriptionStatus: "active",
    });
  };

  const value = useMemo<UserAccessContextValue>(
    () => ({
      currentUserId,
      currentUserAccess,
      users,

      switchCurrentUser: (userId) => {
        const userExists = users.some((user) => user.id === userId);

        if (!userExists) {
          throw new Error("User does not exist.");
        }

        setCurrentUserId(userId);
      },

      isAuthenticated,

      signInWithEmail: (email, password) => {
        if (!email.trim()) {
          throw new Error("Email is required.");
        }

        if (!password.trim()) {
          throw new Error("Password is required.");
        }

        const matchedUser = users.find(
          (user) => user.email.toLowerCase() === email.trim().toLowerCase()
        );

        if (!matchedUser) {
          throw new Error("No user found with that email.");
        }

        if (matchedUser.accountStatus !== "active") {
          throw new Error("This account is not active.");
        }

        setCurrentUserId(matchedUser.id);
        setIsAuthenticated(true);
      },

      signOut: () => {
        setIsAuthenticated(false);
      },

      updateCurrentUserAccess: (updates) => {
        updateUserAccess(currentUserAccess.id, updates);
      },

      updateUserAccess,

      setUserRole: (userId, role) => {
        if (!canManageRoles(currentUserAccess)) {
          throw new Error("Only the Global Admin / Owner can manage roles.");
        }

        if (userId === ownerAccessProfile.id && role !== "global_admin") {
          throw new Error("The owner account cannot be downgraded.");
        }

        updateUserAccess(userId, { role });
      },

        setUserPlan: (userId, plan) => {
        if (isOwnerUser(userId)) {
          throw new Error("The Global Admin / Owner plan cannot be changed.");
        }

        if (plan === "paid") {
          updateUserAccess(userId, {
            ...getDefaultProAccessState(),
            plan: "paid",
            subscriptionStatus: "active",
          });

          return;
        }

        markProAccessEnded(userId, "manual_downgrade");
      },

      grantManualFullAccess: (userId, reason = "") => {
        if (!canGrantManualAccess(currentUserAccess)) {
          throw new Error("You do not have permission to grant full access.");
        }

        if (isOwnerUser(userId)) {
          throw new Error(
            "The Global Admin / Owner already has protected full access."
          );
        }

        updateUserAccess(userId, {
          manualFullAccess: true,
          manualFullAccessReason: reason,
          manualFullAccessGrantedBy: currentUserAccess.id,
          manualFullAccessGrantedAt: new Date().toISOString(),
        });
      },

      removeManualFullAccess: (userId) => {
        if (!canRemoveManualAccess(currentUserAccess)) {
          throw new Error("You do not have permission to remove full access.");
        }

        if (isOwnerUser(userId)) {
          throw new Error("Owner access cannot be removed.");
        }

        updateUserAccess(userId, {
          manualFullAccess: false,
          manualFullAccessReason: "",
          manualFullAccessGrantedBy: "",
          manualFullAccessGrantedAt: "",
        });
      },
      markProAccessEnded,
      reviewFreePlanSelections,
      clearProAccessReview,
    }),
    [currentUserId, currentUserAccess, users, isAuthenticated]
  );

  return (
    <UserAccessContext.Provider value={value}>
      {children}
    </UserAccessContext.Provider>
  );
}

export function useUserAccess() {
  const context = useContext(UserAccessContext);

  if (!context) {
    throw new Error("useUserAccess must be used inside UserAccessProvider");
  }

  return context;
}