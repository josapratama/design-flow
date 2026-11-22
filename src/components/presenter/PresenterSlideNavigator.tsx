import React from 'react';
import { LayoutGrid, Search, X } from 'lucide-react';
import { Slide } from '../../types';

interface PresenterSlideNavigatorProps {
  showSlideNavigator: boolean;
  setShowSlideNavigator: (show: boolean) => void;
  slides: Slide[];
  currentIndex: number;
  navSearch: string;
  setNavSearch: (q: string) => void;
  goToSlide: (index: number) => void;
}

export const PresenterSlideNavigator: React.FC<PresenterSlideNavigatorProps> = ({
  showSlideNavigator,
  setShowSlideNavigator,
  slides,
  currentIndex,
  navSearch,
  setNavSearch,
  goToSlide,
}) => {
  if (!showSlideNavigator) return null;

  const filteredNavSlides = slides
    .map((s, idx) => ({ slide: s, originalIndex: idx }))
    .filter(({ slide: s, originalIndex: idx }) => {
      if (!navSearch.trim()) return true;
      const q = navSearch.toLowerCase().trim();
      return (
        s.title.toLowerCase().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q)) ||
        `slide ${idx + 1}`.includes(q)
      );
    });

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-50 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-md flex flex-col gap-2.5 animate-in slide-in-from-bottom-4 duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
          <span>Lompat Cepat ke Slide</span>
          <span className="text-[10px] font-mono text-slate-400 font-normal">
            ({filteredNavSlides.length} dari {slides.length} slide)
          </span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={navSearch}
            onChange={e => setNavSearch(e.target.value)}
            placeholder="Cari judul atau catatan..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 font-medium"
          />
          {navSearch && (
            <button
              type="button"
              onClick={() => setNavSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {filteredNavSlides.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400">
          Tidak ada slide yang cocok dengan kata kunci "{navSearch}".
        </div>
      ) : (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filteredNavSlides.map(({ slide: s, originalIndex: idx }) => {
            const isCur = idx === currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => {
                  goToSlide(idx);
                  setShowSlideNavigator(false);
                }}
                className={`flex flex-col items-start p-2 rounded-xl border text-left shrink-0 transition-all w-36 ${
                  isCur
                    ? 'bg-indigo-600/25 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isCur ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {s.notes && s.notes.trim() && (
                    <span className="text-[9px] text-amber-400 font-mono">📝 Notes</span>
                  )}
                </div>
                <span className="text-xs font-semibold truncate w-full">{s.title}</span>
                <span className="text-[10px] text-slate-500">{s.elements.length} elemen</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
