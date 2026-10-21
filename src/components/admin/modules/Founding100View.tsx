import React, { useState } from 'react';
import {
  Founding100Candidate,
  FoundingStatus,
} from '../adminTypes';
import {
  Sparkles,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  UserCheck,
  Send,
  Calendar,
  Building2,
  Mail,
  Phone,
  Video,
  Edit3,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Download,
  Check,
  Shield,
  X,
} from 'lucide-react';

interface Founding100ViewProps {
  candidates: Founding100Candidate[];
  onUpdateCandidate: (id: string, updates: Partial<Founding100Candidate>) => void;
  onAddCandidate: (newCandidate: Founding100Candidate) => void;
  triggerToast: (msg: string) => void;
}

const STATUS_LABELS: Record<FoundingStatus, { label: string; bg: string; text: string; border: string }> = {
  received: { label: 'Reçue', bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30' },
  in_review: { label: 'En examen', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  shortlisted: { label: 'Présélectionnée', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  accepted: { label: 'Acceptée', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  waitlist: { label: 'Liste d’attente', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  rejected: { label: 'Refusée', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  activated: { label: 'Activée (Pilote)', bg: 'bg-purple-500/15', text: 'text-purple-300', border: 'border-purple-500/40' },
  completed: { label: 'Test terminé', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
};

export const Founding100View: React.FC<Founding100ViewProps> = ({
  candidates,
  onUpdateCandidate,
  onAddCandidate,
  triggerToast,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCandidateModal, setActiveCandidateModal] = useState<Founding100Candidate | null>(null);
  const [showNewApplicationModal, setShowNewApplicationModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // New Application Form State
  const [newForm, setNewForm] = useState({
    companyName: '',
    managerName: '',
    email: '',
    phone: '',
    country: 'Canada' as any,
    city: '',
    sector: '',
    companySize: '1-5 personnes',
    activityDescription: '',
    managementNeeds: '',
    motivation: '',
    videoPresentationUrl: '',
    acceptTerms: true,
  });

  const filtered = candidates.filter(c => {
    const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
    const matchesCountry = selectedCountry === 'ALL' || c.country === selectedCountry;
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.managerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCountry && matchesSearch;
  });

  // Calculate status counts
  const countsByStatus = candidates.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.companyName || !newForm.managerName || !newForm.email) {
      triggerToast('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    const created: Founding100Candidate = {
      id: `f100-${Date.now()}`,
      companyName: newForm.companyName,
      managerName: newForm.managerName,
      email: newForm.email,
      phone: newForm.phone || undefined,
      country: newForm.country,
      city: newForm.city || 'Non spécifié',
      sector: newForm.sector || 'Général',
      activityDescription: newForm.activityDescription,
      companySize: newForm.companySize,
      managementNeeds: newForm.managementNeeds,
      motivation: newForm.motivation,
      videoPresentationUrl: newForm.videoPresentationUrl || undefined,
      status: 'received',
      submittedAt: new Date().toISOString().split('T')[0],
      internalNotes: 'Nouvelle candidature enregistrée via le formulaire administrateur.',
      assignedReviewer: 'Ferline ZOGNI (CEO)',
      engagementScore: 50,
      feedbackCount: 0,
      reportedBugsCount: 0,
      participationAgreementSigned: false,
    };

    onAddCandidate(created);
    setShowNewApplicationModal(false);
    triggerToast(`Candidature pour "${created.companyName}" enregistrée avec succès !`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Programme STARTBILL FOUNDING 100 */}
      <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-[#0B1528] border border-amber-500/30 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/40">
                MODULE 07 • PROGRAMME PILOTE
              </span>
              <span className="text-xs text-amber-200/80 font-bold">
                Lancement prévu : 26 Octobre 2026 (Durée : 3 mois)
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>STARTBILL FOUNDING 100</span>
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Sélectionnez et accompagnez 100 entreprises pionnières au Canada, en Afrique francophone et en Haïti. Candidature 100% gratuite.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowNewApplicationModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Enregistrer une candidature</span>
            </button>
          </div>
        </div>

        {/* Tarifs Fondateurs Rappel */}
        <div className="mt-5 pt-4 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <span className="text-2xl">🇨🇦</span>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Tarif Fondateur Canada</div>
              <div className="text-sm font-black text-white">5 $ CAD / mois</div>
              <div className="text-[10px] text-emerald-400 font-semibold">3 mois d'essai gratuit inclus</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Tarif Fondateur Afrique</div>
              <div className="text-sm font-black text-white">500 FCFA / mois</div>
              <div className="text-[10px] text-emerald-400 font-semibold">3 mois d'essai gratuit inclus</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <span className="text-2xl">🇭🇹</span>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Tarif Fondateur Haïti</div>
              <div className="text-sm font-black text-white">50 HTG / mois</div>
              <div className="text-[10px] text-emerald-400 font-semibold">3 mois d'essai gratuit inclus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher entreprise, responsable, ville..."
              className="w-full bg-slate-900 border border-slate-750 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Country Selector */}
          <select
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
            className="bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Tous les pays ({candidates.length})</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Sénégal">🇸🇳 Sénégal</option>
            <option value="Côte d’Ivoire">🇨🇮 Côte d’Ivoire</option>
            <option value="Haïti">🇭🇹 Haïti</option>
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Tous les statuts ({candidates.length})</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label} ({countsByStatus[k] || 0})
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-750">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'kanban' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vue Pipeline (Kanban)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vue Tableau ({filtered.length})
          </button>
        </div>
      </div>

      {/* View 1: KANBAN PIPELINE WITH THE 8 STRICT STATUSES */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
          {(Object.keys(STATUS_LABELS) as FoundingStatus[]).map(statusKey => {
            const meta = STATUS_LABELS[statusKey];
            const inStatus = filtered.filter(c => c.status === statusKey);

            return (
              <div
                key={statusKey}
                className="bg-[#0B1528] border border-slate-800 rounded-2xl p-3 flex flex-col space-y-3 min-w-[260px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${meta.text.replace('text-', 'bg-')}`} />
                    <span className="font-bold text-xs text-white">{meta.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${meta.bg} ${meta.text} ${meta.border}`}>
                    {inStatus.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-2.5 flex-1 min-h-[140px]">
                  {inStatus.map(item => (
                    <div
                      key={item.id}
                      onClick={() => setActiveCandidateModal(item)}
                      className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-750 hover:border-amber-500/40 transition cursor-pointer space-y-2 shadow-xs group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-bold text-xs text-white group-hover:text-amber-300 transition">
                          {item.companyName}
                        </div>
                        <span className="text-xs shrink-0">
                          {item.country === 'Canada' ? '🇨🇦' : item.country === 'Sénégal' ? '🇸🇳' : item.country === 'Côte d’Ivoire' ? '🇨🇮' : '🇭🇹'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        {item.managerName} • <span className="text-slate-300 font-medium">{item.city}</span>
                      </div>

                      <div className="text-[10px] text-slate-400 line-clamp-2 italic">
                        « {item.activityDescription} »
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-mono">{item.submittedAt}</span>
                        {item.participationAgreementSigned ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <Check className="w-3 h-3" />
                            <span>Accord signé</span>
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium">En attente signature</span>
                        )}
                      </div>
                    </div>
                  ))}

                  {inStatus.length === 0 && (
                    <div className="h-full flex items-center justify-center p-4 border border-dashed border-slate-800 rounded-xl text-slate-500 text-[11px] text-center">
                      Aucune entreprise à ce stade
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: DETAILED TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-[#0B1528] border border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Entreprise & Ville</th>
                  <th className="p-3.5">Responsable & Email</th>
                  <th className="p-3.5">Secteur</th>
                  <th className="p-3.5">Statut Pilote</th>
                  <th className="p-3.5">Score Engagement</th>
                  <th className="p-3.5">Reviewer Assigné</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filtered.map(item => {
                  const meta = STATUS_LABELS[item.status];
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/60 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-xs">{item.companyName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span>{item.country === 'Canada' ? '🇨🇦' : item.country === 'Sénégal' ? '🇸🇳' : item.country === 'Côte d’Ivoire' ? '🇨🇮' : '🇭🇹'}</span>
                          <span>{item.city}, {item.country}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-white">{item.managerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.email}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                          {item.sector}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${meta.bg} ${meta.text} ${meta.border}`}>
                          {meta.label}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${item.engagementScore}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] text-slate-300">{item.engagementScore}%</span>
                        </div>
                      </td>

                      <td className="p-3.5 text-[11px] text-slate-300">
                        {item.assignedReviewer}
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveCandidateModal(item)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition text-xs cursor-pointer"
                        >
                          Examiner
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CANDIDATE DOSSIER DETAILS & ACTIONS */}
      {activeCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0B1528] border border-slate-750 text-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
                  {activeCandidateModal.companyName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{activeCandidateModal.companyName}</h3>
                  <p className="text-xs text-slate-400">
                    Candidature # {activeCandidateModal.id} • {activeCandidateModal.city}, {activeCandidateModal.country}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCandidateModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Status Change Selector */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Statut Actuel de la Candidature
                  </span>
                  <div className="font-bold text-sm text-white mt-0.5">
                    {STATUS_LABELS[activeCandidateModal.status].label}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={activeCandidateModal.status}
                    onChange={e => {
                      const newStat = e.target.value as FoundingStatus;
                      onUpdateCandidate(activeCandidateModal.id, { status: newStat });
                      setActiveCandidateModal({ ...activeCandidateModal, status: newStat });
                      triggerToast(`Statut mis à jour : ${STATUS_LABELS[newStat].label}`);
                    }}
                    className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        Passer à : {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Company & Manager Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Responsable</span>
                  <div className="text-white font-bold">{activeCandidateModal.managerName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Courriel</span>
                  <div className="text-slate-300 font-mono">{activeCandidateModal.email}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Téléphone</span>
                  <div className="text-slate-300 font-mono">{activeCandidateModal.phone || 'Non renseigné'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Taille de l'entreprise</span>
                  <div className="text-slate-300">{activeCandidateModal.companySize}</div>
                </div>
              </div>

              {/* Activity Description */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Description de l'activité
                </span>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed">
                  {activeCandidateModal.activityDescription}
                </div>
              </div>

              {/* Motivation */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Motivation pour le programme pilote
                </span>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 leading-relaxed">
                  {activeCandidateModal.motivation}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Notes internes de la direction
                </span>
                <textarea
                  rows={2}
                  value={activeCandidateModal.internalNotes}
                  onChange={e => {
                    const val = e.target.value;
                    setActiveCandidateModal({ ...activeCandidateModal, internalNotes: val });
                  }}
                  onBlur={() => {
                    onUpdateCandidate(activeCandidateModal.id, { internalNotes: activeCandidateModal.internalNotes });
                    triggerToast('Notes internes sauvegardées.');
                  }}
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ajouter des observations confidentielles..."
                />
              </div>

              {/* Participation Agreement Toggle */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-xs">Accord de participation 3 mois</div>
                  <div className="text-[11px] text-slate-400">
                    Engagement à tester la plateforme et remonter les feedbacks hebdomadaires.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const toggled = !activeCandidateModal.participationAgreementSigned;
                    onUpdateCandidate(activeCandidateModal.id, { participationAgreementSigned: toggled });
                    setActiveCandidateModal({ ...activeCandidateModal, participationAgreementSigned: toggled });
                    triggerToast(toggled ? 'Accord de participation validé' : 'Accord annulé');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    activeCandidateModal.participationAgreementSigned
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {activeCandidateModal.participationAgreementSigned ? 'Accord Signé ✓' : 'Marquer comme Signé'}
                </button>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-900/60">
              <button
                type="button"
                onClick={() => setActiveCandidateModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NEW APPLICATION REGISTRATION FORM (PAGE 10 SPECIFICATIONS) */}
      {showNewApplicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0B1528] border border-slate-750 text-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  Formulaire de Candidature • STARTBILL FOUNDING 100
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewApplicationModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.companyName}
                    onChange={e => setNewForm({ ...newForm, companyName: e.target.value })}
                    placeholder="Ex: Atelier Mécanique Express"
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Nom du responsable *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.managerName}
                    onChange={e => setNewForm({ ...newForm, managerName: e.target.value })}
                    placeholder="Ex: Jean Tremblay"
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Courriel professionnel *
                  </label>
                  <input
                    type="email"
                    required
                    value={newForm.email}
                    onChange={e => setNewForm({ ...newForm, email: e.target.value })}
                    placeholder="contact@entreprise.com"
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Téléphone (avec indicatif)
                  </label>
                  <input
                    type="text"
                    value={newForm.phone}
                    onChange={e => setNewForm({ ...newForm, phone: e.target.value })}
                    placeholder="+1 (514) 000-0000"
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Pays *
                  </label>
                  <select
                    value={newForm.country}
                    onChange={e => setNewForm({ ...newForm, country: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Canada">🇨🇦 Canada (5 $ CAD/m)</option>
                    <option value="Sénégal">🇸🇳 Sénégal (500 FCFA/m)</option>
                    <option value="Côte d’Ivoire">🇨🇮 Côte d’Ivoire (500 FCFA/m)</option>
                    <option value="Haïti">🇭🇹 Haïti (50 HTG/m)</option>
                    <option value="Cameroun">🇨🇲 Cameroun</option>
                    <option value="RDC">🇨🇩 RDC</option>
                    <option value="Bénin">🇧🇯 Bénin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Ville *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.city}
                    onChange={e => setNewForm({ ...newForm, city: e.target.value })}
                    placeholder="Montréal, Dakar, Port-au-Prince..."
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Secteur d'activité
                  </label>
                  <input
                    type="text"
                    value={newForm.sector}
                    onChange={e => setNewForm({ ...newForm, sector: e.target.value })}
                    placeholder="Commerce, Santé, Services, Tech..."
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                    Taille de l'entreprise
                  </label>
                  <select
                    value={newForm.companySize}
                    onChange={e => setNewForm({ ...newForm, companySize: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Travailleur autonome (Solo)">Travailleur autonome (Solo)</option>
                    <option value="1-5 personnes">1-5 employés</option>
                    <option value="6-20 personnes">6-20 employés</option>
                    <option value="20+ personnes">20+ employés</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Description de l'activité
                </label>
                <textarea
                  rows={2}
                  value={newForm.activityDescription}
                  onChange={e => setNewForm({ ...newForm, activityDescription: e.target.value })}
                  placeholder="En quelques lignes, que produit ou vend l'entreprise..."
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Besoins de gestion prioritaires
                </label>
                <input
                  type="text"
                  value={newForm.managementNeeds}
                  onChange={e => setNewForm({ ...newForm, managementNeeds: e.target.value })}
                  placeholder="Facturation, conformité TPS/TVQ/TVA, gestion dépenses..."
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">
                  Motivation
                </label>
                <textarea
                  rows={2}
                  value={newForm.motivation}
                  onChange={e => setNewForm({ ...newForm, motivation: e.target.value })}
                  placeholder="Pourquoi rejoindre les 100 entreprises pilotes STARTBILL..."
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="accept-terms-f100"
                  checked={newForm.acceptTerms}
                  onChange={e => setNewForm({ ...newForm, acceptTerms: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 border-slate-700 bg-slate-900 cursor-pointer"
                />
                <label htmlFor="accept-terms-f100" className="text-[11px] text-slate-300 cursor-pointer">
                  Acceptation des conditions du programme pilote (3 mois de test gratuit, feedbacks réguliers)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewApplicationModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Soumettre la candidature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
