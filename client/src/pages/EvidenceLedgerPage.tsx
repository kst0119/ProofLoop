import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { EvidenceDrawer } from '../components/evidence/EvidenceDrawer';
import type { EvidenceItem, CompetencyMetric } from '../types';
import {
  SearchIcon,
  FilterIcon,
  FileTextIcon,
} from '../components/common/Icons';

export const EvidenceLedgerPage = () => {
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('id');

  const {
    session,
    evidenceItems,
    competencies,
    selectedEvidenceId,
    setSelectedEvidenceId,
  } = useAssessment();

  const [activeItemForModal, setActiveItemForModal] = useState<EvidenceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompetency, setSelectedCompetency] = useState<string>('ALL');
  const [selectedConfidence, setSelectedConfidence] = useState<string>('ALL');
  const [selectedNature, setSelectedNature] = useState<string>('ALL');

  useEffect(() => {
    if (queryId) {
      setSelectedEvidenceId(queryId);
      const found = evidenceItems.find((e: EvidenceItem) => e.id === queryId);
      if (found) setActiveItemForModal(found);
    }
  }, [queryId, evidenceItems, setSelectedEvidenceId]);

  const filteredItems = evidenceItems.filter((item: EvidenceItem) => {
    if (selectedCompetency !== 'ALL' && item.competencyId !== selectedCompetency) return false;
    if (selectedConfidence !== 'ALL' && item.confidence !== selectedConfidence) return false;
    if (selectedNature !== 'ALL' && item.nature !== selectedNature) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchObserved = item.observedBehavior.toLowerCase().includes(q);
      const matchInterp = item.interpretation.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      if (!matchTitle && !matchObserved && !matchInterp && !matchId) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#182338] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#0d1f33] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#00f2fe] border border-[#143e63]">
              EVIDENCE LEDGER
            </span>
            <span className="font-mono text-xs text-slate-400">
              Session {session.sessionId} • {evidenceItems.length} Records Compiled
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
            Inspectable Competency Evidence Ledger
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Corroborated proof points connecting observed telemetry to evaluation rubrics. Every finding explicitly differentiates direct telemetry logs from evaluator conclusions.
          </p>
        </div>

        {/* Action Link to Reviewer Report */}
        <div className="flex items-center gap-3">
          <Link
            to="/report"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#10b981] px-4 py-2 text-xs font-bold text-black shadow-md hover:opacity-95 transition-all"
          >
            <FileTextIcon size={14} />
            <span>Generate Reviewer Report</span>
          </Link>
        </div>
      </div>

      {/* Competency Summary Ribbon */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {competencies.map((comp: CompetencyMetric) => (
          <div
            key={comp.id}
            onClick={() => setSelectedCompetency(selectedCompetency === comp.id ? 'ALL' : comp.id)}
            className={`rounded-xl border p-3 cursor-pointer transition-all ${
              selectedCompetency === comp.id
                ? 'border-[#00f2fe] bg-[#0f1d30]'
                : 'border-[#1a283e] bg-[#090f1a] hover:border-[#273d5e]'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{comp.id}</span>
              <span className="font-bold text-[#00f2fe]">{comp.score.toFixed(1)} / 5.0</span>
            </div>
            <h4 className="mt-1 text-xs font-bold text-white line-clamp-1">{comp.name}</h4>
            <span className="mt-1.5 inline-block text-[10px] text-emerald-400 font-medium">
              {comp.level}
            </span>
          </div>
        ))}
      </div>

      {/* Filter and Search Ribbon */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#19273c] bg-[#080d17] p-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <SearchIcon size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Evidence ID (EV-102), observed behavior, or finding keywords..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Competency Filter */}
          <div className="flex items-center gap-1.5 bg-[#0e1726] border border-[#1d2b42] px-2.5 py-1 rounded-lg">
            <FilterIcon size={12} className="text-[#00f2fe]" />
            <select
              value={selectedCompetency}
              onChange={(e) => setSelectedCompetency(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none border-none p-0 cursor-pointer"
            >
              <option value="ALL" className="bg-[#0f1726]">All Competencies</option>
              {competencies.map((c: CompetencyMetric) => (
                <option key={c.id} value={c.id} className="bg-[#0f1726]">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Confidence Filter */}
          <div className="flex items-center gap-1.5 bg-[#0e1726] border border-[#1d2b42] px-2.5 py-1 rounded-lg">
            <select
              value={selectedConfidence}
              onChange={(e) => setSelectedConfidence(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none border-none p-0 cursor-pointer"
            >
              <option value="ALL" className="bg-[#0f1726]">All Confidence Levels</option>
              <option value="CORROBORATED_FACT" className="bg-[#0f1726]">Corroborated Fact</option>
              <option value="HIGH_CONFIDENCE" className="bg-[#0f1726]">High Confidence</option>
              <option value="MEDIUM_CONFIDENCE" className="bg-[#0f1726]">Medium Confidence</option>
              <option value="INFERRED_INTERPRETATION" className="bg-[#0f1726]">Inferred Interpretation</option>
            </select>
          </div>

          {/* Nature Filter */}
          <div className="flex items-center gap-1.5 bg-[#0e1726] border border-[#1d2b42] px-2.5 py-1 rounded-lg">
            <select
              value={selectedNature}
              onChange={(e) => setSelectedNature(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none border-none p-0 cursor-pointer"
            >
              <option value="ALL" className="bg-[#0f1726]">All Evidence Types</option>
              <option value="OBSERVED_EVENT" className="bg-[#0f1726]">Observed Telemetry</option>
              <option value="SYNTHESIZED_FINDING" className="bg-[#0f1726]">Synthesized Finding</option>
              <option value="COUNTER_EVIDENCE" className="bg-[#0f1726]">Counter-Evidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evidence Cards Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-[#1b273d] bg-[#090f1b] p-12 text-center text-slate-400">
            <p className="text-sm">No evidence items match your active filters.</p>
            <button
              onClick={() => {
                setSelectedCompetency('ALL');
                setSelectedConfidence('ALL');
                setSelectedNature('ALL');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-[#00f2fe] underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredItems.map((item: EvidenceItem) => (
            <EvidenceCard
              key={item.id}
              item={item}
              isSelected={item.id === selectedEvidenceId}
              onSelect={() => {
                setSelectedEvidenceId(item.id);
                setActiveItemForModal(item);
              }}
            />
          ))
        )}
      </div>

      {/* Inspector Drawer Modal */}
      <EvidenceDrawer
        item={activeItemForModal}
        onClose={() => setActiveItemForModal(null)}
      />
    </div>
  );
};
