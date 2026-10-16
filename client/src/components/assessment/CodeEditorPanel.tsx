import React, { useState, useRef } from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import {
  CodeIcon,
  RefreshCwIcon,
  CheckIcon,
  FileTextIcon,
} from '../common/Icons';

export const CodeEditorPanel: React.FC = () => {
  const {
    codeFiles,
    activeFileId,
    setActiveFileId,
    updateCode,
    resetCode,
  } = useAssessment();

  const [copied, setCopied] = useState(false);
  const activeFile = codeFiles.find((f) => f.id === activeFileId) || codeFiles[0];

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const lines = activeFile.content.split('\n');
  const lineCount = lines.length;
  const charCount = activeFile.content.length;

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = activeFile.content;

      // Insert 2 spaces
      const newVal = val.substring(0, start) + '  ' + val.substring(end);
      updateCode(activeFile.id, newVal);

      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    } else if (e.key === 'Enter') {
      // Auto-indent: preserve leading spaces from current line
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const currentLine = activeFile.content.substring(0, start).split('\n').pop() || '';
      const match = currentLine.match(/^(\s+)/);
      if (match && match[1]) {
        e.preventDefault();
        const indent = match[1];
        const val = activeFile.content;
        const newVal = val.substring(0, start) + '\n' + indent + val.substring(textarea.selectionEnd);
        updateCode(activeFile.id, newVal);

        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
        });
      }
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#14171A] text-[#E2E8F0] overflow-hidden">
      {/* File Tabs & Editor Controls */}
      <div className="flex h-10 items-center justify-between border-b border-[#272C33] bg-[#1A1E22] px-2.5 shrink-0">
        {/* File Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {codeFiles.map((file) => {
            const isSelected = file.id === activeFileId;
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center gap-2 rounded-t px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-t-2 border-[#144A3F] bg-[#14171A] text-white shadow-xs'
                    : 'text-[#9E988C] hover:bg-[#20252A] hover:text-[#E2E8F0]'
                }`}
              >
                <CodeIcon size={12} className={isSelected ? 'text-[#81C784]' : 'text-[#736E64]'} />
                <span>{file.name}</span>
                {file.isModified && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B94A2D]" title="Modified buffer" />
                )}
              </button>
            );
          })}
        </div>

        {/* Editor Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded border border-[#333A42] bg-[#20252A] px-2.5 py-1 text-[#D2CCC0] hover:text-white hover:border-[#4B5563] transition-colors cursor-pointer"
            title="Copy current file code"
          >
            {copied ? (
              <>
                <CheckIcon size={12} className="text-[#81C784]" />
                <span className="text-[11px] text-[#81C784]">Copied</span>
              </>
            ) : (
              <>
                <FileTextIcon size={12} />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={resetCode}
            className="flex items-center gap-1 rounded border border-[#333A42] bg-[#20252A] px-2.5 py-1 text-[#D2CCC0] hover:text-white hover:border-[#4B5563] transition-colors cursor-pointer"
            title="Reset code to default starter file"
          >
            <RefreshCwIcon size={12} />
            <span className="text-[11px]">Reset</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas (Line Numbers + Interactive Code Buffer) */}
      <div className="relative flex flex-1 h-full min-h-0 overflow-hidden bg-[#14171A]">
        {/* Line Numbers Gutter */}
        <div
          ref={lineNumbersRef}
          className="w-12 shrink-0 overflow-hidden border-r border-[#272C33] bg-[#101316] py-3 text-right font-mono text-[12px] leading-[22px] text-[#555C66] select-none pr-3"
          aria-hidden="true"
        >
          {Array.from({ length: Math.max(lineCount, 25) }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>

        {/* Real-time Editable Textarea */}
        <div className="relative flex-1 h-full min-h-0 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={activeFile.content}
            onChange={(e) => updateCode(activeFile.id, e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={activeFile.isReadOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder="// Write your implementation here..."
            className="h-full w-full resize-none border-0 bg-transparent p-3 font-mono text-[13px] leading-[22px] text-[#E2E8F0] caret-[#2DD4BF] focus:outline-none focus:ring-0 selection:bg-[#1E3A34] selection:text-white"
            style={{
              tabSize: 2,
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              overflowX: 'auto',
            }}
          />
        </div>
      </div>

      {/* Editor Status Bar */}
      <div className="flex h-7 items-center justify-between border-t border-[#272C33] bg-[#1A1E22] px-3 font-mono text-[11px] text-[#9E988C] shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#81C784]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#81C784] animate-pulse"></span>
            Editor Ready & Auto-saved
          </span>
          <span className="text-[#4B5563]">|</span>
          <span className="text-[#D2CCC0]">{activeFile.name}</span>
        </div>
        <div className="flex items-center gap-3 text-[#9E988C]">
          <span>{lineCount} lines</span>
          <span>{charCount} chars</span>
          <span className="text-[#A5D6A7]">TypeScript 5.4</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
