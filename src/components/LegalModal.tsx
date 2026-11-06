import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  Download,
  Printer,
  Search,
  ExternalLink,
  Building,
  Mail,
  MapPin,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import {
  LEGAL_DOCUMENTS,
  LEGAL_COMPANY_INFO,
  LegalDocument
} from '../data/legalDocuments';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDocId?: string;
  triggerToast?: (msg: string) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialDocId = 'politique-confidentialite',
  triggerToast
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  // Sync initialDocId when opened
  React.useEffect(() => {
    if (initialDocId) {
      setSelectedDocId(initialDocId);
    }
  }, [initialDocId, isOpen]);

  // Keyboard escape listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeDoc: LegalDocument = useMemo(() => {
    return LEGAL_DOCUMENTS.find(d => d.id === selectedDocId) || LEGAL_DOCUMENTS[0];
  }, [selectedDocId]);

  const filteredDocs = useMemo(() => {
    return LEGAL_DOCUMENTS.filter(doc => {
      const matchesCategory =
        selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        doc.sections.some(s =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.content.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.origin + '#legal?doc=' + activeDoc.id);
      setCopied(true);
      if (triggerToast) {
        triggerToast('Lien du document copié dans le presse-papier !');
      }
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[900px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded-full">
                  Centre Juridique & RGPD
                </span>
                <span className="hidden sm:inline-block text-xs text-slate-400">
                  Version officielle du {activeDoc.versionDate}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {LEGAL_COMPANY_INFO.name} — Documentation Conforme RGPD & Loi 25
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={activeDoc.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-750"
              title="Télécharger le PDF original"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>PDF Officiel</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Fermer (Échap)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subheader / Search & Categories Bar */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Categories Pill Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tous les documents ({LEGAL_DOCUMENTS.length})
            </button>
            <button
              onClick={() => setSelectedCategory('rgpd_privacy')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'rgpd_privacy'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Protection des Données & RGPD (4)
            </button>
            <button
              onClick={() => setSelectedCategory('terms_contracts')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'terms_contracts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Conditions & Contrats (5)
            </button>
            <button
              onClick={() => setSelectedCategory('security_compliance')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'security_compliance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Sécurité & Gouvernance (4)
            </button>
          </div>

          {/* Quick Search Field */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un document ou article..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area (Sidebar List + Document Reader) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Document Selector Sidebar */}
          <div className="w-full sm:w-80 md:w-88 border-r border-slate-200 bg-slate-50/70 overflow-y-auto shrink-0 divide-y divide-slate-100">
            {filteredDocs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Aucun document ne correspond à votre recherche.
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = doc.id === activeDoc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left p-3.5 transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50/90 border-l-4 border-blue-600 text-blue-900 shadow-xs'
                        : 'hover:bg-slate-100/80 text-slate-700'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            doc.category === 'rgpd_privacy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.category === 'terms_contracts'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {doc.docNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {doc.categoryLabel}
                        </span>
                      </div>
                      <h4
                        className={`text-xs font-bold truncate ${
                          isSelected ? 'text-blue-950 font-extrabold' : 'text-slate-800'
                        }`}
                      >
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                        {doc.summary}
                      </p>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 mt-2 shrink-0 ${
                        isSelected ? 'text-blue-600' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })
            )}

            {/* Permanent Legal Info Card in Sidebar */}
            <div className="p-4 bg-slate-100/90 m-3 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <Building className="w-4 h-4 text-blue-600" />
                <span>{LEGAL_COMPANY_INFO.name}</span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>{LEGAL_COMPANY_INFO.headquarters}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${LEGAL_COMPANY_INFO.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {LEGAL_COMPANY_INFO.email}
                  </a>
                </div>
                <div className="pt-1 text-[10px] text-slate-500 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">DPO désigné : </span>
                  {LEGAL_COMPANY_INFO.dpoName}
                </div>
              </div>
            </div>
          </div>

          {/* Document Content Reader */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 bg-white">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Document Banner */}
              <div className="border-b border-slate-200 pb-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg">
                    {activeDoc.docNumber}
                  </span>
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg">
                    {activeDoc.categoryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                    <CheckCircle2 className="w-3 h-3" />
                    Conforme RGPD & Loi 25
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {activeDoc.title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  {activeDoc.summary}
                </p>

                {/* Actions Row */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <a
                    href={activeDoc.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger PDF original
                  </a>

                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimer
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {copied ? 'Lien copié !' : 'Partager le lien'}
                  </button>
                </div>
              </div>

              {/* Sections Display */}
              <div className="space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
                {activeDoc.sections.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-4 sm:p-5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5"
                  >
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      {section.title}
                    </h3>
                    <div className="space-y-2 text-slate-700">
                      {section.content.map((p, pIdx) => (
                        <p key={pIdx} className="leading-relaxed">
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* DPO & Contact Notice Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Délégué à la Protection des Données (DPO) & Exercice de vos droits</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Conformément au RGPD et à la Loi 25 québécoise, vous disposez d’un droit permanent d’accès, de rectification, de suppression et de portabilité de vos données. Pour exercer vos droits ou pour toute question relative à ce document, vous pouvez vous adresser directement à notre responsable :
                </p>
                <div className="flex flex-wrap items-center gap-4 text-slate-700 font-medium text-[11px] pt-1">
                  <span><strong>Nom :</strong> {LEGAL_COMPANY_INFO.dpoName}</span>
                  <span><strong>Courriel :</strong> <a href={`mailto:${LEGAL_COMPANY_INFO.email}`} className="text-blue-600 hover:underline">{LEGAL_COMPANY_INFO.email}</a></span>
                  <span><strong>Siège :</strong> {LEGAL_COMPANY_INFO.headquarters}</span>
                </div>
              </div>

              {/* End of Document Stamp */}
              <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
                <p>STARTBILL INC. • Société fédérale n° {LEGAL_COMPANY_INFO.federalNumber} • Document officiel déposé</p>
                <p className="mt-1 text-[11px]">Dernière révision : {activeDoc.versionDate}</p>
              </div>

            </div>
          </div>

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2 text-slate-600">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Données hébergées en conformité avec les normes internationales de sécurité.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
          >
            Fermer le lecteur
          </button>
        </div>

      </div>
    </div>
  );
};

export default LegalModal;
