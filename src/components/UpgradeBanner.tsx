import React from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { UserPlan, FEATURE_LABELS, getRequiredPlan } from '../lib/planAccess';

interface UpgradeBannerProps {
  plan?: UserPlan;
  feature?: string;
  onUpgradeClick?: () => void;
  message?: string;
}

export const UpgradeBanner: React.FC<UpgradeBannerProps> = ({
  plan,
  feature,
  onUpgradeClick,
  message
}) => {
  const requiredPlan = getRequiredPlan(feature, plan);
  const label = feature ? (FEATURE_LABELS[feature] || feature) : 'cette fonctionnalité';

  return (
    <div className="p-4 bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-purple-500/10 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/30">
          <Lock className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {message || `Fonctionnalité réservée (${requiredPlan.toUpperCase()})`}
            </span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 border border-amber-500/30">
              <Sparkles className="w-2.5 h-2.5 inline mr-1" />
              {requiredPlan.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            {label} nécessite un abonnement supérieur.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onUpgradeClick}
        className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
      >
        <span>Mettre à niveau</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default UpgradeBanner;
