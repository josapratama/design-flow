import React, { useState, useEffect, useRef } from 'react';
import { DesignProject } from '../types';
import { generateDesignDSL } from '../engine/dsl-generator';
import { parseDesignDSL } from '../engine/dsl-parser';
import { Code, Check, AlertCircle, Copy, RefreshCw, Download, Upload, Sparkles, Search, Replace, X, ChevronUp, ChevronDown } from 'lucide-react';
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
  const [fileSuccessInfo, setFileSuccessInfo] = useState<{ fileName: string; slideCount: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const findInputRef = useRef<HTMLInputElement>(null);

  const matchCount = React.useMemo(() => {
    if (!findText) return 0;
    try {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
      return (code.match(regex) || []).length;
    } catch {
      return 0;
    }
  }, [code, findText, caseSensitive]);

  const handleFindNext = () => {
    if (!findText) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const haystack = caseSensitive ? code : code.toLowerCase();
    const needle = caseSensitive ? findText : findText.toLowerCase();
    const startPos = textarea.selectionEnd;
    let idx = haystack.indexOf(needle, startPos);
    if (idx === -1) {
      idx = haystack.indexOf(needle, 0); // wrap around
    }
    if (idx !== -1) {
      textarea.focus();
      textarea.setSelectionRange(idx, idx + needle.length);
    }
  };

  const handleFindPrev = () => {
    if (!findText) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const haystack = caseSensitive ? code : code.toLowerCase();
    const needle = caseSensitive ? findText : findText.toLowerCase();
    const startPos = textarea.selectionStart - 1;
    let idx = startPos >= 0 ? haystack.lastIndexOf(needle, startPos) : -1;
    if (idx === -1) {
      idx = haystack.lastIndexOf(needle); // wrap around
    }
    if (idx !== -1) {
      textarea.focus();
      textarea.setSelectionRange(idx, idx + needle.length);
    }
  };

  const handleReplaceOne = () => {
    if (!findText) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = code.substring(start, end);
    const match = caseSensitive ? selectedText === findText : selectedText.toLowerCase() === findText.toLowerCase();
    if (match) {
      const newCode = code.substring(0, start) + replaceText + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        textarea.setSelectionRange(start, start + replaceText.length);
        handleFindNext();
      }, 0);
    } else {
      handleFindNext();
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    try {
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), caseSensitive ? 'g' : 'gi');
      const count = (code.match(regex) || []).length;
      if (count > 0) {
        const newCode = code.replace(regex, replaceText);
        setCode(newCode);
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
      }
    } catch { }
  };

  // Synchronize visual state to DSL code whenever project updates
  useEffect(() => {
    if (isOpen) {
      setCode(generateDesignDSL(project));
      setError(null);
    }
  }, [isOpen, project]);

  const isDirty = React.useMemo(() => {
    try {
      return code.trim() !== generateDesignDSL(project).trim();
    } catch {
      return false;
    }
  }, [code, project]);

  if (!isOpen) return null;

  const handleApply = () => {
    try {
      const parsed = parseDesignDSL(code, project.mode);
      const preservedActiveId = parsed.slides.some(s => s.id === project.activeSlideId)
        ? project.activeSlideId
        : (parsed.slides[0]?.id || project.activeSlideId);

      onApplyCode({
        title: parsed.title,
        mode: parsed.mode,
        slides: parsed.slides,
        activeSlideId: preservedActiveId,
      });
      setError(null);
      setAppliedSuccess(true);
      setTimeout(() => setAppliedSuccess(false), 2200);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    } catch (err: any) {
      setError(err.message || 'Gagal mem-parsing sintaks kode DSL.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormatDSL = () => {
    try {
      const parsed = parseDesignDSL(code, project.mode);
      const formatted = generateDesignDSL({
        ...project,
        title: parsed.title,
        mode: parsed.mode,
        slides: parsed.slides,
      });
      setCode(formatted);
      setError(null);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.8 } });
    } catch (err: any) {
      setError('Format gagal: ' + (err.message || 'Periksa sintaks kode DSL terlebih dahulu.'));
    }
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
        try {
          const parsed = parseDesignDSL(content, project.mode);
          setFileSuccessInfo({ fileName: file.name, slideCount: parsed.slides.length });
          setError(null);
        } catch (err: any) {
          setError('File berhasil dimuat namun memiliki kesalahan sintaks: ' + err.message);
          setFileSuccessInfo(null);
        }
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
    <div className="absolute top-14 bottom-0 right-0 w-full sm:w-[500px] max-w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col z-30 select-none animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-indigo-500/10 text-indigo-400">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Declarative Design DSL</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Sinkronisasi 2 arah visual & kode</span>
              {isDirty && !appliedSuccess && (
                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Ada Perubahan
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setShowFindReplace(prev => !prev);
              if (!showFindReplace) {
                setTimeout(() => findInputRef.current?.focus(), 50);
              }
            }}
            title="Cari & Ganti Teks (Ctrl+F)"
            className={`p-1 rounded-lg text-xs transition-colors flex items-center gap-1 ${
              showFindReplace ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline text-[10px]">Cari</span>
          </button>
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
            onClick={handleFormatDSL}
            title="Format dan rapikan sintaks kode DSL secara otomatis"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-amber-300 rounded-lg text-xs transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-[10px]">Format</span>
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

      {/* Find and Replace Bar (Ctrl+F) */}
      {showFindReplace && (
        <div className="bg-slate-950 border-b border-slate-800 p-2.5 flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <input
                ref={findInputRef}
                type="text"
                value={findText}
                onChange={e => setFindText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (e.shiftKey) handleFindPrev();
                    else handleFindNext();
                  } else if (e.key === 'Escape') {
                    setShowFindReplace(false);
                  }
                }}
                placeholder="Cari teks di DSL..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg pl-2.5 pr-14 py-1 text-xs text-slate-200 outline-none font-mono"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500">
                {matchCount > 0 ? `${matchCount} cocok` : findText ? '0 cocok' : ''}
              </span>
            </div>
            <button
              onClick={handleFindPrev}
              disabled={!findText}
              title="Temukan Sebelumnya (Shift+Enter)"
              className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-400 hover:text-white"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFindNext}
              disabled={!findText}
              title="Temukan Berikutnya (Enter)"
              className="p-1 hover:bg-slate-800 disabled:opacity-30 rounded text-slate-400 hover:text-white"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
              title={caseSensitive ? 'Huruf Besar/Kecil Berpengaruh (Aktif)' : 'Abaikan Huruf Besar/Kecil'}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                caseSensitive ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              Aa
            </button>
            <button
              onClick={() => setShowFindReplace(false)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={replaceText}
              onChange={e => setReplaceText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleReplaceOne();
                } else if (e.key === 'Escape') {
                  setShowFindReplace(false);
                }
              }}
              placeholder="Ganti dengan..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none font-mono"
            />
            <button
              onClick={handleReplaceOne}
              disabled={!findText}
              title="Ganti yang cocok saat ini"
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 border border-slate-800 text-slate-300 rounded text-[11px] font-medium"
            >
              Ganti
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={!findText}
              title="Ganti semua kecocokan"
              className="px-2 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 disabled:opacity-30 border border-indigo-500/40 text-indigo-300 rounded text-[11px] font-medium"
            >
              Semua
            </button>
          </div>
        </div>
      )}

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
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
              e.preventDefault();
              setShowFindReplace(true);
              setTimeout(() => findInputRef.current?.focus(), 50);
              return;
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              if (showFindReplace) {
                setShowFindReplace(false);
                return;
              }
              onClose();
              return;
            }
            if (e.key === 'Tab') {
              e.preventDefault();
              const textarea = textareaRef.current;
              if (!textarea) return;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;

              if (start !== end) {
                // Multi-line indent / outdent
                const before = code.substring(0, start);
                const lineStart = before.lastIndexOf('\n') === -1 ? 0 : before.lastIndexOf('\n') + 1;
                // Avoid indenting trailing empty newline boundary
                let effectiveEnd = end;
                if (effectiveEnd > lineStart && code[effectiveEnd - 1] === '\n') {
                  effectiveEnd--;
                }
                const after = code.substring(effectiveEnd);
                const selectedBlock = code.substring(lineStart, effectiveEnd);
                const lines = selectedBlock.split('\n');

                if (e.shiftKey) {
                  // Outdent each line
                  const updatedLines = lines.map(line => line.startsWith('  ') ? line.substring(2) : line.startsWith(' ') ? line.substring(1) : line);
                  const newBlock = updatedLines.join('\n');
                  const diff = selectedBlock.length - newBlock.length;
                  setCode(code.substring(0, lineStart) + newBlock + after);
                  setTimeout(() => {
                    textarea.selectionStart = start;
                    textarea.selectionEnd = Math.max(start, end - diff);
                  }, 0);
                } else {
                  // Indent each line
                  const updatedLines = lines.map(line => '  ' + line);
                  const newBlock = updatedLines.join('\n');
                  const diff = newBlock.length - selectedBlock.length;
                  setCode(code.substring(0, lineStart) + newBlock + after);
                  setTimeout(() => {
                    textarea.selectionStart = start + 2;
                    textarea.selectionEnd = end + diff;
                  }, 0);
                }
              } else {
                // Single cursor indent / outdent
                if (e.shiftKey) {
                  const before = code.substring(0, start);
                  const lastNewline = before.lastIndexOf('\n');
                  const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
                  if (code.substring(lineStart, lineStart + 2) === '  ') {
                    const newCode = code.substring(0, lineStart) + code.substring(lineStart + 2);
                    setCode(newCode);
                    setTimeout(() => {
                      textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 2);
                    }, 0);
                  }
                } else {
                  const newCode = code.substring(0, start) + '  ' + code.substring(end);
                  setCode(newCode);
                  setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = start + 2;
                  }, 0);
                }
              }
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

      {/* File Upload Success Feedback Banner */}
      {fileSuccessInfo && (
        <div className="p-2.5 bg-emerald-500/15 border-t border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between px-3.5 animate-in slide-in-from-bottom duration-150">
          <div className="flex items-center gap-1.5 truncate">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">
              <b>{fileSuccessInfo.fileName}</b> ({fileSuccessInfo.slideCount} slide terdeteksi)
            </span>
          </div>
          <button
            onClick={() => {
              handleApply();
              setFileSuccessInfo(null);
            }}
            className="ml-2 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] shrink-0 transition-colors shadow-sm"
          >
            Terapkan Sekarang
          </button>
        </div>
      )}

      {/* Error Alert if any */}
      {error && (
        <div className="p-2.5 bg-rose-500/10 border-t border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Drawer Footer Actions & Live Structural Token Inspector */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-indigo-300 font-semibold">
            {lines.length} baris
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
            {(code.match(/slide\s+"[^"]*"/g) || []).length || project.slides.length} slide
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
            {(new Blob([code]).size / 1024).toFixed(1)} KB
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
            error
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              : isDirty
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}>
            {error ? 'Sintaks Error' : isDirty ? 'Belum Diterapkan' : 'Tersinkron'}
          </span>
          <span className="text-slate-500 hidden sm:inline">• <kbd className="text-indigo-400">Ctrl+Enter</kbd></span>
        </div>
        <button
          onClick={handleApply}
          title="Terapkan kode ke visual kanvas (Ctrl+Enter)"
          className={`px-4 py-1.5 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 ${
            appliedSuccess
              ? 'bg-emerald-600 shadow-emerald-600/30'
              : isDirty
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 ring-2 ring-amber-400/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
          }`}
        >
          {appliedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-200" /> : <RefreshCw className="w-3.5 h-3.5" />}
          <span>{appliedSuccess ? 'Tersinkronkan!' : 'Terapkan ke Visual'}</span>
        </button>
      </div>
    </div>
  );
};
