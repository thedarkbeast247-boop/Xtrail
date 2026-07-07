import type { ReactNode } from "react";

import { useUserAccess } from "../../context/UserAccessContext";
import { getFeatureAccess } from "../../lib/accessControl";
import type { FeatureKey } from "../../types/access";
import { LockedFeatureCard } from "./LockedFeatureCard";

interface AccessGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  fallbackCtaLabel?: string;
  compact?: boolean;
}

export function AccessGate({
  feature,
  children,
  fallbackTitle,
  fallbackMessage,
  fallbackCtaLabel,
  compact = false,
}: AccessGateProps) {
  const { currentUserAccess } = useUserAccess();
  const featureAccess = getFeatureAccess(currentUserAccess, feature);

  if (featureAccess.allowed) {
    return <>{children}</>;
  }

  return (
    <LockedFeatureCard
      title={fallbackTitle ?? featureAccess.title}
      message={fallbackMessage ?? featureAccess.message}
      ctaLabel={fallbackCtaLabel ?? featureAccess.ctaLabel}
      compact={compact}
    />
  );
}