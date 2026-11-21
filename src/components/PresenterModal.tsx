import React, { useState, useEffect, useRef } from 'react';
import { Slide } from '../types';
import { ElementRenderer } from './ElementRenderer';
import { Play, Pause, ChevronLeft, ChevronRight, X, Maximize2, Minimize2, CircleDot } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PresenterModalProps {
  slides: Slide[];
  initialSlideIndex?: number;
  onClose: () => void;
}

export const PresenterModal: React.FC<PresenterModalProps> = ({
  slides,
  initialSlideIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLaserActive, setIsLaserActive] = useState(false);
  const [laserPos, setLaserPos] = useState({ x: -100, y: -100 });
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5);
  const [transitionEffect, setTransitionEffect] = useState<'fade' | 'slide' | 'zoom'>('fade');

  const slideAreaRef = useRef<HTMLDivElement>(null);

  // Auto-play interval
  useEffect(() => {
    let timer: any;
    if (isAutoPlay) {
      timer = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % slides.length);
      }, autoPlayInterval * 1000);
    }
    return () => clearInterval(timer);
  }, [isAutoPlay, autoPlayInterval, slides.length]);

  // Timer interval
  useEffect(() => {
    let interval: any;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(sec => sec + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrev();
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key.toLowerCase() === 'l') {
        setIsLaserActive(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, slides.length]);

  const goToNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(i => i + 1);
      if (currentIndex + 1 === slides.length - 1) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isLaserActive && slideAreaRef.current) {
      const rect = slideAreaRef.current.getBoundingClientRect();
      setLaserPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const currentSlide = slides[currentIndex];
  const viewportWidth = window.innerWidth * (showNotes ? 0.72 : 0.95);
  const viewportHeight = window.innerHeight * 0.85;
  const scale = Math.min(viewportWidth / currentSlide.width, viewportHeight / currentSlide.height);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col select-none text-slate-100">
      {/* Presenter Top Bar */}
      <header className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/90">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-indigo-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mode Presentasi (Slideshow)</span>
          </div>
          <span className="text-xs text-slate-400">
            Slide {currentIndex + 1} dari {slides.length} — {currentSlide.title}
          </span>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg text-xs font-mono">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-slate-400 hover:text-white"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <span className="font-semibold text-slate-200">{formatTimer(secondsElapsed)}</span>
          </div>

          {/* Auto-Play Toggle */}
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              title={isAutoPlay ? 'Hentikan Putar Otomatis' : 'Mulai Putar Otomatis'}
              className={`px-2 py-1 rounded flex items-center gap-1.5 transition-colors font-semibold ${
                isAutoPlay ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Auto-Play</span>
            </button>
            <select
              value={autoPlayInterval}
              onChange={e => setAutoPlayInterval(Number(e.target.value))}
              className="bg-transparent text-[11px] text-slate-300 outline-none pr-1 cursor-pointer font-mono"
            >
              <option value={3} className="bg-slate-900">3d</option>
              <option value={5} className="bg-slate-900">5d</option>
              <option value={10} className="bg-slate-900">10d</option>
            </select>
          </div>

          {/* Laser Pointer Toggle */}
          <button
            onClick={() => setIsLaserActive(!isLaserActive)}
            title="Laser Pointer (Tekan 'L')"
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${isLaserActive
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-md shadow-rose-500/20'
                : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>Laser {isLaserActive ? 'Aktif' : 'Pointer'}</span>
          </button>

          {/* Transition Effect Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1 text-xs">
            <span className="text-[10px] text-slate-400 font-semibold">Efek:</span>
            <select
              value={transitionEffect}
              onChange={e => setTransitionEffect(e.target.value as any)}
              className="bg-transparent text-[11px] text-slate-200 outline-none cursor-pointer font-medium"
            >
              <option value="fade" className="bg-slate-900">Fade (Halus)</option>
              <option value="slide" className="bg-slate-900">Slide (Geser)</option>
              <option value="zoom" className="bg-slate-900">Zoom (Memperbesar)</option>
            </select>
          </div>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1 rounded-lg text-xs font-medium border ${showNotes
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
          >
            {showNotes ? 'Sembunyikan Catatan' : 'Lihat Catatan'}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Slide Display + Notes Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Canvas Area */}
        <div
          ref={slideAreaRef}
          onMouseMove={handleMouseMove}
          className={`flex-1 flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden ${isLaserActive ? 'cursor-none' : 'cursor-default'
            }`}
        >
          <div
            key={currentIndex}
            className={`relative shadow-2xl rounded-sm overflow-hidden ${
              transitionEffect === 'slide'
                ? 'animate-in slide-in-from-right-10 duration-300'
                : transitionEffect === 'zoom'
                ? 'animate-in zoom-in-95 duration-200'
                : 'animate-in fade-in duration-200'
            }`}
            style={{
              width: `${currentSlide.width}px`,
              height: `${currentSlide.height}px`,
              background: currentSlide.background || '#0f172a',
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }}
          >
            {currentSlide.elements.map(el => (
              <div
                key={el.id}
                className="absolute"
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  zIndex: el.zIndex,
                  transform: [
                    el.rotation ? `rotate(${el.rotation}deg)` : '',
                    el.flipX ? 'scaleX(-1)' : '',
                    el.flipY ? 'scaleY(-1)' : '',
                  ].filter(Boolean).join(' ') || undefined,
                  opacity: el.opacity !== undefined ? el.opacity : 1,
                }}
              >
                <ElementRenderer element={el} isSelected={false} />
              </div>
            ))}
          </div>

          {/* Laser Pointer Glow Dot */}
          {isLaserActive && (
            <div
              className="absolute pointer-events-none w-5 h-5 rounded-full bg-rose-500 shadow-lg -translate-x-1/2 -translate-y-1/2 z-50 transition-transform duration-75"
              style={{
                left: `${laserPos.x}px`,
                top: `${laserPos.y}px`,
                boxShadow: '0 0 16px 6px rgba(244, 63, 94, 0.9), 0 0 4px #ffffff',
              }}
            />
          )}

          {/* Floating Navigation Controls */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-full shadow-2xl backdrop-blur-md">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="p-2 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-full text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-medium text-slate-300 px-2">
              {currentIndex + 1} / {slides.length}
            </span>
            <button
              onClick={goToNext}
              disabled={currentIndex === slides.length - 1}
              className="p-2 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-full text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Presenter Speaker Notes Sidebar */}
        {showNotes && (
          <aside className="w-80 border-l border-slate-800 bg-slate-900 p-5 flex flex-col justify-between shrink-0">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                  Catatan Pembicara (Speaker Notes)
                </span>
                <h4 className="text-sm font-semibold text-slate-200">{currentSlide.title}</h4>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed min-h-[140px] whitespace-pre-wrap font-sans">
                {currentSlide.notes || (
                  <span className="text-slate-500 italic">
                    Belum ada catatan pembicara untuk slide ini. Anda dapat menambahkannya dari panel kode atau properti.
                  </span>
                )}
              </div>
            </div>

            {/* Next Slide Preview thumbnail */}
            {currentIndex < slides.length - 1 && (
              <div className="pt-4 border-t border-slate-800 space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Slide Selanjutnya
                </span>
                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 truncate">
                  {currentIndex + 2}. {slides[currentIndex + 1].title}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};
