import React, { useState } from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import {
  BotIcon,
  SendIcon,
  SparklesIcon,
  ShieldIcon,
  CodeIcon,
} from '../common/Icons';

export const AIAssistantPanel: React.FC = () => {
  const { aiMessages, isAiTyping, sendAiQuery, activity } = useAssessment();
  const [inputText, setInputText] = useState('');

  const suggestedPrompts = [
    'How should an empty cart be handled?',
    'How can I avoid floating-point rounding errors?',
    'What edge cases should I test for cart totals?',
    'Review my current cart total implementation',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiTyping || activity !== 'active') return;
    sendAiQuery(inputText);
    setInputText('');
  };

  const handleChipClick = (prompt: string) => {
    if (isAiTyping || activity !== 'active') return;
    sendAiQuery(prompt);
  };

  return (
    <div className="flex h-full flex-col bg-[#080d16] text-slate-200">
      {/* Panel Header */}
      <div className="flex h-10 items-center justify-between border-b border-[#182338] bg-[#070b13] px-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-teal-500/10 text-[#00f2fe] border border-teal-500/30">
            <BotIcon size={14} />
          </div>
          <span className="text-xs font-semibold text-white">AI Copilot</span>
          <span className="rounded bg-[#122336] px-1.5 py-0.2 text-[10px] font-mono text-[#38bdf8] border border-[#1b3d5c]">
            Backend API
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
          <SparklesIcon size={12} className="text-[#00f2fe]" />
          <span>Telemetry Active</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] rounded-lg p-2.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#183152] text-white border border-[#2b4d79]'
                  : 'bg-[#0f1726] text-slate-200 border border-[#1e2e46]'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1 text-[10px] font-mono opacity-60">
                <span className="font-semibold">{msg.role === 'user' ? 'Candidate' : 'ProofLoop AI Copilot'}</span>
                <span>{msg.timestamp}</span>
              </div>

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.codeSnippet && (
                <div className="mt-2 rounded border border-[#263750] bg-[#060a12] p-2 font-mono text-[11px] text-teal-300 overflow-x-auto">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 border-b border-[#1b2a3f] pb-0.5">
                    <span className="flex items-center gap-1">
                      <CodeIcon size={10} /> Suggested Pattern
                    </span>
                  </div>
                  <pre>{msg.codeSnippet}</pre>
                </div>
              )}

              {msg.telemetry && (
                <div className="mt-1.5 flex items-center gap-3 pt-1 border-t border-[#1a273b] text-[10px] font-mono text-slate-400">
                  <span>Tokens: {msg.telemetry.tokens}</span>
                  <span>Latency: {msg.telemetry.executionTimeMs}ms</span>
                  <span>Confidence: {msg.telemetry.confidence}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isAiTyping && (
          <div className="flex items-center gap-2 rounded-lg bg-[#0f1726] p-2.5 text-xs text-slate-400 border border-[#1e2e46] w-fit">
            <span className="h-2 w-2 animate-ping rounded-full bg-[#00f2fe]" />
            <span className="font-mono text-[11px]">AI is generating contextual verification response...</span>
          </div>
        )}
      </div>

      {/* Suggested prompt chips */}
      <div className="border-t border-[#182338] bg-[#070b13] p-2">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
          <SparklesIcon size={11} className="text-teal-400" />
          <span>Quick Invariant Prompts:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(prompt)}
              disabled={isAiTyping || activity !== 'active'}
              className="rounded border border-[#1e2e46] bg-[#0d1627] px-2 py-1 text-[11px] text-slate-300 hover:border-[#00f2fe]/50 hover:text-white transition-colors text-left disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input query form */}
      <form onSubmit={handleSubmit} className="border-t border-[#182338] bg-[#090e18] p-2.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask the ProofLoop AI Coach about your solution..."
            disabled={isAiTyping || activity !== 'active'}
            className="flex-1 rounded-md border border-[#20314a] bg-[#05080f] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-[#00f2fe] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAiTyping || activity !== 'active'}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[#00f2fe] text-black hover:bg-[#38bdf8] disabled:opacity-40 transition-colors shrink-0"
            aria-label="Send Query"
          >
            <SendIcon size={14} />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <ShieldIcon size={10} className="text-teal-400" /> Provider mode is shown in the report
          </span>
          <span>Logged to Verification Timeline</span>
        </div>
      </form>
    </div>
  );
};
