import React, { useState, useMemo } from 'react';
import {
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
  ArrowLeft,
  Scale
} from 'lucide-react';
import { ScreenId } from '../types';
import {
  LEGAL_DOCUMENTS,
  LEGAL_COMPANY_INFO,
  LegalDocument
} from '../data/legalDocuments';

interface LegalPageProps {
  setScreen: (screen: ScreenId) => void;
  triggerToast?: (msg: string) => void;
  initialDocId?: string;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  setScreen,
  triggerToast,
  initialDocId = 'politique-confidentialite'
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

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
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in">
      
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setScreen('dashboard')}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            title="Retour au tableau de bord"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                Centre Juridique & RGPD
              </span>
              <span className="text-xs text-slate-400">
                14 documents certifiés
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
              Dossier Juridique & Conformité Réglementaire
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <a
            href={LEGAL_COMPANY_INFO.privacyPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Confidentialité PDF</span>
          </a>
          <a
            href={LEGAL_COMPANY_INFO.dossierPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>13 Documents PDF</span>
          </a>
        </div>
      </div>

      {/* Main Container with Sidebar + Reader */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col lg:flex-row min-h-[700px]">
        
        {/* Left Sidebar: Search & Doc List */}
        <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 flex flex-col shrink-0">
          
          {/* Search Box */}
          <div className="p-4 border-b border-slate-200 space-y-3 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un document ou article..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400"
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

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 text-[11px] font-semibold">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tous ({LEGAL_DOCUMENTS.length})
              </button>
              <button
                onClick={() => setSelectedCategory('rgpd_privacy')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedCategory === 'rgpd_privacy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                RGPD & Données
              </button>
              <button
                onClick={() => setSelectedCategory('terms_contracts')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedCategory === 'terms_contracts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Conditions & Vente
              </button>
              <button
                onClick={() => setSelectedCategory('security_compliance')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  selectedCategory === 'security_compliance'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Sécurité
              </button>
            </div>
          </div>

          {/* Documents Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[600px] lg:max-h-none">
            {filteredDocs.map((doc) => {
              const isSelected = doc.id === activeDoc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-3.5 transition flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 border-l-4 border-blue-600 text-blue-900'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200/80 text-slate-700">
                        {doc.docNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {doc.categoryLabel}
                      </span>
                    </div>
                    <h4 className={`text-xs font-bold truncate ${
                      isSelected ? 'text-blue-950 font-extrabold' : 'text-slate-800'
                    }`}>
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                      {doc.summary}
                    </p>
                  </div>

                  <ChevronRight className={`w-4 h-4 mt-2 shrink-0 ${
                    isSelected ? 'text-blue-600' : 'text-slate-300'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Company Registry Info Footer in Sidebar */}
          <div className="p-4 bg-slate-100/90 border-t border-slate-200 text-xs space-y-2 m-3 rounded-xl">
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
                <a href={`mailto:${LEGAL_COMPANY_INFO.email}`} className="text-blue-600 hover:underline">
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

        {/* Right Reader Area */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Header Document */}
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

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {activeDoc.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {activeDoc.summary}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                <a
                  href={activeDoc.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger le PDF original
                </a>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer
                </button>

                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {copied ? 'Lien copié !' : 'Partager le lien'}
                </button>
              </div>
            </div>

            {/* Sections Content */}
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

            {/* DPO Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Délégué à la Protection des Données (DPO) & Droits des personnes</span>
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

            {/* Footer stamp */}
            <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
              <p>STARTBILL INC. • Société fédérale n° {LEGAL_COMPANY_INFO.federalNumber} • Document officiel déposé</p>
              <p className="mt-1 text-[11px]">Dernière révision : {activeDoc.versionDate}</p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default LegalPage;
