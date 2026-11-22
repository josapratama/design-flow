import React from 'react';
import { Slide } from '../../types';
import {
  Tv,
  FileDown,
  X,
  Play,
  Pause,
  ChevronRight,
} from 'lucide-react';
import { ElementRenderer } from '../ElementRenderer';
import { getSlideBackground } from '../../utils/slideStyle';

interface PresenterNotesDrawerProps {
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  currentSlide: Slide;
  currentIndex: number;
  slides: Slide[];
  speechEstimateBadge: string | null;
  setIsPodiumMode: (mode: boolean) => void;
  downloadSpeakerNotes: () => void;
  isTeleprompterRunning: boolean;
  setIsTeleprompterRunning: (running: boolean) => void;
  teleprompterSpeed: number;
  setTeleprompterSpeed: React.Dispatch<React.SetStateAction<number>>;
  notesFontSize: 'sm' | 'base' | 'lg' | 'xl';
  setNotesFontSize: React.Dispatch<React.SetStateAction<'sm' | 'base' | 'lg' | 'xl'>>;
  notesTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onUpdateSlideNotes?: (slideId: string, notes: string) => void;
  goToNext: () => void;
}

export const PresenterNotesDrawer: React.FC<PresenterNotesDrawerProps> = ({
  showNotes,
  setShowNotes,
  currentSlide,
  currentIndex,
  slides,
  speechEstimateBadge,
  setIsPodiumMode,
  downloadSpeakerNotes,
  isTeleprompterRunning,
  setIsTeleprompterRunning,
  teleprompterSpeed,
  setTeleprompterSpeed,
  notesFontSize,
  setNotesFontSize,
  notesTextareaRef,
  onUpdateSlideNotes,
  goToNext,
}) => {
  if (!showNotes) return null;

  return (
    <>
      {/* Backdrop on extra-small mobile screen */}
      <div
        onClick={() => setShowNotes(false)}
        className="fixed inset-0 bg-black/60 z-30 sm:hidden animate-in fade-in"
      />
      <aside className="w-80 sm:w-88 border-l border-slate-800/80 bg-slate-900/95 backdrop-blur-xl p-4 sm:p-5 flex flex-col justify-between shrink-0 fixed sm:static right-0 top-14 sm:top-0 bottom-0 z-30 sm:z-10 shadow-2xl sm:shadow-none animate-in slide-in-from-right duration-150 h-full overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  Catatan Pembicara
                </span>
                {speechEstimateBadge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {speechEstimateBadge}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mt-1">{currentSlide.title}</h4>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsPodiumMode(true)}
                title="Buka Mode Teleprompter & Podium (Layar Naskah Panggung)"
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg text-xs flex items-center gap-1 border border-slate-800 hover:border-indigo-500/40 transition-colors"
              >
                <Tv className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-mono">Podium</span>
              </button>
              <button
                onClick={downloadSpeakerNotes}
                title="Unduh seluruh naskah pembicara sebagai file Markdown (.md)"
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg text-xs flex items-center gap-1 border border-slate-800 hover:border-indigo-500/40 transition-colors"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-mono">Unduh .md</span>
              </button>
              <button
                onClick={() => setShowNotes(false)}
                title="Tutup Catatan"
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg lg:hidden"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Live Editable Textarea */}
          <div className="space-y-1">
            <div className="text-[10px] text-slate-500 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsTeleprompterRunning(!isTeleprompterRunning)}
                  title={isTeleprompterRunning ? 'Jeda Gulir Otomatis Teleprompter' : 'Mulai Gulir Otomatis Teleprompter'}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                    isTeleprompterRunning
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {isTeleprompterRunning ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-emerald-400" />}
                  <span>{isTeleprompterRunning ? 'Jeda' : 'Auto-Scroll'}</span>
                </button>
                {isTeleprompterRunning && (
                  <button
                    onClick={() => setTeleprompterSpeed(s => (s === 1 ? 2 : s === 2 ? 3 : 1))}
                    title="Ubah Kecepatan Gulir Teleprompter"
                    className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-950 border border-slate-800 text-indigo-300 hover:bg-slate-800"
                  >
                    {teleprompterSpeed}x
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5">
                <button
                  onClick={() => {
                    if (notesFontSize === 'xl') setNotesFontSize('lg');
                    else if (notesFontSize === 'lg') setNotesFontSize('base');
                    else if (notesFontSize === 'base') setNotesFontSize('sm');
                  }}
                  title="Perkecil Ukuran Font Catatan (A-)"
                  className="text-[10px] text-slate-400 hover:text-white px-0.5"
                >
                  A-
                </button>
                <span className="text-[9px] text-slate-500 font-mono uppercase">{notesFontSize}</span>
                <button
                  onClick={() => {
                    if (notesFontSize === 'sm') setNotesFontSize('base');
                    else if (notesFontSize === 'base') setNotesFontSize('lg');
                    else if (notesFontSize === 'lg') setNotesFontSize('xl');
                  }}
                  title="Perbesar Ukuran Font Catatan (A+)"
                  className="text-[10px] text-slate-400 hover:text-white px-0.5 font-bold"
                >
                  A+
                </button>
              </div>
            </div>
            <textarea
              ref={notesTextareaRef}
              value={currentSlide.notes || ''}
              onChange={e => onUpdateSlideNotes?.(currentSlide.id, e.target.value)}
              placeholder="Ketik poin penting, panduan berbicara, atau naskah presentasi untuk slide ini..."
              className={`w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-slate-200 outline-none leading-relaxed min-h-[170px] resize-none font-sans ${
                notesFontSize === 'sm'
                  ? 'text-xs'
                  : notesFontSize === 'base'
                  ? 'text-sm'
                  : notesFontSize === 'lg'
                  ? 'text-base'
                  : 'text-lg font-medium'
              }`}
            />
          </div>
        </div>

        {/* Next Slide Preview thumbnail (Interactive Mini Canvas Preview) */}
        {currentIndex < slides.length - 1 && (() => {
          const nextSlide = slides[currentIndex + 1];
          const miniScale = Math.min(270 / nextSlide.width, 140 / nextSlide.height);
          return (
            <div className="pt-3 border-t border-slate-800 space-y-1.5 shrink-0">
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-500 uppercase tracking-wider">
                  Slide Selanjutnya ({currentIndex + 2}/{slides.length})
                </span>
                <span className="text-indigo-400 font-mono text-[9px]">Klik untuk Maju →</span>
              </div>
              <button
                onClick={goToNext}
                title="Klik untuk berpindah ke slide berikutnya"
                className="w-full text-left group bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/70 rounded-xl p-2 transition-all shadow hover:shadow-indigo-500/10"
              >
                {/* Visual scaled miniature */}
                <div className="w-full h-24 bg-slate-950 rounded-lg border border-slate-800/80 overflow-hidden relative mb-2 flex items-center justify-center">
                  <div
                    style={{
                      width: `${nextSlide.width}px`,
                      height: `${nextSlide.height}px`,
                      background: getSlideBackground(nextSlide),
                      transform: `scale(${miniScale})`,
                      transformOrigin: 'center center',
                    }}
                    className="relative pointer-events-none select-none"
                  >
                    {nextSlide.elements.map(el => (
                      <div
                        key={el.id}
                        className="absolute"
                        style={{
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: `${el.height}px`,
                          zIndex: el.zIndex,
                        }}
                      >
                        <ElementRenderer element={el} isSelected={false} />
                      </div>
                    ))}
                  </div>
                  <div className="absolute inset-0 bg-transparent group-hover:bg-indigo-500/5 transition-colors" />
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-white">
                  <span className="truncate pr-1">{nextSlide.title}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
                {nextSlide.notes && nextSlide.notes.trim() && (
                  <p className="text-[10px] text-slate-400 font-mono italic truncate mt-0.5 line-clamp-1 text-slate-500">
                    "{nextSlide.notes.trim()}"
                  </p>
                )}
              </button>
            </div>
          );
        })()}
      </aside>
    </>
  );
};
