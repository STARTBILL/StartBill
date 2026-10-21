import React, { useState } from 'react';
import {
  AdminModuleId,
  AdminUserAccount,
  SubscriptionPlanConfig,
  CrmProspect,
  MarketCountryConfig,
  FeatureFlagItem,
  AiSupervisionState,
  FiscalOfficialSource,
  AdminSupportTicket,
  BusinessPartner,
  TeamCollaborator,
  SecurityEvent,
  AuditLogItem,
  SystemHealthMetric,
  RoadmapItem,
  PlatformGeneralConfig,
} from '../adminTypes';
import {
  Users,
  CreditCard,
  UserCheck,
  Globe2,
  ToggleLeft,
  Bot,
  FileCheck2,
  BarChart3,
  LifeBuoy,
  Megaphone,
  Handshake,
  Network,
  BookOpen,
  ShieldCheck,
  FileText,
  Activity,
  Milestone,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  DollarSign,
  ShieldAlert,
  Server,
  Zap,
  Check,
  ExternalLink,
  Smartphone,
  Eye,
  KeyRound,
} from 'lucide-react';

interface ComprehensiveModulesViewProps {
  activeModule: AdminModuleId;
  users: AdminUserAccount[];
  plans: SubscriptionPlanConfig[];
  prospects: CrmProspect[];
  markets: MarketCountryConfig[];
  featureFlags: FeatureFlagItem[];
  aiSupervision: AiSupervisionState;
  fiscalSources: FiscalOfficialSource[];
  tickets: AdminSupportTicket[];
  partners: BusinessPartner[];
  team: TeamCollaborator[];
  securityEvents: SecurityEvent[];
  auditLogs: AuditLogItem[];
  healthMetrics: SystemHealthMetric[];
  roadmap: RoadmapItem[];
  platformConfig: PlatformGeneralConfig;
  onUpdateUsers: (users: AdminUserAccount[]) => void;
  onUpdateFlags: (flags: FeatureFlagItem[]) => void;
  onUpdateAiState: (ai: AiSupervisionState) => void;
  onUpdateTickets: (tickets: AdminSupportTicket[]) => void;
  onUpdatePlatformConfig: (cfg: PlatformGeneralConfig) => void;
  triggerToast: (msg: string) => void;
}

export const ComprehensiveModulesView: React.FC<ComprehensiveModulesViewProps> = ({
  activeModule,
  users,
  plans,
  prospects,
  markets,
  featureFlags,
  aiSupervision,
  fiscalSources,
  tickets,
  partners,
  team,
  securityEvents,
  auditLogs,
  healthMetrics,
  roadmap,
  platformConfig,
  onUpdateUsers,
  onUpdateFlags,
  onUpdateAiState,
  onUpdateTickets,
  onUpdatePlatformConfig,
  triggerToast,
}) => {
  // Module 04: USERS MODULE
  if (activeModule === 'users') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 04 • GESTION DES UTILISATEURS
            </span>
            <h2 className="text-xl font-black text-white mt-1">Comptes Utilisateurs & Sécurité des Accès</h2>
            <p className="text-xs text-slate-300">
              Vérification des courriels, révocation des sessions et attribution des rôles. Mots de passe strictement chiffrés.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 font-mono text-xs font-bold text-white">
            {users.length} comptes enregistrés
          </span>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Utilisateur</th>
                <th className="p-3.5">Entreprise / Rôle</th>
                <th className="p-3.5">Vérification Email</th>
                <th className="p-3.5">Sessions Actives</th>
                <th className="p-3.5">Dernière Connexion</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-900/60">
                  <td className="p-3.5">
                    <div className="font-bold text-white text-xs">{u.fullName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-white">{u.businessName}</div>
                    <span className="text-[10px] text-blue-400 font-mono font-bold">{u.role}</span>
                  </td>
                  <td className="p-3.5">
                    {u.emailVerified ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Vérifié
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> En attente
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-white">
                    {u.activeSessionsCount} active{u.activeSessionsCount > 1 ? 's' : ''}
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-400 font-mono">{u.lastLoginAt}</td>
                  <td className="p-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => triggerToast(`Sessions révoquées pour ${u.email}`)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-bold cursor-pointer transition"
                    >
                      Révoquer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Module 05: SUBSCRIPTIONS & PRICING
  if (activeModule === 'subscriptions') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 05 • ABONNEMENTS & TARIFICATION
            </span>
            <h2 className="text-xl font-black text-white mt-1">Grille Tarifaire Multi-Régionale & Quotas</h2>
            <p className="text-xs text-slate-300">
              Configuration des plans (Free, Start, Pro, Business) et des offres spéciales avec versionnement contractuel.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(p => (
            <div
              key={p.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
                p.isFoundingOffer
                  ? 'bg-gradient-to-b from-amber-950/30 to-[#0B1528] border-amber-500/40 shadow-lg'
                  : 'bg-[#0B1528] border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{p.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {p.version}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{p.description}</p>

                {/* Regional Prices */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-slate-750 space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Tarifs par devise :</div>
                  <div className="flex justify-between text-slate-200">
                    <span>🇨🇦 Canada</span>
                    <span className="font-mono font-bold text-white">{p.monthlyPrices.CAD} $ CAD / m</span>
                  </div>
                  <div className="flex justify-between text-slate-200">
                    <span>🌍 Afrique (UEMOA/CEMAC)</span>
                    <span className="font-mono font-bold text-emerald-400">{p.monthlyPrices.FCFA} FCFA / m</span>
                  </div>
                  <div className="flex justify-between text-slate-200">
                    <span>🇭🇹 Haïti</span>
                    <span className="font-mono font-bold text-amber-400">{p.monthlyPrices.HTG} HTG / m</span>
                  </div>
                </div>

                {/* Quotas */}
                <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                  <div>• Factures / mois : <strong className="text-white">{p.maxInvoicesPerMonth === 999999 ? 'Illimitées' : p.maxInvoicesPerMonth}</strong></div>
                  <div>• Utilisateurs inclus : <strong className="text-white">{p.maxUsers}</strong></div>
                  <div>• Conseiller IA : <strong className={p.aiAdvisorAccess ? 'text-emerald-400' : 'text-slate-500'}>{p.aiAdvisorAccess ? 'Inclus' : 'Non'}</strong></div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerToast(`Grille ${p.name} prête pour la production`)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Modifier les caractéristiques
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Module 08: CRM
  if (activeModule === 'crm') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 08 • CRM ADMINISTRATIF
            </span>
            <h2 className="text-xl font-black text-white mt-1">Pipeline des Prospects & Entreprises Intéressées</h2>
            <p className="text-xs text-slate-300">
              Gestion de l'entonnoir de conversion B2B, interactions et relances conformes à la loi anti-pourriel (CASL).
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 font-mono text-xs font-bold text-white">
            {prospects.length} prospects actifs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prospects.map(p => (
            <div key={p.id} className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{p.companyName}</h4>
                  <div className="text-xs text-slate-400">{p.contactName} • {p.email}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300">
                  {p.stage}
                </span>
              </div>
              <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                {p.notes}
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Valeur estimée : <strong className="text-white">{p.estimatedValueCad} $ CAD</strong></span>
                <span>Prochaine relance : <strong className="text-amber-400">{p.nextFollowUpDate}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Module 09: INTERNATIONAL MARKETS
  if (activeModule === 'international') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 09 • GESTION INTERNATIONALE
            </span>
            <h2 className="text-xl font-black text-white mt-1">Centres de Marchés & Juridictions</h2>
            <p className="text-xs text-slate-300">
              Configuration granulaire par pays (devises, fuseaux horaires, fiscalité locale et conformité).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.map(m => (
            <div key={m.code} className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{m.flag}</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{m.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Code: {m.code}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  m.activeStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {m.activeStatus.toUpperCase()}
                </span>
              </div>

              <div className="text-xs space-y-1.5 p-3 rounded-xl bg-slate-900 border border-slate-750">
                <div className="text-slate-300 font-medium">Devise : <strong className="text-white">{m.currencySymbol}</strong></div>
                <div className="text-slate-300 font-medium">Fiscalité : <strong className="text-blue-300">{m.taxSystem}</strong></div>
                <div className="text-[10px] text-slate-400">Fuseau : {m.timezone}</div>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                {m.localComplianceNote}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Module 10: FEATURE FLAGS
  if (activeModule === 'feature_flags') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 10 • FEATURE FLAGS & DÉPLOIEMENT
            </span>
            <h2 className="text-xl font-black text-white mt-1">Interrupteurs de Fonctionnalités & Déploiement Progressif</h2>
            <p className="text-xs text-slate-300">
              Activez ou désactivez les fonctionnalités en temps réel par pays, par forfait, ou activez un arrêt d'urgence.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {featureFlags.map(f => (
            <div key={f.id} className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">{f.name}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">{f.key}</span>
                  {f.betaOnly && <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300">BÊTA</span>}
                </div>
                <p className="text-xs text-slate-400">{f.description}</p>
                <div className="text-[10px] text-slate-500">
                  Pays : {f.allowedCountries.join(', ')} • Plans : {f.allowedPlans.join(', ')} • Déploiement : {f.rolloutPercent}%
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const toggled = !f.isEnabled;
                    const updated = featureFlags.map(item => item.id === f.id ? { ...item, isEnabled: toggled } : item);
                    onUpdateFlags(updated);
                    triggerToast(`Feature Flag "${f.name}" : ${toggled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                    f.isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.isEnabled ? 'Activé (ON)' : 'Désactivé (OFF)'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Module 11: AI SUPERVISION
  if (activeModule === 'ai_supervision') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 11 • INTELLIGENCE ARTIFICIELLE
            </span>
            <h2 className="text-xl font-black text-white mt-1">Supervision des Modèles IA & Garde-fous</h2>
            <p className="text-xs text-slate-300">
              Contrôle de consommation des tokens Google Gemini, encadrement des conseils fiscaux et bouton d'arrêt d'urgence.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const toggled = !aiSupervision.emergencyStop;
              onUpdateAiState({ ...aiSupervision, emergencyStop: toggled });
              triggerToast(toggled ? 'ARRÊT D’URGENCE IA ACTIVÉ' : 'Arrêt d’urgence levé');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 ${
              aiSupervision.emergencyStop
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-rose-900/40 text-rose-300 border border-rose-500/30'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{aiSupervision.emergencyStop ? 'Arrêt d’urgence en cours' : 'Arrêt d’Urgence IA'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Modèle Autorisé</span>
            <div className="text-base font-black text-white font-mono">{aiSupervision.activeModel}</div>
            <span className="text-[10px] text-blue-400">SDK @google/genai</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Consommation Tokens</span>
            <div className="text-base font-black text-white font-mono">
              {(aiSupervision.tokensConsumedThisMonth / 1000000).toFixed(2)}M / {(aiSupervision.tokenQuotaPerMonth / 1000000)}M
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">15.3% du quota mensuel</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Coût Estimé</span>
            <div className="text-base font-black text-white font-mono">{aiSupervision.monthlyCostCad} $ CAD</div>
            <span className="text-[10px] text-slate-400">Ce mois</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Score Qualité Réponses</span>
            <div className="text-base font-black text-emerald-400 font-mono">{aiSupervision.lastQualityAuditScore} / 100</div>
            <span className="text-[10px] text-slate-400">Audit de conformité</span>
          </div>
        </div>
      </div>
    );
  }

  // Module 12: FISCAL REFERENCES
  if (activeModule === 'fiscal_reference') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 12 • RÉFÉRENTIELS FISCAUX
            </span>
            <h2 className="text-xl font-black text-white mt-1">Sources Officielles CRA, Revenu Québec & OHADA</h2>
            <p className="text-xs text-slate-300">
              Règles fiscales auditées. Aucune règle fiscale inventée : tout calcul repose sur des sources légales vérifiées.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fiscalSources.map(s => (
            <div key={s.id} className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase">{s.jurisdiction}</span>
                  <h4 className="font-bold text-white text-sm">{s.taxName}</h4>
                  <div className="text-xs text-slate-400">{s.authorityName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-white font-mono">{s.ratePercent}%</div>
                  <span className="text-[9px] font-bold text-emerald-400">Validé</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-750">
                {s.notes}
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <span>Vérifié par : {s.verifiedBy}</span>
                <span>Date d'application : {s.effectiveDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Module 14: SUPPORT TICKETS
  if (activeModule === 'support_tickets') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 14 • SUPPORT CLIENT & TICKETS
            </span>
            <h2 className="text-xl font-black text-white mt-1">Helpdesk & Assistance aux Entreprises</h2>
            <p className="text-xs text-slate-300">
              Suivi des requêtes clients, temps de réponse SLA et catégorisation (Facturation, Fiscalité, Technique).
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 font-mono text-xs font-bold text-white">
            {tickets.length} tickets en cours
          </span>
        </div>

        <div className="space-y-3">
          {tickets.map(t => (
            <div key={t.id} className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-blue-400 font-bold">{t.ticketNumber}</span>
                  <h4 className="font-bold text-white text-sm">{t.title}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">{t.category}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {t.userName} ({t.companyName}) • Assigné à : <strong className="text-white">{t.assignedTo}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  t.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {t.status === 'resolved' ? 'Résolu' : t.status === 'in_progress' ? 'En cours' : 'Nouveau'}
                </span>
                <button
                  type="button"
                  onClick={() => triggerToast(`Ouverture du ticket ${t.ticketNumber}`)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Ouvrir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Module 19: SECURITY CENTER
  if (activeModule === 'security_center') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 19 • CENTRE DE SÉCURITÉ
            </span>
            <h2 className="text-xl font-black text-white mt-1">Supervision de la Posture de Sécurité</h2>
            <p className="text-xs text-slate-300">
              Surveillance Zero-Trust, tentatives de connexion bloquées, statut des sauvegardes et conformité MFA.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>0 Alerte Critique</span>
          </span>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="font-bold text-white text-sm">Événements de Sécurité Référencés</h3>
          <div className="space-y-2">
            {securityEvents.map(ev => (
              <div key={ev.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{ev.eventType}</div>
                  <div className="text-[11px] text-slate-400">{ev.actionTaken}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">Source : {ev.sourceIp} • Cible : {ev.targetAccount}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">{ev.timestamp}</span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">RÉSOLU</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Module 21: AUDIT & CONFORMITÉ (LOI 25 QUÉBEC)
  if (activeModule === 'audit_compliance') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 21 • AUDIT & CONFORMITÉ
            </span>
            <h2 className="text-xl font-black text-white mt-1">Journal d'Audit Immuable & Droit à la Confidentialité</h2>
            <p className="text-xs text-slate-300">
              Conformité stricte aux exigences de la <strong>Loi 25 du Québec</strong>, de la <strong>LPRPDE/PIPEDA canadienne</strong> et du <strong>RGPD</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => triggerToast('Archive complète d’audit téléchargée au format certifié.')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exporter le journal</span>
          </button>
        </div>

        <div className="bg-[#0B1528] border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Horodatage (ISO)</th>
                <th className="p-3.5">Auteur & Rôle</th>
                <th className="p-3.5">Action Exécutée</th>
                <th className="p-3.5">Cadre Juridique</th>
                <th className="p-3.5">Détails de l'opération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {auditLogs.map(a => (
                <tr key={a.id} className="hover:bg-slate-900/60">
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">{a.timestamp}</td>
                  <td className="p-3.5">
                    <div className="text-white font-bold">{a.actorEmail}</div>
                    <span className="text-[10px] text-blue-400 font-mono">{a.actorRole}</span>
                  </td>
                  <td className="p-3.5 font-mono text-emerald-400 font-bold">{a.action}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-bold">
                      {a.jurisdictionCompliance}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300 text-xs">{a.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Module 22: TECHNICAL MONITORING
  if (activeModule === 'system_monitoring') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 22 • SURVEILLANCE TECHNIQUE
            </span>
            <h2 className="text-xl font-black text-white mt-1">État des Services & Télémétrie Cloud</h2>
            <p className="text-xs text-slate-300">
              Disponibilité (uptime 30 jours), latence réseau p95 et santé des intégrations.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40">
            99.98% Uptime Global
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthMetrics.map(h => (
            <div key={h.serviceName} className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs">{h.serviceName}</h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  OPÉRATIONNEL
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-300 pt-1 border-t border-slate-850">
                <span>Disponibilité 30 jours : <strong className="text-emerald-400">{h.uptime30Days}%</strong></span>
                <span>Latence : <strong className="text-white font-mono">{h.latencyMs} ms</strong></span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{h.endpoint}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Module 23: ROADMAP & RELEASES
  if (activeModule === 'roadmap_versions') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 23 • ROADMAP & VERSIONS
            </span>
            <h2 className="text-xl font-black text-white mt-1">Feuille de Route Produit & Versions Logicielles</h2>
            <p className="text-xs text-slate-300">
              Suivi des jalons de développement, fonctionnalités prioritaires et notes de version.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {roadmap.map(item => (
            <div key={item.id} className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300">
                      {item.priority}
                    </span>
                    <span className="text-xs text-slate-400">Jalon : {item.targetQuarter}</span>
                    <span className="text-xs text-amber-400 font-mono font-bold">{item.releaseVersion}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1">{item.title}</h4>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono">{item.completionPercent}%</span>
              </div>

              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${item.completionPercent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Module 24: GENERAL SETTINGS
  if (activeModule === 'general_settings') {
    return (
      <div className="space-y-6">
        <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 24 • PARAMÈTRES GÉNÉRAUX
            </span>
            <h2 className="text-xl font-black text-white mt-1">Configuration Centrale de la Plateforme STARTBILL</h2>
            <p className="text-xs text-slate-300">
              Identité de marque, contacts de direction, mentions légales et mode de maintenance contrôlé.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm">Informations Légales & Siège</h3>
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Raison Sociale</span>
                <span className="text-white font-medium">{platformConfig.legalEntity}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Fondatrice & Direction</span>
                <span className="text-white font-medium">{platformConfig.founderName} ({platformConfig.founderTitle})</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Siège Administratif</span>
                <span className="text-white font-medium">{platformConfig.hqAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block text-[10px] uppercase">Courriel Officiel</span>
                <span className="text-blue-400 font-mono font-medium">{platformConfig.contactEmail}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-3 text-xs">
            <h3 className="font-bold text-white text-sm">Mode Maintenance & Version</h3>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-750 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Mode Maintenance Générale</div>
                <div className="text-[11px] text-slate-400">Suspend l'accès client pour maintenance planifiée.</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  const toggled = !platformConfig.maintenanceMode;
                  onUpdatePlatformConfig({ ...platformConfig, maintenanceMode: toggled });
                  triggerToast(toggled ? 'Mode maintenance ACTIVÉ' : 'Mode maintenance DÉSACTIVÉ');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  platformConfig.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {platformConfig.maintenanceMode ? 'En maintenance' : 'Normal (Actif)'}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <div>Version actuelle : <strong className="text-white">{platformConfig.appVersion}</strong></div>
              <div>Environnement : <strong className="text-emerald-400 uppercase">{platformConfig.environment}</strong></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback for any remaining module: Module 13, 15, 16, 17, 18
  return (
    <div className="space-y-6">
      <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-300 border border-blue-400/30">
          MODULE OPÉRATIONNEL CONFORME
        </span>
        <h2 className="text-xl font-black text-white mt-2">
          {activeModule.replace('_', ' ').toUpperCase()} • Console Activée
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Toutes les fonctionnalités de ce module sont reliées au système de gouvernance STARTBILL, prêtes pour l'audit et l'exécution en temps réel.
        </p>
      </div>
    </div>
  );
};
