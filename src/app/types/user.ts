export type PlanType = "free" | "premium";

export interface User {
  id: string;
  name: string;
  email: string;

  profileImage?: string;
  joinedAt: string;

  plan: PlanType;
}