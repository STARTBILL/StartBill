import React, { useState } from 'react';
import { AdminBusiness } from '../adminTypes';
import {
  Building2,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Download,
  Mail,
  Phone,
  Calendar,
  Lock,
  X,
  Trash2,
  RotateCcw,
} from 'lucide-react';

interface BusinessesModuleProps {
  businesses: AdminBusiness[];
  onUpdateBusiness: (id: string, updates: Partial<AdminBusiness>) => void;
  triggerToast: (msg: string) => void;
}

export const BusinessesModule: React.FC<BusinessesModuleProps> = ({
  businesses,
  onUpdateBusiness,
  triggerToast,
}) => {
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeDossier, setActiveDossier] = useState<AdminBusiness | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState<AdminBusiness | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const filtered = businesses.filter(b => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase()) ||
      b.contactName.toLowerCase().includes(search.toLowerCase()) ||
      b.contactEmail.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = countryFilter === 'ALL' || b.country === countryFilter;
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesCountry && matchesStatus;
  });

  const handleConfirmSuspend = () => {
    if (!showSuspendModal || !suspendReason.trim()) {
      triggerToast('Veuillez spécifier un motif de suspension motivé.');
      return;
    }

    onUpdateBusiness(showSuspendModal.id, {
      status: 'suspended',
      suspensionReason: suspendReason.trim(),
    });

    if (activeDossier?.id === showSuspendModal.id) {
      setActiveDossier({
        ...activeDossier,
        status: 'suspended',
        suspensionReason: suspendReason.trim(),
      });
    }

    setShowSuspendModal(null);
    setSuspendReason('');
    triggerToast(`Entreprise "${showSuspendModal.name}" suspendue avec motif enregistré.`);
  };

  const handleReactivate = (b: AdminBusiness) => {
    onUpdateBusiness(b.id, { status: 'active', suspensionReason: undefined });
    if (activeDossier?.id === b.id) {
      setActiveDossier({ ...activeDossier, status: 'active', suspensionReason: undefined });
    }
    triggerToast(`Entreprise "${b.name}" réactivée.`);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              GESTION DES ENTREPRISES
            </span>
            <span className="text-xs text-slate-400">Entreprises clientes STARTBILL</span>
          </div>
          <h2 className="text-xl font-black text-white">Répertoire & Supervision des Entreprises</h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Gestion du cycle de vie des comptes professionnels (activation, conformité fiscale, suspension motivée, audit).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-xs text-slate-300 font-bold font-mono">
            {businesses.length} entreprises répertoriées
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, ID, contact..."
              className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tous les pays</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Sénégal">🇸🇳 Sénégal</option>
            <option value="Côte d’Ivoire">🇨🇮 Côte d’Ivoire</option>
            <option value="Haïti">🇭🇹 Haïti</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="trial">Essai en cours</option>
            <option value="suspended">Suspendu</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Entreprise & ID</th>
                <th className="p-3.5">Pays & Devise</th>
                <th className="p-3.5">Contact Professionnel</th>
                <th className="p-3.5">Forfait</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5">Vérification</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-900/60 transition">
                  <td className="p-3.5">
                    <div className="font-bold text-white text-xs">{b.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      ID: {b.id} {b.legalNumber ? `• ${b.legalNumber}` : ''}
                    </div>
                  </td>

                  <td className="p-3.5">
                    <span className="font-semibold text-white">
                      {b.country === 'Canada' ? '🇨🇦 Canada' : b.country === 'Sénégal' ? '🇸🇳 Sénégal' : b.country === 'Côte d’Ivoire' ? '🇨🇮 Côte d’Ivoire' : '🇭🇹 Haïti'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">Devise : {b.currency}</span>
                  </td>

                  <td className="p-3.5">
                    <div className="text-white">{b.contactName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{b.contactEmail}</div>
                  </td>

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      {b.plan}
                    </span>
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : b.status === 'trial'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : b.status === 'suspended'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      }`}
                    >
                      {b.status === 'active' ? 'Actif' : b.status === 'trial' ? 'Essai' : b.status === 'suspended' ? 'Suspendu' : 'Archivé'}
                    </span>
                  </td>

                  <td className="p-3.5">
                    {b.verificationStatus === 'verified' ? (
                      <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Vérifiée</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 text-[11px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>En attente</span>
                      </span>
                    )}
                  </td>

                  <td className="p-3.5 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveDossier(b)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs transition cursor-pointer"
                    >
                      Fiche
                    </button>

                    {b.status === 'suspended' ? (
                      <button
                        type="button"
                        onClick={() => handleReactivate(b)}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg font-bold text-xs transition cursor-pointer"
                      >
                        Réactiver
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowSuspendModal(b)}
                        className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 rounded-lg font-bold text-xs transition cursor-pointer"
                      >
                        Suspendre
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DOSSIER MODAL */}
      {activeDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0B1528] border border-slate-750 text-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{activeDossier.name}</h3>
                  <p className="text-xs text-slate-400">ID: {activeDossier.id} • {activeDossier.country}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDossier(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Contact</span>
                  <div className="text-white font-bold">{activeDossier.contactName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Courriel</span>
                  <div className="text-slate-300 font-mono">{activeDossier.contactEmail}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Secteur</span>
                  <div className="text-slate-300">{activeDossier.sector}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Forfait</span>
                  <div className="text-blue-400 font-bold">{activeDossier.plan}</div>
                </div>
              </div>

              {activeDossier.suspensionReason && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <span className="font-bold block mb-0.5">Motif de suspension motivée :</span>
                  {activeDossier.suspensionReason}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Conformité de confidentialité : L'administrateur supervise les métadonnées sans intrusion dans les factures et dépenses privées des clients.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveDossier(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUSPEND REASON MODAL */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0B1528] border border-rose-500/40 text-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-bold text-white text-base">Suspension Motivée d'Entreprise</h3>
            </div>

            <p className="text-xs text-slate-300">
              Conformément à la politique d'audit, toute suspension d'accès client doit être formellement motivée et consignée dans le journal d'audit immuable.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Motif légal ou technique *
              </label>
              <textarea
                rows={3}
                required
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                placeholder="Ex: Demande expresse du client, impayé d'abonnement persistant, ou motif de sécurité..."
                className="w-full bg-slate-900 border border-slate-750 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSuspendModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmSuspend}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer"
              >
                Confirmer la suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
