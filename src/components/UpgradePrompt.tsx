import React from 'react';
import { Lock, Sparkles, Zap, ArrowRight } from 'lucide-react';
import { UserPlan, FEATURE_LABELS, getRequiredPlan } from '../lib/planAccess';

interface UpgradePromptProps {
  feature?: string;
  plan?: UserPlan;
  title?: string;
  description?: string;
  onUpgradeClick?: () => void;
  compact?: boolean;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  plan,
  title,
  description,
  onUpgradeClick,
  compact = false
}) => {
  const requiredPlan = getRequiredPlan(feature, plan);
  const featureLabel = feature ? (FEATURE_LABELS[feature] || feature) : 'cette fonctionnalité avancée';

  const planBadgeText = requiredPlan === 'pro' ? 'Plan Pro Requis 🚀' : 'Plan Start Requis 🔥';
  const planColorClass = requiredPlan === 'pro' 
    ? 'bg-purple-100 text-purple-700 border-purple-200'
    : 'bg-amber-100 text-amber-700 border-amber-200';

  if (compact) {
    return (
      <div className="p-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl text-white flex items-center justify-between gap-3 shadow-sm border border-slate-700">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-100 truncate">
              {featureLabel}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              Débloquez l’accès avec le plan <span className="uppercase font-semibold text-amber-400">{requiredPlan}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onUpgradeClick}
          className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
        >
          <span>Débloquer</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-xl border border-slate-800 text-center relative overflow-hidden my-4">
      {/* Background ambient glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30 shadow-inner">
          <Lock className="w-6 h-6" />
        </div>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border mb-3 ${planColorClass}`}>
          <Sparkles className="w-3 h-3" />
          {planBadgeText}
        </span>

        <h3 className="text-lg font-bold text-white mb-2">
          {title || `Accès réservé au plan ${requiredPlan.toUpperCase()}`}
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          {description || `La fonctionnalité "${featureLabel}" n’est pas disponible sur le plan gratuit. Passez au plan ${requiredPlan.toUpperCase()} pour débloquer cet outil et accélérer votre gestion.`}
        </p>

        <button
          onClick={onUpgradeClick}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-current text-amber-300" />
          <span>Passer au plan {requiredPlan.toUpperCase()}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default UpgradePrompt;
