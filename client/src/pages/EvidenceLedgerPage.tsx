import { Link } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';

export const EvidenceLedgerPage = () => {
  const { session, evidenceEvents, refreshArtifacts, error } = useAssessment();
  return (
    <div className="flex-1 bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#182338] pb-5">
        <div><span className="rounded bg-[#0d1f33] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#00f2fe]">EVIDENCE LEDGER</span>
          <h1 className="mt-2 text-2xl font-extrabold text-white">Server-recorded session events</h1>
          <p className="mt-1 text-xs text-slate-400">Session {session.sessionId || 'not started'} · {evidenceEvents.length} recorded events</p>
        </div>
        <button type="button" onClick={() => void refreshArtifacts()} className="rounded-lg border border-[#223552] bg-[#0e1728] px-3 py-2 text-xs text-slate-200">Refresh evidence</button>
      </div>
      {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
      {evidenceEvents.length === 0 ? <div className="mt-6 rounded-xl border border-[#1b283d] bg-[#090f1a] p-6 text-sm text-slate-400">No backend evidence is available for this session yet.</div> :
        <ol className="mt-6 space-y-3">
          {evidenceEvents.map((event) => <li key={event.eventId} className="rounded-xl border border-[#1b283d] bg-[#090f1a] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">{event.eventType.replaceAll('_', ' ')}</h2>
              <span className="font-mono text-[11px] text-slate-400">#{event.sequence} · {new Date(event.serverTimestamp).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">Actor: {event.actor} · Source: {event.source}</p>
            <p className="mt-1 text-[11px] text-slate-500">Event details are summarized in the report. Raw event payloads are not rendered here.</p>
          </li>)}</ol>}
      <div className="mt-6 flex gap-4 text-xs"><Link to="/timeline" className="text-[#00f2fe] underline">Open timeline</Link><Link to="/report" className="text-[#00f2fe] underline">Open report</Link></div>
    </div>
  );
};
