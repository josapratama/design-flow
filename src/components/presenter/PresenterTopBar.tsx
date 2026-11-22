import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CircleDot,
  Pen,
  Undo2,
  Eraser,
  Lightbulb,
  ExternalLink,
  Tv,
  Mic,
  SlidersHorizontal,
  HelpCircle,
  Maximize2,
  Minimize2,
  X,
  BarChart3,
} from 'lucide-react';

interface PresenterTopBarProps {
  isHidden: boolean;
  currentIndex: number;
  totalSlides: number;
  slideTitle: string;
  secondsElapsed: number;
  setSecondsElapsed: (sec: number) => void;
  targetMinutes: number;
  setTargetMinutes: (min: number) => void;
  isTimerRunning: boolean;
  setIsTimerRunning: (running: boolean) => void;
  formatTimer: (sec: number) => string;
  isAutoPlay: boolean;
  setIsAutoPlay: (auto: boolean) => void;
  autoPlayInterval: number;
  setAutoPlayInterval: (sec: number) => void;
  autoPlayRemaining: number;
  isLaserActive: boolean;
  setIsLaserActive: (active: boolean) => void;
  laserColor: string;
  setLaserColor: (color: string) => void;
  isPenActive: boolean;
  setIsPenActive: (active: boolean) => void;
  penColor: string;
  setPenColor: (color: string) => void;
  undoPenStroke: () => void;
  clearPenCanvas: () => void;
  isSpotlightActive: boolean;
  setIsSpotlightActive: (active: boolean) => void;
  openAudienceWindow: () => void;
  showNotes: boolean;
  setShowNotes: (show: boolean) => void;
  isPodiumMode: boolean;
  setIsPodiumMode: (podium: boolean) => void;
  showAudioRecorder: boolean;
  setShowAudioRecorder: (show: boolean) => void;
  isPollOpen: boolean;
  onTogglePoll: () => void;
  showPresenterOptions: boolean;
  setShowPresenterOptions: (show: boolean) => void;
  optionsMenuRef: React.RefObject<HTMLDivElement | null>;
  transitionEffect: 'fade' | 'slide' | 'slide-vertical' | 'zoom' | 'flip-cube' | 'blur-fade';
  setTransitionEffect: (effect: 'fade' | 'slide' | 'slide-vertical' | 'zoom' | 'flip-cube' | 'blur-fade') => void;
  isSoundMuted: boolean;
  toggleSound: () => void;
  blankMode: 'none' | 'black' | 'white';
  setBlankMode: React.Dispatch<React.SetStateAction<'none' | 'black' | 'white'>>;
  setShowHelpOverlay: (show: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  onClose: () => void;
}

export const PresenterTopBar: React.FC<PresenterTopBarProps> = ({
  isHidden,
  currentIndex,
  totalSlides,
  slideTitle,
  secondsElapsed,
  setSecondsElapsed,
  targetMinutes,
  setTargetMinutes,
  isTimerRunning,
  setIsTimerRunning,
  formatTimer,
  isAutoPlay,
  setIsAutoPlay,
  autoPlayInterval,
  setAutoPlayInterval,
  autoPlayRemaining,
  isLaserActive,
  setIsLaserActive,
  laserColor,
  setLaserColor,
  isPenActive,
  setIsPenActive,
  penColor,
  setPenColor,
  undoPenStroke,
  clearPenCanvas,
  isSpotlightActive,
  setIsSpotlightActive,
  openAudienceWindow,
  showNotes,
  setShowNotes,
  isPodiumMode,
  setIsPodiumMode,
  showAudioRecorder,
  setShowAudioRecorder,
  isPollOpen,
  onTogglePoll,
  showPresenterOptions,
  setShowPresenterOptions,
  optionsMenuRef,
  transitionEffect,
  setTransitionEffect,
  isSoundMuted,
  toggleSound,
  blankMode,
  setBlankMode,
  setShowHelpOverlay,
  isFullscreen,
  toggleFullscreen,
  onClose,
}) => {
  const isTimeOver = targetMinutes > 0 && secondsElapsed >= targetMinutes * 60;
  const isTimeWarning = targetMinutes > 0 && !isTimeOver && secondsElapsed >= targetMinutes * 60 * 0.8;

  return (
    <header
      className={`h-14 border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between bg-slate-900/95 backdrop-blur-xl shrink-0 z-30 transition-opacity duration-300 ${
        isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Left Section: Live Status & Clean Timer */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            {currentIndex + 1} / {totalSlides}
          </span>
        </div>
        <span className="text-xs text-slate-300 font-medium truncate max-w-[120px] sm:max-w-xs md:max-w-md hidden sm:inline">
          {slideTitle}
        </span>

        {/* Minimalist Stopwatch Capsule */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono border transition-all ${
            isTimeOver
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse font-bold'
              : isTimeWarning
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
              : 'bg-slate-950 border-slate-800 text-slate-200'
          }`}
        >
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            title={isTimerRunning ? 'Jeda Timer' : 'Lanjutkan Timer'}
            className="text-slate-400 hover:text-white"
          >
            {isTimerRunning ? (
              <Pause className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </button>
          <span className="font-semibold">{formatTimer(secondsElapsed)}</span>
          {targetMinutes > 0 && (
            <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">/ {targetMinutes}m</span>
          )}
          <button
            onClick={() => setSecondsElapsed(0)}
            title="Reset Stopwatch (00:00)"
            className="text-slate-500 hover:text-slate-300 ml-0.5"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Auto-Play Live Countdown Badge */}
        {isAutoPlay && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono border bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
            title={`Auto-play aktif: berganti setiap ${autoPlayInterval} detik (tersisa ${autoPlayRemaining} detik)`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            <span>Auto ({autoPlayRemaining}s)</span>
          </div>
        )}
      </div>

      {/* Right Section: Essential Presenter Tools & Options Popover */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Laser Pointer Mode */}
        <div className="relative">
          <button
            onClick={() => {
              setIsLaserActive(!isLaserActive);
              if (!isLaserActive) setIsPenActive(false);
            }}
            title="Laser Pointer (Tekan 'L')"
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isLaserActive
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/20'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Laser</span>
          </button>
          {isLaserActive && (
            <div className="absolute top-full mt-1.5 left-0 bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center gap-1.5 z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
              {[
                { color: '#f43f5e', name: 'Merah' },
                { color: '#38bdf8', name: 'Cyan' },
                { color: '#10b981', name: 'Hijau' },
              ].map(c => (
                <button
                  key={c.color}
                  onClick={() => setLaserColor(c.color)}
                  title={`Laser ${c.name}`}
                  className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                    laserColor === c.color
                      ? 'scale-125 border-white ring-1 ring-white/50'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pen / Doodle Annotation Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsPenActive(!isPenActive);
              if (!isPenActive) setIsLaserActive(false);
            }}
            title="Anotasi Pena Coretan (Tekan 'P')"
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              isPenActive
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pena</span>
          </button>
          {isPenActive && (
            <div className="absolute top-full mt-1.5 left-0 bg-slate-900 border border-slate-800 rounded-xl p-1.5 shadow-xl flex items-center gap-1.5 z-40 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
              {[
                { color: '#f43f5e', name: 'Merah' },
                { color: '#38bdf8', name: 'Cyan' },
                { color: '#facc15', name: 'Kuning' },
              ].map(c => (
                <button
                  key={c.color}
                  onClick={() => setPenColor(c.color)}
                  title={`Warna ${c.name}`}
                  className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                    penColor === c.color
                      ? 'scale-125 border-white ring-1 ring-white/50'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.color }}
                />
              ))}
              <div className="h-3 w-[1px] bg-slate-800 mx-0.5" />
              <button
                onClick={undoPenStroke}
                title="Batalkan Coretan Terakhir (U)"
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded transition-colors"
              >
                <Undo2 className="w-3 h-3" />
              </button>
              <button
                onClick={clearPenCanvas}
                title="Hapus Semua Coretan (C)"
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors"
              >
                <Eraser className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Virtual Spotlight Mode */}
        <button
          onClick={() => {
            setIsSpotlightActive(!isSpotlightActive);
            if (!isSpotlightActive) {
              setIsLaserActive(false);
              setIsPenActive(false);
            }
          }}
          title="Sorot Panggung / Virtual Spotlight Focus (Tekan 'S')"
          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            isSpotlightActive
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Spotlight</span>
        </button>

        {/* Live Poll Button */}
        <button
          onClick={onTogglePoll}
          title="Live Interactive Poll & Voting Audiens (Tekan 'V')"
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            isPollOpen
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Live Poll</span>
        </button>

        {/* Audience Window (Dual Screen) */}
        <button
          onClick={openAudienceWindow}
          title="Buka Jendela Layar Audiens untuk Proyektor / Monitor Kedua"
          className="px-2.5 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-800"
        >
          <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">Layar Audiens</span>
        </button>

        {/* Toggle Speaker Notes */}
        <button
          onClick={() => setShowNotes(!showNotes)}
          title="Tampilkan / Sembunyikan Catatan Pembicara (N)"
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            showNotes
              ? 'bg-indigo-600/15 border-indigo-500/40 text-indigo-300'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <span className="hidden sm:inline">{showNotes ? 'Sembunyikan Catatan' : 'Lihat Catatan'}</span>
          <span className="sm:hidden">Notes</span>
        </button>

        {/* Stage Teleprompter / Podium Mode Toggle */}
        <button
          onClick={() => setIsPodiumMode(!isPodiumMode)}
          title="Mode Teleprompter & Podium Panggung (Teks Catatan Besar)"
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            isPodiumMode
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Tv className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Podium</span>
        </button>

        {/* Audio Narration Recording Button */}
        <button
          onClick={() => setShowAudioRecorder(!showAudioRecorder)}
          title="Rekam Narasi Suara Presentasi"
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
            showAudioRecorder
              ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Rekam</span>
        </button>

        {/* Presenter Settings & Secondary Tools Popover */}
        <div ref={optionsMenuRef} className="relative">
          <button
            onClick={() => setShowPresenterOptions(!showPresenterOptions)}
            title="Pengaturan & Opsi Presentasi"
            className={`p-1.5 rounded-xl border transition-colors ${
              showPresenterOptions || isAutoPlay || blankMode !== 'none' || !isSoundMuted
                ? 'bg-slate-800 text-indigo-300 border-slate-700'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {showPresenterOptions && (
            <div className="absolute top-full right-0 mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl space-y-2">
              <div className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-800/80">
                Opsi Slideshow
              </div>

              <div className="space-y-1 px-2">
                <label className="text-[10px] text-slate-400 font-semibold block">Target Batas Waktu</label>
                <select
                  value={targetMinutes}
                  onChange={e => setTargetMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value={0}>Stopwatch Bebas</option>
                  <option value={3}>Target 3m (Elevator Pitch)</option>
                  <option value={5}>Target 5m (Lightning Talk)</option>
                  <option value={10}>Target 10m</option>
                  <option value={15}>Target 15m (Seminar/Sidang)</option>
                  <option value={20}>Target 20m (Keynote)</option>
                </select>
              </div>

              <div className="space-y-1 px-2">
                <label className="text-[10px] text-slate-400 font-semibold block">Efek Transisi Slide</label>
                <select
                  value={transitionEffect}
                  onChange={e => setTransitionEffect(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                >
                  <option value="fade">Fade (Halus & Elegan)</option>
                  <option value="slide">Slide (Geser Horizontal)</option>
                  <option value="slide-vertical">Slide Vertikal (Meluncur Naik)</option>
                  <option value="zoom">Zoom (Memperbesar)</option>
                  <option value="flip-cube">Flip 3D (Putaran Modern)</option>
                  <option value="blur-fade">Blur Focus (Sinematik)</option>
                </select>
              </div>

              <div className="px-2 py-1 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-300">Putar Otomatis</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      isAutoPlay ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isAutoPlay ? 'ON' : 'OFF'}
                  </button>
                  {isAutoPlay && (
                    <select
                      value={autoPlayInterval}
                      onChange={e => setAutoPlayInterval(Number(e.target.value))}
                      className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-200 outline-none font-mono"
                    >
                      <option value={3}>3d</option>
                      <option value={5}>5d</option>
                      <option value={10}>10d</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="px-2 py-1 flex items-center justify-between">
                <span className="text-xs text-slate-300">Efek Suara Geser (M)</span>
                <button
                  onClick={toggleSound}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    !isSoundMuted ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {!isSoundMuted ? 'Aktif' : 'Mati'}
                </button>
              </div>

              <div className="px-2 py-1 border-t border-slate-800/80 pt-2 flex items-center justify-between">
                <span className="text-xs text-slate-300">Layar Kosong Fokus</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBlankMode(prev => (prev === 'black' ? 'none' : 'black'))}
                    title="Layar Hitam (B)"
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      blankMode === 'black' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Hitam (B)
                  </button>
                  <button
                    onClick={() => setBlankMode(prev => (prev === 'white' ? 'none' : 'white'))}
                    title="Layar Putih (W)"
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      blankMode === 'white' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Putih (W)
                  </button>
                </div>
              </div>

              <div className="px-2 pt-1 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setShowHelpOverlay(true);
                    setShowPresenterOptions(false);
                  }}
                  className="w-full py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-2 justify-center transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Panduan Pintasan Tombol (?)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title="Layar Penuh (F)"
          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          title="Keluar Mode Presentasi (Esc)"
          className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
