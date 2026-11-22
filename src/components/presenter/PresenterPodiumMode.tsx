import React from 'react';
import { Slide } from '../../types';
import {
  Tv,
  Clock,
  BookOpen,
  Pause,
  Play,
  FileDown,
  ChevronRight,
  ChevronLeft,
  PartyPopper,
} from 'lucide-react';
import { ElementRenderer } from '../ElementRenderer';
import { getSlideBackground } from '../../utils/slideStyle';

interface PresenterPodiumModeProps {
  currentIndex: number;
  slides: Slide[];
  currentSlide: Slide;
  secondsElapsed: number;
  targetMinutes: number;
  formatTimer: (seconds: number) => string;
  setIsPodiumMode: (mode: boolean) => void;
  speechEstimateBadge: string | null;
  isTeleprompterRunning: boolean;
  setIsTeleprompterRunning: (running: boolean) => void;
  teleprompterSpeed: number;
  setTeleprompterSpeed: React.Dispatch<React.SetStateAction<number>>;
  notesFontSize: 'sm' | 'base' | 'lg' | 'xl';
  setNotesFontSize: React.Dispatch<React.SetStateAction<'sm' | 'base' | 'lg' | 'xl'>>;
  downloadSpeakerNotes: () => void;
  podiumTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onUpdateSlideNotes?: (slideId: string, notes: string) => void;
  onGoToSlide?: (index: number) => void;
  goToPrev: () => void;
  goToNext: () => void;
  blankMode: 'none' | 'black' | 'white';
  setBlankMode: React.Dispatch<React.SetStateAction<'none' | 'black' | 'white'>>;
  triggerCelebration: () => void;
}

export const PresenterPodiumMode: React.FC<PresenterPodiumModeProps> = ({
  currentIndex,
  slides,
  currentSlide,
  secondsElapsed,
  targetMinutes,
  formatTimer,
  setIsPodiumMode,
  speechEstimateBadge,
  isTeleprompterRunning,
  setIsTeleprompterRunning,
  teleprompterSpeed,
  setTeleprompterSpeed,
  notesFontSize,
  setNotesFontSize,
  downloadSpeakerNotes,
  podiumTextareaRef,
  onUpdateSlideNotes,
  onGoToSlide,
  goToPrev,
  goToNext,
  blankMode,
  setBlankMode,
  triggerCelebration,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-hidden p-4 sm:p-6 animate-in fade-in duration-150">
      {/* Podium Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold tracking-wide flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-indigo-400" />
            <span>PODIUM & TELEPROMPTER</span>
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 truncate max-w-md">
            Slide {currentIndex + 1} / {slides.length}: {currentSlide.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Giant Timer */}
          <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-1.5 rounded-2xl shadow-inner">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="font-mono text-xl font-bold tracking-wider text-slate-100">
              {formatTimer(secondsElapsed)}
            </span>
            {targetMinutes > 0 && (
              <span
                className={`text-xs font-mono px-2 py-0.5 rounded-lg border font-bold ${
                  secondsElapsed > targetMinutes * 60
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Target {targetMinutes}m
              </span>
            )}
          </div>

          {/* Close Podium Button */}
          <button
            onClick={() => setIsPodiumMode(false)}
            title="Kembali ke Tampilan Standar (Esc)"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Keluar Podium</span>
            <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-400">Esc</kbd>
          </button>
        </div>
      </div>

      {/* Podium Content Split: Giant Teleprompter Notes (Left) + Slide Monitors (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 py-4 overflow-hidden min-h-0">
        {/* Left: Giant Teleprompter Notes */}
        <div className="flex-1 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-6 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Naskah & Panduan Berbicara
              </span>
              {speechEstimateBadge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {speechEstimateBadge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Teleprompter Auto-Scroll Button */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsTeleprompterRunning(!isTeleprompterRunning)}
                  title={isTeleprompterRunning ? 'Jeda Gulir Otomatis Teleprompter' : 'Mulai Gulir Otomatis Teleprompter'}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isTeleprompterRunning
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                  }`}
                >
                  {isTeleprompterRunning ? <Pause className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isTeleprompterRunning ? 'Jeda' : 'Auto-Scroll'}</span>
                </button>
                {isTeleprompterRunning && (
                  <button
                    onClick={() => setTeleprompterSpeed(s => (s === 1 ? 2 : s === 2 ? 3 : 1))}
                    title="Ubah Kecepatan Gulir Teleprompter"
                    className="px-1.5 py-1 rounded text-[10px] font-mono font-bold bg-slate-950 border border-slate-800 text-indigo-300 hover:bg-slate-800"
                  >
                    {teleprompterSpeed}x
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                <button
                  onClick={() => {
                    if (notesFontSize === 'xl') setNotesFontSize('lg');
                    else if (notesFontSize === 'lg') setNotesFontSize('base');
                    else if (notesFontSize === 'base') setNotesFontSize('sm');
                  }}
                  title="Perkecil Ukuran Font Catatan (A-)"
                  className="text-xs text-slate-400 hover:text-white px-1 font-semibold"
                >
                  A-
                </button>
                <span className="text-[10px] text-slate-500 font-mono uppercase px-1">{notesFontSize}</span>
                <button
                  onClick={() => {
                    if (notesFontSize === 'sm') setNotesFontSize('base');
                    else if (notesFontSize === 'base') setNotesFontSize('lg');
                    else if (notesFontSize === 'lg') setNotesFontSize('xl');
                  }}
                  title="Perbesar Ukuran Font Catatan (A+)"
                  className="text-xs text-slate-400 hover:text-white px-1 font-bold"
                >
                  A+
                </button>
              </div>
              <button
                onClick={downloadSpeakerNotes}
                title="Unduh Naskah (.md)"
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-300 rounded-lg border border-slate-800"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>
          </div>

          {/* Editable Large Typography Textarea */}
          <div className="flex-1 mt-3 overflow-y-auto">
            <textarea
              ref={podiumTextareaRef}
              value={currentSlide.notes || ''}
              onChange={e => onUpdateSlideNotes?.(currentSlide.id, e.target.value)}
              placeholder="Ketik poin penting, panduan berbicara, atau naskah presentasi untuk slide ini..."
              className={`w-full h-full bg-transparent border-none focus:outline-none text-slate-100 placeholder-slate-600 leading-relaxed resize-none font-sans ${
                notesFontSize === 'sm'
                  ? 'text-base'
                  : notesFontSize === 'base'
                  ? 'text-xl'
                  : notesFontSize === 'lg'
                  ? 'text-2xl font-medium'
                  : 'text-3xl font-semibold'
              }`}
            />
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
            <span>Tip: Anda dapat mengedit teks ini langsung saat presentasi.</span>
            <span className="font-mono">
              {currentSlide.notes ? `${currentSlide.notes.trim().split(/\s+/).filter(Boolean).length} kata` : '0 kata'}
            </span>
          </div>
        </div>

        {/* Right: Stage Slide Monitors */}
        <div className="w-full lg:w-96 flex flex-col gap-4 shrink-0 overflow-y-auto">
          {/* Current Live Slide Monitor */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Layar Audiens (Aktif)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">16:9 FHD</span>
            </div>
            {/* Scaled Mini Preview */}
            <div className="w-full aspect-video bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden relative shadow-inner flex items-center justify-center">
              <div
                style={{
                  width: `${currentSlide.width}px`,
                  height: `${currentSlide.height}px`,
                  background: getSlideBackground(currentSlide),
                  transform: `scale(${Math.min(320 / currentSlide.width, 180 / currentSlide.height)})`,
                  transformOrigin: 'center center',
                }}
                className="relative pointer-events-none select-none"
              >
                {currentSlide.elements.map(el => (
                  <div
                    key={el.id}
                    className={`absolute ${el.linkToSlideId && onGoToSlide ? 'cursor-pointer hover:ring-2 hover:ring-indigo-400 pointer-events-auto rounded' : ''}`}
                    onClick={() => {
                      if (el.linkToSlideId && onGoToSlide) {
                        const targetIdx = slides.findIndex(s => s.id === el.linkToSlideId);
                        if (targetIdx !== -1 && targetIdx !== currentIndex) {
                          onGoToSlide(targetIdx);
                        }
                      }
                    }}
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
            </div>
          </div>

          {/* Next Slide Preview */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md shadow-xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400 flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                <span>Slide Berikutnya ({currentIndex < slides.length - 1 ? `${currentIndex + 2}/${slides.length}` : 'Selesai'})</span>
              </span>
            </div>
            {currentIndex < slides.length - 1 ? (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-200 truncate">
                  {slides[currentIndex + 1].title}
                </div>
                {slides[currentIndex + 1].notes && (
                  <p className="text-xs text-slate-400 line-clamp-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/60 italic font-mono">
                    "{slides[currentIndex + 1].notes}"
                  </p>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-500 font-mono">
                🏁 Ini adalah slide terakhir
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Podium Bottom Controls */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-25 border border-slate-800 rounded-xl text-sm font-bold text-slate-200 hover:text-white flex items-center gap-2 transition-all shadow"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Slide Sebelumnya</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBlankMode(prev => (prev === 'black' ? 'none' : 'black'))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
              blankMode === 'black' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Layar Hitam (B)
          </button>
          <button
            onClick={triggerCelebration}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 rounded-xl"
            title="Confetti"
          >
            <PartyPopper className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === slides.length - 1}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-25 border border-indigo-500 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
        >
          <span>Slide Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
