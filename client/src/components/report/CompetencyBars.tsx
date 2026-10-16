import React from 'react';
import type { CompetencyMetric } from '../../types';

interface CompetencyBarsProps {
  competencies: CompetencyMetric[];
}

export const CompetencyBars: React.FC<CompetencyBarsProps> = ({ competencies }) => {
  return (
    <div className="space-y-3">
      {competencies.map((comp) => {
        const pct = (comp.score / comp.maxScore) * 100;
        return (
          <div
            key={comp.id}
            className="rounded-lg border border-[#DFD9CE] bg-white p-4 transition-all hover:border-[#CAC2B3] shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#736E64]">{comp.id}</span>
                <h4 className="text-sm font-bold text-[#191715]">{comp.name}</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-[#EAF4F1] px-2 py-0.5 text-[10px] font-mono font-bold text-[#0F3D34] border border-[#9DCFC4]">
                  {comp.level}
                </span>
                <div className="text-right">
                  <span className="font-mono text-base font-bold text-[#144A3F]">
                    {comp.score.toFixed(1)}
                  </span>
                  <span className="font-mono text-xs text-[#736E64]"> / {comp.maxScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Score Bar */}
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#EAE6DD]">
              <div
                className="h-full bg-[#144A3F] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-[#4A463F] leading-relaxed">{comp.summary}</p>

            {/* Signals */}
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {comp.signals.map((sig, i) => (
                <span
                  key={i}
                  className="rounded bg-[#FAF8F5] px-2 py-0.5 text-[10px] text-[#57524A] border border-[#DFD9CE]"
                >
                  • {sig}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
