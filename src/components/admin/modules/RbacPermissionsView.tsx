import React, { useState } from 'react';
import {
  RbacPermissionRow,
  RbacRole,
  RbacAction,
} from '../adminTypes';
import {
  KeyRound,
  ShieldCheck,
  Shield,
  Check,
  X,
  Lock,
  AlertTriangle,
  UserCheck,
  Info,
} from 'lucide-react';

interface RbacPermissionsViewProps {
  matrix: RbacPermissionRow[];
  triggerToast: (msg: string) => void;
}

const ROLES_LIST: { role: RbacRole; label: string; desc: string; level: number }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin (CEO)', desc: 'Accès sans restriction à tous les modules et autorisations de direction générale (Ferline ZOGNI).', level: 1 },
  { role: 'ADMIN_OPERATIONS', label: 'Admin Opérations', desc: 'Gestion opérationnelle, activation des entreprises et coordination.', level: 2 },
  { role: 'ADMIN_FINANCE', label: 'Admin Finance', desc: 'Gestion des flux financiers, conciliation comptable et rapports.', level: 2 },
  { role: 'ADMIN_COMPLIANCE', label: 'Admin Conformité', desc: 'Audit légal, Loi 25 (Québec), RGPD, gestion des consentements.', level: 2 },
  { role: 'ADMIN_SUPPORT', label: 'Admin Support', desc: 'Gestion des tickets clients et résolution des requêtes.', level: 3 },
  { role: 'ADMIN_MARKETING', label: 'Admin Marketing', desc: 'Gestion des campagnes, bannières d’annonces et prospects.', level: 3 },
  { role: 'ADMIN_PARTNERSHIPS', label: 'Admin Partenariats', desc: 'Relations avec chambres de commerce et cabinets CPA.', level: 3 },
  { role: 'TECH_LEAD', label: 'Tech Lead', desc: 'Surveillance technique, infrastructure et déploiement.', level: 2 },
  { role: 'DEVELOPER', label: 'Développeur', desc: 'Maintenance technique et intégrations en environnement de test.', level: 3 },
  { role: 'INTERN', label: 'Stagiaire', desc: 'Lecture seule encadrée sans permissions de production.', level: 4 },
  { role: 'READ_ONLY', label: 'Auditeur / Lecture Seule', desc: 'Consultation sans possibilité de modification.', level: 4 },
];

const ACTIONS_LIST: { action: RbacAction; label: string }[] = [
  { action: 'read', label: 'Lire' },
  { action: 'create', label: 'Créer' },
  { action: 'update', label: 'Modifier' },
  { action: 'approve', label: 'Approuver' },
  { action: 'delete', label: 'Supprimer' },
  { action: 'export', label: 'Exporter' },
  { action: 'administer', label: 'Administrer' },
];

export const RbacPermissionsView: React.FC<RbacPermissionsViewProps> = ({
  matrix,
  triggerToast,
}) => {
  const [selectedRole, setSelectedRole] = useState<RbacRole>('SUPER_ADMIN');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 20 • GOUVERNANCE & CONTRÔLE D'ACCÈS
            </span>
            <span className="text-xs text-slate-400">Zero-Trust Attribute-Based Access Control</span>
          </div>
          <h2 className="text-xl font-black text-white">Matrice RBAC & Rôles Administrateurs</h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Chaque action sensible requiert une autorisation stricte. Les stagiaires et comptes externes sont isolés par défaut.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-xs text-emerald-400 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero-Trust Enforcé</span>
          </span>
        </div>
      </div>

      {/* Role Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {ROLES_LIST.map(r => (
          <button
            key={r.role}
            type="button"
            onClick={() => {
              setSelectedRole(r.role);
              triggerToast(`Affichage des permissions : ${r.label}`);
            }}
            className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
              selectedRole === r.role
                ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                : 'bg-[#0B1528] border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <div className="font-bold text-xs text-white flex items-center justify-between">
              <span>{r.label}</span>
              {r.role === 'SUPER_ADMIN' && (
                <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 px-1 rounded">CEO</span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {r.desc}
            </p>
          </button>
        ))}
      </div>

      {/* Detailed Permission Matrix Table */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <span>Permissions actives pour le rôle : <strong className="text-blue-300">{selectedRole}</strong></span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Vérification côté serveur par règles Firestore et middlewares de sécurité.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Module de Gouvernance</th>
                {ACTIONS_LIST.map(a => (
                  <th key={a.action} className="p-3 text-center">
                    {a.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {matrix.map(row => {
                const perms = row.permissionsByRole[selectedRole] || [];

                return (
                  <tr key={row.moduleId} className="hover:bg-slate-900/60 transition">
                    <td className="p-3 font-bold text-white text-xs">{row.moduleName}</td>
                    {ACTIONS_LIST.map(a => {
                      const hasPerm = perms.includes(a.action);
                      return (
                        <td key={a.action} className="p-3 text-center">
                          {hasPerm ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400">
                              <Check className="w-3.5 h-3.5 stroke-3" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-900 text-slate-600">
                              <X className="w-3 h-3" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
