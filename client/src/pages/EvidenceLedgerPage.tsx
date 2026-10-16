import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { EvidenceDrawer } from '../components/evidence/EvidenceDrawer';
import type { EvidenceItem, CompetencyMetric } from '../types';
import {
  SearchIcon,
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
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

  const getNatureBadge = (nature: EvidenceItem['nature']) => {
    switch (nature) {
      case 'OBSERVED_EVENT':
        return <span className="rounded bg-[#EAF4F1] px-2 py-0.5 text-[9px] font-mono font-bold text-[#144A3F] border border-[#9DCFC4]">Observed Telemetry</span>;
      case 'SYNTHESIZED_FINDING':
        return <span className="rounded bg-[#F2EFE9] px-2 py-0.5 text-[9px] font-mono font-bold text-[#57524A] border border-[#DFD9CE]">Synthesized Finding</span>;
      case 'COUNTER_EVIDENCE':
        return <span className="rounded bg-[#FDF1F1] px-2 py-0.5 text-[9px] font-mono font-bold text-[#A82424] border border-[#F7B5B5]">Counter Evidence</span>;
    }
  };

  const getConfidenceBadge = (confidence: EvidenceItem['confidence']) => {
    switch (confidence) {
      case 'CORROBORATED_FACT':
        return <span className="rounded bg-[#EDF7F2] px-2 py-0.5 text-[9px] font-mono font-bold text-[#126646] border border-[#A3DBC4]">Corroborated Fact</span>;
      case 'HIGH_CONFIDENCE':
        return <span className="rounded bg-[#EAF4F1] px-2 py-0.5 text-[9px] font-mono font-bold text-[#144A3F] border border-[#9DCFC4]">High Confidence</span>;
      case 'MEDIUM_CONFIDENCE':
        return <span className="rounded bg-[#FEF6EC] px-2 py-0.5 text-[9px] font-mono font-bold text-[#A1520C] border border-[#F6CE9F]">Medium Confidence</span>;
      case 'INFERRED_INTERPRETATION':
        return <span className="rounded bg-[#F4F1EA] px-2 py-0.5 text-[9px] font-mono font-bold text-[#736E64] border border-[#DFD9CE]">Inferred</span>;
    }
  };

  return (
    <div className="flex-1 bg-[#F8F6F0] text-[#191715] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Editorial Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DFD9CE] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#EAF4F1] px-2.5 py-0.5 text-xs font-mono font-bold text-[#0F3D34] border border-[#9DCFC4]">
              EVIDENCE LEDGER
            </span>
            <span className="font-mono text-xs text-[#736E64]">
              Session {session.sessionId} • {evidenceItems.length} Records Compiled
            </span>
          </div>
          <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#191715]">
            Inspectable Competency Evidence Ledger
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#57524A] max-w-2xl leading-relaxed">
            Corroborated proof points connecting observed telemetry to evaluation rubrics. Every finding explicitly differentiates direct telemetry logs from evaluator conclusions.
          </p>
        </div>

        {/* Action Link to Reviewer Report */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/report"
            className="btn-primary text-xs"
          >
            <FileTextIcon size={13} />
            <span>Reviewer Report</span>
          </Link>
        </div>
      </div>

      {/* Competency Summary Ribbon */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {competencies.map((comp: CompetencyMetric) => {
          const isSelected = selectedCompetency === comp.id;
          return (
            <div
              key={comp.id}
              onClick={() => setSelectedCompetency(isSelected ? 'ALL' : comp.id)}
              className={`rounded-lg border p-3 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#144A3F] bg-white shadow-md ring-1 ring-[#144A3F]/20'
                  : 'border-[#DFD9CE] bg-white hover:border-[#CAC2B3] hover:shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-[#736E64]">
                <span>{comp.id}</span>
                <span className="font-bold text-[#144A3F]">{comp.score.toFixed(1)} / 5.0</span>
              </div>
              <h4 className="mt-1 text-xs font-bold text-[#191715] line-clamp-1">{comp.name}</h4>
              <div className="mt-1.5 flex items-center justify-between text-[10px]">
                <span className="text-[#126646] font-semibold">{comp.level}</span>
                <span className="font-mono text-[#736E64]">{comp.evidenceItemsCount} Proofs</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search, Filter & View Mode Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#736E64]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Evidence ID (EVD-101), competency, keywords..."
              className="w-full rounded-md border border-[#DFD9CE] bg-white pl-9 pr-3 py-1.5 text-xs text-[#191715] placeholder-[#736E64] focus:border-[#144A3F] focus:outline-none"
            />
          </div>

          {/* Competency filter */}
          <select
            value={selectedCompetency}
            onChange={(e) => setSelectedCompetency(e.target.value)}
            className="rounded-md border border-[#DFD9CE] bg-white px-3 py-1.5 text-xs text-[#191715] focus:border-[#144A3F] focus:outline-none"
          >
            <option value="ALL">All Competencies</option>
            {competencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Nature filter */}
          <select
            value={selectedNature}
            onChange={(e) => setSelectedNature(e.target.value)}
            className="rounded-md border border-[#DFD9CE] bg-white px-3 py-1.5 text-xs text-[#191715] focus:border-[#144A3F] focus:outline-none"
          >
            <option value="ALL">All Natures</option>
            <option value="OBSERVED_EVENT">Observed Telemetry</option>
            <option value="SYNTHESIZED_FINDING">Synthesized Findings</option>
            <option value="COUNTER_EVIDENCE">Counter Evidence</option>
          </select>

          {/* Confidence filter */}
          <select
            value={selectedConfidence}
            onChange={(e) => setSelectedConfidence(e.target.value)}
            className="rounded-md border border-[#DFD9CE] bg-white px-3 py-1.5 text-xs text-[#191715] focus:border-[#144A3F] focus:outline-none"
          >
            <option value="ALL">All Confidence Grades</option>
            <option value="CORROBORATED_FACT">Corroborated Fact</option>
            <option value="HIGH_CONFIDENCE">High Confidence</option>
            <option value="MEDIUM_CONFIDENCE">Medium Confidence</option>
            <option value="INFERRED_INTERPRETATION">Inferred</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-md border border-[#DFD9CE] bg-white p-0.5 text-xs font-semibold shadow-2xs">
          <button
            onClick={() => setViewMode('table')}
            className={`rounded px-3 py-1 transition-colors ${
              viewMode === 'table'
                ? 'bg-[#144A3F] text-white shadow-xs'
                : 'text-[#57524A] hover:text-[#191715]'
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`rounded px-3 py-1 transition-colors ${
              viewMode === 'cards'
                ? 'bg-[#144A3F] text-white shadow-xs'
                : 'text-[#57524A] hover:text-[#191715]'
            }`}
          >
            Card View
          </button>
        </div>
      </div>

      {/* Main Ledger Content: Structured Table or Cards */}
      <div className="mt-6">
        {viewMode === 'table' ? (
          <div className="rounded-xl border border-[#DFD9CE] bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#DFD9CE] bg-[#F4F1EA] text-[#191715] font-semibold">
                    <th className="p-3 font-mono text-[11px] w-24">ID</th>
                    <th className="p-3 w-48">Competency</th>
                    <th className="p-3 w-36">Nature & Grade</th>
                    <th className="p-3">Observed Behavior & Interpretation</th>
                    <th className="p-3 font-mono text-center w-20">Weight</th>
                    <th className="p-3 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6DD]">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setActiveItemForModal(item)}
                      className="hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-mono font-bold text-[#144A3F] align-top">
                        {item.id}
                      </td>
                      <td className="p-3 align-top">
                        <span className="font-bold text-[#191715] block">{item.competencyName}</span>
                        <span className="text-[10px] text-[#736E64] font-mono">{item.timestamp}</span>
                      </td>
                      <td className="p-3 align-top space-y-1">
                        <div>{getNatureBadge(item.nature)}</div>
                        <div>{getConfidenceBadge(item.confidence)}</div>
                      </td>
                      <td className="p-3 align-top">
                        <p className="font-semibold text-[#191715]">{item.title}</p>
                        <p className="mt-1 text-[11px] text-[#57524A] line-clamp-2 leading-relaxed">
                          {item.observedBehavior}
                        </p>
                      </td>
                      <td className="p-3 font-mono font-bold text-center text-[#144A3F] align-top">
                        {item.coverageWeight}%
                      </td>
                      <td className="p-3 text-right align-top space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveItemForModal(item)}
                          className="btn-secondary text-[11px] py-1 px-2.5 min-h-0"
                        >
                          Inspect
                        </button>
                        {item.relatedTimelineEventIds[0] && (
                          <Link
                            to={`/verification?event=${item.relatedTimelineEventIds[0]}`}
                            className="rounded bg-base px-2 py-1 text-[10px] font-mono font-bold text-brand hover:bg-elevated transition-colors inline-block"
                            title="Jump to verification loop event"
                          >
                            Loop →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredItems.length === 0 && (
              <div className="p-8 text-center text-xs text-[#736E64]">
                No evidence records match the selected filters.
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <EvidenceCard
                key={item.id}
                item={item}
                isSelected={selectedEvidenceId === item.id}
                onSelect={() => setActiveItemForModal(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Inspection Modal */}
      {activeItemForModal && (
        <EvidenceDrawer
          item={activeItemForModal}
          onClose={() => setActiveItemForModal(null)}
        />
      )}
    </div>
  );
};
