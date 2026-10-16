import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';

export const ReviewerReportPage = () => {
  const { session, report, refreshArtifacts, error } = useAssessment();
  useEffect(() => { void refreshArtifacts(); }, [refreshArtifacts]);
  const metric = (label: string, value: string | number) => <div className="rounded-xl border border-[#1c2b42] bg-[#09111e] p-4"><p className="text-[10px] uppercase font-bold text-[#38bdf8]">{label}</p><p className="mt-1 font-mono text-xl font-bold text-white">{value}</p></div>;
  return (
    <div className="flex-1 bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#182338] pb-5">
        <div><span className="rounded bg-[#0d1f33] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#00f2fe]">REVIEWER REPORT</span>
          <h1 className="mt-2 text-2xl font-extrabold text-white">Assessment evidence report</h1>
          <p className="mt-1 text-xs text-slate-400">Session {session.sessionId || 'not started'} · Candidate identity and hiring recommendation are not provided by this API.</p>
        </div>
        <div className="flex gap-3"><button onClick={() => window.print()} className="rounded-lg border border-[#223552] bg-[#0e1728] px-3 py-2 text-xs text-slate-200">Print</button><button onClick={() => void refreshArtifacts()} className="rounded-lg border border-[#223552] bg-[#0e1728] px-3 py-2 text-xs text-slate-200">Refresh</button></div>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
      {!report ? <div className="mt-6 rounded-xl border border-[#1b283d] bg-[#090f1a] p-6 text-sm text-slate-400">No backend report is available yet. Start an assessment to create a session.</div> : <>
        <section className="mt-6 rounded-2xl border border-[#1e2f4a] bg-[#0c1424] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold text-white">{session.assessmentTitle}</h2><span className="rounded border border-[#1b3a58] bg-[#0f2438] px-2 py-1 text-xs text-[#38bdf8]">{report.finalStatus}</span></div>
          <p className="mt-2 text-xs text-slate-400">Started {new Date(report.startedAt).toLocaleString()} · {report.durationSeconds === null ? 'In progress' : `Duration ${Math.floor(report.durationSeconds / 60)}m ${report.durationSeconds % 60}s`} · Task {report.taskVersion} · Rubric {report.rubricVersion}</p>
        </section>
        <section className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {metric('Final tests passed', report.correctness ? `${report.correctness.passed}/${report.correctness.totalTests}` : 'Insufficient evidence')}
          {metric('Correctness', report.correctness ? `${report.correctness.passPercentage}%` : '—')}
          {metric('Code runs', report.verificationBehavior.codeRunCount)}
          {metric('AI responses', report.aiCollaboration.aiResponseDeliveredCount)}
        </section>
        <section className="mt-5 rounded-2xl border border-[#1b283d] bg-[#090f1a] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#00f2fe]">Evidence-backed observations</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
            {(report.verificationBehavior.observations.length ? report.verificationBehavior.observations : ['Insufficient evidence: no verification observations recorded.']).map((item, index) => <li key={index}>{item}</li>)}
            <li>AI provider responses: mock {report.aiCollaboration.providerBreakdown.mock}, live {report.aiCollaboration.providerBreakdown.real}, controlled challenge {report.aiCollaboration.providerBreakdown.controlledChallenge}, unknown {report.aiCollaboration.providerBreakdown.unknown}.</li>
          </ul>
          <p className="mt-4 text-xs text-amber-300">{report._securityNotice}</p>
        </section>
        <section className="mt-5 rounded-2xl border border-[#1b283d] bg-[#090f1a] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Server event timeline</h2>
          {report.timeline.length === 0 ? <p className="mt-3 text-sm text-slate-400">No events recorded.</p> : <ol className="mt-3 space-y-3">{report.timeline.map((event) => <li key={event.sequence} className="border-l-2 border-[#1e5a68] pl-3"><div className="flex flex-wrap justify-between gap-2"><strong className="text-xs text-slate-200">{event.summary}</strong><span className="text-[10px] font-mono text-slate-500">#{event.sequence} · {new Date(event.serverTimestamp).toLocaleString()}</span></div><p className="text-[10px] text-slate-500">{event.eventType} · {event.source} · {event.actor}</p></li>)}</ol>}
        </section>
      </>}
      <div className="mt-6 flex gap-4 text-xs"><Link to="/assessment" className="text-[#00f2fe] underline">Return to assessment</Link><Link to="/evidence" className="text-[#00f2fe] underline">Evidence ledger</Link></div>
    </div>
  );
};
