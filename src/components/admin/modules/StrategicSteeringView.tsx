import React, { useState } from 'react';
import { StrategicObjective } from '../adminTypes';
import {
  Target,
  TrendingUp,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  X,
} from 'lucide-react';

interface StrategicSteeringViewProps {
  objectives: StrategicObjective[];
  onUpdateObjective: (id: string, updates: Partial<StrategicObjective>) => void;
  onAddObjective: (obj: StrategicObjective) => void;
  triggerToast: (msg: string) => void;
}

export const StrategicSteeringView: React.FC<StrategicSteeringViewProps> = ({
  objectives,
  onUpdateObjective,
  onAddObjective,
  triggerToast,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'croissance' | 'finance' | 'produit' | 'expansion' | 'qualite'>('croissance');
  const [newTarget, setNewTarget] = useState('100');
  const [newUnit, setNewUnit] = useState('entreprises');
  const [newDeadline, setNewDeadline] = useState('2026-12-31');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: StrategicObjective = {
      id: `obj-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      targetValue: parseFloat(newTarget) || 100,
      currentValue: 0,
      unit: newUnit,
      deadline: newDeadline,
      owner: 'Ferline ZOGNI (CEO)',
      progressPercent: 0,
      status: 'on_track',
      notes: 'Nouvel objectif stratégique défini par la direction.',
    };

    onAddObjective(created);
    setShowAddModal(false);
    setNewTitle('');
    triggerToast('Objectif stratégique ajouté au plan de direction.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              MODULE 02 • PILOTAGE STRATÉGIQUE
            </span>
            <span className="text-xs text-slate-400">Objectifs annuels & KPIs clés</span>
          </div>
          <h2 className="text-xl font-black text-white">Centre de Gestion des Objectifs & Priorités CEO</h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Suivi des priorités stratégiques de Ferline ZOGNI, alignement budgétaire et analyse de rentabilité (LTV / CAC / Runway).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-blue-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Créer un objectif</span>
        </button>
      </div>

      {/* Strategic KPIs (CAC, LTV, Ratio, Runway) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Coût d'Acquisition (CAC)</div>
          <div className="text-2xl font-black text-white">142 $ CAD</div>
          <div className="text-[11px] text-emerald-400 font-semibold">-12% grâce au bouche-à-oreille</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Valeur Vie Client (LTV)</div>
          <div className="text-2xl font-black text-white">1 850 $ CAD</div>
          <div className="text-[11px] text-blue-400 font-semibold">Basé sur 38 mois de rétention moy.</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Ratio LTV / CAC</div>
          <div className="text-2xl font-black text-emerald-400">13.0x</div>
          <div className="text-[11px] text-slate-300 font-semibold">Excellente rentabilité unitaire</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0B1528] border border-slate-800 space-y-1">
          <div className="text-[10px] uppercase font-bold text-slate-400">Piste de Trésorerie (Runway)</div>
          <div className="text-2xl font-black text-amber-400">18 mois</div>
          <div className="text-[11px] text-slate-400">Autofinancement sain</div>
        </div>
      </div>

      {/* Objectives List */}
      <div className="bg-[#0B1528] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-400" />
            <span>Feuille de Route des Objectifs de Direction</span>
          </h3>
          <span className="text-xs text-slate-400">{objectives.length} objectifs suivis</span>
        </div>

        <div className="space-y-3">
          {objectives.map(obj => (
            <div
              key={obj.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-750 space-y-3 hover:border-slate-600 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-blue-500/20 text-blue-300">
                      {obj.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Échéance : {obj.deadline}</span>
                    </span>
                    <span className="text-xs text-slate-400">• Resp. : {obj.owner}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-1">{obj.title}</h4>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-sm font-black text-white">
                    {obj.currentValue} / {obj.targetValue} {obj.unit}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400">
                    {obj.progressPercent}% réalisé
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, obj.progressPercent)}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-300 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                {obj.notes}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Objective Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0B1528] border border-slate-750 text-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Nouvel Objectif Stratégique</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Titre de l'objectif *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="Ex: Passer le seuil de 50 000 $ CAD de MRR"
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Catégorie</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="croissance">Croissance</option>
                    <option value="finance">Finance & MRR</option>
                    <option value="produit">Produit & Tech</option>
                    <option value="expansion">Expansion</option>
                    <option value="qualite">Qualité & Conformité</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Échéance cible</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Valeur Cible</label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Unité</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={e => setNewUnit(e.target.value)}
                    placeholder="entreprises, $ CAD, %..."
                    className="w-full bg-slate-900 border border-slate-750 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer"
                >
                  Ajouter l'objectif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
