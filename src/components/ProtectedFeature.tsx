import React from 'react';
import { useAuth } from '../context/AuthContext';
import { checkFeatureAccess, UserPlan, FeatureKey } from '../lib/planAccess';
import UpgradePrompt from './UpgradePrompt';

export interface ProtectedFeatureProps {
  plan?: UserPlan;
  feature?: FeatureKey | string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onUpgradeClick?: () => void;
  compact?: boolean;
}

export const ProtectedFeature: React.FC<ProtectedFeatureProps> = ({
  plan,
  feature,
  children,
  fallback,
  onUpgradeClick,
  compact = false
}) => {
  const { user, userPlan } = useAuth();

  // Use current user's plan from AuthContext or fallback to 'free'
  const activePlan: UserPlan = user?.plan || userPlan || 'free';
  const canAccess = checkFeatureAccess(activePlan, feature, plan);

  if (!canAccess) {
    if (fallback !== undefined) {
      return <>{fallback}</>;
    }
    return (
      <UpgradePrompt 
        feature={feature} 
        plan={plan} 
        onUpgradeClick={onUpgradeClick}
        compact={compact}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedFeature;
