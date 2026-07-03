import {
  createContext,
  useContext,
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
  UserAccessProfile,
} from "../types/access";

interface UserAccessContextValue {
  currentUserAccess: UserAccessProfile;
  users: UserAccessProfile[];

  updateCurrentUserAccess: (updates: Partial<UserAccessProfile>) => void;
  updateUserAccess: (
    userId: string,
    updates: Partial<UserAccessProfile>
  ) => void;

  setUserRole: (userId: string, role: AppRole) => void;
  setUserPlan: (userId: string, plan: AppPlan) => void;

  grantManualFullAccess: (userId: string, reason?: string) => void;
  removeManualFullAccess: (userId: string) => void;
}

const now = new Date().toISOString();

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

  createdAt: now,
  updatedAt: now,
};

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

  createdAt: now,
  updatedAt: now,
};

const UserAccessContext = createContext<UserAccessContextValue | undefined>(
  undefined
);

export function UserAccessProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserAccessProfile[]>([
    ownerAccessProfile,
    demoFreeUser,
  ]);

  const [currentUserId] = useState(ownerAccessProfile.id);

  const currentUserAccess =
    users.find((user) => user.id === currentUserId) ?? ownerAccessProfile;

  const updateUserAccess = (
    userId: string,
    updates: Partial<UserAccessProfile>
  ) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : user
      )
    );
  };

  const value = useMemo<UserAccessContextValue>(
    () => ({
      currentUserAccess,
      users,

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
        updateUserAccess(userId, {
          plan,
          subscriptionStatus: plan === "paid" ? "active" : "none",
        });
      },

      grantManualFullAccess: (userId, reason = "") => {
        if (!canGrantManualAccess(currentUserAccess)) {
          throw new Error("You do not have permission to grant full access.");
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

        if (userId === ownerAccessProfile.id) {
          throw new Error("Owner access cannot be removed.");
        }

        updateUserAccess(userId, {
          manualFullAccess: false,
          manualFullAccessReason: "",
          manualFullAccessGrantedBy: "",
          manualFullAccessGrantedAt: "",
        });
      },
    }),
    [currentUserAccess, users]
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