import React from 'react';
import type { CompetencyMetric } from '../../types';

interface CompetencyBarsProps {
  competencies: CompetencyMetric[];
}

export const CompetencyBars: React.FC<CompetencyBarsProps> = ({ competencies }) => {
  return (
    <div className="space-y-4">
      {competencies.map((comp) => {
        const pct = (comp.score / comp.maxScore) * 100;
        return (
          <div
            key={comp.id}
            className="rounded-xl border border-[#1b283d] bg-[#090f1a] p-4 transition-all hover:border-[#273a56]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] text-slate-400">{comp.id}</span>
                <h4 className="text-sm font-bold text-white">{comp.name}</h4>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-[#122338] px-2 py-0.5 text-xs font-semibold text-[#38bdf8] border border-[#1d3d61]">
                  {comp.level}
                </span>
                <div className="text-right">
                  <span className="font-mono text-base font-bold text-[#00f2fe]">
                    {comp.score.toFixed(1)}
                  </span>
                  <span className="font-mono text-xs text-slate-400"> / {comp.maxScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Score Bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#121c2d]">
              <div
                className="h-full bg-gradient-to-r from-[#00f2fe] to-[#10b981] rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">{comp.summary}</p>

            {/* Signals */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {comp.signals.map((sig, i) => (
                <span
                  key={i}
                  className="rounded-md bg-[#0e1726] px-2 py-1 text-[11px] text-slate-300 border border-[#19273c]"
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
