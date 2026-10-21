import React, { useState, useEffect } from 'react';
import {
  AdminModuleId,
  AdminProfile,
  AdminBusiness,
  Founding100Candidate,
  StrategicObjective,
  FeatureFlagItem,
  AiSupervisionState,
  AdminSupportTicket,
  PlatformGeneralConfig,
  AdminUserAccount,
} from './admin/adminTypes';
import {
  loadAdminStore,
  saveAdminStore,
  AdminStoreState,
  INITIAL_RBAC_MATRIX,
} from './admin/adminStore';
import { AdminSidebar } from './admin/AdminSidebar';
import { AdminHeader } from './admin/AdminHeader';
import { AdminProfileModal } from './admin/AdminProfileModal';
import { CeoDashboardView } from './admin/modules/CeoDashboardView';
import { Founding100View } from './admin/modules/Founding100View';
import { StrategicSteeringView } from './admin/modules/StrategicSteeringView';
import { BusinessesModule } from './admin/modules/BusinessesModule';
import { RbacPermissionsView } from './admin/modules/RbacPermissionsView';
import { ComprehensiveModulesView } from './admin/modules/ComprehensiveModulesView';
import { ScreenId, Invoice } from '../types';
import { useAuth } from '../context/AuthContext';
import { isSuperAdminEmail, SUPER_ADMIN_EMAIL } from '../lib/authSecurity';
import {
  getStripeConfig,
  verifyStripeAccessPolicies,
  updateStripeAdminKeys,
  StripeConfigResponse,
  StripePolicyVerificationResult,
} from '../lib/stripeService';
import {
  KeyRound,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AdminDashboardProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast: (msg: string) => void;
  invoices?: Invoice[];
}

export default function AdminDashboard({
  setScreen,
  triggerToast,
  invoices = [],
}: AdminDashboardProps) {
  const { user: authUser, firebaseUser } = useAuth();
  const currentEmail = (authUser?.email || firebaseUser?.email || '').trim().toLowerCase();
  const isAuthorized = isSuperAdminEmail(currentEmail);

  // Active module in the 24 modules list
  const [activeModule, setActiveModule] = useState<AdminModuleId>('ceo_dashboard');

  // CEO Profile Modal visibility
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Central Store State
  const [store, setStore] = useState<AdminStoreState>(() => loadAdminStore());

  // Save to persistent localStorage on store changes
  useEffect(() => {
    saveAdminStore(store);
  }, [store]);

  // Stripe & Policy Verification states (Module 06: Paiements STARTBILL)
  const [stripeConfig, setStripeConfig] = useState<StripeConfigResponse | null>(null);
  const [policyAuditResult, setPolicyAuditResult] = useState<StripePolicyVerificationResult | null>(null);
  const [isAuditingPolicies, setIsAuditingPolicies] = useState<boolean>(false);
  const [showKeySecrets, setShowKeySecrets] = useState<boolean>(false);
  const [stripeKeyForm, setStripeKeyForm] = useState<{
    restrictedKey: string;
    publishableKey: string;
    webhookSecret: string;
  }>({
    restrictedKey: '',
    publishableKey: '',
    webhookSecret: '',
  });

  // Load Stripe configuration
  const fetchStripeStatus = async () => {
    try {
      const cfg = await getStripeConfig();
      setStripeConfig(cfg);
    } catch (e) {
      console.error('Failed to load Stripe config:', e);
    }
  };

  useEffect(() => {
    fetchStripeStatus();
  }, []);

  const handleAuditPolicies = async () => {
    setIsAuditingPolicies(true);
    try {
      const result = await verifyStripeAccessPolicies();
      setPolicyAuditResult(result);
      await fetchStripeStatus();
      if (result.accessPolicyCompliant) {
        triggerToast('Politiques d’accès Stripe validées à 100% avec succès.');
      } else {
        triggerToast('Vérification effectuée. Des permissions excessives ou manquantes ont été détectées.');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Erreur lors de l’audit des politiques d’accès.');
    } finally {
      setIsAuditingPolicies(false);
    }
  };

  const handleSaveStripeKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStripeAdminKeys(stripeKeyForm);
      triggerToast('Clés Stripe enregistrées. Audit automatique en cours...');
      await handleAuditPolicies();
    } catch (e: any) {
      triggerToast(e.message || 'Échec de l’enregistrement des clés Stripe.');
    }
  };

  // Updaters for modules
  const handleUpdateCandidate = (id: string, updates: Partial<Founding100Candidate>) => {
    setStore(prev => ({
      ...prev,
      foundingCandidates: prev.foundingCandidates.map(c => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const handleAddCandidate = (candidate: Founding100Candidate) => {
    setStore(prev => ({
      ...prev,
      foundingCandidates: [candidate, ...prev.foundingCandidates],
    }));
  };

  const handleUpdateObjective = (id: string, updates: Partial<StrategicObjective>) => {
    setStore(prev => ({
      ...prev,
      objectives: prev.objectives.map(o => (o.id === id ? { ...o, ...updates } : o)),
    }));
  };

  const handleAddObjective = (obj: StrategicObjective) => {
    setStore(prev => ({
      ...prev,
      objectives: [obj, ...prev.objectives],
    }));
  };

  const handleUpdateBusiness = (id: string, updates: Partial<AdminBusiness>) => {
    setStore(prev => ({
      ...prev,
      businesses: prev.businesses.map(b => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const handleUpdateUsers = (updatedUsers: AdminUserAccount[]) => {
    setStore(prev => ({ ...prev, users: updatedUsers }));
  };

  const handleUpdateFlags = (updatedFlags: FeatureFlagItem[]) => {
    setStore(prev => ({ ...prev, featureFlags: updatedFlags }));
  };

  const handleUpdateAi = (updatedAi: AiSupervisionState) => {
    setStore(prev => ({ ...prev, aiSupervision: updatedAi }));
  };

  const handleUpdateTickets = (updatedTickets: AdminSupportTicket[]) => {
    setStore(prev => ({ ...prev, tickets: updatedTickets }));
  };

  const handleUpdatePlatformConfig = (updatedCfg: PlatformGeneralConfig) => {
    setStore(prev => ({ ...prev, platformConfig: updatedCfg }));
  };

  const handleUpdateProfile = (updatedProfile: Partial<AdminProfile>) => {
    setStore(prev => ({
      ...prev,
      ceoProfile: { ...prev.ceoProfile, ...updatedProfile },
    }));
  };

  return (
    <div className="flex h-screen bg-[#070e1b] text-slate-100 font-sans overflow-hidden">
      {/* 24-Module Navigation Sidebar */}
      <AdminSidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onSwitchToClientApp={() => setScreen('dashboard')}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        ceoName={store.ceoProfile.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#070e1b]">
        {/* Top Header */}
        <AdminHeader
          activeModule={activeModule}
          ceoProfile={store.ceoProfile}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onSwitchToClientApp={() => setScreen('dashboard')}
          unreadAlertsCount={2}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Module 01: Tableau de bord CEO */}
          {activeModule === 'ceo_dashboard' && (
            <CeoDashboardView
              metrics={store.metrics}
              businesses={store.businesses}
              foundingCandidates={store.foundingCandidates}
              onNavigateToModule={setActiveModule}
              triggerToast={triggerToast}
            />
          )}

          {/* Module 02: Pilotage stratégique */}
          {activeModule === 'strategic_steering' && (
            <StrategicSteeringView
              objectives={store.objectives}
              onUpdateObjective={handleUpdateObjective}
              onAddObjective={handleAddObjective}
              triggerToast={triggerToast}
            />
          )}

          {/* Module 03: Entreprises */}
          {activeModule === 'businesses' && (
            <BusinessesModule
              businesses={store.businesses}
              onUpdateBusiness={handleUpdateBusiness}
              triggerToast={triggerToast}
            />
          )}

          {/* Module 06: Paiements STARTBILL & Stripe Restricted Keys Policies */}
          {activeModule === 'payments' && (
            <div className="space-y-6">
              <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    MODULE 06 • PAIEMENTS STARTBILL
                  </span>
                  <h2 className="text-xl font-black text-white mt-1">Encaissements & Passerelles Sécurisées</h2>
                  <p className="text-xs text-slate-300">
                    Gestion des abonnements STARTBILL. Intégration conforme aux politiques de clés restreintes Stripe et passerelles régionales.
                  </p>
                </div>
              </div>

              {/* Stripe Restricted Keys & Access Policies Card */}
              <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">
                        Contrôle des Politiques d'Accès Stripe (Restricted API Keys)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Protection stricte : principe du moindre privilège sans clé secrète globale (Secret Key)
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAuditPolicies}
                    disabled={isAuditingPolicies}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAuditingPolicies ? 'animate-spin' : ''}`} />
                    <span>Lancer l'audit de conformité</span>
                  </button>
                </div>

                {/* Audit Result Display */}
                {policyAuditResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      policyAuditResult.accessPolicyCompliant
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {policyAuditResult.accessPolicyCompliant ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Politique 100% Conforme aux Recommandations Stripe</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span>Audit : Des ajustements sont recommandés sur la clé restreinte</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300">{policyAuditResult.message}</p>
                  </div>
                )}

                {/* Form to update keys if needed */}
                <form onSubmit={handleSaveStripeKeys} className="space-y-3 text-xs pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Clé Restreinte (rk_live_... ou rk_test_...)
                      </label>
                      <input
                        type={showKeySecrets ? 'text' : 'password'}
                        value={stripeKeyForm.restrictedKey}
                        onChange={e => setStripeKeyForm({ ...stripeKeyForm, restrictedKey: e.target.value })}
                        placeholder="rk_live_51P..."
                        className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        Clé Publique (pk_live_... ou pk_test_...)
                      </label>
                      <input
                        type="text"
                        value={stripeKeyForm.publishableKey}
                        onChange={e => setStripeKeyForm({ ...stripeKeyForm, publishableKey: e.target.value })}
                        placeholder="pk_live_51P..."
                        className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setShowKeySecrets(!showKeySecrets)}
                      className="text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                    >
                      {showKeySecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showKeySecrets ? 'Masquer les clés' : 'Afficher les clés'}</span>
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md"
                    >
                      Sauvegarder et auditer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Module 07: STARTBILL FOUNDING 100 */}
          {activeModule === 'founding100' && (
            <Founding100View
              candidates={store.foundingCandidates}
              onUpdateCandidate={handleUpdateCandidate}
              onAddCandidate={handleAddCandidate}
              triggerToast={triggerToast}
            />
          )}

          {/* Module 20: Rôles & Permissions (RBAC) */}
          {activeModule === 'rbac_permissions' && (
            <RbacPermissionsView
              matrix={INITIAL_RBAC_MATRIX}
              triggerToast={triggerToast}
            />
          )}

          {/* All Other Specialized Modules (04, 05, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 23, 24) */}
          {activeModule !== 'ceo_dashboard' &&
            activeModule !== 'strategic_steering' &&
            activeModule !== 'businesses' &&
            activeModule !== 'payments' &&
            activeModule !== 'founding100' &&
            activeModule !== 'rbac_permissions' && (
              <ComprehensiveModulesView
                activeModule={activeModule}
                users={store.users}
                plans={store.plans}
                prospects={store.prospects}
                markets={store.markets}
                featureFlags={store.featureFlags}
                aiSupervision={store.aiSupervision}
                fiscalSources={store.fiscalSources}
                tickets={store.tickets}
                partners={store.partners}
                team={store.team}
                securityEvents={store.securityEvents}
                auditLogs={store.auditLogs}
                healthMetrics={store.healthMetrics}
                roadmap={store.roadmap}
                platformConfig={store.platformConfig}
                onUpdateUsers={handleUpdateUsers}
                onUpdateFlags={handleUpdateFlags}
                onUpdateAiState={handleUpdateAi}
                onUpdateTickets={handleUpdateTickets}
                onUpdatePlatformConfig={handleUpdatePlatformConfig}
                triggerToast={triggerToast}
              />
            )}
        </main>
      </div>

      {/* Profile Modal: "Mon profil administrateur" */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={store.ceoProfile}
        onUpdateProfile={handleUpdateProfile}
        triggerToast={triggerToast}
      />
    </div>
  );
}
