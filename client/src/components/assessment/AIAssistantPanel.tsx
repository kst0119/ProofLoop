import React, { useState } from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import {
  BotIcon,
  SendIcon,
  SparklesIcon,
  CodeIcon,
} from '../common/Icons';

export const AIAssistantPanel: React.FC = () => {
  const { aiMessages, isAiTyping, sendAiQuery } = useAssessment();
  const [inputText, setInputText] = useState('');

  const suggestedPrompts = [
    'How to distinguish explicit boolean false vs undefined?',
    'Recursion logic for nested objects without destroying sibling keys',
    'How to sanitize against __proto__ prototype pollution?',
    'Generate test case for partial patch of nested settings',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiTyping) return;
    sendAiQuery(inputText);
    setInputText('');
  };

  const handleChipClick = (prompt: string) => {
    if (isAiTyping) return;
    sendAiQuery(prompt);
  };

  return (
    <div className="flex h-full flex-col bg-surface text-primary">
      {/* Panel Header */}
      <div className="flex h-10 items-center justify-between border-b border-default bg-base px-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-[#EAF4F1] dark:bg-[#133026] text-brand border border-[#9DCFC4] dark:border-[#225542]">
            <BotIcon size={13} />
          </div>
          <span className="text-xs font-bold text-primary">ProofLoop AI Copilot</span>
          <span className="rounded bg-surface px-1.5 py-0.2 text-[9px] font-mono font-semibold text-brand border border-default">
            SANDBOXED
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-muted font-mono">
          <SparklesIcon size={12} className="text-brand" />
          <span>Telemetry Active</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-base">
        {aiMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[92%] rounded-lg p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-surface text-primary border border-default shadow-2xs'
              }`}
            >
              <div
                className={`flex items-center justify-between gap-3 mb-1 text-[10px] font-mono ${
                  msg.role === 'user' ? 'text-white/80' : 'text-muted'
                }`}
              >
                <span className="font-bold">
                  {msg.role === 'user' ? 'Candidate' : 'ProofLoop Copilot'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.codeSnippet && (
                <div className="mt-2.5 rounded border border-[#272C33] bg-[#14171A] p-2.5 font-mono text-[11px] text-[#81C784] overflow-x-auto">
                  <div className="flex items-center justify-between text-[10px] text-[#9E988C] mb-1 border-b border-[#272C33] pb-1">
                    <span className="flex items-center gap-1 font-bold">
                      <CodeIcon size={10} /> Suggested Pattern (Verify Invariants)
                    </span>
                  </div>
                  <pre>{msg.codeSnippet}</pre>
                </div>
              )}

              {msg.telemetry && (
                <div
                  className={`mt-2 flex items-center gap-3 pt-1 border-t text-[10px] font-mono ${
                    msg.role === 'user'
                      ? 'border-white/20 text-white/70'
                      : 'border-default text-muted'
                  }`}
                >
                  <span>Tokens: {msg.telemetry.tokens}</span>
                  <span>Latency: {msg.telemetry.executionTimeMs}ms</span>
                  <span>Confidence: {msg.telemetry.confidence}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isAiTyping && (
          <div className="flex items-center gap-2 rounded-lg bg-surface p-2.5 text-xs text-secondary border border-default w-fit shadow-2xs">
            <span className="h-2 w-2 animate-ping rounded-full bg-brand" />
            <span className="font-mono text-[11px]">Synthesizing telemetry response...</span>
          </div>
        )}
      </div>

      {/* Suggested Invariant Prompt Chips */}
      <div className="border-t border-default bg-surface px-3 py-2">
        <span className="text-[10px] font-mono font-bold uppercase text-muted block mb-1.5">
          Engineering Invariant Queries:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(p)}
              disabled={isAiTyping}
              className="rounded border border-default bg-base px-2 py-0.5 text-[10px] text-secondary hover:border-brand hover:text-primary transition-colors disabled:opacity-50 text-left"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <form onSubmit={handleSubmit} className="border-t border-default bg-surface p-3">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isAiTyping}
            placeholder="Ask AI Copilot for invariant analysis or edge cases..."
            className="w-full rounded-md border border-default bg-base px-3 py-2 pr-10 text-xs text-primary placeholder-muted focus:border-brand focus:bg-surface focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isAiTyping}
            className="absolute right-1.5 flex h-7 w-7 items-center justify-center rounded bg-brand text-white hover:opacity-90 disabled:opacity-40 transition-colors"
            aria-label="Send message to AI Copilot"
          >
            <SendIcon size={12} />
          </button>
        </div>
      </form>
    </div>
  );
};
