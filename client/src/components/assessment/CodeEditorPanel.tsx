import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useAssessment } from '../../context/AssessmentContext';
import {
  CodeIcon,
  RefreshCwIcon,
  CheckIcon,
  FileTextIcon,
} from '../common/Icons';

type MonacoEditorInstance = Parameters<OnMount>[0];

export const CodeEditorPanel: React.FC = () => {
  const {
    codeFiles,
    activeFileId,
    setActiveFileId,
    updateCode,
    resetCode,
    activity,
  } = useAssessment();

  const [copied, setCopied] = useState(false);
  const [editorLoading, setEditorLoading] = useState(true);
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeFile = codeFiles.find((f) => f.id === activeFileId) || codeFiles[0];

  const handleCopy = () => {
    if (activeFile) {
      void navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lineCount = activeFile?.content ? activeFile.content.split('\n').length : 0;
  const charCount = activeFile?.content ? activeFile.content.length : 0;

  const isReadOnly = Boolean(
    activeFile?.isReadOnly || activity === 'submitted' || activity === 'submitting'
  );

  const editorOptions = useMemo(() => ({
    fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
    fontSize: 13,
    lineHeight: 20,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    wordWrap: 'on' as const,
    automaticLayout: true,
    tabSize: 2,
    readOnly: isReadOnly,
    renderLineHighlight: 'all' as const,
    cursorBlinking: 'smooth' as const,
    cursorStyle: 'line' as const,
    cursorWidth: 2,
    bracketPairColorization: { enabled: true },
    lineNumbersMinChars: 3,
    glyphMargin: false,
    overviewRulerBorder: false,
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
    scrollbar: {
      vertical: 'visible' as const,
      horizontal: 'visible' as const,
      verticalScrollbarSize: 8,
      horizontalScrollbarSize: 8,
    },
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    acceptSuggestionOnEnter: 'on' as const,
    selectOnLineNumbers: true,
  }), [isReadOnly]);

  // Keep a stable ref to activeFile.id for callbacks
  const activeFileIdRef = useRef(activeFile?.id);
  useEffect(() => {
    activeFileIdRef.current = activeFile?.id;
  }, [activeFile?.id]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    setEditorLoading(false);
    requestAnimationFrame(() => {
      editor.focus();
    });
  };

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (value !== undefined && activeFileIdRef.current) {
      updateCode(activeFileIdRef.current, value);
    }
  }, [updateCode]);

  const handleContainerClick = () => {
    if (editorRef.current && !editorRef.current.hasTextFocus()) {
      editorRef.current.focus();
    }
  };

  // ResizeObserver to ensure Monaco updates layout whenever container resizes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#0b101b] border-r border-[#1a2539] min-w-0 min-h-0">
      {/* Tab bar & Actions */}
      <div className="flex h-10 items-center justify-between border-b border-[#182338] bg-[#070b13] px-2 shrink-0">
        {/* File Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {codeFiles.map((file) => {
            const isSelected = file.id === activeFileId;
            return (
              <button
                key={file.id}
                onClick={() => setActiveFileId(file.id)}
                className={`flex items-center gap-2 rounded-t px-3 py-1.5 text-xs font-mono font-medium transition-colors ${
                  isSelected
                    ? 'border-t-2 border-[#00f2fe] bg-[#0b101b] text-white shadow-sm'
                    : 'text-slate-400 hover:bg-[#0e1524] hover:text-slate-200'
                }`}
              >
                <CodeIcon size={13} className={isSelected ? 'text-[#00f2fe]' : 'text-slate-500'} />
                <span>{file.name}</span>
                {file.isModified && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Modified" />
                )}
              </button>
            );
          })}
        </div>

        {/* Editor Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded border border-[#1e2e48] bg-[#0d1627] px-2 py-1 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            title="Copy current file code"
          >
            {copied ? (
              <>
                <CheckIcon size={12} className="text-emerald-400" />
                <span className="text-[11px] text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <FileTextIcon size={12} />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
          <button
            onClick={resetCode}
            disabled={activity === 'submitted' || activity === 'submitting'}
            className="flex items-center gap-1 rounded border border-[#1e2e48] bg-[#0d1627] px-2 py-1 text-slate-300 hover:text-white hover:border-slate-500 transition-colors"
            title="Reset code to default starter file"
          >
            <RefreshCwIcon size={12} />
            <span className="text-[11px]">Reset File</span>
          </button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative flex-1 min-h-0 min-w-0 w-full h-full overflow-hidden cursor-text"
      >
        <Editor
          height="100%"
          width="100%"
          language={activeFile?.language || 'javascript'}
          value={activeFile?.content ?? ''}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          onChange={handleCodeChange}
          options={editorOptions}
          loading={
            <div className="flex h-full w-full items-center justify-center bg-[#0b101b] text-xs text-slate-400 font-mono pointer-events-none">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border border-[#00f2fe] border-t-transparent" />
                Mounting Monaco Environment...
              </span>
            </div>
          }
        />
      </div>

      {/* Editor Status Bar */}
      <div className="flex h-6 items-center justify-between border-t border-[#182338] bg-[#070b13] px-3 font-mono text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {editorLoading ? 'Initializing editor…' : 'Auto-saved to client state'}
          </span>
          <span className="text-slate-400">|</span>
          <span>{activeFile?.name || 'solution.js'}</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>{lineCount} lines</span>
          <span>{charCount} chars</span>
          <span className="text-[#00f2fe]">{activeFile?.language || 'javascript'}</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
