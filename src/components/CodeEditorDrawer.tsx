import React, { useState, useEffect, useRef } from 'react';
import { DesignProject } from '../types';
import { generateDesignDSL } from '../engine/dsl-generator';
import { parseDesignDSL } from '../engine/dsl-parser';
import { Code, Check, AlertCircle, Copy, RefreshCw, Download, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CodeEditorDrawerProps {
  isOpen: boolean;
  project: DesignProject;
  onClose: () => void;
  onApplyCode: (updatedProject: Partial<DesignProject>) => void;
}

export const CodeEditorDrawer: React.FC<CodeEditorDrawerProps> = ({
  isOpen,
  project,
  onClose,
  onApplyCode,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize visual state to DSL code whenever project updates
  useEffect(() => {
    if (isOpen) {
      setCode(generateDesignDSL(project));
      setError(null);
    }
  }, [isOpen, project]);

  if (!isOpen) return null;

  const handleApply = () => {
    try {
      const parsed = parseDesignDSL(code, project.mode);
      onApplyCode({
        title: parsed.title,
        mode: parsed.mode,
        slides: parsed.slides,
        activeSlideId: parsed.slides[0]?.id || project.activeSlideId,
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Gagal mem-parsing sintaks kode DSL.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDSL = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `${(project.title || 'designflow_project')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')}.dflow`;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      if (content) {
        setCode(content);
        setError(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const lines = code.split('\n');

  return (
    <div className="absolute top-14 bottom-0 right-0 w-[500px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-30 select-none animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Declarative Design DSL</h3>
            <span className="text-[10px] text-slate-400">Sinkronisasi 2 arah visual & kode</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".dflow,.dsl,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Buka file .dflow dari perangkat Anda"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition-colors flex items-center gap-1"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline text-[10px]">Buka</span>
          </button>
          <button
            onClick={handleDownloadDSL}
            title="Unduh kode DSL sebagai file .dflow"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition-colors flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-[10px]">Unduh</span>
          </button>
          <button
            onClick={() => {
              setCode(generateDesignDSL(project));
              setError(null);
            }}
            title="Sinkron ulang dari kanvas visual saat ini"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Code Editor Body with Line Number Gutter */}
      <div className="flex-1 relative bg-slate-950 font-mono text-xs flex overflow-hidden">
        {/* Line Numbers Gutter */}
        <div
          ref={gutterRef}
          className="w-11 py-4 pr-2 text-right bg-slate-950/90 text-slate-600 font-mono select-none overflow-hidden border-r border-slate-800/80 shrink-0 leading-relaxed pointer-events-none"
        >
          {lines.map((_, idx) => (
            <div key={idx} className="text-[11px] leading-5">{idx + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={e => {
            setCode(e.target.value);
            setError(null);
          }}
          onScroll={handleScroll}
          onKeyDown={e => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const textarea = textareaRef.current;
              if (!textarea) return;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newCode = code.substring(0, start) + '  ' + code.substring(end);
              setCode(newCode);
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 2;
              }, 0);
              return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleApply();
            }
          }}
          placeholder="// Kode DesignFlow DSL..."
          spellCheck={false}
          className="flex-1 h-full p-4 pl-3 bg-transparent text-emerald-400 placeholder-slate-600 outline-none resize-none leading-5 selection:bg-indigo-600 selection:text-white font-mono overflow-y-auto whitespace-pre"
        />
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-2.5 bg-rose-500/10 border-t border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Drawer Footer Actions */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span>{lines.length} baris</span>
          <span>•</span>
          <span className="text-slate-500"><kbd className="text-indigo-400">Ctrl+Enter</kbd> terapkan</span>
        </div>
        <button
          onClick={handleApply}
          title="Terapkan kode ke visual kanvas (Ctrl+Enter)"
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Terapkan ke Visual</span>
        </button>
      </div>
    </div>
  );
};
