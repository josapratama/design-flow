import React, { useState, useEffect, useRef } from 'react';
import { Slide } from '../types';
import { Search, Replace, X, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FindReplaceModalProps {
  isOpen: boolean;
  slides: Slide[];
  activeSlideId: string;
  onClose: () => void;
  onReplaceAll: (findText: string, replaceText: string, scope: 'active' | 'all', matchCase: boolean) => number;
  onSelectSlide?: (slideId: string) => void;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  slides,
  activeSlideId,
  onClose,
  onReplaceAll,
  onSelectSlide,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [scope, setScope] = useState<'active' | 'all'>('active');
  const [matchCase, setMatchCase] = useState(false);
  const [lastReplacedCount, setLastReplacedCount] = useState<number | null>(null);

  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => findInputRef.current?.focus(), 50);
      setLastReplacedCount(null);
    }
  }, [isOpen]);

  // Compute live match breakdown per slide
  const matchedSlides = React.useMemo(() => {
    if (!findText.trim()) return [];
    const flags = matchCase ? 'g' : 'gi';
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);
    const results: { slide: Slide; index: number; count: number }[] = [];

    slides.forEach((slide, idx) => {
      if (scope === 'active' && slide.id !== activeSlideId) return;
      let count = 0;
      const slideMetaFields = [slide.title, slide.notes];
      slideMetaFields.forEach(smf => {
        if (smf) {
          const matches = smf.match(regex);
          if (matches) count += matches.length;
        }
      });

      slide.elements.forEach(el => {
        const textFields = [el.content, el.subTitle, el.badgeText, el.placeholder];
        textFields.forEach(tf => {
          if (tf) {
            const matches = tf.match(regex);
            if (matches) count += matches.length;
          }
        });
      });

      if (count > 0) {
        results.push({ slide, index: idx + 1, count });
      }
    });

    return results;
  }, [findText, scope, matchCase, slides, activeSlideId]);

  // Compute live match count from matchedSlides
  const matchCount = React.useMemo(() => {
    return matchedSlides.reduce((acc, curr) => acc + curr.count, 0);
  }, [matchedSlides]);

  const handleExecuteReplace = () => {
    if (!findText) return;
    const count = onReplaceAll(findText, replaceText, scope, matchCase);
    setLastReplacedCount(count);
    if (count > 0) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Replace className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Cari & Ganti Teks (Find & Replace)</h3>
              <p className="text-[11px] text-slate-400">Perbarui kata atau istilah di seluruh elemen teks secara instan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Find input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
              <span>Teks yang Dicari:</span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                matchCount > 0 ? 'bg-indigo-500/20 text-indigo-300 font-bold' : 'text-slate-500'
              }`}>
                {matchCount > 0 ? `${matchCount} kata ditemukan` : '0 kata'}
              </span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                ref={findInputRef}
                type="text"
                value={findText}
                onChange={e => {
                  setFindText(e.target.value);
                  setLastReplacedCount(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleExecuteReplace();
                  if (e.key === 'Escape') onClose();
                }}
                placeholder="Misal: Semester, Startup, 2024..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-slate-100 text-xs outline-none"
              />
            </div>
          </div>

          {/* Replace input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Ganti Dengan:</label>
            <div className="relative">
              <ArrowRight className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={replaceText}
                onChange={e => {
                  setReplaceText(e.target.value);
                  setLastReplacedCount(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleExecuteReplace();
                  if (e.key === 'Escape') onClose();
                }}
                placeholder="Misal: Triwulan, Enterprise, 2025..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 text-slate-100 text-xs outline-none"
              />
            </div>
          </div>

          {/* Scope and Options */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            {/* Scope: Active vs All */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setScope('active')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  scope === 'active'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Slide Aktif
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  scope === 'all'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua Slide ({slides.length})
              </button>
            </div>

            {/* Match Case Toggle */}
            <button
              type="button"
              onClick={() => setMatchCase(!matchCase)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono transition-colors flex items-center gap-1.5 ${
                matchCase
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Aa</span>
              <span className="text-[10px] font-sans">Sensitif Huruf Besar</span>
            </button>
          </div>

          {/* Matched Slides Quick Navigation */}
          {matchedSlides.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Ditemukan di {matchedSlides.length} Slide:</span>
                <span className="text-[10px] text-slate-500">Klik untuk langsung membuka slide</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-h-24 flex-wrap">
                {matchedSlides.map(({ slide, index, count }) => {
                  const isActive = slide.id === activeSlideId;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => onSelectSlide?.(slide.id)}
                      className={`px-2 py-1 rounded-lg text-[11px] flex items-center gap-1.5 border transition-all ${
                        isActive
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold shadow-sm'
                          : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                      title={`Klik untuk buka slide #${index}: ${slide.title || 'Slide ' + index}`}
                    >
                      <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                        #{index}
                      </span>
                      <span className="truncate max-w-[120px]">{slide.title || `Slide ${index}`}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        {count}x
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feedback banner */}
          {lastReplacedCount !== null && (
            <div className={`p-2.5 rounded-xl border text-[11px] flex items-center gap-2 ${
              lastReplacedCount > 0
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}>
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {lastReplacedCount > 0
                  ? `Berhasil mengganti ${lastReplacedCount} teks sekaligus!`
                  : 'Tidak ada kata yang cocok untuk diganti.'}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={!findText.trim() || matchCount === 0}
            onClick={handleExecuteReplace}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Replace className="w-3.5 h-3.5" />
            <span>Ganti Semua ({matchCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
